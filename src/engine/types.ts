export type Verdict = 'SAFE' | 'BE_CAREFUL' | 'DANGEROUS';

export type Language = 'en' | 'ml';

export type SignalId =
  | 'AUTHORITY_CLAIM'
  | 'URGENCY_THREAT'
  | 'SECRECY'
  | 'MONEY_REQUEST'
  | 'SENSITIVE_INFO_REQUEST'
  | 'REMOTE_ACCESS'
  | 'SUSPICIOUS_URL'
  | 'APK_INSTALL'
  | 'EMERGENCY_RELATIVE'
  | 'PRIZE_LOTTERY'
  | 'INVESTMENT_FRAUD'
  | 'LEGIT_CONTEXT';

export type EvidenceType = 'regex' | 'phrase' | 'domain' | 'external';

export interface Indicator {
  signalId: SignalId;
  weight: number;
  matchedRuleId: string;
  evidenceType: EvidenceType;
}

export type ScanSource = 'manual' | 'share' | 'notification' | 'call_sim';

export type DetectionMethod = 'LOCAL_RULES' | 'LOCAL_AI' | 'CLOUD_AI' | 'HYBRID';

export type UserOutcome = 'avoided' | 'interacted' | 'unsure' | null;

export interface ScanInput {
  text: string;
  source: ScanSource;
  language?: Language;
}

export interface BilingualText {
  en: string;
  ml: string;
}

export interface ScanResult {
  score: number;
  verdict: Verdict;
  indicators: Indicator[];
  overridesTriggered: string[];
  explanation: BilingualText;
  recommendedAction: BilingualText;
  detectionMethod: DetectionMethod;
  rulePackVersion: string;
  scannedAt: string;
  truncated?: boolean;
}

export interface Incident {
  id: string;
  scannedAt: string;
  score: number;
  verdict: Verdict;
  category: string;
  signalIds: SignalId[];
  detectionMethod: DetectionMethod;
  rulePackVersion: string;
  reviewed: boolean;
  falsePositive: boolean;
  userOutcome: UserOutcome;
  syncedAt?: string;
}

export type GuardianAlertStatus = 'pending' | 'delivered' | 'seen' | 'reviewed';

export interface GuardianAlert {
  id: string;
  elderId: string;
  elderName?: string;
  guardianId: string;
  guardianName?: string;
  incidentId: string;
  score: number;
  verdict: Verdict;
  category: string;
  signalIds: SignalId[];
  suggestedAction: string;
  channels: string[];
  createdAt: string;
  status: GuardianAlertStatus;
  userOutcome: UserOutcome;
  falsePositive: boolean;
  scannedAt: string;
}

export type RuleType = 'regex' | 'phrase' | 'domain';

export interface RuleDefinition {
  id: string;
  type: RuleType;
  pattern: string;
  languages: string[];
  notes: string;
}

export interface SignalDefinition {
  signalId: SignalId;
  weight: number;
  rules: RuleDefinition[];
}

export interface OverrideRule {
  id: string;
  requires: SignalId[];
  anyOf?: SignalId[];
  forceVerdict: Verdict;
  minScore: number;
  reason: string;
}

export interface OfficialDomainEntry {
  brand: string;
  hosts: string[];
  verifiedOn: string;
}

export interface TemplateEntry {
  en: string;
  ml: string;
  needsNativeReview: boolean;
}

export interface RulePack {
  version: string;
  updatedAt: string;
  thresholds: {
    carefulMin: number;
    dangerousMin: number;
  };
  officialDomains: OfficialDomainEntry[];
  signals: SignalDefinition[];
  overrides: OverrideRule[];
  templates: Record<string, TemplateEntry>;
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  regexWarnings: string[];
}

export interface ExternalSignalInput {
  signalId: SignalId;
  source: string;
  confidence: number;
}

export type ExposureLevel =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'NEEDS_ADDITIONAL_SUPPORT';

export type RiskTrend = 'UP' | 'STEADY' | 'DOWN' | 'INSUFFICIENT_DATA';

export interface ExposureReport {
  exposurePoints30d: number;
  exposureLevel: ExposureLevel;
  dangerousCount30d: number;
  carefulCount30d: number;
  interactedCount30d: number;
  protectionEffectivenessPct: number | null;
  reportedOutcomesCount: number;
  avoidedCount: number;
  riskTrend: RiskTrend;
  recent14dCount: number;
  previous14dCount: number;
  recommendationKeys: string[];
}
