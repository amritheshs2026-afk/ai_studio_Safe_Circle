import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  PhoneCall,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { familyService } from '../services/familyService';
import type { EmergencyContact } from '../services/incidentStore';
import {
  buildSmsHref,
  buildSosMessageText,
  cleanPhoneDigits,
  getPresetEmergencyContacts,
  triggerSmsComposer,
} from '../services/sosService';
import { Banner, Button, Card } from '../components/ui';

interface SosDispatchState {
  sentAt: string;
  guardiansNotified: number;
  smsPrepared: boolean;
  contactsCount: number;
}

export const EmergencyPage: React.FC = () => {
  const { prefs, t, updatePrefs, user, isOnline, elderConnections } = useApp();
  const [searchParams] = useSearchParams();
  const sosTriggered = searchParams.get('sos') === '1';

  const [confirmExternal, setConfirmExternal] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [sosResult, setSosResult] = useState<SosDispatchState | null>(null);
  const [sosError, setSosError] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  const presetContacts = useMemo(() => getPresetEmergencyContacts(prefs), [prefs]);
  const activeConsentedGuardians = useMemo(
    () =>
      elderConnections.filter(
        (c) => c.status === 'active' && c.syncConsent && c.shareLevel !== 'none',
      ),
    [elderConnections],
  );

  const [showAddForm, setShowAddForm] = useState(presetContacts.length === 0);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [formError, setFormError] = useState('');

  const sosMessage = useMemo(
    () =>
      buildSosMessageText({
        senderName: prefs.displayName || user?.displayName || '',
        lang: prefs.language,
      }),
    [prefs.displayName, prefs.language, user?.displayName],
  );

  const handleConfirmExternal = () => {
    setConfirmExternal(false);
    const link = document.createElement('a');
    link.href = 'https://cybercrime.gov.in/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleNotifyAllContacts = async () => {
    setSosError('');
    setNotifying(true);
    try {
      let guardiansNotified = 0;
      if (user && isOnline && activeConsentedGuardians.length > 0) {
        try {
          guardiansNotified = await familyService.sendSosGuardianAlert(
            user.uid,
            prefs.displayName || user.displayName || 'Family Elder',
            activeConsentedGuardians,
          );
        } catch {
          setSosError(
            prefs.language === 'ml'
              ? 'കുടുംബ ഗാർഡിയൻ ആപ്പ് അറിയിപ്പ് അയക്കാൻ സാധിച്ചില്ല. താഴെയുള്ള ഫോൺ/SMS ഓപ്ഷനുകൾ ഉപയോഗിക്കുക.'
              : 'Could not reach online guardian alerts. Please use the SMS or Call options below.',
          );
        }
      }

      const phones = presetContacts.map((c) => c.phone);
      const smsPrepared = phones.length > 0 ? triggerSmsComposer(phones, sosMessage) : false;

      setSosResult({
        sentAt: new Date().toLocaleTimeString(),
        guardiansNotified,
        smsPrepared,
        contactsCount: presetContacts.length,
      });
    } finally {
      setNotifying(false);
    }
  };

  const handleCopySosMessage = async () => {
    try {
      await navigator.clipboard.writeText(sosMessage);
      setCopiedMsg(true);
      window.setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      // Clipboard blocked in restricted browser contexts
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = newName.trim().slice(0, 60);
    const cleanPhone = newPhone.trim().slice(0, 20);
    const cleanRelation = newRelation.trim().slice(0, 40);

    if (!cleanName || cleanPhoneDigits(cleanPhone).length < 3) {
      setFormError(
        prefs.language === 'ml'
          ? 'ദയവായി പേരും സാധുവായ ഫോൺ നമ്പറും നൽകുക.'
          : 'Please enter a contact name and valid phone number.',
      );
      return;
    }

    if (!prefs.familyContactPhone.trim()) {
      await updatePrefs({
        familyContactName: cleanName,
        familyContactPhone: cleanPhone,
      });
    } else {
      const nextContact: EmergencyContact = {
        id: `ec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: cleanName,
        phone: cleanPhone,
        ...(cleanRelation ? { relation: cleanRelation } : {}),
      };
      await updatePrefs({
        emergencyContacts: [...(prefs.emergencyContacts ?? []), nextContact],
      });
    }

    setNewName('');
    setNewPhone('');
    setNewRelation('');
    setShowAddForm(false);
  };

  const handleRemoveContact = async (contactId: string) => {
    if (contactId === 'primary_family') {
      const remaining = [...(prefs.emergencyContacts ?? [])];
      const nextPrimary = remaining.shift();
      await updatePrefs({
        familyContactName: nextPrimary?.name ?? '',
        familyContactPhone: nextPrimary?.phone ?? '',
        emergencyContacts: remaining,
      });
      return;
    }

    await updatePrefs({
      emergencyContacts: (prefs.emergencyContacts ?? []).filter((c) => c.id !== contactId),
    });
  };

  const hasAnyNotifyTarget = presetContacts.length > 0 || activeConsentedGuardians.length > 0;

  return (
    <div className="space-y-5">
      {sosTriggered ? <Banner tone="danger">{t.sosTriggeredBanner}</Banner> : null}

      {/* One-Tap Pre-Set Emergency Contacts Notification Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Users className="w-7 h-7 text-[var(--sc-danger-text)] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold">{t.sosNotifySectionTitle}</h2>
              <p className="text-sm text-[var(--sc-text-muted)] mt-0.5 leading-relaxed">
                {t.sosNotifySectionDesc}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            <Plus className="w-4 h-4" />
            <span>{t.sosAddContactBtn}</span>
          </Button>
        </div>

        {hasAnyNotifyTarget ? (
          <div className="space-y-3">
            <Button
              type="button"
              variant="danger"
              size="xl"
              className="w-full"
              disabled={notifying}
              onClick={() => void handleNotifyAllContacts()}
            >
              <Send className="w-6 h-6 shrink-0" />
              <span>{notifying ? t.sosNotifyingBtn : t.sosNotifyAllBtn}</span>
            </Button>

            {activeConsentedGuardians.length > 0 ? (
              <p className="text-xs font-semibold text-[var(--sc-text-muted)] text-center">
                {prefs.language === 'ml'
                  ? `ബന്ധിപ്പിച്ച ${activeConsentedGuardians.length} കുടുംബ ഗാർഡിയൻമാർക്കും ആപ്പ് വഴി അറിയിപ്പ് ലഭിക്കും`
                  : `Also alerts ${activeConsentedGuardians.length} connected Family Guardian(s) in-app`}
              </p>
            ) : null}
          </div>
        ) : (
          <Banner tone="info">{t.sosNoContactsHint}</Banner>
        )}

        {sosError ? <Banner tone="warn">{sosError}</Banner> : null}

        {sosResult ? (
          <div role="status" aria-live="polite" className="space-y-3">
            <Banner tone="info">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-5 h-5 text-[var(--sc-safe-text)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-bold">
                    {t.sosAlertSentTitle} ·{' '}
                    <span className="font-mono-tabular">{sosResult.sentAt}</span>
                  </p>
                  {sosResult.guardiansNotified > 0 ? (
                    <p className="text-sm">
                      {sosResult.guardiansNotified} {t.sosGuardiansNotifiedCount}
                    </p>
                  ) : null}
                  {sosResult.smsPrepared ? <p className="text-sm">{t.sosSmsOpenedNote}</p> : null}
                </div>
              </div>
            </Banner>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => void handleCopySosMessage()}
            >
              <Copy className="w-4 h-4" />
              <span>{copiedMsg ? t.sosCopiedMessage : t.sosCopyMessage}</span>
            </Button>
          </div>
        ) : null}

        {presetContacts.length > 0 ? (
          <ul className="divide-y divide-[var(--sc-border)]">
            {presetContacts.map((contact) => {
              const smsHref = buildSmsHref([contact.phone], sosMessage);
              const telHref = `tel:${cleanPhoneDigits(contact.phone)}`;
              return (
                <li
                  key={contact.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-base truncate">
                      {contact.name}
                      {contact.relation ? (
                        <span className="text-xs font-normal text-[var(--sc-text-muted)]">
                          {' '}
                          · {contact.relation}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm font-mono-tabular text-[var(--sc-text-muted)]">
                      {contact.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {smsHref ? (
                      <a
                        href={smsHref}
                        className="min-h-[48px] px-4 py-2 rounded-2xl bg-[var(--sc-primary)] text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-[var(--sc-primary-hover)] whitespace-nowrap shrink-0"
                      >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>{t.sosSingleTapSms}</span>
                      </a>
                    ) : null}

                    <a
                      href={telHref}
                      className="min-h-[48px] px-4 py-2 rounded-2xl bg-[var(--sc-surface-muted)] text-[var(--sc-text)] border border-[var(--sc-border)] font-semibold text-sm inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <PhoneCall className="w-4 h-4 text-[var(--sc-primary)] shrink-0" />
                      <span>{t.sosCallContact}</span>
                    </a>

                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      aria-label={`Remove ${contact.name}`}
                      onClick={() => void handleRemoveContact(contact.id)}
                    >
                      <Trash2 className="w-4 h-4 text-[var(--sc-danger-text)]" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {showAddForm ? (
          <form
            onSubmit={(e) => void handleAddContact(e)}
            className="p-4 rounded-2xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)] space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="sos-cname" className="block text-sm font-semibold mb-1">
                  {t.familyContactName}
                </label>
                <input
                  id="sos-cname"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3.5"
                />
              </div>

              <div>
                <label htmlFor="sos-cphone" className="block text-sm font-semibold mb-1">
                  {t.familyContactPhone}
                </label>
                <input
                  id="sos-cphone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3.5 font-mono-tabular"
                />
              </div>

              <div>
                <label htmlFor="sos-crel" className="block text-sm font-semibold mb-1">
                  {t.sosRelationLabel}
                </label>
                <input
                  id="sos-crel"
                  type="text"
                  value={newRelation}
                  placeholder={t.sosRelationPlaceholder}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3.5"
                />
              </div>
            </div>

            {formError ? (
              <p role="alert" className="text-sm font-semibold text-[var(--sc-danger-text)]">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="lg">
                {t.saveContact}
              </Button>
              {presetContacts.length > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowAddForm(false)}
                >
                  {t.cancel}
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}
      </Card>

      {/* Official Helplines & Cybercrime Reporting */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-[var(--sc-danger-text)] shrink-0" />
          <h2 className="text-xl font-bold">{t.emergencyTitle}</h2>
        </div>

        <Banner tone="warn">{t.recoveryDisclaimer}</Banner>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:1930"
            className="min-h-[60px] px-5 py-3.5 rounded-2xl bg-[#B42318] text-white font-bold text-base flex items-center justify-center gap-3 hover:bg-[#911B12]"
          >
            <PhoneCall className="w-6 h-6 shrink-0" />
            <span>{t.helpline1930}</span>
          </a>

          <a
            href="tel:112"
            className="min-h-[60px] px-5 py-3.5 rounded-2xl bg-[var(--sc-surface-muted)] text-[var(--sc-text)] border border-[var(--sc-border)] font-bold text-base flex items-center justify-center gap-3"
          >
            <PhoneCall className="w-6 h-6 shrink-0 text-[var(--sc-primary)]" />
            <span>{t.helpline112}</span>
          </a>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setConfirmExternal(true)}
        >
          <ExternalLink className="w-5 h-5" />
          <span>{t.cybercrimeSite}</span>
        </Button>

        {confirmExternal ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ext-dialog-title"
            className="p-4 rounded-2xl border border-[var(--sc-border)] bg-[var(--sc-surface-muted)] space-y-3"
          >
            <h3 id="ext-dialog-title" className="font-bold text-base">
              {t.confirmExternalTitle}
            </h3>
            <p className="text-sm text-[var(--sc-text-muted)] leading-relaxed">
              {t.confirmExternalBody}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="lg" onClick={handleConfirmExternal}>
                <ExternalLink className="w-4 h-4" />
                <span>{t.openSite}</span>
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => setConfirmExternal(false)}>
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 space-y-3">
        <h3 className="font-bold text-lg">{t.afterScamStepsTitle}</h3>
        <ol className="space-y-2.5">
          {t.afterScamSteps.map((step) => (
            <li
              key={step}
              className="p-3 rounded-xl bg-[var(--sc-surface-muted)] text-base font-medium leading-relaxed"
            >
              {step}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
};
