'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProposalResultProps {
  content: string;
  isStreaming: boolean;
  siteTitle?: string;
  siteUrl?: string;
}

export default function ProposalResult({
  content,
  isStreaming,
  siteTitle,
  siteUrl,
}: ProposalResultProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <div className="glass-strong rounded-3xl p-8 fade-in-up relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/60 inline-block" />
            <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
              AI Generated Proposal
            </span>
          </div>
          {siteTitle && (
            <h2 className="text-white font-semibold text-lg leading-tight">{siteTitle}</h2>
          )}
          {siteUrl && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {siteUrl}
            </a>
          )}
        </div>

        {!isStreaming && content && (
          <button
            onClick={handleCopy}
            className="flex-shrink-0 glass rounded-xl px-3 py-2 text-xs text-white/50
              hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            복사
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/06 mb-6" />

      {/* Content */}
      <div className="proposal-content text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        {isStreaming && (
          <span className="cursor-blink inline-block w-0.5 h-4 bg-white/60 ml-0.5 align-middle" />
        )}
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
          <span className="flex gap-1">
            <span className="pulse-dot w-1 h-1 rounded-full bg-white/40 inline-block" />
            <span className="pulse-dot w-1 h-1 rounded-full bg-white/40 inline-block" />
            <span className="pulse-dot w-1 h-1 rounded-full bg-white/40 inline-block" />
          </span>
          제안서 생성 중...
        </div>
      )}
    </div>
  );
}
