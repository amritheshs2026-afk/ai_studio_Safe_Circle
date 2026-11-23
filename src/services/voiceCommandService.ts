import { normaliseText } from '../engine/normaliser';
import type { Language } from '../engine/types';

export type VoiceNavIntent =
  | 'check'
  | 'speak_message'
  | 'emergency'
  | 'history'
  | 'family'
  | 'lessons'
  | 'exposure'
  | 'privacy';

export interface VoiceNavMatch {
  intent: VoiceNavIntent;
  route: string;
  labelEn: string;
  labelMl: string;
  spokenConfirmEn: string;
  spokenConfirmMl: string;
}

interface CommandRule {
  intent: VoiceNavIntent;
  route: string;
  labelEn: string;
  labelMl: string;
  spokenConfirmEn: string;
  spokenConfirmMl: string;
  patterns: RegExp[];
}

const COMMAND_RULES: CommandRule[] = [
  {
    intent: 'emergency',
    route: '/emergency',
    labelEn: 'Emergency Support (1930)',
    labelMl: 'അടിയന്തര സഹായം (1930)',
    spokenConfirmEn: 'Opening Emergency Support and 1930 helpline.',
    spokenConfirmMl: 'അടിയന്തര സഹായവും 1930 ഹെൽപ്പ്‌ലൈനും തുറക്കുന്നു.',
    patterns: [
      /\b(emergency|helpline|1930|112|police|cybercrime|cyber crime|report fraud|fraud help|sos|urgent help)\b/i,
      /(അടിയന്തര|സഹായം|പോലീസ്|സൈബർ|ഹെൽപ്പ്|റിപ്പോർട്ട്)/,
      /\b(adiyanthira|sahayam|police|cyber)\b/i,
    ],
  },
  {
    intent: 'speak_message',
    route: '/check?voice=1',
    labelEn: 'Speak Message to Check',
    labelMl: 'സംസാരിച്ച് പരിശോധിക്കുക',
    spokenConfirmEn: 'Opening voice message checker.',
    spokenConfirmMl: 'സംസാരിച്ച് സന്ദേശം പരിശോധിക്കാനുള്ള പേജ് തുറക്കുന്നു.',
    patterns: [
      /\b(speak message|dictate|voice check|read out message|dictate message)\b/i,
      /(സംസാരിച്ച് പരിശോധിക്ക|വായിച്ചു കൊടുക്ക)/,
    ],
  },
  {
    intent: 'check',
    route: '/check',
    labelEn: 'Scam & Message Checker',
    labelMl: 'സന്ദേശ പരിശോധന',
    spokenConfirmEn: 'Opening Scam Checker.',
    spokenConfirmMl: 'സന്ദേശ പരിശോധന തുറക്കുന്നു.',
    patterns: [
      /\b(check|checker|scam|message|scan|sms|whatsapp|verify|link)\b/i,
      /(പരിശോധ|മെസ്സേജ്|സന്ദേശം|തട്ടിപ്പ്|ലിങ്ക്)/,
      /\b(parishodhi|sandesham|check message|scam checker)\b/i,
    ],
  },
  {
    intent: 'history',
    route: '/history',
    labelEn: 'Safety History',
    labelMl: 'സുരക്ഷാ ചരിത്രം',
    spokenConfirmEn: 'Opening Safety History.',
    spokenConfirmMl: 'സുരക്ഷാ ചരിത്രം തുറക്കുന്നു.',
    patterns: [
      /\b(history|past|recent|previous|records|saved checks|log)\b/i,
      /(ചരിത്രം|പഴയ|രേഖകൾ|സമീപകാല)/,
      /\b(charithram|pazhaya)\b/i,
    ],
  },
  {
    intent: 'family',
    route: '/family',
    labelEn: 'Family & Guardian',
    labelMl: 'കുടുംബ ബന്ധം',
    spokenConfirmEn: 'Opening Family screen.',
    spokenConfirmMl: 'കുടുംബ ബന്ധം തുറക്കുന്നു.',
    patterns: [
      /\b(family|guardian|relative|call family|contact)\b/i,
      /(കുടുംബ|ഗാർഡിയൻ|ബന്ധു)/,
      /\b(kudumbam)\b/i,
    ],
  },
  {
    intent: 'lessons',
    route: '/lessons',
    labelEn: 'Safety Lessons',
    labelMl: 'സുരക്ഷാ പാഠങ്ങൾ',
    spokenConfirmEn: 'Opening Safety Lessons.',
    spokenConfirmMl: 'സുരക്ഷാ പാഠങ്ങൾ തുറക്കുന്നു.',
    patterns: [
      /\b(lesson|lessons|learn|teach|training|tips)\b/i,
      /(പാഠ|പഠിക്ക)/,
    ],
  },
  {
    intent: 'exposure',
    route: '/exposure',
    labelEn: 'Exposure & Protection Overview',
    labelMl: 'സുരക്ഷാ അവലോകനം',
    spokenConfirmEn: 'Opening Exposure Overview.',
    spokenConfirmMl: 'സുരക്ഷാ അവലോകനം തുറക്കുന്നു.',
    patterns: [
      /\b(exposure|overview|trend|risk summary|summary)\b/i,
      /(അവലോകന)/,
    ],
  },
  {
    intent: 'privacy',
    route: '/privacy',
    labelEn: 'Privacy Dashboard',
    labelMl: 'സ്വകാര്യതാ വിവരങ്ങൾ',
    spokenConfirmEn: 'Opening Privacy Dashboard.',
    spokenConfirmMl: 'സ്വകാര്യതാ വിവരങ്ങൾ തുറക്കുന്നു.',
    patterns: [
      /\b(privacy|private|data)\b/i,
      /(സ്വകാര്യത)/,
    ],
  },
];

/**
 * Parses spoken dashboard commands in English, Malayalam, or Manglish cleanly offline.
 */
export function parseVoiceNavigationCommand(transcript: string): VoiceNavMatch | null {
  const trimmed = transcript.trim();
  if (!trimmed) return null;

  const { textNorm, digitsNorm } = normaliseText(trimmed);

  for (const rule of COMMAND_RULES) {
    for (const pat of rule.patterns) {
      if (pat.test(textNorm) || pat.test(digitsNorm)) {
        return {
          intent: rule.intent,
          route: rule.route,
          labelEn: rule.labelEn,
          labelMl: rule.labelMl,
          spokenConfirmEn: rule.spokenConfirmEn,
          spokenConfirmMl: rule.spokenConfirmMl,
        };
      }
    }
  }

  return null;
}

export function speakGuidanceText(
  text: string,
  lang: Language,
  onDone?: () => void,
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onDone?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'ml' ? 'ml-IN' : 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const prefix = lang === 'ml' ? 'ml' : 'en';
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) utter.voice = match;
    utter.rate = 0.92;
    utter.onend = () => onDone?.();
    utter.onerror = () => onDone?.();
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    onDone?.();
    return false;
  }
}

export function stopSpeakingGuidance(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors
    }
  }
}
