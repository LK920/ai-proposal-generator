import * as cheerio from 'cheerio';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  bodyText: string;
  media: MediaItem[];
  error?: string;
}

function resolveUrl(base: string, src: string): string | null {
  if (!src || src.startsWith('data:')) return null;
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

// 아이콘/에셋/GIF 등 불필요한 이미지 필터
function isContentImage(src: string): boolean {
  const lower = src.toLowerCase();
  // GIF, SVG, ICO 제외
  if (/\.(gif|svg|ico|webp)(\?|#|$)/.test(lower)) return false;
  // 경로에 asset/icon/emoji/logo/badge/button/sprite 포함 시 제외
  if (/\/(assets?|icons?|emoji|logos?|badges?|buttons?|sprites?|favicons?|pixel|tracking|ads?)\//.test(lower)) return false;
  // 1x1, 픽셀 트래킹 이미지 제외
  if (/\/(1x1|pixel|spacer|blank|transparent)\.(png|gif|jpg)/.test(lower)) return false;
  // 파일명이 icon, logo, emoji로 시작하는 경우 제외
  const filename = lower.split('/').pop()?.split('?')[0] || '';
  if (/^(icon|logo|emoji|badge|btn|button|arrow|chevron|close|menu|search|avatar)/.test(filename)) return false;
  return true;
}

function extractYouTubeId(src: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
  ];
  for (const p of patterns) {
    const m = src.match(p);
    if (m) return m[1];
  }
  return null;
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

  const media: MediaItem[] = [];
  const seenUrls = new Set<string>();

  const addMedia = (item: MediaItem) => {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      media.push(item);
    }
  };

  // JSON-LD에서 YouTube embedUrl 추출 (JS 렌더링 페이지 대응)
  const jsonLdYouTubeIds = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      const embedUrl = data?.associatedMedia?.embedUrl || data?.video?.embedUrl || data?.embedUrl || '';
      const ytId = extractYouTubeId(embedUrl);
      if (ytId) {
        jsonLdYouTubeIds.add(ytId);
        addMedia({ type: 'video', url: `https://www.youtube.com/embed/${ytId}` });
      }
    } catch {
      // JSON 파싱 실패 무시
    }
  });

  // OG 이미지 — YouTube 썸네일이면 video로 이미 처리됐으므로 이미지에서 제외
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  if (ogImage) {
    const resolved = resolveUrl(url, ogImage);
    // ytimg.com 썸네일이고 이미 해당 video가 추가됐으면 건너뜀
    const isYtThumbnail = ogImage.includes('ytimg.com') && jsonLdYouTubeIds.size > 0;
    if (resolved && !isYtThumbnail && isContentImage(resolved)) {
      addMedia({ type: 'image', url: resolved, alt: 'OG Image' });
    }
  }

  // YouTube iframe
  $('iframe').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const ytId = extractYouTubeId(src);
    if (ytId) {
      addMedia({ type: 'video', url: `https://www.youtube.com/embed/${ytId}` });
    }
  });

  // <video> 태그 — poster만 수집해 본문 이미지에서 제외 처리
  // 직접 파일(mp4, webm 등)은 iframe에 넣으면 다운로드 발생하므로 수집하지 않음
  const videoPosterUrls = new Set<string>();
  $('video').each((_, el) => {
    const poster = $(el).attr('poster');
    if (poster) {
      const resolved = resolveUrl(url, poster);
      if (resolved) videoPosterUrls.add(resolved);
    }
  });

  // 본문 이미지 — 콘텐츠 영역만, 최대 5장, 에셋/GIF/아이콘 제외
  // header, nav, footer, aside 내부는 탐색하지 않음
  $('header img, nav img, footer img, aside img').remove();
  $('main img, article img, .content img, #content img, [role="main"] img, .post img, .entry img').each((_, el) => {
    if (media.filter((m) => m.type === 'image').length >= 5) return;
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt') || '';
    const resolved = resolveUrl(url, src);
    if (resolved && !videoPosterUrls.has(resolved) && isContentImage(resolved)) {
      addMedia({ type: 'image', url: resolved, alt });
    }
  });

  // 불필요한 태그 제거 (텍스트 추출 전)
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

  return { url, title, description, bodyText, media };
}
