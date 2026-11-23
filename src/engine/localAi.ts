import { applyExternalSignals } from './externalSignals';
import { normaliseText } from './normaliser';
import { scan } from './scanner';
import type {
  DetectionMethod,
  ExternalSignalInput,
  Language,
  RulePack,
  ScanInput,
  ScanResult,
  SignalId,
  Verdict,
} from './types';

interface WeightedFeature {
  pattern: RegExp;
  weight: number;
  signalHint?: SignalId;
}

const LOCAL_AI_BIAS = -1.65;

const SCAM_FEATURES: WeightedFeature[] = [
  // English / Pan-India high-signal scam phrases
  { pattern: /\bdigital\s+arrest\b/i, weight: 2.8, signalHint: 'URGENCY_THREAT' },
  { pattern: /\bsafe\s+account\b/i, weight: 2.5, signalHint: 'MONEY_REQUEST' },
  { pattern: /\b(cbi|enforcement\s+directorate|narcotics|cyber\s+cell)\b/i, weight: 1.6, signalHint: 'AUTHORITY_CLAIM' },
  { pattern: /\b(arrest\s+warrant|money\s+laundering|court\s+summons)\b/i, weight: 2.1, signalHint: 'URGENCY_THREAT' },
  { pattern: /\b(stay\s+on\s+(the\s+)?(video\s+)?call|do\s+not\s+tell|keep\s+(it|this)\s+secret)\b/i, weight: 2.3, signalHint: 'SECRECY' },
  { pattern: /\b(anydesk|teamviewer|quicksupport|rustdesk|screen\s+shar(e|ing))\b/i, weight: 2.6, signalHint: 'REMOTE_ACCESS' },
  { pattern: /\b[a-z0-9_-]+\.apk\b/i, weight: 2.7, signalHint: 'APK_INSTALL' },
  { pattern: /\b(kyc\s+(expired|update|pending|suspended)|account\s+(blocked|frozen|suspended))\b/i, weight: 1.9, signalHint: 'URGENCY_THREAT' },
  { pattern: /\b(processing\s+fee|clearance\s+charge|registration\s+fee|lottery\s+winner|kbc\s+lottery)\b/i, weight: 2.0, signalHint: 'MONEY_REQUEST' },
  { pattern: /\b(guaranteed\s+returns|double\s+your\s+money|vip\s+trading|daily\s+profit)\b/i, weight: 2.2, signalHint: 'INVESTMENT_FRAUD' },
  { pattern: /\b(lost\s+my\s+phone|new\s+number).{0,45}\b(rs|inr|money|upi|gpay|hospital)\b/i, weight: 2.2, signalHint: 'EMERGENCY_RELATIVE' },
  { pattern: /\b(send|pay|transfer|share).{0,25}\b(upi|gpay|phonepe|paytm|qr\s+code|pin|otp|cvv)\b/i, weight: 1.8, signalHint: 'MONEY_REQUEST' },

  // Malayalam (Unicode) scam features & fee/payment stems
  { pattern: /(സിബിഐ|പോലീസ്|സൈബർ|കസ്റ്റംസ്).{0,35}(അറസ്റ്റ്|കേസ്|വാറന്റ്|പണം)/i, weight: 2.5, signalHint: 'AUTHORITY_CLAIM' },
  { pattern: /(ആരോടും\s+പറയരുത്|വീട്ടുകാരോട്\s+പറയരുത്|കോൾ\s+കട്ട്\s+ചെയ്യരുത്)/i, weight: 2.4, signalHint: 'SECRECY' },
  { pattern: /(ലോട്ടറി|സമ്മാനം).{0,45}(രൂപ|ഫീസ്|യുപിഐ|അയക്ക|അടയ്ക്ക)/i, weight: 2.6, signalHint: 'MONEY_REQUEST' },
  { pattern: /(രൂപ|ഫീസ്|പണം).{0,28}(യുപിഐ\s+വഴി|ഗൂഗിൾ\s+പേ).{0,20}(അയക്ക|നൽക|അടയ്ക്ക)/i, weight: 2.5, signalHint: 'MONEY_REQUEST' },
  { pattern: /(അക്കൗണ്ട്|സിം).{0,25}(ബ്ലോക്ക്|കട്ട്).{0,30}(ഒടിപി|പിൻ|പറയൂ|അയക്ക)/i, weight: 2.4, signalHint: 'SENSITIVE_INFO_REQUEST' },

  // Manglish & Hinglish scam cues
  { pattern: /\b(aarodum\s+parayaruthu|block\s+aavum|ippol\s+thanne|udan\s+thanne)\b/i, weight: 2.0, signalHint: 'SECRECY' },
  { pattern: /\b(kisi\s+ko\s+mat\s+batana|band\s+ho\s+jayega|turant\s+otp|paise\s+bhejo)\b/i, weight: 2.2, signalHint: 'URGENCY_THREAT' },
];

