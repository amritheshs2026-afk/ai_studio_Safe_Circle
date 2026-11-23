import { describe, expect, it } from 'vitest';
import {
  applyExternalSignals,
  classifyScamLocalAi,
  computeExposure,
  generateLocalPlainExplanation,
  getDefaultRulePack,
  lintRulePackRegexes,
  normaliseText,
  scan,
  scanWithLocalAi,
  validateRulePack,
  type Incident,
} from '../engine';

interface LabeledSample {
  id: string;
  split: 'tune' | 'heldout';
  expectedScam: boolean;
  expectedVerdict?: 'SAFE' | 'BE_CAREFUL' | 'DANGEROUS';
  lang: 'en' | 'ml' | 'manglish' | 'hinglish';
  category: string;
  text: string;
}

const SYNTHETIC_DATASET: LabeledSample[] = [
  // ================= TUNE SPLIT (scams + legit + hard negatives) =================
  {
    id: 't-dig-1',
    split: 'tune',
    expectedScam: true,
    expectedVerdict: 'DANGEROUS',
    lang: 'en',
    category: 'digital_arrest',
    text: 'This is CBI Mumbai Cyber Cell. Arrest warrant issued for your Aadhaar parcel. Stay on video call, do not tell anyone, and transfer Rs 50000 to RBI safe account.',
  },
  {
    id: 't-dig-2',
    split: 'tune',
    expectedScam: true,
    lang: 'en',
    category: 'digital_arrest',
    text: 'TRAI and Narcotics Control Bureau calling. Your SIM is blocked in money laundering case. Remain in digital arrest and pay Rs 25000 immediately.',
  },
  {
    id: 't-kyc-1',
    split: 'tune',
    expectedScam: true,
    lang: 'en',
    category: 'fake_kyc',
    text: 'Urgent: Your SBI bank account will be blocked tonight. Update KYC and enter OTP and ATM PIN on http://sbi-kyc-verify.xyz immediately.',
  },
  {
    id: 't-kyc-2',
    split: 'tune',
    expectedScam: true,
    lang: 'en',
    category: 'fake_kyc',
    text: 'Your KSEB electricity connection will be disconnected tonight. Call our officer and share your UPI PIN or pay Rs 10 via https://kseb-pay-now.top',
  },
  {
    id: 't-rem-1',
    split: 'tune',
    expectedScam: true,
    expectedVerdict: 'DANGEROUS',
    lang: 'en',
    category: 'remote_access',
    text: 'Bank customer care here. Install AnyDesk screen sharing app and tell me the 9-digit code so I can refund Rs 4500 to your account.',
  },
  {
    id: 't-apk-1',
    split: 'tune',
    expectedScam: true,
    expectedVerdict: 'DANGEROUS',
    lang: 'en',
    category: 'apk_malware',
    text: 'RTO Challan pending Rs 2000. Download and install rto_challan.apk from http://parivahan-pay.cfd today to avoid court warrant.',
  },
  {
    id: 't-rel-1',
    split: 'tune',
    expectedScam: true,
    expectedVerdict: 'DANGEROUS',
    lang: 'en',
    category: 'emergency_relative',
    text: 'Hi Amma, lost my phone so using a new number. I am in hospital after an accident and need Rs 18000 via UPI urgently. Do not tell Dad.',
  },
  {
    id: 't-inv-1',
    split: 'tune',
    expectedScam: true,
    lang: 'en',
    category: 'investment_fraud',
    text: 'Join VIP trading group for guaranteed returns and double your money in 48 hours. Send Rs 5000 via GPay today.',
  },
  {
    id: 't-prz-1',
    split: 'tune',
    expectedScam: true,
    lang: 'en',
    category: 'prize_lottery',
    text: 'Congratulations you won KBC lottery Rs 25 lakh! Pay Rs 3500 processing fee via UPI to claim your reward today.',
  },
  {
    id: 't-ml-1',
    split: 'tune',
    expectedScam: true,
    lang: 'ml',
    category: 'malayalam_scam',
    text: 'ഞാൻ സിബിഐ ഓഫീസർ ആണ്. നിങ്ങളുടെ പേരിൽ അറസ്റ്റ് വാറന്റ് ഉണ്ട്. ആരോടും പറയരുത്, ഉടനെ പണം അയക്കുക.',
  },
  {
    id: 't-ml-2',
    split: 'tune',
    expectedScam: true,
    lang: 'ml',
    category: 'malayalam_scam',
    text: 'നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ട് ഇന്ന് ബ്ലോക്ക് ആകും. കെവൈസി അപ്‌ഡേറ്റ് ചെയ്യാൻ ഒടിപിയും പിൻ നമ്പറും ഉടനെ പറയൂ.',
  },
  {
    id: 't-mgl-1',
    split: 'tune',
    expectedScam: true,
    lang: 'manglish',
    category: 'manglish_scam',
    text: 'Njan police station il ninnanu. Ningalude account block aavum, aarodum parayaruthu, OTP ippol thanne parayuka.',
  },
  {
    id: 't-hgl-1',
    split: 'tune',
    expectedScam: true,
    lang: 'hinglish',
    category: 'hinglish_scam',
    text: 'Aapka bank account band ho jayega. Police officer bol raha hoon, kisi ko mat batana, turant OTP bhejo aur paise transfer karo.',
  },
  {
    id: 't-obf-1',
    split: 'tune',
    expectedScam: true,
    lang: 'en',
    category: 'adversarial_obfuscated',
    text: 'Urg3nt b@nk notice! Share your O T P and P I N right now or account bl0ck3d! Do not t3ll anyone and send r s 5000 via https://verify-sbi-alert.xyz',
  },
  // Legitimate tune messages
  {
    id: 't-legit-otp-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'legit_otp',
    text: 'Your OTP is 482913 for transaction of Rs 1,250 at BigBasket. Never share your OTP or PIN with anyone. -SBI',
  },
  {
    id: 't-legit-bank-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'legit_bank_alert',
    text: 'A/c XX4821 debited for Rs 540.00 on 22-11-26. Avl Bal Rs 24,180.50. Never share OTP with anyone.',
  },
  {
    id: 't-legit-gov-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'legit_gov',
    text: 'Aadhaar update appointment reminder: visit your nearest Seva Kendra or check status on https://uidai.gov.in.',
  },
  {
    id: 't-legit-ml-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'ml',
    category: 'legit_ml',
    text: 'നിങ്ങളുടെ വൈദ്യുതി ബിൽ കൺസ്യൂമർ നമ്പർ 114582910 പ്രകാരം 640 രൂപയാണ്. https://kseb.in വഴി അടയ്ക്കാം.',
  },
  {
    id: 't-legit-ml-2',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'ml',
    category: 'legit_ml_otp',
    text: 'നിങ്ങളുടെ ഒടിപി 592014 ആണ്. ഒടിപി ആരോടും പങ്കുവയ്ക്കരുത്.',
  },
  {
    id: 't-legit-mgl-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'manglish',
    category: 'legit_manglish',
    text: 'Ningalude OTP 739201 aanu. OTP aarodum parayaruthu. A/c XX9012 Avl Bal Rs 12,400.',
  },
  {
    id: 't-hn-news-1',
    split: 'tune',
    expectedScam: false,
    lang: 'en',
    category: 'hard_negative_news',
    text: 'Advisory from Kerala Police Cyber Dome: Stay aware of fake video calls. Real officers never demand money over phone. Read safety tips on https://keralapolice.gov.in.',
  },
  {
    id: 't-hn-med-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'hard_negative_pharmacy',
    text: 'Urgent reminder from City Pharmacy: Your monthly blood pressure medicine refill is ready for pickup at our counter.',
  },
  {
    id: 't-hn-rent-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'hard_negative_rental',
    text: 'Reminder to submit the tenant police verification form at the local station or https://keralapolice.gov.in. No payment is required.',
  },
  {
    id: 't-hn-rel-1',
    split: 'tune',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'hard_negative_relative',
    text: 'Hi Amma, reached home safely from Kochi. Will call you and Dad after dinner tonight.',
  },

  // ================= HELDOUT SPLIT (~30%, evaluated blindly) =================
  {
    id: 'h-dig-1',
    split: 'heldout',
    expectedScam: true,
    lang: 'en',
    category: 'digital_arrest',
    text: 'Enforcement Directorate cyber wing notice. Your Aadhaar linked to illegal parcel. Keep this confidential, do not tell family, and wire Rs 90000 immediately to avoid arrest.',
  },
  {
    id: 'h-rem-1',
    split: 'heldout',
    expectedScam: true,
    lang: 'en',
    category: 'remote_access',
    text: 'This is merchant support. To receive your Rs 2000 refund, download TeamViewer QuickSupport and share your 9-digit code right away.',
  },
  {
    id: 'h-apk-1',
    split: 'heldout',
    expectedScam: true,
    lang: 'en',
    category: 'apk_malware',
    text: 'PM Kisan beneficiary list updated. Download and install pm_kisan_2026.apk from http://kisan-claim.top urgently.',
  },
  {
    id: 'h-ml-1',
    split: 'heldout',
    expectedScam: true,
    lang: 'ml',
    category: 'malayalam_scam',
    text: 'ലോട്ടറി അടിച്ചു! 10 ലക്ഷം രൂപ സമ്മാനം കൈപ്പറ്റാൻ ഇന്ന് തന്നെ 2500 രൂപ ഫീസ് യുപിഐ വഴി അയക്കുക.',
  },
  {
    id: 'h-mgl-1',
    split: 'heldout',
    expectedScam: true,
    lang: 'manglish',
    category: 'manglish_scam',
    text: 'Ningalude KSEB current innu rathri cut aakum. Udaney AnyDesk install cheyyuka allengil http://kseb-quickpay.xyz linkil click cheythu Rs 1000 ayakkuka.',
  },
  {
    id: 'h-obf-1',
    split: 'heldout',
    expectedScam: true,
    lang: 'en',
    category: 'adversarial_obfuscated',
    text: 'C\u200DB\u200DI cyber notice: аrrest wаrrаnt issued. D0 not t3ll аnyone and pаy Rs 40000 via UPI right n0w.',
  },
  {
    id: 'h-legit-otp-1',
    split: 'heldout',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'legit_otp',
    text: 'Verification code is 619044 for your HDFC netbanking login. Bank will never ask for OTP or CVV. Do not share with anyone.',
  },
  {
    id: 'h-legit-bank-1',
    split: 'heldout',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'legit_bank_alert',
    text: 'Account ending XX9042 credited with Rs 15,000.00 towards monthly pension. Available balance Rs 48,210.00.',
  },
  {
    id: 'h-legit-ml-1',
    split: 'heldout',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'ml',
    category: 'legit_ml',
    text: 'അക്കൗണ്ടിൽ നിന്ന് 850 രൂപ കുറവ് ചെയ്തു. ബാലൻസ് 14200 രൂപ. ഒടിപി ആരോടും പങ്കുവയ്ക്കരുത്.',
  },
  {
    id: 'h-legit-play-1',
    split: 'heldout',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'hard_negative_play_store',
    text: 'Download our updated clinic appointment app on https://play.google.com/store/apps/details?id=in.hospital.app',
  },
  {
    id: 'h-hn-2',
    split: 'heldout',
    expectedScam: false,
    expectedVerdict: 'SAFE',
    lang: 'en',
    category: 'hard_negative_hospital',
    text: 'Appointment reminder: Your OPD token 18 for eye checkup is tomorrow at 10 AM at District Hospital.',
  },
];

