/**
 * 이벤투스 블로그 글 검사 — 올리기 전에 반드시 통과해야 한다
 * ──────────────────────────────────────────────────
 *   node scripts/blog-check.mjs                 모든 글 검사(중복 비교는 가장 최근 날짜 글만)
 *   node scripts/blog-check.mjs --new a.json …  새로 쓴 글만 엄격히 검사하고, 기존 글 전부와 중복 비교
 *
 * 형식·자료가 틀린 글, 지어낼 위험이 있는 표현(가격·순위·연혁·후기·경험 늘려 말하기), 목록에 없는 사진,
 * 사진 장소를 속이는 캡션, 근거 없는 사실, 손으로 만든 공식 출처 주소, 사이트에 없는 서비스 약속,
 * 행사 이야기에 없는 고객사 이름, 동네에 지어낸 특징 붙이기, 지역 이름만 바꾼 글을 막는다. 실패하면 exit 1.
 * (HD기획 scripts/blog-check.mjs 를 이벤투스에 맞게 옮긴 것. 자동 견적서가 없어서 견적서 품목 대신 사이트 서비스 낱말로 본다.)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { 글읽기, 지역표, 사진목록, 본문글, 글이미지들, 글자만 } from './build-blog.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const 인자 = process.argv.slice(2);
const 새파일 = 인자[0] === '--new' ? 인자.slice(1) : null;
const 새글 = 새파일 ? new Set(새파일.map((f) => f.split(/[\\/]/).pop())) : null;

const 지역 = 지역표(ROOT);
const 사진 = 사진목록(ROOT);
const posts = 글읽기(ROOT);
const 공식출처 = JSON.parse(readFileSync(resolve(ROOT, '_blog', 'sources.json'), 'utf8')).출처;
const 도메인 = (u) => { try { return new URL(u).hostname.replace(/^(www|m)\./, ''); } catch { return null; } };
const 공식도메인 = new Set(공식출처.map((s) => 도메인(s.url)));
const 오늘 = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);   // 한국 날짜
const 지역이름들 = [...지역.values()].filter((r) => r.slug !== 'common').map((r) => r.이름);
const 정규식글자 = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* 사이트 서비스(영어진행 · 장소 대관 · 음향 조명 렌탈 · 사전 Zoom 미팅 · 프로그램 8) — 「견적 · 문의」 표에는 이 낱말만 */
const 낱말로 = (s) => String(s).split(/[^가-힣A-Za-z]+/).filter((t) => t.length >= 2);
const 견적낱말 = new Set([
  '영어', '진행', '사회', 'MC', '아나운서', '섭외', '원어민', '팀빌딩', '레크레이션', '체육대회', '운동회', '송년회', '파티', '워크샵', '워크숍', '특강', '세미나', '캠프',
  '장소', '대관', '연회장', '체육관', '음향', '조명', '마이크', '스피커', '렌탈', '게임물품', '게임', '물품', '에어바운스', 'Zoom', '미팅', '사전', '답사', '동선', '프로그램', '시상', '추첨',
  '날짜', '인원', '참석자', '국적', '언어', '분위기', '일정', '시간표', '순서',
]);
const 견적품목인가 = (칸) => 낱말로(글자만(칸)).some((t) => [...견적낱말].some((w) => t.includes(w) || w.includes(t)));
const 없는품목 = ['케이터링', '도시락', '셔틀버스', '이동식 화장실', '무대 설치', '무대를 설치', 'LED', '전광판', '통역 수신기', '통역 부스', '동시통역 장비', '단체복', '숙소', '꽃장식', '드론', '불꽃', '현수막 제작', '천막'];
const 약속말 = /(빌릴 수 있습니다|빌려 드립니다|대여가 가능|대여해 드립니다|대여합니다|렌탈해 드립니다|신청하실 수 있습니다|골라 보내 주시면|골라 신청|보유하고 있|준비해 드립니다|마련해 드립니다|맡겨 주시면|(^|\s)네,)/;

