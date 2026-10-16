// Server Components에서 fetch할 때 쓰는 백엔드 절대 주소.
// (브라우저에서 직접 fetch하는 client component는 next.config.ts의
// rewrites 덕분에 상대경로 "/api/..."로 호출하면 됨 — CORS 설정 불필요)
export const API_BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export type PersonListItem = {
  name: string;
  country: "魏" | "蜀" | "吳" | null;
  has_jeongsa: boolean;
  has_yeonui: boolean;
};

export type PersonDetail = {
  name: string;
  jeongsa: {
    source_juan: string;
    country: string;
    biography: string;
    source_url: string;
    is_minor_biography: boolean;
    mentioned_relatives: { relation: string; name: string }[];
  } | null;
  yeonui: {
    chapter: number;
    chapter_title: string;
    excerpt: string[];
    tagging_method: string;
    source_url: string;
  }[];
};

export type NetworkData = {
  nodes: { id: string; count: number }[];
  links: { source: string; target: string; value: number }[];
};

export type StorylineChapter = {
  chapter: number;
  chapter_title: string;
  chapter_title_ko: string;
  person_count: number;
  persons: { name: string; excerpt_count: number }[];
};

export type StorylineData = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  chapter_start: number;
  chapter_end: number;
  chapter_count: number;
  person_count: number;
  chapters: StorylineChapter[];
  featured_persons: { name: string; chapter_count: number }[];
};
