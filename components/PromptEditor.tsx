'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/openrouter';

const STORAGE_KEY = 'custom_system_prompt';

interface PromptEditorProps {
  onChange: (prompt: string) => void;
}

export default function PromptEditor({ onChange }: PromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(DEFAULT_SYSTEM_PROMPT);
  const [saved, setSaved] = useState(false);
  const isCustomized = value !== DEFAULT_SYSTEM_PROMPT;

  // localStorage에서 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setValue(stored);
      onChange(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, value);
    onChange(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setValue(DEFAULT_SYSTEM_PROMPT);
    localStorage.removeItem(STORAGE_KEY);
    onChange(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full glass rounded-2xl px-5 py-3.5 flex items-center justify-between
          text-white/40 hover:text-white/70 hover:bg-white/05 transition-all duration-200"
      >
        <span className="flex items-center gap-2.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          AI 프롬프트 커스터마이징
          {isCustomized && (
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
          )}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Editor panel */}
      {isOpen && (
        <div className="glass rounded-2xl p-5 space-y-4 fade-in-up">
          {/* Label */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 uppercase tracking-widest">시스템 프롬프트</p>
            {isCustomized && (
              <button
                onClick={handleReset}
                className="text-xs text-white/25 hover:text-white/60 transition-colors flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                기본값으로 초기화
              </button>
            )}
          </div>

          {/* Textarea */}
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={10}
            className="glass-input w-full rounded-xl p-4 text-sm text-white/80 leading-relaxed
              resize-y font-mono placeholder-white/20"
            placeholder="AI에게 전달할 시스템 프롬프트를 입력하세요..."
          />

          {/* Guide */}
          <p className="text-xs text-white/20 leading-relaxed">
            프롬프트를 수정하면 다음 요약부터 적용됩니다. 브라우저에 저장됩니다.
          </p>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200
                bg-white text-black hover:bg-white/90 active:scale-95 flex items-center gap-2"
            >
              {saved ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  저장됨
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  저장
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
