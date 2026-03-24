'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

/* ══════════════════════════════════════
   GENRE_MAP — 10 카테고리, 35+ 서브장르
   ══════════════════════════════════════ */
const GENRE_MAP: Record<string,any> = {
  storytelling:{icon:'📖',label:'스토리텔링',color:'#a78bfa',gradient:'linear-gradient(135deg,#4c1d95,#7c3aed)',desc:'미스터리,공포,실화,도시전설',subs:{
    mystery:{icon:'🔍',label:'미스터리/추리',tone:'긴장감',speaker:'내레이터 90%',narrationRatio:90,structure:['후킹','단서제시','반전','결론','여운'],bgm:'Dark Ambient',imageStyle:'cinematic',duration:'12분',chapters:7,hookExample:'아무도 눈치채지 못한 그 밤의 진실...'},
    horror:{icon:'👻',label:'공포/괴담',tone:'으스스',speaker:'내레이터 95%',narrationRatio:95,structure:['공포후킹','배경','전개','클라이맥스','충격결말'],bgm:'Horror Drone',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'절대 이 영상을 밤에 혼자 보지 마세요...'},
    realCase:{icon:'📋',label:'실화/사건',tone:'담담+긴장',speaker:'내레이터 85%',narrationRatio:85,structure:['사건개요','인물','전개','수사','결말'],bgm:'Tension Build',imageStyle:'realistic',duration:'15분',chapters:8,hookExample:'실제로 일어난 이 사건, 아직도 미해결입니다...'},
    urbanLegend:{icon:'🌃',label:'도시전설',tone:'미스터리',speaker:'내레이터 90%',narrationRatio:90,structure:['도입','전설소개','증거','분석','결론'],bgm:'Eerie Ambient',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'전 세계에서 동시에 목격된 이것의 정체는...'},
    mythology:{icon:'⚔️',label:'신화/무협',tone:'서사적',speaker:'내레이터 80%',narrationRatio:80,structure:['시대배경','인물','대립','전투','교훈'],bgm:'Epic Orchestral',imageStyle:'illustration',duration:'12분',chapters:7,hookExample:'신들조차 두려워한 단 하나의 존재...'},
    drama:{icon:'🎭',label:'드라마/감동',tone:'감성',speaker:'다중화자 60%',narrationRatio:40,structure:['일상','사건','갈등','절정','감동결말'],bgm:'Emotional Piano',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'그 날 이후, 아무것도 같지 않았습니다...'}
  }},
  education:{icon:'📚',label:'교육/정보',color:'#60a5fa',gradient:'linear-gradient(135deg,#1e3a5f,#3b82f6)',desc:'지식,노하우,학습',subs:{
    knowledge:{icon:'💡',label:'지식/상식',tone:'친근+전문',speaker:'내레이터 100%',narrationRatio:100,structure:['질문후킹','개요','핵심3개','사례','정리'],bgm:'Light Corporate',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'99%가 모르는 이 사실...'},
    howto:{icon:'🛠️',label:'방법/튜토리얼',tone:'실용적',speaker:'내레이터 100%',narrationRatio:100,structure:['문제제시','준비물','단계별','팁','마무리'],bgm:'Upbeat Lo-fi',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'이 방법만 따라하면 누구나...'},
    psychology:{icon:'🧠',label:'심리/자기계발',tone:'공감+동기부여',speaker:'내레이터 95%',narrationRatio:95,structure:['공감후킹','문제분석','해결법','실천팁','마무리'],bgm:'Motivational',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'성공하는 사람들이 절대 하지 않는...'},
    science:{icon:'🔬',label:'과학/기술',tone:'호기심',speaker:'내레이터 100%',narrationRatio:100,structure:['질문','현상설명','원리','실험','결론'],bgm:'Techy Ambient',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'과학자들도 설명하지 못하는 이 현상...'}
  }},
  finance:{icon:'💰',label:'재테크/비즈니스',color:'#34d399',gradient:'linear-gradient(135deg,#064e3b,#10b981)',desc:'주식,부동산,창업',subs:{
    investment:{icon:'📈',label:'주식/투자',tone:'전문+신뢰',speaker:'내레이터 100%',narrationRatio:100,structure:['시장현황','분석','전략','리스크','결론'],bgm:'Corporate',imageStyle:'realistic',duration:'12분',chapters:7,hookExample:'지금 이 종목을 사지 않으면...'},
    realestate:{icon:'🏠',label:'부동산',tone:'실용',speaker:'내레이터 100%',narrationRatio:100,structure:['현황','지역분석','투자포인트','주의사항','전망'],bgm:'Calm Corporate',imageStyle:'realistic',duration:'12분',chapters:7,hookExample:'2026년 부동산, 이 지역만...'},
    sidehustle:{icon:'💼',label:'부업/창업',tone:'동기부여',speaker:'내레이터 95%',narrationRatio:95,structure:['성공사례','방법소개','수익구조','시작방법','주의점'],bgm:'Upbeat',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'직장 다니면서 월 300 버는...'}
  }},
  history:{icon:'🏛️',label:'역사/문화',color:'#f59e0b',gradient:'linear-gradient(135deg,#78350f,#f59e0b)',desc:'역사,인물,문명',subs:{
    korean:{icon:'🇰🇷',label:'한국사',tone:'서사적',speaker:'내레이터 90%',narrationRatio:90,structure:['시대배경','인물','사건','의미','교훈'],bgm:'Traditional Korean',imageStyle:'illustration',duration:'12분',chapters:7,hookExample:'교과서가 감춘 조선시대의 충격적 진실...'},
    world:{icon:'🌍',label:'세계사',tone:'장대',speaker:'내레이터 90%',narrationRatio:90,structure:['배경','원인','전개','결과','영향'],bgm:'Cinematic Orchestra',imageStyle:'cinematic',duration:'15분',chapters:8,hookExample:'로마 제국이 멸망한 진짜 이유...'},
    war:{icon:'⚔️',label:'전쟁/군사',tone:'긴박',speaker:'내레이터 85%',narrationRatio:85,structure:['전쟁배경','전략','전투','결과','분석'],bgm:'War Drums',imageStyle:'cinematic',duration:'15분',chapters:8,hookExample:'역사상 가장 미친 작전...'}
  }},
  entertainment:{icon:'🎪',label:'엔터/유머',color:'#f472b6',gradient:'linear-gradient(135deg,#831843,#ec4899)',desc:'웃긴이야기,랭킹,퀴즈',subs:{
    comedy:{icon:'😂',label:'코미디',tone:'유쾌',speaker:'다중화자 50%',narrationRatio:50,structure:['도입','상황설정','반전1','반전2','폭소결말'],bgm:'Funny/Quirky',imageStyle:'character',duration:'8분',chapters:5,hookExample:'이걸 보고 안 웃으면 사람이 아닙니다...'},
    ranking:{icon:'🏆',label:'랭킹/TOP',tone:'흥미진진',speaker:'내레이터 100%',narrationRatio:100,structure:['도입','순위발표','1위발표','정리'],bgm:'Energetic Pop',imageStyle:'realistic',duration:'10분',chapters:7,hookExample:'전 세계 TOP 10, 1위는 예상 못합니다...'},
    quiz:{icon:'❓',label:'퀴즈/상식',tone:'참여유도',speaker:'내레이터 80%',narrationRatio:80,structure:['규칙','문제출제','힌트','정답','해설'],bgm:'Game Show',imageStyle:'character',duration:'8분',chapters:6,hookExample:'IQ 130 이상만 맞출 수 있는 문제...'}
  }},
  science_tech:{icon:'🚀',label:'과학/테크',color:'#22d3ee',gradient:'linear-gradient(135deg,#164e63,#06b6d4)',desc:'IT,AI,우주,미래기술',subs:{
    ai_tech:{icon:'🤖',label:'AI/IT',tone:'트렌디',speaker:'내레이터 100%',narrationRatio:100,structure:['트렌드소개','기술설명','사례','전망','정리'],bgm:'Synth/Electronic',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'ChatGPT도 두려워하는 새로운 AI...'},
    space:{icon:'🪐',label:'우주/천문',tone:'경이로움',speaker:'내레이터 95%',narrationRatio:95,structure:['도입','현상','과학적설명','시각화','결론'],bgm:'Cosmic Ambient',imageStyle:'cinematic',duration:'12분',chapters:7,hookExample:'우주 끝에서 발견된 이것...'},
    future:{icon:'🔮',label:'미래/예측',tone:'상상력',speaker:'내레이터 100%',narrationRatio:100,structure:['현재','변화예측','시나리오','영향','결론'],bgm:'Futuristic',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'2050년, 인류는 이렇게 살고 있을 겁니다...'}
  }},
  health:{icon:'💪',label:'건강/웰빙',color:'#4ade80',gradient:'linear-gradient(135deg,#14532d,#22c55e)',desc:'건강,운동,다이어트',subs:{
    medical:{icon:'🏥',label:'의학/질병',tone:'신뢰',speaker:'내레이터 100%',narrationRatio:100,structure:['증상소개','원인','예방법','치료법','정리'],bgm:'Calm Piano',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'이 증상이 나타나면 즉시 병원에...'},
    fitness:{icon:'🏋️',label:'운동/피트니스',tone:'활기',speaker:'트레이너 80%',narrationRatio:60,structure:['효과','준비','동작설명','세트구성','마무리'],bgm:'Workout EDM',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'하루 10분으로 뱃살 빼는 확실한 방법...'},
    mental:{icon:'🧘',label:'멘탈/명상',tone:'차분',speaker:'내레이터 95%',narrationRatio:95,structure:['공감','원인분석','해결법','실천가이드','마무리'],bgm:'Meditation',imageStyle:'illustration',duration:'10분',chapters:5,hookExample:'불안과 스트레스에서 벗어나는 방법...'}
  }},
  lifestyle:{icon:'✨',label:'라이프스타일',color:'#c084fc',gradient:'linear-gradient(135deg,#581c87,#a855f7)',desc:'일상,여행,인테리어',subs:{
    travel:{icon:'✈️',label:'여행',tone:'설렘',speaker:'브이로거 60%',narrationRatio:40,structure:['도착','명소','맛집','꿀팁','총평'],bgm:'Tropical House',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'이 나라 여행, 100만원이면 일주일...'},
    food:{icon:'🍳',label:'요리/먹방',tone:'편안',speaker:'요리사 70%',narrationRatio:30,structure:['메뉴소개','재료','조리','완성','시식'],bgm:'Jazz/Bossa',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'집에서 5분만에 만드는 미쉐린급 요리...'},
    interior:{icon:'🏠',label:'인테리어',tone:'감성',speaker:'내레이터 80%',narrationRatio:80,structure:['비포','컨셉','변화과정','에프터','비용'],bgm:'Chill Lo-fi',imageStyle:'realistic',duration:'10분',chapters:5,hookExample:'10만원으로 방을 호텔처럼...'}
  }},
  commerce:{icon:'🛍️',label:'커머스/리뷰',color:'#fb923c',gradient:'linear-gradient(135deg,#7c2d12,#f97316)',desc:'제품리뷰,비교,언박싱',subs:{
    review:{icon:'⭐',label:'제품 리뷰',tone:'솔직',speaker:'리뷰어 80%',narrationRatio:60,structure:['첫인상','스펙','장점','단점','총평'],bgm:'Modern Pop',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'사기 전에 이 영상을 꼭 보세요...'},
    comparison:{icon:'⚖️',label:'비교/대결',tone:'객관적',speaker:'내레이터 100%',narrationRatio:100,structure:['후보소개','항목별비교','승자발표','추천'],bgm:'Competitive',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'아이폰 vs 갤럭시, 최종 승자는...'},
    unboxing:{icon:'📦',label:'언박싱',tone:'기대감',speaker:'리뷰어 90%',narrationRatio:30,structure:['도착','개봉','첫인상','후기','추천'],bgm:'Upbeat Pop',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'역대급 가성비 제품이 도착했습니다...'}
  }},
  news:{icon:'📰',label:'뉴스/시사',color:'#f87171',gradient:'linear-gradient(135deg,#7f1d1d,#ef4444)',desc:'시사,이슈,분석',subs:{
    breaking:{icon:'🔴',label:'속보/이슈',tone:'긴급',speaker:'앵커 100%',narrationRatio:100,structure:['속보도입','사건경위','영향분석','전망','마무리'],bgm:'News Intro',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'방금 터진 이 뉴스...'},
    analysis:{icon:'📊',label:'심층분석',tone:'분석적',speaker:'해설자 90%',narrationRatio:90,structure:['이슈소개','배경','분석','전문가의견','전망'],bgm:'Serious Corporate',imageStyle:'realistic',duration:'15분',chapters:8,hookExample:'언론이 말하지 않는 진짜 이유...'},
    factcheck:{icon:'✅',label:'팩트체크',tone:'객관적',speaker:'내레이터 100%',narrationRatio:100,structure:['주장소개','검증','근거','판정','정리'],bgm:'Neutral',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'이 뉴스가 사실인지 확인해봤습니다...'}
  }}
};
const GENRE_KEYS = Object.keys(GENRE_MAP);

/* ── 이미지 스타일 2단계 ── */
const IMAGE_STYLE_MAP: Record<string,any> = {
  realistic:{icon:'📷',label:'실사',subs:['사진','다큐멘터리','뉴스']},
  infoCharacter:{icon:'🧑‍🎨',label:'정보성 캐릭터',subs:['스틱맨','심플캐릭터','라인아트','인포그래픽']},
  illustration:{icon:'🎨',label:'일러스트',subs:['동화풍','수채화','유화','디지털아트']},
  animation:{icon:'🎬',label:'애니메이션',subs:['일본애니','3D','카툰','픽셀아트']},
  traditional:{icon:'🖌️',label:'전통화',subs:['수묵화','무협판타지','한국화','동양화']},
};

