'use client';

import { useState } from 'react';

interface ProposalFormProps {
  onGenerate: (url: string) => void;
  isLoading: boolean;
}

export default function ProposalForm({ onGenerate, isLoading }: ProposalFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError('URL을 입력해주세요.');
      return;
    }

    try {
      new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    } catch {
      setError('유효한 URL 형식으로 입력해주세요. (예: https://example.com)');
      return;
    }

    onGenerate(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="relative flex items-center gap-3">
        {/* URL input */}
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://example.com"
            disabled={isLoading}
            className="glass-input w-full rounded-2xl py-4 pl-11 pr-4 text-sm text-white placeholder-white/25 disabled:opacity-50"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="flex-shrink-0 rounded-2xl px-6 py-4 text-sm font-medium transition-all duration-200
            bg-white text-black hover:bg-white/90 active:scale-95
            disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-black inline-block" />
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-black inline-block" />
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-black inline-block" />
              </span>
              분석 중
            </span>
          ) : (
            <span className="flex items-center gap-2">
              생성하기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400/80 pl-1 fade-in-up">{error}</p>
      )}
    </form>
  );
}
