export interface NormalisedTextResult {
  textNorm: string;
  digitsNorm: string;
  urls: string[];
  domains: string[];
}

const DESPACE_DICTIONARY = new Set([
  'otp',
  'kyc',
  'pin',
  'cvv',
  'upi',
  'atm',
  'pan',
  'aadhaar',
  'cbi',
  'rbi',
  'trai',
  'kseb',
  'rto',
  'apk',
  'sbi',
  'hdfc',
  'icici',
  'axis',
  'anydesk',
  'teamviewer',
  'quicksupport',
  'rustdesk',
  'fedex',
  'dhl',
  'bank',
  'police',
  'arrest',
  'warrant',
  'blocked',
  'urgent',
  'secret',
  'lottery',
  'prize',
  'refund',
  'verify',
  'transfer',
  'password',
  'mpin',
]);

const CYRILLIC_GREEK_CONFUSABLES: Record<string, string> = {
  '\u0430': 'a', // Cyrillic а
  '\u0435': 'e', // Cyrillic е
  '\u043E': 'o', // Cyrillic о
  '\u0440': 'p', // Cyrillic р
  '\u0441': 'c', // Cyrillic с
  '\u0445': 'x', // Cyrillic х
  '\u0443': 'y', // Cyrillic у
  '\u0456': 'i', // Cyrillic і
  '\u043A': 'k', // Cyrillic к
  '\u043C': 'm', // Cyrillic м
  '\u0442': 't', // Cyrillic т
  '\u043D': 'h', // Cyrillic н
  '\u0432': 'b', // Cyrillic в
  '\u03B1': 'a', // Greek α
  '\u03B5': 'e', // Greek ε
  '\u03BF': 'o', // Greek ο
  '\u03C1': 'p', // Greek ρ
  '\u03B9': 'i', // Greek ι
  '\u03BA': 'k', // Greek κ
};

const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
  '!': 'i',
};

const LEET_ALT_ONE_TO_L: Record<string, string> = {
  ...LEET_MAP,
  '1': 'l',
};

const MALAYALAM_CHILLU_LEGACY: Array<[RegExp, string]> = [
  [/\u0D23\u0D4D\u200D/g, '\u0D7A'], // ൺ
  [/\u0D28\u0D4D\u200D/g, '\u0D7B'], // ൻ
  [/\u0D30\u0D4D\u200D/g, '\u0D7C'], // ർ
  [/\u0D32\u0D4D\u200D/g, '\u0D7D'], // ൽ
  [/\u0D33\u0D4D\u200D/g, '\u0D7E'], // ൾ
  [/\u0D15\u0D4D\u200D/g, '\u0D7F'], // ൿ
];

function mapIndicDigits(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (code >= 0x0d66 && code <= 0x0d6f) {
      out += String.fromCharCode(0x30 + (code - 0x0d66));
    } else if (code >= 0x0966 && code <= 0x096f) {
      out += String.fromCharCode(0x30 + (code - 0x0966));
    } else {
      out += str[i];
    }
  }
  return out;
}

function canonicaliseMalayalam(str: string): string {
  let result = str;
  for (const [pattern, replacement] of MALAYALAM_CHILLU_LEGACY) {
    result = result.replace(pattern, replacement);
  }
  // Collapse repeated virama artifacts
  result = result.replace(/\u0D4D{2,}/g, '\u0D4D');
  return result;
}

