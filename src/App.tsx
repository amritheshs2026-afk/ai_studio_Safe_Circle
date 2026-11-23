/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PinLockScreen } from './components/PinLockScreen';
import { AppShell } from './layouts/AppShell';
import { OnboardingPage } from './pages/OnboardingPage';
import { SeniorHomePage } from './pages/SeniorHomePage';
import { MessageCheckerPage } from './pages/MessageCheckerPage';
import { ScanResultPage } from './pages/ScanResultPage';
import { ShareHandlerPage } from './pages/ShareHandlerPage';
import { HistoryPage } from './pages/HistoryPage';
import { ExposurePage } from './pages/ExposurePage';
import { SimulatedCallsPage, SimulatedNotificationsPage } from './pages/SimulationsPage';
import { LessonsPage } from './pages/LessonsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { FamilyPage } from './pages/FamilyPage';
import {
  GuardianAlertsPage,
  GuardianAnalyticsPage,
  GuardianDashboardPage,
} from './pages/GuardianPages';
import { PrivacyDashboardPage, SettingsPage } from './pages/PrivacyAndSettingsPages';

const AppGate: React.FC = () => {
  const { loading, isLocked, prefs } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--sc-bg)] text-[var(--sc-text)]">
        <div className="text-center space-y-3">
          <img src="/icon.svg" alt="SafeCircle" className="w-16 h-16 mx-auto rounded-2xl" />
          <p className="text-base font-semibold">SafeCircle</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return <PinLockScreen />;
  }

  if (!prefs.onboardingCompleted) {
    return <OnboardingPage />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<SeniorHomePage />} />
        <Route path="/check" element={<MessageCheckerPage />} />
        <Route path="/result" element={<ScanResultPage />} />
        <Route path="/share" element={<ShareHandlerPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/exposure" element={<ExposurePage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/guardian" element={<GuardianDashboardPage />} />
        <Route path="/guardian/alerts" element={<GuardianAlertsPage />} />
        <Route path="/guardian/analytics" element={<GuardianAnalyticsPage />} />
        <Route path="/simulations/notifications" element={<SimulatedNotificationsPage />} />
        <Route path="/simulations/calls" element={<SimulatedCallsPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/privacy" element={<PrivacyDashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppGate />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
