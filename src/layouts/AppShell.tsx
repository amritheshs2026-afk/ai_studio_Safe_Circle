import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BellRing,
  History,
  Home,
  MessageSquareWarning,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { OfflineIndicator, PWAInstallButton, UpdatePrompt } from '../components/PwaHelpers';
import { ScreenHeader } from '../components/ui';

export const AppShell: React.FC = () => {
  const { t, uiMode, setUiMode, canUseGuardianMode, guardianAlerts } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const unseenAlerts = guardianAlerts.filter((a) => a.status === 'delivered' || a.status === 'pending').length;

  interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const seniorNav: NavItem[] = [
    { to: '/', label: t.navHome, icon: Home },
    { to: '/check', label: t.navCheck, icon: MessageSquareWarning },
    { to: '/history', label: t.navHistory, icon: History },
    { to: '/family', label: t.navFamily, icon: Users },
    { to: '/settings', label: t.navSettings, icon: Settings },
  ];

  const guardianNav: NavItem[] = [
    { to: '/guardian', label: t.navGuardianDash, icon: Shield },
    { to: '/guardian/alerts', label: t.navGuardianAlerts, icon: BellRing, badge: unseenAlerts },
    { to: '/guardian/analytics', label: t.navGuardianAnalytics, icon: BarChart3 },
    { to: '/family', label: t.navGuardianMembers, icon: Users },
    { to: '/settings', label: t.navSettings, icon: Settings },
  ];

  const activeNav = uiMode === 'guardian' && canUseGuardianMode ? guardianNav : seniorNav;

  const pageTitle = (() => {
    if (location.pathname.startsWith('/check')) return t.checkerTitle;
    if (location.pathname.startsWith('/result')) return t.appName;
    if (location.pathname.startsWith('/history')) return t.historyTitle;
    if (location.pathname.startsWith('/exposure')) return t.exposureScreenTitle;
    if (location.pathname.startsWith('/family')) return t.familyTitle;
    if (location.pathname.startsWith('/guardian/alerts')) return t.guardianAlertsTitle;
    if (location.pathname.startsWith('/guardian/analytics')) return t.guardianAnalyticsTitle;
    if (location.pathname.startsWith('/guardian')) return t.guardianDashTitle;
    if (location.pathname.startsWith('/simulations/notifications')) return t.simNotificationsTitle;
    if (location.pathname.startsWith('/simulations/calls')) return t.simCallsTitle;
    if (location.pathname.startsWith('/lessons')) return t.learnLessonsTitle;
    if (location.pathname.startsWith('/emergency')) return t.emergencyTitle;
    if (location.pathname.startsWith('/privacy')) return t.privacyTitle;
    if (location.pathname.startsWith('/settings')) return t.settingsTitle;
    if (location.pathname.startsWith('/share')) return t.shareHandlerTitle;
    return t.appName;
  })();

  const isTopLevelTab = activeNav.some((item) => item.to === location.pathname);

  const handleModeToggle = (nextMode: 'elder' | 'guardian') => {
    setUiMode(nextMode);
    if (nextMode === 'guardian') {
      navigate('/guardian');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--sc-bg)] text-[var(--sc-text)]">
      {/* Desktop Left Navigation Rail */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--sc-surface)] border-r border-[var(--sc-border)] p-4 justify-between no-print">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 pt-1">
            <img src="/icon.svg" alt="" className="w-10 h-10 rounded-xl shrink-0" />
            <div className="min-w-0">
              <span className="block font-display font-bold text-lg leading-tight truncate">
                {t.appName}
              </span>
              <span className="block text-xs text-[var(--sc-text-muted)] truncate">
                {t.tagline}
              </span>
            </div>
          </div>

          {canUseGuardianMode ? (
            <div
              role="group"
              aria-label="Role mode"
              className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)]"
            >
              <button
                type="button"
                onClick={() => handleModeToggle('elder')}
                className={`min-h-[40px] rounded-lg text-xs font-bold px-2 cursor-pointer transition-colors ${
                  uiMode === 'elder'
                    ? 'bg-[var(--sc-primary)] text-white'
                    : 'text-[var(--sc-text-muted)] hover:text-[var(--sc-text)]'
                }`}
              >
                {t.modeElder}
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle('guardian')}
                className={`min-h-[40px] rounded-lg text-xs font-bold px-2 cursor-pointer transition-colors ${
                  uiMode === 'guardian'
                    ? 'bg-[var(--sc-primary)] text-white'
                    : 'text-[var(--sc-text-muted)] hover:text-[var(--sc-text)]'
                }`}
              >
                {t.modeGuardian}
              </button>
            </div>
          ) : null}

          <nav aria-label="Main navigation" className="space-y-1.5">
            {activeNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/' || item.to === '/guardian'}
                  className={({ isActive }) =>
                    `min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 font-semibold text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--sc-primary)] text-white'
                        : 'text-[var(--sc-text)] hover:bg-[var(--sc-surface-muted)]'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {'badge' in item && item.badge ? (
                    <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded-md bg-white/20">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-[var(--sc-border)]">
          <PWAInstallButton />
          <NavLink
            to="/emergency"
            className="min-h-[48px] w-full px-4 py-2.5 rounded-xl bg-[var(--sc-danger-bg)] text-[var(--sc-danger-text)] border border-current/20 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90"
          >
            <span>1930 · {t.emergencyHelpTitle}</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <OfflineIndicator />
        <ScreenHeader
          title={pageTitle}
          onBack={!isTopLevelTab ? () => navigate(-1) : undefined}
        />

        {canUseGuardianMode ? (
          <div className="lg:hidden px-4 pt-3 no-print">
            <div
              role="group"
              aria-label="Role mode"
              className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--sc-surface-muted)] border border-[var(--sc-border)]"
            >
              <button
                type="button"
                onClick={() => handleModeToggle('elder')}
                className={`min-h-[44px] rounded-lg text-xs font-bold px-2 cursor-pointer ${
                  uiMode === 'elder'
                    ? 'bg-[var(--sc-primary)] text-white'
                    : 'text-[var(--sc-text-muted)]'
                }`}
              >
                {t.modeElder}
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle('guardian')}
                className={`min-h-[44px] rounded-lg text-xs font-bold px-2 cursor-pointer ${
                  uiMode === 'guardian'
                    ? 'bg-[var(--sc-primary)] text-white'
                    : 'text-[var(--sc-text-muted)]'
                }`}
              >
                {t.modeGuardian}
              </button>
            </div>
          </div>
        ) : null}

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[var(--sc-surface)]/95 backdrop-blur-md border-t border-[var(--sc-border)] grid grid-cols-5 items-center no-print"
      >
        {activeNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/guardian'}
              className={({ isActive }) =>
                `h-full min-h-[48px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold px-1 transition-colors relative ${
                  isActive ? 'text-[var(--sc-primary)]' : 'text-[var(--sc-text-muted)]'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate max-w-full">{item.label}</span>
              {'badge' in item && item.badge ? (
                <span className="absolute top-1.5 right-3 font-mono-tabular text-[10px] font-bold text-[var(--sc-danger-text)]">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <UpdatePrompt />
    </div>
  );
};
