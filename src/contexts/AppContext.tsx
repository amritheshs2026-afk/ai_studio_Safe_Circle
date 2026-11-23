import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { GuardianAlert, Incident, ScanResult } from '../engine/types';
import { TRANSLATIONS, type TranslationDict } from '../localization/dictionary';
import { auth } from '../services/firebase';
import {
  familyService,
  type AuditLogRecord,
  type FamilyConnectionRecord,
} from '../services/familyService';
import {
  DEFAULT_PROFILE_PREFS,
  getStoragePersistStatus,
  incidentStore,
  requestPersistentStorage,
  type LocalProfilePrefs,
} from '../services/incidentStore';

export interface ActiveScanSession {
  result: ScanResult;
  incident: Incident;
  localExplanation?: {
    explanation: string;
    recommendedAction: string;
  };
  guardianAlertsSentCount: number;
}

interface AppContextValue {
  prefs: LocalProfilePrefs;
  t: TranslationDict;
  loading: boolean;
  isOnline: boolean;
  persistStatus: 'granted' | 'denied' | 'unsupported';
  incidents: Incident[];
  activeScan: ActiveScanSession | null;
  setActiveScan: React.Dispatch<React.SetStateAction<ActiveScanSession | null>>;
  updatePrefs: (patch: Partial<LocalProfilePrefs>) => Promise<void>;
  refreshIncidents: () => Promise<void>;
  isLocked: boolean;
  unlockApp: () => void;
  lockApp: () => void;
  user: User | null;
  authReady: boolean;
  elderConnections: FamilyConnectionRecord[];
  guardianConnections: FamilyConnectionRecord[];
  auditLogs: AuditLogRecord[];
  elderSentAlerts: GuardianAlert[];
  guardianAlerts: GuardianAlert[];
  canUseGuardianMode: boolean;
  uiMode: 'elder' | 'guardian';
  setUiMode: (mode: 'elder' | 'guardian') => void;
  syncPendingQueue: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const ACCENT_HEX: Record<LocalProfilePrefs['accent'], { primary: string; hover: string }> = {
  blue: { primary: '#0B5CAD', hover: '#084785' },
  teal: { primary: '#0F766E', hover: '#115E59' },
  indigo: { primary: '#3730A3', hover: '#312E81' },
  emerald: { primary: '#166534', hover: '#14532D' },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<LocalProfilePrefs>(DEFAULT_PROFILE_PREFS);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [persistStatus, setPersistStatus] = useState<'granted' | 'denied' | 'unsupported'>('denied');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeScan, setActiveScan] = useState<ActiveScanSession | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [elderConnections, setElderConnections] = useState<FamilyConnectionRecord[]>([]);
  const [guardianConnections, setGuardianConnections] = useState<FamilyConnectionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [elderSentAlerts, setElderSentAlerts] = useState<GuardianAlert[]>([]);
  const [guardianAlertsByElder, setGuardianAlertsByElder] = useState<Record<string, GuardianAlert[]>>({});
  const [uiMode, setUiMode] = useState<'elder' | 'guardian'>('elder');

  const lastActivityRef = useRef<number>(Date.now());

  const refreshIncidents = useCallback(async () => {
    const list = await incidentStore.listIncidents();
    setIncidents(list);
  }, []);

