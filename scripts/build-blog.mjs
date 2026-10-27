/**
 * 이벤투스 블로그 — _blog/posts/*.json 을 홈페이지 글로 만든다
 * ──────────────────────────────────────────────────────
 *   blog/               글 목록 (최신순, 24개씩 → blog/page/2/)
 *   blog/<지역>/        지역별 모음 (예: blog/gangnam/)
 *   blog/<글주소>/      글 하나
 *   rss.xml             블로그 RSS
 *   sitemap.xml · llms.txt 가 있으면 블로그 부분도 같이 갱신한다(지금은 시안이라 없다)
 *
 * 원본은 _blog/ 에 둔다. 밑줄로 시작하는 폴더는 GitHub Pages(Jekyll)가 공개하지 않는다.
 * blog/ 는 매번 지우고 새로 만든다 — 결과 HTML 을 손으로 고치지 말고 원본 JSON 이나 이 템플릿을 고친다.
 * 머리글 · 바닥글은 notice.html, 상담 띠는 index.html 에서 빌려 온다(tools/make_pages.py 와 같은 방식).
 * 사이트가 brizymedia.github.io/eventus/ 아래에 있어서, 글 JSON 의 '/…' 주소는 페이지 깊이에 맞춰 '../' 상대 주소로 바꾼다.
 * (HD기획 scripts/build-blog.mjs 를 이벤투스에 맞게 옮긴 것)
 *
 * 실행:  node scripts/build-blog.mjs      글 형식 · 규칙: _blog/GUIDE.md   ·   검사: node scripts/blog-check.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = 'https://brizymedia.github.io/eventus';   // 도메인을 붙이면 여기만 바꾼다
export const BRAND = '영어행사 전문 이벤투스';
const 쪽당 = 24;

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 글 안에서는 **굵게** 와 [글자](주소) 만 쓴다. 주소는 / 로 시작하거나 https:// 여야 한다. */
export function 인라인(글) {
  return esc(글)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, (m, t, u) =>
      u.startsWith('/') ? `<a href="${u}">${t}</a>` : `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
}
export const 글자만 = (글) => String(글 ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
export const 날짜글 = (d) => { const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[1]}년 ${+m[2]}월 ${+m[3]}일` : String(d || ''); };
export const 글주소 = (slug) => `/blog/${encodeURIComponent(slug)}/`;

export function 지역표(ROOT) {
  const j = JSON.parse(readFileSync(resolve(ROOT, '_blog', 'regions.json'), 'utf8'));
  const 표 = new Map(j.지역.map((r) => [r.slug, r]));
  표.set('common', { slug: 'common', 이름: '행사 준비 공통', 서비스페이지: '', 이동: '', 비중: 0 });
  return 표;
}

/** photos.json 의 묶음을 사진 한 장씩 풀어 경로 → 정보 로 */
export function 사진목록(ROOT) {
  const j = JSON.parse(readFileSync(resolve(ROOT, '_blog', 'photos.json'), 'utf8'));
  const 표 = new Map();
  j.묶음.forEach((g, i) => { (g.path || []).forEach((p) => 표.set(p, { ...g, path: p, 묶음번호: i })); });
  return 표;
}

export function 글읽기(ROOT) {
  const 폴더 = resolve(ROOT, '_blog', 'posts');
  if (!existsSync(폴더)) return [];
  return readdirSync(폴더).filter((f) => f.endsWith('.json')).map((f) => {
    const p = JSON.parse(readFileSync(resolve(폴더, f), 'utf8'));
    Object.defineProperty(p, '_파일', { value: f, enumerable: false });
    return p;
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1));
}

/** 본문 글자 — 읽는 시간·검사·중복 비교에 쓴다 */
export function 본문글(p) {
  const 조각 = [p.lead, ...(p.points || [])];
  for (const s of p.sections || []) {
    조각.push(s.h2);
    for (const b of s.blocks || []) {
      if (b.p) 조각.push(b.p);
      if (b.tip) 조각.push(b.tip);
      if (b.ul) 조각.push(...b.ul);
      if (b.ol) 조각.push(...b.ol);
      if (b.table) 조각.push(...(b.table.head || []), ...(b.table.rows || []).flat());
    }
  }
  for (const f of p.faq || []) 조각.push(f.q, f.a);
  return 조각.map(글자만).join('\n');
}

