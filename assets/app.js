/* 영어행사 전문 이벤투스 — 공통 스크립트 (외부 라이브러리 없음) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 문의 폼 전송처 ----------
     FORM_ENDPOINT 가 비어 있으면 휴대폰에서는 문자 앱이 열리고, PC 에서는 내용을 복사해 준다.
     문의 서버(Apps Script) 주소를 넣으면 그쪽으로 JSON 이 가고 대표 메일로 전달된다. */
  var FORM_ENDPOINT = '';
  var SMS_TO = '010-3057-4863';
  var COMPANY = '이벤투스';

  /* ---------- 공지사항 (여기만 고치면 대문 · 공지 게시판에 반영) ---------- */
  var NOTICES = [
    { d: '2026.10.05', t: '영어행사 전문 이벤투스 홈페이지를 열었습니다.', n: true, b: '영어팀빌딩 · 영어레크레이션 · 영어체육대회 · 영어송년회 상담은 전화 · 카카오톡 1:1 · 구글폼으로 편하게 남겨 주세요.' },
    { d: '2026.10.05', t: '행사 전 영어 Zoom 사전 미팅이 가능합니다.', n: true, b: '외국인 담당자와 함께 프로그램 · 진행 순서를 미리 맞춰 볼 수 있습니다.' },
    { d: '2026.10.05', t: '팀빌딩 · 레크레이션 게임물품 렌탈만도, 음향 · 조명 렌탈만도 가능합니다.' },
    { d: '2026.10.05', t: '부산 · 강릉 · 제주 지방 출장, 해외 출장도 일정만 맞으면 진행합니다.' }
  ];

  /* ---------- 자료실 (블로그에 정리해 둔 준비 글 — 누르면 블로그로) ---------- */
  var FILES = [
    { t: '레크레이션 게임도구 대여 시 꼭 알아야 할 5가지 주의사항', u: 'https://blog.naver.com/seoulite712/224255591653', k: '체크리스트' },
    { t: '체육대회 성공을 위한 레크레이션 게임용 도구 관리법', u: 'https://blog.naver.com/seoulite712/224255544927', k: '준비 가이드' },
    { t: '대여 게임도구로 만드는 특별한 체육대회 이벤트 아이디어', u: 'https://blog.naver.com/seoulite712/224259665029', k: '아이디어' },
    { t: '박터트리기 게임을 위한 레크레이션 게임도구 택배 이용 방법', u: 'https://blog.naver.com/seoulite712/224259675406', k: '렌탈 안내' },
    { t: '양평 실내체육관 체육대회 행사에서 꼭 알아야 할 주의할 점', u: 'https://blog.naver.com/seoulite712/224255501039', k: '장소 가이드' },
    { t: '강릉 실내체육관 대여 비용과 예약 시기 완벽 가이드', u: 'https://blog.naver.com/seoulite712/224255495996', k: '장소 가이드' }
  ];

  /* ---------- 현장 사진 (assets/img/p · t 의 e01~e26 ↔ 제목) ----------
     c: team 팀빌딩 · party 송년회·파티 · rec 레크레이션·MC · sport 체육대회·운동회 · gear 세팅·장비
     얼굴이 가까이 나온 사진은 모자이크 처리됨 (assets/img/SOURCES.md) */
  var WORKS = [
    { i: 1, t: '오징어게임 영어 팀빌딩 — 미션 설명', e: 'English Team Building', c: 'team' },
    { i: 2, t: '실내체육관 체육대회 · 명랑운동회', e: 'Sports Day', c: 'sport' },
    { i: 3, t: '송년회 코스튬 파티 무대', e: 'Year-End Party', c: 'party' },
    { i: 4, t: '팔씨름 레크레이션 진행', e: 'Recreation', c: 'rec' },
    { i: 5, t: '오징어게임 테마 팀빌딩 단체 사진', e: 'Squid Game Team Building', c: 'team' },
    { i: 6, t: '오징어게임 팀 협동 게임', e: 'Team Mission', c: 'team' },
    { i: 7, t: '오징어게임 팀빌딩 — 게임 시작 전', e: 'Team Building', c: 'team' },
    { i: 8, t: '팀별 미션에 몰입한 참가자들', e: 'Team Mission', c: 'team' },
    { i: 9, t: '오징어게임 구슬치기 미션', e: 'Marbles Game', c: 'team' },
    { i: 10, t: '줄 잡고 블록 쌓기 협동 게임', e: 'Teamwork Game', c: 'team' },
    { i: 11, t: '한옥 연회장 오징어게임 팀빌딩', e: 'Team Building', c: 'team' },
    { i: 12, t: 'Global Training Conference 팀빌딩', e: 'Global Training Conference', c: 'team' },
    { i: 13, t: 'MC 진행 — 오징어게임 팀빌딩', e: 'Hosted by our MC', c: 'rec' },
    { i: 14, t: '송년회 무대 게임', e: 'Stage Game', c: 'party' },
    { i: 15, t: '송년회 코스튬 콘테스트', e: 'Costume Contest', c: 'party' },
    { i: 16, t: '호텔 그랜드볼룸 송년회 무대', e: 'Year-End Party', c: 'party' },
    { i: 17, t: '호텔 연회장 송년회 전경', e: 'Year-End Party', c: 'party' },
    { i: 18, t: '테이블마다 응원이 이어지는 송년회', e: 'Year-End Party', c: 'party' },
    { i: 19, t: '연회장 행사 — 아젠다 안내', e: 'Agenda', c: 'rec' },
    { i: 20, t: 'ICON 임직원 Year-end Party (역삼 아모리스)', e: 'Year-end Party', c: 'party' },
    { i: 21, t: 'ICON Year-end Party 레크레이션', e: 'Year-end Party', c: 'party' },
    { i: 22, t: 'ICON Year-end Party 연회장 전경', e: 'Year-end Party', c: 'party' },
    { i: 23, t: '에어바운스 · 명랑운동회', e: 'Sports Day', c: 'sport' },
    { i: 24, t: '음향 장비 운영 — 송년회', e: 'Sound System', c: 'gear' },
    { i: 25, t: '오징어게임 테마 행사장 입구 세팅', e: 'Venue Setup', c: 'gear' },
    { i: 26, t: '오징어게임 배경막 · 팀 조끼 세팅', e: 'Venue Setup', c: 'gear' }
  ];
  var CATS = { team: '팀빌딩 · 오징어게임', party: '송년회 · 파티', rec: '레크레이션 · MC', sport: '체육대회 · 운동회', gear: '세팅 · 장비' };

  /* ---------- 블로그 글 (blog.naver.com/seoulite712 — 새 글은 맨 앞에 한 줄 추가) ---------- */
  var BLOG = [
    { d: '2026.10.01', c: '회사행사(에이블컴)', t: "[최고의 가성비! 명품 이벤트 행사진행업체] 운동회·기업행사·워크숍 레크레이션 진행업체 에이블커뮤니케이션 | 영어 레크레이션, 칠순잔치, 회사체육대회,명랑운동회, 기업팀빌딩까지", u: 'https://blog.naver.com/seoulite712/224425608484' },
    { d: '2026.09.29', c: '행사후기', t: "[행사후기] 경기도 남양주 화도 실내체육관. 한양대학교 MBA 경영대학원 동문회, 동창회 체육대회 대관부터 진행 – 재경 초등학교,중학교, 고등학교,대학교 총동문회, 총동창회 행사", u: 'https://blog.naver.com/seoulite712/224413772252' },
    { d: '2026.09.26', c: '회사행사(에이블컴)', t: "[행사후기] HD현대 팀빌딩 행사성료! 판교 체육대회,송년회,행사대행 끝판왕! 팀빌딩부터 명랑운동회 게임도구 렌탈까지 원스톱으로 끝내는 판교 이벤트업체", u: 'https://blog.naver.com/seoulite712/224419884854' },
    { d: '2026.09.25', c: '행사스케치(유튜브)', t: "[행사후기] 서울 역삼 아모리스 호텔 ICON 임직원 송년회 Year-end Party 진행! 전체행사 대행! 레크레이션게임·행운권추첨·장기자랑 이벤트업체, 음향·노래방기기렌탈", u: 'https://blog.naver.com/seoulite712/224413717911' },
    { d: '2026.09.18', c: '영어행사(이벤투스팀)', t: "영어팀빌딩, 영어레크레이션강사, 영어MC, 동시통역진행까지_ 영어사회자 정현인사드립니다!", u: 'https://blog.naver.com/seoulite712/224415746427' },
    { d: '2026.09.17', c: '행사후기', t: "[행사후기] 스*키코리아 임직원 대상 송년회 파티행사 레크레이션 게임진행 후기 | 서울 골드리버호텔 그랜드볼룸 전문 사회자MC 진행! 체육대회·명랑운동회·송년회 대행 전문업체", u: 'https://blog.naver.com/seoulite712/224413586218' },
    { d: '2026.09.16', c: '행사후기', t: "[행사후기] 쿠팡 임직원 대상 영어레크레이션·팀빌딩강사 게임진행 후기 | 서울 강남 엘리아나호텔 그랜드볼룸 영어MC 사회자 총출동! 체육대회·명랑운동회·송년회 대행 전문업체", u: 'https://blog.naver.com/seoulite712/224413449250' },
    { d: '2026.09.15', c: '영어행사(이벤투스팀)', t: "인천 한옥호텔 경원재 바이 워커힐, 영어진행 MC의 오징어게임·런닝맨 영어팀빌딩 명랑운동회 워크숍 송년회 레크레이션 행사진행 완벽 후기", u: 'https://blog.naver.com/seoulite712/224412386511' },
    { d: '2026.09.14', c: '영어행사(이벤투스팀)', t: "[행사후기] 서울 워커힐 호텔에서 진행된 국내 대형 건설사 A사 외국계 지사 영어 팀빌딩 & 오징어게임 체육대회", u: 'https://blog.naver.com/seoulite712/224410988380' },
    { d: '2026.09.13', c: '영어행사(이벤투스팀)', t: "\"서울 중구 서울클럽 연회장\"을 뒤집어놓은 영어진행 오징어게임 영어팀빌딩! 동시통역급 영어MC가 만든 완벽한 영어레크레이션 행사진행 후기", u: 'https://blog.naver.com/seoulite712/224399617260' },
    { d: '2026.09.11', c: '행사후기', t: "\"서울, 경기지역 고등학교 축제\"를 뜨겁게 달군 음향 및 명랑운동회 현장! 학교 실내체육관 레크레이션게임부터 게임도구 렌탈까지 완벽 지원한 행사진행 후기", u: 'https://blog.naver.com/seoulite712/224406951056' },
    { d: '2026.09.10', c: '행사후기', t: "서울의 초등학교 학년별 명랑운동회! 레크레이션게임부터 게임도구 렌탈까지 완벽 지원한 행사진행 후기", u: 'https://blog.naver.com/seoulite712/224406942409' },
    { d: '2026.09.07', c: '행사후기', t: "경기도 의왕 국립 철도대학교 대운동장, 국립철도고등학교 총동문회 주관 야외 체육대회! 음향·천막렌탈, 노래방기기 대여 부터 명랑운동회 진행까지 원스톱 완벽 지원한 행사대행사 찐후기", u: 'https://blog.naver.com/seoulite712/224399452646' },
    { d: '2026.09.05', c: '행사후기', t: "충남 천안시 방송통신중학교 한마음 명랑운동회 현장! 체육대회 종목 게임도구 박터트리기 렌탈부터 음향시스템 대여, 레크레이션 일부 진행까지 완벽 지원한 진행 후기!", u: 'https://blog.naver.com/seoulite712/224399430653' },
    { d: '2026.09.03', c: '행사후기', t: "경기도 시흥시 댓골 행복 축제 성공 진행 후기, 팀빌딩·단합대회·체육대회·명랑운동회 게임도구 렌탈 전문업체", u: 'https://blog.naver.com/seoulite712/224399391407' },
    { d: '2026.08.31', c: '회사행사(에이블컴)', t: "서울 동대문 DDP 글로벌 팀빌딩·영어진행 레크레이션 완벽 성공법! 전문 영어 MC부터 한영 아나운서, 무대·음향 렌탈까지 완벽한 원스톱 국제행사 전문 기획사", u: 'https://blog.naver.com/seoulite712/224389500421' },
    { d: '2026.08.30', c: '장소대관', t: "경기도 남양주 실내체육관 체육대회·명랑운동회 완벽 성공법! 장소 섭외부터 음향, 천막렌탈, 글로벌 영어 MC 진행까지 원스톱 이벤트대행사 대표 전문가", u: 'https://blog.naver.com/seoulite712/224389484468' },
    { d: '2026.08.29', c: '영어행사(이벤투스팀)', t: "서울 광진구 워커힐 호텔 영어진행 전문 사회자·MC·동시통역 완벽 가이드! 글로벌 기업 워크숍, 팀빌딩, 컨퍼런스 국제행사 전문 기획사", u: 'https://blog.naver.com/seoulite712/224389479578' },
    { d: '2026.08.28', c: '장소대관', t: "인천 삼산월드체육관 체육대회·명랑운동회 완벽 성공 노하우! 장소 섭외부터 음향, 천막렌탈, 영어 MC 진행까지 원스톱 이벤트대행사 대표 전문가", u: 'https://blog.naver.com/seoulite712/224389471737' },
    { d: '2026.08.27', c: '장소대관', t: "서울 송파 잠실실내체육관 체육대회·명랑운동회 흥행 보증 수표! 음향·천막렌탈부터 영어 MC 진행까지 완벽 섭엽한 대표 이벤트대행사", u: 'https://blog.naver.com/seoulite712/224389463970' },
    { d: '2026.08.26', c: '장소대관', t: "서울 강남 서초종합체육관 체육대회·명랑운동회 완벽 성공 방정식! 음향·천막렌탈부터 영어 진행까지 원스톱 이벤트대행사 대표 전문가", u: 'https://blog.naver.com/seoulite712/224389453056' },
    { d: '2026.08.25', c: '장소대관', t: "하남 미사경정공원 체육대회·명랑운동회 완벽 가이드! 장소 섭외부터 음향, 천막렌탈, 영어 진행까지 원스톱 이벤트대행사", u: 'https://blog.naver.com/seoulite712/224389445599' },
    { d: '2026.07.29', c: '회사행사(에이블컴)', t: "레크레이션 게임도구 대여 시 꼭 알아야 할 5가지 주의사항", u: 'https://blog.naver.com/seoulite712/224255591653' },
    { d: '2026.07.23', c: '회사행사(에이블컴)', t: "박터트리기 게임을 위한 레크레이션 게임도구 택배 이용 방법 완벽 가이드", u: 'https://blog.naver.com/seoulite712/224259675406' },
    { d: '2026.07.22', c: '회사행사(에이블컴)', t: "게임도구 대여 사이트 비교 분석: 가격, 서비스, 배달 속도 총정리", u: 'https://blog.naver.com/seoulite712/224255551160' },
    { d: '2026.07.22', c: '회사행사(에이블컴)', t: "특급열차 체육대회 맞춤형 게임도구 렌탈 솔루션으로 완벽한 행사 준비하기", u: 'https://blog.naver.com/seoulite712/224259670211' },
    { d: '2026.07.21', c: '회사행사(에이블컴)', t: "체육대회 성공을 위한 레크레이션 게임용 도구 관리법", u: 'https://blog.naver.com/seoulite712/224255544927' },
    { d: '2026.07.21', c: '회사행사(에이블컴)', t: "대여 게임도구로 만드는 특별한 체육대회 이벤트 아이디어", u: 'https://blog.naver.com/seoulite712/224259665029' },
    { d: '2026.07.20', c: '회사행사(에이블컴)', t: "택배로 받는 레크레이션 게임 도구 추천과 솔직 사용 후기", u: 'https://blog.naver.com/seoulite712/224255540526' },
    { d: '2026.07.19', c: '회사행사(에이블컴)', t: "줄다리기줄 대여 업체 추천 및 실제 이용 후기", u: 'https://blog.naver.com/seoulite712/224255535973' },
    { d: '2026.07.18', c: '회사행사(에이블컴)', t: "남양주 워크숍 행사 비용 절약 방법 완벽 가이드", u: 'https://blog.naver.com/seoulite712/224255531008' },
    { d: '2026.07.17', c: '회사행사(에이블컴)', t: "용인에서 즐기는 자연 속 야유회 코스 추천 BEST 4", u: 'https://blog.naver.com/seoulite712/224255525905' },
    { d: '2026.07.16', c: '회사행사(에이블컴)', t: "경기 광주에서 즐기는 야유회 액티비티 추천 BEST", u: 'https://blog.naver.com/seoulite712/224255521137' },
    { d: '2026.07.15', c: '회사행사(에이블컴)', t: "춘천 회사 야유회 필수 준비물 리스트 총정리", u: 'https://blog.naver.com/seoulite712/224255516521' },
    { d: '2026.07.14', c: '회사행사(에이블컴)', t: "양평 워크숍 단합대회 성공 사례 공유와 핵심 노하우", u: 'https://blog.naver.com/seoulite712/224255511763' },
    { d: '2026.07.13', c: '회사행사(에이블컴)', t: "가평에서 회사 야유회 개최하기 좋은 장소 추천 TOP 5", u: 'https://blog.naver.com/seoulite712/224255506782' },
    { d: '2026.07.12', c: '회사행사(에이블컴)', t: "양평 실내체육관 체육대회 행사에서 꼭 알아야 할 주의할 점", u: 'https://blog.naver.com/seoulite712/224255501039' },
    { d: '2026.07.11', c: '회사행사(에이블컴)', t: "강릉 실내체육관 대여 비용과 예약 시기 완벽 가이드", u: 'https://blog.naver.com/seoulite712/224255495996' },
    { d: '2026.07.10', c: '회사행사(에이블컴)', t: "하남 체육대회, 회사 단체 행사로 최적의 장소 활용법 완벽 가이드", u: 'https://blog.naver.com/seoulite712/224255490333' }
  ];

  /* ---------- 대문 히어로 : 한 ↔ 영 문장 · 사진 카드 · MC 자막 ---------- */
  var FLIP = [
    { ko: '모두가 하나 되는<br><em>영어 행사</em>', en: 'One Team,<br><em>In English.</em>' },
    { ko: '웃음이 터지는<br><em>영어 팀빌딩</em>', en: 'Team Building,<br><em>Made Fun.</em>' },
    { ko: '처음부터 끝까지<br><em>영어로 진행</em>', en: 'Hosted<br><em>All in English.</em>' }
  ];
  var CAPS = [
    ['Are you ready, team?', '준비되셨나요, 여러분?'],
    ['Give it up for Team Red!', '레드팀에게 큰 박수 부탁드립니다!'],
    ['Thank you for a wonderful year!', '한 해 동안 정말 수고 많으셨습니다!'],
    ["Let's play the next game!", '다음 게임 시작하겠습니다!']
  ];

  /* ========== 머리 띠 · 메뉴 ========== */
  var hd = $('.hd'), totop = $('#totop');
  function onScroll() {
    var y = window.scrollY || 0;
    if (hd) hd.classList.toggle('on', y > 8);
    if (totop) totop.classList.toggle('on', y > 600);
    checkReveal();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  var burger = $('#burger'), sheet = $('#sheet');
  function closeSheet() { if (!sheet) return; sheet.classList.remove('on'); burger.classList.remove('x'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var on = !sheet.classList.contains('on');
      sheet.classList.toggle('on', on); burger.classList.toggle('x', on); burger.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.body.style.overflow = on ? 'hidden' : '';
    });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', closeSheet); });
  }
  var here = location.pathname.split('/').pop() || 'index.html';
  $$('.menu a').forEach(function (a) { if (a.getAttribute('href') === here) a.classList.add('cur'); });

  /* ========== 히어로 ========== */
  var flip = $('#flip'), cards = $$('#heroStack .card'), cap = $('#cap'), sw = $$('.langsw span');
  if (flip && cards.length) {
    var ko = $('.ko', flip), en = $('.en', flip);
    var pair = 0, isEn = false, front = 0, typing = null;
    function setLang(e) { flip.classList.toggle('is-en', e); sw.forEach(function (s, k) { s.classList.toggle('on', e ? k === 1 : k === 0); }); }
    function layout() { cards.forEach(function (c, k) { c.setAttribute('data-p', String((k - front + cards.length) % cards.length)); }); }
    function typeCap(k) {
      if (!cap) return;
      var l1 = $('.l1', cap), l2 = $('.l2', cap), s = CAPS[k % CAPS.length], n = 0;
      clearInterval(typing); l1.textContent = ''; l2.textContent = '';
      if (reduce) { l1.textContent = s[0]; l2.textContent = s[1]; return; }
      typing = setInterval(function () {
        n++; l1.textContent = s[0].slice(0, n);
        if (n >= s[0].length) { clearInterval(typing); setTimeout(function () { l2.textContent = s[1]; }, 380); }
      }, 42);
    }
    layout(); typeCap(0);
    if (!reduce) {
      setInterval(function () {
        if (document.hidden) return;
        if (!isEn) { isEn = true; setLang(true); return; }
        // 영어 → 다음 한국어 문장으로 넘어가며 사진 카드도 한 장 넘긴다
        pair = (pair + 1) % FLIP.length; ko.innerHTML = FLIP[pair].ko;
        isEn = false; setLang(false);
        setTimeout(function () { en.innerHTML = FLIP[pair].en; }, 850);
        front = (front + 1) % cards.length; layout(); typeCap(front);
      }, 3200);
    }
    cards.forEach(function (c, k) { c.addEventListener('click', function () { if (k !== front) { front = k; layout(); typeCap(front); } }); });
  }

  /* ========== 등장 효과 ========== */
  var reveals = $$('.reveal');
  function checkReveal() {
    var h = window.innerHeight;
    reveals = reveals.filter(function (el) { if (el.getBoundingClientRect().top < h - 60) { el.classList.add('in'); return false; } return true; });
  }
  checkReveal(); setTimeout(checkReveal, 200);

  /* ========== 갤러리 · 라이트박스 ========== */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbT = $('#lbTitle'), lbM = $('#lbMeta'), list = [], lbK = 0;
  function figHTML(w, k, big) {
    return '<figure class="' + (big ? 'big ' : '') + 'reveal" data-k="' + k + '" data-c="' + w.c + '"><img src="assets/img/t/e' + pad(w.i) + '.webp" alt="' + esc(w.t) + '" loading="lazy" width="800" height="600"><figcaption>' + esc(w.t) + '</figcaption></figure>';
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function bindGallery(box) {
    $$('figure', box).forEach(function (f) { f.addEventListener('click', function () { openLb(+f.getAttribute('data-k')); }); });
  }
  function visible() { return $$('figure', $('#pfGrid') || $('#gal')).filter(function (f) { return !f.classList.contains('hide'); }).map(function (f) { return +f.getAttribute('data-k'); }); }
  function openLb(k) {
    var w = list[k]; if (!w || !lb) return; lbK = k;
    lbImg.src = 'assets/img/p/e' + pad(w.i) + '.webp'; lbImg.alt = w.t; lbT.textContent = w.t; lbM.textContent = CATS[w.c] + ' · ' + w.e;
    lb.classList.add('on'); document.body.style.overflow = 'hidden';
  }
  function closeLb() { lb.classList.remove('on'); document.body.style.overflow = ''; }
  function stepLb(d) { var v = visible(), i = v.indexOf(lbK); if (!v.length) return; openLb(v[(i + d + v.length) % v.length]); }
  if (lb) {
    $('#lbX').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); stepLb(-1); });
    $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); stepLb(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') stepLb(-1); if (e.key === 'ArrowRight') stepLb(1); });
    var sx = 0; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1); });
  }
  // 대문 : 8장
  var gal = $('#gal');
  if (gal) {
    var pick = [5, 3, 23, 13, 20, 9, 2, 25];
    list = WORKS;
    gal.innerHTML = pick.map(function (n, j) { return figHTML(WORKS[n - 1], n - 1, j === 0); }).join('');
    bindGallery(gal);
  }
  // 현장사진 : 전체 + 필터
  var pf = $('#pfGrid');
  if (pf) {
    list = WORKS;
    pf.innerHTML = WORKS.map(function (w, k) { return figHTML(w, k, false); }).join('');
    bindGallery(pf);
    var fl = $('#filters');
    if (fl) {
      var counts = {}; WORKS.forEach(function (w) { counts[w.c] = (counts[w.c] || 0) + 1; });
      fl.innerHTML = '<button type="button" class="on" data-f="all">전체<small>' + WORKS.length + '</small></button>' + Object.keys(CATS).map(function (c) { return '<button type="button" data-f="' + c + '">' + CATS[c] + '<small>' + (counts[c] || 0) + '</small></button>'; }).join('');
      $$('button', fl).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', fl).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
          var f = b.getAttribute('data-f');
          $$('figure', pf).forEach(function (g) { g.classList.toggle('hide', f !== 'all' && g.getAttribute('data-c') !== f); g.classList.add('in'); });
        });
      });
    }
  }
  reveals = $$('.reveal:not(.in)'); checkReveal();

  /* ========== 공지 · 블로그 ========== */
  $$('[data-notice]').forEach(function (el) {
    var n = +el.getAttribute('data-notice') || 5;
    el.innerHTML = NOTICES.length ? NOTICES.slice(0, n).map(function (x) { return '<li><small>' + x.d + '</small><b>' + esc(x.t) + (x.n ? '<span class="new">NEW</span>' : '') + '</b></li>'; }).join('') : '<li><b>등록된 공지가 없습니다.</b></li>';
  });
  $$('[data-blog]').forEach(function (el) {
    var n = +el.getAttribute('data-blog') || 5;
    el.innerHTML = BLOG.slice(0, n).map(function (b) { return '<li><a href="' + b.u + '" target="_blank" rel="noopener"><small>' + b.d.slice(5) + '</small> <b>' + esc(b.t) + '</b></a></li>'; }).join('');
  });
  var tabs = $('#btabs');
  if (tabs) {
    $('[data-t="notice"] small', tabs).textContent = NOTICES.length;
    $('[data-t="blog"] small', tabs).textContent = BLOG.length;
    $('[data-t="files"] small', tabs).textContent = FILES.length;
    $$('button', tabs).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', tabs).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $$('.pane').forEach(function (p) { p.classList.toggle('on', p.id === b.getAttribute('data-t')); });
        history.replaceState(null, '', '#' + b.getAttribute('data-t'));
      });
    });
    var h0 = (location.hash || '').slice(1); var tb = $('[data-t="' + h0 + '"]', tabs); if (tb) tb.click();
    $('#noticeBoard').innerHTML = NOTICES.length ? NOTICES.map(function (x, i) {
      return '<li><span class="no' + (x.n ? ' pin' : '') + '">' + (x.n ? '공지' : NOTICES.length - i) + '</span><b>' + esc(x.t) + (x.b ? '<small>' + esc(x.b) + '</small>' : '') + '</b><span class="d">' + x.d + '</span></li>';
    }).join('') : '<li><b>등록된 공지가 없습니다.</b></li>';
    var PER = 10, page = 0, q = '';
    function drawBlog() {
      var L = BLOG.filter(function (b) { return !q || b.t.toLowerCase().indexOf(q) >= 0; });
      var pages = Math.max(1, Math.ceil(L.length / PER)); if (page >= pages) page = pages - 1;
      $('#blogBoard').innerHTML = L.length ? L.slice(page * PER, page * PER + PER).map(function (b, i) {
        return '<a class="row" href="' + b.u + '" target="_blank" rel="noopener"><span class="no">' + (L.length - page * PER - i) + '</span><b>' + esc(b.t) + '<small>' + esc(b.c) + '</small></b><span class="d">' + b.d + '</span></a>';
      }).join('') : '<p style="padding:24px 6px;color:var(--g6)">찾는 글이 없습니다.</p>';
      $('#blogPager').innerHTML = pages > 1 ? Array.apply(null, Array(pages)).map(function (_, k) { return '<button type="button"' + (k === page ? ' class="on"' : '') + ' data-p="' + k + '">' + (k + 1) + '</button>'; }).join('') : '';
      $$('#blogPager button').forEach(function (b) { b.addEventListener('click', function () { page = +b.getAttribute('data-p'); drawBlog(); $('#blog').scrollIntoView({ block: 'start' }); }); });
    }
    drawBlog();
    var bq = $('#blogQ'); if (bq) bq.addEventListener('input', function () { q = bq.value.trim().toLowerCase(); page = 0; drawBlog(); });
    $('#fileBoard').innerHTML = FILES.map(function (f, i) {
      return '<a class="row" href="' + f.u + '" target="_blank" rel="noopener"><span class="no">' + (FILES.length - i) + '</span><b>' + esc(f.t) + '<small>' + esc(f.k) + ' · 블로그에서 열림</small></b><span class="d">BLOG ↗</span></a>';
    }).join('');
  }

  /* ========== 문의 보내기 ========== */
  function isMobile() { return /iPhone|iPad|Android/i.test(navigator.userAgent); }
  function send(text, data, done) {
    if (FORM_ENDPOINT) {
      data.at = new Date().toISOString(); data.page = location.href; data.service = '[이벤투스] 영어행사 문의'; data.message = text;
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(data) }).catch(function () {}).then(function () { done(true); });
      return;
    }
    if (isMobile()) { var ios = /iPhone|iPad/i.test(navigator.userAgent); location.href = 'sms:' + SMS_TO + (ios ? '&' : '?') + 'body=' + encodeURIComponent(text); done(true); return; }
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
    done(false);
  }
  var form = $('#askForm');
  if (form) {
    var done = $('#formDone');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // 스팸 봇 함정
      var d = {}; ['name', 'tel', 'email', 'org', 'type', 'date', 'place', 'people', 'lang', 'msg'].forEach(function (k) { d[k] = form.elements[k] ? form.elements[k].value.trim() : ''; });
      if (!d.name || !d.tel) { alert('담당자 이름과 연락처는 꼭 적어 주세요.'); (d.name ? form.elements.tel : form.elements.name).focus(); return; }
      if (!$('#fAgree').checked) { alert('개인정보 수집 · 이용에 동의해 주세요.'); return; }
      var text = '[' + COMPANY + ' 영어행사 문의]\n담당자: ' + d.name + '\n연락처: ' + d.tel + (d.email ? '\n이메일: ' + d.email : '') + '\n회사 · 기관: ' + (d.org || '-') + '\n행사 종류: ' + d.type + '\n진행 언어: ' + d.lang + '\n날짜: ' + (d.date || '-') + '\n장소: ' + (d.place || '-') + '\n인원: ' + (d.people || '-') + '\n내용: ' + (d.msg || '-');
      send(text, d, function (sent) {
        done.classList.add('on');
        if (!sent) $('p', done).innerHTML = '문의 내용을 복사해 두었습니다.<br><b>' + SMS_TO + '</b> 로 문자 · 전화 주시거나<br>카카오톡 1:1 상담에 붙여 넣어 주세요.';
      });
    });
    var again = $('#formAgain'); if (again) again.addEventListener('click', function () { done.classList.remove('on'); form.reset(); });
  }

  onScroll();
})();
