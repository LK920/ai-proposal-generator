'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface HistoryItem {
  id: string;
  site_url: string;
  site_title: string | null;
  content: string;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 모달: 제안서 전체 보기
function ProposalModal({ item, onClose }: { item: HistoryItem; onClose: () => void }) {
  const handleCopy = () => navigator.clipboard.writeText(item.content);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-strong rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/06">
          <div className="space-y-1 pr-4">
            <p className="text-xs text-white/30 uppercase tracking-widest">제안서</p>
            <h3 className="text-white font-semibold leading-snug">
              {item.site_title || item.site_url}
            </h3>
            <p className="text-xs text-white/25">{formatDate(item.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="glass rounded-xl px-3 py-2 text-xs text-white/40 hover:text-white
                hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              복사
            </button>
            <button
              onClick={onClose}
              className="glass rounded-xl p-2 text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto p-6 proposal-content text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function ProposalHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, refreshTrigger]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full glass rounded-2xl px-5 py-3.5 flex items-center justify-between
          text-white/40 hover:text-white/70 hover:bg-white/05 transition-all duration-200 group"
      >
        <span className="flex items-center gap-2.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          생성 히스토리
          {items.length > 0 && (
            <span className="glass rounded-full px-2 py-0.5 text-xs text-white/30">
              {items.length}
            </span>
          )}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* List */}
      {isOpen && (
        <div className="glass rounded-2xl overflow-hidden fade-in-up">
          {loading ? (
            <div className="px-5 py-8 flex justify-center gap-1">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-white/20">
              저장된 제안서가 없습니다.
            </div>
          ) : (
            <ul>
              {items.map((item, i) => (
                <li key={item.id}>
                  <button
                    onClick={() => setSelected(item)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4
                      hover:bg-white/05 transition-colors text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/70 font-medium truncate group-hover:text-white transition-colors">
                        {item.site_title || item.site_url}
                      </p>
                      <p className="text-xs text-white/25 mt-0.5 truncate">{item.site_url}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-white/20">{formatDate(item.created_at)}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" className="text-white/20 group-hover:text-white/50 transition-colors">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                  {i < items.length - 1 && (
                    <div className="h-px bg-white/04 mx-5" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <ProposalModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
