# -*- coding: utf-8 -*-
"""2026-11-01 구글폼 문의 빼기 — 문의는 홈페이지 문의(contact.html#askForm) 하나로.

- 상담 단추 「구글폼 행사 문의」 → 「홈페이지 행사 문의」(contact.html 은 같은 쪽에 폼이 있어 단추를 뺀다)
- 바닥글 「구글폼 · 홈페이지 문의」 → 「홈페이지 문의」
- 본문·설명문·블로그 원고의 「구글폼」 언급 정리

두 번 돌려도 같은 결과가 나온다.  python tools/drop_gform.py  (그다음 node scripts/build-blog.mjs)
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GF = r'https://docs\.google\.com/forms/[^"]*'
CTA = re.compile(r'[ \t]*<a class="cta form" href="%s" target="_blank" rel="noopener">(.*?)</a>\n?' % GF)
TEXT = [
    (' · 구글폼 · 홈페이지 문의', ' · 홈페이지 문의'),
    (', 구글폼, 홈페이지', ', 홈페이지'),
    ('구글폼 상담은', '홈페이지 문의는'),
    ('구글폼은', '홈페이지 문의는'),
    ('구글폼으로', '홈페이지 문의로'),
]

n = 0
for f in sorted(list(ROOT.rglob('*.html')) + list(ROOT.rglob('*.json')) + [ROOT / 'assets/app.js', ROOT / '_blog/GUIDE.md']):
    if '.git' in f.parts or 'node_modules' in f.parts:
        continue
    s = f.read_text(encoding='utf-8')
    o = s
    m = re.search(r'href="([./]*)assets/style\.css', s)
    pre = m.group(1) if m else ''

    if f.name == 'contact.html' and f.parent == ROOT:
        s = CTA.sub('', s)
    else:
        def cta(mm):
            body = re.sub(r'<b>구글폼(으로)? 행사 문의</b>', '<b>홈페이지 행사 문의</b>', mm.group(1))
            ind = re.match(r'[ \t]*', mm.group(0)).group(0)
            return '%s<a class="cta form" href="%scontact.html#askForm">%s</a>\n' % (ind, pre, body)
        s = CTA.sub(cta, s)
    s = re.sub(r'<a href="%s" target="_blank" rel="noopener">구글폼</a> · ' % GF, '', s)
    s = re.sub(r'<tr><td>구글폼</td><td>[^<]*</td></tr>', '', s)
    s = re.sub(r'\[\s*"구글폼",\s*"[^"]*"\s*\],\s*', '', s)
    for a, b in TEXT:
        s = s.replace(a, b)
    if s != o:
        f.write_text(s, encoding='utf-8')
        n += 1
print('고친 파일', n)
