import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import type { GuardianAlert, Incident, Language, SignalId, UserOutcome, Verdict } from '../engine/types';
import { auth, db, firebaseConfigured, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { sha256Hex } from './pinService';
import { incidentStore } from './incidentStore';

export type ShareLevel = 'none' | 'alerts_only' | 'alerts_and_summary';
export type ConnectionStatus = 'pending' | 'active' | 'revoked';

export interface FamilyConnectionRecord {
  id: string;
  elderId: string;
  guardianId: string;
  elderName: string;
  guardianName: string;
  guardianLabel: string;
  status: ConnectionStatus;
  shareLevel: ShareLevel;
  syncConsent: boolean;
  invitationId: string;
  revokedBy?: string;
  createdAt?: string;
  approvedAt?: string;
  revokedAt?: string;
}

export interface AuditLogRecord {
  id: string;
  elderId: string;
  actorId: string;
  actorName: string;
  connectionId: string;
  action:
    | 'invited'
    | 'invite_failed'
    | 'redeemed'
    | 'approved'
    | 'rejected'
    | 'revoked'
    | 'share_level_changed'
    | 'sync_consent_changed'
    | 'data_deleted';
  createdAt: string;
}

export interface NotificationPrefRecord {
  guardianId: string;
  elderId: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  notifyOnBeCareful: boolean;
  includeElderName: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  dangerousBypassesQuietHours: boolean;
  escalationMinutes: number;
}

export interface ActiveInvitation {
  rawCode: string;
  tokenHash: string;
  expiresAtIso: string;
}

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let chars = '';
  for (let i = 0; i < 12; i += 1) {
    chars += INVITE_ALPHABET[bytes[i] % INVITE_ALPHABET.length];
  }
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

function normaliseCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function tsToIso(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function mapOutcomeForServer(outcome: UserOutcome): 'avoided' | 'interacted' | 'unsure' | 'none' {
  return outcome ?? 'none';
}

function mapOutcomeFromServer(val: unknown): UserOutcome {
  if (val === 'avoided' || val === 'interacted' || val === 'unsure') return val;
  return null;
}

export const familyService = {
  isConfigured(): boolean {
    return firebaseConfigured && Boolean(auth) && Boolean(db);
  },

  async signInWithGoogle(): Promise<void> {
    if (!auth || !googleProvider) throw new Error('Firebase is not configured.');
    await signInWithPopup(auth, googleProvider);
  },

  async signOutUser(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
  },

  async ensureUserProfile(uid: string, displayName: string, language: Language): Promise<void> {
    if (!db) return;
    const path = `users/${uid}`;
    const ref = doc(db, 'users', uid);
    try {
      const snap = await getDoc(ref);
      const safeName = (displayName || 'SafeCircle Member').trim().slice(0, 80);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid,
          displayName: safeName,
          language,
          cloudExplanationsEnabled: false,
          retentionDays: 180,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          displayName: safeName,
          language,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async createInvitation(elderId: string, elderName: string): Promise<ActiveInvitation> {
    if (!db) throw new Error('Firebase is not configured.');
    const rawCode = generateInviteCode();
    const tokenHash = await sha256Hex(normaliseCode(rawCode));
    const expiresAtDate = new Date(Date.now() + 15 * 60 * 1000);
    const expiresAt = Timestamp.fromDate(expiresAtDate);
    const safeElderName = (elderName || 'Family Elder').trim().slice(0, 80);

    const invPath = `familyInvitations/${tokenHash}`;
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'familyInvitations', tokenHash), {
        elderId,
        elderName: safeElderName,
        tokenHash,
        status: 'active',
        attempts: 0,
        expiresAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'elders', elderId, 'auditLogs', logId), {
        id: logId,
        elderId,
        actorId: elderId,
        actorName: safeElderName,
        connectionId: '',
        action: 'invited',
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      return {
        rawCode,
        tokenHash,
        expiresAtIso: expiresAtDate.toISOString(),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, invPath);
    }
  },

  async redeemInvitation(
    rawCodeInput: string,
    guardianId: string,
    guardianName: string,
  ): Promise<{ connectionId: string; elderName: string }> {
    if (!db) throw new Error('Firebase is not configured.');
    const clean = normaliseCode(rawCodeInput);
    if (clean.length < 8) {
      throw new Error('INVALID_CODE');
    }
    const tokenHash = await sha256Hex(clean);
    const invPath = `familyInvitations/${tokenHash}`;

    let invData: Record<string, unknown> | undefined;
    try {
      const snap = await getDoc(doc(db, 'familyInvitations', tokenHash));
      if (!snap.exists()) {
        throw new Error('INVALID_OR_EXPIRED');
      }
      invData = snap.data();
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_OR_EXPIRED') throw error;
      handleFirestoreError(error, OperationType.GET, invPath);
    }

    const elderId = String(invData?.elderId ?? '');
    const elderName = String(invData?.elderName ?? 'Family Elder');
    const status = String(invData?.status ?? '');
    const expiresAt = invData?.expiresAt;
    const isExpired =
      expiresAt instanceof Timestamp ? expiresAt.toMillis() <= Date.now() : true;

    if (!elderId || elderId === guardianId || status !== 'active' || isExpired) {
      throw new Error('INVALID_OR_EXPIRED');
    }

    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const safeGuardianName = (guardianName || 'Family Guardian').trim().slice(0, 80);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'familyInvitations', tokenHash), {
        status: 'used',
        usedBy: guardianId,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'familyConnections', connectionId), {
        id: connectionId,
        elderId,
        guardianId,
        elderName,
        guardianName: safeGuardianName,
        guardianLabel: safeGuardianName.slice(0, 40),
        status: 'pending',
        shareLevel: 'none',
        syncConsent: false,
        invitationId: tokenHash,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'elders', elderId, 'auditLogs', logId), {
        id: logId,
        elderId,
        actorId: guardianId,
        actorName: safeGuardianName,
        connectionId,
        action: 'redeemed',
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      return { connectionId, elderName };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `familyConnections/${connectionId}`);
    }
  },

  async approveConnection(
    conn: FamilyConnectionRecord,
    shareLevel: ShareLevel,
    syncConsent: boolean,
    actorName: string,
  ): Promise<void> {
    if (!db) throw new Error('Firebase is not configured.');
    const path = `familyConnections/${conn.id}`;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'familyConnections', conn.id), {
        status: 'active',
        shareLevel,
        syncConsent,
        guardianLabel: conn.guardianLabel || conn.guardianName.slice(0, 40),
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'elders', conn.elderId, 'authorizedGuardians', conn.guardianId), {
        elderId: conn.elderId,
        guardianId: conn.guardianId,
        connectionId: conn.id,
        shareLevel,
        syncConsent,
        updatedAt: serverTimestamp(),
      });
      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'elders', conn.elderId, 'auditLogs', logId), {
        id: logId,
        elderId: conn.elderId,
        actorId: conn.elderId,
        actorName: (actorName || conn.elderName).slice(0, 80),
        connectionId: conn.id,
        action: 'approved',
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateConnectionSharing(
    conn: FamilyConnectionRecord,
    shareLevel: ShareLevel,
    syncConsent: boolean,
    actorName: string,
  ): Promise<void> {
    if (!db) throw new Error('Firebase is not configured.');
    const path = `familyConnections/${conn.id}`;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'familyConnections', conn.id), {
        shareLevel,
        syncConsent,
        guardianLabel: conn.guardianLabel || conn.guardianName.slice(0, 40),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'elders', conn.elderId, 'authorizedGuardians', conn.guardianId), {
        elderId: conn.elderId,
        guardianId: conn.guardianId,
        connectionId: conn.id,
        shareLevel,
        syncConsent,
        updatedAt: serverTimestamp(),
      });
      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'elders', conn.elderId, 'auditLogs', logId), {
        id: logId,
        elderId: conn.elderId,
        actorId: conn.elderId,
        actorName: (actorName || conn.elderName).slice(0, 80),
        connectionId: conn.id,
        action: 'share_level_changed',
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async revokeOrRejectConnection(
    conn: FamilyConnectionRecord,
    actorId: string,
    actorName: string,
    isReject: boolean,
  ): Promise<void> {
    if (!db) throw new Error('Firebase is not configured.');
    const path = `familyConnections/${conn.id}`;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'familyConnections', conn.id), {
        status: 'revoked',
        shareLevel: 'none',
        syncConsent: false,
        revokedBy: actorId,
        revokedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.delete(doc(db, 'elders', conn.elderId, 'authorizedGuardians', conn.guardianId));
      if (actorId === conn.elderId) {
        const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        batch.set(doc(db, 'elders', conn.elderId, 'auditLogs', logId), {
          id: logId,
          elderId: conn.elderId,
          actorId,
          actorName: (actorName || 'Member').slice(0, 80),
          connectionId: conn.id,
          action: isReject ? 'rejected' : 'revoked',
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();

      // Also clean up any existing guardianAlerts for the revoked guardian if elder revoked
      if (actorId === conn.elderId) {
        const alertsSnap = await getDocs(
          query(
            collection(db, 'elders', conn.elderId, 'guardianAlerts'),
            where('guardianId', '==', conn.guardianId),
          ),
        );
        for (const alertDoc of alertsSnap.docs) {
          await deleteDoc(alertDoc.ref);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async syncIncidentAndNotifyGuardians(
    elderId: string,
    elderName: string,
    incident: Incident,
    activeConnections: FamilyConnectionRecord[],
  ): Promise<number> {
    if (!db) return 0;
    const consented = activeConnections.filter(
      (c) =>
        c.elderId === elderId &&
        c.status === 'active' &&
        c.syncConsent &&
        c.shareLevel !== 'none',
    );
    if (consented.length === 0) return 0;

    const safeElderName = (elderName || 'Family Elder').trim().slice(0, 80);
    const incPath = `elders/${elderId}/incidents/${incident.id}`;
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'elders', elderId, 'incidents', incident.id), {
        id: incident.id,
        elderId,
        scannedAt: incident.scannedAt,
        score: incident.score,
        verdict: incident.verdict,
        category: incident.category.slice(0, 64),
        signalIds: incident.signalIds.slice(0, 15),
        detectionMethod: incident.detectionMethod,
        rulePackVersion: incident.rulePackVersion,
        reviewed: incident.reviewed,
        falsePositive: incident.falsePositive,
        userOutcome: mapOutcomeForServer(incident.userOutcome),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      let alertsCreated = 0;
      if (incident.verdict === 'DANGEROUS' || incident.verdict === 'BE_CAREFUL') {
        for (const conn of consented) {
          // Send DANGEROUS always; BE_CAREFUL only when alerts_and_summary or pref enabled
          if (incident.verdict === 'BE_CAREFUL' && conn.shareLevel !== 'alerts_and_summary') {
            continue;
          }
          const alertId = `al_${incident.id}_${conn.guardianId}`.slice(0, 120);
          batch.set(doc(db, 'elders', elderId, 'guardianAlerts', alertId), {
            id: alertId,
            incidentId: incident.id,
            elderId,
            elderName: safeElderName,
            guardianId: conn.guardianId,
            guardianName: conn.guardianName,
            score: incident.score,
            verdict: incident.verdict,
            category: incident.category.slice(0, 64),
            signalIds: incident.signalIds.slice(0, 15),
            status: 'delivered',
            channels: ['in_app'],
            userOutcome: mapOutcomeForServer(incident.userOutcome),
            falsePositive: incident.falsePositive,
            scannedAt: incident.scannedAt,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          alertsCreated += 1;
        }
      }

      await batch.commit();
      await incidentStore.updateIncident(incident.id, { syncedAt: new Date().toISOString() });
      await incidentStore.removeFromSyncQueue(incident.id);
      return alertsCreated;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, incPath);
    }
  },

  async sendSosGuardianAlert(
    elderId: string,
    elderName: string,
    activeConnections: FamilyConnectionRecord[],
  ): Promise<number> {
    if (!db) return 0;
    const consented = activeConnections.filter(
      (c) =>
        c.elderId === elderId &&
        c.status === 'active' &&
        c.syncConsent &&
        c.shareLevel !== 'none',
    );
    if (consented.length === 0) return 0;

    const safeElderName = (elderName || 'Family Elder').trim().slice(0, 80);
    const sosId = `sos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();
    const incPath = `elders/${elderId}/incidents/${sosId}`;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'elders', elderId, 'incidents', sosId), {
        id: sosId,
        elderId,
        scannedAt: nowIso,
        score: 100,
        verdict: 'DANGEROUS',
        category: 'sos_emergency',
        signalIds: [],
        detectionMethod: 'LOCAL_RULES',
        rulePackVersion: 'sos-1.0',
        reviewed: false,
        falsePositive: false,
        userOutcome: 'none',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      let alertsCreated = 0;
      for (const conn of consented) {
        const alertId = `al_${sosId}_${conn.guardianId}`.slice(0, 120);
        batch.set(doc(db, 'elders', elderId, 'guardianAlerts', alertId), {
          id: alertId,
          incidentId: sosId,
          elderId,
          elderName: safeElderName,
          guardianId: conn.guardianId,
          guardianName: conn.guardianName,
          score: 100,
          verdict: 'DANGEROUS',
          category: 'sos_emergency',
          signalIds: [],
          status: 'delivered',
          channels: ['in_app'],
          userOutcome: 'none',
          falsePositive: false,
          scannedAt: nowIso,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        alertsCreated += 1;
      }

      await batch.commit();
      return alertsCreated;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, incPath);
    }
  },

  async syncIncidentOutcomeUpdate(
    elderId: string,
    incidentId: string,
    patch: { userOutcome?: UserOutcome; falsePositive?: boolean; reviewed?: boolean },
    activeConnections: FamilyConnectionRecord[],
  ): Promise<void> {
    if (!db) return;
    const incRef = doc(db, 'elders', elderId, 'incidents', incidentId);
    try {
      const snap = await getDoc(incRef);
      if (!snap.exists()) return;
      const updateBody: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (patch.userOutcome !== undefined) updateBody.userOutcome = mapOutcomeForServer(patch.userOutcome);
      if (patch.falsePositive !== undefined) updateBody.falsePositive = patch.falsePositive;
      if (patch.reviewed !== undefined) updateBody.reviewed = patch.reviewed;

      const batch = writeBatch(db);
      batch.update(incRef, updateBody);

      for (const conn of activeConnections) {
        if (conn.elderId !== elderId || conn.status !== 'active') continue;
        const alertId = `al_${incidentId}_${conn.guardianId}`.slice(0, 120);
        const alertRef = doc(db, 'elders', elderId, 'guardianAlerts', alertId);
        const alertSnap = await getDoc(alertRef);
        if (alertSnap.exists()) {
          const alertPatch: Record<string, unknown> = { updatedAt: serverTimestamp() };
          if (patch.userOutcome !== undefined) alertPatch.userOutcome = mapOutcomeForServer(patch.userOutcome);
          if (patch.falsePositive !== undefined) alertPatch.falsePositive = patch.falsePositive;
          batch.update(alertRef, alertPatch);
        }
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `elders/${elderId}/incidents/${incidentId}`);
    }
  },

  async deleteAllSyncedElderData(elderId: string, elderName: string): Promise<void> {
    if (!db) return;
    try {
      const incSnap = await getDocs(
        query(collection(db, 'elders', elderId, 'incidents'), where('elderId', '==', elderId)),
      );
      for (const d of incSnap.docs) await deleteDoc(d.ref);

      const alertSnap = await getDocs(
        query(collection(db, 'elders', elderId, 'guardianAlerts'), where('elderId', '==', elderId)),
      );
      for (const d of alertSnap.docs) await deleteDoc(d.ref);

      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'elders', elderId, 'auditLogs', logId), {
        id: logId,
        elderId,
        actorId: elderId,
        actorName: (elderName || 'Family Elder').slice(0, 80),
        connectionId: '',
        action: 'data_deleted',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `elders/${elderId}`);
    }
  },

  async updateAlertStatus(
    elderId: string,
    alertId: string,
    status: 'seen' | 'reviewed',
  ): Promise<void> {
    if (!db) return;
    const path = `elders/${elderId}/guardianAlerts/${alertId}`;
    try {
      await updateDoc(doc(db, 'elders', elderId, 'guardianAlerts', alertId), {
        status,
        ...(status === 'seen' ? { seenAt: serverTimestamp() } : { reviewedAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async saveNotificationPreferences(pref: NotificationPrefRecord): Promise<void> {
    if (!db) return;
    const prefId = `${pref.guardianId}_${pref.elderId}`;
    const path = `notificationPreferences/${prefId}`;
    try {
      await setDoc(doc(db, 'notificationPreferences', prefId), {
        ...pref,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async submitHelpRequest(params: {
    userId: string;
    topic:
      | 'suspicious_call'
      | 'suspicious_message'
      | 'account_setup'
      | 'family_linking'
      | 'scam_recovery_guidance'
      | 'accessibility_help';
    language: Language;
    contactMethod: 'in_app' | 'email' | 'phone_callback';
    note: string;
  }): Promise<void> {
    if (!db) throw new Error('Firebase is not configured.');
    const requestId = `hr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `helpRequests/${requestId}`;
    try {
      await setDoc(doc(db, 'helpRequests', requestId), {
        id: requestId,
        userId: params.userId,
        topic: params.topic,
        language: params.language,
        contactMethod: params.contactMethod,
        note: params.note.trim().slice(0, 200),
        consent: true,
        status: 'submitted',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeElderConnections(
    uid: string,
    cb: (connections: FamilyConnectionRecord[]) => void,
  ): Unsubscribe {
    if (!db) return () => undefined;
    const q = query(collection(db, 'familyConnections'), where('elderId', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            elderId: String(data.elderId),
            guardianId: String(data.guardianId),
            elderName: String(data.elderName),
            guardianName: String(data.guardianName),
            guardianLabel: String(data.guardianLabel ?? data.guardianName ?? ''),
            status: data.status as ConnectionStatus,
            shareLevel: data.shareLevel as ShareLevel,
            syncConsent: Boolean(data.syncConsent),
            invitationId: String(data.invitationId ?? ''),
            createdAt: tsToIso(data.createdAt),
            approvedAt: data.approvedAt ? tsToIso(data.approvedAt) : undefined,
            revokedAt: data.revokedAt ? tsToIso(data.revokedAt) : undefined,
          };
        });
        cb(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'familyConnections');
      },
    );
  },

  subscribeGuardianConnections(
    uid: string,
    cb: (connections: FamilyConnectionRecord[]) => void,
  ): Unsubscribe {
    if (!db) return () => undefined;
    const q = query(collection(db, 'familyConnections'), where('guardianId', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            elderId: String(data.elderId),
            guardianId: String(data.guardianId),
            elderName: String(data.elderName),
            guardianName: String(data.guardianName),
            guardianLabel: String(data.guardianLabel ?? data.guardianName ?? ''),
            status: data.status as ConnectionStatus,
            shareLevel: data.shareLevel as ShareLevel,
            syncConsent: Boolean(data.syncConsent),
            invitationId: String(data.invitationId ?? ''),
            createdAt: tsToIso(data.createdAt),
            approvedAt: data.approvedAt ? tsToIso(data.approvedAt) : undefined,
            revokedAt: data.revokedAt ? tsToIso(data.revokedAt) : undefined,
          };
        });
        cb(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'familyConnections');
      },
    );
  },

  subscribeElderAuditLogs(uid: string, cb: (logs: AuditLogRecord[]) => void): Unsubscribe {
    if (!db) return () => undefined;
    const q = query(collection(db, 'elders', uid, 'auditLogs'), where('elderId', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              elderId: String(data.elderId),
              actorId: String(data.actorId),
              actorName: String(data.actorName),
              connectionId: String(data.connectionId ?? ''),
              action: data.action as AuditLogRecord['action'],
              createdAt: tsToIso(data.createdAt),
            };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        cb(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `elders/${uid}/auditLogs`);
      },
    );
  },

  subscribeElderSentAlerts(uid: string, cb: (alerts: GuardianAlert[]) => void): Unsubscribe {
    if (!db) return () => undefined;
    const q = query(collection(db, 'elders', uid, 'guardianAlerts'), where('elderId', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => mapAlertDoc(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        cb(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `elders/${uid}/guardianAlerts`);
      },
    );
  },

  subscribeGuardianAlertsForElder(
    elderId: string,
    guardianId: string,
    cb: (alerts: GuardianAlert[]) => void,
  ): Unsubscribe {
    if (!db) return () => undefined;
    const q = query(
      collection(db, 'elders', elderId, 'guardianAlerts'),
      where('guardianId', '==', guardianId),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => mapAlertDoc(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        cb(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `elders/${elderId}/guardianAlerts`);
      },
    );
  },
};

function mapAlertDoc(id: string, data: Record<string, unknown>): GuardianAlert {
  return {
    id,
    elderId: String(data.elderId ?? ''),
    elderName: String(data.elderName ?? 'Family Elder'),
    guardianId: String(data.guardianId ?? ''),
    guardianName: String(data.guardianName ?? 'Guardian'),
    incidentId: String(data.incidentId ?? ''),
    score: Number(data.score ?? 0),
    verdict: (data.verdict as Verdict) ?? 'BE_CAREFUL',
    category: String(data.category ?? 'general_message'),
    signalIds: Array.isArray(data.signalIds) ? (data.signalIds as SignalId[]) : [],
    suggestedAction: 'Call your family member to verify calmly.',
    channels: Array.isArray(data.channels) ? (data.channels as string[]) : ['in_app'],
    createdAt: tsToIso(data.createdAt),
    status: (data.status as GuardianAlert['status']) ?? 'delivered',
    userOutcome: mapOutcomeFromServer(data.userOutcome),
    falsePositive: Boolean(data.falsePositive),
    scannedAt: String(data.scannedAt ?? tsToIso(data.createdAt)),
  };
}
