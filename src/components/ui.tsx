import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Languages,
  OctagonAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { Language, Verdict } from '../engine/types';
import { useApp } from '../contexts/AppContext';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'md' | 'lg' | 'xl';
  }
> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-2.5 font-semibold rounded-2xl transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap shrink-0';
  const sizeCls =
    size === 'xl'
      ? 'min-h-[64px] px-6 py-4 text-lg'
      : size === 'lg'
        ? 'min-h-[52px] px-5 py-3 text-base'
        : 'min-h-[48px] px-4 py-2.5 text-sm';

  const variantCls =
    variant === 'primary'
      ? 'bg-[var(--sc-primary)] text-white hover:bg-[var(--sc-primary-hover)] shadow-sm'
      : variant === 'danger'
        ? 'bg-[#B42318] text-white hover:bg-[#911B12] shadow-sm'
        : variant === 'secondary'
          ? 'bg-[var(--sc-surface)] text-[var(--sc-text)] border border-[var(--sc-border)] hover:bg-[var(--sc-surface-muted)]'
          : 'bg-transparent text-[var(--sc-text)] hover:bg-[var(--sc-surface-muted)]';

  return (
    <button className={`${base} ${sizeCls} ${variantCls} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const BigActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  variant?: 'primary' | 'accent' | 'danger' | 'surface';
  className?: string;
}> = ({ icon, label, sublabel, onClick, variant = 'primary', className = '' }) => {
  const palette =
    variant === 'primary'
      ? 'bg-[var(--sc-primary)] text-white hover:bg-[var(--sc-primary-hover)]'
      : variant === 'accent'
        ? 'bg-[var(--sc-accent)] text-white hover:opacity-95'
        : variant === 'danger'
          ? 'bg-[#B42318] text-white hover:bg-[#911B12]'
          : 'bg-[var(--sc-surface)] text-[var(--sc-text)] border border-[var(--sc-border)] hover:bg-[var(--sc-surface-muted)]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full min-h-[72px] rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-transform active:scale-[0.99] shadow-sm cursor-pointer ${palette} ${className}`}
    >
      <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-white/15">
        {icon}
      </span>
      <span className="flex flex-col min-w-0">
        <span className="text-lg font-bold leading-snug">{label}</span>
        {sublabel ? <span className="text-sm opacity-90 leading-snug">{sublabel}</span> : null}
      </span>
    </button>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <section
      className={`rounded-[20px] bg-[var(--sc-surface)] border border-[var(--sc-border)] p-5 shadow-xs ${className}`}
    >
      {children}
    </section>
  );
};

