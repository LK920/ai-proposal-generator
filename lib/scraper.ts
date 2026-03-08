import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  bodyText: string;
  error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ProposalBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 불필요한 태그 제거
  $('script, style, nav, footer, iframe, noscript, [aria-hidden="true"]').remove();

  const title =
    $('title').text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    '';

  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

  // 핵심 텍스트 추출 (2000자 제한)
  const bodyText = $('main, article, #content, .content, body')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);

  return { url, title, description, bodyText };
}
