import OpenAI from 'openai';
import { DEFAULT_SYSTEM_PROMPT } from './openrouter';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateOptions {
  siteInfo: {
    url: string;
    title: string;
    description: string;
    bodyText: string;
  };
  systemPrompt?: string;
}

export async function generateProposalOpenAI(options: GenerateOptions): Promise<ReadableStream> {
  const { siteInfo, systemPrompt = DEFAULT_SYSTEM_PROMPT } = options;

  const userMessage = `다음 웹페이지의 내용을 분석하고 요약해주세요.

**URL**: ${siteInfo.url}
**페이지 제목**: ${siteInfo.title}
**설명**: ${siteInfo.description}
**페이지 내용**:
${siteInfo.bodyText}`;

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: true,
    max_tokens: 2000,
  });

  // OpenAI 스트림 → ReadableStream 변환
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          const data = `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
