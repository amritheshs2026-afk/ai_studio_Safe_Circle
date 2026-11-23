import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  History,
  MessageSquareWarning,
  Mic,
  MicOff,
  PhoneIncoming,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { detectPlatformCapabilities } from '../platform/capabilities';
import {
  parseVoiceNavigationCommand,
  speakGuidanceText,
  stopSpeakingGuidance,
  type VoiceNavMatch,
} from '../services/voiceCommandService';
import { Banner, Button, Card } from './ui';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal?: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type VoiceStatusState =
  | { kind: 'idle' }
  | { kind: 'listening' }
  | { kind: 'matched'; match: VoiceNavMatch; transcript: string }
  | { kind: 'unmatched'; transcript: string }
  | { kind: 'error'; message: string };

export const VoiceGuideCard: React.FC = () => {
  const { prefs, t } = useApp();
  const navigate = useNavigate();
  const caps = detectPlatformCapabilities();

  const [listening, setListening] = useState(false);
  const [speakingGuide, setSpeakingGuide] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [status, setStatus] = useState<VoiceStatusState>({ kind: 'idle' });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const latestTranscriptRef = useRef('');
  const resolvedRef = useRef(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore cleanup stop errors
      }
      stopSpeakingGuidance();
      if (navTimerRef.current !== null) {
        window.clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
      latestTranscriptRef.current = '';
    };
  }, []);

  const resolveTranscript = (rawTranscript: string) => {
    const cleaned = rawTranscript.trim();
    if (!cleaned || resolvedRef.current) return;

    const match = parseVoiceNavigationCommand(cleaned);
    if (match) {
      resolvedRef.current = true;
      setListening(false);
      setStatus({ kind: 'matched', match, transcript: cleaned });

      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop errors after match
      }

      const confirmation =
        prefs.language === 'ml' ? match.spokenConfirmMl : match.spokenConfirmEn;
      speakGuidanceText(confirmation, prefs.language);

      if (navTimerRef.current !== null) {
        window.clearTimeout(navTimerRef.current);
      }
      navTimerRef.current = window.setTimeout(() => {
        navigate(match.route);
      }, 450);
    } else {
      resolvedRef.current = true;
      setStatus({ kind: 'unmatched', transcript: cleaned });
    }
  };

  const handleToggleGuide = () => {
    if (speakingGuide) {
      stopSpeakingGuidance();
      setSpeakingGuide(false);
      return;
    }

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop error
      }
      setListening(false);
    }

    setSpeakingGuide(true);
    const started = speakGuidanceText(t.voiceNavGuideScript, prefs.language, () => {
      setSpeakingGuide(false);
    });
    if (!started) {
      setSpeakingGuide(false);
    }
  };

  const handleToggleListening = () => {
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop errors
      }
      setListening(false);
      if (status.kind === 'listening') {
        setStatus({ kind: 'idle' });
      }
      return;
    }

    // Stop any active guide speech before capturing microphone audio
    stopSpeakingGuidance();
    setSpeakingGuide(false);

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const RecCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecCtor) {
      setStatus({ kind: 'error', message: t.voiceNotSupported });
      return;
    }

    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    latestTranscriptRef.current = '';
    resolvedRef.current = false;
    setHeardText('');
    setStatus({ kind: 'listening' });

    const rec = new RecCtor();
    rec.lang = prefs.language === 'ml' ? 'ml-IN' : 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event) => {
      let combined = '';
      let hasFinal = false;

      for (let i = 0; i < event.results.length; i += 1) {
        const res = event.results[i];
        if (res && res.length > 0) {
          combined += `${res[0].transcript} `;
        }
        if (res?.isFinal) {
          hasFinal = true;
        }
      }

      const trimmed = combined.trim();
      latestTranscriptRef.current = trimmed;
      setHeardText(trimmed);

      if (hasFinal && trimmed) {
        resolveTranscript(trimmed);
      }
    };

    rec.onerror = (event) => {
      setListening(false);
      if (resolvedRef.current) return;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setStatus({
          kind: 'error',
          message:
            prefs.language === 'ml'
              ? 'മൈക്രോഫോൺ അനുമതി ലഭിച്ചില്ല. ബ്രൗസർ അനുമതി നൽകുകയോ താഴെയുള്ള ബട്ടണുകൾ ഉപയോഗിക്കുകയോ ചെയ്യുക.'
              : 'Microphone permission was not granted. Allow mic access or tap any shortcut below.',
        });
      } else if (event.error === 'no-speech') {
        setStatus({ kind: 'unmatched', transcript: '' });
      } else if (event.error !== 'aborted') {
        setStatus({ kind: 'error', message: t.voiceNavNotMatched });
      }
    };

    rec.onend = () => {
      setListening(false);
      if (!resolvedRef.current) {
        if (latestTranscriptRef.current) {
          resolveTranscript(latestTranscriptRef.current);
        } else {
          setStatus((prev) => (prev.kind === 'listening' ? { kind: 'idle' } : prev));
        }
      }
    };

    recognitionRef.current = rec;
    try {
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      setStatus({ kind: 'error', message: t.voiceNotSupported });
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)] flex items-center justify-center text-[var(--sc-primary)] shrink-0">
          <Mic className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold">{t.voiceNavTitle}</h3>
          <p className="text-sm text-[var(--sc-text-muted)] mt-0.5 leading-relaxed">
            {t.voiceNavSubtitle}
          </p>
        </div>
      </div>

      {caps.speechRecognitionSupported ? (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={listening ? 'danger' : 'primary'}
            size="lg"
            onClick={handleToggleListening}
            aria-pressed={listening}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{listening ? t.voiceNavStopBtn : t.voiceNavStartBtn}</span>
          </Button>

          {caps.speechSynthesisSupported ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleToggleGuide}
              aria-pressed={speakingGuide}
            >
              {speakingGuide ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span>{speakingGuide ? t.voiceNavStopGuideBtn : t.voiceNavHearGuideBtn}</span>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <Banner tone="info">{t.voiceNotSupported}</Banner>
          {caps.speechSynthesisSupported ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleToggleGuide}
              aria-pressed={speakingGuide}
            >
              {speakingGuide ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span>{speakingGuide ? t.voiceNavStopGuideBtn : t.voiceNavHearGuideBtn}</span>
            </Button>
          ) : null}
        </div>
      )}

      {/* Live Speech Status Region */}
      <div role="status" aria-live="polite" className="space-y-2">
        {status.kind === 'listening' ? (
          <Banner tone="info">
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-2">
                <Mic className="w-4 h-4 text-[var(--sc-primary)] shrink-0" aria-hidden="true" />
                <span>{t.voiceNavListeningHint}</span>
              </p>
              {heardText ? (
                <p className="text-sm text-[var(--sc-text-muted)]">
                  {t.voiceNavHeardLabel}: &ldquo;{heardText}&rdquo;
                </p>
              ) : null}
            </div>
          </Banner>
        ) : null}

        {status.kind === 'matched' ? (
          <Banner tone="info">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className="w-5 h-5 text-[var(--sc-safe-text)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="font-bold">
                  {prefs.language === 'ml' ? status.match.labelMl : status.match.labelEn}
                </p>
                <p className="text-xs text-[var(--sc-text-muted)] mt-0.5">
                  {t.voiceNavHeardLabel}: &ldquo;{status.transcript}&rdquo;
                </p>
              </div>
            </div>
          </Banner>
        ) : null}

        {status.kind === 'unmatched' ? (
          <Banner tone="warn">
            <div className="space-y-1">
              {status.transcript ? (
                <p className="text-xs font-semibold">
                  {t.voiceNavHeardLabel}: &ldquo;{status.transcript}&rdquo;
                </p>
              ) : null}
              <p>{t.voiceNavNotMatched}</p>
            </div>
          </Banner>
        ) : null}

        {status.kind === 'error' ? <Banner tone="warn">{status.message}</Banner> : null}
      </div>

      {/* Direct Touch Shortcuts + Spoken Hint */}
      <div className="pt-1 space-y-2.5">
        <p className="text-xs font-medium text-[var(--sc-text-muted)]">{t.voiceNavQuickHint}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-start"
            onClick={() => navigate('/check')}
          >
            <MessageSquareWarning className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
            <span>{t.checkMessageCta}</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-start"
            onClick={() => navigate('/emergency')}
          >
            <PhoneIncoming className="w-5 h-5 text-[var(--sc-danger-text)] shrink-0" />
            <span>1930 · {t.emergencyHelpTitle}</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-start"
            onClick={() => navigate('/history')}
          >
            <History className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
            <span>{t.navHistory}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
