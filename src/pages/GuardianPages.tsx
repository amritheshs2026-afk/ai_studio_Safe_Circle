import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BellRing,
  Check,
  Eye,
  PhoneIncoming,
  Printer,
  Shield,
  Users,
} from 'lucide-react';
import { computeExposure, getDefaultRulePack } from '../engine';
import type { GuardianAlert, Incident, Verdict } from '../engine/types';
import { useApp } from '../contexts/AppContext';
import { familyService } from '../services/familyService';
import { Banner, Button, Card, EmptyState, RiskBadge, Toggle } from '../components/ui';

function alertsToPseudoIncidents(alerts: GuardianAlert[]): Incident[] {
  const byIncident = new Map<string, GuardianAlert>();
  for (const al of alerts) {
    if (!byIncident.has(al.incidentId)) {
      byIncident.set(al.incidentId, al);
    }
  }
  return Array.from(byIncident.values()).map((al) => ({
    id: al.incidentId,
    scannedAt: al.scannedAt || al.createdAt,
    score: al.score,
    verdict: al.verdict,
    category: al.category,
    signalIds: al.signalIds,
    detectionMethod: 'LOCAL_RULES',
    rulePackVersion: 'synced',
    reviewed: al.status === 'reviewed',
    falsePositive: al.falsePositive,
    userOutcome: al.userOutcome,
  }));
}