export function 글이미지들(p) {
  const 목록 = p.cover ? [p.cover] : [];
  for (const s of p.sections || []) for (const b of s.blocks || []) if (b.img) 목록.push(b.img);
  return 목록;
}

/* 사이트 style.css 위에 블로그 본문만 얹는다(색은 사이트 변수) */
const CSS = `
.bl-art{width:min(780px,100% - 40px);margin:0 auto;padding:44px 0 24px}
.bl-meta{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 22px}
.bl-meta a,.bl-meta span{font-size:13px;font-weight:700;padding:6px 13px;border-radius:999px;background:var(--g1);color:var(--g6)}
.bl-meta a{background:var(--wine-l);color:var(--wine)}.bl-meta a:hover{background:var(--wine-m)}
.bl-lead{font-size:18px;line-height:1.85;color:var(--ink);margin:0 0 26px}.bl-lead a{color:var(--wine);font-weight:700;text-decoration:underline;text-underline-offset:3px}
.bl-art figure{margin:0 0 30px}.bl-art figure img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r-s);background:var(--g1)}
.bl-art figure.cover img{aspect-ratio:16/9}
.bl-art figcaption{font-size:14px;color:var(--g5);margin-top:8px;line-height:1.6}
.bl-points{background:var(--wine-l);border-radius:var(--r-s);padding:20px 24px;margin:0 0 28px}
.bl-points b{display:block;font-family:var(--en);font-size:12px;letter-spacing:.2em;color:var(--wine);margin-bottom:8px}
.bl-points ul{margin:0;padding-left:18px}.bl-points li{line-height:1.75;margin:4px 0;color:var(--ink)}
.bl-toc{border-left:3px solid var(--lime);padding:2px 0 2px 16px;margin:0 0 36px}
.bl-toc b{font-size:13px;color:var(--g5)}.bl-toc ol{margin:6px 0 0;padding-left:0;list-style:none}.bl-toc li{line-height:1.9}.bl-toc a:hover{color:var(--wine)}
.bl-body h2,.bl-faq h2{font-size:23px;line-height:1.4;letter-spacing:-.025em;margin:44px 0 14px;font-weight:800;color:var(--ink);scroll-margin-top:calc(var(--hd) + 16px)}
.bl-body p,.bl-faq p{font-size:17px;line-height:1.9;color:var(--g8);margin:0 0 18px}
.bl-body ul,.bl-body ol{margin:0 0 20px;padding-left:22px;color:var(--g8)}.bl-body li{line-height:1.85;margin:5px 0}
.bl-body b{color:var(--ink)}.bl-body a,.bl-faq a{color:var(--wine);font-weight:700;text-decoration:underline;text-underline-offset:3px}
.bl-tbl{overflow-x:auto;margin:0 0 22px;border:1px solid var(--g2);border-radius:var(--r-s);background:#fff}
.bl-tbl table{border-collapse:collapse;width:100%;font-size:15px;min-width:520px}
.bl-tbl th,.bl-tbl td{padding:10px 13px;text-align:left;vertical-align:top;border-bottom:1px solid var(--g2);line-height:1.6}
.bl-tbl th{background:var(--g1);font-weight:800;white-space:nowrap;color:var(--ink)}.bl-tbl tbody tr:last-child td{border-bottom:0}
.bl-tip{background:var(--lime-l);border-radius:var(--r-s);padding:14px 18px;margin:0 0 22px;font-size:16px;line-height:1.8;color:var(--ink)}
.bl-tip::before{content:'현장 메모';display:block;font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--lime-d);margin-bottom:3px}
.bl-faq details{background:#fff;border:1px solid var(--g2);border-radius:var(--r-s);margin:0 0 8px;padding:0 16px}
.bl-faq summary{cursor:pointer;font-weight:700;padding:14px 0;line-height:1.6;color:var(--ink)}.bl-faq details p{margin:0 0 14px}
.bl-src{margin-top:32px;font-size:14px;color:var(--g5);line-height:1.7}.bl-src ul{padding-left:18px;margin:6px 0 0}.bl-src a{text-decoration:underline}
.bl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.bl-card{display:block;background:#fff;border:1px solid var(--g2);border-radius:var(--r);overflow:hidden;transition:transform .3s,box-shadow .3s}
.bl-card:hover{transform:translateY(-4px);box-shadow:var(--sh)}
.bl-card img{width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;background:var(--g1)}
.bl-card .in{padding:15px 17px 18px}.bl-card .r{font-size:12px;font-weight:800;color:var(--wine);margin-bottom:6px}
.bl-card .t{font-size:17px;font-weight:800;line-height:1.45;letter-spacing:-.02em;color:var(--ink)}
.bl-card .s{font-size:14px;color:var(--g6);line-height:1.6;margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bl-chips{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 28px}
.bl-chips a{font-size:14px;font-weight:700;padding:8px 15px;border-radius:999px;background:#fff;border:1px solid var(--g2);color:var(--g8)}
.bl-chips a[aria-current]{background:var(--wine);color:#fff;border-color:var(--wine)}.bl-chips small{font-weight:600;margin-left:4px;opacity:.65}
.bl-pager{display:flex;gap:7px;justify-content:center;margin-top:32px}
.bl-pager a,.bl-pager span{padding:8px 14px;border-radius:8px;border:1px solid var(--g2);font-weight:700;font-size:14px;background:#fff}.bl-pager span{background:var(--wine);color:#fff}
.bl-intro{max-width:760px;color:var(--g7);font-size:17px;line-height:1.8;margin:0 0 24px}.bl-intro a{color:var(--wine);font-weight:700;text-decoration:underline}
.bl-more{padding-top:24px}
@media (max-width:600px){.bl-art{padding-top:30px}.bl-lead{font-size:17px}.bl-body h2,.bl-faq h2{font-size:21px}.bl-body p,.bl-faq p{font-size:16px}}
@media (prefers-reduced-motion:reduce){.bl-card{transition:none}.bl-card:hover{transform:none}}
`.trim().replace(/\n/g, '');

