import defaultPackJson from './rulepacks/in-v1.json';
import { loadRulePack, validateRulePack, lintRulePackRegexes } from './rulepack.schema';
import type { RulePack } from './types';

export * from './types';
export { normaliseText } from './normaliser';
export { analyzeUrls } from './urlAnalyzer';
export { loadRulePack, validateRulePack, lintRulePackRegexes, RulePackSchema } from './rulepack.schema';
export { scan, verdictFromScore, maxVerdict, evaluateOverrides, buildBilingualCopy } from './scanner';
export { applyExternalSignals } from './externalSignals';
export { computeExposure } from './exposure';
export {
  classifyScamLocalAi,
  scanWithLocalAi,
  generateLocalPlainExplanation,
} from './localAi';

let cachedDefaultPack: RulePack | null = null;

export function getDefaultRulePack(): RulePack {
  if (!cachedDefaultPack) {
    cachedDefaultPack = loadRulePack(defaultPackJson);
  }
  return cachedDefaultPack;
}

export function getVersion(pack?: RulePack): string {
  return (pack ?? getDefaultRulePack()).version;
}
