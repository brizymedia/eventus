# -*- coding: utf-8 -*-
"""
행사 이야기(stories/) 만들기 — 사이트 틀(머리글 · 바닥글)은 notice.html, 상담 띠는 index.html 에서 빌려 온다.

  python tools/make_pages.py

내용은 아래 STORIES 표만 고치면 된다. 결과 HTML(stories/*.html)은 손으로 고치지 말 것 — 다시 만들면 덮어쓴다.
사실만 적을 것: 근거는 대표 네이버 블로그(blog.naver.com/seoulite712) 「행사후기」 글 원문과 그 글의 사진(현수막 · 안내판 글자 포함).
숫자 · 후기 문장 · 고객 말을 지어 넣지 않는다. 사진은 assets/img (얼굴 모자이크 · 기록은 assets/img/SOURCES.md).
"""
import os, re, html

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://brizymedia.github.io/eventus/'
BLOG = 'https://blog.naver.com/seoulite712/'
E = html.escape

# ── 행사 이야기 ──────────────────────────────────────────────
# blog = 근거 글 번호, posted = 블로그 글 날짜, photos = assets/img 번호(첫 장이 머리 사진 · 카드 사진)
STORIES = [
    dict(slug='hd-global-training', cat='영어 팀빌딩', when='2024.04', place='HD HCE Global Training Center',
         title='HD현대건설기계 Global Training Conference — 외국인 · 직원이 함께한 영어 팀빌딩',
         lead='HD현대건설기계의 외국인 · 직원 워크숍 프로그램에서 영어 아나운서와 오징어게임 영어진행 레크레이션을 맡았습니다.',
         facts=[('행사', 'Global Training Conference 워크숍 프로그램'), ('기간', '2024년 4월 8일 ~ 12일 (현수막 기준)'),
                ('장소', 'HD HCE Global Training Center'), ('참가', 'HD현대건설기계 외국인 · 직원'), ('맡은 일', '영어 아나운서 · 오징어게임 영어진행 레크레이션')],
         body=['행사장 현수막에 적힌 이름은 「Global Training Conference」, 기간은 2024년 4월 8일부터 12일까지, 장소는 HD HCE Global Training Center 였습니다. HD현대건설기계의 외국인과 한국인 직원이 함께한 워크숍 프로그램입니다.',
               '이벤투스는 이 자리에서 영어 아나운서와 오징어게임을 영어로 진행하는 레크레이션을 맡았습니다. 참가자들은 팀마다 색이 다른 조끼를 입고, 빨간 진행요원 복장의 스태프 안내에 따라 게임을 이어 갔습니다.'],
         photos=['e12', 'e29', 'e30'], blog='224419884854', posted='2026.09.26'),
    dict(slug='icon-year-end-party', cat='영어 송년회', when='2025.12.11', place='서울 역삼 아모리스 호텔',
         title='ICON Korea 2025 Year End Party — 역삼 아모리스 호텔 임직원 송년회',
         lead='ICON 임직원 송년회의 전체 진행을 맡아 레크레이션 게임 · 행운권 추첨 · 장기자랑 순서를 꾸리고, 음향과 노래방 기기까지 준비했습니다.',
         facts=[('행사', 'ICON 임직원 송년회 (Year End Party)'), ('날짜', '2025년 12월 11일 목요일 (행사장 안내판 기준)'),
                ('장소', '서울 역삼 아모리스 호텔'), ('맡은 일', '전체 진행 · 레크레이션 게임 · 행운권 추첨 · 장기자랑 · 음향 · 노래방 기기')],
         body=['행사장 입구 안내판에는 「2025 ICON Korea Year End Party」, 2025년 12월 11일 목요일, Amoris Yeoksam 이라고 적혀 있었습니다. 한 해를 마무리하며 임직원이 함께 모인 송년회입니다.',
               '이벤투스는 행사 전체 진행을 맡아 레크레이션 게임, 행운권 추첨, 장기자랑 순서를 구성했습니다.',
               '넓은 볼룸 어디에서도 진행 소리가 또렷하게 들리도록 음향을 세팅했고, 장기자랑 순서를 위해 노래방 기기도 함께 준비했습니다.'],
         photos=['e21', 'e31', 'e20', 'e22'], blog='224413717911', posted='2026.09.25'),
    dict(slug='coupang-english-recreation', cat='영어 레크레이션', when='', place='서울 강남 엘리아나호텔 그랜드볼룸',
         title='쿠팡 임직원 영어 레크레이션 · 팀빌딩 — 강남 엘리아나호텔 그랜드볼룸',
         lead='쿠팡 임직원을 대상으로 한 영어 레크레이션 · 팀빌딩 행사입니다. 게임 규칙 설명부터 미션 게임까지 영어로 진행했습니다.',
         facts=[('행사', '쿠팡 임직원 대상 영어 레크레이션 · 팀빌딩'), ('장소', '서울 강남 엘리아나호텔 그랜드볼룸'),
                ('진행', '영어 진행자 · 영어 레크레이션 강사'), ('프로그램', '오징어게임 · 런닝맨 콘셉트 미션 게임')],
         body=['행사는 서울 강남 엘리아나호텔 그랜드볼룸에서 열렸습니다. 쿠팡 임직원을 대상으로 한 영어 레크레이션 · 팀빌딩 자리였습니다.',
               '영어 진행자가 팀빌딩 게임의 규칙 설명부터 오징어게임 · 런닝맨 콘셉트의 미션 게임까지 영어로 이끌었습니다.'],
         photos=['e16', 'e15', 'e19'], blog='224413449250', posted='2026.09.16'),
    dict(slug='gyeongwonjae-squid-game', cat='영어 팀빌딩', when='', place='인천 경원재 바이 워커힐',
         title='인천 경원재 바이 워커힐 — 한옥 호텔에서 연 오징어게임 · 런닝맨 영어 팀빌딩',
         lead='참가자 다수가 외국인 임직원이라, 영어 MC 가 처음부터 끝까지 영어로 오징어게임 · 런닝맨 콘셉트의 팀빌딩을 이끌었습니다.',
         facts=[('행사', '외국계 기업 임직원 영어 팀빌딩'), ('장소', '인천 한옥 호텔 경원재 바이 워커힐'),
                ('진행', '영어 MC · 전 과정 영어 진행'), ('프로그램', '무궁화 꽃이 피었습니다 응용 게임 · 특급열차 이어달리기 · 딱지 뒤집기 등'),
                ('준비', '사전 답사 · 동선 설계 · 비 올 때 대체 프로그램')],
         body=['인천의 한옥 호텔 경원재 바이 워커힐에서 열린 영어 팀빌딩입니다. 행사장에는 오징어게임 대형 현수막과 「Let\'s kick off 2025 together」 배너가 함께 걸렸습니다.',
               '참가자 중 다수가 외국인 임직원이어서, 한국어 진행에 영어를 곁들이는 방식이 아니라 영어 MC 가 처음부터 끝까지 영어로 진행했습니다.',
               '무궁화 꽃이 피었습니다를 응용한 술래잡기, 특급열차 이어달리기, 딱지 뒤집기처럼 처음 보는 사람도 바로 이해할 수 있는 종목을 골라 규칙을 단순하게 다듬었습니다. 행사 전에는 현장을 답사해 동선을 짜고, 비가 올 때를 대비한 대체 프로그램도 준비했습니다.'],
         photos=['e28', 'e27', 'e11'], blog='224412386511', posted='2026.09.15'),
    dict(slug='seoul-club-squid-game', cat='영어 팀빌딩', when='', place='서울 중구 서울클럽 연회장',
         title='서울클럽 연회장 — 영어로 진행한 오징어게임 팀빌딩',
         lead='서울 중구 서울클럽 연회장에서 오징어게임 콘셉트의 영어 팀빌딩 · 영어 레크레이션을 진행했습니다.',
         facts=[('행사', '오징어게임 콘셉트 영어 팀빌딩 · 영어 레크레이션'), ('장소', '서울 중구 서울클럽 연회장'),
                ('진행', '영어 레크레이션 강사 · 영어 팀빌딩 강사'), ('종목', '무궁화 꽃이 피었습니다 응용 · 줄다리기 · 딱지 · 공기놀이 · 투호 등')],
         body=['서울 중구 서울클럽 연회장에서 열린 영어 팀빌딩입니다. 오징어게임 테마를 살려 영어로 진행했습니다.',
               '무궁화 꽃이 피었습니다를 응용한 종목을 시작으로 줄다리기, 딱지, 공기놀이, 투호 같은 게임을 이어 갔습니다. 영어 레크레이션 강사와 영어 팀빌딩 강사가 함께 들어가 규칙 설명과 진행을 나눠 맡았습니다.',
               '참가자들은 팀마다 색이 다른 조끼를 입었고, 연회장 크기와 인원에 맞춰 게임 동선을 미리 잡아 두었습니다.'],
         photos=['e07', 'e01', 'e08', 'e06'], blog='224399617260', posted='2026.09.13'),
]


