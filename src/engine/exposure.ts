import type { ExposureLevel, ExposureReport, Incident, RiskTrend } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeExposure(incidents: Incident[], now: Date = new Date()): ExposureReport {
  const nowMs = now.getTime();
  const thirtyDaysAgo = nowMs - 30 * DAY_MS;
  const fourteenDaysAgo = nowMs - 14 * DAY_MS;
  const twentyEightDaysAgo = nowMs - 28 * DAY_MS;

  let dangerousCount30d = 0;
  let carefulCount30d = 0;
  let interactedCount30d = 0;

  let avoidedCount = 0;
  let reportedOutcomesCount = 0;

  let recent14dCount = 0;
  let previous14dCount = 0;

  for (const inc of incidents) {
    if (inc.falsePositive) continue;
    const t = Date.parse(inc.scannedAt);
    if (Number.isNaN(t)) continue;

    if (t >= thirtyDaysAgo && t <= nowMs) {
      if (inc.verdict === 'DANGEROUS') dangerousCount30d += 1;
      if (inc.verdict === 'BE_CAREFUL') carefulCount30d += 1;
      if (inc.userOutcome === 'interacted') interactedCount30d += 1;
    }

    if (inc.verdict === 'DANGEROUS' || inc.verdict === 'BE_CAREFUL') {
      if (inc.userOutcome === 'avoided' || inc.userOutcome === 'interacted') {
        reportedOutcomesCount += 1;
        if (inc.userOutcome === 'avoided') {
          avoidedCount += 1;
        }
      }
    }

    if (inc.verdict === 'DANGEROUS' || inc.verdict === 'BE_CAREFUL') {
      if (t >= fourteenDaysAgo && t <= nowMs) {
        recent14dCount += 1;
      } else if (t >= twentyEightDaysAgo && t < fourteenDaysAgo) {
        previous14dCount += 1;
      }
    }
  }

  const exposurePoints30d = 3 * dangerousCount30d + 1 * carefulCount30d;

  let exposureLevel: ExposureLevel = 'LOW';
  if (exposurePoints30d > 20 || interactedCount30d >= 3) {
    exposureLevel = 'NEEDS_ADDITIONAL_SUPPORT';
  } else if (exposurePoints30d >= 9) {
    exposureLevel = 'HIGH';
  } else if (exposurePoints30d >= 3) {
    exposureLevel = 'MODERATE';
  }

  // Self-reported effectiveness: minimum 5 outcomes required
  const protectionEffectivenessPct =
    reportedOutcomesCount >= 5
      ? Math.round((avoidedCount / reportedOutcomesCount) * 100)
      : null;

  // Risk trend: compare last 14d vs previous 14d; insufficient below 3 in both periods
  let riskTrend: RiskTrend = 'STEADY';
  if (recent14dCount < 3 && previous14dCount < 3) {
    riskTrend = 'INSUFFICIENT_DATA';
  } else if (previous14dCount === 0) {
    riskTrend = recent14dCount >= 3 ? 'UP' : 'STEADY';
  } else {
    const ratio = (recent14dCount - previous14dCount) / previous14dCount;
    if (ratio > 0.25) riskTrend = 'UP';
    else if (ratio < -0.25) riskTrend = 'DOWN';
    else riskTrend = 'STEADY';
  }

  const recommendationKeys: string[] = [];
  if (exposureLevel === 'HIGH' || exposureLevel === 'NEEDS_ADDITIONAL_SUPPORT') {
    recommendationKeys.push('rec_family_assisted_checking');
    recommendationKeys.push('rec_extra_support');
  }
  if (exposureLevel !== 'LOW' || riskTrend === 'UP') {
    recommendationKeys.push('rec_learning_lessons');
  }
  if (recommendationKeys.length === 0) {
    recommendationKeys.push('rec_stay_alert');
  }

  return {
    exposurePoints30d,
    exposureLevel,
    dangerousCount30d,
    carefulCount30d,
    interactedCount30d,
    protectionEffectivenessPct,
    reportedOutcomesCount,
    avoidedCount,
    riskTrend,
    recent14dCount,
    previous14dCount,
    recommendationKeys,
  };
}