export const RiskBadge: React.FC<{ verdict: Verdict; lang: Language }> = ({ verdict, lang }) => {
  const label =
    verdict === 'SAFE'
      ? lang === 'ml'
        ? 'സുരക്ഷിതം (SAFE)'
        : 'SAFE'
      : verdict === 'BE_CAREFUL'
        ? lang === 'ml'
          ? 'ശ്രദ്ധിക്കുക (BE CAREFUL)'
          : 'BE CAREFUL'
        : lang === 'ml'
          ? 'അപകടകരം (DANGEROUS)'
          : 'DANGEROUS';

  const style =
    verdict === 'SAFE'
      ? 'bg-[var(--sc-safe-bg)] text-[var(--sc-safe-text)] border border-current/20'
      : verdict === 'BE_CAREFUL'
        ? 'bg-[var(--sc-careful-bg)] text-[var(--sc-careful-text)] border border-current/25'
        : 'bg-[var(--sc-danger-bg)] text-[var(--sc-danger-text)] border border-current/25';

  const Icon =
    verdict === 'SAFE' ? ShieldCheck : verdict === 'BE_CAREFUL' ? AlertTriangle : OctagonAlert;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-sm tracking-wide ${style}`}
    >
      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export const Banner: React.FC<{
  tone: 'info' | 'warn' | 'demo' | 'danger';
  children: React.ReactNode;
  className?: string;
}> = ({ tone, children, className = '' }) => {
  const toneCls =
    tone === 'demo'
      ? 'bg-[var(--sc-careful-bg)] text-[var(--sc-careful-text)] border border-current/25'
      : tone === 'danger'
        ? 'bg-[var(--sc-danger-bg)] text-[var(--sc-danger-text)] border border-current/25'
        : tone === 'warn'
          ? 'bg-[var(--sc-careful-bg)] text-[var(--sc-careful-text)] border border-current/25'
          : 'bg-[var(--sc-surface-muted)] text-[var(--sc-text)] border border-[var(--sc-border)]';

  return (
    <div
      role="status"
      className={`rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${toneCls} ${className}`}
    >
      {children}
    </div>
  );
};

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}> = ({ checked, onChange, label, description, id }) => {
  const controlId = id ?? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <label htmlFor={controlId} className="flex-1 cursor-pointer">
        <span className="block font-semibold text-base text-[var(--sc-text)]">{label}</span>
        {description ? (
          <span className="block text-sm text-[var(--sc-text-muted)] mt-0.5">{description}</span>
        ) : null}
      </label>
      <button
        id={controlId}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 min-h-[48px] min-w-[56px] shrink-0 items-center rounded-full p-1 transition-colors cursor-pointer ${
          checked ? 'bg-[var(--sc-primary)]' : 'bg-[var(--sc-surface-muted)] border border-[var(--sc-border)]'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export const ScreenHeader: React.FC<{
  title: string;
  onBack?: () => void;
}> = ({ title, onBack }) => {
  const { prefs, updatePrefs, t } = useApp();
  const nextLang: Language = prefs.language === 'en' ? 'ml' : 'en';

  return (
    <header className="sticky top-0 z-30 h-14 px-4 bg-[var(--sc-surface)]/95 backdrop-blur-md border-b border-[var(--sc-border)] flex items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2 min-w-0">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t.backBtn}
            className="min-h-[48px] min-w-[48px] -ml-2 inline-flex items-center justify-center rounded-xl hover:bg-[var(--sc-surface-muted)] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}
        <h1 className="text-base md:text-lg font-bold truncate">{title}</h1>
      </div>

      <button
        type="button"
        onClick={() => void updatePrefs({ language: nextLang })}
        aria-label={t.switchLangLabel}
        className="min-h-[48px] px-3 rounded-xl border border-[var(--sc-border)] bg-[var(--sc-surface-muted)] text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
      >
        <Languages className="w-4 h-4 shrink-0" />
        <span>{nextLang === 'ml' ? 'മലയാളം' : 'English'}</span>
      </button>
    </header>
  );
};

export const ReadAloudButton: React.FC<{
  text: string;
  lang: Language;
  labelRead: string;
  labelStop: string;
  missingMlVoiceLabel: string;
}> = ({ text, lang, labelRead, labelStop, missingMlVoiceLabel }) => {
  const [speaking, setSpeaking] = React.useState(false);
  const [missingVoice, setMissingVoice] = React.useState(false);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  if (!supported) return null;

  const handleToggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = lang === 'ml' ? 'ml' : 'en';
    const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));

    if (lang === 'ml' && voices.length > 0 && !matchingVoice) {
      setMissingVoice(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'ml' ? 'ml-IN' : 'en-IN';
    if (matchingVoice) utter.voice = matchingVoice;
    utter.rate = 0.92;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="secondary"
        onClick={handleToggle}
        className="w-full sm:w-auto"
      >
        {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        <span>{speaking ? labelStop : labelRead}</span>
      </Button>
      {missingVoice ? (
        <p className="text-xs text-[var(--sc-text-muted)]">{missingMlVoiceLabel}</p>
      ) : null}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}> = ({ icon, title, action }) => (
  <Card className="text-center py-10 flex flex-col items-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-[var(--sc-surface-muted)] flex items-center justify-center text-[var(--sc-primary)]">
      {icon}
    </div>
    <p className="text-base text-[var(--sc-text-muted)] max-w-md">{title}</p>
    {action}
  </Card>
);