const BENIGN_COUNTER_FEATURES: WeightedFeature[] = [
  { pattern: /\b(never\s+share|do\s+not\s+share|don't\s+share|bank\s+will\s+never\s+ask)\b.{0,30}\b(otp|pin|cvv|anyone)\b/i, weight: -2.4 },
  { pattern: /\b(your\s+otp\s+is|verification\s+code\s+is|one\s+time\s+password\s+is)\b.{0,35}\b[0-9]{4,8}\b/i, weight: -2.6 },
  { pattern: /\b(a\/c|acct|account)\s*(ending)?\s*(xx|x{2,4})[0-9]{3,4}\b.{0,35}\b(debited|credited|avl\s+bal|available\s+bal)\b/i, weight: -2.5 },
  { pattern: /\b(appointment\s+reminder|opd\s+token|medicine\s+refill|ready\s+for\s+pickup)\b/i, weight: -2.4 },
  { pattern: /\b(police\s+verification\s+form|tenant\s+police\s+verification|no\s+payment\s+(is\s+)?required)\b/i, weight: -2.5 },
  { pattern: /\b(advisory\s+from|stay\s+aware\s+of\s+fake|real\s+officers\s+never\s+demand)\b/i, weight: -2.4 },
  { pattern: /(നിങ്ങളുടെ\s+ഒടിപി|ഒടിപി\s+ആരോടും\s+പങ്കുവയ്ക്കരുത്|ബാലൻസ്|കൺസ്യൂമർ\s+നമ്പർ)/i, weight: -2.6 },
  { pattern: /\b(ningalude\s+otp|otp\s+aarodum\s+parayaruthu)\b/i, weight: -2.5 },
];

export interface LocalAiClassification {
  probability: number;
  logit: number;
  matchedFeatureCount: number;
  suggestedSignals: ExternalSignalInput[];
}

function sigmoid(z: number): number {
  if (z > 20) return 1;
  if (z < -20) return 0;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Pure on-device logistic text classifier.
 * Runs synchronously offline with zero third-party network calls.
 */
export function classifyScamLocalAi(
  rawText: string,
  hasLegitContext: boolean,
  hasSuspiciousUrl: boolean,
): LocalAiClassification {
  const trimmed = rawText.trim().slice(0, 5000);
  if (!trimmed) {
    return { probability: 0, logit: LOCAL_AI_BIAS, matchedFeatureCount: 0, suggestedSignals: [] };
  }

  const { textNorm, digitsNorm } = normaliseText(trimmed);
  let logit = LOCAL_AI_BIAS;
  let matchedFeatureCount = 0;
  const signalScores = new Map<SignalId, number>();

  for (const feat of SCAM_FEATURES) {
    if (feat.pattern.test(textNorm) || feat.pattern.test(digitsNorm)) {
      logit += feat.weight;
      matchedFeatureCount += 1;
      if (feat.signalHint) {
        signalScores.set(feat.signalHint, (signalScores.get(feat.signalHint) ?? 0) + feat.weight);
      }
    }
  }

  if (hasSuspiciousUrl) {
    logit += 1.9;
    matchedFeatureCount += 1;
    signalScores.set('SUSPICIOUS_URL', (signalScores.get('SUSPICIOUS_URL') ?? 0) + 1.9);
  }

  for (const benign of BENIGN_COUNTER_FEATURES) {
    if (benign.pattern.test(textNorm) || benign.pattern.test(digitsNorm)) {
      logit += benign.weight;
    }
  }

  if (hasLegitContext && !hasSuspiciousUrl) {
    logit -= 1.2;
  }

  const probability = Number(sigmoid(logit).toFixed(4));
  const suggestedSignals: ExternalSignalInput[] = [];

  if (probability >= 0.72) {
    const topSignals = Array.from(signalScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    for (const [signalId] of topSignals) {
      suggestedSignals.push({
        signalId,
        source: 'local_ai_classifier',
        confidence: probability,
      });
    }
  }

  return {
    probability,
    logit: Number(logit.toFixed(3)),
    matchedFeatureCount,
    suggestedSignals,
  };
}

/**
 * Combines rule-pack detection (`scan`) with the 100% local on-device probabilistic
 * classifier (`classifyScamLocalAi`) in a strictly raise-only, offline manner.
 */
export function scanWithLocalAi(
  input: ScanInput,
  pack: RulePack,
  options?: { enableLocalAi?: boolean; timeBudgetMs?: number },
): ScanResult {
  const baseResult = scan(input, pack, options);
  if (options?.enableLocalAi === false || !input.text.trim()) {
    return baseResult;
  }

  const hasLegitContext = baseResult.indicators.some((i) => i.signalId === 'LEGIT_CONTEXT');
  const hasSuspiciousUrl = baseResult.indicators.some((i) => i.signalId === 'SUSPICIOUS_URL');
  const baseHadRiskSignals = baseResult.indicators.some((i) => i.signalId !== 'LEGIT_CONTEXT');

  const ai = classifyScamLocalAi(input.text, hasLegitContext, hasSuspiciousUrl);
  if (ai.suggestedSignals.length === 0) {
    return baseResult;
  }

  // Never override explicit benign OTP-delivery messages unless rule pack already flagged risk
  if (hasLegitContext && !hasSuspiciousUrl && !baseHadRiskSignals) {
    return baseResult;
  }

  const existingSignals = new Set(baseResult.indicators.map((i) => i.signalId));
  const unseenAiSignals = ai.suggestedSignals.filter((s) => !existingSignals.has(s.signalId));
  if (unseenAiSignals.length === 0) {
    return baseResult;
  }

  const merged = applyExternalSignals(baseResult, unseenAiSignals, pack);
  const method: DetectionMethod = baseHadRiskSignals ? 'HYBRID' : 'LOCAL_AI';

  return {
    ...merged,
    detectionMethod: method,
  };
}

/**
 * 100% Local On-Device Plain-Language Explanation Generator.
 * Runs synchronously without any cloud API or network calls, tailoring short,
 * calm, senior-friendly English or Malayalam explanations from detected tactics.
 */
export function generateLocalPlainExplanation(params: {
  signalIds: SignalId[];
  verdict: Verdict;
  language: Language;
}): { explanation: string; recommendedAction: string } {
  const { signalIds, verdict, language } = params;
  const set = new Set(signalIds);
  const isMl = language === 'ml';

  if (verdict === 'SAFE' && !set.has('PRIZE_LOTTERY') && !set.has('SUSPICIOUS_URL')) {
    return isMl
      ? {
          explanation:
            'ഈ സന്ദേശത്തിൽ തട്ടിപ്പ് സൂചനകളൊന്നും കണ്ടെത്തിയില്ല. ഇത് ഒരു സാധാരണ അറിയിപ്പായി തോന്നുന്നു.',
          recommendedAction:
            'സംശയമുണ്ടെങ്കിൽ ബാങ്കിന്റെ ഔദ്യോഗിക നമ്പറിൽ വിളിക്കാം. ഒടിപിയും പിന്നും ആരോടും പങ്കുവയ്ക്കരുത്.',
        }
      : {
          explanation:
            'No scam warning signs showed up in this message. It reads like a routine notice.',
          recommendedAction:
            'If you are ever unsure, check directly with your bank. Never share an OTP or PIN.',
        };
  }

  const hasDigitalArrest =
    set.has('AUTHORITY_CLAIM') && (set.has('SECRECY') || set.has('URGENCY_THREAT'));
  const hasRemote = set.has('REMOTE_ACCESS');
  const hasApk = set.has('APK_INSTALL');
  const hasRelative = set.has('EMERGENCY_RELATIVE');
  const hasSecretCodes = set.has('SENSITIVE_INFO_REQUEST');
  const hasMoney = set.has('MONEY_REQUEST');
  const hasLink = set.has('SUSPICIOUS_URL');
  const hasPrizeOrInvest = set.has('PRIZE_LOTTERY') || set.has('INVESTMENT_FRAUD');

  if (hasDigitalArrest) {
    return isMl
      ? {
          explanation:
            'പോലീസോ സിബിഐയോ ഒരിക്കലും ഫോണിലൂടെയോ വീഡിയോ കോളിലൂടെയോ അറസ്റ്റ് ചെയ്യില്ല. പേടിപ്പെടുത്തി പണം വാങ്ങാനാണ് ഈ സന്ദേശം ശ്രമിക്കുന്നത്.',
          recommendedAction:
            'ഭയപ്പെടാതെ ഉടൻ കോൾ കട്ട് ചെയ്യുക. ഒരു രൂപ പോലും അയക്കാതെ കുടുംബാംഗത്തെ വിളിക്കുക.',
        }
      : {
          explanation:
            'Real police or CBI officers never arrest people on a video call. Creating panic and secrecy is a classic scam trick.',
          recommendedAction:
            'Hang up calmly right now. Do not pay anything, and call a trusted family member.',
        };
  }

  if (hasRemote) {
    return isMl
      ? {
          explanation:
            'AnyDesk പോലുള്ള ആപ്പുകൾ മറ്റൊരാൾക്ക് നിങ്ങളുടെ ഫോൺ സ്ക്രീൻ കാണാൻ വഴിയൊരുക്കും. അവർക്ക് നിങ്ങളുടെ ബാങ്ക് ആപ്പുകളും ഒടിപിയും കാണാനാകും.',
          recommendedAction:
            'ഇത്തരം ആപ്പുകൾ ഇൻസ്റ്റാൾ ചെയ്യരുത്. സഹായത്തിനായി കുടുംബത്തെയോ ബാങ്ക് ശാഖയെയോ സമീപിക്കുക.',
        }
      : {
          explanation:
            'Screen-sharing apps let a stranger watch your phone screen. They can read your bank OTPs and take control.',
          recommendedAction:
            'Do not install the app or share any code. Ask a family member to check for you.',
        };
  }

  if (hasApk) {
    return isMl
      ? {
          explanation:
            'യഥാർത്ഥ വിവാഹ ക്ഷണക്കത്തോ സർക്കാർ അറിയിപ്പോ ".apk" ഫയലായി വരില്ല. ഇത് ഫോണിൽ ദോഷകരമായ ആപ്പ് കയറ്റാൻ ശ്രമിക്കുകയാണ്.',
          recommendedAction:
            'ഈ ഫയൽ തുറക്കുകയോ ഇൻസ്റ്റാൾ ചെയ്യുകയോ ചെയ്യരുത്. Play Store വഴി മാത്രം ആപ്പുകൾ എടുക്കുക.',
        }
      : {
          explanation:
            'Real bills, wedding cards, or government notices never come as ".apk" app files. That file can harm your phone.',
          recommendedAction:
            'Delete the file without tapping it. Only install apps from the Google Play Store.',
        };
  }

  if (hasRelative) {
    return isMl
      ? {
          explanation:
            'കുടുംബാംഗത്തിന് അപകടം പറ്റിയെന്ന് പറഞ്ഞ് പുതിയ നമ്പറിൽ നിന്ന് വേഗം പണം ചോദിക്കുന്നത് തട്ടിപ്പാകാൻ സാധ്യതയുണ്ട്.',
          recommendedAction:
            'പണം അയക്കുന്നതിന് മുമ്പ് നിങ്ങളുടെ ഫോണിൽ സേവ് ചെയ്ത അവരുടെ പഴയ നമ്പറിൽ വിളിച്ചു നോക്കുക.',
        }
      : {
          explanation:
            'Scammers often pretend to be a relative on a new phone number in trouble. They rush you so you will not verify.',
          recommendedAction:
            'Call your relative back on their old saved number before sending any money.',
        };
  }

  if (hasSecretCodes) {
    return isMl
      ? {
          explanation:
            'നിങ്ങളുടെ ഒടിപിയും പിന്നും വീടിന്റെ താക്കോൽ പോലെയാണ്. യഥാർത്ഥ ബാങ്കുകൾ ഒരിക്കലും ഇവ ചോദിച്ചു സന്ദേശമയക്കില്ല.',
          recommendedAction:
            'ഒടിപി, പിൻ, സിവിവി എന്നിവ ആരോടും പറയരുത്. സന്ദേശത്തിലെ ലിങ്കിൽ തൊടരുത്.',
        }
      : {
          explanation:
            'Your OTP and PIN are like keys to your bank account. Real banks never ask you to read or send them.',
          recommendedAction:
            'Keep your OTP, PIN, and CVV private. Do not reply to this message.',
        };
  }

  if (hasPrizeOrInvest) {
    return isMl
      ? {
          explanation:
            'സമ്മാനം കിട്ടാനോ പണം ഇരട്ടിയാക്കാനോ ആദ്യം ഫീസ് അടയ്ക്കാൻ പറയുന്നത് വലിയ തട്ടിപ്പ് ലക്ഷണമാണ്.',
          recommendedAction:
            'പണം അയക്കുകയോ ലിങ്കിൽ തൊടുകയോ ചെയ്യരുത്. ഇക്കാര്യം കുടുംബത്തോട് ചോദിക്കൂ.',
        }
      : {
          explanation:
            'Asking you to pay a fee to claim a prize or double your money is a common trap. Real rewards do not ask for advance fees.',
          recommendedAction:
            'Ignore the offer and send no money. Check with a family member first.',
        };
  }

  if (hasMoney || hasLink) {
    return isMl
      ? {
          explanation:
            'ഇതിൽ പണം ചോദിക്കുന്നതോ സംശയമുള്ള വെബ്‌സൈറ്റ് ലിങ്കോ ഉണ്ട്. വേഗം പണം അയക്കാൻ സമ്മർദ്ദം ചെലുത്തുന്നത് ശ്രദ്ധിക്കണം.',
          recommendedAction:
            'ലിങ്കിൽ തൊടരുത്. പണം അയക്കുന്നതിന് മുമ്പ് കുടുംബാംഗത്തോട് സംസാരിക്കുക. പണം നഷ്ടമായാൽ 1930 വിളിക്കുക.',
        }
      : {
          explanation:
            'This message uses an unfamiliar link or asks for money right away. Scammers rush people so they skip checking.',
          recommendedAction:
            'Do not tap the link or pay. Talk with family first, and call 1930 if money was already sent.',
        };
  }

  return isMl
    ? {
        explanation:
          'ഈ സന്ദേശത്തിൽ ചില സംശയാസ്പദമായ ലക്ഷണങ്ങൾ ഉണ്ട്. വേഗത്തിൽ മറുപടി നൽകാതിരിക്കുന്നതാണ് സുരക്ഷിതം.',
        recommendedAction:
          'കുടുംബാംഗത്തോടോ ബാങ്കിനോടോ ചോദിച്ച ശേഷം മാത്രം തുടർനടപടി എടുക്കുക.',
      }
    : {
        explanation:
          'This message shows a few warning signs. Taking a quiet pause helps keep your money safe.',
        recommendedAction:
          'Check with a trusted family member or your bank branch before replying.',
      };
}
