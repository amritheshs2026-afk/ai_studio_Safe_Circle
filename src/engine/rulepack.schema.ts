import { z } from 'zod';
import type { RulePack, ValidationReport } from './types';

const SignalIdSchema = z.enum([
  'AUTHORITY_CLAIM',
  'URGENCY_THREAT',
  'SECRECY',
  'MONEY_REQUEST',
  'SENSITIVE_INFO_REQUEST',
  'REMOTE_ACCESS',
  'SUSPICIOUS_URL',
  'APK_INSTALL',
  'EMERGENCY_RELATIVE',
  'PRIZE_LOTTERY',
  'INVESTMENT_FRAUD',
  'LEGIT_CONTEXT',
]);

const VerdictSchema = z.enum(['SAFE', 'BE_CAREFUL', 'DANGEROUS']);

const RuleSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['regex', 'phrase', 'domain']),
  pattern: z.string().min(1),
  languages: z.array(z.string().min(1)).min(1),
  notes: z.string(),
});

const SignalSchema = z.object({
  signalId: SignalIdSchema,
  weight: z.number().int().min(-50).max(50),
  rules: z.array(RuleSchema),
});

const OverrideSchema = z.object({
  id: z.string().min(1),
  requires: z.array(SignalIdSchema).min(1),
  anyOf: z.array(SignalIdSchema).optional(),
  forceVerdict: VerdictSchema,
  minScore: z.number().int().min(0).max(100),
  reason: z.string().min(1),
});

const OfficialDomainSchema = z.object({
  brand: z.string().min(1),
  hosts: z.array(z.string().min(1)).min(1),
  verifiedOn: z.string().min(1),
});

const TemplateSchema = z.object({
  en: z.string().min(1),
  ml: z.string().min(1),
  needsNativeReview: z.boolean(),
});

export const RulePackSchema = z.object({
  version: z.string().min(1),
  updatedAt: z.string().min(1),
  thresholds: z.object({
    carefulMin: z.number().int().min(1).max(99),
    dangerousMin: z.number().int().min(2).max(100),
  }),
  officialDomains: z.array(OfficialDomainSchema),
  signals: z.array(SignalSchema).min(1),
  overrides: z.array(OverrideSchema),
  templates: z.record(z.string(), TemplateSchema),
});

const DISALLOWED_REGEX_PATTERNS: Array<{ test: RegExp; reason: string }> = [
  { test: /\(\?<[=!]/, reason: 'Lookbehind assertions (?<= / ?<!) are not portable across JS and Java regex.' },
  { test: /\(\?<[a-zA-Z_][a-zA-Z0-9_]*>/, reason: 'Named capture groups are not portable.' },
  { test: /\\[1-9]/, reason: 'Backreferences are not portable or ReDoS-safe.' },
  { test: /[+*?]\+/, reason: 'Possessive quantifiers are not supported in JavaScript.' },
  { test: /\([^)]*[+*][^)]*\)[+*]/, reason: 'Nested unbounded quantifiers risk catastrophic ReDoS backtracking.' },
];

export function lintRulePackRegexes(pack: RulePack): string[] {
  const warnings: string[] = [];
  for (const sig of pack.signals) {
    for (const rule of sig.rules) {
      if (rule.type !== 'regex') continue;
      for (const check of DISALLOWED_REGEX_PATTERNS) {
        if (check.test.test(rule.pattern)) {
          warnings.push(`Rule ${rule.id}: ${check.reason}`);
        }
      }
      try {
        new RegExp(rule.pattern, 'iu');
      } catch (err) {
        warnings.push(`Rule ${rule.id}: Invalid regex (${err instanceof Error ? err.message : 'parse error'}).`);
      }
    }
  }
  return warnings;
}

export function validateRulePack(json: unknown): ValidationReport {
  const parsed = RulePackSchema.safeParse(json);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      regexWarnings: [],
    };
  }

  const pack = parsed.data as RulePack;
  const errors: string[] = [];
  if (pack.thresholds.carefulMin >= pack.thresholds.dangerousMin) {
    errors.push('thresholds.carefulMin must be strictly less than thresholds.dangerousMin.');
  }

  const regexWarnings = lintRulePackRegexes(pack);
  return {
    valid: errors.length === 0 && regexWarnings.length === 0,
    errors,
    regexWarnings,
  };
}

export function loadRulePack(json: unknown): RulePack {
  const report = validateRulePack(json);
  if (!report.valid) {
    const allErrors = [...report.errors, ...report.regexWarnings].join('; ');
    throw new Error(`Invalid SafeCircle rule pack: ${allErrors}`);
  }
  return json as RulePack;
}
