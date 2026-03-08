import { NextRequest } from 'next/server';
import { generateProposal } from '@/lib/openrouter';

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
