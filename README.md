# SafeCircle

Offline-first, bilingual (**English & Malayalam / മലയാളം**) scam shield for senior citizens in India with optional Family Guardian linking.

---

## Key Features

- **100% Local On-Device AI & Rule Engine (`src/engine/`)**: Combines deterministic rules with a local probabilistic classifier (`localAi.ts`) and bilingual plain-language explainer — works completely offline with zero cloud AI calls.
- **Zero Message Storage**: Never saves or sends raw message text, URLs, or phone numbers. Only numeric scores, verdicts (`SAFE`, `BE_CAREFUL`, `DANGEROUS`), and tactic IDs (`AUTHORITY_CLAIM`, `REMOTE_ACCESS`, etc.) are stored.
- **Bilingual & Senior-Friendly**: Locally bundled `Noto Sans Malayalam`, adjustable text scaling (`100%`–`200%`), Light / Dark / High-Contrast (AAA) themes, large touch targets, Web Speech push-to-talk & Read Aloud, and optional PBKDF2 PIN lock.
- **Optional Family Guardian Mode (Firebase)**: 15-minute SHA-256 invite codes + QR, explicit elder approval, granular sharing (`none`, `alerts_only`, `alerts_and_summary`), instant revocation, audit log, and printable safety summaries.
- **Emergency Support & Practice**: Direct `1930` / `112` helpline actions, after-scam action checklist, 9 offline bilingual safety lessons, and clearly labeled demo/simulated notification and call scenarios.

---

## Development & Verification Scripts

```bash
npm install        # Install dependencies
npm run dev        # Start Express + Vite dev server on port 3000
npm test           # Run Vitest suites (engine, tune/heldout eval, IndexedDB, i18n)
npm run lint       # TypeScript typecheck + Firestore security rules ESLint check
npm run build      # Build production PWA bundle (dist/)
npm start          # Run production server (port 3000)
```

---

## Environment Variables (`.env.example`)

- `APP_URL` *(server/platform)*: Application URL.
- `VITE_DEMO_MODE` *(client, optional)*: Defaults to `true` (`false` hides simulated notification/call shortcuts on the Home screen).
- No external AI API keys are required — all AI runs strictly locally in the browser.

---

## Web PWA vs Native Android Honesty

Web browsers cannot inspect incoming phone calls or background notifications. Features such as live call screening and floating overlays belong to native mobile apps and are clearly documented as unavailable in browsers on the **Privacy Dashboard** (`CAPABILITY_MATRIX`).