export const GuardianDashboardPage: React.FC = () => {
  const { prefs, t, guardianConnections, guardianAlerts } = useApp();
  const navigate = useNavigate();

  const activeElders = useMemo(
    () => guardianConnections.filter((c) => c.status === 'active'),
    [guardianConnections],
  );
  const [selectedElderId, setSelectedElderId] = useState<string>('all');

  if (activeElders.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-7 h-7" />}
        title={t.guardianNoElders}
        action={
          <Button size="lg" onClick={() => navigate('/family')}>
            {t.navFamily}
          </Button>
        }
      />
    );
  }

  const visibleAlerts =
    selectedElderId === 'all'
      ? guardianAlerts
      : guardianAlerts.filter((a) => a.elderId === selectedElderId);

  const unseenCount = visibleAlerts.filter(
    (a) => a.status === 'delivered' || a.status === 'pending',
  ).length;

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[var(--sc-primary)] shrink-0" />
            <h2 className="text-xl font-bold">{t.guardianDashTitle}</h2>
          </div>

          <select
            aria-label="Filter elder"
            value={selectedElderId}
            onChange={(e) => setSelectedElderId(e.target.value)}
            className="min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3.5 font-semibold"
          >
            <option value="all">{t.filterAll}</option>
            {activeElders.map((c) => (
              <option key={c.id} value={c.elderId}>
                {c.elderName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs font-semibold text-[var(--sc-text-muted)]">Protected Elders</p>
            <p className="text-2xl font-bold font-mono-tabular mt-1">{activeElders.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs font-semibold text-[var(--sc-text-muted)]">Unseen Alerts</p>
            <p className="text-2xl font-bold font-mono-tabular mt-1">{unseenCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs font-semibold text-[var(--sc-text-muted)]">Total Alerts</p>
            <p className="text-2xl font-bold font-mono-tabular mt-1">{visibleAlerts.length}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeElders
          .filter((e) => selectedElderId === 'all' || e.elderId === selectedElderId)
          .map((conn) => {
            const elderAlerts = guardianAlerts.filter((a) => a.elderId === conn.elderId);
            const exp = computeExposure(alertsToPseudoIncidents(elderAlerts), new Date());
            const latest = elderAlerts[0];

            return (
              <Card key={conn.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-lg">{conn.elderName}</h3>
                  <span className="text-xs font-semibold text-[var(--sc-text-muted)]">
                    {conn.shareLevel}
                  </span>
                </div>

                <p className="text-sm text-[var(--sc-text-muted)]">
                  {conn.syncConsent
                    ? `${exp.dangerousCount30d} DANGEROUS · ${exp.carefulCount30d} BE CAREFUL (30d)`
                    : 'Sync consent paused by elder.'}
                </p>

                {latest ? (
                  <div className="p-3 rounded-xl bg-[var(--sc-surface-muted)] flex items-center justify-between gap-2">
                    <RiskBadge verdict={latest.verdict} lang={prefs.language} />
                    <span className="font-mono-tabular text-xs text-[var(--sc-text-muted)]">
                      {new Date(latest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--sc-text-muted)]">{t.noRecentAlerts}</p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/guardian/alerts')}
                  >
                    <BellRing className="w-4 h-4" />
                    <span>{t.navGuardianAlerts}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/guardian/analytics')}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{t.navGuardianAnalytics}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export const GuardianAlertsPage: React.FC = () => {
  const { prefs, t, guardianAlerts } = useApp();
  const navigate = useNavigate();
  const pack = getDefaultRulePack();

  const [verdictFilter, setVerdictFilter] = useState<'ALL' | Verdict>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | GuardianAlert['status']>('ALL');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      guardianAlerts.filter((al) => {
        if (verdictFilter !== 'ALL' && al.verdict !== verdictFilter) return false;
        if (statusFilter !== 'ALL' && al.status !== statusFilter) return false;
        return true;
      }),
    [guardianAlerts, verdictFilter, statusFilter],
  );

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <h2 className="font-bold text-lg">{t.guardianAlertsTitle}</h2>
        <Banner tone="info">
          Privacy notice: SafeCircle never shares raw SMS or WhatsApp text with guardians — only risk verdicts and tactic categories.
        </Banner>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'DANGEROUS', 'BE_CAREFUL'] as const).map((v) => (
            <Button
              key={v}
              type="button"
              variant={verdictFilter === v ? 'primary' : 'secondary'}
              onClick={() => setVerdictFilter(v)}
            >
              {v === 'ALL' ? t.filterAll : v === 'DANGEROUS' ? t.verdictDangerous : t.verdictCareful}
            </Button>
          ))}
          {(['ALL', 'delivered', 'seen', 'reviewed'] as const).map((st) => (
            <Button
              key={st}
              type="button"
              variant={statusFilter === st ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? t.filterAll : st}
            </Button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<BellRing className="w-7 h-7" />} title={t.noRecentAlerts} />
      ) : (
        <div className="space-y-3">
          {filtered.map((al) => {
            const expanded = selectedAlertId === al.id;
            return (
              <Card key={al.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <RiskBadge verdict={al.verdict} lang={prefs.language} />
                    <span className="font-bold text-base">{al.elderName}</span>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-[var(--sc-text-muted)]">
                    {new Date(al.createdAt).toLocaleString()} · {al.score}/100 · {al.status}
                  </span>
                </div>

                {expanded ? (
                  <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)] space-y-2.5">
                    {al.category === 'sos_emergency' ? (
                      <p className="text-sm font-bold text-[var(--sc-danger-text)]">
                        {prefs.language === 'ml'
                          ? 'അടിയന്തര SOS സഹായ ബട്ടൺ അമർത്തി — ദയവായി ഉടൻ വിളിക്കുക.'
                          : 'Urgent SOS help alert triggered by family member — please call them right away.'}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-bold">{t.whatINoticed}:</p>
                        <ul className="space-y-1 text-sm list-disc pl-5">
                          {al.signalIds.map((sig) => (
                            <li key={sig}>{pack.templates[sig]?.[prefs.language] ?? sig}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="text-xs text-[var(--sc-text-muted)]">
                      Category: {al.category} · Outcome: {al.userOutcome ?? 'not reported'}
                      {al.falsePositive ? ' · Marked false alarm' : ''}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedAlertId(expanded ? null : al.id)}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{expanded ? 'Hide details' : 'View details'}</span>
                  </Button>

                  {al.status === 'delivered' || al.status === 'pending' ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void familyService.updateAlertStatus(al.elderId, al.id, 'seen')}
                    >
                      {t.markAsSeen}
                    </Button>
                  ) : null}

                  {al.status !== 'reviewed' ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() =>
                        void familyService.updateAlertStatus(al.elderId, al.id, 'reviewed')
                      }
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.markAsReviewed}</span>
                    </Button>
                  ) : null}

                  <Button type="button" variant="danger" onClick={() => navigate('/emergency')}>
                    <PhoneIncoming className="w-4 h-4" />
                    <span>1930</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const GuardianAnalyticsPage: React.FC = () => {
  const { prefs, t, user, guardianConnections, guardianAlerts } = useApp();
  const pack = getDefaultRulePack();

  const activeElders = guardianConnections.filter((c) => c.status === 'active');
  const [selectedElderId, setSelectedElderId] = useState<string>(
    activeElders[0]?.elderId ?? '',
  );
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [notifyCareful, setNotifyCareful] = useState(true);
  const [bypassQuiet, setBypassQuiet] = useState(true);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const elderAlerts = useMemo(
    () =>
      selectedElderId
        ? guardianAlerts.filter((a) => a.elderId === selectedElderId)
        : guardianAlerts,
    [guardianAlerts, selectedElderId],
  );

  const pseudoIncidents = useMemo(() => alertsToPseudoIncidents(elderAlerts), [elderAlerts]);
  const exposure = useMemo(() => computeExposure(pseudoIncidents, new Date()), [pseudoIncidents]);

  const signalCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inc of pseudoIncidents) {
      for (const sig of inc.signalIds) {
        if (sig === 'LEGIT_CONTEXT') continue;
        counts.set(sig, (counts.get(sig) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [pseudoIncidents]);

  const handleSavePrefs = async () => {
    if (!user || !selectedElderId) return;
    await familyService.saveNotificationPreferences({
      guardianId: user.uid,
      elderId: selectedElderId,
      inApp: true,
      email: false,
      push: false,
      notifyOnBeCareful: notifyCareful,
      includeElderName: true,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
      dangerousBypassesQuietHours: bypassQuiet,
      escalationMinutes: 15,
    });
    setPrefsSaved(true);
    window.setTimeout(() => setPrefsSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-lg">{t.guardianAnalyticsTitle}</h2>
          <div className="flex flex-wrap gap-2 no-print">
            {activeElders.length > 0 ? (
              <select
                aria-label="Select elder"
                value={selectedElderId}
                onChange={(e) => setSelectedElderId(e.target.value)}
                className="min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3"
              >
                {activeElders.map((c) => (
                  <option key={c.id} value={c.elderId}>
                    {c.elderName}
                  </option>
                ))}
              </select>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              <span>{t.printReport}</span>
            </Button>
          </div>
        </div>

        <Banner tone="info">{t.exposureNonBlameNote}</Banner>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs font-semibold text-[var(--sc-text-muted)]">
              {t.exposureCardTitle}
            </p>
            <p className="text-xl font-bold mt-1">{exposure.exposureLevel}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs font-semibold text-[var(--sc-text-muted)]">
              {t.effectivenessCardTitle}
            </p>
            <p className="text-xl font-bold font-mono-tabular mt-1">
              {exposure.protectionEffectivenessPct !== null
                ? `${exposure.protectionEffectivenessPct}%`
                : '—'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--sc-surface-muted)]">
            <p className="text-xs font-semibold text-[var(--sc-text-muted)]">
              {t.trendCardTitle}
            </p>
            <p className="text-xl font-bold mt-1">{exposure.riskTrend}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold text-base">Top Detected Scam Tactics</h3>
        {signalCounts.length === 0 ? (
          <p className="text-sm text-[var(--sc-text-muted)]">{t.noRecentAlerts}</p>
        ) : (
          <ul className="space-y-2.5">
            {signalCounts.map(([sig, count]) => (
              <li
                key={sig}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--sc-surface-muted)]"
              >
                <span className="text-sm font-medium">
                  {pack.templates[sig]?.[prefs.language] ?? sig}
                </span>
                <span className="font-mono-tabular font-bold text-sm">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selectedElderId ? (
        <Card className="space-y-4 no-print">
          <h3 className="font-bold text-lg">{t.guardianSettingsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Quiet Hours Start</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3 font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Quiet Hours End</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-3 font-mono-tabular"
              />
            </div>
          </div>
          <Toggle
            checked={notifyCareful}
            onChange={setNotifyCareful}
            label="Include BE CAREFUL alerts (when permitted by elder)"
          />
          <Toggle
            checked={bypassQuiet}
            onChange={setBypassQuiet}
            label="Allow DANGEROUS alerts to bypass quiet hours"
          />
          <div className="flex items-center gap-3">
            <Button type="button" size="lg" onClick={() => void handleSavePrefs()}>
              Save Preferences
            </Button>
            {prefsSaved ? (
              <span className="text-sm font-semibold text-[var(--sc-safe-text)]">Saved</span>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
};
