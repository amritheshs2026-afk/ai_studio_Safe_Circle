import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Flag,
  Languages,
  PhoneCall,
  PhoneIncoming,
  SearchCheck,
  Sparkles,
} from 'lucide-react';
import { getDefaultRulePack } from '../engine';
import type { Language, SignalId, UserOutcome } from '../engine/types';
import { useApp } from '../contexts/AppContext';
import { familyService } from '../services/familyService';
import { incidentStore } from '../services/incidentStore';
import { scanService } from '../services/scanService';
import { Banner, Button, Card, EmptyState, ReadAloudButton, RiskBadge } from '../components/ui';

export const ScanResultPage: React.FC = () => {
  const {
    prefs,
    t,
    activeScan,
    setActiveScan,
    refreshIncidents,
    user,
    isOnline,
    elderConnections,
  } = useApp();
  const navigate = useNavigate();

  const [displayLang, setDisplayLang] = useState<Language>(prefs.language);
  const [outcomeSaved, setOutcomeSaved] = useState(false);
  const [falseAlarmSaved, setFalseAlarmSaved] = useState(false);

  useEffect(() => {
    setDisplayLang(prefs.language);
  }, [prefs.language]);

  if (!activeScan) {
    return (
      <EmptyState
        icon={<SearchCheck className="w-7 h-7" />}
        title={t.noRecentAlerts}
        action={
          <Button size="lg" onClick={() => navigate('/check')}>
            {t.checkMessageCta}
          </Button>
        }
      />
    );
  }

  const { result, incident, localExplanation, guardianAlertsSentCount } = activeScan;
  const pack = getDefaultRulePack();
  const riskSignals = result.indicators.filter((i) => i.signalId !== 'LEGIT_CONTEXT');
  const signalIds = Array.from(new Set(result.indicators.map((i) => i.signalId))) as SignalId[];

  const explanationText = result.explanation[displayLang];
  const actionText = result.recommendedAction[displayLang];

  const handleCallFamily = () => {
    if (prefs.familyContactPhone.trim()) {
      window.location.href = `tel:${prefs.familyContactPhone.replace(/\s+/g, '')}`;
    } else {
      navigate('/family');
    }
  };

  const handleOutcome = async (outcome: Exclude<UserOutcome, null>) => {
    const updated = await incidentStore.updateIncident(incident.id, {
      userOutcome: outcome,
      reviewed: true,
    });
    if (updated) {
      setActiveScan((prev) => (prev ? { ...prev, incident: updated } : prev));
    }
    setOutcomeSaved(true);
    await refreshIncidents();

    if (user && isOnline) {
      await familyService.syncIncidentOutcomeUpdate(
        user.uid,
        incident.id,
        { userOutcome: outcome, reviewed: true },
        elderConnections,
      );
    }
  };

  const handleFalseAlarm = async () => {
    const updated = await incidentStore.updateIncident(incident.id, {
      falsePositive: true,
      reviewed: true,
    });
    if (updated) {
      setActiveScan((prev) => (prev ? { ...prev, incident: updated } : prev));
    }
    setFalseAlarmSaved(true);
    await refreshIncidents();

    if (user && isOnline) {
      await familyService.syncIncidentOutcomeUpdate(
        user.uid,
        incident.id,
        { falsePositive: true, reviewed: true },
        elderConnections,
      );
    }
  };

  const handleLocalExplain = () => {
    const generated = scanService.generateLocalExplanation({
      signalIds,
      verdict: result.verdict,
      language: displayLang,
    });
    setActiveScan((prev) =>
      prev
        ? {
            ...prev,
            localExplanation: {
              explanation: generated.explanation,
              recommendedAction: generated.recommendedAction,
            },
          }
        : prev,
    );
  };

  const handleDone = () => {
    setActiveScan(null);
    navigate('/');
  };

  const otherLang: Language = displayLang === 'en' ? 'ml' : 'en';

  return (
    <div className="space-y-5">
      {/* Main Verdict Summary Card */}
      <Card className="p-6 space-y-5">
        <div role="status" aria-live="polite" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <RiskBadge verdict={result.verdict} lang={displayLang} />
            <span className="font-mono-tabular text-sm font-bold text-[var(--sc-text-muted)]">
              {t.scoreLabel}: {result.score}/100
            </span>
          </div>

          <p className="text-lg sm:text-xl font-bold leading-relaxed">{explanationText}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ReadAloudButton
            text={`${explanationText}. ${actionText}`}
            lang={displayLang}
            labelRead={t.readAloud}
            labelStop={t.stopReading}
            missingMlVoiceLabel={t.noMlVoiceNote}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDisplayLang(otherLang)}
          >
            <Languages className="w-5 h-5" />
            <span>{otherLang === 'ml' ? 'മലയാളത്തിൽ വായിക്കുക' : 'Read in English'}</span>
          </Button>
        </div>

        {guardianAlertsSentCount > 0 ? (
          <Banner tone="info">{t.guardianNotifiedNote}</Banner>
        ) : result.verdict === 'DANGEROUS' ? (
          <Banner tone="warn">{t.noGuardianAlertSentNote}</Banner>
        ) : null}
      </Card>

      {/* What I noticed + What to do now */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h2 className="font-bold text-lg">{t.whatINoticed}</h2>
          {riskSignals.length === 0 ? (
            <p className="text-sm text-[var(--sc-text-muted)] leading-relaxed">
              {displayLang === 'ml'
                ? 'വ്യക്തമായ തട്ടിപ്പ് ലക്ഷണങ്ങളൊന്നും കണ്ടില്ല.'
                : 'No high-risk scam patterns were matched.'}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {riskSignals.map((ind) => {
                const tmpl = pack.templates[ind.signalId];
                const label = tmpl ? tmpl[displayLang] : ind.signalId;
                return (
                  <li
                    key={`${ind.signalId}-${ind.matchedRuleId}`}
                    className="p-3 rounded-xl bg-[var(--sc-surface-muted)] text-sm font-medium leading-relaxed"
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="font-bold text-lg">{t.whatToDoNow}</h2>
          <p className="text-base leading-relaxed">{actionText}</p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Button variant="primary" size="lg" className="w-full" onClick={handleCallFamily}>
              <PhoneCall className="w-5 h-5" />
              <span>
                {prefs.familyContactPhone
                  ? `${t.callFamilyBtn}${prefs.familyContactName ? ` (${prefs.familyContactName})` : ''}`
                  : t.callFamilyBtn}
              </span>
            </Button>

            {result.verdict === 'DANGEROUS' ? (
              <Button
                variant="danger"
                size="lg"
                className="w-full"
                onClick={() => navigate('/emergency')}
              >
                <PhoneIncoming className="w-5 h-5" />
                <span>{t.reportCyberFraud}</span>
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      {/* 100% On-Device Local AI Simpler Explanation */}
      {prefs.localAiEnabled ? (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-base">{t.cloudOptInTitle}</h2>
            <span className="text-xs font-bold text-[var(--sc-primary)]">
              {t.simplerExplanationBadge}
            </span>
          </div>
          {localExplanation ? (
            <div className="space-y-2 p-4 rounded-xl bg-[var(--sc-surface-muted)]">
              <p className="text-base leading-relaxed">{localExplanation.explanation}</p>
              <p className="text-sm font-semibold text-[var(--sc-text-muted)]">
                {localExplanation.recommendedAction}
              </p>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleLocalExplain}
            >
              <Sparkles className="w-5 h-5 text-[var(--sc-primary)]" />
              <span>{t.getSimplerExplanation}</span>
            </Button>
          )}
        </Card>
      ) : null}

      {/* Outcome Follow-up */}
      <Card className="space-y-4">
        <h2 className="font-bold text-base">{t.followUpQuestion}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Button
            type="button"
            variant={incident.userOutcome === 'avoided' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => void handleOutcome('avoided')}
          >
            {t.followUpNo}
          </Button>
          <Button
            type="button"
            variant={incident.userOutcome === 'interacted' ? 'danger' : 'secondary'}
            size="lg"
            onClick={() => void handleOutcome('interacted')}
          >
            {t.followUpYes}
          </Button>
          <Button
            type="button"
            variant={incident.userOutcome === 'unsure' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => void handleOutcome('unsure')}
          >
            {t.followUpUnsure}
          </Button>
        </div>

        {outcomeSaved ? (
          <Banner tone="info">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{t.followUpSaved}</span>
            </span>
          </Banner>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--sc-border)]">
          <Button
            type="button"
            variant="ghost"
            disabled={incident.falsePositive || falseAlarmSaved}
            onClick={() => void handleFalseAlarm()}
          >
            <Flag className="w-4 h-4" />
            <span>
              {incident.falsePositive || falseAlarmSaved ? t.markedFalseAlarm : t.markFalseAlarm}
            </span>
          </Button>

          <Button type="button" size="lg" onClick={handleDone}>
            {t.doneBtn}
          </Button>
        </div>
      </Card>
    </div>
  );
};