  // Boot local IndexedDB prefs & incidents
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [loadedPrefs, loadedIncidents, pStatus] = await Promise.all([
          incidentStore.getProfilePrefs(),
          incidentStore.listIncidents(),
          getStoragePersistStatus(),
        ]);
        if (!active) return;
        setPrefs(loadedPrefs);
        setIncidents(loadedIncidents);
        setPersistStatus(pStatus);
        if (loadedPrefs.pinHash && loadedPrefs.pinSalt) {
          setIsLocked(true);
        }
        // Politely request persistent storage once
        if (pStatus === 'denied') {
          const req = await requestPersistentStorage();
          if (active) setPersistStatus(req);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Apply theme, font scale, accent, reduced motion & lang attributes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast', 'reduce-motion');
    if (prefs.theme === 'dark') root.classList.add('dark');
    if (prefs.theme === 'high-contrast') root.classList.add('high-contrast');
    if (prefs.reducedMotion) root.classList.add('reduce-motion');
    root.style.setProperty('--sc-font-scale', String(prefs.fontScale));
    root.setAttribute('data-lang', prefs.language);
    root.setAttribute('lang', prefs.language);

    if (prefs.theme === 'light') {
      const acc = ACCENT_HEX[prefs.accent] ?? ACCENT_HEX.blue;
      root.style.setProperty('--sc-primary', acc.primary);
      root.style.setProperty('--sc-primary-hover', acc.hover);
    } else {
      root.style.removeProperty('--sc-primary');
      root.style.removeProperty('--sc-primary-hover');
    }
  }, [prefs.theme, prefs.fontScale, prefs.accent, prefs.reducedMotion, prefs.language]);

  // Online / offline status listeners
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Inactivity PIN lock timer (5 minutes)
  useEffect(() => {
    if (!prefs.pinHash || !prefs.pinSalt) return;
    const touch = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    const interval = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > 5 * 60 * 1000) {
        setIsLocked(true);
      }
    }, 15_000);
    return () => {
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      window.clearInterval(interval);
    };
  }, [prefs.pinHash, prefs.pinSalt]);

  // Firebase Auth listener
  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setAuthReady(true);
      if (fbUser) {
        void familyService.ensureUserProfile(
          fbUser.uid,
          prefs.displayName || fbUser.displayName || 'SafeCircle Member',
          prefs.language,
        );
      } else {
        setElderConnections([]);
        setGuardianConnections([]);
        setAuditLogs([]);
        setElderSentAlerts([]);
        setGuardianAlertsByElder({});
        setUiMode('elder');
      }
    });
    return () => unsub();
  }, [prefs.displayName, prefs.language]);

  // Subscribe to Elder & Guardian Firestore streams when signed in
  useEffect(() => {
    if (!user) return;
    const unsubs = [
      familyService.subscribeElderConnections(user.uid, setElderConnections),
      familyService.subscribeGuardianConnections(user.uid, setGuardianConnections),
      familyService.subscribeElderAuditLogs(user.uid, setAuditLogs),
      familyService.subscribeElderSentAlerts(user.uid, setElderSentAlerts),
    ];
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user]);

  const activeGuardianConnections = useMemo(
    () => guardianConnections.filter((c) => c.status === 'active'),
    [guardianConnections],
  );

  // Subscribe to Guardian alerts for each active elder connection
  useEffect(() => {
    if (!user || activeGuardianConnections.length === 0) {
      setGuardianAlertsByElder({});
      return;
    }
    const unsubs = activeGuardianConnections.map((conn) =>
      familyService.subscribeGuardianAlertsForElder(conn.elderId, user.uid, (alerts) => {
        setGuardianAlertsByElder((prev) => ({ ...prev, [conn.elderId]: alerts }));
      }),
    );
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user, activeGuardianConnections]);

  const canUseGuardianMode = activeGuardianConnections.length > 0;

  useEffect(() => {
    if (!canUseGuardianMode && uiMode === 'guardian') {
      setUiMode('elder');
    }
  }, [canUseGuardianMode, uiMode]);

  const syncPendingQueue = useCallback(async () => {
    if (!user || !isOnline) return;
    const activeElderConns = elderConnections.filter(
      (c) => c.status === 'active' && c.syncConsent && c.shareLevel !== 'none',
    );
    if (activeElderConns.length === 0) return;

    const queue = await incidentStore.listSyncQueue();
    for (const item of queue) {
      const inc = await incidentStore.getIncident(item.incidentId);
      if (!inc) {
        await incidentStore.removeFromSyncQueue(item.incidentId);
        continue;
      }
      await familyService.syncIncidentAndNotifyGuardians(
        user.uid,
        prefs.displayName || user.displayName || 'Family Elder',
        inc,
        activeElderConns,
      );
    }
    await refreshIncidents();
  }, [user, isOnline, elderConnections, prefs.displayName, refreshIncidents]);

  // Auto-drain sync queue when back online
  useEffect(() => {
    if (isOnline && user) {
      void syncPendingQueue();
    }
  }, [isOnline, user, syncPendingQueue]);

  const updatePrefs = useCallback(async (patch: Partial<LocalProfilePrefs>) => {
    const next = await incidentStore.saveProfilePrefs(patch);
    setPrefs(next);
  }, []);

  const unlockApp = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsLocked(false);
  }, []);

  const lockApp = useCallback(() => {
    setIsLocked(true);
  }, []);

  const guardianAlerts = useMemo(() => {
    return Object.values(guardianAlertsByElder)
      .flat()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [guardianAlertsByElder]);

  const t = TRANSLATIONS[prefs.language];

  const value: AppContextValue = {
    prefs,
    t,
    loading,
    isOnline,
    persistStatus,
    incidents,
    activeScan,
    setActiveScan,
    updatePrefs,
    refreshIncidents,
    isLocked,
    unlockApp,
    lockApp,
    user,
    authReady,
    elderConnections,
    guardianConnections,
    auditLogs,
    elderSentAlerts,
    guardianAlerts,
    canUseGuardianMode,
    uiMode,
    setUiMode,
    syncPendingQueue,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
