# SafeCircle Architecture

**SafeCircle** ("To Be Safe and To Keep Safe" / "സുരക്ഷിതരായിരിക്കാനും സുരക്ഷിതരാക്കാനും") is an offline-first, bilingual (English and Malayalam) scam shield and optional Family Guardian web application designed for senior citizens in India.

---

## Core Architectural Principles

1. **Offline-First & Pure Detection Core**:
   `src/engine/` has zero dependency on React, DOM APIs, Firebase, or network I/O. Every message check executes deterministically on-device in under 50 ms.
2. **Zero Raw Message Persistence or Transmission**:
   Raw SMS/WhatsApp message text, full URLs, and sender phone numbers are held only in ephemeral UI component state during a check and cleared immediately once scanning completes. Neither IndexedDB (`Incident`), Firebase Firestore (`incidents`, `guardianAlerts`), nor the optional `/api/explain-scan` proxy ever stores or transmits raw message content.
3. **Senior-First Accessibility & Non-Blame Copy**:
   Large 48px+ touch targets, bundled `Noto Sans Malayalam` (`@fontsource/noto-sans-malayalam`), scalable typography (`100%`–`200%`), Light / Dark / AAA High-Contrast themes, and supportive copy verified by automated unit tests against blaming language.
4. **Elder-Controlled Family Consent**:
   Family linking uses 15-minute SHA-256 hashed invitation codes with explicit elder approval, granular share levels (`none`, `alerts_only`, `alerts_and_summary`), independent `syncConsent`, instant revocation (`authorizedGuardians`), and one-tap deletion of synced server records.

---

## Folder Map

```
/
├── server.ts                  # Express server (port 3000) + Vite middleware + /api/explain-scan proxy
├── firestore.rules            # Hardened Firebase Firestore rules (validated via ESLint security plugin)
├── firebase-blueprint.json    # Canonical Firestore collection schema & access blueprint
├── security_spec.md           # Role & authorization matrix
├── src/
│   ├── engine/                # Pure TypeScript scam detection engine (0 DOM/React deps)
│   │   ├── types.ts           # Frozen contracts (Verdict, SignalId, ScanResult, Incident, etc.)
│   │   ├── normaliser.ts      # NFKC, chillu canonicalisation, Indic digits, de-spacing, homoglyphs
│   │   ├── urlAnalyzer.ts     # Offline domain allowlist & lookalike/APK/shortener analyzer
│   │   ├── rulepack.schema.ts # Zod schema + portable regex linter
│   │   ├── rulepacks/in-v1.json # Bundled India scam rule pack (en, ml, manglish, hinglish)
│   │   ├── scanner.ts         # 11-step deterministic pipeline, OTP-delivery negation window, overrides
│   │   ├── externalSignals.ts # Raise-only external signal merger
│   │   └── exposure.ts        # Separated ExposureLevel, ProtectionEffectiveness (min 5), 14d RiskTrend
│   ├── services/              # Local storage, crypto PIN, scan runner, Firebase Auth & Firestore sync
│   ├── localization/          # 100%-parity EN + ML translation dictionaries
│   ├── data/                  # Labeled demo notifications/call simulations & 9 bilingual lessons
│   ├── platform/              # Runtime capability detection + honest PWA vs Android matrix
│   ├── contexts/              # AppContext (preferences, offline listener, PIN auto-lock, Firestore sync)
│   ├── layouts/               # Responsive AppShell (desktop rail + mobile 5-tab bar + mode switch)
│   ├── pages/                 # Senior screens, Family linking, Guardian portal, Emergency, Privacy
│   └── __tests__/             # Vitest suites (engine, tune/heldout eval, IndexedDB privacy, i18n)
└── docs/
    ├── ARCHITECTURE.md
    ├── ENGINE_REPORT.md
    └── SECURITY_NOTES.md
```

---

## Decisions Log

| Date | Decision | Rationale |
| :--- | :--- | :--- |
| 2026-11-22 | Bundle Fontsource fonts locally (`@fontsource/noto-sans-malayalam`, etc.) | Guarantees offline legibility and zero third-party Google Fonts network leakage. |
| 2026-11-22 | Keep `\p{M}` combining marks during normalisation | Essential so Malayalam and Devanagari vowel matras (`ാ`, `ി`, `ു`, `്`) are preserved accurately. |
| 2026-11-22 | Use `elders/{elderId}/authorizedGuardians/{guardianId}` doc gate in Firestore rules | Enables instant, rule-enforced revocation and satisfies `@firebase/eslint-plugin-security-rules` list constraints without insecure `get()` inside `list` queries. |
| 2026-11-22 | Run probabilistic classification and plain-language NLG 100% locally (`src/engine/localAi.ts`) | Eliminates all external AI API transmissions while providing offline simpler explanations and paraphrased scam detection. |

---

## Feature Status Matrix

| Feature | Web PWA Status | Notes / Limitations |
| :--- | :--- | :--- |
| Offline scam engine (`en`, `ml`, `manglish`, `hinglish`) | **Complete** | Bundled `in-v1.json` + local AI classifier + Workbox precache. |
| Local IndexedDB incident store (zero raw text) | **Complete** | Verified by `fake-indexeddb` substring leakage test. |
| Optional PBKDF2 PIN lock + 5m inactivity lock | **Complete** | Local only; cannot be recovered remotely if forgotten. |
| Push-to-talk dictation & Read Aloud | **Browser-dependent** | Depends on Web Speech API & OS-installed `ml-IN` voice. |
| PWA `share_target` (`/share`) | **Android PWA only** | iOS Safari does not support Web Share Target; copy/paste fallback provided. |
| Family linking, share controls, real-time alerts | **Complete (Firebase)** | Optional Google Sign-In + Firestore rules deployed. |
| Simulated notifications & call scenarios | **Demo / Practice only** | Clearly labeled; browsers cannot intercept live calls or SMS. |
| Floating overlay & live call/notification screening | **Not supported in browser** | Requires native Android app; disclosed honestly in Privacy Dashboard. |
| On-Device Plain-Language Explanations (`localAi.ts`) | **Complete (100% Local)** | Runs completely offline in English & Malayalam with zero cloud calls. |