/** notice.html 의 머리글 · 바닥글 */
function 틀(ROOT) {
  const s = readFileSync(resolve(ROOT, 'notice.html'), 'utf8');
  const 머리끝 = s.indexOf('<main id="top">');
  const 꼬리시작 = s.indexOf('</main>') + '</main>'.length;
  if (머리끝 < 0 || 꼬리시작 < 7) throw new Error('notice.html 에서 <main id="top"> … </main> 을 찾지 못했다');
  return [s.slice(0, 머리끝), s.slice(꼬리시작)];
}

/** index.html 의 상담 띠 */
function 상담띠(ROOT) {
  const s = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  const i = s.indexOf('<!-- ===== 상담 띠 ===== -->');
  if (i < 0) return '';
  const j = s.indexOf('</section>', i) + '</section>'.length;
  return s.slice(i, j).replace(/ reveal"/g, '"');
}

/** 사이트 루트 기준 주소('/…')와 틀의 상대 주소('index.html')를 그 페이지 깊이에 맞춘다 */
function 주소맞춤(html, 깊이) {
  const 앞 = '../'.repeat(깊이);
  return html.replace(/(href|src)="(?!https?:|mailto:|tel:|sms:|#|\.\.\/|\/\/)([^"]*)"/g, (m, a, u) => `${a}="${앞}${u.replace(/^\//, '')}"`);
}

export function buildBlog(옵션 = {}) {
  const ROOT = 옵션.ROOT;
  const 사진주소 = (path) => SITE + String(path).split('/').map(encodeURIComponent).join('/');   // 절대 주소(og · JSON-LD 용)
  const 작은사진 = (path) => String(path).replace('/assets/img/p/', '/assets/img/t/');
  const 지역 = 지역표(ROOT);
  const posts = 글읽기(ROOT);
  const 제이슨 = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
  const [틀머리, 틀꼬리] = 틀(ROOT);
  const 띠 = 상담띠(ROOT);

  rmSync(resolve(ROOT, 'blog'), { recursive: true, force: true });

  /* 페이지 하나 — 경로는 '/blog/…/' */
  const 쓰기 = (경로, { 제목, 설명, 이미지, 종류 = 'website', 더넣기 = '' }, 본문) => {
    const 실경로 = decodeURIComponent(경로);
    const 깊이 = 실경로.split('/').filter(Boolean).length;
    const 주소 = SITE + 경로;
    let 머리 = 틀머리
      .replace(/<title>[^]*?<\/title>/, `<title>${esc(제목)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(설명)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(설명)}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(제목)}`)
      .replace(/(<meta property="og:type" content=")[^"]*/, `$1${종류}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${주소}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${주소}`)
      .replace(/(<meta property="og:image" content=")[^"]*/, `$1${esc(이미지)}`)
      .replace(/<meta property="og:image:(width|height)"[^>]*>\n?/g, '')
      .replace(/<meta name="ev-edit"[^>]*>\n?/, '')                                  // 대표님 수정 모드는 기본 6쪽에만
      .replace('<a href="blog/">블로그</a>', '<a class="cur" href="blog/" aria-current="page">블로그</a>')
      .replace('</head>', `<link rel="alternate" type="application/rss+xml" title="${esc(BRAND)} 행사 준비 블로그" href="/rss.xml">\n${더넣기}\n<style>${CSS}</style>\n</head>`);
    const 꼬리 = 틀꼬리.replace(/<script src="assets\/edit\.js[^"]*"><\/script>\n?/, '');
    const html = 주소맞춤(머리 + '<main id="top">\n' + 본문 + '\n</main>' + 꼬리, 깊이);
    const d = resolve(ROOT, '.' + 실경로);
    mkdirSync(d, { recursive: true });
    writeFileSync(resolve(d, 'index.html'), html, 'utf8');
  };

  const 머리띠 = ({ 사진, 눈썹, 제목, 소개, 경로줄 }) => `<section class="ph-head"><img src="${esc(사진)}" alt="" aria-hidden="true"><div class="wrap">
  <span class="eyebrow">${눈썹}</span><h1>${제목}</h1>${소개 ? `<p>${소개}</p>` : ''}
  <div class="crumb"><a href="/index.html">처음</a><span>›</span>${경로줄}</div></div></section>`;

  const 카드 = (p) => {
    const r = 지역.get(p.region);
    return `<a class="bl-card" href="${글주소(p.slug)}">
      <img src="${esc(작은사진(p.cover.path))}" alt="${esc(p.cover.alt)}" loading="lazy" decoding="async" width="800" height="500">
      <div class="in"><div class="r">${esc(r ? r.이름 : '')} · ${esc(날짜글(p.date))}</div><div class="t">${esc(p.title)}</div><div class="s">${esc(p.description)}</div></div>
    </a>`;
  };

  const 개수 = new Map();
  posts.forEach((p) => 개수.set(p.region, (개수.get(p.region) || 0) + 1));
  const 칩 = (현재) => `<nav class="bl-chips" aria-label="지역별 글">
    <a href="/blog/"${현재 === '' ? ' aria-current="page"' : ''}>전체<small>${posts.length}</small></a>
    ${[...지역.values()].filter((r) => 개수.get(r.slug)).map((r) =>
      `<a href="/blog/${r.slug}/"${현재 === r.slug ? ' aria-current="page"' : ''}>${esc(r.slug === 'common' ? '공통' : r.이름)}<small>${개수.get(r.slug)}</small></a>`).join('\n    ')}
  </nav>`;

  /* ── 글 페이지 ── */
  const 이미지html = (im, 표지) => `<figure${표지 ? ' class="cover"' : ''}>
    <img src="${esc(im.path)}" alt="${esc(im.alt)}" ${표지 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${표지 ? 1600 : 1200}" height="${표지 ? 900 : 900}">
    <figcaption>${인라인(im.caption)}</figcaption>
  </figure>`;
  const 블록 = (b) => {
    if (b.p) return `<p>${인라인(b.p)}</p>`;
    if (b.tip) return `<div class="bl-tip">${인라인(b.tip)}</div>`;
    if (b.ul) return `<ul>${b.ul.map((x) => `<li>${인라인(x)}</li>`).join('')}</ul>`;
    if (b.ol) return `<ol>${b.ol.map((x) => `<li>${인라인(x)}</li>`).join('')}</ol>`;
    if (b.table) return `<div class="bl-tbl"><table><thead><tr>${b.table.head.map((h) => `<th scope="col">${인라인(h)}</th>`).join('')}</tr></thead><tbody>${
      b.table.rows.map((row) => `<tr>${row.map((c) => `<td>${인라인(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (b.img) return 이미지html(b.img, false);
    return '';
  };

  for (const p of posts) {
    const r = 지역.get(p.region) || { 이름: '', 서비스페이지: '' };
    const 지역글 = p.region !== 'common';
    const 경로 = 글주소(p.slug);
    const 분 = Math.max(1, Math.round(본문글(p).length / 500));
    const 관련 = [...posts.filter((o) => o !== p && o.region === p.region),
                  ...posts.filter((o) => o !== p && o.region !== p.region && o.topic === p.topic),
                  ...posts.filter((o) => o !== p && o.region !== p.region && o.topic !== p.topic)].slice(0, 3);

    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '처음', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' },
        { '@type': 'ListItem', position: 3, name: 지역글 ? r.이름 + ' 영어행사 준비' : '행사 준비 공통', item: `${SITE}/blog/${p.region}/` },
        { '@type': 'ListItem', position: 4, name: p.title, item: SITE + 경로 } ] },
      { '@type': 'BlogPosting', '@id': SITE + 경로, headline: p.title, description: p.description,
        image: 글이미지들(p).map((im) => 사진주소(im.path)),
        datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'ko',
        keywords: [p.keyword.main, ...(p.keyword.sub || [])].join(', '),
        author: { '@type': 'Organization', name: BRAND, url: SITE + '/' },
        publisher: { '@id': SITE + '/#business' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + 경로 },
        ...(지역글 ? { spatialCoverage: { '@type': 'Place', name: r.도 === r.시군 ? r.도 : `${r.도} ${r.시군}` } } : {}) },
      ...((p.faq || []).length ? [{ '@type': 'FAQPage', '@id': SITE + 경로 + '#faq',
        mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: 글자만(f.a) } })) }] : []),
    ] };

    const 본문 = 머리띠({ 사진: p.cover.path, 눈썹: esc(지역글 ? `${r.이름} · Event Guide` : 'Event Guide'), 제목: esc(p.title), 소개: '',
        경로줄: `<a href="/blog/">블로그</a><span>›</span><a href="/blog/${p.region}/">${esc(지역글 ? r.이름 : '공통')}</a>` }) + `
<article class="bl-art">
  <div class="bl-meta">
    <span>${esc(날짜글(p.date))}</span>
    <a href="/blog/${p.region}/">${esc(지역글 ? r.이름 : '공통')} 글 모음</a>
    <span>읽는 시간 약 ${분}분</span>
  </div>
  <p class="bl-lead">${인라인(p.lead)}</p>
  ${이미지html(p.cover, true)}
  <div class="bl-points"><b>KEY POINTS · 이 글의 요점</b><ul>${p.points.map((x) => `<li>${인라인(x)}</li>`).join('')}</ul></div>
  <nav class="bl-toc" aria-label="목차"><b>목차</b><ol>${p.sections.map((s, i) => `<li><a href="#s${i + 1}">${esc(s.h2)}</a></li>`).join('')}</ol></nav>
  <div class="bl-body">
${p.sections.map((s, i) => `<h2 id="s${i + 1}">${esc(s.h2)}</h2>\n${s.blocks.map(블록).join('\n')}`).join('\n')}
  </div>
  ${(p.faq || []).length ? `<section class="bl-faq" id="faq"><h2>자주 묻는 질문</h2>${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${인라인(f.a)}</p></details>`).join('')}</section>` : ''}
  ${(p.sources || []).length ? `<div class="bl-src"><b>확인한 자료</b> (${esc(날짜글(p.updated || p.date))} 기준)<ul>${p.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul></div>` : ''}
</article>
${관련.length ? `<section class="sec g bl-more"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">More Guides</span><h2 class="st">같이 보면 좋은 <em>글</em></h2></div><a class="btn btn-line more" href="/blog/">전체 보기</a></div><div class="bl-cards">${관련.map(카드).join('\n')}</div></div></section>` : ''}
${띠}`;
    쓰기(경로, { 제목: `${p.title} | ${BRAND}`, 설명: p.description, 이미지: 사진주소(p.cover.path), 종류: 'article',
      더넣기: `<meta property="article:published_time" content="${p.date}">\n${제이슨(ld)}` }, 본문);
  }

  /* ── 목록 (blog/, blog/page/N/) ── */
  const 대표이미지 = posts[0] ? 사진주소(posts[0].cover.path) : `${SITE}/assets/img/og.jpg`;
  const 쪽수 = Math.max(1, Math.ceil(posts.length / 쪽당));
  for (let n = 1; n <= 쪽수; n++) {
    const 조각 = posts.slice((n - 1) * 쪽당, n * 쪽당);
    const 경로 = n === 1 ? '/blog/' : `/blog/page/${n}/`;
    const 쪽나눔 = 쪽수 > 1 ? `<nav class="bl-pager" aria-label="쪽 이동">${Array.from({ length: 쪽수 }, (_, i) => i + 1).map((k) =>
      k === n ? `<span aria-current="page">${k}</span>` : `<a href="${k === 1 ? '/blog/' : `/blog/page/${k}/`}">${k}</a>`).join('')}</nav>` : '';
    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '처음', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' } ] },
      { '@type': 'Blog', '@id': SITE + '/blog/', name: `${BRAND} 행사 준비 블로그`, inLanguage: 'ko', publisher: { '@id': SITE + '/#business' },
        blogPost: 조각.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: SITE + 글주소(p.slug), datePublished: p.date, image: 사진주소(p.cover.path) })) } ] };
    const 본문 = 머리띠({ 사진: '/assets/img/p/e16.webp', 눈썹: 'Blog · Event Guide', 제목: '행사 준비 블로그<span class="en">English Event Guide</span>',
        소개: '영어로 진행하는 팀빌딩 · 레크레이션 · 체육대회 · 송년회를 맡은 담당자가 먼저 확인할 것들을 정리합니다.',
        경로줄: `<span>블로그</span>${n > 1 ? `<span>›</span><span>${n}쪽</span>` : ''}` }) + `
<section class="sec" style="padding-top:56px"><div class="wrap">
  <p class="bl-intro">외국인 직원이 섞인 행사는 진행 언어 · 게임 규칙 · 시간표를 미리 맞춰 두어야 당일이 매끄럽습니다. 실제로 진행한 현장은 <a href="/stories/index.html">행사 이야기</a>에, 준비 요령은 이 블로그에 씁니다.</p>
  ${칩('')}
  ${posts.length ? `<div class="bl-cards">${조각.map(카드).join('\n')}</div>` : '<p class="bl-intro">첫 글을 준비하고 있습니다.</p>'}
  ${쪽나눔}
</div></section>
${띠}`;
    쓰기(경로, {
      제목: n === 1 ? `행사 준비 블로그 — 영어 팀빌딩 · 영어 송년회 · 영어 MC 준비 정보 | ${BRAND}` : `행사 준비 블로그 ${n}쪽 | ${BRAND}`,
      설명: '영어 팀빌딩 · 영어 레크레이션 · 영어 체육대회 · 영어 송년회 · 학교 영어캠프를 준비하는 담당자를 위한 글. 진행 언어 비율, 게임 규칙 설명, 시간표, 장소 · 음향까지 현장 기준으로 정리합니다.',
      이미지: 대표이미지, 더넣기: 제이슨(ld) }, 본문);
  }

  /* ── 지역 모음 (blog/<지역>/) ── */
  const 허브 = [];
  for (const r of 지역.values()) {
    const 목록 = posts.filter((p) => p.region === r.slug);
    if (!목록.length) continue;                       // 글이 없는 지역은 만들지 않는다
    const 경로 = `/blog/${r.slug}/`;
    const 공통 = r.slug === 'common';
    const 허브제목 = 공통 ? '영어행사 준비 공통 정보' : `${r.이름} 영어행사 준비 정보`;
    const 소개 = 공통
      ? '지역과 상관없이 영어로 진행하는 행사 준비에 두루 쓰이는 글입니다.'
      : `${esc(r.이름)}에서 영어로 진행하는 행사를 준비하는 담당자를 위한 글입니다.${r.이동 ? ` 이벤투스 사무실은 ${esc(r.이동)}에 있습니다.` : ''}${(r.현장기록 || []).length ? ` 이 지역에서 진행한 현장은 <a href="/stories/index.html">행사 이야기</a>에 있습니다.` : ''}`;
    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '처음', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' },
        { '@type': 'ListItem', position: 3, name: 허브제목, item: SITE + 경로 } ] },
      { '@type': 'CollectionPage', '@id': SITE + 경로, name: 허브제목, inLanguage: 'ko',
        hasPart: 목록.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: SITE + 글주소(p.slug) })) } ] };
    const 본문 = 머리띠({ 사진: 목록[0].cover.path, 눈썹: 공통 ? 'Guide' : esc(r.도 === r.시군 ? r.도 : `${r.도} ${r.시군}`), 제목: esc(허브제목), 소개: '',
        경로줄: `<a href="/blog/">블로그</a><span>›</span><span>${esc(공통 ? '공통' : r.이름)}</span>` }) + `
<section class="sec" style="padding-top:56px"><div class="wrap">
  <p class="bl-intro">${소개}</p>
  ${칩(r.slug)}
  <div class="bl-cards">${목록.map(카드).join('\n')}</div>
</div></section>
${띠}`;
    쓰기(경로, {
      제목: `${허브제목} — 영어 팀빌딩 · 레크레이션 · 송년회 | ${BRAND}`,
      설명: 공통 ? '지역과 상관없이 영어행사 준비에 두루 필요한 내용. 영어 MC · 워크숍 · 영어캠프 · 팀빌딩 게임 구성을 현장 기준으로 정리한 글 모음입니다.'
        : `${r.이름}에서 영어로 진행하는 팀빌딩 · 레크레이션 · 체육대회 · 송년회를 준비할 때 확인할 것들. 진행 언어, 게임 규칙 설명, 장소와 음향까지 정리한 글 모음입니다.`,
      이미지: 사진주소(목록[0].cover.path), 더넣기: 제이슨(ld) }, 본문);
    허브.push({ loc: 경로, lastmod: 목록[0].updated || 목록[0].date });
  }

  /* ── sitemap.xml — 있으면 /blog/ 부분만 바꾼다 ── */
  const 블로그주소 = posts.length ? [
    { loc: '/blog/', lastmod: posts[0].updated || posts[0].date },
    ...허브,
    ...posts.map((p) => ({ loc: 글주소(p.slug), lastmod: p.updated || p.date })),
  ] : [];
  const sm = resolve(ROOT, 'sitemap.xml');
  if (existsSync(sm)) {
    let xml = readFileSync(sm, 'utf8');
    xml = xml.replace(/\s*<url><loc>[^<]*\/blog\/[^<]*<\/loc>[^]*?<\/url>/g, '');
    const 추가 = 블로그주소.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>\n`).join('');
    xml = xml.replace(/<\/urlset>\s*$/, 추가 + '</urlset>\n');
    writeFileSync(sm, xml, 'utf8');
  }

  /* ── llms.txt — 있으면 「## 블로그」 절을 다시 쓴다 ── */
  const ll = resolve(ROOT, 'llms.txt');
  if (existsSync(ll) && posts.length) {
    let t = readFileSync(ll, 'utf8').replace(/\r\n/g, '\n');
    const 절 = `## 블로그 (영어행사 준비 정보)\n- [행사 준비 블로그](${SITE}/blog/): 영어 팀빌딩 · 영어 송년회 · 영어 MC 준비 체크리스트\n` +
      posts.map((p) => `- [${p.title}](${SITE}${글주소(p.slug)}): ${p.description}`).join('\n') + '\n';
    t = /^## 블로그[^]*?(?=^## |\s*$)/m.test(t) ? t.replace(/^## 블로그[^]*?(?=^## |\s*$)/m, 절) : t.trimEnd() + '\n\n' + 절;
    writeFileSync(ll, t, 'utf8');
  }

  /* ── rss.xml ── */
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(BRAND)} 행사 준비 블로그</title><link>${SITE}/blog/</link><description>영어로 진행하는 행사를 준비하는 담당자를 위한 글</description><language>ko</language>
${posts.slice(0, 50).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}${글주소(p.slug)}</link><guid>${SITE}${글주소(p.slug)}</guid><description>${esc(p.description)}</description><pubDate>${new Date(p.date + 'T09:00:00+09:00').toUTCString()}</pubDate></item>`).join('\n')}
</channel></rss>
`;
  writeFileSync(resolve(ROOT, 'rss.xml'), rss, 'utf8');

  return { posts, 블로그주소 };
}

/* 혼자 실행할 때 */
const 이파일 = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === 이파일) {
  const ROOT = resolve(dirname(이파일), '..');
  const { posts, 블로그주소 } = buildBlog({ ROOT });
  console.log(`blog/: 글 ${posts.length}개 · 블로그 주소 ${블로그주소.length}개 · rss.xml 갱신`);
}