function extractUrlsAndDomains(raw: string): { urls: string[]; domains: string[] } {
  const urlMatches = raw.match(/(?:https?:\/\/|www\.)[^\s<>"')]+|(?:[a-zA-Z0-9-]+\.)+(?:com|in|co\.in|org\.in|gov\.in|net|org|xyz|top|click|live|icu|cfd|sbs|tk|ml|gq|ly|gd|gy|at|info|biz|me|io|sbi|bank\.in)(?:\/[^\s<>"')]*)?/gi) ?? [];
  const urls: string[] = [];
  const domains: string[] = [];

  for (const candidate of urlMatches) {
    const cleaned = candidate.replace(/[.,!?;:]+$/, '');
    if (!cleaned) continue;
    const withScheme = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    try {
      const parsed = new URL(withScheme);
      const host = parsed.hostname.toLowerCase();
      if (host && host.includes('.')) {
        if (!urls.includes(cleaned)) urls.push(cleaned);
        if (!domains.includes(host)) domains.push(host);
      }
    } catch {
      // Ignore malformed URL-like fragments
    }
  }
  return { urls, domains };
}

function deobfuscateToken(token: string): string {
  // Replace Cyrillic/Greek confusables unconditionally inside Latin-mixed words
  let mapped = '';
  for (let i = 0; i < token.length; i += 1) {
    const ch = token[i];
    mapped += CYRILLIC_GREEK_CONFUSABLES[ch] ?? ch;
  }

  // Only map leetspeak digits/symbols if token mixes Latin letters AND digits/symbols
  const hasLetters = /[a-z]/.test(mapped);
  const hasLeetChars = /[013457@$!]/.test(mapped);
  if (!hasLetters || !hasLeetChars) {
    return mapped;
  }

  // Never alter URL tokens or standard reference IDs like "xx1234" or "rs500"
  if (/^(?:rs|inr|xx|txn|ref|id)[0-9]+$/i.test(mapped) || mapped.includes('://')) {
    return mapped;
  }

  let candidateA = '';
  let candidateB = '';
  for (let i = 0; i < mapped.length; i += 1) {
    const ch = mapped[i];
    candidateA += LEET_MAP[ch] ?? ch;
    candidateB += LEET_ALT_ONE_TO_L[ch] ?? ch;
  }

  if (DESPACE_DICTIONARY.has(candidateB)) return candidateB;
  if (DESPACE_DICTIONARY.has(candidateA)) return candidateA;
  // General obfuscated word like "bl0ck3d" or "p@yment" or "b@nk"
  return candidateA;
}

function collapseSpacedKeywords(text: string): string {
  // Join sequences of 3+ single Latin letters separated by space, dot, dash, or underscore
  return text.replace(/(?<![a-z0-9])([a-z](?:[\s._-]+[a-z]){2,14})(?![a-z0-9])/g, (full) => {
    const joined = full.replace(/[\s._-]+/g, '');
    if (DESPACE_DICTIONARY.has(joined)) {
      return joined;
    }
    return full;
  });
}

export function normaliseText(raw: string): NormalisedTextResult {
  // 1. Unicode NFKC
  let s = raw.normalize('NFKC');

  // 2. Canonicalise Malayalam chillus before stripping stray zero-width chars
  s = canonicaliseMalayalam(s);

  // 3. Remove zero-width characters
  s = s.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '');

  // 4. Lowercase Latin letters only
  s = s.replace(/[A-Z]/g, (c) => c.toLowerCase());

  // 5. Parallel Indic-to-ASCII digit conversion
  const digitsNorm = mapIndicDigits(s).replace(/\s+/g, ' ').trim();

  // 6. Extract URLs and domains before stripping decorative symbols
  const { urls, domains } = extractUrlsAndDomains(s);

  // 7. Strip decorative emojis/symbols (keep Latin, Indic letters & combining marks \p{M}, digits, basic punctuation)
  s = s.replace(/[^\p{L}\p{M}\p{N}\s.,:/\-_?@!$]/gu, ' ');

  // 8. Collapse repeated punctuation & whitespace
  s = s.replace(/([!?.,])\1+/g, '$1');
  s = s.replace(/\s+/g, ' ').trim();

  // 9. Collapse spaced-out dictionary keywords ("o t p", "k.y.c", "a n y d e s k")
  s = collapseSpacedKeywords(s);

  // 10. Obfuscation-only homoglyph & leetspeak mapping per token
  const tokens = s.split(' ').map((tok) => {
    if (tok.includes('://') || (tok.includes('.') && domains.some((d) => tok.includes(d)))) {
      return tok;
    }
    return deobfuscateToken(tok);
  });

  const textNorm = tokens.join(' ').replace(/\s+/g, ' ').trim();

  return {
    textNorm,
    digitsNorm,
    urls,
    domains,
  };
}
