import type { OfficialDomainEntry } from './types';

export interface UrlAnalysisResult {
  suspicious: boolean;
  strongFlags: string[];
  weakFlags: string[];
  matchedOfficialDomain: boolean;
  matchedSuspectNonOfficial: boolean;
  isApkDirectDownload: boolean;
}

const SHORTENER_HOSTS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'cutt.ly',
  'is.gd',
  'rb.gy',
  'shorturl.at',
  'ow.ly',
  'tiny.cc',
  'goo.gl',
]);

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.live', '.icu', '.cfd', '.sbs', '.tk', '.ml', '.gq', '.work', '.zip'];

const SENSITIVE_PATH_KEYWORDS = ['login', 'kyc', 'verify', 'reward', 'update', 'claim', 'refund', 'pay', 'upi', 'pan', 'aadhaar', 'challan'];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function isOfficialHost(host: string, officialDomains: OfficialDomainEntry[]): boolean {
  for (const entry of officialDomains) {
    for (const official of entry.hosts) {
      const lower = official.toLowerCase();
      if (host === lower || host.endsWith(`.${lower}`)) {
        return true;
      }
    }
  }
  return false;
}

function isLookalikeHost(host: string, officialDomains: OfficialDomainEntry[]): boolean {
  if (isOfficialHost(host, officialDomains)) return false;

  const hostCore = host.split('.')[0] ?? host;
  for (const entry of officialDomains) {
    const brandToken = entry.brand.toLowerCase();
    if (brandToken.length >= 3 && host.includes(brandToken)) {
      return true;
    }
    for (const officialHost of entry.hosts) {
      const officialCore = officialHost.split('.')[0] ?? officialHost;
      if (officialCore.length >= 4 && hostCore.length >= 4) {
        const dist = levenshtein(hostCore, officialCore);
        if (dist > 0 && dist <= 2) {
          return true;
        }
      }
    }
  }
  return false;
}

export function analyzeUrls(
  urls: string[],
  officialDomains: OfficialDomainEntry[],
): UrlAnalysisResult {
  const strongFlags: string[] = [];
  const weakFlags: string[] = [];
  let matchedOfficialDomain = false;
  let matchedSuspectNonOfficial = false;
  let isApkDirectDownload = false;

  for (const rawUrl of urls) {
    const withScheme = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    let parsed: URL;
    try {
      parsed = new URL(withScheme);
    } catch {
      continue;
    }

    const host = parsed.hostname.toLowerCase();
    const pathLower = `${parsed.pathname}${parsed.search}`.toLowerCase();
    const official = isOfficialHost(host, officialDomains) || host === 'play.google.com';

    if (official) {
      matchedOfficialDomain = true;
      continue;
    }

    // 1. Direct APK download on non-Play-Store domain
    if (pathLower.endsWith('.apk') || pathLower.includes('.apk?')) {
      isApkDirectDownload = true;
      if (!strongFlags.includes('url:apk_non_play')) strongFlags.push('url:apk_non_play');
      matchedSuspectNonOfficial = true;
    }

    // 2. IP-address host
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
      if (!strongFlags.includes('url:ip_host')) strongFlags.push('url:ip_host');
      matchedSuspectNonOfficial = true;
    }

    // 3. Explicit http:// (non-https) with sensitive path
    if (rawUrl.toLowerCase().startsWith('http://') && SENSITIVE_PATH_KEYWORDS.some((kw) => pathLower.includes(kw))) {
      if (!strongFlags.includes('url:insecure_http_sensitive')) strongFlags.push('url:insecure_http_sensitive');
      matchedSuspectNonOfficial = true;
    }

    // 4. Lookalike of an official brand/domain
    if (isLookalikeHost(host, officialDomains)) {
      if (!strongFlags.includes('url:brand_lookalike')) strongFlags.push('url:brand_lookalike');
      matchedSuspectNonOfficial = true;
    }

    // 5. Punycode xn--
    if (host.includes('xn--')) {
      if (!strongFlags.includes('url:punycode')) strongFlags.push('url:punycode');
      matchedSuspectNonOfficial = true;
    }

    // Weak flags
    if (SHORTENER_HOSTS.has(host)) {
      if (!weakFlags.includes('url:shortener')) weakFlags.push('url:shortener');
      matchedSuspectNonOfficial = true;
    }

    if (SUSPICIOUS_TLDS.some((tld) => host.endsWith(tld))) {
      if (!weakFlags.includes('url:suspicious_tld')) weakFlags.push('url:suspicious_tld');
      matchedSuspectNonOfficial = true;
    }

    const labels = host.split('.');
    const hyphenCount = (host.match(/-/g) ?? []).length;
    if (labels.length >= 4 || hyphenCount >= 3 || host.length > 35) {
      if (!weakFlags.includes('url:complex_host')) weakFlags.push('url:complex_host');
      matchedSuspectNonOfficial = true;
    }

    if (SENSITIVE_PATH_KEYWORDS.some((kw) => pathLower.includes(kw))) {
      if (!weakFlags.includes('url:sensitive_path')) weakFlags.push('url:sensitive_path');
      matchedSuspectNonOfficial = true;
    }
  }

  const suspicious = strongFlags.length > 0 || weakFlags.length >= 2;

  return {
    suspicious,
    strongFlags,
    weakFlags,
    matchedOfficialDomain,
    matchedSuspectNonOfficial,
    isApkDirectDownload,
  };
}
