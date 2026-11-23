# SafeCircle Detection Engine Report (`in-1.0.0`)

## Important Synthetic-Data Disclaimer

All evaluation metrics reported below were measured against **synthetic benchmark datasets** written specifically for this project (`src/__tests__/engine.test.ts`). Real-world SMS, WhatsApp forwards, and voice transcripts from senior citizens across Kerala and India contain wider regional phrasing, spelling variance, and evolving scam templates. These numbers demonstrate rule-pack behavior on our test suite and **must not be interpreted as real-world clinical or field accuracy guarantees**.

---

## Architecture & Guarantees

- **Zero DOM / React / Network dependencies**: Pure TypeScript (`src/engine/`).
- **Bounded execution**: Inputs are capped at 5,000 characters and scanning enforces a 50 ms cooperative time budget (`DEGRADED / BE_CAREFUL` fallback if exceeded).
- **OTP-delivery safeguard**: Legitimate bank OTP messages (e.g. `"Your OTP is 482913... Never share your OTP with anyone."`) are excluded from `SENSITIVE_INFO_REQUEST` using a negation-window guard and score `SAFE`.
- **Override precedence**: Critical combinations (`OV_REMOTE_FIN`, `OV_DIGITAL_ARREST`, `OV_APK_PRESSURE`, `OV_RELATIVE_MONEY`, `OV_INFO_PRESSURE`, `OV_SECRET_MONEY`, `OV_PRIZE_FEE`, `OV_INVEST_MONEY`) elevate risk regardless of distraction wording.
- **`LEGIT_CONTEXT` restriction**: Cannot lower scores when `SUSPICIOUS_URL` is present, and critical overrides remain `DANGEROUS`.
- **Malayalam review status**: All Malayalam templates in `src/engine/rulepacks/in-v1.json` and `src/data/lessons.ts` are flagged `needsNativeReview: true` pending review by a native Malayalam speaker.

---

## Measured Evaluation (`npm test` / Vitest)

Evaluated on **2026-11-22** using `src/engine/rulepacks/in-v1.json` (`thresholds: carefulMin=30, dangerousMin=60`). The `tune` split was used during rule refinement; the `heldout` split was run blindly and reported as-is without overfitting.

### 1. Tune Split (`n = 24`: 14 scam, 10 benign/hard-negative)

| Metric | Measured Value |
| :--- | :--- |
| True Positives (TP) | 14 |
| False Positives (FP) | 0 |
| True Negatives (TN) | 10 |
| False Negatives (FN) | 0 |
| Precision | **100.0%** |
| Recall | **100.0%** |
| False Positive Rate (FPR) | **0.0%** |
| False Negative Rate (FNR) | **0.0%** |

### 2. Heldout Split (`n = 11`: 6 scam, 5 benign/hard-negative)

| Metric | Measured Value |
| :--- | :--- |
| True Positives (TP) | 5 |
| False Positives (FP) | 0 |
| True Negatives (TN) | 5 |
| False Negatives (FN) | 1 |
| Precision | **100.0%** |
| Recall | **83.3%** |
| False Positive Rate (FPR) | **0.0%** |
| False Negative Rate (FNR) | **16.7%** |

### Known Gaps & Honest Miss Analysis

1. **Heldout miss (`h-ml-1`)**:
   - Input: `"ലോട്ടറി അടിച്ചു! 10 ലക്ഷം രൂപ സമ്മാനം കൈപ്പറ്റാൻ ഇന്ന് തന്നെ 2500 രൂപ ഫീസ് യുപിഐ വഴി അയക്കുക."`
   - Outcome: Scored `15` (`SAFE`, matched `PRIZE_LOTTERY`), missing `MONEY_REQUEST` because `mon_ml` matched `"യുപിഐ വഴി അയക്കൂ"` (imperative `-ൂ`) rather than `"യുപിഐ വഴി അയക്കുക"` (`-ുക`) with an amount prefix `"2500 രൂപ ഫീസ്"`.
   - Action for next rule-pack version (`in-1.0.1`): Broaden Malayalam verb stem conjugation (`അയക്ക(ുക|ൂ)`, `നൽക(ുക|ൂ)`) and numeric `രൂപ` + fee cues after native speaker review.
2. **Hinglish & Regional Languages**: Only starter Hinglish and Manglish patterns are included; broader phonetic variants require community dataset expansion.
3. **No Live Audio / Call Screening in Browsers**: Web browsers cannot inspect incoming phone calls or background notifications; desktop/mobile PWA users must paste or dictate text manually.
