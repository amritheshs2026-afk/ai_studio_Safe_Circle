import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { SAFETY_LESSONS } from '../data/lessons';
import { useApp } from '../contexts/AppContext';
import { Button, Card, ReadAloudButton } from '../components/ui';

export const LessonsPage: React.FC = () => {
  const { prefs, t, updatePrefs } = useApp();
  const isMl = prefs.language === 'ml';

  const completedSet = new Set(prefs.completedLessonIds);

  const toggleCompleted = async (id: string) => {
    const next = completedSet.has(id)
      ? prefs.completedLessonIds.filter((item) => item !== id)
      : [...prefs.completedLessonIds, id];
    await updatePrefs({ completedLessonIds: next });
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-[var(--sc-primary)] shrink-0" />
          <div>
            <h2 className="font-bold text-lg">{t.learnLessonsTitle}</h2>
            <p className="text-sm text-[var(--sc-text-muted)] font-mono-tabular">
              {prefs.completedLessonIds.length} / {SAFETY_LESSONS.length}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {SAFETY_LESSONS.map((lesson) => {
          const done = completedSet.has(lesson.id);
          const title = isMl ? lesson.titleMl : lesson.titleEn;
          const summary = isMl ? lesson.summaryMl : lesson.summaryEn;
          const points = isMl ? lesson.pointsMl : lesson.pointsEn;
          const takeaway = isMl ? lesson.takeawayMl : lesson.takeawayEn;

          return (
            <Card key={lesson.id} className="space-y-3">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-base font-medium leading-relaxed">{summary}</p>
              <ul className="space-y-1.5 list-disc pl-5 text-sm sm:text-base text-[var(--sc-text-muted)] leading-relaxed">
                {points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <p className="p-3 rounded-xl bg-[var(--sc-surface-muted)] text-sm font-semibold">
                {takeaway}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <ReadAloudButton
                  text={`${title}. ${summary} ${points.join(' ')} ${takeaway}`}
                  lang={prefs.language}
                  labelRead={t.readAloud}
                  labelStop={t.stopReading}
                  missingMlVoiceLabel={t.noMlVoiceNote}
                />

                <Button
                  type="button"
                  variant={done ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={() => void toggleCompleted(lesson.id)}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {isMl
                      ? done
                        ? 'പൂർത്തിയാക്കി'
                        : 'മനസ്സിലായി'
                      : done
                        ? 'Completed'
                        : 'I understood'}
                  </span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
