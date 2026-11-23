# SafeCircle Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Zero Message Text**: No Firestore document or rule permits raw message text, URLs, or sender identifiers. `scamIncidents` and `guardianAlerts` enforce strict key whitelists (`hasOnly`), bounded string lengths, and bounded `signalIds` arrays (`size() <= 15`).
2. **Invitation Integrity**: `familyInvitations/{tokenHash}` cannot be listed (`allow list: if false`). Only the elder (`elderId == request.auth.uid`) can create an `active` invitation. A guardian can only redeem an unexpired `active` invitation via an atomic batch that marks the invitation `used` and creates a `pending` `familyConnections` doc with `shareLevel == 'none'` and `syncConsent == false`.
3. **Elder Control & Instant Revocation**: Only the elder can transition a `familyConnections` doc from `pending` to `active`, or update `shareLevel` / `syncConsent`, or write `/elders/{elderId}/authorizedGuardians/{guardianId}`. Either elder or guardian can transition a connection to `revoked` (terminal) and delete the `authorizedGuardians` record, immediately blocking future alert reads.
4. **No Cross-Family Reads**: `allow list` rules strictly enforce `resource.data.elderId == request.auth.uid || resource.data.guardianId == request.auth.uid` without `get()` lookups. Single-document `get` on `guardianAlerts` verifies an active `authorizedGuardians` document exists.
5. **Immutable Audit Trail**: `auditLogs` are append-only (`allow update, delete: if false`).

## 2. Adversarial "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated read/write**: Any read or write with `request.auth == null`.
2. **Shadow field injection on incident**: `scamIncidents` create including `rawText: "Your account is blocked"` — rejected by `keys().hasOnly(...)`.
3. **Guardian self-activation**: Guardian creating `familyConnections` directly with `status: "active"` or `shareLevel: "alerts_and_summary"` — rejected because create mandates `status == 'pending' && shareLevel == 'none' && syncConsent == false`.
4. **Self-invitation**: User creating `familyConnections` where `elderId == guardianId` — rejected by `elderId != guardianId`.
5. **Invitation enumeration**: `list` query on `/familyInvitations` — rejected by `allow list: if false`.
6. **Expired / reused invitation redemption**: Redeeming an invitation where `request.time >= expiresAt` or `status == 'used'` — rejected.
7. **Un-revoking a terminated connection**: Attempting to update `familyConnections` from `status: 'revoked'` back to `'active'` — rejected by terminal state lock.
8. **Guardian spoofing elder approval**: Guardian updating `status` from `'pending'` to `'active'` or changing `shareLevel` — rejected (`request.auth.uid == existing().elderId` required).
9. **Cross-family alert snooping**: Third-party user `userC` attempting `get` or `list` on `/elders/elderA/guardianAlerts` — rejected.
10. **Guardian writing incidents**: Guardian attempting to create or modify `/elders/elderA/incidents/{id}` — rejected (`request.auth.uid == elderId` required).
11. **Oversized ID / Denial-of-Wallet**: Document creation with 1,500-char ID or 20-element `signalIds` list — rejected by `isValidId()` and `signalIds.size() <= 15`.
12. **Client timestamp forgery**: Creating `familyInvitations`, `familyConnections`, or `incidents` with backdated `createdAt != request.time` — rejected by temporal integrity check.
