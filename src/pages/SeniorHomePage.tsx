import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Lock,
  MessageSquareWarning,
  Mic,
  PhoneCall,
  PhoneIncoming,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { scanService } from '../services/scanService';
import { BigActionButton, Button, Card, RiskBadge } from '../components/ui';
import { PWAInstallButton } from '../components/PwaHelpers';
import { VoiceGuideCard } from '../components/VoiceGuideCard';
import { FloatingSosButton } from '../components/FloatingSosButton';

export const SeniorHomePage: React.FC = () => {
  const { prefs, t, incidents, elderConnections, setUiMode, canUseGuardianMode } = useApp();
  const navigate = useNavigate();

  const recentIncidents = incidents.slice(0, 3);
  const exposure = scanService.computeExposureReport(incidents);
  const activeFamilyCount = elderConnections.filter((c) => c.status === 'active').length;

  const greetingHeading = prefs.displayName
    ? `${prefs.language === 'ml' ? 'നമസ്കാരം' : 'Hello'}, ${prefs.displayName}`
    : t.appName;

  const handleCallFamily = () => {
    if (prefs.familyContactPhone.trim()) {
      window.location.href = `tel:${prefs.familyContactPhone.replace(/\s+/g, '')}`;
    } else {
      navigate('/family');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-16">
      <FloatingSosButton />
      {/* Primary Hero Card */}
      <Card className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img src="/icon.svg" alt="" className="w-14 h-14 rounded-2xl shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{greetingHeading}</h2>
              <p className="text-base text-[var(--sc-text-muted)] mt-1 leading-relaxed">
                {t.homeGreeting}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BigActionButton
            variant="primary"
            icon={<MessageSquareWarning className="w-7 h-7" />}
            label={t.checkMessageCta}
            sublabel={
              prefs.language === 'ml'
                ? 'SMS അല്ലെങ്കിൽ WhatsApp പേസ്റ്റ് ചെയ്യുക'
                : 'Paste SMS or WhatsApp text'
            }
            onClick={() => navigate('/check')}
          />

          <BigActionButton
            variant="accent"
            icon={<Mic className="w-7 h-7" />}
            label={t.speakMessageBtn}
            sublabel={
              prefs.language === 'ml'
                ? 'മൈക്രോഫോൺ ഉപയോഗിച്ച് വായിച്ചു കൊടുക്കുക'
                : 'Dictate what a caller or message said'
            }
            onClick={() => navigate('/check?voice=1')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" className="w-full" onClick={handleCallFamily}>
            <PhoneCall className="w-5 h-5 text-[var(--sc-primary)]" />
            <span>
              {prefs.familyContactPhone
                ? `${t.callFamilyBtn}${prefs.familyContactName ? ` (${prefs.familyContactName})` : ''}`
                : t.callFamilyBtn}
            </span>
          </Button>

          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={() => navigate('/emergency')}
          >
            <PhoneIncoming className="w-5 h-5" />
            <span>1930 · {t.emergencyHelpTitle}</span>
          </Button>
        </div>

        {canUseGuardianMode ? (
          <div className="pt-1">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setUiMode('guardian');
                navigate('/guardian');
              }}
            >
              {t.modeGuardian}
            </Button>
          </div>
        ) : null}
      </Card>

      {/* Voice-Guided Dashboard Navigation */}
      <VoiceGuideCard />

      {/* Status + Exposure 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[var(--sc-safe-text)] shrink-0" />
            <h3 className="font-bold text-base">{t.statusCardTitle}</h3>
          </div>
          <p className="text-sm text-[var(--sc-text-muted)]">
            {activeFamilyCount > 0 ? t.statusSyncedReady : t.statusLocalReady}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="secondary" size="md" onClick={() => navigate('/privacy')}>
              <Lock className="w-4 h-4" />
              <span>{t.privacyDashTitle}</span>
            </Button>
            <PWAInstallButton />
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-[var(--sc-primary)] shrink-0" />
              <h3 className="font-bold text-base">{t.safetyOverviewTitle}</h3>
            </div>
            <span className="font-mono-tabular text-xs font-bold text-[var(--sc-text-muted)]">
              30d
            </span>
          </div>
          <p className="text-sm text-[var(--sc-text-muted)]">
            {prefs.language === 'ml'
              ? `കഴിഞ്ഞ 30 ദിവസത്തിൽ ${exposure.dangerousCount30d} അപകട സന്ദേശങ്ങൾ`
              : `${exposure.dangerousCount30d} dangerous · ${exposure.carefulCount30d} careful in last 30 days`}
          </p>
          <Button variant="secondary" size="md" onClick={() => navigate('/exposure')}>
            {t.exposureScreenTitle}
          </Button>
        </Card>
      </div>

      {/* Recent 3 Checks */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">{t.recentAlertsTitle}</h3>
          {incidents.length > 0 ? (
            <Button variant="ghost" size="md" onClick={() => navigate('/history')}>
              {t.navHistory}
            </Button>
          ) : null}
        </div>
        {recentIncidents.length === 0 ? (
          <p className="text-sm text-[var(--sc-text-muted)]">{t.noRecentAlerts}</p>
        ) : (
          <ul className="divide-y divide-[var(--sc-border)]">
            {recentIncidents.map((inc) => (
              <li key={inc.id} className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <RiskBadge verdict={inc.verdict} lang={prefs.language} />
                  <p className="text-xs text-[var(--sc-text-muted)] font-mono-tabular">
                    {new Date(inc.scannedAt).toLocaleString()} · {inc.score}/100
                  </p>
                </div>
                <Button variant="ghost" size="md" onClick={() => navigate('/history')}>
                  {t.navHistory}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Practice & Learning Shortcuts */}
      <Card className="space-y-3">
        <h3 className="font-bold text-base">{t.quickActionsTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {prefs.demoMode ? (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-start"
                onClick={() => navigate('/simulations/notifications')}
              >
                <Bell className="w-5 h-5 text-[var(--sc-primary)]" />
                <span>{t.simNotificationsTitle}</span>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-start"
                onClick={() => navigate('/simulations/calls')}
              >
                <PhoneIncoming className="w-5 h-5 text-[var(--sc-primary)]" />
                <span>{t.simCallsTitle}</span>
              </Button>
            </>
          ) : null}
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-start"
            onClick={() => navigate('/lessons')}
          >
            <BookOpen className="w-5 h-5 text-[var(--sc-primary)]" />
            <span>{t.learnLessonsTitle}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
