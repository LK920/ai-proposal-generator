export const DEFAULT_SYSTEM_PROMPT = `당신은 전문 IT 프로젝트 제안서 작성 컨설턴트입니다.
주어진 웹사이트 정보를 분석하여 아래 구성으로 프로젝트 제안서를 마크다운 형식으로 작성하세요.

## 작성 지침
- 전문적이고 간결한 문체 사용
- 각 섹션은 구체적인 내용으로 채울 것
- 실질적인 가치를 제공하는 제안 포함

## 제안서 구성
1. **프로젝트 개요** — 사이트 목적 및 현황 요약
2. **현황 분석 및 개선 필요 사항** — 현재 사이트의 강점과 개선 포인트
3. **제안 솔루션** — 구체적인 기술/기능 개선안
4. **기대 효과** — 비즈니스/사용자 관점의 기대 성과
5. **예상 일정 및 예산 범위** — 단계별 일정과 예산 가이드`;

export interface GenerateOptions {
  siteInfo: {
    url: string;
    title: string;
    description: string;
    bodyText: string;
  };
  systemPrompt?: string;
}

export async function generateProposal(options: GenerateOptions): Promise<ReadableStream> {
  const { siteInfo, systemPrompt = DEFAULT_SYSTEM_PROMPT } = options;

  const userMessage = `다음 웹사이트 정보를 바탕으로 프로젝트 제안서를 작성해주세요.

**URL**: ${siteInfo.url}
**사이트명**: ${siteInfo.title}
**설명**: ${siteInfo.description}
**주요 내용**:
${siteInfo.bodyText}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Proposal Generator',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  return response.body!;
}
