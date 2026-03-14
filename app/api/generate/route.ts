import { NextRequest } from 'next/server';
// OpenRouter → OpenAI로 전환. 롤백 시 아래 주석 해제 후 openai 라인 주석 처리
// import { generateProposal } from '@/lib/openrouter';
import { generateProposalOpenAI as generateProposal } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { siteInfo, systemPrompt } = await req.json();

    if (!siteInfo?.url) {
      return new Response(JSON.stringify({ error: '사이트 정보가 필요합니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = await generateProposal({ siteInfo, systemPrompt });

    // SSE 스트리밍 응답
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
