import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eraser, SearchCheck, Share2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { familyService } from '../services/familyService';
import { incidentStore } from '../services/incidentStore';
import { scanService } from '../services/scanService';
import { Banner, Button, Card } from '../components/ui';

export const ShareHandlerPage: React.FC = () => {
  const { prefs, t, setActiveScan, refreshIncidents, user, isOnline, elderConnections } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialShared = [
    searchParams.get('title') ?? '',
    searchParams.get('text') ?? '',
    searchParams.get('url') ?? '',
  ]
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');

  const [sharedText, setSharedText] = useState(initialShared);
  const [scanning, setScanning] = useState(false);

  const handleCheck = async () => {
    const trimmed = sharedText.trim();
    if (!trimmed) return;

    setScanning(true);
    try {
      const { incident, result } = await scanService.scanAndRecord(
        {
          text: trimmed,
          source: 'share',
          language: prefs.language,
        },
        { enableLocalAi: prefs.localAiEnabled },
      );

      // Immediately discard shared text from memory and URL
      setSharedText('');
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
      navigate('/result', { replace: true });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Share2 className="w-6 h-6 text-[var(--sc-primary)] shrink-0" />
          <h2 className="text-xl font-bold">{t.shareHandlerTitle}</h2>
        </div>

        <p className="text-sm text-[var(--sc-text-muted)] leading-relaxed">{t.shareHandlerDesc}</p>

        <textarea
          rows={6}
          value={sharedText}
          onChange={(e) => setSharedText(e.target.value)}
          placeholder={t.checkerPlaceholder}
          className="w-full rounded-2xl border border-[var(--sc-border)] bg-[var(--sc-bg)] p-4 text-base leading-relaxed"
        />

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            disabled={!sharedText.trim() || scanning}
            onClick={() => void handleCheck()}
          >
            <SearchCheck className="w-5 h-5" />
            <span>{t.checkNowBtn}</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setSharedText('')}
            disabled={!sharedText}
          >
            <Eraser className="w-5 h-5" />
            <span>{t.clearBtn}</span>
          </Button>
        </div>

        <Banner tone="info">{t.privacyClearedNote}</Banner>
      </Card>

      <Card className="p-6 space-y-3">
        <h3 className="font-bold text-lg">{t.howToShareTitle}</h3>
        <ul className="space-y-2 text-sm text-[var(--sc-text-muted)] list-disc pl-5 leading-relaxed">
          {prefs.language === 'ml' ? (
            <>
              <li>Android ഫോണിൽ SafeCircle ഇൻസ്റ്റാൾ ചെയ്യുക (Chrome &rarr; Add to Home screen).</li>
              <li>WhatsApp അല്ലെങ്കിൽ SMS തുറന്ന് സംശയമുള്ള സന്ദേശം അമർത്തിപ്പിടിക്കുക &rarr; Share &rarr; SafeCircle തിരഞ്ഞെടുക്കുക.</li>
              <li>iPhone (iOS Safari) ബ്രൗസറിൽ നേരിട്ടുള്ള Share Target സൗകര്യം ലഭ്യമല്ല; ദയവായി സന്ദേശം കോപ്പി ചെയ്ത് SafeCircle-ൽ പേസ്റ്റ് ചെയ്യുക.</li>
            </>
          ) : (
            <>
              <li>Install SafeCircle on Android (Chrome menu &rarr; Install app / Add to Home screen).</li>
              <li>In WhatsApp or Messages, long-press a suspicious message &rarr; tap Share &rarr; choose SafeCircle.</li>
              <li>On iPhone / iOS Safari, web apps do not appear in the system Share Sheet; please copy the message and paste it in Check Message.</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
};
