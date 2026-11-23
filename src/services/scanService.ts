import {
  computeExposure,
  generateLocalPlainExplanation,
  getDefaultRulePack,
  getVersion,
  scanWithLocalAi,
  type ExposureReport,
  type Incident,
  type Language,
  type ScanInput,
  type ScanResult,
  type SignalId,
  type Verdict,
} from '../engine';
import { incidentStore } from './incidentStore';

export interface PerformedScan {
  incident: Incident;
  result: ScanResult;
}

function inferCategory(signalIds: SignalId[]): string {
  if (signalIds.includes('REMOTE_ACCESS')) return 'remote_access';
  if (signalIds.includes('APK_INSTALL')) return 'apk_malware';
  if (signalIds.includes('AUTHORITY_CLAIM') && signalIds.includes('URGENCY_THREAT')) {
    return 'digital_arrest_or_impersonation';
  }
  if (signalIds.includes('EMERGENCY_RELATIVE')) return 'emergency_relative';
  if (signalIds.includes('SENSITIVE_INFO_REQUEST')) return 'credential_otp_phishing';
  if (signalIds.includes('INVESTMENT_FRAUD')) return 'investment_task_fraud';
  if (signalIds.includes('PRIZE_LOTTERY')) return 'prize_lottery';
  if (signalIds.includes('MONEY_REQUEST')) return 'upi_payment_request';
  if (signalIds.includes('SUSPICIOUS_URL')) return 'suspicious_link';
  if (signalIds.includes('LEGIT_CONTEXT')) return 'legitimate_notice';
  return 'general_message';
}

export const scanService = {
  getRulePackVersion(): string {
    return getVersion();
  },

  async scanAndRecord(
    input: ScanInput,
    options?: { enableLocalAi?: boolean },
  ): Promise<PerformedScan> {
    const pack = getDefaultRulePack();
    const result = scanWithLocalAi(input, pack, {
      enableLocalAi: options?.enableLocalAi ?? true,
    });
    const signalIds = Array.from(new Set(result.indicators.map((i) => i.signalId)));

    const incident: Incident = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `inc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      scannedAt: result.scannedAt,
      score: result.score,
      verdict: result.verdict,
      category: inferCategory(signalIds),
      signalIds,
      detectionMethod: result.detectionMethod,
      rulePackVersion: result.rulePackVersion,
      reviewed: false,
      falsePositive: false,
      userOutcome: null,
    };

    const saved = await incidentStore.addIncident(incident);
    return { incident: saved, result };
  },

  computeExposureReport(incidents: Incident[]): ExposureReport {
    return computeExposure(incidents, new Date());
  },

  /**
   * 100% On-Device Plain-Language Explanation.
   * Executes synchronously inside the browser with zero network or cloud calls.
   */
  generateLocalExplanation(params: {
    signalIds: SignalId[];
    verdict: Verdict;
    language: Language;
  }): { explanation: string; recommendedAction: string } {
    return generateLocalPlainExplanation(params);
  },
};
