import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { scanService } from '../services/scanService';
import { Banner, Button, Card } from '../components/ui';

export const ExposurePage: React.FC = () => {
  const { t, incidents } = useApp();
  const navigate = useNavigate();

  const report = scanService.computeExposureReport(incidents);

  const exposureLabel =
    report.exposureLevel === 'LOW'
      ? t.exposureLow
      : report.exposureLevel === 'MODERATE'
        ? t.exposureModerate
        : report.exposureLevel === 'HIGH'
          ? t.exposureHigh
          : t.exposureNeedsSupport;

  const trendLabel =
    report.riskTrend === 'UP'
      ? t.trendUp
      : report.riskTrend === 'DOWN'
        ? t.trendDown
        : report.riskTrend === 'STEADY'
          ? t.trendSteady
          : t.trendNotEnough;

  const recText = (key: string): string => {
    switch (key) {
      case 'rec_family_assisted_checking':
        return t.recFamilyCheck;
      case 'rec_extra_support':
        return t.recExtraSupport;
      case 'rec_learning_lessons':
        return t.recLessons;
      default:
        return t.recStayAlert;
    }
  };

  return (
    <div className="space-y-5">
      <Banner tone="info">{t.exposureNonBlameNote}</Banner>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--sc-primary)]">
            <Shield className="w-5 h-5" />
            <h2 className="font-bold text-base">{t.exposureCardTitle}</h2>
          </div>
          <p className="text-2xl font-bold">{exposureLabel}</p>
          <p className="font-mono-tabular text-sm text-[var(--sc-text-muted)]">
            {report.dangerousCount30d} DANGEROUS · {report.carefulCount30d} BE CAREFUL
          </p>
        </Card>

        <Card className="space-y-2">
          <h2 className="font-bold text-base">{t.effectivenessCardTitle}</h2>
          <p className="text-2xl font-bold font-mono-tabular">
            {report.protectionEffectivenessPct !== null
              ? `${report.protectionEffectivenessPct}%`
              : '—'}
          </p>
          <p className="text-sm text-[var(--sc-text-muted)]">
            {report.protectionEffectivenessPct !== null
              ? t.effectivenessSelfReported
              : t.effectivenessNotEnough}
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--sc-primary)]">
            <TrendingUp className="w-5 h-5" />
            <h2 className="font-bold text-base">{t.trendCardTitle}</h2>
          </div>
          <p className="text-2xl font-bold">{trendLabel}</p>
          <p className="font-mono-tabular text-sm text-[var(--sc-text-muted)]">
            {report.recent14dCount} vs {report.previous14dCount}
          </p>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="font-bold text-lg">{t.recTitle}</h2>
        <ul className="space-y-2.5">
          {report.recommendationKeys.map((key) => (
            <li
              key={key}
              className="p-3.5 rounded-xl bg-[var(--sc-surface-muted)] text-sm font-medium leading-relaxed"
            >
              {recText(key)}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button variant="primary" size="lg" onClick={() => navigate('/lessons')}>
            <BookOpen className="w-5 h-5" />
            <span>{t.learnLessonsTitle}</span>
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/family')}>
            <Users className="w-5 h-5" />
            <span>{t.navFamily}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
