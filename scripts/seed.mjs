import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://brrurspxiycpzryqtzbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycnVyc3B4aXljcHpyeXF0emJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzA1NzgsImV4cCI6MjA4ODU0NjU3OH0.qzlo4PhwDLD0etDmXcmi6-cBa0IJxLaZt5P4ZVhi-88';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dummyProposal = {
  site_url: 'https://example.com',
  site_title: 'Example Corp',
  content: `# Example Corp 프로젝트 제안서

## 1. 프로젝트 개요
Example Corp는 현재 정적인 랜딩 페이지로 운영 중이며, 사용자 경험 개선과 전환율 향상을 위한 웹 리뉴얼이 필요합니다.

## 2. 현황 분석 및 개선 필요 사항
- **강점**: 명확한 브랜드 아이덴티티, 안정적인 서비스 운영
- **개선 필요**: 모바일 최적화 미흡, 페이지 로딩 속도 저하, CTA 버튼 부재

## 3. 제안 솔루션
- Next.js 기반 SSR 웹사이트 재구축
- 반응형 디자인 적용 (Mobile First)
- Core Web Vitals 최적화 (LCP < 2.5s)
- Google Analytics 4 연동

## 4. 기대 효과
- 모바일 전환율 **30% 향상** 예상
- 페이지 이탈률 **20% 감소**
- 브랜드 신뢰도 향상

## 5. 예상 일정 및 예산 범위
| 단계 | 기간 | 내용 |
|------|------|------|
| 기획/디자인 | 2주 | UI/UX 설계, 와이어프레임 |
| 개발 | 4주 | 프론트엔드 구현 |
| 테스트/배포 | 1주 | QA 및 런칭 |

**예산**: 800만원 ~ 1,200만원`,
};

const { data, error } = await supabase
  .from('proposals')
  .insert(dummyProposal)
  .select('id, site_title, created_at')
  .single();

if (error) {
  console.error('❌ 삽입 실패:', error.message);
} else {
  console.log('✅ 삽입 성공!');
  console.log('  ID:', data.id);
  console.log('  제목:', data.site_title);
  console.log('  생성일:', data.created_at);
}
