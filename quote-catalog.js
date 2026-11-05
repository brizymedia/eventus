/*
 * 이벤투스 — 견적 품목표와 견적 코드 읽기
 *
 * quote.html 과 schedule.html 이 함께 쓴다. 품목을 고칠 곳은 여기 하나뿐이다.
 * 견적서에는 서버가 없다 — 견적 하나가 주소 뒤 #q= 에 담기는 짧은 코드 하나다.
 * 그 코드를 푸는 규칙도 여기 둔다(두 화면이 같은 규칙으로 읽어야 하니까).
 */

const CATALOG = [
  { group:'영어 행사 진행', items:[
    { id:'p1', name:'영어 팀빌딩',          spec:'오징어게임 · 런닝맨 · 팀 미션',             unit:'식', price:null },
    { id:'p2', name:'영어 레크레이션',      spec:'아이스브레이킹 · 단체 게임',                unit:'식', price:null },
    { id:'p3', name:'영어 체육대회',        spec:'실내 · 야외 운동회 · 명랑운동회',           unit:'식', price:null },
    { id:'p4', name:'영어 워크샵',          spec:'외국인 직원 워크숍 · 컨퍼런스 프로그램',     unit:'식', price:null },
    { id:'p5', name:'영어 송년회 · 파티',   spec:'Year-end Party · 시상 · 무대 게임',          unit:'식', price:null },
    { id:'p6', name:'영어 특강 · 진행',     spec:'강연 · 행사 영어 진행',                     unit:'식', price:null },
    { id:'p7', name:'학교 영어캠프',        spec:'퀴즈 · 수업 · 명랑운동회 · 연극',            unit:'식', price:null },
    { id:'p8', name:'사전 영어 Zoom 미팅',  spec:'외국인 담당자 · 본사 팀과 사전 협의',         unit:'회', price:null },
  ]},
  { group:'MC · 인력', items:[
    { id:'f1', name:'영어 MC',              spec:'영어 단독 진행',                          unit:'명', price:null },
    { id:'f2', name:'한영 동시 진행 MC',     spec:'한국어 + 영어 진행',                       unit:'명', price:null },
    { id:'f3', name:'아나운서 섭외',         spec:'공식 행사 · 의전 진행',                     unit:'명', price:null },
    { id:'f5', name:'진행 스태프',           spec:'현장 진행 · 게임 운영 인력',               unit:'명', price:null, qty:true },
  ]},
  { group:'장비 · 장소', items:[
    { id:'a1', name:'음향',                 spec:'스피커 · 무선 마이크 · 콘솔',              unit:'식', price:null },
    { id:'a4', name:'무선 마이크 추가',      spec:'핸드 / 핀 마이크',                         unit:'개', price:null, qty:true },
    { id:'b2', name:'조명',                 spec:'무대 · 연회장 조명',                       unit:'식', price:null },
    { id:'h3', name:'게임 물품',            spec:'팀 조끼 · 미션 도구 · 오징어게임 소품',      unit:'식', price:null },
    { id:'h1', name:'에어바운스',            spec:'체육대회 · 운동회',                        unit:'동', price:null, qty:true },
    { id:'d1', name:'행사장소 대관',         spec:'호텔 · 연회장 · 체육관 · 한옥',             unit:'식', price:null },
  ]},
  { group:'기타', items:[
    { id:'g2', name:'운반 · 설치 인건비', spec:'상하차 · 설치 · 철수',             unit:'식', price:null },
    { id:'g3', name:'출장비',            spec:'수도권 외 지역',                    unit:'식', price:null },
  ]},
];
const BY_ID = {};
CATALOG.forEach(g => g.items.forEach(it => { BY_ID[it.id] = it; }));

const 견적정보칸 = ['org','name','tel','email','title','date','place','people','memo'];
const 견적정보짧게 = { org:'o', name:'n', tel:'t', email:'e', title:'m', date:'d', place:'p', people:'c', memo:'x' };

const 견적b64u   = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const 견적unb64u = (s) => {
  let t = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  return decodeURIComponent(escape(atob(t)));
};

/**
 * 견적 코드를 사람이 읽을 수 있는 모양으로 푼다.
 *   { 정보:{org,name,tel,…}, 줄:[{id,name,spec,qty,unit,days,price}], 할인 }
 * 못 읽으면 null.
 */
function 견적풀기(코드) {
  try {
    const s = JSON.parse(견적unb64u(코드));
    const 정보 = {};
    견적정보칸.forEach((k, idx) => {
      const i = s.i;
      if (!i) { 정보[k] = ''; return; }
      const v = Array.isArray(i) ? i[idx]
              : (i[견적정보짧게[k]] != null ? i[견적정보짧게[k]] : i[k]);
      정보[k] = v == null ? '' : String(v);
    });

    const 책 = (id) => BY_ID[id] || { name: '', spec: '', unit: '식' };
    const 줄 = (s.r || []).map((a) => {
      if (typeof a === 'string') {
        const c = 책(a);
        return { id: a, name: c.name, spec: c.spec, qty: 1, unit: c.unit, days: 1, price: null };
      }
      if (a.length <= 4) {
        const c = 책(a[0]);
        return { id: a[0], name: c.name, spec: c.spec,
                 qty: a[1] != null ? a[1] : 1, unit: c.unit,
                 days: a[2] != null ? a[2] : 1,
                 price: a[3] != null ? a[3] : null };
      }
      return { id: a[0], name: a[1], spec: a[2], qty: a[3], unit: a[4], days: a[5], price: a[6] };
    });

    return { 정보: 정보, 줄: 줄, 할인: +s.d || 0, 총액: +s.t || 0, 부가세: s.x === 'p' ? '포함' : '별도' };
  } catch (e) { return null; }
}

/* 견적 한 줄을 「300명 내외 · 스피커 4통 · 2개 · 2일」 같은 한 줄 설명으로 */
function 견적줄설명(r) {
  return [r.spec, (+r.qty > 1 ? r.qty + (r.unit || '') : ''), (+r.days > 1 ? r.days + '일' : '')]
    .filter(Boolean).join(' · ');
}
