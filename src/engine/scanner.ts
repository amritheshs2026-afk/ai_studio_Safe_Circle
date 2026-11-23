import { normaliseText } from './normaliser';
import { analyzeUrls } from './urlAnalyzer';
import type {
  BilingualText,
  Indicator,
  OverrideRule,
  RuleDefinition,
  RulePack,
  ScanInput,
  ScanResult,
  SignalId,
  Verdict,
} from './types';

const MAX_INPUT_CHARS = 5000;
const DEFAULT_TIME_BUDGET_MS = 150;

const VERDICT_RANK: Record<Verdict, number> = {
  SAFE: 0,
  BE_CAREFUL: 1,
  DANGEROUS: 2,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function verdictFromScore(score: number, pack: RulePack): Verdict {
  if (score >= pack.thresholds.dangerousMin) return 'DANGEROUS';
  if (score >= pack.thresholds.carefulMin) return 'BE_CAREFUL';
  return 'SAFE';
}

export function maxVerdict(a: Verdict, b: Verdict): Verdict {
  return VERDICT_RANK[a] >= VERDICT_RANK[b] ? a : b;
}

function isNegatedSensitiveContext(text: string, matchIndex: number): boolean {
  const prefix = text.slice(Math.max(0, matchIndex - 42), matchIndex);
  if (
    /\b(never|do not|don't|dont|should not|avoid|not to|mat)\b/.test(prefix) ||
    /(അരുത്|പങ്കുവയ്ക്കരുത്|parayaruthu|cheyyaruthu)/.test(prefix)
  ) {
    return true;
  }
  return false;
}

function matchRule(
  rule: RuleDefinition,
  textNorm: string,
  digitsNorm: string,
  signalId: SignalId,
): boolean {
  if (rule.type === 'domain') return false;

  const target = signalId === 'LEGIT_CONTEXT' ? digitsNorm : textNorm;

  if (rule.type === 'phrase') {
    const p = rule.pattern.toLowerCase();
    const idx = target.indexOf(p);
    if (idx === -1) return false;
    if (signalId === 'SENSITIVE_INFO_REQUEST' && isNegatedSensitiveContext(target, idx)) {
      return false;
    }
    return true;
  }

  try {
    const regex = new RegExp(rule.pattern, 'iu');
    const match = regex.exec(target);
    if (!match) return false;
    if (signalId === 'SENSITIVE_INFO_REQUEST' && isNegatedSensitiveContext(target, match.index)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function evaluateOverrides(
  activeSignals: Set<SignalId>,
  overrides: OverrideRule[],
): { triggered: string[]; minScore: number; minVerdict: Verdict } {
  const triggered: string[] = [];
  let minScore = 0;
  let minVerdict: Verdict = 'SAFE';

  for (const ov of overrides) {
    const hasAllRequired = ov.requires.every((req) => activeSignals.has(req));
    if (!hasAllRequired) continue;

    if (ov.anyOf && ov.anyOf.length > 0) {
      const hasAny = ov.anyOf.some((opt) => activeSignals.has(opt));
      if (!hasAny) continue;
    }

    triggered.push(ov.id);
    if (ov.minScore > minScore) {
      minScore = ov.minScore;
    }
    minVerdict = maxVerdict(minVerdict, ov.forceVerdict);
  }

  return { triggered, minScore, minVerdict };
}

export function buildBilingualCopy(
  verdict: Verdict,
  indicators: Indicator[],
  pack: RulePack,
): { explanation: BilingualText; recommendedAction: BilingualText } {
  const verdictKey = `VERDICT_${verdict}`;
  const actionKey = `ACTION_${verdict}`;

  const verdictTmpl = pack.templates[verdictKey] ?? {
    en: 'Check carefully before taking action.',
    ml: 'നടപടി എടുക്കുന്നതിന് മുമ്പ് ശ്രദ്ധയോടെ പരിശോധിക്കുക.',
    needsNativeReview: true,
  };
  const actionTmpl = pack.templates[actionKey] ?? {
    en: 'Verify with your family or bank.',
    ml: 'കുടുംബാംഗങ്ങളുമായോ ബാങ്കുമായോ ഉറപ്പുവരുത്തുക.',
    needsNativeReview: true,
  };

  const riskIndicators = [...indicators]
    .filter((ind) => ind.signalId !== 'LEGIT_CONTEXT')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const enTactics = riskIndicators
    .map((ind) => pack.templates[ind.signalId]?.en)
    .filter((v): v is string => Boolean(v));
  const mlTactics = riskIndicators
    .map((ind) => pack.templates[ind.signalId]?.ml)
    .filter((v): v is string => Boolean(v));

  const enExplanation =
    enTactics.length > 0
      ? `${verdictTmpl.en} Signs noticed: ${enTactics.join('; ')}.`
      : verdictTmpl.en;

  const mlExplanation =
    mlTactics.length > 0
      ? `${verdictTmpl.ml} കണ്ടെത്തിയ ലക്ഷണങ്ങൾ: ${mlTactics.join('; ')}.`
      : verdictTmpl.ml;

  const needsHelplineNote = indicators.some(
    (i) => i.signalId === 'MONEY_REQUEST' || i.signalId === 'SENSITIVE_INFO_REQUEST',
  );
  const helpline = pack.templates.HELPLINE_1930;

  const enAction =
    needsHelplineNote && helpline ? `${actionTmpl.en} ${helpline.en}` : actionTmpl.en;
  const mlAction =
    needsHelplineNote && helpline ? `${actionTmpl.ml} ${helpline.ml}` : actionTmpl.ml;

  return {
    explanation: { en: enExplanation, ml: mlExplanation },
    recommendedAction: { en: enAction, ml: mlAction },
  };
}

export function scan(
  input: ScanInput,
  pack: RulePack,
  options?: { timeBudgetMs?: number },
): ScanResult {
  const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const budgetMs = options?.timeBudgetMs ?? DEFAULT_TIME_BUDGET_MS;
  const scannedAt = new Date().toISOString();

  const rawText = typeof input.text === 'string' ? input.text : '';
  const trimmed = rawText.trim();

  if (!trimmed) {
    const copy = buildBilingualCopy('SAFE', [], pack);
    return {
      score: 0,
      verdict: 'SAFE',
      indicators: [],
      overridesTriggered: [],
      explanation: copy.explanation,
      recommendedAction: copy.recommendedAction,
      detectionMethod: 'LOCAL_RULES',
      rulePackVersion: pack.version,
      scannedAt,
    };
  }

  const truncated = trimmed.length > MAX_INPUT_CHARS;
  const boundedText = truncated ? trimmed.slice(0, MAX_INPUT_CHARS) : trimmed;

  const { textNorm, digitsNorm, urls } = normaliseText(boundedText);
  const urlAnalysis = analyzeUrls(urls, pack.officialDomains);

  const indicators: Indicator[] = [];
  const activeRiskSignals = new Set<SignalId>();

  let budgetExceeded = false;

  // Evaluate non-LEGIT signals first
  for (const signalDef of pack.signals) {
    if (signalDef.signalId === 'LEGIT_CONTEXT') continue;

    const elapsed =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startMs;
    if (elapsed > budgetMs) {
      budgetExceeded = true;
      break;
    }

    if (signalDef.signalId === 'SUSPICIOUS_URL') {
      if (urlAnalysis.suspicious) {
        activeRiskSignals.add('SUSPICIOUS_URL');
        indicators.push({
          signalId: 'SUSPICIOUS_URL',
          weight: signalDef.weight,
          matchedRuleId: urlAnalysis.strongFlags[0] ?? urlAnalysis.weakFlags[0] ?? 'url:heuristic',
          evidenceType: 'domain',
        });
      }
      continue;
    }

    for (const rule of signalDef.rules) {
      // APK_INSTALL should not trigger if only Play Store URLs are present with no .apk filename
      if (
        signalDef.signalId === 'APK_INSTALL' &&
        urls.length > 0 &&
        !urlAnalysis.isApkDirectDownload &&
        urls.every((u) => u.toLowerCase().includes('play.google.com')) &&
        !/\.apk\b/i.test(textNorm)
      ) {
        continue;
      }

      if (matchRule(rule, textNorm, digitsNorm, signalDef.signalId)) {
        activeRiskSignals.add(signalDef.signalId);
        indicators.push({
          signalId: signalDef.signalId,
          weight: signalDef.weight,
          matchedRuleId: rule.id,
          evidenceType: rule.type === 'domain' ? 'domain' : rule.type === 'phrase' ? 'phrase' : 'regex',
        });
        break; // De-duplicate: one count per signal
      }
    }
  }

  if (budgetExceeded) {
    return {
      score: pack.thresholds.carefulMin,
      verdict: 'BE_CAREFUL',
      indicators,
      overridesTriggered: [],
      explanation: {
        en: 'This message took longer than expected to inspect. Please check carefully before acting.',
        ml: 'ഈ സന്ദേശം പരിശോധിക്കാൻ സാധാരണയിലും കൂടുതൽ സമയം എടുത്തു. നടപടി എടുക്കുന്നതിന് മുമ്പ് ശ്രദ്ധയോടെ പരിശോധിക്കുക.',
      },
      recommendedAction: pack.templates.ACTION_BE_CAREFUL
        ? { en: pack.templates.ACTION_BE_CAREFUL.en, ml: pack.templates.ACTION_BE_CAREFUL.ml }
        : {
            en: 'Verify with your family or bank before replying.',
            ml: 'മറുപടി നൽകുന്നതിന് മുമ്പ് കുടുംബത്തോടോ ബാങ്കിനോടോ ചോദിക്കുക.',
          },
      detectionMethod: 'LOCAL_RULES',
      rulePackVersion: pack.version,
      scannedAt,
      truncated,
    };
  }

  // Escalate single weak URL flag (e.g. URL shortener) when paired with another risk signal
  if (
    !activeRiskSignals.has('SUSPICIOUS_URL') &&
    urlAnalysis.weakFlags.length === 1 &&
    activeRiskSignals.size > 0
  ) {
    const urlSignalDef = pack.signals.find((s) => s.signalId === 'SUSPICIOUS_URL');
    activeRiskSignals.add('SUSPICIOUS_URL');
    indicators.push({
      signalId: 'SUSPICIOUS_URL',
      weight: urlSignalDef?.weight ?? 20,
      matchedRuleId: urlAnalysis.weakFlags[0],
      evidenceType: 'domain',
    });
  }

  // Evaluate LEGIT_CONTEXT subject to section 8 restrictions
  const legitDef = pack.signals.find((s) => s.signalId === 'LEGIT_CONTEXT');
  if (legitDef && !urlAnalysis.matchedSuspectNonOfficial) {
    let legitMatchedRuleId: string | null = null;
    for (const rule of legitDef.rules) {
      if (matchRule(rule, textNorm, digitsNorm, 'LEGIT_CONTEXT')) {
        legitMatchedRuleId = rule.id;
        break;
      }
    }
    if (!legitMatchedRuleId && urlAnalysis.matchedOfficialDomain && activeRiskSignals.size === 0) {
      legitMatchedRuleId = 'legit:official_domain';
    }
    if (legitMatchedRuleId) {
      indicators.push({
        signalId: 'LEGIT_CONTEXT',
        weight: Math.max(-20, legitDef.weight),
        matchedRuleId: legitMatchedRuleId,
        evidenceType: legitMatchedRuleId.startsWith('legit:') ? 'domain' : 'regex',
      });
    }
  }

  // Additive score clamped 0..100
  const rawScore = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  let score = clampScore(rawScore);

  // Single non-override risk signal alone cannot produce DANGEROUS unless pack explicitly allows
  const { triggered, minScore, minVerdict } = evaluateOverrides(activeRiskSignals, pack.overrides);
  if (triggered.length > 0) {
    score = Math.max(score, minScore);
  }

  let verdict = verdictFromScore(score, pack);
  if (triggered.length > 0) {
    verdict = maxVerdict(verdict, minVerdict);
  } else if (activeRiskSignals.size <= 1 && verdict === 'DANGEROUS') {
    verdict = 'BE_CAREFUL';
    score = Math.min(score, pack.thresholds.dangerousMin - 1);
  }

  const copy = buildBilingualCopy(verdict, indicators, pack);

  return {
    score,
    verdict,
    indicators,
    overridesTriggered: triggered,
    explanation: copy.explanation,
    recommendedAction: copy.recommendedAction,
    detectionMethod: 'LOCAL_RULES',
    rulePackVersion: pack.version,
    scannedAt,
    ...(truncated ? { truncated: true } : {}),
  };
}
