import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Download, Flag, History, Trash2 } from 'lucide-react';
import type { Verdict } from '../engine/types';
import { useApp } from '../contexts/AppContext';
import { familyService } from '../services/familyService';
import { incidentStore } from '../services/incidentStore';
import { Banner, Button, Card, EmptyState, RiskBadge } from '../components/ui';

export const HistoryPage: React.FC = () => {
  const { prefs, t, incidents, refreshIncidents, user, isOnline, elderConnections } = useApp();
  const navigate = useNavigate();

  const [verdictFilter, setVerdictFilter] = useState<'ALL' | Verdict>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    return incidents.filter((inc) => {
      if (verdictFilter !== 'ALL' && inc.verdict !== verdictFilter) return false;
      if (dateFilter !== 'all') {
        const days = dateFilter === '7d' ? 7 : 30;
        const ts = new Date(inc.scannedAt).getTime();
        if (now - ts > days * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }, [incidents, verdictFilter, dateFilter]);

  const handleMarkReviewed = async (id: string) => {
    await incidentStore.updateIncident(id, { reviewed: true });
    await refreshIncidents();
    if (user && isOnline) {
      await familyService.syncIncidentOutcomeUpdate(
        user.uid,
        id,
        { reviewed: true },
        elderConnections,
      );
    }
  };

  const handleToggleFalsePositive = async (id: string, current: boolean) => {
    await incidentStore.updateIncident(id, { falsePositive: !current, reviewed: true });
    await refreshIncidents();
    if (user && isOnline) {
      await familyService.syncIncidentOutcomeUpdate(
        user.uid,
        id,
        { falsePositive: !current, reviewed: true },
        elderConnections,
      );
    }
  };

  const handleDeleteOne = async (id: string) => {
    await incidentStore.deleteIncident(id);
    await refreshIncidents();
  };

  const handleDeleteAll = async () => {
    await incidentStore.deleteAllIncidents();
    setConfirmClearAll(false);
    await refreshIncidents();
  };

  const handleExport = async () => {
    const json = await incidentStore.exportIncidentsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `safecircle-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t.historyTitle}</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={incidents.length === 0}
              onClick={() => void handleExport()}
            >
              <Download className="w-4 h-4" />
              <span>{t.exportJson}</span>
            </Button>
            {incidents.length > 0 ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmClearAll(true)}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.deleteAll}</span>
              </Button>
            ) : null}
          </div>
        </div>

        {confirmClearAll ? (
          <Banner tone="danger" className="space-y-3">
            <p className="font-bold">{t.confirmDeleteAll}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="danger" onClick={() => void handleDeleteAll()}>
                {t.deleteAll}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setConfirmClearAll(false)}>
                {t.cancel}
              </Button>
            </div>
          </Banner>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {(['ALL', 'DANGEROUS', 'BE_CAREFUL', 'SAFE'] as const).map((v) => (
            <Button
              key={v}
              type="button"
              variant={verdictFilter === v ? 'primary' : 'secondary'}
              onClick={() => setVerdictFilter(v)}
            >
              {v === 'ALL'
                ? t.filterAll
                : v === 'SAFE'
                  ? t.verdictSafe
                  : v === 'BE_CAREFUL'
                    ? t.verdictCareful
                    : t.verdictDangerous}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            { id: 'all', label: t.filterAll },
            { id: '7d', label: '7d' },
            { id: '30d', label: '30d' },
          ] as const).map((d) => (
            <Button
              key={d.id}
              type="button"
              variant={dateFilter === d.id ? 'primary' : 'secondary'}
              onClick={() => setDateFilter(d.id)}
            >
              {d.label}
            </Button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<History className="w-7 h-7" />}
          title={t.historyEmpty}
          action={
            <Button size="lg" onClick={() => navigate('/check')}>
              {t.checkMessageCta}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => (
            <Card key={inc.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <RiskBadge verdict={inc.verdict} lang={prefs.language} />
                <span className="font-mono-tabular text-xs font-bold text-[var(--sc-text-muted)]">
                  {new Date(inc.scannedAt).toLocaleString()} · {inc.score}/100
                </span>
              </div>

              <div className="text-sm text-[var(--sc-text-muted)] flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  {inc.signalIds.length > 0 ? inc.signalIds.join(', ') : inc.category}
                </span>
                {inc.userOutcome ? <span>Outcome: {inc.userOutcome}</span> : null}
                {inc.falsePositive ? <span>{t.markedFalseAlarm}</span> : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {!inc.reviewed ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleMarkReviewed(inc.id)}
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.markReviewed}</span>
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--sc-safe-text)] px-2">
                    <Check className="w-4 h-4" />
                    <span>{t.reviewedLabel}</span>
                  </span>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleToggleFalsePositive(inc.id, inc.falsePositive)}
                >
                  <Flag className="w-4 h-4" />
                  <span>{inc.falsePositive ? t.markedFalseAlarm : t.markFalseAlarm}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void handleDeleteOne(inc.id)}
                >
                  <Trash2 className="w-4 h-4 text-[var(--sc-danger-text)]" />
                  <span>{t.deleteOne}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