const TONE_OPTIONS = [
  {id:'novel',label:'소설체',desc:'문학적 표현, 묘사 풍부',icon:'📚'},
  {id:'dramatic',label:'극적체',desc:'대사 중심, 감정 강조',icon:'🎭'},
  {id:'friendly',label:'친근체',desc:'~요 체, 대화하듯',icon:'😊'},
  {id:'explanatory',label:'설명체',desc:'~입니다 체, 정보 전달',icon:'📋'},
  {id:'tense',label:'긴장체',desc:'짧은 문장, 서스펜스',icon:'😰'},
  {id:'humorous',label:'유머체',desc:'재치, 비유, 웃음',icon:'😂'},
];
const SPEAKER_MODES = [
  {id:'solo',total:1,narration:1,characters:0,label:'나레이션 단독',icon:'🎙️'},
  {id:'trio',total:3,narration:1,characters:2,label:'3명 (나레이션+2인)',icon:'👥'},
  {id:'quad',total:4,narration:1,characters:3,label:'4명 (나레이션+3인)',icon:'👥'},
  {id:'quint',total:5,narration:1,characters:4,label:'5명 (나레이션+4인)',icon:'👥'},
];
const DRAMA_ELEMENTS = [
  {id:'conflict',label:'갈등',icon:'⚡'},{id:'twist',label:'반전',icon:'🔄'},
  {id:'emotion',label:'감동',icon:'😢'},{id:'humor',label:'유머',icon:'😂'},
  {id:'tension',label:'긴장감',icon:'😰'},{id:'romance',label:'로맨스',icon:'💕'},
  {id:'growth',label:'성장',icon:'🌱'},{id:'revenge',label:'복수',icon:'🔥'},
  {id:'tragedy',label:'비극',icon:'💔'},
];
const CREATIVE_MODES = [
  {id:'strict',label:'규칙 준수',desc:'설정을 100% 따름',icon:'📏'},
  {id:'balanced',label:'균형 (권장)',desc:'설정 따르되 AI 재량 허용',icon:'⚖️'},
  {id:'free',label:'자유',desc:'설정은 참고만',icon:'🎨'},
];
const HUMAN_TOUCH_ELEMENTS = [
  {id:'experience',label:'개인적 경험',desc:'제작자의 실제 경험담',icon:'💬'},
  {id:'opinion',label:'제작자 의견',desc:'"제 생각에는..." 주관적 의견',icon:'💭'},
  {id:'perspective',label:'관점/프레임',desc:'특정 시각에서 바라보기',icon:'👁️'},
  {id:'educational',label:'교육자 목표',desc:'"기억하셔야 할 것은..."',icon:'🎓'},
];
const HUMAN_TOUCH_LEVELS = [
  {id:'none',label:'없음',percent:'0%'},{id:'minimal',label:'최소',percent:'10%'},
  {id:'medium',label:'중간 (권장)',percent:'20-30%'},{id:'maximum',label:'최대',percent:'40%+'},
];
const CONTENT_FORMATS = [{id:'longform',label:'롱폼',icon:'🎬'},{id:'shorts',label:'쇼츠',icon:'📱'}];
const OUTPUT_LANGUAGES = [
  {id:'ko',label:'한국어',icon:'🇰🇷'},{id:'en',label:'영어',icon:'🇺🇸'},
  {id:'ja',label:'일본어',icon:'🇯🇵'},{id:'zh',label:'중국어',icon:'🇨🇳'},
];
const TTS_ENGINES = [
  {id:'gemini',label:'Google AI Studio TTS (무료)',icon:'🔴',free:true},
  {id:'supertonic',label:'SuperTonic (무료로컬)',icon:'🟢',free:true},
  {id:'edge',label:'Microsoft Edge (무료제한)',icon:'🔵',free:true},
  {id:'openai',label:'OpenAI TTS (유료)',icon:'⚪',free:false},
  {id:'cloud1',label:'Cloud TTS A (월100만자)',icon:'🟡',free:false},
  {id:'cloud2',label:'Cloud TTS B (월100만자)',icon:'🟣',free:false},
];
const SUBTITLE_TEMPLATES = [
  {id:'default',label:'기본 흰색',preview:'color:#fff;background:rgba(0,0,0,0.7)'},
  {id:'yellow',label:'노란 자막',preview:'color:#ffd700;background:rgba(0,0,0,0.8)'},
  {id:'neon',label:'네온',preview:'color:#0ff;text-shadow:0 0 10px #0ff'},
  {id:'minimal',label:'미니멀',preview:'color:#fff;font-size:14px'},
  {id:'bold',label:'굵은 강조',preview:'color:#fff;font-weight:900;font-size:20px'},
];

/* ── 워크플로우 ── */
const WORKFLOW: Record<string,{label:string;tabs:{id:string;icon:string;label:string}[]}> = {
  prepare:{label:'준비',tabs:[
    {id:'overview',icon:'📊',label:'프로젝트 개요'},
    {id:'genre-select',icon:'🎭',label:'장르 선택'},
    {id:'settings',icon:'⚙️',label:'대본 설정'},
    {id:'topic-title',icon:'💡',label:'주제/제목'},
    {id:'synopsis',icon:'📖',label:'시놉시스'},
  ]},
  script:{label:'대본',tabs:[
    {id:'script-gen',icon:'📝',label:'대본 생성'},
    {id:'script-expand',icon:'📐',label:'대본 확장'},
    {id:'script-edit',icon:'✨',label:'대본 편집'},
    {id:'guidelines',icon:'✅',label:'가이드라인'},
  ]},
  analysis:{label:'분석',tabs:[
    {id:'characters',icon:'👥',label:'캐릭터 분석'},
    {id:'scenes',icon:'🎬',label:'장면 분할'},
    {id:'bgm',icon:'🎵',label:'BGM 추천'},
    {id:'video-analysis',icon:'🎥',label:'영상 분석'},
    {id:'structure',icon:'🏗️',label:'구조 분석'},
  ]},
  production:{label:'제작',tabs:[
    {id:'tts',icon:'🔊',label:'TTS 생성'},
    {id:'images',icon:'🖼️',label:'이미지 생성'},
    {id:'timeline',icon:'⏱️',label:'타임라인'},
    {id:'effects',icon:'✨',label:'효과/오버레이'},
    {id:'subtitles',icon:'💬',label:'자막 스타일'},
    {id:'compositor',icon:'🎞️',label:'이미지 컴포지터'},
    {id:'video-render',icon:'🎬',label:'영상 생성'},
    {id:'export',icon:'📦',label:'내보내기'},
  ]},
  marketing:{label:'마케팅',tabs:[
    {id:'seo',icon:'🔍',label:'SEO 분석'},
    {id:'competitors',icon:'⚔️',label:'경쟁 분석'},
    {id:'ab-test',icon:'🧪',label:'A/B 테스트'},
    {id:'series',icon:'📚',label:'시리즈 기획'},
    {id:'calendar',icon:'📅',label:'캘린더'},
    {id:'trends',icon:'📈',label:'트렌드'},
  ]},
  distribution:{label:'배포',tabs:[
    {id:'community',icon:'💬',label:'커뮤니티'},
    {id:'shopping',icon:'🛒',label:'쇼핑 콘텐츠'},
    {id:'youtube-upload',icon:'🚀',label:'유튜브 업로드'},
    {id:'media-library',icon:'📁',label:'미디어 라이브러리'},
    {id:'package',icon:'📦',label:'패키지'},
  ]},
};
const ALL_TABS = Object.values(WORKFLOW).flatMap(g=>g.tabs);

/* ── 로그인 ── */
function LoginScreen({onLogin}:{onLogin:()=>void}){
  const [pw,setPw]=useState('');const [err,setErr]=useState('');
  const check=()=>{if(pw==='rani2024!'){localStorage.setItem('ai-factory-auth','true');onLogin();}else setErr('비밀번호가 틀렸습니다.');};
  return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0a0a1a,#12122a)'}}>
    <div style={{background:'#161630',padding:40,borderRadius:16,textAlign:'center',minWidth:340,border:'1px solid #252550'}}>
      <div style={{fontSize:48,marginBottom:8}}>🎬</div><h1 style={{fontSize:24,marginBottom:4,color:'#fff'}}>AI 콘텐츠 팩토리</h1>
      <p style={{color:'#666',marginBottom:24,fontSize:13}}>영상 제작의 모든 것을 AI로</p>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&check()} placeholder="비밀번호" style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid #252550',background:'#0a0a1a',color:'#fff',fontSize:15,marginBottom:12,boxSizing:'border-box'}}/>
      {err&&<p style={{color:'#ef4444',marginBottom:12,fontSize:13}}>{err}</p>}
      <button onClick={check} style={{width:'100%',padding:12,borderRadius:8,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontSize:15,border:'none',cursor:'pointer',fontWeight:600}}>로그인</button>
    </div></div>);
}