const 오류 = [];
const 경고 = [];
const 틀림 = (p, m) => 오류.push(`✗ ${p._파일}: ${m}`);
const 주의 = (p, m) => 경고.push(`△ ${p._파일}: ${m}`);
const 붙여 = (s) => String(s || '').replace(/\*\*/g, '').replace(/\s+/g, '');
const 글자수 = (s) => [...String(s || '')].length;
const 문장들 = (t) => String(t || '').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

/* 확인할 수 없는 회사 자랑 · 가격 · 후기는 쓰지 않는다 */
const 금지 = [
  [/\d[\d,]*\s*(만|천|억)?\s*원(?=$|[\s.,)·~/]|대|이|을|은|부터|까지|씩|선|정도|가량|짜리)/, '가격(원) — 가격은 쓰지 않는다'],
  [/최저가|업계\s*최초|업계\s*1위|지역\s*1위|실적\s*1위|No\.?\s*1|넘버원/i, '확인할 수 없는 1위·최초 표현'],
  [/100\s*%|무조건|보장합니다|보장해\s*드립니다/, '보장·100% 표현'],
  [/\d+\s*년\s*(경력|전통|노하우|업력)|설립\s*(연도|이래|이후)/, '회사 연혁·경력 연수 — 쓰지 않는다'],
  [/후기|고객님\s*말씀|만족도|별점|리뷰/, '후기·만족도 — 지어낼 위험이 있어 쓰지 않는다'],
  [/\d[\d,]*\s*(건|회)\s*(이상|넘게|넘는)?\s*(의\s*)?(행사|진행|실적)/, '행사 건수 — 쓰지 않는다'],
  [/\d[\d,]*\s*(명|천\s*명|만\s*명)\s*(규모로|가\s*참가|이\s*참가|의\s*참가|을\s*운영|을\s*동원|이\s*모였|이\s*왔)/, '우리 행사의 참가 인원 수 — 쓰지 않는다'],
  [/(대응해|맡아|진행해|운영해|해|도와|준비해)\s*(왔|온\s*경험)/, "경험을 늘려 말하는 표현('~해 왔습니다') — 현장기록의 행사 이름으로만 말한다"],
  [/Since\s*20\d\d|20\d\d\s*년\s*(부터|이래)|\d+\s*년\s*이상\s*(의\s*)?(경험|경력|진행)/i, '회사 연혁 · 경력 연수 — 쓰지 않는다'],
  [/에이블|ablecomm|APEC|삼성|\bLG\b|엘지|나이키|NIKE|현대건설(?!기계)|현대중공업|삼성E&A|SIEMENS|지멘스|Morgan|모건|JP\s*Morgan|S&P|Lancome|랑콤|Shell|쉘|연세대|숭실대|경기대|Arirang|아리랑|\bIVI\b|국제백신|하이서울|Hi\s*Seoul|스\*키|한국외국인학교|국제학교/i, '행사 이야기에 없는 고객사 · 기관 이름 — 블로그에는 행사 이야기 다섯 곳(HD현대건설기계 · ICON · 쿠팡 · 경원재 바이 워커힐 · 서울클럽)만 쓴다'],
  [/이성진|정현\s*(대표|담당|MC|사회자|님)/, '대표 · 담당자 실명 — 본문에 쓰지 않는다'],
  [/사업자\s*(등록)?\s*번호|\d{3}-\d{2}-\d{5}/, '사업자번호 — 쓰지 않는다'],
  [/차로\s*(약\s*)?\d+\s*분|\d+(\.\d+)?\s*km/, '이동 시간 · 거리 — 조사하지 않았으니 쓰지 않는다'],
  [/사진[은이]?\s*아직\s*없|사진이\s*쌓이는\s*대로|(이\s*글|글|사진)[을은도]?\s*(바꿀|고칠|갱신할|보탤|더할|업데이트할)\s*예정|작성자용/, '작성자용 메모를 글에 옮겼거나 글을 나중에 고치겠다고 약속했다'],
];

