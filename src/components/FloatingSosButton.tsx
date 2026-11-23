import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const FloatingSosButton: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/emergency?sos=1')}
      aria-label={t.sosFloatingAria}
      className="fixed right-4 bottom-20 lg:bottom-6 lg:right-6 z-40 min-h-[56px] min-w-[56px] px-5 py-3 rounded-2xl bg-[#B42318] hover:bg-[#911B12] text-white font-bold text-base tracking-wide shadow-lg border border-white/25 inline-flex items-center justify-center gap-2.5 cursor-pointer transition-transform active:scale-[0.97] whitespace-nowrap shrink-0 no-print"
    >
      <ShieldAlert className="w-6 h-6 shrink-0" aria-hidden="true" />
      <span>{t.sosFloatingBtn}</span>
    </button>
  );
};
