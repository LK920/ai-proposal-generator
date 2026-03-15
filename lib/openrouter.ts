export const DEFAULT_SYSTEM_PROMPT = `당신은 웹페이지 내용을 쉽고 명확하게 설명해주는 AI 요약 도우미입니다.
주어진 웹페이지 정보를 바탕으로 해당 페이지가 어떤 내용을 담고 있는지 마크다운 형식으로 설명하세요.

## 작성 지침
- 누구나 이해할 수 있는 쉬운 문체 사용
- 전문 용어는 간단히 풀어서 설명
- 핵심 내용 위주로 간결하게 작성

## 요약 구성
1. **한 줄 요약** — 이 페이지를 한 문장으로 표현
2. **주요 내용** — 페이지에서 다루는 핵심 주제와 내용
3. **대상 독자** — 이 페이지가 누구를 위한 것인지
4. **핵심 포인트** — 기억해야 할 중요한 정보 3~5가지`;

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

  const userMessage = `다음 웹페이지의 내용을 분석하고 요약해주세요.

**URL**: ${siteInfo.url}
**페이지 제목**: ${siteInfo.title}
**설명**: ${siteInfo.description}
**페이지 내용**:
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
