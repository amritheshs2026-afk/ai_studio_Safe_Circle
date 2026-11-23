import React, { useState } from 'react';
import { Download, HelpCircle, Lock, ShieldCheck, Sliders, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CAPABILITY_MATRIX } from '../platform/capabilities';
import { familyService } from '../services/familyService';
import {
  DEFAULT_PROFILE_PREFS,
  incidentStore,
  type AccentChoice,
  type FontScaleStep,
  type ThemeMode,
} from '../services/incidentStore';
import { hashPin, isValidPinFormat } from '../services/pinService';
import { scanService } from '../services/scanService';
import { Banner, Button, Card, Toggle } from '../components/ui';

export const PrivacyDashboardPage: React.FC = () => {
  const {
    prefs,
    t,
    updatePrefs,
    incidents,
    refreshIncidents,
    persistStatus,
    elderConnections,
  } = useApp();
  const [confirmWipe, setConfirmWipe] = useState(false);

  const activeGuardians = elderConnections.filter((c) => c.status === 'active');

  const handleExport = async () => {
    const json = await incidentStore.exportIncidentsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `safecircle-privacy-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleWipeAllLocal = async () => {
    await incidentStore.resetAllLocalData();
    await updatePrefs({ ...DEFAULT_PROFILE_PREFS, onboardingCompleted: true });
    await refreshIncidents();
    setConfirmWipe(false);
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Lock className="w-6 h-6 text-[var(--sc-primary)] shrink-0" />
          <h2 className="font-bold text-lg">{t.storedLocallyTitle}</h2>
        </div>
        <p className="text-sm sm:text-base text-[var(--sc-text-muted)] leading-relaxed">
          {t.storedLocallyDesc}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs text-[var(--sc-text-muted)]">{t.persistentStorageLabel}</p>
            <p className="font-bold text-sm mt-0.5 uppercase">{persistStatus}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs text-[var(--sc-text-muted)]">Local Records</p>
            <p className="font-bold font-mono-tabular text-sm mt-0.5">{incidents.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs text-[var(--sc-text-muted)]">Active Family Guardians</p>
            <p className="font-bold font-mono-tabular text-sm mt-0.5">{activeGuardians.length}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold text-lg">{t.cloudOptInTitle}</h3>
        <p className="text-sm text-[var(--sc-text-muted)] leading-relaxed">{t.cloudOptInDesc}</p>
        <Toggle
          checked={prefs.localAiEnabled}
          onChange={(checked) => void updatePrefs({ localAiEnabled: checked })}
          label={t.enableCloudExplain}
          description={t.cloudConsentNotice}
        />
      </Card>

      <Card className="space-y-3 overflow-x-auto">
        <h3 className="font-bold text-lg">{t.capabilityMatrixTitle}</h3>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--sc-border)]">
              <th className="py-2 pr-3 font-bold">Feature</th>
              <th className="py-2 px-3 font-bold">Web PWA</th>
              <th className="py-2 pl-3 font-bold">Android App</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--sc-border)]">
            {CAPABILITY_MATRIX.map((row) => (
              <tr key={row.featureEn}>
                <td className="py-2.5 pr-3 font-medium">
                  {prefs.language === 'ml' ? row.featureMl : row.featureEn}
                </td>
                <td className="py-2.5 px-3 text-[var(--sc-text-muted)]">
                  {prefs.language === 'ml' ? row.pwaStatusMl : row.pwaStatusEn}
                </td>
                <td className="py-2.5 pl-3 text-[var(--sc-text-muted)]">
                  {prefs.language === 'ml' ? row.androidStatusMl : row.androidStatusEn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={() => void handleExport()}>
            <Download className="w-4 h-4" />
            <span>{t.exportJson}</span>
          </Button>
          <Button type="button" variant="danger" size="lg" onClick={() => setConfirmWipe(true)}>
            <Trash2 className="w-4 h-4" />
            <span>{t.deleteAll}</span>
          </Button>
        </div>

        {confirmWipe ? (
          <Banner tone="danger" className="space-y-3">
            <p className="font-bold">{t.confirmDeleteAll}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="danger" onClick={() => void handleWipeAllLocal()}>
                {t.deleteAll}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setConfirmWipe(false)}>
                {t.cancel}
              </Button>
            </div>
          </Banner>
        ) : null}
      </Card>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { prefs, t, updatePrefs, user, isOnline } = useApp();

  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const [helpTopic, setHelpTopic] = useState<
    | 'suspicious_call'
    | 'suspicious_message'
    | 'account_setup'
    | 'family_linking'
    | 'scam_recovery_guidance'
    | 'accessibility_help'
  >('suspicious_message');
  const [helpNote, setHelpNote] = useState('');
  const [helpSent, setHelpSent] = useState(false);

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPinFormat(newPin)) {
      setPinMsg(t.pinEnterLabel);
      return;
    }
    const { hash, salt } = await hashPin(newPin);
    await updatePrefs({ pinHash: hash, pinSalt: salt });
    setNewPin('');
    setPinMsg('PIN saved on this device.');
  };

  const handleRemovePin = async () => {
    await updatePrefs({ pinHash: null, pinSalt: null });
    setPinMsg('PIN lock removed.');
  };

  const handleSubmitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !helpNote.trim()) return;
    await familyService.submitHelpRequest({
      userId: user.uid,
      topic: helpTopic,
      language: prefs.language,
      contactMethod: 'in_app',
      note: helpNote,
    });
    setHelpNote('');
    setHelpSent(true);
    window.setTimeout(() => setHelpSent(false), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Appearance & Accessibility */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
          <h2 className="font-bold text-lg">{t.settingsTitle}</h2>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t.setupStepLanguage}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={prefs.language === 'en' ? 'primary' : 'secondary'}
              onClick={() => void updatePrefs({ language: 'en' })}
            >
              English
            </Button>
            <Button
              type="button"
              variant={prefs.language === 'ml' ? 'primary' : 'secondary'}
              onClick={() => void updatePrefs({ language: 'ml' })}
            >
              മലയാളം
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t.themeLabel}</p>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'light', label: t.themeLight },
              { id: 'dark', label: t.themeDark },
              { id: 'high-contrast', label: t.themeHighContrast },
            ] as { id: ThemeMode; label: string }[]).map((th) => (
              <Button
                key={th.id}
                type="button"
                variant={prefs.theme === th.id ? 'primary' : 'secondary'}
                onClick={() => void updatePrefs({ theme: th.id })}
              >
                {th.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t.fontScaleLabel}</p>
          <div className="flex flex-wrap gap-2">
            {([1, 1.25, 1.5, 2] as FontScaleStep[]).map((sc) => (
              <Button
                key={sc}
                type="button"
                variant={prefs.fontScale === sc ? 'primary' : 'secondary'}
                onClick={() => void updatePrefs({ fontScale: sc })}
              >
                {Math.round(sc * 100)}%
              </Button>
            ))}
          </div>
        </div>

        {prefs.theme === 'light' ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t.accentLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['blue', 'teal', 'indigo', 'emerald'] as AccentChoice[]).map((acc) => (
                <Button
                  key={acc}
                  type="button"
                  variant={prefs.accent === acc ? 'primary' : 'secondary'}
                  onClick={() => void updatePrefs({ accent: acc })}
                >
                  {acc}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <Toggle
          checked={prefs.reducedMotion}
          onChange={(v) => void updatePrefs({ reducedMotion: v })}
          label={t.reducedMotionLabel}
        />

        <Toggle
          checked={prefs.demoMode}
          onChange={(v) => void updatePrefs({ demoMode: v })}
          label={t.demoModeLabel}
        />
      </Card>

      {/* PIN Lock */}
      <Card className="space-y-4">
        <h3 className="font-bold text-lg">{t.setupStepPin}</h3>
        <p className="text-sm text-[var(--sc-text-muted)]">{t.pinOptionalHint}</p>

        <form onSubmit={(e) => void handleSetPin(e)} className="flex flex-wrap gap-3">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            aria-label={t.pinEnterLabel}
            className="w-40 min-h-[48px] text-center tracking-[0.35em] font-mono-tabular rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3"
          />
          <Button type="submit" size="lg">
            {t.pinSetBtn}
          </Button>
          {prefs.pinHash ? (
            <Button type="button" variant="secondary" size="lg" onClick={() => void handleRemovePin()}>
              {t.pinRemoveBtn}
            </Button>
          ) : null}
        </form>
        {pinMsg ? <p className="text-sm font-semibold text-[var(--sc-safe-text)]">{pinMsg}</p> : null}
      </Card>

      {/* Rule Pack & Plans Info */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--sc-primary)]" />
          <h3 className="font-bold text-lg">{t.plansInfoTitle}</h3>
        </div>
        <p className="text-xs font-mono-tabular text-[var(--sc-text-muted)]">
          Bundled Rule Pack Version: {scanService.getRulePackVersion()}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-4 rounded-xl bg-[var(--sc-surface-muted)] space-y-1">
            <p className="font-bold">Personal Local (Free)</p>
            <p className="text-[var(--sc-text-muted)]">
              Offline scam detection, history, lessons, simulations, 1930 emergency help.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--sc-surface-muted)] space-y-1">
            <p className="font-bold">Family Guardian Sync (Free Beta)</p>
            <p className="text-[var(--sc-text-muted)]">
              Real-time alerts without message text. Paid upgrades are not enabled yet.
            </p>
          </div>
        </div>
      </Card>

      {/* Guidance / Help Request */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[var(--sc-primary)]" />
          <h3 className="font-bold text-lg">{t.helpRequestTitle}</h3>
        </div>
        {!user ? (
          <p className="text-sm text-[var(--sc-text-muted)]">
            Sign in optionally on the Family page to send a guidance request, or call 1930 for urgent fraud support.
          </p>
        ) : (
          <form onSubmit={(e) => void handleSubmitHelp(e)} className="space-y-3">
            <select
              value={helpTopic}
              onChange={(e) => setHelpTopic(e.target.value as typeof helpTopic)}
              className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3"
            >
              <option value="suspicious_message">Suspicious message</option>
              <option value="suspicious_call">Suspicious call</option>
              <option value="family_linking">Family linking</option>
              <option value="scam_recovery_guidance">Scam recovery guidance</option>
              <option value="accessibility_help">Accessibility help</option>
              <option value="account_setup">Account setup</option>
            </select>
            <textarea
              rows={3}
              maxLength={200}
              value={helpNote}
              onChange={(e) => setHelpNote(e.target.value)}
              placeholder="Short note (max 200 chars; do not paste OTPs or personal secrets)"
              className="w-full rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] p-3 text-sm"
            />
            <Button type="submit" size="lg" disabled={!isOnline || !helpNote.trim()}>
              Submit Request
            </Button>
            {helpSent ? <Banner tone="info">Guidance request saved.</Banner> : null}
          </form>
        )}
      </Card>
    </div>
  );
};
