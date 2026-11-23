import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, PhoneIncoming, SearchCheck } from 'lucide-react';
import { SIMULATED_CALL_SCENARIOS, SIMULATED_NOTIFICATIONS } from '../data/demoData';
import { useApp } from '../contexts/AppContext';
import { familyService } from '../services/familyService';
import { incidentStore } from '../services/incidentStore';
import { scanService } from '../services/scanService';
import { Banner, Button, Card } from '../components/ui';

export const SimulatedNotificationsPage: React.FC = () => {
  const { prefs, t, setActiveScan, refreshIncidents, user, isOnline, elderConnections } = useApp();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);

  const runSampleScan = async (id: string, text: string) => {
    setBusyId(id);
    try {
      const { incident, result } = await scanService.scanAndRecord(
        {
          text,
          source: 'notification',
          language: prefs.language,
        },
        { enableLocalAi: prefs.localAiEnabled },
      );
      await refreshIncidents();

      let guardianAlertsSentCount = 0;
      const activeElderConns = elderConnections.filter(
        (c) => c.status === 'active' && c.syncConsent && c.shareLevel !== 'none',
      );
      if (user && activeElderConns.length > 0) {
        if (isOnline) {
          guardianAlertsSentCount = await familyService.syncIncidentAndNotifyGuardians(
            user.uid,
            prefs.displayName || user.displayName || 'Family Elder',
            incident,
            activeElderConns,
          );
        } else {
          await incidentStore.enqueueSync(incident.id);
        }
      }

      setActiveScan({ result, incident, guardianAlertsSentCount });
      navigate('/result');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Banner tone="demo">{t.demoBannerNotif}</Banner>

      <div className="space-y-3">
        {SIMULATED_NOTIFICATIONS.map((item) => (
          <Card key={item.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--sc-text-muted)]">
              <span className="font-bold flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[var(--sc-primary)]" />
                <span>
                  {item.appLabel} · {item.senderLabel}
                </span>
              </span>
              <span>
                SAMPLE ({item.language.toUpperCase()}) · {item.timeLabel}
              </span>
            </div>

            <p className="text-base leading-relaxed">{item.text}</p>

            <Button
              type="button"
              size="lg"
              disabled={busyId === item.id}
              onClick={() => void runSampleScan(item.id, item.text)}
            >
              <SearchCheck className="w-5 h-5" />
              <span>{t.checkNowBtn}</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const SimulatedCallsPage: React.FC = () => {
  const { prefs, t, setActiveScan, refreshIncidents, user, isOnline, elderConnections } = useApp();
  const navigate = useNavigate();
  const [customTranscript, setCustomTranscript] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const runCallScan = async (id: string, transcript: string) => {
    const trimmed = transcript.trim();
    if (!trimmed) return;
    setBusyId(id);
    try {
      const { incident, result } = await scanService.scanAndRecord(
        {
          text: trimmed,
          source: 'call_sim',
          language: prefs.language,
        },
        { enableLocalAi: prefs.localAiEnabled },
      );
      if (id === 'custom') {
        setCustomTranscript('');
      }
      await refreshIncidents();

      let guardianAlertsSentCount = 0;
      const activeElderConns = elderConnections.filter(
        (c) => c.status === 'active' && c.syncConsent && c.shareLevel !== 'none',
      );
      if (user && activeElderConns.length > 0) {
        if (isOnline) {
          guardianAlertsSentCount = await familyService.syncIncidentAndNotifyGuardians(
            user.uid,
            prefs.displayName || user.displayName || 'Family Elder',
            incident,
            activeElderConns,
          );
        } else {
          await incidentStore.enqueueSync(incident.id);
        }
      }

      setActiveScan({ result, incident, guardianAlertsSentCount });
      navigate('/result');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <Banner tone="demo">{t.demoBannerCall}</Banner>

      <Card className="space-y-3">
        <h2 className="font-bold text-lg">
          {prefs.language === 'ml'
            ? 'കോളിൽ കേട്ട കാര്യം ഇവിടെ എഴുതി പരിശോധിക്കുക'
            : 'Paste or type what a caller said'}
        </h2>
        <textarea
          rows={4}
          value={customTranscript}
          onChange={(e) => setCustomTranscript(e.target.value)}
          placeholder={t.checkerPlaceholder}
          className="w-full rounded-2xl border border-[var(--sc-border)] bg-[var(--sc-bg)] p-4 text-base"
        />
        <Button
          type="button"
          size="lg"
          disabled={!customTranscript.trim() || busyId === 'custom'}
          onClick={() => void runCallScan('custom', customTranscript)}
        >
          <SearchCheck className="w-5 h-5" />
          <span>{t.checkNowBtn}</span>
        </Button>
      </Card>

      <div className="space-y-3">
        {SIMULATED_CALL_SCENARIOS.map((sc) => (
          <Card key={sc.id} className="space-y-3">
            <div className="flex items-start gap-2.5">
              <PhoneIncoming className="w-5 h-5 text-[var(--sc-primary)] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base">
                  {prefs.language === 'ml' ? sc.titleMl : sc.titleEn}
                </h3>
                <p className="text-xs text-[var(--sc-text-muted)]">
                  {prefs.language === 'ml' ? sc.callerLabelMl : sc.callerLabelEn}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base p-3.5 rounded-xl bg-[var(--sc-surface-muted)] leading-relaxed">
              “{sc.transcript}”
            </p>
            <Button
              type="button"
              size="lg"
              disabled={busyId === sc.id}
              onClick={() => void runCallScan(sc.id, sc.transcript)}
            >
              <SearchCheck className="w-5 h-5" />
              <span>{t.checkNowBtn}</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
