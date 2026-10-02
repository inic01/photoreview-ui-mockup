/* 시안 공통 도구 — 네트워크 호출 없음. 모든 데이터는 아래 샘플입니다. */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rich = t => esc(t).replace(/\n/g,"<br>")
  .replace(/\[\[([^\]]+)\]\]/g,'<span class="hl">$1</span>')
  .replace(/\{\{([^}]+)\}\}/g,'<span class="hlk">$1</span>');
function toast(msg){
  let t = $("#toast"); if(!t){ t=document.createElement("div"); t.id="toast"; t.className="toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("on"), 2200);
}
const NOSAVE = () => toast("시안이므로 실제 저장되지 않습니다");

/* 상단 시안 띠 */
function mockbar(cur){
  const pages = [["index.html","시안 목록"],["form.html","① 고객 접수폼"],["admin.html","② 관리자 업무"],
                 ["settings.html","③ 이벤트/접수폼 관리"],["notices.html","④ 안내 문구"],["reserve.html","⑤ 예약발송"]];
  const bar = document.createElement("div"); bar.className="mockbar";
  bar.innerHTML = '<b>UI 시안</b><span>샘플 데이터 · 운영 서버와 연결 없음 · 저장되지 않음</span><span class="sp"></span>'
    + pages.map(([h,n]) => `<a href="${h}" class="${h===cur?"on":""}">${n}</a>`).join("");
  document.body.prepend(bar);
}

/* ── 샘플 데이터 (가짜 고객) ── */
const PRODUCTS = [
  {code:"i90",   name:"무선청소기 i90 MAX",    gift:"네이버페이 10,000원", rw:"coupon"},
  {code:"i50D",  name:"AI 디텍트 i50",         gift:"워셔블필터+배기부필터 1set", rw:"gift"},
  {code:"AO-16LS",name:"에어프라이어 16LS",    gift:"튀김용바스켓 16L,16LS", rw:"gift"},
  {code:"iH12",  name:"가습기 iH12",           gift:"전용 관리 set 가습기용", rw:"gift", pre:true},
  {code:"iFD01-H",name:"음식물처리기 iFD01 (밀폐키친홀더)", gift:"밀폐키친홀더 iFD01", rw:"gift"},
  {code:"iFD01-F",name:"음식물처리기 iFD01 (활성탄필터)",   gift:"활성탄필터 iFD01", rw:"gift"},
  {code:"iSA7",  name:"전기그릴 iSA7",         gift:"디바이더 7L", rw:"gift"},
  {code:"iEK01", name:"분유포트 iEK01",        gift:"배민 3,000원", rw:"coupon"}
];
const prodOf = c => PRODUCTS.find(p=>p.code===c) || {code:c,name:c,gift:"-",rw:"gift"};
const LAST = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권","황","안","송","전","홍"];
const FIRST = ["하늘","민준","서연","지우","도윤","하은","시우","수아","예준","지아","주원","채원","건우","다은","현우","유나","은서","지호","서준","소율"];
const SRC = ["스마트스토어","쿠팡","11번가","오늘의집","자사몰","G마켓"];
function rnd(seed){ let s = seed; return () => (s = (s*9301+49297)%233280)/233280; }
function makeEntries(n=86){
  const r = rnd(7), out = [];
  for(let i=0;i<n;i++){
    const p = PRODUCTS[Math.floor(r()*PRODUCTS.length)];
    const type = (p.code==="i90"||r()<.25) ? "coupang" : "review";
    const st = r(); const status = st<.55?"eligible":st<.75?"ineligible":st<.9?"review":"pending";
    const d = new Date(2026,8,1+Math.floor(r()*31), 9+Math.floor(r()*10), Math.floor(r()*60));
    const name = LAST[Math.floor(r()*LAST.length)] + FIRST[Math.floor(r()*FIRST.length)];
    out.push({
      id:"S"+String(1000+i), type, product:p.code, name,
      phone:"010-"+String(1000+Math.floor(r()*8999))+"-"+String(1000+Math.floor(r()*8999)),
      source: type==="coupang" ? "쿠팡" : SRC[Math.floor(r()*SRC.length)],
      date:d, status, rw:p.rw, gift:p.gift,
      shipped: status==="eligible" && r()<.25,
      approved: status==="ineligible" && r()<.3,
      dup: r()<.08,
      agent: status==="ineligible" ? ["박상담","최상담","정상담",""][Math.floor(r()*4)] : "",
      callStatus: status==="ineligible" ? ["","부재중","통화완료"][Math.floor(r()*3)] : "",
      rating: type==="review" ? (status==="ineligible" ? 1+Math.floor(r()*2) : 3+Math.floor(r()*3)) : null,
      serial: type==="coupang" ? p.code.toUpperCase()+"-"+String(100000+Math.floor(r()*899999)) : "",
      aiSerial: type==="coupang" ? (status==="review" ? "판독 모호" : status==="ineligible" ? "다른 번호" : "일치") : "",
      shots: type==="review" ? 1+Math.floor(r()*3) : 1,
      address:"서울시 샘플구 예시로 "+(1+Math.floor(r()*99))+"길 "+(1+Math.floor(r()*30))
    });
  }
  return out.sort((a,b)=>b.date-a.date);
}
/* 시안의 예약발송 지정 제품(샘플) — 이 제품의 적합 건은 사은품 탭에서 빠지고 예약발송 목록으로 갑니다 */
const RESERVE_DEFAULT = { "AO-16LS":"10월 중순", "i50D":"10월 말", "iSA7":"" };
const fmtDate = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const fmtDT   = d => fmtDate(d)+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
const STATUS = {eligible:["적합","ok"],ineligible:["부적합","bad"],review:["확인필요","warn"],pending:["심사중","blue"]};
function statusChip(e){
  if(e.shipped) return '<span class="chip">출고됨</span>';
  if(e.approved) return '<span class="chip accent">출고 승인</span>';
  const [t,c] = STATUS[e.status]; return `<span class="chip ${c}">${t}</span>`;
}
function aiSummary(e){
  if(e.status==="pending") return "AI 심사 대기 중";
  if(e.type==="coupang") return "S/N "+e.aiSerial+" · 구매내역 "+(e.status==="review"?"판독 모호":"확인");
  return "별점 "+e.rating+"점 · 후기 확인 · 사진 "+e.shots+"장";
}
/* ── 안내 문구 샘플 (키는 실제 키 이름, 문구는 샘플) ──
   kakao: true=상담 버튼 지원·켜짐 / false=지원·꺼짐 / null=이 문구는 상담 버튼 미지원
   ph: 이 문구에 들어가야 하는 ○○ 개수 */
const SCREENS = { cover:"표지", lookup:"구매 확인", consent:"동의", photo:"사진(리뷰 캡처)", buy:"구매내역", sn:"S/N 등록",
                  info:"받으실 정보", submit:"신청 버튼 누른 뒤", done:"접수 완료", check:"참여 조회" };
const SITS = { guide:"안내", err:"입력 오류", reject:"서버 거부", dup:"중복", done:"완료" };
const NOTICES = [
 {k:"errSerial", n:"시리얼번호 미입력", sc:"sn", si:"err", where:"쿠팡 정품등록 > S/N 등록 화면 · S/N 입력칸 아래 빨간 글씨",
  t:"시리얼번호를 입력해 주세요.", d:"시리얼번호를 입력해 주세요.", kakao:null, ph:0},
 {k:"errSerialack", n:"S/N 확인 체크 누락", sc:"sn", si:"err", where:"쿠팡 정품등록 > S/N 등록 화면 · 확인 체크 아래 빨간 글씨",
  t:"확인에 체크해 주세요.", d:"확인에 체크해 주세요.", kakao:null, ph:0},
 {k:"snImageMissing", n:"S/N 라벨 사진 누락 (서버 확인)", sc:"submit", si:"reject", where:"쿠팡 정품등록 > 「참여 신청하기」를 눌렀을 때 팝업",
  t:"S/N 라벨 사진을 업로드해 주세요.", d:"S/N 라벨 사진을 업로드해 주세요.", kakao:false, ph:0},
 {k:"serialMissing", n:"S/N 미입력 (서버 확인)", sc:"submit", si:"reject", where:"쿠팡 정품등록 > 「참여 신청하기」를 눌렀을 때 팝업",
  t:"시리얼번호(S/N)를 입력해 주세요.", d:"시리얼번호(S/N)를 입력해 주세요.", kakao:false, ph:0},
 {k:"dupSerial", n:"S/N 중복 등록", sc:"submit", si:"dup", where:"쿠팡 정품등록 > 신청 후 이미 등록된 S/N일 때 팝업",
  t:"시리얼번호(S/N)가 이미 등록되었습니다.\n동일한 S/N은 {{최초 등록 1명}}에게만 발송됩니다.", d:"시리얼번호(S/N)가 이미 등록되었습니다", kakao:true, ph:0},
 {k:"imageMissing", n:"리뷰 이미지 누락 (서버 확인)", sc:"submit", si:"reject", where:"포토리뷰 > 「참여 신청하기」를 눌렀을 때 팝업",
  t:"리뷰 이미지를 업로드해 주세요.", d:"리뷰 이미지를 업로드해 주세요.", kakao:false, ph:0},
 {k:"errFile", n:"캡처 이미지 미첨부", sc:"photo", si:"err", where:"포토리뷰 > 캡처 및 받으실 정보 화면 · 사진 칸 아래 빨간 글씨",
  t:"이미지를 등록해 주세요.", d:"이미지를 등록해 주세요.", kakao:null, ph:0},
 {k:"buyImageMissing", n:"구매내역 캡처 누락 (서버 확인)", sc:"submit", si:"reject", where:"쿠팡 정품등록 > 「참여 신청하기」를 눌렀을 때 팝업",
  t:"구매내역 캡처를 업로드해 주세요.", d:"구매내역 캡처를 업로드해 주세요.", kakao:false, ph:0},
 {k:"errBuy", n:"구매내역 캡처 미첨부 (새 칸)", sc:"buy", si:"err", where:"쿠팡 정품등록 > 구매내역 화면 · 사진 칸 아래 빨간 글씨",
  t:"구매내역 캡처를 등록해 주세요.", d:"구매내역 캡처를 등록해 주세요.", kakao:null, ph:0, isNew:true},
 {k:"errEmail", n:"이메일 형식 오류 (새 칸)", sc:"info", si:"err", where:"받으실 정보 화면 · 이메일 칸 아래 빨간 글씨",
  t:"올바른 이메일을 입력해 주세요.", d:"올바른 이메일을 입력해 주세요.", kakao:null, ph:0, isNew:true},
 {k:"errName", n:"성함 미입력", sc:"info", si:"err", where:"받으실 정보 화면 · 성함 칸 아래 빨간 글씨",
  t:"성함을 입력해 주세요.", d:"성함을 입력해 주세요.", kakao:null, ph:0},
 {k:"errPhone", n:"연락처 오류", sc:"info", si:"err", where:"받으실 정보 화면 · 연락처 칸 아래 빨간 글씨",
  t:"연락처를 정확히 입력해 주세요.", d:"연락처를 정확히 입력해 주세요.", kakao:null, ph:0},
 {k:"notFoundOrd", n:"주문번호로 구매 내역 없음", sc:"lookup", si:"guide", where:"포토리뷰 > 구매 확인 화면 · 조회 결과 상자",
  t:"[[입력하신 주문번호로 구매 내역을 찾지 못했습니다.]]\n주문번호를 다시 확인하시거나 {{성함+연락처}}로 조회해 주세요.", d:"입력하신 주문번호로 구매 내역을 찾지 못했습니다.", kakao:true, ph:0},
 {k:"tokenExpired", n:"구매 확인 만료", sc:"submit", si:"reject", where:"포토리뷰 > 「참여 신청하기」를 눌렀을 때 팝업",
  t:"구매 확인이 만료되었습니다.\n처음 화면에서 구매 내역을 다시 조회한 뒤 접수해 주세요.", d:"구매 확인이 만료되었습니다.\n처음 화면에서 구매 내역을 다시 조회한 뒤 접수해 주세요.", kakao:false, ph:0},
 {k:"submitRate", n:"접수 시도 과다", sc:"submit", si:"reject", where:"「참여 신청하기」를 짧은 시간에 여러 번 눌렀을 때 팝업",
  t:"짧은 시간 동안 접수를 여러 번 시도하셨습니다.\n잠시 후 다시 시도해 주세요.\n\n{{※ 고객센터 운영 안내 ※}}\n{{- 카톡 상담 : 화~금 10:00~17:00}}", d:"접수 시도가 너무 잦습니다.\n잠시 후 다시 시도해 주세요.", kakao:true, ph:0},
 {k:"consentDeny", n:"필수 동의 거부", sc:"consent", si:"guide", where:"동의 화면 · 필수 항목을 「거부」로 고르면 그 항목 아래 빨간 상자",
  t:"○○에 [[“동의”를 하지 않으셨습니다.]]\n사은품 택배 발송을 위한 정보 수집이 불가하여 이벤트 참여가 어렵습니다.", d:"○○에 동의하지 않으셨습니다.", kakao:null, ph:1},
 {k:"doneReviewGift", n:"포토리뷰 · 사은품(착불) 완료", sc:"done", si:"done", where:"포토리뷰 > 접수 완료 창 · 제목 밑 문장",
  t:"리뷰 참여 내용 확인 후 ○○ 발송됩니다.\n포토리뷰 참여 확인 후 제품은 순차적으로 발송되며, 평균 1주일 이내 받아보실 수 있습니다. 배송비는 착불로 발생합니다.",
  d:"리뷰 심사(별점·사진 자동 확인) 후 사은품이 발송됩니다.", kakao:null, ph:1},
 {k:"doneCoupangCoupon", n:"쿠팡 · 상품권 완료", sc:"done", si:"done", where:"쿠팡 정품등록 > 접수 완료 창 · 제목 밑 문장",
  t:"정품등록 확인 후 ○○ 발송됩니다.\n기프티콘은 카카오톡 「기프티쇼비즈 알림톡」으로 발송됩니다.", d:"정품등록 심사(시리얼번호 자동 대조) 후 기프티콘(상품권)이 발송됩니다.", kakao:null, ph:1},
 {k:"doneGiftReserve", n:"예약발송 제품 완료", sc:"done", si:"done", where:"접수 완료 창 · 예약발송 지정 제품일 때",
  t:"예약발송 제품으로 {{○○}} 입고 예정입니다.\n입고 후 순차적으로 발송해 드립니다.", d:"예약발송으로 {{○○}} 입고 예정입니다.", kakao:null, ph:1},
 {k:"checkNone", n:"참여 내역 없음", sc:"check", si:"guide", where:"참여 조회 화면 · 결과 상자",
  t:"{{○○}} 님으로 참여하신 내역이 없습니다.\n포토리뷰 이벤트 또는 쿠팡 로켓배송 정품등록 여부 선택 후 다음을 눌러 접수 부탁드립니다.", d:"{{○○}} 님으로 참여하신 내역이 없습니다.", kakao:false, ph:1}
];

/* 사진 자리(그림 없이 그린 견본) */
function fakeShot(label, tone){
  const c = tone || "#e9e4df";
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="300" height="400" fill="${c}"/><rect x="20" y="24" width="260" height="34" rx="8" fill="#fff"/>
    <text x="34" y="47" font-size="15" fill="#8a827c">${esc(label)}</text>
    <text x="34" y="96" font-size="22" fill="#f5a623">★★★★★</text>
    <rect x="20" y="114" width="200" height="10" rx="5" fill="#d8d1ca"/><rect x="20" y="132" width="240" height="10" rx="5" fill="#d8d1ca"/>
    <rect x="20" y="150" width="160" height="10" rx="5" fill="#d8d1ca"/>
    <rect x="20" y="178" width="120" height="120" rx="10" fill="#cfc6bd"/><rect x="152" y="178" width="120" height="120" rx="10" fill="#d9d1c8"/>
    <text x="150" y="360" font-size="12" text-anchor="middle" fill="#8a827c">샘플 이미지</text></svg>`;
}
