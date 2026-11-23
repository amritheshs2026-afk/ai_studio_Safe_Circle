import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardPaste, Eraser, Mic, MicOff, SearchCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { detectPlatformCapabilities } from '../platform/capabilities';
import { familyService } from '../services/familyService';
import { incidentStore } from '../services/incidentStore';
import { scanService } from '../services/scanService';
import { Banner, Button, Card } from '../components/ui';

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export const MessageCheckerPage: React.FC = () => {
  const { prefs, t, setActiveScan, refreshIncidents, user, isOnline, elderConnections } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const caps = detectPlatformCapabilities();

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      setText('');
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('voice') === '1' && caps.speechRecognitionSupported && !listening) {
      // Ready for user push-to-talk tap; never auto-starts without tap
    }
  }, [searchParams, caps.speechRecognitionSupported, listening]);

  const handlePaste = async () => {
    setError('');
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setText(clip.slice(0, 5200));
      }
    } catch {
      setError(
        prefs.language === 'ml'
          ? 'ബ്രൗസർ പേസ്റ്റ് അനുവദിച്ചില്ല. ബോക്സിൽ തൊട്ട് പേസ്റ്റ് ചെയ്യുക.'
          : 'Browser blocked clipboard access. Tap inside the box and paste directly.',
      );
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const RecCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecCtor) return;

    const rec = new RecCtor();
    rec.lang = prefs.language === 'ml' ? 'ml-IN' : 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += `${event.results[i][0].transcript} `;
      }
      setText(transcript.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const handleScan = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(t.emptyInputError);
      return;
    }

    setError('');
    setScanning(true);
    try {
      const { incident, result } = await scanService.scanAndRecord(
        {
          text: trimmed,
          source: 'manual',
          language: prefs.language,
        },
        { enableLocalAi: prefs.localAiEnabled },
      );

      // Immediately clear raw message text from memory
      setText('');
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
      setScanning(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="sc-message-box" className="font-bold text-lg">
            {t.checkerTitle}
          </label>
          <span className="font-mono-tabular text-xs text-[var(--sc-text-muted)]">
            {text.length} / 5,000
          </span>
        </div>

        <textarea
          id="sc-message-box"
          rows={7}
          value={text}
          onChange={(e) => {
            setError('');
            setText(e.target.value);
          }}
          placeholder={t.checkerPlaceholder}
          className="w-full rounded-2xl border border-[var(--sc-border)] bg-[var(--sc-bg)] p-4 text-base leading-relaxed resize-y"
        />

        {text.length > 5000 ? (
          <Banner tone="warn">{t.charLimitNotice}</Banner>
        ) : null}

        {listening ? (
          <Banner tone="info">
            <span className="flex items-center gap-2 font-bold">
              <Mic className="w-5 h-5 text-[var(--sc-danger-text)]" />
              <span>{t.voiceListening}</span>
            </span>
          </Banner>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm font-semibold text-[var(--sc-danger-text)]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {caps.clipboardReadSupported ? (
            <Button type="button" variant="secondary" size="lg" onClick={() => void handlePaste()}>
              <ClipboardPaste className="w-5 h-5" />
              <span>{t.pasteBtn}</span>
            </Button>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              setText('');
              setError('');
            }}
            disabled={!text}
          >
            <Eraser className="w-5 h-5" />
            <span>{t.clearBtn}</span>
          </Button>

          {caps.speechRecognitionSupported ? (
            <Button
              type="button"
              variant={listening ? 'danger' : 'secondary'}
              size="lg"
              onClick={toggleVoice}
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{listening ? t.voiceStopBtn : t.voiceStartBtn}</span>
            </Button>
          ) : null}
        </div>

        <Button
          type="button"
          size="xl"
          className="w-full"
          disabled={scanning}
          onClick={() => void handleScan()}
        >
          <SearchCheck className="w-6 h-6" />
          <span>{t.checkNowBtn}</span>
        </Button>

        <p className="text-xs text-[var(--sc-text-muted)] text-center">{t.privacyClearedNote}</p>
      </Card>
    </div>
  );
};
