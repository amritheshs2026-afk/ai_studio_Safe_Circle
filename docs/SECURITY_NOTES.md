# SafeCircle Security & Privacy Notes

## 1. Zero Raw Message Storage Invariant

- **On-device detection**: All SMS, WhatsApp, URL, and call-transcript scanning executes locally in the browser via `src/engine/scanner.ts`.
- **Memory hygiene**: Input strings are cleared from React state immediately after scanning (`MessageCheckerPage`, `ShareHandlerPage`, `SimulatedCallsPage`).
- **IndexedDB schema (`Incident`)**: `sanitizeIncidentForStorage()` in `src/services/incidentStore.ts` explicitly whitelists only metadata fields (`id`, `scannedAt`, `score`, `verdict`, `category`, `signalIds`, `detectionMethod`, `rulePackVersion`, `reviewed`, `falsePositive`, `userOutcome`, `syncedAt`). No raw message text, URLs, or sender numbers are stored.
- **Automated verification**: Both `engine.test.ts` and `storageAndI18n.test.ts` fail CI if any 4+ word substring of a scanned message appears in `ScanResult` or `Incident` IndexedDB storage.

## 2. Authentication, Family Consent & Firestore Hardening

- **Optional sign-in**: Google Sign-In via Firebase Auth is strictly optional and only needed for cross-device Family Guardian linking. All core senior protection features work offline without an account.
- **15-minute hashed invitations**: Invite codes (`XXXX-YYYY-ZZZZ`) are generated with `crypto.getRandomValues`, hashed via SHA-256, and stored under `familyInvitations/{tokenHash}`. `allow list` is disabled (`false`) so codes cannot be enumerated.
- **Instant revocation**: Approving a connection writes `elders/{elderId}/authorizedGuardians/{guardianId}` alongside `familyConnections/{id}`. Firestore `allow get` / `allow list` rules on `incidents` and `guardianAlerts` require that active document to exist (`authorizedGuardianActive(elderId)`), and revoking deletes it atomically alongside existing alerts for that guardian.
- **Zero-trust rules lint**: `firestore.rules` passes `npx eslint firestore.rules` with `@firebase/eslint-plugin-security-rules` cleanly (0 errors, 0 warnings).

## 3. 100% Local On-Device AI

- **Zero external AI calls**: Both probabilistic n-gram scam scoring (`classifyScamLocalAi`) and plain-language bilingual explanation synthesis (`generateLocalPlainExplanation`) execute synchronously inside `src/engine/localAi.ts` with zero network requests and zero cloud LLM dependencies.
- **No AI server route or key exposure**: The Express server does not expose any cloud LLM proxy route or require any AI API key.

## 4. Local App Lock PIN

- **PBKDF2-HMAC-SHA256**: Optional 4–6 digit PINs are hashed with 120,000 iterations and a random 16-byte WebCrypto salt (`src/services/pinService.ts`). Auto-locks after 5 minutes of inactivity.

## 5. DPDP Act 2023 Disclaimer

While SafeCircle is designed around data minimization, explicit consent, purpose limitation, and instant user revocation/deletion aligned with principles of India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**, **this software has not undergone formal legal review**. Organizations deploying SafeCircle publicly should obtain qualified Indian legal counsel review prior to production launch.