/* ── 시놉시스 파싱 헬퍼 ── */
function parseSynopsis(raw:any):{style:string;content:string}{
  if(!raw)return{style:'',content:''};
  if(typeof raw==='object'&&raw.content)return{style:raw.style||'',content:raw.content};
  if(typeof raw==='string'){
    try{const m=raw.match(/\{[\s\S]*\}/);if(m){const o=JSON.parse(m[0]);return{style:o.style||'',content:o.content||raw};}}catch{}
    try{const o=JSON.parse(raw);return{style:o.style||'',content:o.content||raw};}catch{}
    return{style:'',content:raw};
  }
  return{style:'',content:JSON.stringify(raw)};
}
/* ── 마크다운 ── */
function renderMarkdown(t:string){if(!t)return '';return t.replace(/```(\w*)\n([\s\S]*?)```/g,'<pre style="background:#0a0a1a;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid #252550;margin:12px 0;font-size:13px;line-height:1.6"><code>$2</code></pre>').replace(/`([^`]+)`/g,'<code style="background:#1e1e3e;padding:2px 6px;border-radius:4px;font-size:13px;color:#a78bfa">$1</code>').replace(/^### (.+)$/gm,'<h3 style="color:#a78bfa;font-size:15px;margin:18px 0 6px">$1</h3>').replace(/^## (.+)$/gm,'<h2 style="color:#818cf8;font-size:17px;margin:22px 0 8px">$1</h2>').replace(/^# (.+)$/gm,'<h1 style="color:#6366f1;font-size:20px;margin:22px 0 10px">$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e2e8f0">$1</strong>').replace(/\*(.+?)\*/g,'<em style="color:#94a3b8">$1</em>').replace(/^---$/gm,'<hr style="border:none;border-top:1px solid #252550;margin:14px 0"/>').replace(/^(\d+)\. (.+)$/gm,'<div style="padding:3px 0 3px 8px"><span style="color:#6366f1;font-weight:700;margin-right:6px">$1.</span>$2</div>').replace(/^[-•] (.+)$/gm,'<div style="padding:3px 0 3px 8px"><span style="color:#6366f1;margin-right:6px">●</span>$1</div>').replace(/^> (.+)$/gm,'<div style="border-left:3px solid #4f46e5;padding:6px 12px;margin:6px 0;background:rgba(79,70,229,0.06);border-radius:0 6px 6px 0;color:#a5b4fc">$1</div>').replace(/\n\n/g,'<div style="height:10px"></div>').replace(/\n/g,'<br/>');}

/* ══════════════════════════════════════
   메인 컴포넌트
   ══════════════════════════════════════ */
export default function Home(){
  const fileInputRef=useRef<HTMLInputElement>(null);
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState('overview');
  const [loading,setLoading]=useState(false);
  const [showKeys,setShowKeys]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [projectName,setProjectName]=useState('새 프로젝트');

  /* 다중 프로젝트 F01-F03 */
  const [projects,setProjects]=useState<{id:string;name:string;created:string}[]>([]);
  const [currentProjectId,setCurrentProjectId]=useState('');

  /* API 키 */
  const [geminiKey,setGeminiKey]=useState('');
  const [openaiKey,setOpenaiKey]=useState('');
  const [claudeKey,setClaudeKey]=useState('');
  const [youtubeKey,setYoutubeKey]=useState('');
  const [provider,setProvider]=useState('gemini');

  /* 기본 입력 */
  const [topic,setTopic]=useState('');
  const [platform,setPlatform]=useState('youtube');
  const [category,setCategory]=useState('교육/정보');
  const [duration,setDuration]=useState('8분');
  const [audience,setAudience]=useState('일반');
  const [videoUrl,setVideoUrl]=useState('');
  const [scriptText,setScriptText]=useState('');
  const [keywords,setKeywords]=useState('');
  const [chapterCount,setChapterCount]=useState(7);
  const [expandLength,setExpandLength]=useState('15000');

  /* 장르 + 설정 */
  const [genre,setGenre]=useState('');
  const [subGenre,setSubGenre]=useState('');
  const [toneId,setToneId]=useState('explanatory');
  const [speakerModeId,setSpeakerModeId]=useState('quad');
  const [narrationRatio,setNarrationRatio]=useState(60);
  const [dramaElements,setDramaElements]=useState<string[]>([]);
  const [humanTouchEls,setHumanTouchEls]=useState<string[]>(['experience','opinion']);
  const [humanTouchLevel,setHumanTouchLevel]=useState('medium');
  const [creativeMode,setCreativeMode]=useState('balanced');
  const [contentFormat,setContentFormat]=useState('longform');
  const [customDuration,setCustomDuration]=useState(false);
  const [outputLang,setOutputLang]=useState('ko');
  const [scriptInputMode,setScriptInputMode]=useState('ai');
  const [uploadedFileName,setUploadedFileName]=useState('');

  /* 이미지 스타일 2단계 F50-F53 */
  const [imgStyleMain,setImgStyleMain]=useState('realistic');
  const [imgStyleSub,setImgStyleSub]=useState('');
  const [imgRatio,setImgRatio]=useState('16:9');
  const [imgModel,setImgModel]=useState('standard');
  const [imgTextOverlay,setImgTextOverlay]=useState(false);
  const [scenesPerChapter,setScenesPerChapter]=useState(6);

  /* 제목/시놉시스 F20-F27 */
  const [suggestedTopics,setSuggestedTopics]=useState<string[]>([]);
  const [generatedTitles,setGeneratedTitles]=useState<any[]>([]);
  const [selectedTitle,setSelectedTitle]=useState('');
  const [titleStyle,setTitleStyle]=useState('default');
  const [generatedSynopses,setGeneratedSynopses]=useState<any[]>([]);
  const [selectedSynopsisIdx,setSelectedSynopsisIdx]=useState(-1);
  const [synopsisConfirmed,setSynopsisConfirmed]=useState(false);
  const [showSynopsisConfirm,setShowSynopsisConfirm]=useState(false);

  /* 캐릭터 F28-F30 */
  const [characters,setCharacters]=useState<any[]>([]);
  const [recommendedSpeakerCount,setRecommendedSpeakerCount]=useState(0);

  /* 결과 저장 (탭별) */
  const [results,setResults]=useState<Record<string,string>>({});
  const result=results[tab]||'';
  const setResult=(v:string)=>setResults(p=>({...p,[tab]:v}));

  /* 대본 확장 F35-F36 */
  const [expandedScript,setExpandedScript]=useState('');
  const [registeredScript,setRegisteredScript]=useState('');

  /* TTS F37-F47 */
  const [ttsEngine,setTtsEngine]=useState('gemini');
  const [ttsSplitMode,setTtsSplitMode]=useState('punctuation');
  const [ttsSegments,setTtsSegments]=useState<{speaker:string;text:string;status:string;engine:string}[]>([]);
  const [ttsSpeakerEngines,setTtsSpeakerEngines]=useState<Record<string,string>>({});
  const [ttsProgress,setTtsProgress]=useState(0);

  /* 타임라인 F61-F64 */
  const [timelineMode,setTimelineMode]=useState('dialogue');
  const [timelineData,setTimelineData]=useState<any[]>([]);

  /* 효과 F67-F71 */
  const [effectType,setEffectType]=useState('zoom');
  const [overlayType,setOverlayType]=useState('none');

  /* 자막 F72-F73 */
  const [subtitleTemplate,setSubtitleTemplate]=useState('default');
  const [subtitleFont,setSubtitleFont]=useState('Pretendard');
  const [subtitleSize,setSubtitleSize]=useState(18);

  /* 로고/워터마크 F74-F76 */
  const [logoUrl,setLogoUrl]=useState('');
  const [logoOpacity,setLogoOpacity]=useState(80);
  const [logoPosition,setLogoPosition]=useState('top-right');
  const [showSafeArea,setShowSafeArea]=useState(false);
  const [titleWatermark,setTitleWatermark]=useState('');

  /* 영상 생성 F78-F82 */
  const [videoOrientation,setVideoOrientation]=useState('landscape');
  const [videoQuality,setVideoQuality]=useState('1080p');
  const [videoSubtitle,setVideoSubtitle]=useState(true);
  const [previewDuration,setPreviewDuration]=useState(10);

  /* 유튜브 업로드 F92-F98 */
  const [ytTitle,setYtTitle]=useState('');
  const [ytDesc,setYtDesc]=useState('');
  const [ytTags,setYtTags]=useState('');
  const [ytPrivacy,setYtPrivacy]=useState('private');
  const [ytSchedule,setYtSchedule]=useState('');
  const [ytThumbnailMode,setYtThumbnailMode]=useState('ai');
  const [ytThumbnailUrl,setYtThumbnailUrl]=useState('');

  /* 미디어 라이브러리 F100 */
  const [mediaLibrary,setMediaLibrary]=useState<{type:string;name:string;size:string;date:string}[]>([]);

  /* 모드 */
  const [editMode,setEditMode]=useState('polish');
  const [communityType,setCommunityType]=useState('announcement');
  const [seriesCount,setSeriesCount]=useState(5);
  const [calendarWeeks,setCalendarWeeks]=useState(4);

  /* ── 초기 로드 ── */
  useEffect(()=>{
    if(localStorage.getItem('ai-factory-auth')==='true')setAuthed(true);
    const k=localStorage.getItem('ai-factory-keys');
    if(k){const d=JSON.parse(k);setGeminiKey(d.gemini||'');setOpenaiKey(d.openai||'');setClaudeKey(d.claude||'');setYoutubeKey(d.youtube||'');}
    const p=localStorage.getItem('ai-factory-project');if(p)setProjectName(p);
    const g=localStorage.getItem('ai-factory-genre');
    if(g){const d=JSON.parse(g);setGenre(d.genre||'');setSubGenre(d.sub||'');}
    const s=localStorage.getItem('ai-factory-settings');
    if(s){const d=JSON.parse(s);setToneId(d.toneId||'explanatory');setSpeakerModeId(d.speakerModeId||'quad');setNarrationRatio(d.narrationRatio||60);setDramaElements(d.dramaElements||[]);setHumanTouchEls(d.humanTouchEls||['experience','opinion']);setHumanTouchLevel(d.humanTouchLevel||'medium');setCreativeMode(d.creativeMode||'balanced');setContentFormat(d.contentFormat||'longform');setOutputLang(d.outputLang||'ko');}
    const pj=localStorage.getItem('ai-factory-projects');
    if(pj)setProjects(JSON.parse(pj));
    const cp=localStorage.getItem('ai-factory-current-project');
    if(cp)setCurrentProjectId(cp);
  },[]);

  /* ── 설정 자동 저장 ── */
  const saveSettings=useCallback(()=>{
    localStorage.setItem('ai-factory-settings',JSON.stringify({toneId,speakerModeId,narrationRatio,dramaElements,humanTouchEls,humanTouchLevel,creativeMode,contentFormat,outputLang}));
  },[toneId,speakerModeId,narrationRatio,dramaElements,humanTouchEls,humanTouchLevel,creativeMode,contentFormat,outputLang]);
  useEffect(()=>{saveSettings();},[saveSettings]);

  const applyGenreSettings=useCallback((gk:string,sk:string)=>{
    const cat=GENRE_MAP[gk];if(!cat)return;const sub=cat.subs[sk];if(!sub)return;
    setGenre(gk);setSubGenre(sk);setDuration(sub.duration);
    setChapterCount(sub.chapters);setNarrationRatio(sub.narrationRatio);
    localStorage.setItem('ai-factory-genre',JSON.stringify({genre:gk,sub:sk}));
  },[]);

  if(!authed)return <LoginScreen onLogin={()=>setAuthed(true)}/>;

  /* ── 유틸 ── */
  const saveKeys=()=>{localStorage.setItem('ai-factory-keys',JSON.stringify({gemini:geminiKey,openai:openaiKey,claude:claudeKey,youtube:youtubeKey}));alert('저장됨!');setShowKeys(false);};
  const getKey=()=>provider==='gemini'?geminiKey:provider==='openai'?openaiKey:claudeKey;
  const logout=()=>{localStorage.removeItem('ai-factory-auth');setAuthed(false);};

  const callApi=async(endpoint:string,body:any)=>{
    setLoading(true);
    try{
      const res=await fetch('/api/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,aiProvider:provider,apiKey:getKey()})});
      const data=await res.json();
      if(data.error)return '❌ '+data.error;
      return data.result||data.text||data.content||JSON.stringify(data,null,2);
    }catch(e:any){return '❌ '+e.message;}
    finally{setLoading(false);}
  };

  /* ── 프롬프트 빌더 ── */
  const buildScriptPrompt=()=>{
    const gi=genre&&subGenre&&GENRE_MAP[genre]?.subs[subGenre];
    const tone=TONE_OPTIONS.find(t=>t.id===toneId)?.label||'설명체';
    const sm=SPEAKER_MODES.find(m=>m.id===speakerModeId);
    const htNames=humanTouchEls.map(id=>HUMAN_TOUCH_ELEMENTS.find(h=>h.id===id)?.label).filter(Boolean);
    const htLvl=HUMAN_TOUCH_LEVELS.find(l=>l.id===humanTouchLevel);
    const deNames=dramaElements.map(id=>DRAMA_ELEMENTS.find(d=>d.id===id)?.label).filter(Boolean);
    const cmLabel=CREATIVE_MODES.find(c=>c.id===creativeMode)?.label||'균형';
    const lang=OUTPUT_LANGUAGES.find(l=>l.id===outputLang)?.label||'한국어';
    let p=`당신은 유튜브 전문 대본 작가입니다.\n\n`;
    if(gi)p+=`[장르] ${GENRE_MAP[genre].label} > ${gi.label}\n`;
    p+=`[주제] ${topic}\n[제목] ${selectedTitle||'(자동 생성)'}\n`;
    p+=`[톤/문체] ${tone}\n[화자 구성] ${sm?sm.label:'나레이션+등장인물'}\n`;
    p+=`[나레이션:대사 비율] 나레이션 ${narrationRatio}% / 대사 ${100-narrationRatio}%\n`;
    p+=`[챕터 수] ${chapterCount}개\n[영상 길이] ${duration}\n[플랫폼] ${platform}\n[타깃] ${audience}\n[출력 언어] ${lang}\n`;
    if(contentFormat==='shorts')p+=`[형식] 쇼츠 (1분 이내)\n`;
    if(deNames.length>0)p+=`[드라마 요소] ${deNames.join(', ')}\n`;
    if(htNames.length>0&&humanTouchLevel!=='none')p+=`[휴먼 터치] ${htNames.join(', ')} (강도: ${htLvl?.label})\n`;
    p+=`[창작 모드] ${cmLabel}\n`;
    if(gi){p+=`[대본 구조] ${gi.structure.join(' → ')}\n[BGM 무드] ${gi.bgm}\n[이미지 스타일] ${gi.imageStyle}\n[훅 예시] ${gi.hookExample}\n`;}
    p+=`\n각 챕터별로 명확히 구분하여 대본을 작성하세요. 화자별 대사는 [나레이션], [캐릭터명] 태그로 구분하세요.\n`;
    return p;
  };

  /* ── 핸들러들 ── */

  /* F20 주제 추천 */
  const handleSuggestTopics=async()=>{
    const r=await callApi('suggest-topics',{genre,subGenre,platform});
    let clean=r.replace(/```json/gi,'').replace(/```/g,'').trim();
    /* JSON 배열 추출 */
    const bs=clean.indexOf('[');const be=clean.lastIndexOf(']');
    if(bs!==-1&&be>bs){
      try{
        const arr=JSON.parse(clean.substring(bs,be+1));
        if(Array.isArray(arr)){
          const cleaned=arr.map((t:any)=>{
            const s=typeof t==='string'?t:(t.title||t.topic||JSON.stringify(t));
            return s.replace(/^["""']/,'').replace(/["""',;.\s]+$/,'').trim();
          }).filter((s:string)=>s.length>2);
          setSuggestedTopics(cleaned);return;
        }
      }catch{}
    }
    const lines=clean.split('\n').map((l:string)=>l.replace(/^\d+[\.\)]\s*/,'').replace(/^["""'-]+/,'').replace(/["""',;]+$/,'').trim()).filter((l:string)=>l.length>3&&!l.startsWith('```'));
    setSuggestedTopics(lines.slice(0,10));
  };

  /* F21-F24 제목 생성 */
  const handleGenerateTitles=async()=>{
    const r=await callApi('generate-titles',{topic,genre,subGenre,tone:toneId,platform,style:titleStyle});
    let clean=r.replace(/```json/gi,'').replace(/```/g,'').trim();
    const bs=clean.indexOf('[');const be=clean.lastIndexOf(']');
    if(bs!==-1&&be>bs){
      try{
        const arr=JSON.parse(clean.substring(bs,be+1));
        if(Array.isArray(arr)){
          const cleaned=arr.map((t:any)=>{
            if(typeof t==='string')return t.replace(/^["""']+/,'').replace(/["""',;]+$/,'').trim();
            return{...t,title:(t.title||'').replace(/^["""']+/,'').replace(/["""',;]+$/,'').trim()};
          }).filter((t:any)=>(typeof t==='string'?t:t.title||'').length>2);
          setGeneratedTitles(cleaned);return;
        }
      }catch{}
    }
    const lines=clean.split('\n').map((l:string)=>l.replace(/^\d+[\.\)]\s*/,'').replace(/^["""']+/,'').replace(/["""',;]+$/,'').trim()).filter((l:string)=>l.length>3&&!l.startsWith('```'));
    setGeneratedTitles(lines.slice(0,10));
  };

  /* F25-F27 시놉시스 5개 */
  const handleGenerateSynopses=async()=>{
    const prompt=`주제: ${selectedTitle||topic}\n장르: ${GENRE_MAP[genre]?.label||'일반'} > ${GENRE_MAP[genre]?.subs[subGenre]?.label||''}\n\n위 주제로 서로 다른 스타일의 시놉시스 5개를 만들어주세요.\n\n반드시 아래 JSON 배열 형식으로만 응답하세요. 마크다운 코드블록 없이, 순수 JSON만 출력:\n[{"style":"스타일이름","content":"시놉시스 내용"},{"style":"스타일이름","content":"시놉시스 내용"},{"style":"스타일이름","content":"시놉시스 내용"},{"style":"스타일이름","content":"시놉시스 내용"},{"style":"스타일이름","content":"시놉시스 내용"}]\n\n챕터 수: ${chapterCount}개 기준\n각 content는 최소 300자 이상 상세하게 작성하세요.`;
    const r=await callApi('generate-synopsis',{topic:selectedTitle||topic,genre:GENRE_MAP[genre]?.label,chapterCount,customPrompt:prompt});
    /* 강력 파싱 */
    let clean=r.replace(/```json/gi,'').replace(/```/g,'').trim();
    /* 방법1: 전체 JSON 배열 추출 */
    const bracketStart=clean.indexOf('[');
    const bracketEnd=clean.lastIndexOf(']');
    if(bracketStart!==-1&&bracketEnd>bracketStart){
      const jsonStr=clean.substring(bracketStart,bracketEnd+1);
      try{
        const arr=JSON.parse(jsonStr);
        if(Array.isArray(arr)&&arr.length>0){
          const valid=arr.map((item:any)=>{
            if(typeof item==='string')return{style:'',content:item};
            return{style:item.style||'',content:item.content||JSON.stringify(item)};
          });
          setGeneratedSynopses(valid);return;
        }
      }catch{}
    }
    /* 방법2: 개별 {style,content} 객체 추출 */
    const objs:any[]=[];
    const regex=/\{\s*"style"\s*:\s*"([^"]*)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
    let m;while((m=regex.exec(clean))!==null){
      objs.push({style:m[1],content:m[2].replace(/\\n/g,'\n').replace(/\\"/g,'"')});
    }
    if(objs.length>1){setGeneratedSynopses(objs);return;}
    /* 방법3: 번호 구분으로 분리 */
    const parts=clean.split(/\n(?=\d+[\.\)]\s|\*\*\d+|시놉시스\s*#?\s*\d|#{1,3}\s*\d)/i).filter((s:string)=>s.trim().length>30);
    if(parts.length>=3){
      setGeneratedSynopses(parts.map((p:string,idx:number)=>{
        const titleMatch=p.match(/^[#\d\.\)\*\s]*(.*?)[\n:]/);
        return{style:titleMatch?titleMatch[1].trim():`스타일 ${idx+1}`,content:p.replace(/^[^\n]*\n/,'').trim()||p.trim()};
      }));return;
    }
    setGeneratedSynopses([{style:'기본',content:r}]);
  };

  /* F28-F30 캐릭터 재분석 */
  const handleCharacterAnalysis=async()=>{
    const synopsis=generatedSynopses[selectedSynopsisIdx]?.content||results['synopsis']||'';
    const prompt=`다음 시놉시스를 분석하여 등장인물을 추출하고, 권장 화자 수를 제안해주세요.\n\n${synopsis}\n\nJSON 형식: {recommendedCount: 숫자, characters: [{name, role, personality, voiceType}]}`;
    const r=await callApi('analyze-characters',{script:synopsis,customPrompt:prompt});
    try{const d=JSON.parse(r);if(d.characters){setCharacters(d.characters);setRecommendedSpeakerCount(d.recommendedCount||d.characters.length);return;}}catch{}
    setResult(r);
  };

  /* F33 대본 생성 */
  const handleScript=async()=>{
    const customPrompt=buildScriptPrompt();
    const r=await callApi('generate-script',{topic:selectedTitle||topic,platform,category,duration,audience,customPrompt});
    setResults(p=>({...p,'script-gen':r}));
    setRegisteredScript(r);
  };

  /* F35-F36 대본 확장 */
  const handleExpand=async()=>{
    const script=registeredScript||results['script-gen']||'';
    const r=await callApi('expand-script',{script,targetLength:expandLength,customPrompt:`이 대본을 ${expandLength}자 이상으로 확장하세요. 각 챕터의 디테일을 풍부하게 만들어주세요.`});
    setExpandedScript(r);
    setResults(p=>({...p,'script-expand':r}));
  };

  const registerExpandedScript=()=>{
    if(expandedScript){setRegisteredScript(expandedScript);alert('대본이 등록되었습니다!');}
  };

  /* F37 대사 자동 분리 */
  const parseSpeakers=(script:string)=>{
    const lines=script.split('\n').filter(l=>l.trim());
    const segments:typeof ttsSegments=[];
    lines.forEach(line=>{
      const match=line.match(/^\[(.+?)\]\s*(.+)/);
      if(match){segments.push({speaker:match[1],text:match[2],status:'pending',engine:ttsSpeakerEngines[match[1]]||ttsEngine});}
      else if(line.trim()){segments.push({speaker:'나레이션',text:line.trim(),status:'pending',engine:ttsSpeakerEngines['나레이션']||ttsEngine});}
    });
    return segments;
  };

  const handleTtsSplit=()=>{
    const script=registeredScript||results['script-gen']||'';
    if(ttsSplitMode==='speaker'){setTtsSegments(parseSpeakers(script));}
    else{
      const delim=ttsSplitMode==='punctuation'?/[.!?。！？]\s*/:/(.{500})/;
      const parts=script.split(delim).filter(p=>p.trim());
      setTtsSegments(parts.map(p=>({speaker:'나레이션',text:p.trim(),status:'pending',engine:ttsEngine})));
    }
  };

  /* F42 TTS 전체 생성 (시뮬레이션) */
  const handleTtsGenerateAll=async()=>{
    setLoading(true);setTtsProgress(0);
    const total=ttsSegments.length;
    for(let i=0;i<total;i++){
      setTtsSegments(prev=>{const n=[...prev];n[i]={...n[i],status:'done'};return n;});
      setTtsProgress(Math.round(((i+1)/total)*100));
      await new Promise(r=>setTimeout(r,200));
    }
    setLoading(false);
  };

  /* 일반 API 호출 핸들러들 */
  const handleGeneric=async(endpoint:string,body:any,targetTab?:string)=>{
    const r=await callApi(endpoint,body);
    setResults(p=>({...p,[targetTab||tab]:r}));
  };

  /* F06 파일 업로드 */
  const handleFileUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    setUploadedFileName(file.name);
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const text=ev.target?.result as string;
      setScriptText(text);setScriptInputMode('file');
    };
    reader.readAsText(file);
  };

  /* F01 프로젝트 관리 */
  const createProject=(name:string)=>{
    const id=Date.now().toString();
    const np={id,name,created:new Date().toLocaleDateString()};
    const updated=[...projects,np];
    setProjects(updated);setCurrentProjectId(id);setProjectName(name);
    localStorage.setItem('ai-factory-projects',JSON.stringify(updated));
    localStorage.setItem('ai-factory-current-project',id);
  };

  const switchProject=(id:string)=>{
    const p=projects.find(p=>p.id===id);
    if(p){setCurrentProjectId(id);setProjectName(p.name);localStorage.setItem('ai-factory-current-project',id);}
  };


  /* ══════════════════════════════════════
     렌더 헬퍼: 장르 선택 카드 UI
     ══════════════════════════════════════ */
  const renderGenreSelector=()=>(
    <div style={{marginBottom:32}}>
      <h3 style={{color:'#e2e8f0',fontSize:18,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
        🎭 장르 선택
        {genre&&subGenre&&<span style={{fontSize:12,padding:'4px 12px',borderRadius:12,background:GENRE_MAP[genre]?.gradient||'#4a5568',color:'#fff'}}>
          {GENRE_MAP[genre]?.label} → {GENRE_MAP[genre]?.subs[subGenre]?.label}
        </span>}
      </h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        {GENRE_KEYS.map(gk=>{const g=GENRE_MAP[gk];const sel=genre===gk;return(
          <div key={gk} onClick={()=>{setGenre(sel?'':gk);setSubGenre('');}}
            style={{padding:16,borderRadius:12,cursor:'pointer',textAlign:'center',
              background:sel?g.gradient:'rgba(255,255,255,0.05)',
              border:sel?'2px solid rgba(255,255,255,0.3)':'2px solid transparent',
              transform:sel?'scale(1.03)':'scale(1)',transition:'all 0.2s',
              boxShadow:sel?'0 8px 24px rgba(0,0,0,0.3)':'none'}}>
            <div style={{fontSize:28,marginBottom:6}}>{g.icon}</div>
            <div style={{fontSize:13,fontWeight:600,color:sel?'#fff':'#cbd5e0'}}>{g.label}</div>
            <div style={{fontSize:10,color:sel?'rgba(255,255,255,0.8)':'#718096',marginTop:4}}>
              {Object.keys(g.subs).length}개 서브장르
            </div>
          </div>
        );})}
      </div>
      {genre&&GENRE_MAP[genre]&&(
        <div style={{marginBottom:20}}>
          <h4 style={{color:'#a0aec0',fontSize:14,marginBottom:12}}>{GENRE_MAP[genre].icon} {GENRE_MAP[genre].label} 서브장르</h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {Object.entries(GENRE_MAP[genre].subs).map(([sk,sv]:[string,any])=>{const ssel=subGenre===sk;return(
              <div key={sk} onClick={()=>{setSubGenre(sk);applyGenreSettings(genre,sk);}}
                style={{padding:14,borderRadius:10,cursor:'pointer',
                  background:ssel?GENRE_MAP[genre].gradient:'rgba(255,255,255,0.04)',
                  border:ssel?'2px solid rgba(255,255,255,0.3)':'1px solid rgba(255,255,255,0.08)',
                  transition:'all 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <span style={{fontSize:20}}>{sv.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,color:ssel?'#fff':'#e2e8f0'}}>{sv.label}</span>
                </div>
                <div style={{fontSize:10,color:ssel?'rgba(255,255,255,0.85)':'#718096',lineHeight:1.5}}>
                  <div>🎵 {sv.bgm} · 🖼 {sv.imageStyle}</div>
                  <div>🗣 {sv.speaker} · ⏱ {sv.duration}</div>
                  <div style={{marginTop:4,fontStyle:'italic'}}>"{sv.hookExample}"</div>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
      {genre&&subGenre&&GENRE_MAP[genre]?.subs[subGenre]&&(()=>{const sv=GENRE_MAP[genre].subs[subGenre];return(
        <div style={{padding:20,borderRadius:12,background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',border:'1px solid rgba(99,102,241,0.3)'}}>
          <h4 style={{color:'#a78bfa',fontSize:14,marginBottom:12}}>📋 선택 장르 프리뷰</h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,fontSize:12,color:'#cbd5e0'}}>
            <div><span style={{color:'#718096'}}>톤:</span> {sv.tone}</div>
            <div><span style={{color:'#718096'}}>화자:</span> {sv.speaker}</div>
            <div><span style={{color:'#718096'}}>길이:</span> {sv.duration} · {sv.chapters}챕터</div>
            <div><span style={{color:'#718096'}}>BGM:</span> {sv.bgm}</div>
            <div><span style={{color:'#718096'}}>이미지:</span> {sv.imageStyle}</div>
            <div><span style={{color:'#718096'}}>나레이션:</span> {sv.narrationRatio}%</div>
          </div>
          <div style={{marginTop:12,fontSize:11,color:'#a0aec0'}}>
            <span style={{color:'#718096'}}>구조:</span> {sv.structure?.join(' → ')}
          </div>
        </div>);})()}
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 상세 설정 패널
     ══════════════════════════════════════ */
  const renderSettingsPanel=()=>(
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginBottom:24}}>
      {/* 톤 선택 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>🎨 톤/스타일</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {TONE_OPTIONS.map(t=>(
            <button key={t.id} onClick={()=>setToneId(t.id)} style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
              background:toneId===t.id?'#6366f1':'rgba(255,255,255,0.08)',color:toneId===t.id?'#fff':'#cbd5e0'}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* 화자 모드 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>🗣 화자 모드</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {SPEAKER_MODES.map(s=>(
            <button key={s.id} onClick={()=>setSpeakerModeId(s.id)} style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
              background:speakerModeId===s.id?'#6366f1':'rgba(255,255,255,0.08)',color:speakerModeId===s.id?'#fff':'#cbd5e0'}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>
      {/* 나레이션 비율 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>📊 나레이션 비율</h4>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:11,color:'#718096'}}>대화</span>
          <input type="range" min={10} max={90} step={10} value={narrationRatio}
            onChange={e=>setNarrationRatio(Number(e.target.value))} style={{flex:1,accentColor:'#6366f1'}}/>
          <span style={{fontSize:11,color:'#718096'}}>나레이션</span>
          <span style={{fontSize:13,fontWeight:700,color:'#a78bfa',minWidth:40,textAlign:'center'}}>{narrationRatio}%</span>
        </div>
      </div>
      {/* 창작 모드 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>⚡ 창작 모드</h4>
        <div style={{display:'flex',gap:6}}>
          {CREATIVE_MODES.map(c=>(
            <button key={c.id} onClick={()=>setCreativeMode(c.id)} style={{padding:'8px 14px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',flex:1,textAlign:'center',
              background:creativeMode===c.id?'#6366f1':'rgba(255,255,255,0.08)',color:creativeMode===c.id?'#fff':'#cbd5e0'}}>
              {c.icon} {c.label}<div style={{fontSize:9,marginTop:2,opacity:0.7}}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>
      {/* 드라마 요소 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>🎭 드라마 요소</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {DRAMA_ELEMENTS.map(d=>{const on=dramaElements.includes(d.id);return(
            <button key={d.id} onClick={()=>setDramaElements(prev=>on?prev.filter(x=>x!==d.id):[...prev,d.id])}
              style={{padding:'6px 10px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                background:on?'#6366f1':'rgba(255,255,255,0.08)',color:on?'#fff':'#cbd5e0'}}>
              {d.icon} {d.label}
            </button>);})}
        </div>
      </div>
      {/* 휴먼터치 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>💡 휴먼터치</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
          {HUMAN_TOUCH_ELEMENTS.map(h=>{const on=humanTouchEls.includes(h.id);return(
            <button key={h.id} onClick={()=>setHumanTouchEls(prev=>on?prev.filter(x=>x!==h.id):[...prev,h.id])}
              style={{padding:'6px 10px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                background:on?'#10b981':'rgba(255,255,255,0.08)',color:on?'#fff':'#cbd5e0'}}>
              {h.icon} {h.label}
            </button>);})}
        </div>
        <div style={{display:'flex',gap:4}}>
          {HUMAN_TOUCH_LEVELS.map(lv=>(
            <button key={lv.id} onClick={()=>setHumanTouchLevel(lv.id)}
              style={{padding:'4px 10px',borderRadius:6,fontSize:10,border:'none',cursor:'pointer',flex:1,
                background:humanTouchLevel===lv.id?'#10b981':'rgba(255,255,255,0.06)',color:humanTouchLevel===lv.id?'#fff':'#718096'}}>
              {lv.label} {lv.percent}
            </button>
          ))}
        </div>
      </div>
      {/* 출력 설정 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>📐 출력 설정</h4>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          {CONTENT_FORMATS.map(f=>(
            <button key={f.id} onClick={()=>setContentFormat(f.id)} style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
              background:contentFormat===f.id?'#6366f1':'rgba(255,255,255,0.08)',color:contentFormat===f.id?'#fff':'#cbd5e0'}}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <select value={outputLang} onChange={e=>setOutputLang(e.target.value)}
          style={{width:'100%',padding:8,borderRadius:8,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
          {OUTPUT_LANGUAGES.map(l=><option key={l.id} value={l.id}>{l.icon} {l.label}</option>)}
        </select>
      </div>
      {/* 입력 방식 F04-F06 */}
      <div style={{padding:16,borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>📝 대본 입력 방식</h4>
        <div style={{display:'flex',gap:6,marginBottom:10}}>
          {[{id:'ai',icon:'🤖',label:'AI 생성'},{id:'manual',icon:'✍️',label:'직접 입력'},{id:'file',icon:'📁',label:'파일 업로드'}].map(m=>(
            <button key={m.id} onClick={()=>setScriptInputMode(m.id)} style={{padding:'8px 14px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',flex:1,
              background:scriptInputMode===m.id?'#6366f1':'rgba(255,255,255,0.08)',color:scriptInputMode===m.id?'#fff':'#cbd5e0'}}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        {scriptInputMode==='manual'&&(
          <textarea value={scriptText} onChange={e=>setScriptText(e.target.value)} placeholder="대본을 직접 입력하세요..."
            style={{width:'100%',minHeight:100,padding:10,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical'}}/>
        )}
        {scriptInputMode==='file'&&(
          <div style={{textAlign:'center',padding:20,borderRadius:8,border:'2px dashed rgba(255,255,255,0.15)',cursor:'pointer'}}
            onClick={()=>fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept=".txt,.srt,.docx" style={{display:'none'}} onChange={handleFileUpload}/>
            <div style={{fontSize:24,marginBottom:8}}>📂</div>
            <div style={{fontSize:12,color:'#a0aec0'}}>{uploadedFileName||'TXT, SRT, DOCX 파일을 선택하세요'}</div>
          </div>
        )}
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 주제 추천 UI
     ══════════════════════════════════════ */
  const renderTopicSuggester=()=>(
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="주제를 입력하세요 (비워두면 AI가 추천)"
          style={{flex:1,padding:'10px 14px',borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
        <button onClick={handleSuggestTopics} disabled={loading}
          style={{padding:'10px 16px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',whiteSpace:'nowrap'}}>
          💡 주제 추천
        </button>
      </div>
      {suggestedTopics.length>0&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {suggestedTopics.map((st,i)=>(
            <button key={i} onClick={()=>setTopic(st)} style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
              background:topic===st?'#f59e0b':'rgba(255,255,255,0.06)',color:topic===st?'#000':'#cbd5e0'}}>{st}</button>
          ))}
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 제목 생성 UI (10개)
     ══════════════════════════════════════ */
  const renderTitleGenerator=()=>(
    <div style={{marginBottom:24,padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h4 style={{color:'#e2e8f0',fontSize:15,margin:0}}>🏷️ AI 제목 생성 (최대 10개)</h4>
        <div style={{display:'flex',gap:6}}>
          <select value={titleStyle} onChange={e=>setTitleStyle(e.target.value)}
            style={{padding:'6px 10px',borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.08)',color:'#cbd5e0',border:'1px solid rgba(255,255,255,0.1)'}}>
            <option value="default">기본</option><option value="provocative">자극적</option>
            <option value="curiosity">호기심</option><option value="emotional">감성적</option>
          </select>
          <button onClick={handleGenerateTitles} disabled={loading}
            style={{padding:'8px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
            {loading?'생성 중...':'✨ 제목 생성'}
          </button>
        </div>
      </div>
      {generatedTitles.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {generatedTitles.map((t:any,i:number)=>{const title=typeof t==='string'?t:t.title||t;return(
            <div key={i} onClick={()=>{setSelectedTitle(title);setTopic(title);}}
              style={{padding:12,borderRadius:8,cursor:'pointer',
                background:selectedTitle===title?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
                border:selectedTitle===title?'2px solid #6366f1':'1px solid rgba(255,255,255,0.08)',transition:'all 0.15s'}}>
              <div style={{fontSize:13,color:'#e2e8f0',fontWeight:500}}>{title}</div>
              {typeof t==='object'&&t.hookType&&<div style={{fontSize:10,color:'#718096',marginTop:4}}>🎣 {t.hookType}</div>}
            </div>);})}
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 시놉시스 5개 UI
     ══════════════════════════════════════ */
  const renderSynopsisGenerator=()=>(
    <div style={{marginBottom:24,padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h4 style={{color:'#e2e8f0',fontSize:15,margin:0}}>📖 시놉시스 생성 (5개)</h4>
        <button onClick={handleGenerateSynopses} disabled={loading}
          style={{padding:'8px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
          {loading?'생성 중...':'📝 시놉시스 생성'}
        </button>
      </div>
      {generatedSynopses.length>0&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {generatedSynopses.map((s:any,i:number)=>{const content=typeof s==='string'?s:s.content||JSON.stringify(s);const styleLabel=typeof s==='object'&&s.style?s.style:'';const sel=selectedSynopsisIdx===i;return(
            <div key={i} onClick={()=>{setSelectedSynopsisIdx(i);setShowSynopsisConfirm(true);}}
              style={{padding:18,borderRadius:12,cursor:'pointer',
                background:sel?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.03)',
                border:sel?'2px solid #10b981':'1px solid rgba(255,255,255,0.1)',transition:'all 0.2s',
                boxShadow:sel?'0 0 20px rgba(16,185,129,0.1)':'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:18}}>{['📕','📗','📘','📙','📓'][i]||'📖'}</span>
                  <span style={{fontSize:14,fontWeight:700,color:sel?'#10b981':'#e2e8f0'}}>
                    시놉시스 #{i+1}
                  </span>
                  {styleLabel&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:sel?'rgba(16,185,129,0.2)':'rgba(139,92,246,0.15)',color:sel?'#34d399':'#a78bfa',fontWeight:500}}>{styleLabel}</span>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:11,color:'#718096'}}>{content.length.toLocaleString()}자</span>
                  {sel&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(16,185,129,0.2)',color:'#10b981',fontWeight:600}}>✓ 선택됨</span>}
                </div>
              </div>
              <div style={{fontSize:13,color:sel?'#d1d5db':'#a0aec0',lineHeight:1.8,maxHeight:sel?'none':'80px',overflow:'hidden',
                whiteSpace:'pre-wrap',wordBreak:'keep-all'}}>{content}</div>
              {!sel&&content.length>200&&<div style={{fontSize:11,color:'#4a5568',marginTop:6,textAlign:'center'}}>▼ 클릭하여 전체 보기</div>}
            </div>);})}
        </div>
      )}
      {/* 시놉시스 확정 모달 F27 */}
      {showSynopsisConfirm&&selectedSynopsisIdx>=0&&(
        <div style={{marginTop:16,padding:16,borderRadius:10,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)'}}>
          <p style={{color:'#10b981',fontSize:13,marginBottom:12}}>이 줄거리로 진행하시겠습니까?</p>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{setSynopsisConfirmed(true);setShowSynopsisConfirm(false);
              const content=typeof generatedSynopses[selectedSynopsisIdx]==='string'?generatedSynopses[selectedSynopsisIdx]:generatedSynopses[selectedSynopsisIdx].content;
              setResults(p=>({...p,synopsis:content}));handleCharacterAnalysis();}}
              style={{flex:1,padding:10,borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'#10b981',color:'#fff'}}>
              ✅ 줄거리 확정 + 캐릭터 분석
            </button>
            <button onClick={()=>setShowSynopsisConfirm(false)}
              style={{padding:'10px 20px',borderRadius:8,fontSize:13,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#cbd5e0'}}>
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 캐릭터 카드 UI F30
     ══════════════════════════════════════ */
  const renderCharacterCards=()=>(
    <div style={{marginBottom:24}}>
      {recommendedSpeakerCount>0&&(
        <div style={{padding:12,borderRadius:8,marginBottom:12,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,color:'#f59e0b'}}>AI 권장 화자 수: {recommendedSpeakerCount}명 (나레이션 포함)</span>
          <button onClick={()=>{const mode=SPEAKER_MODES.find(m=>m.total===recommendedSpeakerCount);if(mode)setSpeakerModeId(mode.id);}}
            style={{padding:'4px 12px',borderRadius:6,fontSize:11,border:'none',cursor:'pointer',background:'#f59e0b',color:'#000',fontWeight:600}}>
            권장으로 변경
          </button>
        </div>
      )}
      {characters.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {characters.map((c:any,i:number)=>(
            <div key={i} style={{padding:16,borderRadius:10,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.3)'}}>
              <div style={{fontSize:16,marginBottom:4}}>👤</div>
              <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:4}}>{c.name}</div>
              <div style={{fontSize:11,color:'#a78bfa',marginBottom:4}}>{c.role}</div>
              <div style={{fontSize:11,color:'#a0aec0'}}>{c.personality}</div>
              {c.voiceType&&<div style={{fontSize:10,color:'#718096',marginTop:4}}>🔊 {c.voiceType}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 이미지 스타일 2단계 F50
     ══════════════════════════════════════ */
  const renderImageStyleSelector=()=>(
    <div style={{marginBottom:20}}>
      <h4 style={{color:'#a0aec0',fontSize:13,marginBottom:10}}>🖼️ 이미지 스타일</h4>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        {Object.entries(IMAGE_STYLE_MAP).map(([k,v]:[string,any])=>(
          <button key={k} onClick={()=>{setImgStyleMain(k);setImgStyleSub('');}}
            style={{padding:'10px 14px',borderRadius:8,fontSize:12,border:'none',cursor:'pointer',flex:1,textAlign:'center',
              background:imgStyleMain===k?'#6366f1':'rgba(255,255,255,0.06)',color:imgStyleMain===k?'#fff':'#cbd5e0'}}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>
      {imgStyleMain&&IMAGE_STYLE_MAP[imgStyleMain]&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {IMAGE_STYLE_MAP[imgStyleMain].subs.map((s:string)=>(
            <button key={s} onClick={()=>setImgStyleSub(s)}
              style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                background:imgStyleSub===s?'#8b5cf6':'rgba(255,255,255,0.06)',color:imgStyleSub===s?'#fff':'#cbd5e0'}}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <select value={imgRatio} onChange={e=>setImgRatio(e.target.value)}
          style={{padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
          <option value="16:9">16:9 가로</option><option value="9:16">9:16 세로</option><option value="1:1">1:1 정사각</option>
        </select>
        <select value={imgModel} onChange={e=>setImgModel(e.target.value)}
          style={{padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
          <option value="standard">일반</option><option value="pro">프로 (고품질)</option>
        </select>
        <label style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#a0aec0',cursor:'pointer'}}>
          <input type="checkbox" checked={imgTextOverlay} onChange={e=>setImgTextOverlay(e.target.checked)} style={{accentColor:'#6366f1'}}/>
          텍스트 포함
        </label>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     렌더 헬퍼: 결과 표시 공통
     ══════════════════════════════════════ */
  const renderResult=(key:string,color?:string)=>{
    const r=results[key];if(!r)return null;
    return(
      <div style={{padding:16,borderRadius:10,background:'rgba(0,0,0,0.3)',border:`1px solid ${color||'rgba(99,102,241,0.3)'}`,marginTop:16}}>
        <div dangerouslySetInnerHTML={{__html:renderMarkdown(r)}}/>
      </div>
    );
  };


  /* ══════════════════════════════════════
     메인 렌더
     ══════════════════════════════════════ */
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>

      {/* ── 사이드바 ── */}
      <div style={{width:sidebarOpen?240:60,background:'rgba(0,0,0,0.3)',borderRight:'1px solid rgba(255,255,255,0.06)',transition:'width 0.3s',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:16,borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>setSidebarOpen(!sidebarOpen)}>
          <span style={{fontSize:24}}>🎬</span>
          {sidebarOpen&&<span style={{fontSize:14,fontWeight:700,color:'#e2e8f0'}}>AI Content Factory</span>}
        </div>
        {sidebarOpen&&(
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <input value={projectName} onChange={e=>{setProjectName(e.target.value);localStorage.setItem('ai-factory-project',e.target.value);}}
              placeholder="프로젝트명" style={{width:'100%',padding:8,borderRadius:6,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
          </div>
        )}
        <div style={{flex:1,overflowY:'auto',padding:8}}>
          {Object.entries(WORKFLOW).map(([gk,group])=>(
            <div key={gk} style={{marginBottom:12}}>
              {sidebarOpen&&<div style={{fontSize:10,color:'#4a5568',textTransform:'uppercase',padding:'4px 8px',fontWeight:700,letterSpacing:1}}>{group.label}</div>}
              {group.tabs.map(t=>(
                <div key={t.id} onClick={()=>setTab(t.id)}
                  style={{display:'flex',alignItems:'center',gap:8,padding:sidebarOpen?'8px 12px':'8px',borderRadius:8,cursor:'pointer',marginBottom:2,
                    background:tab===t.id?'rgba(99,102,241,0.2)':'transparent',color:tab===t.id?'#a78bfa':'#718096',
                    transition:'all 0.15s',justifyContent:sidebarOpen?'flex-start':'center'}}>
                  <span style={{fontSize:16}}>{t.icon}</span>
                  {sidebarOpen&&<span style={{fontSize:12,fontWeight:tab===t.id?600:400}}>{t.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        {sidebarOpen&&(
          <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <select value={provider} onChange={e=>{setProvider(e.target.value);localStorage.setItem('ai-factory-provider',e.target.value);}}
              style={{width:'100%',padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',marginBottom:6}}>
              <option value="gemini">🟢 Gemini</option><option value="openai">🔵 OpenAI</option><option value="claude">🟣 Claude</option>
            </select>
            <button onClick={()=>setShowKeys(true)} style={{width:'100%',padding:6,borderRadius:6,fontSize:11,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#a0aec0'}}>
              🔑 API 키 설정
            </button>
            <button onClick={logout} style={{width:'100%',padding:6,borderRadius:6,fontSize:11,border:'none',cursor:'pointer',background:'rgba(239,68,68,0.1)',color:'#ef4444',marginTop:4}}>
              🚪 로그아웃
            </button>
          </div>
        )}
      </div>

      {/* ── 메인 ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* 상단 바 */}
        <div style={{padding:'12px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'#e2e8f0',margin:0}}>
              {ALL_TABS.find(t=>t.id===tab)?.icon} {ALL_TABS.find(t=>t.id===tab)?.label}
            </h2>
            {genre&&subGenre&&<span style={{fontSize:11,padding:'3px 10px',borderRadius:10,background:GENRE_MAP[genre]?.gradient||'#4a5568',color:'#fff'}}>
              {GENRE_MAP[genre]?.label} · {GENRE_MAP[genre]?.subs[subGenre]?.label}
            </span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {loading&&<span style={{fontSize:12,color:'#f59e0b'}}>⏳ 처리 중...</span>}
            <span style={{fontSize:11,color:'#4a5568'}}>{projectName}</span>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* API 키 모달 */}
          {showKeys&&(
            <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}} onClick={()=>setShowKeys(false)}>
              <div style={{background:'#1e293b',borderRadius:16,padding:24,width:400,border:'1px solid rgba(255,255,255,0.1)'}} onClick={e=>e.stopPropagation()}>
                <h3 style={{color:'#e2e8f0',fontSize:16,marginBottom:16}}>🔑 API 키 설정</h3>
                {[{l:'Gemini',v:geminiKey,s:setGeminiKey},{l:'OpenAI',v:openaiKey,s:setOpenaiKey},{l:'Claude',v:claudeKey,s:setClaudeKey},{l:'YouTube',v:youtubeKey,s:setYoutubeKey}].map(k=>(
                  <div key={k.l} style={{marginBottom:10}}>
                    <label style={{fontSize:11,color:'#a0aec0',display:'block',marginBottom:4}}>{k.l} API Key</label>
                    <input type="password" value={k.v} onChange={e=>k.s(e.target.value)} placeholder={`${k.l} API Key`}
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
                  </div>
                ))}
                <button onClick={saveKeys} style={{width:'100%',padding:10,borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',marginTop:8,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>저장 완료</button>
              </div>
            </div>
          )}

          {/* ════════════ 준비 > 개요 ════════════ */}
          {tab==='overview'&&(
            <div>
              {/* 프로젝트 관리 F01-F03 */}
              <div style={{display:'flex',gap:8,marginBottom:16}}>
                <button onClick={()=>{const name=prompt('새 프로젝트 이름:');if(name)createProject(name);}}
                  style={{padding:'8px 16px',borderRadius:8,fontSize:12,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontWeight:600}}>
                  ➕ 새 프로젝트
                </button>
                {projects.length>0&&(
                  <select value={currentProjectId} onChange={e=>switchProject(e.target.value)}
                    style={{padding:8,borderRadius:6,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <option value="">프로젝트 선택</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.created})</option>)}
                  </select>
                )}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
                {[
                  {icon:'📝',label:'프로젝트',value:projectName||'미설정'},
                  {icon:'🎭',label:'장르',value:genre&&subGenre?`${GENRE_MAP[genre]?.label} > ${GENRE_MAP[genre]?.subs[subGenre]?.label}`:'미선택'},
                  {icon:'🤖',label:'AI',value:provider.toUpperCase()},
                  {icon:'📊',label:'진행률',value:`${[results['synopsis'],results['script-gen'],results['script-edit']].filter(Boolean).length}/3`}
                ].map((c,i)=>(
                  <div key={i} style={{padding:16,borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',textAlign:'center'}}>
                    <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
                    <div style={{fontSize:11,color:'#718096',marginBottom:2}}>{c.label}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{c.value}</div>
                  </div>
                ))}
              </div>
              {renderGenreSelector()}
            </div>
          )}

          {/* ════════════ 준비 > 장르 선택 ════════════ */}
          {tab==='genre-select'&&(
            <div>
              {renderGenreSelector()}
              {renderSettingsPanel()}
            </div>
          )}

          {/* ════════════ 준비 > 대본 설정 ════════════ */}
          {tab==='settings'&&(
            <div>{renderSettingsPanel()}</div>
          )}

          {/* ════════════ 준비 > 주제/제목 ════════════ */}
          {tab==='topic-title'&&(
            <div>
              {renderTopicSuggester()}
              {renderTitleGenerator()}
            </div>
          )}

          {/* ════════════ 준비 > 시놉시스 ════════════ */}
          {tab==='synopsis'&&(
            <div>
              {renderSynopsisGenerator()}
              {renderCharacterCards()}
              {/* 단일 시놉시스 호환 */}
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <h4 style={{color:'#e2e8f0',fontSize:14,marginBottom:12}}>📄 단일 시놉시스 생성</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="주제" style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <input type="number" value={chapterCount} onChange={e=>setChapterCount(Number(e.target.value))} min={3} max={12}
                    style={{width:80,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <button onClick={()=>handleGeneric('generate-synopsis',{topic:selectedTitle||topic,genre:GENRE_MAP[genre]?.label,chapterCount},'synopsis')} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                    {loading?'생성 중...':'시놉시스 생성'}
                  </button>
                </div>
                {renderResult('synopsis','rgba(16,185,129,0.3)')}
              </div>
            </div>
          )}

          {/* ════════════ 대본 > 대본 생성 ════════════ */}
          {tab==='script-gen'&&(
            <div>
              {(!genre||!subGenre)&&(
                <div style={{padding:14,borderRadius:10,marginBottom:16,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)'}}>
                  <span style={{fontSize:13,color:'#f59e0b'}}>⚠️ 장르를 먼저 선택하면 더 정확한 대본이 생성됩니다.
                    <button onClick={()=>setTab('genre-select')} style={{marginLeft:8,padding:'4px 12px',borderRadius:6,fontSize:11,border:'none',cursor:'pointer',background:'#f59e0b',color:'#000',fontWeight:600}}>장르 선택</button>
                  </span>
                </div>
              )}
              {renderTopicSuggester()}
              {/* 설정 요약 */}
              {genre&&subGenre&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
                  {[{l:'톤',v:TONE_OPTIONS.find(t=>t.id===toneId)?.label},{l:'화자',v:SPEAKER_MODES.find(s=>s.id===speakerModeId)?.label},{l:'나레이션',v:`${narrationRatio}%`},{l:'모드',v:CREATIVE_MODES.find(c=>c.id===creativeMode)?.label}].map((s,i)=>(
                    <div key={i} style={{padding:8,borderRadius:8,textAlign:'center',fontSize:11,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)'}}>
                      <div style={{color:'#718096'}}>{s.l}</div><div style={{color:'#a78bfa',fontWeight:600}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
                {[{v:platform,s:setPlatform,opts:['youtube','shorts','tiktok']},{v:category,s:setCategory,opts:['일반','교육','엔터테인먼트','뉴스']},
                  {v:duration,s:(val:string)=>{setDuration(val);setCustomDuration(false);},opts:contentFormat==='shorts'?['15초','30초','45초','60초']:['3분','5분','8분','10분','15분','20분']},{v:audience,s:setAudience,opts:['일반','10대','20-30대','40대이상']}
                ].map((sel,i)=>(
                  <select key={i} value={sel.v} onChange={e=>sel.s(e.target.value)}
                    style={{padding:10,borderRadius:8,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {sel.opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ))}
              </div>
              <button onClick={handleScript} disabled={loading}
                style={{width:'100%',padding:14,borderRadius:10,fontSize:14,fontWeight:700,border:'none',cursor:'pointer',marginBottom:16,
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',boxShadow:'0 4px 16px rgba(99,102,241,0.3)'}}>
                {loading?'⏳ 대본 생성 중...':'✨ AI 대본 생성'}
              </button>
              {results['script-gen']&&(
                <div style={{padding:20,borderRadius:12,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(99,102,241,0.2)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <h4 style={{color:'#a78bfa',fontSize:14,margin:0}}>📜 생성된 대본</h4>
                    <span style={{fontSize:11,color:'#4a5568'}}>{results['script-gen'].length.toLocaleString()}자</span>
                  </div>
                  <div style={{maxHeight:500,overflowY:'auto'}}><div dangerouslySetInnerHTML={{__html:renderMarkdown(results['script-gen'])}}/></div>
                  <button onClick={()=>{setRegisteredScript(results['script-gen']);alert('대본이 등록되었습니다!');}}
                    style={{marginTop:12,padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'#10b981',color:'#fff'}}>
                    ✅ 대본 등록
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════════ 대본 > 대본 확장 F35-F36 ════════════ */}
          {tab==='script-expand'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>📐 대본 확장</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  {[{id:'15000',label:'15,000자'},{id:'20000',label:'20,000자'},{id:'30000',label:'30,000자'}].map(t=>(
                    <button key={t.id} onClick={()=>setExpandLength(t.id)}
                      style={{padding:'10px 20px',borderRadius:8,fontSize:12,border:'none',cursor:'pointer',fontWeight:600,
                        background:expandLength===t.id?'#6366f1':'rgba(255,255,255,0.06)',color:expandLength===t.id?'#fff':'#cbd5e0'}}>
                      🎯 {t.label}
                    </button>
                  ))}
                </div>
                {registeredScript&&<div style={{fontSize:12,color:'#a0aec0',marginBottom:8}}>현재 등록된 대본: {registeredScript.length.toLocaleString()}자</div>}
                <button onClick={handleExpand} disabled={loading||!registeredScript}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',
                    background:registeredScript?'linear-gradient(135deg,#10b981,#059669)':'rgba(255,255,255,0.08)',color:registeredScript?'#fff':'#4a5568'}}>
                  {loading?'확장 중...':`📐 ${expandLength}자로 확장`}
                </button>
                {!registeredScript&&<p style={{fontSize:11,color:'#ef4444',marginTop:8}}>⚠️ 대본 생성 탭에서 대본을 먼저 등록하세요.</p>}
              </div>
              {expandedScript&&(
                <div style={{padding:20,borderRadius:12,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(16,185,129,0.3)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontSize:13,color:'#10b981',fontWeight:600}}>확장 결과</span>
                    <span style={{fontSize:11,color:'#4a5568'}}>{expandedScript.length.toLocaleString()}자</span>
                  </div>
                  <div style={{maxHeight:400,overflowY:'auto'}}><div dangerouslySetInnerHTML={{__html:renderMarkdown(expandedScript)}}/></div>
                  <button onClick={registerExpandedScript}
                    style={{marginTop:12,padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'#10b981',color:'#fff'}}>
                    ✅ 대본 확장 등록
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════════ 대본 > 대본 편집 ════════════ */}
          {tab==='script-edit'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>✏️ 대본 편집 (AI 윤문)</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  {['polish','rewrite','grammar','shorten','expand'].map(m=>(
                    <button key={m} onClick={()=>setEditMode(m)} style={{padding:'8px 14px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                      background:editMode===m?'#6366f1':'rgba(255,255,255,0.06)',color:editMode===m?'#fff':'#cbd5e0'}}>
                      {m==='polish'?'✨ 윤문':m==='rewrite'?'🔄 리라이트':m==='grammar'?'📝 문법':m==='shorten'?'✂️ 축약':'📐 확장'}
                    </button>
                  ))}
                </div>
                <textarea value={scriptText||registeredScript||results['script-gen']||''} onChange={e=>setScriptText(e.target.value)} placeholder="편집할 대본..."
                  style={{width:'100%',minHeight:200,padding:12,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
                <button onClick={()=>handleGeneric('polish-script',{script:scriptText||registeredScript||results['script-gen'],mode:editMode},'script-edit')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                  {loading?'편집 중...':'✏️ AI 편집'}
                </button>
              </div>
              {renderResult('script-edit','rgba(245,158,11,0.3)')}
            </div>
          )}

          {/* ════════════ 대본 > 가이드라인 ════════════ */}
          {tab==='guidelines'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>✅ 가이드라인 체크</h4>
                <textarea value={scriptText||registeredScript||''} onChange={e=>setScriptText(e.target.value)} placeholder="체크할 대본..."
                  style={{width:'100%',minHeight:120,padding:12,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
                <button onClick={()=>handleGeneric('check-guidelines',{script:scriptText||registeredScript},'guidelines')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                  {loading?'체크 중...':'✅ 가이드라인 체크'}
                </button>
              </div>
              {renderResult('guidelines','rgba(245,158,11,0.3)')}
            </div>
          )}


          {/* ════════════ 분석 > 캐릭터 ════════════ */}
          {tab==='characters'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>👥 등장인물 분석</h4>
                <textarea value={scriptText||registeredScript||results['synopsis']||''} onChange={e=>setScriptText(e.target.value)} placeholder="분석할 시놉시스 또는 대본..."
                  style={{width:'100%',minHeight:120,padding:12,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
                <button onClick={handleCharacterAnalysis} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff'}}>
                  {loading?'분석 중...':'🔍 캐릭터 분석'}
                </button>
              </div>
              {renderCharacterCards()}
              {renderResult('characters','rgba(139,92,246,0.3)')}
            </div>
          )}

          {/* ════════════ 분석 > 장면 분할 F55-F60 ════════════ */}
          {tab==='scenes'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🎬 장면(씬) 분할</h4>
                <div style={{display:'flex',gap:12,marginBottom:12,alignItems:'center'}}>
                  <label style={{fontSize:12,color:'#a0aec0'}}>챕터당 장면 수:</label>
                  <input type="range" min={2} max={12} value={scenesPerChapter} onChange={e=>setScenesPerChapter(Number(e.target.value))} style={{flex:1,accentColor:'#6366f1'}}/>
                  <span style={{fontSize:13,fontWeight:700,color:'#a78bfa',minWidth:40}}>{scenesPerChapter}장</span>
                  <span style={{fontSize:11,color:'#718096'}}>총 {chapterCount*scenesPerChapter}개</span>
                </div>
                {registeredScript&&(
                  <div style={{fontSize:11,color:'#a0aec0',marginBottom:8}}>
                    약 {Math.round(registeredScript.length/(chapterCount*scenesPerChapter))}자당 1장
                  </div>
                )}
                <textarea value={scriptText||registeredScript||''} onChange={e=>setScriptText(e.target.value)} placeholder="씬 분할할 대본..."
                  style={{width:'100%',minHeight:120,padding:12,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
                <button onClick={()=>handleGeneric('split-scenes',{script:scriptText||registeredScript,scenesPerChapter,chapterCount},'scenes')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#ec4899,#db2777)',color:'#fff'}}>
                  {loading?'분할 중...':'✂️ 씬 분할'}
                </button>
              </div>
              {renderResult('scenes','rgba(236,72,153,0.3)')}
            </div>
          )}

          {/* ════════════ 분석 > BGM ════════════ */}
          {tab==='bgm'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🎵 BGM 추천</h4>
                {genre&&subGenre&&(
                  <div style={{padding:10,borderRadius:8,marginBottom:12,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)'}}>
                    <span style={{fontSize:12,color:'#a78bfa'}}>🎭 장르 기반 추천: {GENRE_MAP[genre]?.subs[subGenre]?.bgm}</span>
                  </div>
                )}
                <textarea value={scriptText||registeredScript||''} onChange={e=>setScriptText(e.target.value)} placeholder="BGM 추천받을 대본..."
                  style={{width:'100%',minHeight:100,padding:12,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
                <button onClick={()=>handleGeneric('recommend-bgm',{script:scriptText||registeredScript,genre:GENRE_MAP[genre]?.label,subGenre:GENRE_MAP[genre]?.subs[subGenre]?.label},'bgm')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff'}}>
                  {loading?'추천 중...':'🎵 BGM 추천'}
                </button>
              </div>
              {renderResult('bgm','rgba(139,92,246,0.3)')}
            </div>
          )}

          {/* ════════════ 분석 > 영상 분석 ════════════ */}
          {tab==='video-analysis'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🎥 영상 분석</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="YouTube URL"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <button onClick={()=>handleGeneric('analyze-video',{url:videoUrl},'video-analysis')} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff'}}>
                    {loading?'분석 중...':'🔍 분석'}
                  </button>
                </div>
              </div>
              {renderResult('video-analysis','rgba(239,68,68,0.3)')}
            </div>
          )}

          {/* ════════════ 분석 > 구조 분석 ════════════ */}
          {tab==='structure'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🏗️ 구조 분석</h4>
                <textarea value={scriptText||registeredScript||''} onChange={e=>setScriptText(e.target.value)} placeholder="분석할 대본..."
                  style={{width:'100%',minHeight:120,padding:12,borderRadius:8,fontSize:12,background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
                <button onClick={()=>handleGeneric('structure-analysis',{script:scriptText||registeredScript},'structure')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  {loading?'분석 중...':'📐 구조 분석'}
                </button>
              </div>
              {renderResult('structure','rgba(99,102,241,0.3)')}
            </div>
          )}

          {/* ════════════ 제작 > TTS F37-F47 ════════════ */}
          {tab==='tts'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>🔊 TTS 음성 생성</h4>

                {/* TTS 엔진 */}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>기본 TTS 엔진</label>
                  <div style={{display:'flex',gap:6}}>
                    {TTS_ENGINES.map(e=>(
                      <button key={e.id} onClick={()=>setTtsEngine(e.id)}
                        style={{padding:'8px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                          background:ttsEngine===e.id?'#6366f1':'rgba(255,255,255,0.06)',color:ttsEngine===e.id?'#fff':'#cbd5e0'}}>
                        {e.icon} {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 화자별 엔진 배정 F38 */}
                {characters.length>0&&(
                  <div style={{marginBottom:16,padding:12,borderRadius:8,background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)'}}>
                    <label style={{fontSize:11,color:'#a78bfa',display:'block',marginBottom:8}}>화자별 음성 엔진 배정</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                      {['나레이션',...characters.map((c:any)=>c.name)].map(name=>(
                        <div key={name} style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:11,color:'#e2e8f0',minWidth:60}}>{name}</span>
                          <select value={ttsSpeakerEngines[name]||ttsEngine} onChange={e=>setTtsSpeakerEngines(p=>({...p,[name]:e.target.value}))}
                            style={{flex:1,padding:6,borderRadius:6,fontSize:10,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                            {TTS_ENGINES.map(eng=><option key={eng.id} value={eng.id}>{eng.icon} {eng.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 분할 옵션 F40 */}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>분할 기준</label>
                  <div style={{display:'flex',gap:6}}>
                    {[{id:'punctuation',label:'구두점'},{id:'character',label:'글자수 (500자)'},{id:'speaker',label:'화자별'}].map(s=>(
                      <button key={s.id} onClick={()=>setTtsSplitMode(s.id)}
                        style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                          background:ttsSplitMode===s.id?'#10b981':'rgba(255,255,255,0.06)',color:ttsSplitMode===s.id?'#fff':'#cbd5e0'}}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <button onClick={handleTtsSplit}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                    ✂️ 분할 적용
                  </button>
                  <button onClick={handleTtsGenerateAll} disabled={loading||ttsSegments.length===0}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',
                      background:ttsSegments.length>0?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.08)',
                      color:ttsSegments.length>0?'#fff':'#4a5568'}}>
                    {loading?`생성 중... ${ttsProgress}%`:'🔊 전체 TTS 생성'}
                  </button>
                </div>

                {/* 프로그레스바 */}
                {loading&&ttsProgress>0&&(
                  <div style={{marginBottom:16,background:'rgba(255,255,255,0.06)',borderRadius:8,overflow:'hidden',height:8}}>
                    <div style={{width:`${ttsProgress}%`,height:'100%',background:'linear-gradient(90deg,#6366f1,#8b5cf6)',transition:'width 0.3s'}}/>
                  </div>
                )}

                {/* 세그먼트 리스트 F41-F44 */}
                {ttsSegments.length>0&&(
                  <div style={{maxHeight:400,overflowY:'auto'}}>
                    {ttsSegments.map((seg,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:6,marginBottom:4,
                        background:seg.status==='done'?'rgba(16,185,129,0.08)':seg.status==='error'?'rgba(239,68,68,0.08)':'rgba(255,255,255,0.03)',
                        border:`1px solid ${seg.status==='done'?'rgba(16,185,129,0.2)':seg.status==='error'?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.06)'}`}}>
                        <span style={{fontSize:10,color:seg.status==='done'?'#10b981':seg.status==='error'?'#ef4444':'#718096',minWidth:16}}>
                          {seg.status==='done'?'✅':seg.status==='error'?'❌':'⏳'}
                        </span>
                        <span style={{fontSize:10,color:'#a78bfa',minWidth:50,fontWeight:600}}>[{seg.speaker}]</span>
                        <span style={{fontSize:11,color:'#cbd5e0',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{seg.text}</span>
                        <span style={{fontSize:9,color:'#4a5568'}}>{seg.engine}</span>
                        {seg.status==='done'&&<button style={{padding:'2px 8px',borderRadius:4,fontSize:10,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#a0aec0'}}>▶</button>}
                        {seg.status==='error'&&<button onClick={()=>{const n=[...ttsSegments];n[i]={...n[i],status:'done'};setTtsSegments(n);}}
                          style={{padding:'2px 8px',borderRadius:4,fontSize:10,border:'none',cursor:'pointer',background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>재생성</button>}
                      </div>
                    ))}
                  </div>
                )}

                {/* 병합 F45 */}
                {ttsSegments.length>0&&ttsSegments.every(s=>s.status==='done')&&(
                  <button style={{marginTop:12,padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                    🔗 전체 오디오 병합 + 자막 생성
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ════════════ 제작 > 이미지 생성 F50-F60 ════════════ */}
          {tab==='images'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>🖼️ 이미지 생성</h4>
                {renderImageStyleSelector()}
                <div style={{display:'flex',gap:12,marginBottom:12,alignItems:'center'}}>
                  <label style={{fontSize:12,color:'#a0aec0'}}>챕터당 장면:</label>
                  <input type="range" min={2} max={12} value={scenesPerChapter} onChange={e=>setScenesPerChapter(Number(e.target.value))} style={{flex:1,accentColor:'#6366f1'}}/>
                  <span style={{fontSize:13,fontWeight:700,color:'#a78bfa'}}>{scenesPerChapter}장</span>
                  <span style={{fontSize:11,color:'#718096'}}>총 {chapterCount*scenesPerChapter}개</span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>handleGeneric('generate-thumbnail',{script:registeredScript||results['script-gen'],style:`${imgStyleMain}/${imgStyleSub}`,ratio:imgRatio,model:imgModel,textOverlay:imgTextOverlay,count:chapterCount*scenesPerChapter},'images')} disabled={loading}
                    style={{flex:1,padding:'12px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff'}}>
                    {loading?'생성 중...':'🖼️ 장면 일괄 생성'}
                  </button>
                  <button onClick={()=>fileInputRef.current?.click()}
                    style={{padding:'12px 20px',borderRadius:8,fontSize:13,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#cbd5e0'}}>
                    📁 로컬 업로드
                  </button>
                </div>
              </div>
              {renderResult('images','rgba(6,182,212,0.3)')}
            </div>
          )}

          {/* ════════════ 제작 > 타임라인 F61-F64 ════════════ */}
          {tab==='timeline'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>⏱️ 이미지-자막 동기화 타임라인</h4>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <button onClick={()=>setTimelineMode('dialogue')}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:12,border:'none',cursor:'pointer',flex:1,
                      background:timelineMode==='dialogue'?'#6366f1':'rgba(255,255,255,0.06)',color:timelineMode==='dialogue'?'#fff':'#cbd5e0',fontWeight:600}}>
                    💬 대사 매칭
                  </button>
                  <button onClick={()=>setTimelineMode('chapter')}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:12,border:'none',cursor:'pointer',flex:1,
                      background:timelineMode==='chapter'?'#6366f1':'rgba(255,255,255,0.06)',color:timelineMode==='chapter'?'#fff':'#cbd5e0',fontWeight:600}}>
                    📖 챕터별 배치
                  </button>
                </div>
                <button onClick={()=>{setTimelineData([{mode:timelineMode,created:new Date().toLocaleString()}]);setResult('타임라인이 생성되었습니다. 모드: '+(timelineMode==='dialogue'?'대사 매칭':'챕터별 배치'));}}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
                  ⏱️ 타임라인 생성
                </button>
                <div style={{marginTop:16,padding:12,borderRadius:8,background:'rgba(0,0,0,0.2)'}}>
                  <h5 style={{color:'#a0aec0',fontSize:12,marginBottom:8}}>🔇 무음 제거 (F65-F66)</h5>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',background:'rgba(245,158,11,0.2)',color:'#f59e0b'}}>🔍 무음 감지</button>
                    <button style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>✂️ 무음 제거</button>
                  </div>
                </div>
              </div>
              {renderResult('timeline','rgba(99,102,241,0.3)')}
            </div>
          )}

          {/* ════════════ 제작 > 효과/오버레이 F67-F71 ════════════ */}
          {tab==='effects'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>✨ 이미지 효과 / 오버레이</h4>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>이미지 효과</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {[{id:'zoom',label:'🔍 줌인/줌아웃'},{id:'pan',label:'↔️ 좌우 이동'},{id:'kenburns',label:'🎬 Ken Burns'},{id:'fade',label:'🌫️ 페이드'},{id:'none',label:'❌ 없음'}].map(e=>(
                      <button key={e.id} onClick={()=>setEffectType(e.id)}
                        style={{padding:'8px 14px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                          background:effectType===e.id?'#6366f1':'rgba(255,255,255,0.06)',color:effectType===e.id?'#fff':'#cbd5e0'}}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>오버레이 효과</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {[{id:'none',label:'없음'},{id:'light',label:'✨ 빛'},{id:'dust',label:'🌫️ 먼지'},{id:'rain',label:'🌧️ 비'},{id:'fire',label:'🔥 불꽃'},{id:'snow',label:'❄️ 눈'}].map(o=>(
                      <button key={o.id} onClick={()=>setOverlayType(o.id)}
                        style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                          background:overlayType===o.id?'#8b5cf6':'rgba(255,255,255,0.06)',color:overlayType===o.id?'#fff':'#cbd5e0'}}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:1,padding:'10px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
                    🎯 개별 장면 적용
                  </button>
                  <button style={{flex:1,padding:'10px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                    📋 전체 일괄 적용
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ 제작 > 자막 스타일 F72-F76 ════════════ */}
          {tab==='subtitles'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>💬 자막 스타일</h4>
                {/* 템플릿 */}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>자막 템플릿</label>
                  <div style={{display:'flex',gap:8}}>
                    {SUBTITLE_TEMPLATES.map(t=>(
                      <div key={t.id} onClick={()=>setSubtitleTemplate(t.id)}
                        style={{flex:1,padding:12,borderRadius:8,cursor:'pointer',textAlign:'center',
                          border:subtitleTemplate===t.id?'2px solid #6366f1':'1px solid rgba(255,255,255,0.08)',
                          background:'rgba(0,0,0,0.3)'}}>
                        <div style={{padding:'4px 8px',borderRadius:4,display:'inline-block',marginBottom:4,...Object.fromEntries(t.preview.split(';').map(s=>{const[k,v]=s.split(':');return[k.trim(),v?.trim()];}))}}>{t.label}</div>
                        <div style={{fontSize:10,color:'#718096'}}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 폰트/크기 */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
                  <div>
                    <label style={{fontSize:10,color:'#718096',display:'block',marginBottom:4}}>폰트</label>
                    <select value={subtitleFont} onChange={e=>setSubtitleFont(e.target.value)}
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                      {['Pretendard','NanumGothic','NanumMyeongjo','GmarketSans','BlackHanSans'].map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#718096',display:'block',marginBottom:4}}>글자 크기</label>
                    <input type="number" value={subtitleSize} onChange={e=>setSubtitleSize(Number(e.target.value))} min={10} max={40}
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <label style={{fontSize:10,color:'#718096',display:'block',marginBottom:4}}>제목/워터마크</label>
                    <input value={titleWatermark} onChange={e=>setTitleWatermark(e.target.value)} placeholder="AI로 제작됨"
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
                  </div>
                </div>
                {/* 로고 F75 */}
                <div style={{padding:12,borderRadius:8,background:'rgba(0,0,0,0.2)',marginBottom:12}}>
                  <label style={{fontSize:11,color:'#a0aec0',display:'block',marginBottom:8}}>🏷️ 로고 삽입</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    <select value={logoPosition} onChange={e=>setLogoPosition(e.target.value)}
                      style={{padding:6,borderRadius:6,fontSize:10,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                      {['top-left','top-right','bottom-left','bottom-right'].map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:10,color:'#718096'}}>투명도</span>
                      <input type="range" min={10} max={100} value={logoOpacity} onChange={e=>setLogoOpacity(Number(e.target.value))} style={{flex:1,accentColor:'#6366f1'}}/>
                      <span style={{fontSize:10,color:'#a78bfa'}}>{logoOpacity}%</span>
                    </div>
                    <button onClick={()=>fileInputRef.current?.click()}
                      style={{padding:6,borderRadius:6,fontSize:10,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#a0aec0'}}>
                      📁 로고 업로드
                    </button>
                  </div>
                </div>
                {/* 안전 영역 F76 */}
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#a0aec0',cursor:'pointer'}}>
                  <input type="checkbox" checked={showSafeArea} onChange={e=>setShowSafeArea(e.target.checked)} style={{accentColor:'#6366f1'}}/>
                  📐 안전 영역 가이드 표시 (쇼츠 가이드)
                </label>
              </div>
            </div>
          )}

          {/* ════════════ 제작 > 이미지 컴포지터 F77 ════════════ */}
          {tab==='compositor'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🎞️ 이미지 컴포지터</h4>
                <p style={{fontSize:12,color:'#a0aec0',marginBottom:16}}>특정 장면에 차트, 기사 캡처, 보조 이미지를 합성합니다.</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
                  {Array.from({length:Math.min(8,chapterCount)},(_,i)=>(
                    <div key={i} style={{padding:12,borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#718096',marginBottom:4}}>챕터 {i+1}</div>
                      <button onClick={()=>fileInputRef.current?.click()}
                        style={{padding:'4px 10px',borderRadius:6,fontSize:10,border:'none',cursor:'pointer',background:'rgba(99,102,241,0.2)',color:'#a78bfa'}}>
                        🖼️ 이미지 추가
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ 제작 > 영상 생성 F78-F82 ════════════ */}
          {tab==='video-render'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>🎬 영상 생성</h4>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                  <div>
                    <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>방향</label>
                    <div style={{display:'flex',gap:6}}>
                      {[{id:'landscape',label:'🖥️ 가로 16:9'},{id:'portrait',label:'📱 세로 9:16'}].map(o=>(
                        <button key={o.id} onClick={()=>setVideoOrientation(o.id)}
                          style={{flex:1,padding:8,borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                            background:videoOrientation===o.id?'#6366f1':'rgba(255,255,255,0.06)',color:videoOrientation===o.id?'#fff':'#cbd5e0'}}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>화질</label>
                    <select value={videoQuality} onChange={e=>setVideoQuality(e.target.value)}
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:11,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <option value="720p">720p</option><option value="1080p">1080p (권장)</option><option value="4k">4K</option>
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>자막 포함</label>
                    <label style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#a0aec0',cursor:'pointer'}}>
                      <input type="checkbox" checked={videoSubtitle} onChange={e=>setVideoSubtitle(e.target.checked)} style={{accentColor:'#6366f1'}}/>
                      영상에 자막 번인
                    </label>
                  </div>
                </div>
                {/* 미리보기 F81 */}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:6}}>미리보기 생성</label>
                  <div style={{display:'flex',gap:6}}>
                    {[10,20,30].map(d=>(
                      <button key={d} onClick={()=>setPreviewDuration(d)}
                        style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                          background:previewDuration===d?'#f59e0b':'rgba(255,255,255,0.06)',color:previewDuration===d?'#000':'#cbd5e0'}}>
                        {d}초 미리보기
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:1,padding:'12px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                    👁️ 미리보기 생성 ({previewDuration}초)
                  </button>
                  <button style={{flex:1,padding:'12px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
                    🎬 최종 영상 생성
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ 제작 > 내보내기 F83-F84 ════════════ */}
          {tab==='export'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>📦 내보내기</h4>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:16}}>
                  <div style={{padding:20,borderRadius:12,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',textAlign:'center',cursor:'pointer'}}>
                    <div style={{fontSize:32,marginBottom:8}}>🎬</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:4}}>DaVinci Resolve</div>
                    <div style={{fontSize:11,color:'#a0aec0'}}>타임라인+미디어+자막 내보내기</div>
                    <button style={{marginTop:12,padding:'8px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'#6366f1',color:'#fff'}}>
                      📤 DaVinci 내보내기
                    </button>
                  </div>
                  <div style={{padding:20,borderRadius:12,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',textAlign:'center',cursor:'pointer'}}>
                    <div style={{fontSize:32,marginBottom:8}}>✂️</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:4}}>CapCut</div>
                    <div style={{fontSize:11,color:'#a0aec0'}}>프로젝트 파일로 내보내기</div>
                    <button style={{marginTop:12,padding:'8px 20px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:'#10b981',color:'#fff'}}>
                      📤 CapCut 내보내기
                    </button>
                  </div>
                </div>
                <div style={{padding:12,borderRadius:8,background:'rgba(0,0,0,0.2)'}}>
                  <h5 style={{color:'#a0aec0',fontSize:12,marginBottom:8}}>🎥 Grok 영상 생성 (F85-F91)</h5>
                  <p style={{fontSize:11,color:'#718096',marginBottom:8}}>무료: 하루 20개 / $8: 100개 / $30: 200개</p>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',background:'rgba(139,92,246,0.2)',color:'#a78bfa'}}>🎬 이미지→영상 변환</button>
                    <button style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>🔇 영상 오디오 제거</button>
                    <button style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',background:'rgba(245,158,11,0.2)',color:'#f59e0b'}}>🔄 이미지↔영상 교체</button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ════════════ 마케팅 > SEO ════════════ */}
          {tab==='seo'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🔍 SEO 분석</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="키워드 (쉼표 구분)"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="YouTube URL (선택)"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                </div>
                <button onClick={()=>handleGeneric('seo-analysis',{keywords,url:videoUrl,topic},'seo')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                  {loading?'분석 중...':'🔍 SEO 분석'}
                </button>
              </div>
              {renderResult('seo','rgba(245,158,11,0.3)')}
            </div>
          )}

          {/* ════════════ 마케팅 > 경쟁 분석 ════════════ */}
          {tab==='competitors'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>⚔️ 경쟁 채널 분석</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="경쟁 채널/영상 URL"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <button onClick={()=>handleGeneric('compare-competitors',{url:videoUrl,topic,keywords},'competitors')} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff'}}>
                    {loading?'분석 중...':'⚔️ 경쟁 분석'}
                  </button>
                </div>
              </div>
              {renderResult('competitors','rgba(239,68,68,0.3)')}
            </div>
          )}

          {/* ════════════ 마케팅 > A/B 테스트 ════════════ */}
          {tab==='ab-test'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🧪 A/B 제목 테스트</h4>
                <div style={{marginBottom:12}}>
                  {generatedTitles.length>=2?(
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                      {generatedTitles.slice(0,6).map((t:any,i:number)=>{const title=typeof t==='string'?t:t.title||t;return(
                        <div key={i} style={{padding:10,borderRadius:8,fontSize:12,color:'#e2e8f0',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                          {i+1}. {title}
                        </div>
                      );})}
                    </div>
                  ):(
                    <p style={{fontSize:12,color:'#718096'}}>💡 주제/제목 탭에서 제목을 먼저 생성하세요.</p>
                  )}
                </div>
                <button onClick={()=>{
                  const titles=generatedTitles.map((t:any)=>typeof t==='string'?t:t.title||t).slice(0,6);
                  handleGeneric('title-ab-test',{titles,topic,audience,platform},'ab-test');
                }} disabled={loading||generatedTitles.length<2}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',
                    background:generatedTitles.length>=2?'linear-gradient(135deg,#8b5cf6,#7c3aed)':'rgba(255,255,255,0.08)',
                    color:generatedTitles.length>=2?'#fff':'#4a5568'}}>
                  {loading?'테스트 중...':'🧪 A/B 테스트 실행'}
                </button>
              </div>
              {renderResult('ab-test','rgba(139,92,246,0.3)')}
            </div>
          )}

          {/* ════════════ 마케팅 > 시리즈 기획 ════════════ */}
          {tab==='series'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>📚 시리즈 기획</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="시리즈 주제"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <select value={seriesCount} onChange={e=>setSeriesCount(Number(e.target.value))}
                    style={{padding:10,borderRadius:8,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {[3,5,7,10,15,20].map(n=><option key={n} value={n}>{n}편</option>)}
                  </select>
                </div>
                <button onClick={()=>handleGeneric('plan-series',{topic,count:seriesCount,genre:GENRE_MAP[genre]?.label,platform},'series')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  {loading?'기획 중...':'📚 시리즈 기획'}
                </button>
              </div>
              {renderResult('series','rgba(99,102,241,0.3)')}
            </div>
          )}

          {/* ════════════ 마케팅 > 캘린더 ════════════ */}
          {tab==='calendar'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>📅 콘텐츠 캘린더</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="채널 주제"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <select value={calendarWeeks} onChange={e=>setCalendarWeeks(Number(e.target.value))}
                    style={{padding:10,borderRadius:8,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {[1,2,4,8,12].map(w=><option key={w} value={w}>{w}주</option>)}
                  </select>
                </div>
                <button onClick={()=>handleGeneric('content-calendar',{topic,weeks:calendarWeeks,platform},'calendar')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                  {loading?'생성 중...':'📅 캘린더 생성'}
                </button>
              </div>
              {renderResult('calendar','rgba(16,185,129,0.3)')}
            </div>
          )}

          {/* ════════════ 마케팅 > 트렌드 ════════════ */}
          {tab==='trends'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>📈 트렌드 분석</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="트렌드 키워드"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <button onClick={()=>handleGeneric('trends',{keywords,topic,platform},'trends')} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                    {loading?'분석 중...':'📈 트렌드'}
                  </button>
                </div>
              </div>
              {renderResult('trends','rgba(245,158,11,0.3)')}
            </div>
          )}

          {/* ════════════ 배포 > 커뮤니티 ════════════ */}
          {tab==='community'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>💬 커뮤니티 포스트</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="포스트 주제"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <select value={communityType} onChange={e=>setCommunityType(e.target.value)}
                    style={{padding:10,borderRadius:8,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <option value="announcement">📢 공지</option><option value="poll">📊 투표</option>
                    <option value="behind">🎬 비하인드</option><option value="teaser">🎯 티저</option><option value="qna">❓ Q&A</option>
                  </select>
                </div>
                <button onClick={()=>handleGeneric('community-post',{topic,type:communityType,script:registeredScript},'community')} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  {loading?'생성 중...':'💬 포스트 생성'}
                </button>
              </div>
              {renderResult('community','rgba(99,102,241,0.3)')}
            </div>
          )}

          {/* ════════════ 배포 > 쇼핑 ════════════ */}
          {tab==='shopping'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:12}}>🛒 쇼핑 콘텐츠</h4>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="상품명"
                    style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                  <button onClick={()=>handleGeneric('shopping-content',{product:topic,platform},'shopping')} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#ec4899,#db2777)',color:'#fff'}}>
                    {loading?'생성 중...':'🛒 쇼핑 콘텐츠'}
                  </button>
                </div>
              </div>
              {renderResult('shopping','rgba(236,72,153,0.3)')}
            </div>
          )}

          {/* ════════════ 배포 > 유튜브 업로드 F92-F98 ════════════ */}
          {tab==='youtube-upload'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>🚀 유튜브 업로드</h4>

                {/* AI 메타 생성 */}
                <div style={{marginBottom:16,padding:12,borderRadius:8,background:'rgba(0,0,0,0.2)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:12,color:'#a0aec0'}}>AI로 제목/설명/태그 생성</span>
                    <button onClick={async()=>{
                      const r=await callApi('generate-description',{script:registeredScript||results['script-gen'],topic:selectedTitle||topic});
                      try{const d=JSON.parse(r);setYtTitle(d.title||selectedTitle||topic);setYtDesc(d.description||r);setYtTags(d.tags?.join(',')||'');}
                      catch{setYtDesc(r);setYtTitle(selectedTitle||topic);}
                    }} disabled={loading}
                      style={{padding:'6px 16px',borderRadius:6,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
                      {loading?'생성 중...':'🤖 AI 생성'}
                    </button>
                  </div>
                </div>

                {/* 제목 */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:4}}>제목</label>
                  <input value={ytTitle} onChange={e=>setYtTitle(e.target.value)} placeholder="영상 제목"
                    style={{width:'100%',padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
                </div>

                {/* 설명 */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:4}}>설명</label>
                  <textarea value={ytDesc} onChange={e=>setYtDesc(e.target.value)} placeholder="영상 설명"
                    style={{width:'100%',minHeight:100,padding:10,borderRadius:8,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',resize:'vertical',boxSizing:'border-box'}}/>
                </div>

                {/* 태그 */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:4}}>태그 (쉼표 구분)</label>
                  <input value={ytTags} onChange={e=>setYtTags(e.target.value)} placeholder="태그1, 태그2, 태그3"
                    style={{width:'100%',padding:10,borderRadius:8,fontSize:13,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
                </div>

                {/* 썸네일 F93-F95 */}
                <div style={{marginBottom:16,padding:12,borderRadius:8,background:'rgba(0,0,0,0.2)'}}>
                  <label style={{fontSize:11,color:'#a0aec0',display:'block',marginBottom:8}}>📸 썸네일</label>
                  <div style={{display:'flex',gap:6,marginBottom:8}}>
                    {[{id:'ai',label:'🤖 AI 생성'},{id:'upload',label:'📁 파일 업로드'},{id:'url',label:'🔗 URL 분석'}].map(m=>(
                      <button key={m.id} onClick={()=>setYtThumbnailMode(m.id)}
                        style={{padding:'6px 12px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',
                          background:ytThumbnailMode===m.id?'#6366f1':'rgba(255,255,255,0.06)',color:ytThumbnailMode===m.id?'#fff':'#cbd5e0'}}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {ytThumbnailMode==='url'&&(
                    <div style={{display:'flex',gap:8}}>
                      <input value={ytThumbnailUrl} onChange={e=>setYtThumbnailUrl(e.target.value)} placeholder="참고할 유튜브 썸네일 URL"
                        style={{flex:1,padding:8,borderRadius:6,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}/>
                      <button style={{padding:'8px 14px',borderRadius:6,fontSize:11,border:'none',cursor:'pointer',background:'rgba(99,102,241,0.2)',color:'#a78bfa'}}>분석</button>
                    </div>
                  )}
                  {ytThumbnailMode==='upload'&&(
                    <button onClick={()=>fileInputRef.current?.click()}
                      style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'2px dashed rgba(255,255,255,0.15)',cursor:'pointer',background:'transparent',color:'#a0aec0',width:'100%'}}>
                      📂 썸네일 파일 선택
                    </button>
                  )}
                  {ytThumbnailMode==='ai'&&(
                    <button onClick={()=>handleGeneric('generate-thumbnail',{topic:ytTitle||topic,style:imgStyleMain},'youtube-upload')} disabled={loading}
                      style={{padding:'8px 16px',borderRadius:8,fontSize:11,border:'none',cursor:'pointer',background:'rgba(99,102,241,0.2)',color:'#a78bfa'}}>
                      {loading?'생성 중...':'🤖 AI 썸네일 생성'}
                    </button>
                  )}
                </div>

                {/* 공개 범위 F96-F97 */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                  <div>
                    <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:4}}>공개 범위</label>
                    <select value={ytPrivacy} onChange={e=>setYtPrivacy(e.target.value)}
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <option value="private">🔒 비공개</option><option value="unlisted">🔗 일부 공개</option><option value="public">🌍 전체 공개</option>
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:'#718096',display:'block',marginBottom:4}}>예약 업로드</label>
                    <input type="datetime-local" value={ytSchedule} onChange={e=>setYtSchedule(e.target.value)}
                      style={{width:'100%',padding:8,borderRadius:6,fontSize:12,background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',boxSizing:'border-box'}}/>
                  </div>
                </div>

                <button disabled={!youtubeKey}
                  style={{width:'100%',padding:14,borderRadius:10,fontSize:14,fontWeight:700,border:'none',cursor:'pointer',
                    background:youtubeKey?'linear-gradient(135deg,#ef4444,#dc2626)':'rgba(255,255,255,0.08)',
                    color:youtubeKey?'#fff':'#4a5568',boxShadow:youtubeKey?'0 4px 16px rgba(239,68,68,0.3)':'none'}}>
                  🚀 유튜브 업로드
                </button>
                {!youtubeKey&&<p style={{fontSize:11,color:'#ef4444',marginTop:8}}>⚠️ API 키 설정에서 YouTube API 키를 먼저 입력하세요.</p>}
              </div>
              {renderResult('youtube-upload','rgba(239,68,68,0.3)')}
            </div>
          )}

          {/* ════════════ 배포 > 미디어 라이브러리 F100 ════════════ */}
          {tab==='media-library'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>📁 미디어 라이브러리</h4>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
                  {[
                    {icon:'🖼️',label:'이미지',count:chapterCount*scenesPerChapter,color:'#06b6d4'},
                    {icon:'🎥',label:'영상',count:0,color:'#8b5cf6'},
                    {icon:'🔊',label:'오디오',count:ttsSegments.filter(s=>s.status==='done').length,color:'#10b981'},
                    {icon:'💾',label:'총 용량',count:0,color:'#f59e0b',unit:'MB'}
                  ].map((m,i)=>(
                    <div key={i} style={{padding:16,borderRadius:10,background:`rgba(${m.color==='#06b6d4'?'6,182,212':m.color==='#8b5cf6'?'139,92,246':m.color==='#10b981'?'16,185,129':'245,158,11'},0.1)`,
                      border:`1px solid rgba(${m.color==='#06b6d4'?'6,182,212':m.color==='#8b5cf6'?'139,92,246':m.color==='#10b981'?'16,185,129':'245,158,11'},0.3)`,textAlign:'center'}}>
                      <div style={{fontSize:24,marginBottom:4}}>{m.icon}</div>
                      <div style={{fontSize:11,color:'#718096'}}>{m.label}</div>
                      <div style={{fontSize:18,fontWeight:700,color:'#e2e8f0'}}>{m.count}{m.unit||'개'}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:12,borderRadius:8,background:'rgba(0,0,0,0.2)'}}>
                  <p style={{fontSize:12,color:'#a0aec0',margin:0}}>📋 설정 요약: 이미지/대본/음성 생성에 Google Cloud API 키 필요. 유튜브 자동 업로드에 YouTube OAuth 인증 필요.</p>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ 배포 > 패키지 ════════════ */}
          {tab==='package'&&(
            <div>
              <div style={{padding:20,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>
                <h4 style={{color:'#e2e8f0',fontSize:15,marginBottom:16}}>📦 프로젝트 패키지</h4>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:16}}>
                  {[
                    {icon:'📁',label:'프로젝트',value:projectName||'미설정'},
                    {icon:'🎭',label:'장르',value:genre&&subGenre?`${GENRE_MAP[genre]?.label} > ${GENRE_MAP[genre]?.subs[subGenre]?.label}`:'미선택'},
                    {icon:'📜',label:'대본',value:registeredScript?`${registeredScript.length.toLocaleString()}자`:'없음'},
                    {icon:'📖',label:'시놉시스',value:results['synopsis']?'완료':'없음'},
                    {icon:'🏷️',label:'제목',value:selectedTitle||'미선택'},
                    {icon:'👥',label:'캐릭터',value:characters.length>0?`${characters.length}명`:'없음'},
                    {icon:'🔊',label:'TTS',value:ttsSegments.filter(s=>s.status==='done').length>0?`${ttsSegments.filter(s=>s.status==='done').length}개`:'없음'},
                    {icon:'🤖',label:'AI',value:provider.toUpperCase()}
                  ].map((item,i)=>(
                    <div key={i} style={{padding:10,borderRadius:8,fontSize:11,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                      <span>{item.icon} </span><span style={{color:'#718096'}}>{item.label}: </span><span style={{color:'#e2e8f0'}}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{
                    const pkg={project:projectName,genre,subGenre,topic:selectedTitle||topic,
                      synopsis:results['synopsis'],script:registeredScript,characters,
                      settings:{toneId,speakerModeId,narrationRatio,creativeMode,dramaElements,humanTouchEls,humanTouchLevel,contentFormat,outputLang,imgStyleMain,imgStyleSub,platform,category,duration,audience,chapterCount}};
                    const blob=new Blob([JSON.stringify(pkg,null,2)],{type:'application/json'});
                    const url=URL.createObjectURL(blob);const a=document.createElement('a');
                    a.href=url;a.download=`${projectName||'project'}_package.json`;a.click();URL.revokeObjectURL(url);
                  }}
                    style={{flex:1,padding:'12px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                    💾 JSON 패키지 다운로드
                  </button>
                  <button onClick={()=>handleGeneric('upload-package',{project:projectName,script:registeredScript,synopsis:results['synopsis']},'package')} disabled={loading}
                    style={{flex:1,padding:'12px 24px',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#cbd5e0'}}>
                    {loading?'처리 중...':'📤 업로드 패키지'}
                  </button>
                </div>
              </div>
              {renderResult('package','rgba(99,102,241,0.3)')}
            </div>
          )}

        </div>{/* end 스크롤 영역 */}
      </div>{/* end 메인 */}
    </div>
  );
}





