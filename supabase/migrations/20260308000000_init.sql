-- 제안서 테이블
create table if not exists proposals (
  id          uuid primary key default gen_random_uuid(),
  site_url    text not null,
  site_title  text,
  content     text not null,
  created_at  timestamptz default now()
);

-- 프롬프트 템플릿 테이블
create table if not exists prompt_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  content     text not null,
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- 기본 프롬프트 삽입
insert into prompt_templates (name, content, is_default) values (
  '기본 프로젝트 제안서',
  '당신은 전문 IT 프로젝트 제안서 작성 컨설턴트입니다.
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
5. **예상 일정 및 예산 범위** — 단계별 일정과 예산 가이드',
  true
);

-- RLS (Row Level Security) — 공개 읽기/쓰기 허용 (회원가입 없음)
alter table proposals enable row level security;
alter table prompt_templates enable row level security;

create policy "proposals_public_read" on proposals for select using (true);
create policy "proposals_public_insert" on proposals for insert with check (true);

create policy "prompt_templates_public_read" on prompt_templates for select using (true);
