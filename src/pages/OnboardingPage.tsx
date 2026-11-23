import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { hashPin, isValidPinFormat } from '../services/pinService';
import type { FontScaleStep } from '../services/incidentStore';
import { Button, Card } from '../components/ui';

export const OnboardingPage: React.FC = () => {
  const { prefs, t, updatePrefs } = useApp();
  const [step, setStep] = useState<'welcome' | 'language' | 'profile' | 'font' | 'contact' | 'pin'>(
    'welcome',
  );
  const [name, setName] = useState(prefs.displayName);
  const [contactName, setContactName] = useState(prefs.familyContactName);
  const [contactPhone, setContactPhone] = useState(prefs.familyContactPhone);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const finishOnboarding = async () => {
    await updatePrefs({
      onboardingCompleted: true,
      displayName: name.trim().slice(0, 60),
      familyContactName: contactName.trim().slice(0, 60),
      familyContactPhone: contactPhone.trim().slice(0, 20),
    });
  };

  const handleSavePinAndFinish = async () => {
    if (pin.trim().length > 0) {
      if (!isValidPinFormat(pin.trim())) {
        setPinError(t.pinEnterLabel);
        return;
      }
      const { hash, salt } = await hashPin(pin.trim());
      await updatePrefs({ pinHash: hash, pinSalt: salt });
    }
    await finishOnboarding();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--sc-bg)]">
      <div className="w-full max-w-lg space-y-5">
        {step === 'welcome' ? (
          <Card className="p-6 sm:p-8 text-center space-y-6">
            <img src="/icon.svg" alt="SafeCircle" className="w-20 h-20 mx-auto rounded-2xl shadow-sm" />
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{t.welcomeGreeting}</h1>
              <p className="text-base text-[var(--sc-text-muted)] leading-relaxed">
                {t.welcomeSub}
              </p>
            </div>
            <div className="space-y-3">
              <Button size="xl" className="w-full" onClick={() => setStep('language')}>
                <ShieldCheck className="w-6 h-6" />
                <span>{t.getStarted}</span>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => void updatePrefs({ onboardingCompleted: true })}
              >
                {t.skipSetup}
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 'language' ? (
          <Card className="p-6 space-y-5">
            <h1 className="text-xl font-bold">{t.setupStepLanguage}</h1>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={prefs.language === 'en' ? 'primary' : 'secondary'}
                size="xl"
                className="w-full"
                onClick={() => void updatePrefs({ language: 'en' })}
              >
                English
              </Button>
              <Button
                variant={prefs.language === 'ml' ? 'primary' : 'secondary'}
                size="xl"
                className="w-full"
                onClick={() => void updatePrefs({ language: 'ml' })}
              >
                മലയാളം (Malayalam)
              </Button>
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="ghost" onClick={() => void finishOnboarding()}>
                {t.skipSetup}
              </Button>
              <Button size="lg" onClick={() => setStep('profile')}>
                {t.continueBtn}
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 'profile' ? (
          <Card className="p-6 space-y-5">
            <h1 className="text-xl font-bold">{t.setupStepProfile}</h1>
            <div className="space-y-2">
              <label htmlFor="onb-name" className="block font-semibold text-sm">
                {t.yourNameLabel}
              </label>
              <input
                id="onb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.yourNamePlaceholder}
                className="w-full min-h-[52px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-4 text-base"
              />
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep('language')}>
                {t.backBtn}
              </Button>
              <Button size="lg" onClick={() => setStep('font')}>
                {t.continueBtn}
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 'font' ? (
          <Card className="p-6 space-y-5">
            <h1 className="text-xl font-bold">{t.setupStepFontSize}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([1, 1.25, 1.5, 2] as FontScaleStep[]).map((scale) => (
                <Button
                  key={scale}
                  variant={prefs.fontScale === scale ? 'primary' : 'secondary'}
                  onClick={() => void updatePrefs({ fontScale: scale })}
                >
                  {Math.round(scale * 100)}%
                </Button>
              ))}
            </div>
            <p className="p-4 rounded-xl bg-[var(--sc-surface-muted)] text-base">
              {t.homeGreeting}
            </p>
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep('profile')}>
                {t.backBtn}
              </Button>
              <Button size="lg" onClick={() => setStep('contact')}>
                {t.continueBtn}
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 'contact' ? (
          <Card className="p-6 space-y-5">
            <h1 className="text-xl font-bold">{t.setupStepContact}</h1>
            <p className="text-sm text-[var(--sc-text-muted)]">{t.addFamilyContactHint}</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="onb-cname" className="block font-semibold text-sm mb-1">
                  {t.familyContactName}
                </label>
                <input
                  id="onb-cname"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full min-h-[52px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-4"
                />
              </div>
              <div>
                <label htmlFor="onb-cphone" className="block font-semibold text-sm mb-1">
                  {t.familyContactPhone}
                </label>
                <input
                  id="onb-cphone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full min-h-[52px] rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-4 font-mono-tabular"
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep('font')}>
                {t.backBtn}
              </Button>
              <Button size="lg" onClick={() => setStep('pin')}>
                {t.continueBtn}
              </Button>
            </div>
          </Card>
        ) : null}

        {step === 'pin' ? (
          <Card className="p-6 space-y-5">
            <h1 className="text-xl font-bold">{t.setupStepPin}</h1>
            <p className="text-sm text-[var(--sc-text-muted)]">{t.pinOptionalHint}</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPinError('');
                setPin(e.target.value.replace(/\D/g, ''));
              }}
              placeholder="••••"
              aria-label={t.pinEnterLabel}
              className="w-full min-h-[52px] text-center text-xl tracking-[0.35em] font-mono-tabular rounded-xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-4"
            />
            {pinError ? (
              <p className="text-sm font-semibold text-[var(--sc-danger-text)]">{pinError}</p>
            ) : null}
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep('contact')}>
                {t.backBtn}
              </Button>
              <Button size="lg" onClick={() => void handleSavePinAndFinish()}>
                {t.finishBtn}
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
};
