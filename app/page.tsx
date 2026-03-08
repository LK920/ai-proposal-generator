'use client';

import { useState } from 'react';
import ProposalForm from '@/components/ProposalForm';
import ProposalResult from '@/components/ProposalResult';

interface SiteInfo {
  url: string;
  title: string;
  description: string;
  bodyText: string;
}

type Status = 'idle' | 'scraping' | 'generating' | 'done' | 'error';

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [proposal, setProposal] = useState('');
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (url: string) => {
    setStatus('scraping');
    setProposal('');
    setSiteInfo(null);
    setErrorMsg('');

    try {
      // Step 1: Scrape
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!scrapeRes.ok) {
        const { error } = await scrapeRes.json();
        throw new Error(error || '스크래핑에 실패했습니다.');
      }

      const info: SiteInfo = await scrapeRes.json();
      setSiteInfo(info);

      // Step 2: Generate (streaming)
      setStatus('generating');
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteInfo: info }),
      });

      if (!genRes.ok) {
        const { error } = await genRes.json();
        throw new Error(error || '제안서 생성에 실패했습니다.');
      }

      const reader = genRes.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              accumulated += delta;
              setProposal(accumulated);
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      setStatus('done');

      // Step 3: Supabase에 저장
      await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: info.url,
          site_title: info.title,
          content: accumulated,
        }),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setStatus('error');
    }
  };

  const isLoading = status === 'scraping' || status === 'generating';
  const isStreaming = status === 'generating';

  return (
    <div className="relative min-h-screen">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl glass flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xs text-white/30 font-medium tracking-widest uppercase">Proposal AI</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
            AI 제안서 생성기
          </h1>
          <p className="text-white/40 text-base leading-relaxed">
            URL을 입력하면 웹사이트를 분석하여<br />
            프로젝트 제안서를 자동으로 생성합니다.
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl p-6 mb-6">
          <ProposalForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Status message */}
        {status === 'scraping' && (
          <div className="glass rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 fade-in-up">
            <span className="flex gap-1">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
            </span>
            <span className="text-sm text-white/50">웹사이트 분석 중...</span>
          </div>
        )}

        {/* Error */}
        {status === 'error' && errorMsg && (
          <div className="glass rounded-2xl px-5 py-4 mb-6 border border-red-500/20 fade-in-up">
            <div className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="text-red-400 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-400/90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {(proposal || isStreaming) && siteInfo && (
          <ProposalResult
            content={proposal}
            isStreaming={isStreaming}
            siteTitle={siteInfo.title}
            siteUrl={siteInfo.url}
          />
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-white/15">
          Powered by OpenRouter · Claude Sonnet
        </div>
      </div>
    </div>
  );
}
