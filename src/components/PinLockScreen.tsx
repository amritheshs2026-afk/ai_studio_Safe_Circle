import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { verifyPin } from '../services/pinService';
import { Button, Card } from './ui';

export const PinLockScreen: React.FC = () => {
  const { prefs, t, unlockApp } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockedUntil) {
      setError(t.pinLockedMsg);
      return;
    }
    if (!prefs.pinHash || !prefs.pinSalt) {
      unlockApp();
      return;
    }
    const ok = await verifyPin(pin, prefs.pinHash, prefs.pinSalt);
    if (ok) {
      setPin('');
      setError('');
      setAttempts(0);
      unlockApp();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPin('');
      if (next >= 5) {
        setLockedUntil(Date.now() + 30_000);
        setError(t.pinLockedMsg);
      } else {
        setError(t.pinWrongError);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--sc-bg)]">
      <Card className="max-w-sm w-full space-y-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--sc-surface-muted)] text-[var(--sc-primary)] flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold">{t.pinUnlockTitle}</h1>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            aria-label={t.pinEnterLabel}
            className="w-full min-h-[56px] text-center text-2xl tracking-[0.4em] font-mono-tabular rounded-2xl border border-[var(--sc-border)] bg-[var(--sc-bg)] px-4"
            autoFocus
          />
          {error ? (
            <p role="alert" className="text-sm font-semibold text-[var(--sc-danger-text)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={pin.length < 4}>
            {t.continueBtn}
          </Button>
        </form>
      </Card>
    </div>
  );
};