def shell():
    s = open(os.path.join(SITE, 'notice.html'), encoding='utf-8').read()
    head_end = s.index('<main id="top">')
    main_end = s.index('</main>') + len('</main>')
    return s[:head_end], s[main_end:]


def band():
    """대문의 상담 띠를 그대로 가져온다."""
    s = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    i = s.index('<!-- ===== 상담 띠 ===== -->')
    j = s.index('</section>', i) + len('</section>')
    return s[i:j]


def page(path, title, desc, main, img):
    top, bottom = shell()
    url = BASE + path
    top = re.sub(r'<title>.*?</title>', '<title>' + E(title) + '</title>', top, count=1)
    for prop in ('name="description"', 'property="og:description"'):
        top = re.sub(r'(<meta ' + prop + r' content=")[^"]*', lambda m: m.group(1) + E(desc), top, count=1)
    top = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), top, count=1)
    top = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, top, count=1)
    top = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, top, count=1)
    top = re.sub(r'(<meta property="og:image" content=")[^"]*', lambda m: m.group(1) + BASE + img, top, count=1)
    top = re.sub(r'<meta name="ev-edit"[^>]*>\n?', '', top)                 # 대표님 수정 모드는 기본 6쪽에만
    top = top.replace('<a href="stories/index.html">행사 이야기</a>', '<a class="cur" href="stories/index.html">행사 이야기</a>', 1)
    bottom = re.sub(r'<script src="assets/edit\.js[^"]*"></script>\n?', '', bottom)
    out = top + '<main id="top">\n' + main + '\n</main>' + bottom
    depth = path.count('/')
    pre = '../' * depth
    out = re.sub(r'(href|src)="(?!https?:|mailto:|tel:|sms:|#|/|\.\./)([^"]+)"', lambda m: m.group(1) + '="' + pre + m.group(2) + '"', out)
    full = os.path.join(SITE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8', newline='\n').write(out)
    return url


def pic(f, big=False):
    return 'assets/img/' + ('p/' if big else 't/') + f + '.webp'


def card(o, long=False):
    meta = o['cat'] + ' · ' + o['place']
    extra = ('<em>' + E(o['lead'][:58]) + '…</em>') if long else ''
    return ('<a class="scard reveal" href="stories/' + o['slug'] + '.html"><img src="' + pic(o['photos'][0]) + '" alt="" loading="lazy" width="800" height="600">'
            '<span><small>' + E(meta) + '</small>' + E(o['title']) + extra + '</span></a>')


def head(img, eyebrow, h1, lead, crumb):
    return ('<section class="ph-head"><img src="' + pic(img, True) + '" alt="" aria-hidden="true"><div class="wrap">'
            '<span class="eyebrow">' + eyebrow + '</span><h1>' + h1 + '</h1><p>' + E(lead) + '</p>'
            '<div class="crumb"><a href="index.html">처음</a><span>›</span>' + crumb + '</div></div></section>')


def story_pages():
    urls = []
    for st in STORIES:
        facts = ''.join('<dt>' + E(a) + '</dt><dd>' + E(b) + '</dd>' for a, b in st['facts'])
        body = ''.join('<p>' + E(p) + '</p>' for p in st['body'])
        photos = ''.join('<a href="' + pic(f, True) + '" target="_blank" rel="noopener"><img src="' + pic(f) + '" alt="' + E(st['place']) + ' 행사 현장" loading="lazy" width="800" height="600"></a>' for f in st['photos'])
        others = ''.join(card(o) for o in STORIES if o['slug'] != st['slug'])
        main = (head(st['photos'][0], 'Event Story', E(st['title']), st['lead'],
                     '<a href="stories/index.html">행사 이야기</a><span>›</span><span>' + E(st['cat']) + '</span>')
                + '<section class="sec"><div class="wrap story">'
                '<aside class="reveal"><span class="eyebrow">Event File</span><dl>' + facts + '<dt>근거</dt><dd>대표 네이버 블로그 ' + E(st['posted']) + ' 글</dd></dl>'
                '<a class="btn btn-wine" href="contact.html">비슷한 행사 문의하기</a></aside>'
                '<div class="sbody reveal">' + body + '<div class="sgrid">' + photos + '</div>'
                '<p class="snote">사진은 대표 블로그 글과 이벤투스 현장 사진입니다. 참가자 얼굴은 모자이크 처리했습니다.</p>'
                '<div class="sbtns"><a class="btn btn-line" href="' + BLOG + st['blog'] + '" target="_blank" rel="noopener">블로그 원문 보기 ↗</a>'
                '<a class="btn btn-line" href="portfolio.html">현장사진 더 보기</a></div></div>'
                '</div></section>'
                '<section class="sec g"><div class="wrap"><div class="sec-head reveal"><div><span class="eyebrow">More Stories</span><h2 class="st">다른 <em>행사 이야기</em></h2></div>'
                '<a class="btn btn-line more" href="stories/index.html">전체 보기</a></div><div class="scards four">' + others + '</div></div></section>'
                + band())
        urls.append(page('stories/' + st['slug'] + '.html', st['title'] + ' | 영어행사 전문 이벤투스', st['lead'], main, pic(st['photos'][0], True)))
    cards = ''.join(card(o, True) for o in STORIES)
    main = (head('e01', 'Event Stories', '행사 이야기<span class="en">Event Stories</span>',
                 '이벤투스가 진행한 영어행사를 한 편씩 정리했습니다. 어디서 어떤 행사를, 어떻게 진행했는지 사진과 함께 보실 수 있습니다.',
                 '<span>행사 이야기</span>')
            + '<section class="sec"><div class="wrap"><div class="scards">' + cards + '</div>'
            '<p class="snote">더 많은 현장 기록은 <a href="https://blog.naver.com/seoulite712" target="_blank" rel="noopener">대표 네이버 블로그</a>에 있습니다.</p></div></section>'
            + band())
    urls.insert(0, page('stories/index.html', '행사 이야기 | 영어행사 전문 이벤투스 — 영어 팀빌딩 · 영어 송년회 현장 기록',
                        '이벤투스가 진행한 영어 팀빌딩 · 영어 레크레이션 · 영어 송년회 현장 기록. HD현대건설기계, ICON, 쿠팡, 경원재 바이 워커힐, 서울클럽.',
                        main, pic('e01', True)))
    return urls


if __name__ == '__main__':
    u = story_pages()
    print('행사 이야기', len(u), '쪽 만듦')
