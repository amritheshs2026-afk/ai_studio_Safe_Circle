import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  Clock,
  Copy,
  KeyRound,
  LogIn,
  LogOut,
  PhoneCall,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  familyService,
  type ActiveInvitation,
  type FamilyConnectionRecord,
  type ShareLevel,
} from '../services/familyService';
import { Banner, Button, Card, RiskBadge } from '../components/ui';

export const FamilyPage: React.FC = () => {
  const {
    prefs,
    t,
    updatePrefs,
    user,
    isOnline,
    elderConnections,
    guardianConnections,
    auditLogs,
    elderSentAlerts,
    setUiMode,
  } = useApp();
  const navigate = useNavigate();

  // Local quick-call contact state
  const [contactName, setContactName] = useState(prefs.familyContactName);
  const [contactPhone, setContactPhone] = useState(prefs.familyContactPhone);
  const [contactSaved, setContactSaved] = useState(false);

  // Elder invite state
  const [activeInvite, setActiveInvite] = useState<ActiveInvitation | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pending approvals config map
  const [pendingShareLevels, setPendingShareLevels] = useState<Record<string, ShareLevel>>({});
  const [pendingConsents, setPendingConsents] = useState<Record<string, boolean>>({});

  // Guardian redeem invite state
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Delete synced data inline confirmation
  const [confirmStopSharing, setConfirmStopSharing] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setContactName(prefs.familyContactName);
    setContactPhone(prefs.familyContactPhone);
  }, [prefs.familyContactName, prefs.familyContactPhone]);

  useEffect(() => {
    if (!activeInvite) {
      setSecondsLeft(0);
      return;
    }
    const updateTimer = () => {
      const ms = new Date(activeInvite.expiresAtIso).getTime() - Date.now();
      if (ms <= 0) {
        setSecondsLeft(0);
        setActiveInvite(null);
      } else {
        setSecondsLeft(Math.ceil(ms / 1000));
      }
    };
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [activeInvite]);

  const handleSaveLocalContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePrefs({
      familyContactName: contactName.trim().slice(0, 60),
      familyContactPhone: contactPhone.trim().slice(0, 20),
    });
    setContactSaved(true);
    window.setTimeout(() => setContactSaved(false), 3000);
  };

  const handleGoogleSignIn = async () => {
    setActionError('');
    try {
      await familyService.signInWithGoogle();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Sign-in failed.');
    }
  };

  const handleCreateInvite = async () => {
    if (!user) return;
    setBusyAction(true);
    setActionError('');
    try {
      const inv = await familyService.createInvitation(
        user.uid,
        prefs.displayName || user.displayName || 'Family Elder',
      );
      setActiveInvite(inv);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not create invite code.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!activeInvite) return;
    try {
      await navigator.clipboard.writeText(activeInvite.rawCode);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Clipboard blocked in some browsers
    }
  };

  const handleApprove = async (conn: FamilyConnectionRecord) => {
    if (!user) return;
    setBusyAction(true);
    setActionError('');
    const shareLevel = pendingShareLevels[conn.id] ?? 'alerts_only';
    const consent = pendingConsents[conn.id] ?? true;
    try {
      await familyService.approveConnection(
        conn,
        shareLevel,
        consent,
        prefs.displayName || user.displayName || 'Family Elder',
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleRejectOrRevoke = async (conn: FamilyConnectionRecord, isReject: boolean) => {
    if (!user) return;
    setBusyAction(true);
    setActionError('');
    try {
      await familyService.revokeOrRejectConnection(
        conn,
        user.uid,
        prefs.displayName || user.displayName || 'Member',
        isReject,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleUpdateSharing = async (
    conn: FamilyConnectionRecord,
    shareLevel: ShareLevel,
    syncConsent: boolean,
  ) => {
    if (!user) return;
    setBusyAction(true);
    setActionError('');
    try {
      await familyService.updateConnectionSharing(
        conn,
        shareLevel,
        syncConsent,
        prefs.displayName || user.displayName || 'Family Elder',
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleStopSharingAndDelete = async () => {
    if (!user) return;
    setBusyAction(true);
    setActionError('');
    try {
      await familyService.deleteAllSyncedElderData(
        user.uid,
        prefs.displayName || user.displayName || 'Family Elder',
      );
      for (const conn of elderConnections.filter((c) => c.status === 'active')) {
        await familyService.updateConnectionSharing(
          conn,
          'none',
          false,
          prefs.displayName || user.displayName || 'Family Elder',
        );
      }
      setConfirmStopSharing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete server data.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusyAction(true);
    setRedeemStatus(null);
    try {
      const res = await familyService.redeemInvitation(
        redeemCode,
        user.uid,
        user.displayName || prefs.displayName || 'Family Guardian',
      );
      setRedeemCode('');
      setRedeemStatus({
        ok: true,
        msg:
          prefs.language === 'ml'
            ? `${res.elderName} എന്നയാൾക്ക് അഭ്യർത്ഥന അയച്ചു. അവർ അംഗീകരിക്കുന്നതുവരെ കാത്തിരിക്കുക.`
            : `Request sent to ${res.elderName}. Ask them to approve it on their phone.`,
      });
    } catch {
      setRedeemStatus({
        ok: false,
        msg:
          prefs.language === 'ml'
            ? 'കോഡ് തെറ്റാണ് അല്ലെങ്കിൽ കാലാവധി കഴിഞ്ഞു.'
            : 'That invite code is invalid, already used, or expired.',
      });
    } finally {
      setBusyAction(false);
    }
  };

  const pendingElderRequests = elderConnections.filter((c) => c.status === 'pending');
  const activeElderLinks = elderConnections.filter((c) => c.status === 'active');
  const pendingGuardianLinks = guardianConnections.filter((c) => c.status === 'pending');
  const activeGuardianLinks = guardianConnections.filter((c) => c.status === 'active');

  const formatMMSS = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Local Quick-Call Contact (always works offline without account) */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
          <h2 className="font-bold text-lg">{t.localContactCardTitle}</h2>
        </div>

        <form onSubmit={(e) => void handleSaveLocalContact(e)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="fam-cname" className="block text-sm font-semibold mb-1">
                {t.familyContactName}
              </label>
              <input
                id="fam-cname"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3.5"
              />
            </div>
            <div>
              <label htmlFor="fam-cphone" className="block text-sm font-semibold mb-1">
                {t.familyContactPhone}
              </label>
              <input
                id="fam-cphone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3.5 font-mono-tabular"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">
              {t.saveContact}
            </Button>
            {contactSaved ? (
              <span className="text-sm font-semibold text-[var(--sc-safe-text)]">
                {t.contactSaved}
              </span>
            ) : null}
          </div>
        </form>
      </Card>

      {/* Account / Cloud Family Sync Section */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg">{t.familyTitle}</h2>
            <p className="text-sm text-[var(--sc-text-muted)]">{t.familyOptionalNote}</p>
          </div>
          {user ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void familyService.signOutUser()}
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </Button>
          ) : null}
        </div>

        {actionError ? <Banner tone="danger">{actionError}</Banner> : null}

        {!familyService.isConfigured() ? (
          <Banner tone="warn">Firebase family sync is not configured in this environment.</Banner>
        ) : !isOnline && !user ? (
          <Banner tone="info">{t.offlineBanner}</Banner>
        ) : !user ? (
          <Button
            type="button"
            size="lg"
            disabled={!isOnline}
            onClick={() => void handleGoogleSignIn()}
          >
            <LogIn className="w-5 h-5" />
            <span>{t.signInGoogle}</span>
          </Button>
        ) : (
          <p className="text-sm font-medium text-[var(--sc-text-muted)]">
            Signed in as <strong className="text-[var(--sc-text)]">{user.displayName || user.email}</strong>
          </p>
        )}
      </Card>

      {user ? (
        <>
          {/* Elder: Create 15-min invite code */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
              <h3 className="font-bold text-lg">{t.createInviteCode}</h3>
            </div>

            <Banner tone="warn">{t.inviteWarning}</Banner>

            <Button
              type="button"
              size="lg"
              disabled={!isOnline || busyAction}
              onClick={() => void handleCreateInvite()}
            >
              <UserPlus className="w-5 h-5" />
              <span>{t.createInviteCode}</span>
            </Button>

            {activeInvite ? (
              <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)] flex flex-col sm:flex-row items-center gap-5">
                <div className="p-3 bg-white rounded-xl shrink-0">
                  <QRCodeSVG value={activeInvite.rawCode} size={136} />
                </div>
                <div className="space-y-2.5 text-center sm:text-left">
                  <p className="font-mono-tabular text-2xl sm:text-3xl font-bold tracking-wider">
                    {activeInvite.rawCode}
                  </p>
                  <p className="text-sm font-semibold flex items-center justify-center sm:justify-start gap-1.5 text-[var(--sc-text-muted)]">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono-tabular">
                      {t.inviteExpiresIn}: {formatMMSS(secondsLeft)}
                    </span>
                  </p>
                  <Button type="button" variant="secondary" onClick={() => void handleCopyInvite()}>
                    <Copy className="w-4 h-4" />
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Elder: Pending Approval Requests */}
          {pendingElderRequests.length > 0 ? (
            <Card className="space-y-4">
              <h3 className="font-bold text-lg">{t.pendingRequestsTitle}</h3>
              <div className="space-y-3">
                {pendingElderRequests.map((conn) => {
                  const selectedLevel = pendingShareLevels[conn.id] ?? 'alerts_only';
                  const consent = pendingConsents[conn.id] ?? true;
                  return (
                    <div
                      key={conn.id}
                      className="p-4 rounded-2xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)] space-y-3"
                    >
                      <p className="font-bold text-base">{conn.guardianName}</p>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold">{t.shareLevelLabel}</label>
                        <select
                          value={selectedLevel}
                          onChange={(e) =>
                            setPendingShareLevels((prev) => ({
                              ...prev,
                              [conn.id]: e.target.value as ShareLevel,
                            }))
                          }
                          className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-surface)] px-3"
                        >
                          <option value="alerts_only">{t.shareAlertsOnly}</option>
                          <option value="alerts_and_summary">{t.shareAlertsSummary}</option>
                          <option value="none">{t.shareNone}</option>
                        </select>
                      </div>

                      <label className="flex items-start gap-3 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) =>
                            setPendingConsents((prev) => ({
                              ...prev,
                              [conn.id]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 mt-0.5 shrink-0"
                        />
                        <span>{t.syncConsentLabel}</span>
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="lg"
                          disabled={busyAction}
                          onClick={() => void handleApprove(conn)}
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.approveBtn}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="lg"
                          disabled={busyAction}
                          onClick={() => void handleRejectOrRevoke(conn, true)}
                        >
                          <X className="w-4 h-4" />
                          <span>{t.rejectBtn}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {/* Elder: Connected Guardians & Controls */}
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-lg">{t.connectedFamilyTitle}</h3>
              {activeElderLinks.length > 0 ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setConfirmStopSharing(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.stopSharingDelete}</span>
                </Button>
              ) : null}
            </div>

            {confirmStopSharing ? (
              <Banner tone="danger" className="space-y-3">
                <p className="font-bold">{t.stopSharingDelete}?</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    disabled={busyAction}
                    onClick={() => void handleStopSharingAndDelete()}
                  >
                    {t.stopSharingDelete}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setConfirmStopSharing(false)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </Banner>
            ) : null}

            {activeElderLinks.length === 0 ? (
              <p className="text-sm text-[var(--sc-text-muted)]">No active family guardians connected.</p>
            ) : (
              <div className="space-y-3">
                {activeElderLinks.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-4 rounded-2xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-base flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[var(--sc-safe-text)]" />
                        <span>{conn.guardianName}</span>
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={busyAction}
                        onClick={() => void handleRejectOrRevoke(conn, false)}
                      >
                        {t.revokeBtn}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <select
                        aria-label={t.shareLevelLabel}
                        value={conn.shareLevel}
                        disabled={busyAction}
                        onChange={(e) =>
                          void handleUpdateSharing(
                            conn,
                            e.target.value as ShareLevel,
                            conn.syncConsent,
                          )
                        }
                        className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-surface)] px-3"
                      >
                        <option value="none">{t.shareNone}</option>
                        <option value="alerts_only">{t.shareAlertsOnly}</option>
                        <option value="alerts_and_summary">{t.shareAlertsSummary}</option>
                      </select>

                      <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={conn.syncConsent}
                          disabled={busyAction}
                          onChange={(e) =>
                            void handleUpdateSharing(conn, conn.shareLevel, e.target.checked)
                          }
                          className="w-5 h-5 shrink-0"
                        />
                        <span>{t.syncConsentLabel}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Guardian: Redeem an elder's invite code */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
              <h3 className="font-bold text-lg">{t.redeemInviteTitle}</h3>
            </div>

            <form onSubmit={(e) => void handleRedeem(e)} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder={t.redeemInvitePlaceholder}
                className="flex-1 min-h-[52px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-4 font-mono-tabular text-base tracking-wider"
              />
              <Button type="submit" size="lg" disabled={!isOnline || !redeemCode.trim() || busyAction}>
                {t.redeemBtn}
              </Button>
            </form>

            {redeemStatus ? (
              <Banner tone={redeemStatus.ok ? 'info' : 'danger'}>{redeemStatus.msg}</Banner>
            ) : null}

            {pendingGuardianLinks.length > 0 ? (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-bold">{t.pendingRequestsTitle}</p>
                {pendingGuardianLinks.map((c) => (
                  <p key={c.id} className="text-sm text-[var(--sc-text-muted)]">
                    Waiting for approval from <strong>{c.elderName}</strong>
                  </p>
                ))}
              </div>
            ) : null}

            {activeGuardianLinks.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[var(--sc-border)]">
                <p className="text-sm font-bold">Elders you protect:</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <ul className="text-sm space-y-1">
                    {activeGuardianLinks.map((c) => (
                      <li key={c.id}>
                        <strong>{c.elderName}</strong> ({c.shareLevel})
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setUiMode('guardian');
                      navigate('/guardian');
                    }}
                  >
                    {t.modeGuardian}
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Transparency: Alerts sent + Audit Log */}
          {elderSentAlerts.length > 0 ? (
            <Card className="space-y-3">
              <h3 className="font-bold text-lg">{t.alertTransparencyTitle}</h3>
              <ul className="divide-y divide-[var(--sc-border)]">
                {elderSentAlerts.slice(0, 10).map((al) => (
                  <li key={al.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <RiskBadge verdict={al.verdict} lang={prefs.language} />
                      <span className="text-sm font-medium">{al.guardianName}</span>
                    </div>
                    <span className="font-mono-tabular text-xs text-[var(--sc-text-muted)]">
                      {new Date(al.createdAt).toLocaleString()} · {al.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {auditLogs.length > 0 ? (
            <Card className="space-y-3">
              <h3 className="font-bold text-lg">{t.auditLogTitle}</h3>
              <ul className="divide-y divide-[var(--sc-border)] text-sm">
                {auditLogs.slice(0, 12).map((log) => (
                  <li key={log.id} className="py-2 flex flex-wrap justify-between gap-2">
                    <span>
                      <strong>{log.action}</strong> · {log.actorName}
                    </span>
                    <span className="font-mono-tabular text-xs text-[var(--sc-text-muted)]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
