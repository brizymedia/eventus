# -*- coding: utf-8 -*-
"""2026-11-01 고객 수정사항(이벤투스 수정사항.hwpx) 중 모든 페이지에 걸치는 것.

- 로고: 말풍선 E 그림 → 에이블커뮤니케이션 로고(assets/img/logo-able.png, 바닥은 -white)
- 공식 영문 표기: EVENTUS / Eventus → Eventoos
- 메뉴 머리 사진(.ph-head) 은 style.css 에서 처리

두 번 돌려도 같은 결과가 나온다.  python tools/renew_2026_11.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MK = re.compile(r'<svg class="mk" viewBox="0 0 40 40" aria-hidden="true">.*?</svg>', re.S)

n = 0
for f in sorted(ROOT.rglob('*.html')):
    if '.git' in f.parts:
        continue
    s = f.read_text(encoding='utf-8')
    o = s
    m = re.search(r'href="([./]*)assets/style\.css', s)
    pre = m.group(1) if m else ''

    def logo(mm, _c=[0]):
        # 문서 안 첫 로고는 머리(흰 바탕), 그다음은 바닥(검은 바탕)
        _c[0] += 1
        src = 'logo-able.png' if _c[0] == 1 else 'logo-able-white.png'
        return '<img class="able" src="%sassets/img/%s" alt="에이블커뮤니케이션" width="520" height="132">' % (pre, src)
    s = MK.sub(logo, s)
    s = s.replace('EVENTUS', 'Eventoos').replace('Eventus', 'Eventoos')
    if s != o:
        f.write_text(s, encoding='utf-8')
        n += 1
print('고친 파일', n)