const 링크들 = (글) => [...String(글 || '').matchAll(/\[([^\]]+)\]\(([^)\s]*)\)/g)].map((m) => m[2]);
const 허브주소 = new Set(['/blog/', ...[...지역.keys()].map((k) => `/blog/${k}/`)]);
const 글주소들 = new Set(posts.flatMap((p) => [`/blog/${p.slug}/`, `/blog/${encodeURIComponent(p.slug)}/`]));
function 내부주소있나(u) {
  const 경로 = u.split('#')[0].split('?')[0];
  if (허브주소.has(경로) || 글주소들.has(경로)) return true;
  if (경로.startsWith('/blog/')) return false;
  if (경로 === '/') return true;
  const 파일 = resolve(ROOT, '.' + decodeURIComponent(경로));
  return 경로.endsWith('/') ? existsSync(resolve(파일, 'index.html')) : existsSync(파일);
}

/* 글자 4개씩 묶어 겹치는 비율 — 지역 이름만 바꾼 글을 잡는다 */
function 조각들(p) {
  let t = 본문글(p);
  for (const n of 지역이름들) t = t.split(n).join('');
  t = t.replace(/[\s\d.,·—\-()［\]\[/:%~]+/g, '');
  const s = new Set();
  for (let i = 0; i + 4 <= t.length; i++) s.add(t.slice(i, i + 4));
  return s;
}
const 겹침 = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1); };

const 슬러그수 = new Map();
posts.forEach((p) => 슬러그수.set(p.slug, (슬러그수.get(p.slug) || 0) + 1));
const 최근날짜 = posts[0] ? posts[0].date : '';
const 검사대상 = posts.filter((p) => (새글 ? 새글.has(p._파일) : true));
const 비교대상 = posts.filter((p) => (새글 ? 새글.has(p._파일) : p.date === 최근날짜));
if (새글 && 검사대상.length !== 새글.size) 오류.push(`✗ --new 로 준 파일 중 _blog/posts 에 없는 것이 있다: ${[...새글].join(', ')}`);

