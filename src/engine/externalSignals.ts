import { buildBilingualCopy, evaluateOverrides, maxVerdict, verdictFromScore } from './scanner';
import type {
  ExternalSignalInput,
  Indicator,
  RulePack,
  ScanResult,
  SignalId,
} from './types';

export function applyExternalSignals(
  result: ScanResult,
  externalSignals: ExternalSignalInput[],
  pack: RulePack,
): ScanResult {
  if (!externalSignals || externalSignals.length === 0) {
    return result;
  }

  const indicators: Indicator[] = [...result.indicators];
  let addedAny = false;

  for (const ext of externalSignals) {
    if (ext.signalId === 'LEGIT_CONTEXT') continue; // Raise-only: external signals cannot lower risk
    const ruleId = `ext:${ext.source}`;
    const alreadyExists = indicators.some(
      (i) => i.signalId === ext.signalId && i.matchedRuleId === ruleId,
    );
    if (alreadyExists) continue;

    const signalDef = pack.signals.find((s) => s.signalId === ext.signalId);
    const baseWeight = signalDef && signalDef.weight > 0 ? signalDef.weight : 20;

    // Only add weight if signalId is not already present (per-signal dedup)
    const signalAlreadyPresent = indicators.some((i) => i.signalId === ext.signalId);
    indicators.push({
      signalId: ext.signalId,
      weight: signalAlreadyPresent ? 0 : baseWeight,
      matchedRuleId: ruleId,
      evidenceType: 'external',
    });
    addedAny = true;
  }

  if (!addedAny) {
    return result;
  }

  const activeRiskSignals = new Set<SignalId>(
    indicators.filter((i) => i.signalId !== 'LEGIT_CONTEXT').map((i) => i.signalId),
  );

  const rawScore = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const clamped = Math.max(0, Math.min(100, Math.round(rawScore)));
  const { triggered, minScore, minVerdict } = evaluateOverrides(activeRiskSignals, pack.overrides);

  // Strictly raise-only: never lower score or verdict below baseline local result
  const finalScore = Math.max(result.score, clamped, minScore);
  let finalVerdict = maxVerdict(result.verdict, verdictFromScore(finalScore, pack));
  if (triggered.length > 0) {
    finalVerdict = maxVerdict(finalVerdict, minVerdict);
  }

  const mergedOverrides = Array.from(new Set([...result.overridesTriggered, ...triggered]));
  const copy = buildBilingualCopy(finalVerdict, indicators, pack);

  return {
    ...result,
    score: finalScore,
    verdict: finalVerdict,
    indicators,
    overridesTriggered: mergedOverrides,
    explanation: copy.explanation,
    recommendedAction: copy.recommendedAction,
    detectionMethod: 'HYBRID',
  };
}
