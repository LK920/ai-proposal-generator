import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // URL 형식 검증
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 });
    }

    const result = await scrapeUrl(parsedUrl.toString());
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '스크래핑 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