for (const p of 검사대상) {
  const r = 지역.get(p.region);
  /* 형식 */
  const 전 = 오류.length;
  for (const k of ['slug', 'date', 'region', 'topic', 'title', 'description', 'lead']) if (typeof p[k] !== 'string' || !p[k].trim()) 틀림(p, `${k} 없음`);
  if (!p.keyword || typeof p.keyword.main !== 'string') 틀림(p, 'keyword.main 없음');
  if (!Array.isArray(p.points) || p.points.length < 3 || p.points.length > 5) 틀림(p, 'points 는 3~5개');
  if (!Array.isArray(p.sections) || p.sections.length < 4) 틀림(p, 'sections 는 4개 이상');
  if (!Array.isArray(p.faq) || p.faq.length < 2 || p.faq.length > 6) 틀림(p, 'faq 는 2~6개');
  if (!Array.isArray(p.sources)) 틀림(p, 'sources 배열 없음(없으면 [])');
  if (오류.length > 전 && (!Array.isArray(p.sections) || !p.keyword || !p.cover)) continue;

  if (!/^[가-힣a-z0-9]+(-[가-힣a-z0-9]+)*$/.test(p.slug) || 글자수(p.slug) > 70) 틀림(p, 'slug 는 한글·영소문자·숫자와 - 만, 70자 이하');
  if (지역.has(p.slug) || p.slug === 'page') 틀림(p, 'slug 가 예약된 주소와 같다');
  if (슬러그수.get(p.slug) > 1) 틀림(p, 'slug 가 다른 글과 같다');
  if (p._파일 !== `${p.date}-${p.slug}.json`) 틀림(p, `파일 이름은 ${p.date}-${p.slug}.json`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || p.date > 오늘) 틀림(p, `date 형식이 틀렸거나 오늘(${오늘})보다 뒤`);
  if (!r) 틀림(p, `region '${p.region}' 은 _blog/regions.json 에 없다`);

  /* 제목 · 설명 · 키워드 */
  if (글자수(p.title) < 15 || 글자수(p.title) > 50) 틀림(p, `title 은 15~50자 (지금 ${글자수(p.title)})`);
  if (글자수(p.description) < 70 || 글자수(p.description) > 160) 틀림(p, `description 은 70~160자 (지금 ${글자수(p.description)})`);
  if (글자수(p.lead) < 80 || 글자수(p.lead) > 420) 틀림(p, `lead 는 80~420자 (지금 ${글자수(p.lead)})`);
  if (r && p.region !== 'common' && !p.title.includes(r.이름)) 틀림(p, `title 에 지역 이름(${r.이름})이 없다`);
  const 키 = 붙여(p.keyword.main);
  if (!붙여(p.title).includes(키)) 틀림(p, `title 에 핵심 키워드 '${p.keyword.main}' 가 없다`);
  if (!붙여(p.description + p.lead).includes(키)) 틀림(p, `description 이나 lead 에 핵심 키워드가 없다`);
  const 본문 = 본문글(p);
  const 키횟수 = 붙여(본문).split(키).length - 1;
  if (키횟수 > 12) 주의(p, `핵심 키워드가 본문에 ${키횟수}번 — 억지로 넣은 느낌이 난다`);
  if (!p.sections.some((s) => 붙여(s.h2).includes(키) || (r && s.h2.includes(r.이름)))) 주의(p, '소제목(h2) 어디에도 키워드·지역 이름이 없다');

  /* 분량 · 구성 */
  const 길이 = 글자수(본문);
  if (길이 < 1800) 틀림(p, `본문이 짧다 (${길이}자, 1800자 이상)`);
  else if (길이 < 2500) 주의(p, `본문 ${길이}자 — 2500자 이상을 권한다`);
  const 블록들 = p.sections.flatMap((s) => s.blocks || []);
  p.sections.forEach((s, i) => { if (!s.h2 || !(s.blocks || []).length) 틀림(p, `sections[${i}] 에 h2 나 blocks 가 없다`); });
  if (!블록들.some((b) => b.table)) 주의(p, '표(table)가 하나도 없다');
  블록들.forEach((b) => {
    if (b.table && (!Array.isArray(b.table.head) || !b.table.rows.every((row) => row.length === b.table.head.length))) 틀림(p, '표의 칸 수가 머리와 다르다');
  });
  (p.faq || []).forEach((f, i) => { if (!f.q || !f.a) 틀림(p, `faq[${i}] 에 q 나 a 가 없다`); });

  /* 사진 */
  const 이미지 = 글이미지들(p);
  if (!p.cover) 틀림(p, 'cover 사진이 없다');
  if (이미지.length < 3) 틀림(p, `사진은 표지 포함 3장 이상 (지금 ${이미지.length})`);
  const 묶음 = new Set();
  for (const im of 이미지) {
    const 정보 = 사진.get(im.path);
    if (!정보) { 틀림(p, `사진 ${im.path} 은 _blog/photos.json 에 없다`); continue; }
    if (정보.제외) { 틀림(p, `사진 ${im.path} 은 쓰지 않는 사진 — ${정보.제외}`); continue; }
    if (묶음.has(정보.묶음번호)) 틀림(p, `사진 ${im.path} — 같은 장면 묶음의 사진을 한 글에 두 장 썼다`);
    묶음.add(정보.묶음번호);
    if (!existsSync(resolve(ROOT, '.' + im.path))) 틀림(p, `사진 파일이 없다: ${im.path}`);
    if (글자수(im.alt) < 8 || 글자수(im.alt) > 120) 틀림(p, `사진 ${im.path} alt 는 8~120자`);
    if (!im.caption) 틀림(p, `사진 ${im.path} caption 없음`);
    const 설명 = `${im.alt} ${im.caption}`;
    for (const n of 지역이름들.filter((x) => 설명.includes(x))) {
      if (정보.지역 !== n && !String(정보.행사 || '').includes(n)) 틀림(p, `사진 ${im.path} 설명에 '${n}' — 목록상 이 사진의 지역은 '${정보.지역 || '모름'}'. 찍은 곳을 바꿔 쓰지 않는다`);
    }
  }

  /* 표현 · 링크 */
  const 캡션들 = 이미지.map((im) => `${im.alt} ${im.caption}`);
  const 전체글 = [p.title, p.description, 본문, ...캡션들].join('\n');
  for (const [식, 이유] of 금지) { const m = 전체글.match(식); if (m) 틀림(p, `${이유} — "${m[0]}"`); }
  const 원문 = JSON.stringify(p);
  for (const u of 링크들(원문)) {
    if (u.startsWith('/')) { if (!내부주소있나(u)) 틀림(p, `없는 내부 주소 링크: ${u}`); }
    else if (!u.startsWith('https://')) 틀림(p, `링크는 / 또는 https:// 로 시작: ${u}`);
  }
  if (!링크들(원문).some((u) => u.startsWith('/contact.html'))) 틀림(p, '예약 · 문의(/contact.html) 링크가 없다');
  if (링크들(원문).filter((u) => u.startsWith('/')).length < 2) 주의(p, '내부 링크가 2개 미만이다');

  /* 견적서에 없는 품목을 약속하지 않는다 */
  p.sections.forEach((s) => {
    if (!/견적/.test(s.h2)) return;
    (s.blocks || []).filter((b) => b.table).forEach((b) => b.table.rows.forEach((row) => {
      if (!견적품목인가(row[0])) 틀림(p, `견적 · 문의 표의 '${글자만(row[0])}' 은 사이트 서비스 낱말이 아니다 — 사이트에 없는 것을 맡는 일처럼 적지 않는다`);
    }));
  });
  const 약속단위 = [...문장들(글자만([p.description, ...(p.points || []), ...p.sections.flatMap((s) => (s.blocks || []).flatMap((b) => [b.p, b.tip, ...(b.ul || []), ...(b.ol || [])]))].filter(Boolean).join('\n'))),
    ...(p.faq || []).map((f) => 글자만(`${f.q} ${f.a}`))];
  for (const 단위 of 약속단위) {
    const 품목 = 없는품목.find((w) => 단위.includes(w));
    if (품목 && 약속말.test(단위)) 틀림(p, `사이트 서비스에 없는 '${품목}' 을 해 준다고 약속했다 — "${단위.slice(0, 60)}…"`);
  }

  /* 동네에 지어낸 특징을 붙이거나, 지역 문의 통계를 지어내지 않는다 */
  if (r && p.region !== 'common') {
    for (const 동네 of r.동네 || []) {
      const 식 = new RegExp(`${정규식글자(동네)}[^.!?\\n]{0,20}(처럼|같은|같이)|${정규식글자(동네)}\\s*(인근|근처|일대|주변|쪽)\\s*(은|는|처럼|의|에서는)`);
      const m = 본문.match(식);
      if (m) 틀림(p, `동네 '${동네}' 에 특징을 붙인 문장 — 동네 이름은 괄호 속 나열로만 쓴다: "${m[0]}"`);
    }
    const 지역말 = [r.이름, ...(r.동네 || [])];
    for (const 문장 of 문장들(본문)) {
      if (지역말.some((w) => 문장.includes(w)) && /(경우[가도]|문의[가도]|요청[이도]|찾는\s*분[이도])\s*(흔|잦|많)/.test(문장)) {
        틀림(p, `지역 문의 · 요청이 흔하다는 통계를 지어낸 문장 — "${문장.slice(0, 60)}…"`);
      }
    }
  }

  /* 출처 — 공식 기관 도메인은 사람이 확인한 주소(_blog/sources.json)만 */
  const 출처주소 = new Set();
  (p.sources || []).forEach((s, i) => {
    if (!s.name || !/^https:\/\//.test(s.url || '')) { 틀림(p, `sources[${i}] 는 name 과 https:// url 이 필요`); return; }
    출처주소.add(s.url);
    const d = 도메인(s.url);
    if (!d) 틀림(p, `sources[${i}] 주소 형식이 틀렸다: ${s.url}`);
    else if (공식도메인.has(d) && !공식출처.some((o) => o.url === s.url)) 틀림(p, `sources[${i}] ${d} 주소는 _blog/sources.json 에 있는 것을 그대로 쓴다: ${s.url}`);
  });
  if (/「[^」]*(법|규칙|기준)」|법\s*(제\s*\d|에\s*따라|상의?\s)|시행령|시행규칙|조례|기상청|고시|지침|데이터랩|소비자원/.test(본문) && !(p.sources || []).length) 틀림(p, '법·기준·기관·통계 이야기를 했는데 sources 가 비었다');

  /* 근거 — 글에 쓴 사실이 어디서 왔는지 */
  if (p.region !== 'common') {
    const 근거 = p.근거;
    if (!Array.isArray(근거) || 근거.length < 3) 틀림(p, '근거는 3개 이상 — { "내용": 본문에 그대로 있는 구절, "출처": "regions.json" 또는 sources 의 주소 }');
    else {
      const 본문붙임 = 붙여([본문, ...캡션들, p.title, p.description].join(' '));
      const 쓸자료 = r ? { ...r, 주의: (r.주의 || []).filter((x) => !String(x).startsWith('(작성자용')) } : {};
      const 지역자료 = 붙여(JSON.stringify(쓸자료));
      const 핵심자료 = 붙여(JSON.stringify({ 이동: 쓸자료.이동, 주의: 쓸자료.주의, 현장기록: 쓸자료.현장기록 }));
      let 핵심근거 = 0;
      근거.forEach((g, i) => {
        if (!g || !g.내용 || !g.출처) { 틀림(p, `근거[${i}] 에 내용 · 출처가 없다`); return; }
        if (글자수(g.내용) < 4) 틀림(p, `근거[${i}] 내용이 너무 짧다`);
        if (!본문붙임.includes(붙여(g.내용))) 틀림(p, `근거[${i}] "${g.내용}" 이 본문에 그대로 없다`);
        if (g.출처 === 'regions.json') {
          if (글자수(g.내용) > 25) 틀림(p, `근거[${i}] regions.json 근거는 25자 이하 핵심어로`);
          if (!지역자료.includes(붙여(g.내용))) 틀림(p, `근거[${i}] "${g.내용}" 은 regions.json 의 ${r ? r.이름 : p.region} 자료에 없다`);
          else if (핵심자료.includes(붙여(g.내용))) 핵심근거 += 1;
        } else if (!출처주소.has(g.출처)) 틀림(p, `근거[${i}] 출처는 'regions.json' 이거나 이 글 sources 에 있는 주소여야 한다: ${g.출처}`);
      });
      if (핵심근거 < 1) 틀림(p, 'regions.json 근거 중 하나 이상은 이동 · 주의 · 현장기록에서 가져온다(동네 이름 · 행사 종류만으로는 근거가 안 된다)');
    }
  }

  /* 같은 지역 · 같은 주제 중복 */
  const 같은것 = posts.filter((o) => o !== p && o.region === p.region && o.topic === p.topic);
  if (같은것.length) 틀림(p, `같은 지역·같은 주제 글이 이미 있다: ${같은것.map((o) => o._파일).join(', ')}`);
}

/* 이름만 바꾼 글 */
const 조각표 = new Map();
const 조각 = (p) => { if (!조각표.has(p)) 조각표.set(p, 조각들(p)); return 조각표.get(p); };
for (const p of 비교대상) {
  for (const o of posts) {
    if (o === p || (비교대상.includes(o) && o._파일 < p._파일)) continue;
    const v = 겹침(조각(p), 조각(o));
    if (v > 0.3) 틀림(p, `${o._파일} 와 본문이 ${(v * 100).toFixed(0)}% 겹친다 — 지역 이름만 바꾼 글은 올리지 않는다`);
    else if (v > 0.2) 주의(p, `${o._파일} 와 본문이 ${(v * 100).toFixed(0)}% 겹친다`);
  }
}

console.log(`블로그 검사 — 글 ${posts.length}개 중 ${검사대상.length}개 검사, 중복 비교 ${비교대상.length}개`);
경고.forEach((m) => console.log(m));
오류.forEach((m) => console.log(m));
if (오류.length) { console.log(`실패 ${오류.length}건`); process.exit(1); }
console.log(`통과${경고.length ? ` (주의 ${경고.length}건)` : ''}`);
