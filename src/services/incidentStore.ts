import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Incident, Language, UserOutcome } from '../engine/types';

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type FontScaleStep = 1 | 1.25 | 1.5 | 2;
export type AccentChoice = 'blue' | 'teal' | 'indigo' | 'emerald';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface LocalProfilePrefs {
  id: 'current';
  onboardingCompleted: boolean;
  displayName: string;
  language: Language;
  theme: ThemeMode;
  fontScale: FontScaleStep;
  accent: AccentChoice;
  reducedMotion: boolean;
  largeTouchMode: boolean;
  readAloudDefault: boolean;
  demoMode: boolean;
  localAiEnabled: boolean;
  retentionDays: 90 | 180 | 365;
  familyContactName: string;
  familyContactPhone: string;
  emergencyContacts: EmergencyContact[];
  pinHash: string | null;
  pinSalt: string | null;
  completedLessonIds: string[];
  useBundledRulePackOnly: boolean;
}

export interface SyncQueueItem {
  incidentId: string;
  enqueuedAt: string;
  attempts: number;
}

interface SafeCircleDB extends DBSchema {
  incidents: {
    key: string;
    value: Incident;
    indexes: { 'by-scannedAt': string };
  };
  profile: {
    key: string;
    value: LocalProfilePrefs;
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
  };
}

export const DEFAULT_PROFILE_PREFS: LocalProfilePrefs = {
  id: 'current',
  onboardingCompleted: false,
  displayName: '',
  language: 'en',
  theme: 'light',
  fontScale: 1,
  accent: 'blue',
  reducedMotion: false,
  largeTouchMode: true,
  readAloudDefault: false,
  demoMode: import.meta.env.VITE_DEMO_MODE !== 'false',
  localAiEnabled: true,
  retentionDays: 180,
  familyContactName: '',
  familyContactPhone: '',
  emergencyContacts: [],
  pinHash: null,
  pinSalt: null,
  completedLessonIds: [],
  useBundledRulePackOnly: true,
};

let dbPromise: Promise<IDBPDatabase<SafeCircleDB>> | null = null;

function getDb(): Promise<IDBPDatabase<SafeCircleDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SafeCircleDB>('safecircle-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('incidents')) {
          const store = db.createObjectStore('incidents', { keyPath: 'id' });
          store.createIndex('by-scannedAt', 'scannedAt');
        }
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'incidentId' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Strictly strips any non-contract properties so message text, URLs, or sender
 * details can NEVER be persisted into IndexedDB.
 */
export function sanitizeIncidentForStorage(inc: Incident): Incident {
  return {
    id: String(inc.id),
    scannedAt: String(inc.scannedAt),
    score: Math.max(0, Math.min(100, Math.round(Number(inc.score) || 0))),
    verdict: inc.verdict,
    category: String(inc.category).slice(0, 64),
    signalIds: Array.isArray(inc.signalIds) ? [...inc.signalIds] : [],
    detectionMethod: inc.detectionMethod,
    rulePackVersion: String(inc.rulePackVersion).slice(0, 32),
    reviewed: Boolean(inc.reviewed),
    falsePositive: Boolean(inc.falsePositive),
    userOutcome: inc.userOutcome ?? null,
    ...(inc.syncedAt ? { syncedAt: String(inc.syncedAt) } : {}),
  };
}

export async function requestPersistentStorage(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return 'unsupported';
  }
  try {
    const already = await navigator.storage.persisted();
    if (already) return 'granted';
    const granted = await navigator.storage.persist();
    return granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function getStoragePersistStatus(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persisted) {
    return 'unsupported';
  }
  try {
    const persisted = await navigator.storage.persisted();
    return persisted ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export const incidentStore = {
  async listIncidents(): Promise<Incident[]> {
    const db = await getDb();
    const all = await db.getAll('incidents');
    return all.sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
  },

  async getIncident(id: string): Promise<Incident | undefined> {
    const db = await getDb();
    return db.get('incidents', id);
  },

  async addIncident(incident: Incident): Promise<Incident> {
    const db = await getDb();
    const clean = sanitizeIncidentForStorage(incident);
    await db.put('incidents', clean);
    return clean;
  },

  async updateIncident(
    id: string,
    patch: Partial<Pick<Incident, 'reviewed' | 'falsePositive' | 'userOutcome' | 'syncedAt'>>,
  ): Promise<Incident | undefined> {
    const db = await getDb();
    const existing = await db.get('incidents', id);
    if (!existing) return undefined;
    const updated = sanitizeIncidentForStorage({
      ...existing,
      ...patch,
      userOutcome:
        patch.userOutcome !== undefined ? (patch.userOutcome as UserOutcome) : existing.userOutcome,
    });
    await db.put('incidents', updated);
    return updated;
  },

  async deleteIncident(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('incidents', id);
    await db.delete('syncQueue', id);
  },

  async deleteAllIncidents(): Promise<void> {
    const db = await getDb();
    await db.clear('incidents');
    await db.clear('syncQueue');
  },

  async exportIncidentsJson(): Promise<string> {
    const list = await this.listIncidents();
    return JSON.stringify(list, null, 2);
  },

  async getProfilePrefs(): Promise<LocalProfilePrefs> {
    const db = await getDb();
    const saved = await db.get('profile', 'current');
    return saved ? { ...DEFAULT_PROFILE_PREFS, ...saved } : { ...DEFAULT_PROFILE_PREFS };
  },

  async saveProfilePrefs(patch: Partial<LocalProfilePrefs>): Promise<LocalProfilePrefs> {
    const db = await getDb();
    const current = await this.getProfilePrefs();
    const next: LocalProfilePrefs = { ...current, ...patch, id: 'current' };
    await db.put('profile', next);
    return next;
  },

  async enqueueSync(incidentId: string): Promise<void> {
    const db = await getDb();
    await db.put('syncQueue', {
      incidentId,
      enqueuedAt: new Date().toISOString(),
      attempts: 0,
    });
  },

  async listSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await getDb();
    return db.getAll('syncQueue');
  },

  async removeFromSyncQueue(incidentId: string): Promise<void> {
    const db = await getDb();
    await db.delete('syncQueue', incidentId);
  },

  async resetAllLocalData(): Promise<void> {
    const db = await getDb();
    await db.clear('incidents');
    await db.clear('syncQueue');
    await db.put('profile', { ...DEFAULT_PROFILE_PREFS });
  },
};