function evaluateSplit(samples: LabeledSample[]) {
  const pack = getDefaultRulePack();
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  const misses: Array<{ id: string; expectedScam: boolean; gotVerdict: string; score: number }> = [];

  for (const s of samples) {
    const res = scan({ text: s.text, source: 'manual', language: s.lang === 'ml' ? 'ml' : 'en' }, pack);
    const predictedScam = res.verdict === 'BE_CAREFUL' || res.verdict === 'DANGEROUS';
    if (s.expectedScam && predictedScam) tp += 1;
    else if (!s.expectedScam && predictedScam) {
      fp += 1;
      misses.push({ id: s.id, expectedScam: s.expectedScam, gotVerdict: res.verdict, score: res.score });
    } else if (!s.expectedScam && !predictedScam) tn += 1;
    else {
      fn += 1;
      misses.push({ id: s.id, expectedScam: s.expectedScam, gotVerdict: res.verdict, score: res.score });
    }
  }

  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const fpr = fp + tn === 0 ? 0 : fp / (fp + tn);
  const fnr = fn + tp === 0 ? 0 : fn / (fn + tp);

  return { total: samples.length, tp, fp, tn, fn, precision, recall, fpr, fnr, misses };
}

describe('SafeCircle Detection Engine', () => {
  const pack = getDefaultRulePack();

  it('validates bundled rule pack schema and regex portability', () => {
    const report = validateRulePack(pack);
    expect(report.valid).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.regexWarnings).toEqual([]);
    expect(lintRulePackRegexes(pack)).toEqual([]);
  });

  it('normalises Malayalam chillu, Indic digits, zero-width chars, spaced keywords, and obfuscated homoglyphs', () => {
    const chilluLegacy = '\u0D28\u0D4D\u200D'; // legacy ൻ
    const normChillu = normaliseText(chilluLegacy);
    expect(normChillu.textNorm).toBe('\u0D7B');

    const indicDigits = normaliseText('ഒടിപി ൪൮൨൯൧൩ और ५०००');
    expect(indicDigits.digitsNorm).toContain('482913');
    expect(indicDigits.digitsNorm).toContain('5000');

    const spaced = normaliseText('Share your O T P and K.Y.C right now');
    expect(spaced.textNorm).toContain('otp');
    expect(spaced.textNorm).toContain('kyc');

    const homoglyph = normaliseText('Urgent C\u200DB\u200DI аrrest wаrrаnt pаy');
    expect(homoglyph.textNorm).toContain('cbi');
    expect(homoglyph.textNorm).toContain('arrest');
    expect(homoglyph.textNorm).toContain('warrant');
    expect(homoglyph.textNorm).toContain('pay');
  });

  it('OTP delivery message never triggers SENSITIVE_INFO_REQUEST and scores SAFE', () => {
    const res = scan(
      {
        text: 'Your OTP is 482913 for transaction of Rs 1250 at BigBasket. Never share your OTP with anyone.',
        source: 'manual',
      },
      pack,
    );
    const sigs = res.indicators.map((i) => i.signalId);
    expect(sigs).not.toContain('SENSITIVE_INFO_REQUEST');
    expect(res.verdict).toBe('SAFE');
  });

  it('proves every override rule fires accurately and sets minimum verdict/score', () => {
    const cases: Array<{ id: string; text: string; minVerdict: 'BE_CAREFUL' | 'DANGEROUS' }> = [
      {
        id: 'OV_REMOTE_FIN',
        text: 'Install AnyDesk and transfer Rs 5000 immediately.',
        minVerdict: 'DANGEROUS',
      },
      {
        id: 'OV_DIGITAL_ARREST',
        text: 'CBI cyber cell arrest warrant issued. Stay on call and do not tell anyone.',
        minVerdict: 'DANGEROUS',
      },
      {
        id: 'OV_SECRET_MONEY',
        text: 'Please keep this secret and transfer Rs 3000 via UPI.',
        minVerdict: 'BE_CAREFUL',
      },
      {
        id: 'OV_APK_PRESSURE',
        text: 'Urgent RTO challan pending. Install challan_update.apk today.',
        minVerdict: 'DANGEROUS',
      },
      {
        id: 'OV_RELATIVE_MONEY',
        text: 'Hi Amma, lost my phone new number, send Rs 10000 via UPI.',
        minVerdict: 'DANGEROUS',
      },
      {
        id: 'OV_INFO_PRESSURE',
        text: 'Your bank account will be blocked today. Share your OTP immediately.',
        minVerdict: 'DANGEROUS',
      },
      {
        id: 'OV_PRIZE_FEE',
        text: 'Congratulations you won KBC lottery! Pay Rs 2000 processing fee via GPay.',
        minVerdict: 'BE_CAREFUL',
      },
      {
        id: 'OV_INVEST_MONEY',
        text: 'Join VIP trading group for guaranteed returns. Deposit Rs 5000 today.',
        minVerdict: 'BE_CAREFUL',
      },
    ];

    for (const c of cases) {
      const res = scan({ text: c.text, source: 'manual' }, pack);
      expect(res.overridesTriggered).toContain(c.id);
      if (c.minVerdict === 'DANGEROUS') {
        expect(res.verdict).toBe('DANGEROUS');
      } else {
        expect(['BE_CAREFUL', 'DANGEROUS']).toContain(res.verdict);
      }
    }
  });

  it('enforces LEGIT_CONTEXT restrictions: suspicious URL or dangerous override stays risky', () => {
    const suspiciousWithLegitText = scan(
      {
        text: 'Your OTP is 123456. Never share your OTP with anyone. Click http://sbi-kyc-fake.xyz',
        source: 'manual',
      },
      pack,
    );
    expect(suspiciousWithLegitText.indicators.map((i) => i.signalId)).not.toContain('LEGIT_CONTEXT');
    expect(suspiciousWithLegitText.indicators.map((i) => i.signalId)).toContain('SUSPICIOUS_URL');

    const remoteOverrideWithLegitCue = scan(
      {
        text: 'Never share OTP. Your A/c XX4821 balance Rs 25000. Install AnyDesk and transfer Rs 5000 right now.',
        source: 'manual',
      },
      pack,
    );
    expect(remoteOverrideWithLegitCue.verdict).toBe('DANGEROUS');
    expect(remoteOverrideWithLegitCue.overridesTriggered).toContain('OV_REMOTE_FIN');
  });

  it('maintains determinism, bounded latency (<50ms for 2000 chars), and ReDoS resilience', () => {
    const sample =
      'CBI Mumbai cyber cell arrest warrant. Do not tell anyone and transfer Rs 50000. '.repeat(25);
    expect(sample.length).toBeGreaterThan(1500);

    const t0 = performance.now();
    const first = scan({ text: sample, source: 'manual' }, pack);
    const elapsed = performance.now() - t0;
    const second = scan({ text: sample, source: 'manual' }, pack);

    expect(elapsed).toBeLessThan(50);
    expect(first.score).toBe(second.score);
    expect(first.verdict).toBe(second.verdict);
    expect(first.indicators).toEqual(second.indicators);
    expect(first.overridesTriggered).toEqual(second.overridesTriggered);

    const adversarialReDos = `${'a'.repeat(2000)}! ${'o '.repeat(500)}otp?`;
    const r0 = performance.now();
    const resReDos = scan({ text: adversarialReDos, source: 'manual' }, pack);
    expect(performance.now() - r0).toBeLessThan(60);
    expect(resReDos.score).toBeGreaterThanOrEqual(0);
  });

  it('never leaks raw scanned message text substrings inside ScanResult', () => {
    const secretSentence =
      'CBI officer Rajesh Nair from Ernakulam cyber desk demands transfer of Rs 84219 immediately before 5 PM today.';
    const res = scan({ text: secretSentence, source: 'manual' }, pack);
    const serialized = JSON.stringify(res).toLowerCase();

    const words = secretSentence.toLowerCase().split(/\s+/);
    for (let i = 0; i <= words.length - 4; i += 1) {
      const fourWordSlice = words.slice(i, i + 4).join(' ');
      expect(serialized).not.toContain(fourWordSlice);
    }
    expect(serialized).not.toContain('rajesh nair');
    expect(serialized).not.toContain('84219');
  });

  it('applyExternalSignals is raise-only and idempotent', () => {
    const base = scan({ text: 'Hello how are you', source: 'manual' }, pack);
    expect(base.verdict).toBe('SAFE');

    const raised = applyExternalSignals(
      base,
      [
        { signalId: 'AUTHORITY_CLAIM', source: 'call_screening', confidence: 0.9 },
        { signalId: 'URGENCY_THREAT', source: 'call_screening', confidence: 0.9 },
        { signalId: 'SECRECY', source: 'call_screening', confidence: 0.9 },
      ],
      pack,
    );
    expect(raised.verdict).toBe('DANGEROUS');
    expect(raised.score).toBeGreaterThanOrEqual(75);
    expect(raised.detectionMethod).toBe('HYBRID');

    const raisedTwice = applyExternalSignals(
      raised,
      [{ signalId: 'AUTHORITY_CLAIM', source: 'call_screening', confidence: 0.9 }],
      pack,
    );
    expect(raisedTwice.score).toBe(raised.score);

    // Trying to inject LEGIT_CONTEXT cannot lower a DANGEROUS verdict
    const attemptedLower = applyExternalSignals(
      raised,
      [{ signalId: 'LEGIT_CONTEXT', source: 'whitelist', confidence: 1 }],
      pack,
    );
    expect(attemptedLower.verdict).toBe('DANGEROUS');
    expect(attemptedLower.score).toBe(raised.score);
  });

  it('computes ExposureLevel, min-5 ProtectionEffectiveness, and 14d RiskTrend accurately', () => {
    const now = new Date('2026-11-22T12:00:00.000Z');
    const makeInc = (
      idx: number,
      daysAgo: number,
      verdict: 'SAFE' | 'BE_CAREFUL' | 'DANGEROUS',
      outcome: 'avoided' | 'interacted' | null,
    ): Incident => ({
      id: `i-${idx}`,
      scannedAt: new Date(now.getTime() - daysAgo * 86400_000).toISOString(),
      score: verdict === 'DANGEROUS' ? 80 : verdict === 'BE_CAREFUL' ? 40 : 0,
      verdict,
      category: 'test',
      signalIds: [],
      detectionMethod: 'LOCAL_RULES',
      rulePackVersion: '1.0.0',
      reviewed: false,
      falsePositive: false,
      userOutcome: outcome,
    });

    // Under 5 reported outcomes -> effectiveness is null
    const smallSet = [
      makeInc(1, 2, 'DANGEROUS', 'avoided'),
      makeInc(2, 4, 'DANGEROUS', 'avoided'),
      makeInc(3, 6, 'BE_CAREFUL', 'interacted'),
    ];
    const rSmall = computeExposure(smallSet, now);
    expect(rSmall.protectionEffectivenessPct).toBeNull();
    expect(rSmall.exposureLevel).toBe('MODERATE'); // 3*2 + 1*1 = 7

    // >= 5 outcomes & high exposure
    const largerSet = [
      makeInc(1, 1, 'DANGEROUS', 'avoided'),
      makeInc(2, 3, 'DANGEROUS', 'avoided'),
      makeInc(3, 5, 'DANGEROUS', 'avoided'),
      makeInc(4, 7, 'DANGEROUS', 'avoided'),
      makeInc(5, 9, 'BE_CAREFUL', 'interacted'),
    ];
    const rLarge = computeExposure(largerSet, now);
    expect(rLarge.protectionEffectivenessPct).toBe(80);
    expect(rLarge.exposureLevel).toBe('HIGH'); // 3*4 + 1 = 13
    expect(rLarge.riskTrend).toBe('UP'); // 5 in recent 14d vs 0 in prev 14d
  });

  it('measures and reports tune and heldout splits honestly', () => {
    const tuneSamples = SYNTHETIC_DATASET.filter((s) => s.split === 'tune');
    const heldoutSamples = SYNTHETIC_DATASET.filter((s) => s.split === 'heldout');

    const tuneMetrics = evaluateSplit(tuneSamples);
    const heldoutMetrics = evaluateSplit(heldoutSamples);

    console.info('[ENGINE_EVAL tune]', JSON.stringify(tuneMetrics));
    console.info('[ENGINE_EVAL heldout]', JSON.stringify(heldoutMetrics));

    expect(tuneMetrics.recall).toBeGreaterThanOrEqual(0.9);
    expect(tuneMetrics.fpr).toBeLessThanOrEqual(0.1);
    expect(heldoutMetrics.recall).toBeGreaterThanOrEqual(0.8);
    expect(heldoutMetrics.fpr).toBeLessThanOrEqual(0.15);
  });

  it('runs 100% local on-device AI classifier & plain-language generator offline with zero false alarms on OTP delivery', () => {
    const mlParaphrase =
      'ലോട്ടറി അടിച്ചു! 10 ലക്ഷം രൂപ സമ്മാനം കൈപ്പറ്റാൻ ഇന്ന് തന്നെ 2500 രൂപ ഫീസ് യുപിഐ വഴി അയക്കുക.';
    const localAiEval = classifyScamLocalAi(mlParaphrase, false, false);
    expect(localAiEval.probability).toBeGreaterThanOrEqual(0.72);

    const hybridRes = scanWithLocalAi({ text: mlParaphrase, source: 'manual', language: 'ml' }, pack);
    expect(['BE_CAREFUL', 'DANGEROUS']).toContain(hybridRes.verdict);
    expect(['LOCAL_AI', 'HYBRID']).toContain(hybridRes.detectionMethod);

    const otpMsg =
      'Your OTP is 482913 for transaction of Rs 1250 at BigBasket. Never share your OTP with anyone.';
    const otpHybrid = scanWithLocalAi({ text: otpMsg, source: 'manual' }, pack);
    expect(otpHybrid.verdict).toBe('SAFE');

    const expEn = generateLocalPlainExplanation({
      signalIds: ['AUTHORITY_CLAIM', 'SECRECY'],
      verdict: 'DANGEROUS',
      language: 'en',
    });
    expect(expEn.explanation.length).toBeGreaterThan(15);
    expect(expEn.explanation.toLowerCase()).not.toContain('100% safe');

    const expMl = generateLocalPlainExplanation({
      signalIds: ['REMOTE_ACCESS'],
      verdict: 'DANGEROUS',
      language: 'ml',
    });
    expect(expMl.explanation).toContain('AnyDesk');
    expect(expMl.recommendedAction.length).toBeGreaterThan(10);
  });
});
