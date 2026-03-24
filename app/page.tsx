'use client';
import { useState, useEffect, useCallback } from 'react';

const GENRE_MAP: Record<string,{icon:string;label:string;color:string;gradient:string;desc:string;subs:Record<string,{icon:string;label:string;tone:string;speaker:string;narrationRatio:number;structure:string[];bgm:string;imageStyle:string;duration:string;chapters:number;hookExample:string}>}> = {
  storytelling: {
    icon:'📖',label:'스토리텔링',color:'#a78bfa',gradient:'linear-gradient(135deg,#4c1d95,#7c3aed)',desc:'미스터리,공포,실화,도시전설',
    subs:{
      mystery:{icon:'🔍',label:'미스터리/추리',tone:'긴장감',speaker:'내레이터 90%',narrationRatio:90,structure:['후킹','단서제시','반전','결론','여운'],bgm:'Dark Ambient',imageStyle:'cinematic',duration:'12분',chapters:7,hookExample:'아무도 눈치채지 못한 그 밤의 진실...'},
      horror:{icon:'👻',label:'공포/괴담',tone:'으스스',speaker:'내레이터 95%',narrationRatio:95,structure:['공포후킹','배경','전개','클라이맥스','충격결말'],bgm:'Horror Drone',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'절대 이 영상을 밤에 혼자 보지 마세요...'},
      realCase:{icon:'📋',label:'실화/사건',tone:'담담+긴장',speaker:'내레이터 85%',narrationRatio:85,structure:['사건개요','인물','전개','수사','결말'],bgm:'Tension Build',imageStyle:'realistic',duration:'15분',chapters:8,hookExample:'실제로 일어난 이 사건, 아직도 미해결입니다...'},
      urbanLegend:{icon:'🌃',label:'도시전설',tone:'미스터리',speaker:'내레이터 90%',narrationRatio:90,structure:['도입','전설소개','증거','분석','결론'],bgm:'Eerie Ambient',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'전 세계에서 동시에 목격된 이것의 정체는...'},
      mythology:{icon:'⚔️',label:'신화/무협',tone:'서사적',speaker:'내레이터 80%',narrationRatio:80,structure:['시대배경','인물','대립','전투','교훈'],bgm:'Epic Orchestral',imageStyle:'illustration',duration:'12분',chapters:7,hookExample:'신들조차 두려워한 단 하나의 존재...'},
      drama:{icon:'🎭',label:'드라마/감동',tone:'감성',speaker:'다중화자 60%',narrationRatio:40,structure:['일상','사건','갈등','절정','감동결말'],bgm:'Emotional Piano',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'그 날 이후, 아무것도 같지 않았습니다...'}
    }
  },
  education: {
    icon:'📚',label:'교육/정보',color:'#60a5fa',gradient:'linear-gradient(135deg,#1e3a5f,#3b82f6)',desc:'지식,노하우,학습',
    subs:{
      knowledge:{icon:'💡',label:'지식/상식',tone:'친근+전문',speaker:'내레이터 100%',narrationRatio:100,structure:['질문후킹','개요','핵심3개','사례','정리'],bgm:'Light Corporate',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'99%가 모르는 이 사실...'},
      howto:{icon:'🛠️',label:'방법/튜토리얼',tone:'실용적',speaker:'내레이터 100%',narrationRatio:100,structure:['문제제시','준비물','단계별','팁','마무리'],bgm:'Upbeat Lo-fi',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'이 방법만 따라하면 누구나...'},
      psychology:{icon:'🧠',label:'심리/자기계발',tone:'공감+동기부여',speaker:'내레이터 95%',narrationRatio:95,structure:['공감후킹','문제분석','해결법','실천팁','마무리'],bgm:'Motivational',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'성공하는 사람들이 절대 하지 않는...'},
      science:{icon:'🔬',label:'과학/기술',tone:'호기심',speaker:'내레이터 100%',narrationRatio:100,structure:['질문','현상설명','원리','실험','결론'],bgm:'Techy Ambient',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'과학자들도 설명하지 못하는 이 현상...'}
    }
  },
  finance: {
    icon:'💰',label:'재테크/비즈니스',color:'#34d399',gradient:'linear-gradient(135deg,#064e3b,#10b981)',desc:'주식,부동산,창업',
    subs:{
      investment:{icon:'📈',label:'주식/투자',tone:'전문+신뢰',speaker:'내레이터 100%',narrationRatio:100,structure:['시장현황','분석','전략','리스크','결론'],bgm:'Corporate',imageStyle:'realistic',duration:'12분',chapters:7,hookExample:'지금 이 종목을 사지 않으면...'},
      realestate:{icon:'🏠',label:'부동산',tone:'실용',speaker:'내레이터 100%',narrationRatio:100,structure:['현황','지역분석','투자포인트','주의사항','전망'],bgm:'Calm Corporate',imageStyle:'realistic',duration:'12분',chapters:7,hookExample:'2026년 부동산, 이 지역만...'},
      sidehustle:{icon:'💼',label:'부업/창업',tone:'동기부여',speaker:'내레이터 95%',narrationRatio:95,structure:['성공사례','방법소개','수익구조','시작방법','주의점'],bgm:'Upbeat',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'직장 다니면서 월 300 버는...'}
    }
  },
  history: {
    icon:'🏛️',label:'역사/문화',color:'#f59e0b',gradient:'linear-gradient(135deg,#78350f,#f59e0b)',desc:'역사,인물,문명',
    subs:{
      korean:{icon:'🇰🇷',label:'한국사',tone:'서사적',speaker:'내레이터 90%',narrationRatio:90,structure:['시대배경','인물','사건','의미','교훈'],bgm:'Traditional Korean',imageStyle:'illustration',duration:'12분',chapters:7,hookExample:'교과서가 감춘 조선시대의 충격적 진실...'},
      world:{icon:'🌍',label:'세계사',tone:'장대',speaker:'내레이터 90%',narrationRatio:90,structure:['배경','원인','전개','결과','영향'],bgm:'Cinematic Orchestra',imageStyle:'cinematic',duration:'15분',chapters:8,hookExample:'로마 제국이 멸망한 진짜 이유...'},
      war:{icon:'⚔️',label:'전쟁/군사',tone:'긴박',speaker:'내레이터 85%',narrationRatio:85,structure:['전쟁배경','전략','전투','결과','분석'],bgm:'War Drums',imageStyle:'cinematic',duration:'15분',chapters:8,hookExample:'역사상 가장 미친 작전...'}
    }
  },
  entertainment: {
    icon:'🎪',label:'엔터/유머',color:'#f472b6',gradient:'linear-gradient(135deg,#831843,#ec4899)',desc:'웃긴이야기,랭킹,퀴즈',
    subs:{
      comedy:{icon:'😂',label:'코미디',tone:'유쾌',speaker:'다중화자 50%',narrationRatio:50,structure:['도입','상황설정','반전1','반전2','폭소결말'],bgm:'Funny/Quirky',imageStyle:'character',duration:'8분',chapters:5,hookExample:'이걸 보고 안 웃으면 사람이 아닙니다...'},
      ranking:{icon:'🏆',label:'랭킹/TOP',tone:'흥미진진',speaker:'내레이터 100%',narrationRatio:100,structure:['도입','순위발표','1위발표','정리'],bgm:'Energetic Pop',imageStyle:'realistic',duration:'10분',chapters:7,hookExample:'전 세계 TOP 10, 1위는 예상 못합니다...'},
      quiz:{icon:'❓',label:'퀴즈/상식',tone:'참여유도',speaker:'내레이터 80%',narrationRatio:80,structure:['규칙','문제출제','힌트','정답','해설'],bgm:'Game Show',imageStyle:'character',duration:'8분',chapters:6,hookExample:'IQ 130 이상만 맞출 수 있는 문제...'}
    }
  },
  science_tech: {
    icon:'🚀',label:'과학/테크',color:'#22d3ee',gradient:'linear-gradient(135deg,#164e63,#06b6d4)',desc:'IT,AI,우주,미래기술',
    subs:{
      ai_tech:{icon:'🤖',label:'AI/IT',tone:'트렌디',speaker:'내레이터 100%',narrationRatio:100,structure:['트렌드소개','기술설명','사례','전망','정리'],bgm:'Synth/Electronic',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'ChatGPT도 두려워하는 새로운 AI...'},
      space:{icon:'🪐',label:'우주/천문',tone:'경이로움',speaker:'내레이터 95%',narrationRatio:95,structure:['도입','현상','과학적설명','시각화','결론'],bgm:'Cosmic Ambient',imageStyle:'cinematic',duration:'12분',chapters:7,hookExample:'우주 끝에서 발견된 이것...'},
      future:{icon:'🔮',label:'미래/예측',tone:'상상력',speaker:'내레이터 100%',narrationRatio:100,structure:['현재','변화예측','시나리오','영향','결론'],bgm:'Futuristic',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'2050년, 인류는 이렇게 살고 있을 겁니다...'}
    }
  },
  health: {
    icon:'💪',label:'건강/웰빙',color:'#4ade80',gradient:'linear-gradient(135deg,#14532d,#22c55e)',desc:'건강,운동,다이어트',
    subs:{
      medical:{icon:'🏥',label:'의학/질병',tone:'신뢰',speaker:'내레이터 100%',narrationRatio:100,structure:['증상소개','원인','예방법','치료법','정리'],bgm:'Calm Piano',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'이 증상이 나타나면 즉시 병원에...'},
      fitness:{icon:'🏋️',label:'운동/피트니스',tone:'활기',speaker:'트레이너 80%',narrationRatio:60,structure:['효과','준비','동작설명','세트구성','마무리'],bgm:'Workout EDM',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'하루 10분으로 뱃살 빼는 확실한 방법...'},
      mental:{icon:'🧘',label:'멘탈/명상',tone:'차분',speaker:'내레이터 95%',narrationRatio:95,structure:['공감','원인분석','해결법','실천가이드','마무리'],bgm:'Meditation',imageStyle:'illustration',duration:'10분',chapters:5,hookExample:'불안과 스트레스에서 벗어나는 방법...'}
    }
  },
  lifestyle: {
    icon:'✨',label:'라이프스타일',color:'#c084fc',gradient:'linear-gradient(135deg,#581c87,#a855f7)',desc:'일상,여행,인테리어',
    subs:{
      travel:{icon:'✈️',label:'여행',tone:'설렘',speaker:'브이로거 60%',narrationRatio:40,structure:['도착','명소','맛집','꿀팁','총평'],bgm:'Tropical House',imageStyle:'cinematic',duration:'10분',chapters:6,hookExample:'이 나라 여행, 100만원이면 일주일...'},
      food:{icon:'🍳',label:'요리/먹방',tone:'편안',speaker:'요리사 70%',narrationRatio:30,structure:['메뉴소개','재료','조리','완성','시식'],bgm:'Jazz/Bossa',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'집에서 5분만에 만드는 미쉐린급 요리...'},
      interior:{icon:'🏠',label:'인테리어',tone:'감성',speaker:'내레이터 80%',narrationRatio:80,structure:['비포','컨셉','변화과정','에프터','비용'],bgm:'Chill Lo-fi',imageStyle:'realistic',duration:'10분',chapters:5,hookExample:'10만원으로 방을 호텔처럼...'}
    }
  },
  commerce: {
    icon:'🛍️',label:'커머스/리뷰',color:'#fb923c',gradient:'linear-gradient(135deg,#7c2d12,#f97316)',desc:'제품리뷰,비교,언박싱',
    subs:{
      review:{icon:'⭐',label:'제품 리뷰',tone:'솔직',speaker:'리뷰어 80%',narrationRatio:60,structure:['첫인상','스펙','장점','단점','총평'],bgm:'Modern Pop',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'사기 전에 이 영상을 꼭 보세요...'},
      comparison:{icon:'⚖️',label:'비교/대결',tone:'객관적',speaker:'내레이터 100%',narrationRatio:100,structure:['후보소개','항목별비교','승자발표','추천'],bgm:'Competitive',imageStyle:'realistic',duration:'10분',chapters:6,hookExample:'아이폰 vs 갤럭시, 최종 승자는...'},
      unboxing:{icon:'📦',label:'언박싱',tone:'기대감',speaker:'리뷰어 90%',narrationRatio:30,structure:['도착','개봉','첫인상','후기','추천'],bgm:'Upbeat Pop',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'역대급 가성비 제품이 도착했습니다...'}
    }
  },
  news: {
    icon:'📰',label:'뉴스/시사',color:'#f87171',gradient:'linear-gradient(135deg,#7f1d1d,#ef4444)',desc:'시사,이슈,분석',
    subs:{
      breaking:{icon:'🔴',label:'속보/이슈',tone:'긴급',speaker:'앵커 100%',narrationRatio:100,structure:['속보도입','사건경위','영향분석','전망','마무리'],bgm:'News Intro',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'방금 터진 이 뉴스...'},
      analysis:{icon:'📊',label:'심층분석',tone:'분석적',speaker:'해설자 90%',narrationRatio:90,structure:['이슈소개','배경','분석','전문가의견','전망'],bgm:'Serious Corporate',imageStyle:'realistic',duration:'15분',chapters:8,hookExample:'언론이 말하지 않는 진짜 이유...'},
      factcheck:{icon:'✅',label:'팩트체크',tone:'객관적',speaker:'내레이터 100%',narrationRatio:100,structure:['주장소개','검증','근거','판정','정리'],bgm:'Neutral',imageStyle:'realistic',duration:'8분',chapters:5,hookExample:'이 뉴스가 사실인지 확인해봤습니다...'}
    }
  }
};
const GENRE_KEYS = Object.keys(GENRE_MAP);

/* ── 톤/문체 옵션 ── */
const TONE_OPTIONS = [
  {id:'novel',label:'소설체',desc:'문학적 표현, 묘사 풍부',icon:'📚'},
  {id:'dramatic',label:'극적체',desc:'대사 중심, 감정 강조',icon:'🎭'},
  {id:'friendly',label:'친근체',desc:'~요 체, 대화하듯',icon:'😊'},
  {id:'explanatory',label:'설명체',desc:'~입니다 체, 정보 전달',icon:'📋'},
  {id:'tense',label:'긴장체',desc:'짧은 문장, 서스펜스',icon:'😰'},
  {id:'humorous',label:'유머체',desc:'재치, 비유, 웃음',icon:'😂'},
];

/* ── 화자 모드 ── */
const SPEAKER_MODES = [
  {total:1,narration:1,characters:0,label:'나레이션 단독',icon:'🎙️'},
  {total:3,narration:1,characters:2,label:'3명 (나레이션+2인)',icon:'👥'},
  {total:4,narration:1,characters:3,label:'4명 (나레이션+3인)',icon:'👥'},
  {total:5,narration:1,characters:4,label:'5명 (나레이션+4인)',icon:'👥'},
];

/* ── 드라마 요소 ── */
const DRAMA_ELEMENTS = [
  {id:'conflict',label:'갈등',icon:'⚡'},{id:'twist',label:'반전',icon:'🔄'},
  {id:'emotion',label:'감동',icon:'😢'},{id:'humor',label:'유머',icon:'😂'},
  {id:'tension',label:'긴장감',icon:'😰'},{id:'romance',label:'로맨스',icon:'💕'},
  {id:'growth',label:'성장',icon:'🌱'},{id:'revenge',label:'복수',icon:'🔥'},
  {id:'tragedy',label:'비극',icon:'💔'},
];

/* ── 창작 모드 ── */
const CREATIVE_MODES = [
  {id:'strict',label:'규칙 준수',desc:'설정을 100% 따름',icon:'📏'},
  {id:'balanced',label:'균형 (권장)',desc:'설정 따르되 AI 재량 허용',icon:'⚖️'},
  {id:'free',label:'자유',desc:'설정은 참고만',icon:'🎨'},
];

/* ── 휴먼 터치 ── */
const HUMAN_TOUCH_ELEMENTS = [
  {id:'experience',label:'개인적 경험',desc:'제작자의 실제 경험담',icon:'💬'},
  {id:'opinion',label:'제작자 의견',desc:'"제 생각에는..." 주관적 의견',icon:'💭'},
  {id:'perspective',label:'관점/프레임',desc:'특정 시각에서 바라보기',icon:'👁️'},
  {id:'educational',label:'교육자 목표',desc:'"기억하셔야 할 것은..."',icon:'🎓'},
];
const HUMAN_TOUCH_LEVELS = [
  {id:'none',label:'없음',value:0},{id:'minimal',label:'최소',value:1},
  {id:'medium',label:'중간 (권장)',value:2},{id:'maximum',label:'최대',value:3},
];

/* ── 콘텐츠 형식 ── */
const CONTENT_FORMATS = [
  {id:'longform',label:'롱폼',desc:'8분 이상',icon:'🎬'},
  {id:'shorts',label:'쇼츠',desc:'1분 이내',icon:'📱'},
];

/* ── 출력 언어 ── */
const OUTPUT_LANGUAGES = [
  {id:'ko',label:'한국어',icon:'🇰🇷'},{id:'en',label:'영어',icon:'🇺🇸'},
  {id:'ja',label:'일본어',icon:'🇯🇵'},{id:'zh',label:'중국어',icon:'🇨🇳'},
  {id:'es',label:'스페인어',icon:'🇪🇸'},{id:'vi',label:'베트남어',icon:'🇻🇳'},
];

/* ── 로그인 ── */
function LoginScreen({onLogin}:{onLogin:()=>void}) {
  const [pw,setPw]=useState('');const [error,setError]=useState('');
  const check=()=>{if(pw==='rani2024!'){localStorage.setItem('ai-factory-auth','true');onLogin();}else setError('비밀번호가 틀렸습니다.');};
  return (<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0a0a1a,#12122a)'}}>
    <div style={{background:'#161630',padding:40,borderRadius:16,textAlign:'center',minWidth:340,border:'1px solid #252550'}}>
      <div style={{fontSize:48,marginBottom:8}}>🎬</div>
      <h1 style={{fontSize:24,marginBottom:4,color:'#fff'}}>AI 콘텐츠 팩토리</h1>
      <p style={{color:'#666',marginBottom:24,fontSize:13}}>영상 제작의 모든 것을 AI로</p>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&check()} placeholder="비밀번호" style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid #252550',background:'#0a0a1a',color:'#fff',fontSize:15,marginBottom:12,boxSizing:'border-box'}} />
      {error&&<p style={{color:'#ef4444',marginBottom:12,fontSize:13}}>{error}</p>}
      <button onClick={check} style={{width:'100%',padding:'12px',borderRadius:8,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontSize:15,border:'none',cursor:'pointer',fontWeight:600}}>로그인</button>
    </div>
  </div>);
}

/* ── 마크다운 렌더러 ── */
function renderMarkdown(text:string){if(!text)return '';return text.replace(/```(\w*)\n([\s\S]*?)```/g,'<pre style="background:#0a0a1a;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid #252550;margin:12px 0;font-size:13px;line-height:1.6"><code>$2</code></pre>').replace(/`([^`]+)`/g,'<code style="background:#1e1e3e;padding:2px 6px;border-radius:4px;font-size:13px;color:#a78bfa">$1</code>').replace(/^### (.+)$/gm,'<h3 style="color:#a78bfa;font-size:15px;margin:18px 0 6px">$1</h3>').replace(/^## (.+)$/gm,'<h2 style="color:#818cf8;font-size:17px;margin:22px 0 8px">$1</h2>').replace(/^# (.+)$/gm,'<h1 style="color:#6366f1;font-size:20px;margin:22px 0 10px">$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e2e8f0">$1</strong>').replace(/\*(.+?)\*/g,'<em style="color:#94a3b8">$1</em>').replace(/^---$/gm,'<hr style="border:none;border-top:1px solid #252550;margin:14px 0"/>').replace(/^(\d+)\. (.+)$/gm,'<div style="padding:3px 0 3px 8px"><span style="color:#6366f1;font-weight:700;margin-right:6px">$1.</span>$2</div>').replace(/^[-•] (.+)$/gm,'<div style="padding:3px 0 3px 8px"><span style="color:#6366f1;margin-right:6px">●</span>$1</div>').replace(/^> (.+)$/gm,'<div style="border-left:3px solid #4f46e5;padding:6px 12px;margin:6px 0;background:rgba(79,70,229,0.06);border-radius:0 6px 6px 0;color:#a5b4fc">$1</div>').replace(/\n\n/g,'<div style="height:10px"></div>').replace(/\n/g,'<br/>');}

/* ── 워크플로우 ── */
const WORKFLOW: Record<string,{id:string;icon:string;label:string}[]> = {
  준비: [
    {id:'overview',icon:'📊',label:'프로젝트 개요'},
    {id:'genre-select',icon:'🎭',label:'장르 선택'},
    {id:'settings',icon:'⚙️',label:'대본 설정'},
    {id:'topic-title',icon:'💡',label:'주제/제목'},
    {id:'synopsis',icon:'📖',label:'시놉시스'},
    {id:'script',icon:'📝',label:'대본 생성'},
    {id:'edit',icon:'✨',label:'대본 편집'},
    {id:'expand',icon:'📐',label:'대본 확장'},
    {id:'guidelines',icon:'✅',label:'가이드라인'},
  ],
  분석: [
    {id:'characters',icon:'👥',label:'캐릭터 분석'},
    {id:'scenes',icon:'🎬',label:'장면 분할'},
    {id:'bgm',icon:'🎵',label:'BGM 추천'},
    {id:'analysis',icon:'🎥',label:'영상 분석'},
  ],
  제작: [
    {id:'media',icon:'🎨',label:'미디어 생성'},
    {id:'subtitle',icon:'💬',label:'자막 생성'},
  ],
  마케팅: [
    {id:'market',icon:'🔍',label:'경쟁·SEO'},
    {id:'ab-test',icon:'🧪',label:'제목 A/B'},
    {id:'series',icon:'📚',label:'시리즈 기획'},
    {id:'calendar',icon:'📅',label:'캘린더'},
    {id:'community',icon:'💬',label:'커뮤니티'},
    {id:'shopping',icon:'🛒',label:'쇼핑 콘텐츠'},
  ],
  배포: [
    {id:'publish',icon:'📄',label:'설명·챕터'},
    {id:'upload',icon:'🚀',label:'업로드 패키지'},
  ],
};
const ALL_TABS = Object.values(WORKFLOW).flat();

/* ══════════════════════════════════════════════
   메인 컴포넌트
   ══════════════════════════════════════════════ */
export default function Home() {
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState('overview');
  const [loading,setLoading]=useState(false);
  const [showKeys,setShowKeys]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [results,setResults]=useState<Record<string,string>>({});
  const [projectName,setProjectName]=useState('새 프로젝트');

  // API 키
  const [geminiKey,setGeminiKey]=useState('');
  const [openaiKey,setOpenaiKey]=useState('');
  const [claudeKey,setClaudeKey]=useState('');
  const [youtubeKey,setYoutubeKey]=useState('');
  const [provider,setProvider]=useState('gemini');

  // 기본 입력
  const [topic,setTopic]=useState('');
  const [platform,setPlatform]=useState('youtube');
  const [category,setCategory]=useState('교육/정보');
  const [duration,setDuration]=useState('8분');
  const [audience,setAudience]=useState('일반');
  const [videoUrl,setVideoUrl]=useState('');
  const [scriptText,setScriptText]=useState('');
  const [keyword,setKeyword]=useState('');
  const [titles,setTitles]=useState('');
  const [targetLang,setTargetLang]=useState('en');
  const [productPrice,setProductPrice]=useState('');
  const [productFeatures,setProductFeatures]=useState('');
  const [calendarWeeks,setCalendarWeeks]=useState('2');
  const [channelName,setChannelName]=useState('');
  const [shopInput,setShopInput]=useState('');
  const [scriptStyle,setScriptStyle]=useState('review');
  const [chapterCount,setChapterCount]=useState('7');
  const [imageStyle,setImageStyle]=useState('realistic');
  const [expandLength,setExpandLength]=useState('15000');

  // 1단계 신규: 장르 + 설정
  const [genre,setGenre]=useState('');
  const [subGenre,setSubGenre]=useState('');
  const [hoveredGenre,setHoveredGenre]=useState('');
  const [hoveredSub,setHoveredSub]=useState('');
  const [toneId,setToneId]=useState('explanatory');
  const [speakerMode,setSpeakerMode]=useState(3);
  const [narrationRatio,setNarrationRatio]=useState(60);
  const [dramaElements,setDramaElements]=useState<string[]>([]);
  const [humanTouchElements,setHumanTouchElements]=useState<string[]>(['experience','opinion']);
  const [humanTouchLevel,setHumanTouchLevel]=useState('medium');
  const [creativeMode,setCreativeMode]=useState('balanced');
  const [contentFormat,setContentFormat]=useState('longform');
  const [outputLang,setOutputLang]=useState('ko');
  const [scriptInputMode,setScriptInputMode]=useState('ai');

  // 제목/시놉시스 선택
  const [generatedTitles,setGeneratedTitles]=useState<string[]>([]);
  const [selectedTitle,setSelectedTitle]=useState('');
  const [generatedSynopses,setGeneratedSynopses]=useState<string[]>([]);
  const [selectedSynopsis,setSelectedSynopsis]=useState(-1);
  const [synopsisConfirmed,setSynopsisConfirmed]=useState(false);
  const [suggestedTopics,setSuggestedTopics]=useState<string[]>([]);

  // 모드
  const [editMode,setEditMode]=useState('polish');
  const [analysisMode,setAnalysisMode]=useState('video');
  const [marketMode,setMarketMode]=useState('competitors');
  const [publishMode,setPublishMode]=useState('description');
  const [subtitleMode,setSubtitleMode]=useState('subtitles');
  const [mediaMode,setMediaMode]=useState('tts');

  const result=results[tab]||'';
  const setResult=(v:string)=>setResults(p=>({...p,[tab]:v}));
  const handleReset=()=>setResults(p=>({...p,[tab]:''}));

  useEffect(()=>{
    if(localStorage.getItem('ai-factory-auth')==='true')setAuthed(true);
    const s=localStorage.getItem('ai-factory-keys');
    if(s){const k=JSON.parse(s);setGeminiKey(k.gemini||'');setOpenaiKey(k.openai||'');setClaudeKey(k.claude||'');setYoutubeKey(k.youtube||'');}
    const p=localStorage.getItem('ai-factory-project');if(p)setProjectName(p);
    const g=localStorage.getItem('ai-factory-genre');
    if(g){const gd=JSON.parse(g);setGenre(gd.genre||'');setSubGenre(gd.sub||'');}
    const st=localStorage.getItem('ai-factory-settings');
    if(st){const sd=JSON.parse(st);setToneId(sd.toneId||'explanatory');setSpeakerMode(sd.speakerMode||3);setNarrationRatio(sd.narrationRatio||60);setDramaElements(sd.dramaElements||[]);setHumanTouchElements(sd.humanTouchElements||['experience','opinion']);setHumanTouchLevel(sd.humanTouchLevel||'medium');setCreativeMode(sd.creativeMode||'balanced');setContentFormat(sd.contentFormat||'longform');setOutputLang(sd.outputLang||'ko');}
  },[]);

  const saveSettings=useCallback(()=>{
    localStorage.setItem('ai-factory-settings',JSON.stringify({toneId,speakerMode,narrationRatio,dramaElements,humanTouchElements,humanTouchLevel,creativeMode,contentFormat,outputLang}));
  },[toneId,speakerMode,narrationRatio,dramaElements,humanTouchElements,humanTouchLevel,creativeMode,contentFormat,outputLang]);

  useEffect(()=>{saveSettings();},[saveSettings]);

  const applyGenreSettings=useCallback((gk:string,sk:string)=>{
    const cat=GENRE_MAP[gk];if(!cat)return;const sub=cat.subs[sk];if(!sub)return;
    setGenre(gk);setSubGenre(sk);setImageStyle(sub.imageStyle);setDuration(sub.duration);
    setChapterCount(String(sub.chapters));setNarrationRatio(sub.narrationRatio);
    localStorage.setItem('ai-factory-genre',JSON.stringify({genre:gk,sub:sk}));
  },[]);

  if(!authed)return <LoginScreen onLogin={()=>setAuthed(true)}/>;

  const saveKeys=()=>{localStorage.setItem('ai-factory-keys',JSON.stringify({gemini:geminiKey,openai:openaiKey,claude:claudeKey,youtube:youtubeKey}));alert('저장됨!');setShowKeys(false);};
  const getKey=()=>provider==='gemini'?geminiKey:provider==='openai'?openaiKey:provider==='claude'?claudeKey:geminiKey;
  const logout=()=>{localStorage.removeItem('ai-factory-auth');setAuthed(false);};
  const noKey=()=>{setResult('❌ API 키를 먼저 설정하세요.');return true;};

  const callApi=async(endpoint:string,body:any)=>{
    setLoading(true);setResult('');
    try{
      const res=await fetch('/api/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,aiProvider:provider,apiKey:getKey()})});
      const data=await res.json();
      if(data.error)setResult('❌ '+data.error);else setResult(data.result||data.text||data.content||JSON.stringify(data,null,2));
    }catch(e:any){setResult('❌ '+e.message);}
    setLoading(false);
  };

  const callApiRaw=async(endpoint:string,body:any):Promise<string>=>{
    try{
      const res=await fetch('/api/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,aiProvider:provider,apiKey:getKey()})});
      const data=await res.json();
      if(data.error)return '❌ '+data.error;
      return data.result||data.text||data.content||JSON.stringify(data,null,2);
    }catch(e:any){return '❌ '+e.message;}
  };

  // ── 프롬프트 빌더 ──
  const buildScriptPrompt=()=>{
    const gi=genre&&subGenre&&GENRE_MAP[genre]?.subs[subGenre];
    const toneLabel=TONE_OPTIONS.find(t=>t.id===toneId)?.label||'설명체';
    const sm=SPEAKER_MODES.find(m=>m.total===speakerMode);
    const htElems=humanTouchElements.map(id=>HUMAN_TOUCH_ELEMENTS.find(h=>h.id===id)?.label).filter(Boolean);
    const htLvl=HUMAN_TOUCH_LEVELS.find(l=>l.id===humanTouchLevel);
    const deElems=dramaElements.map(id=>DRAMA_ELEMENTS.find(d=>d.id===id)?.label).filter(Boolean);
    const cmLabel=CREATIVE_MODES.find(c=>c.id===creativeMode)?.label||'균형';
    const langLabel=OUTPUT_LANGUAGES.find(l=>l.id===outputLang)?.label||'한국어';

    let p=`당신은 유튜브 전문 대본 작가입니다.\n\n`;
    if(gi)p+=`[장르] ${GENRE_MAP[genre].label} > ${gi.label}\n`;
    p+=`[주제] ${topic}\n[제목] ${selectedTitle||'(자동 생성)'}\n`;
    p+=`[톤/문체] ${toneLabel}\n`;
    p+=`[화자 구성] ${sm?sm.label:'나레이션+등장인물'}\n`;
    p+=`[나레이션:대사 비율] 나레이션 ${narrationRatio}% / 대사 ${100-narrationRatio}%\n`;
    p+=`[챕터 수] ${chapterCount}개\n[영상 길이] ${duration}\n`;
    p+=`[플랫폼] ${platform}\n[타깃] ${audience}\n[출력 언어] ${langLabel}\n`;
    if(contentFormat==='shorts')p+=`[형식] 쇼츠 (1분 이내, 빠른 전개)\n`;
    if(deElems.length>0)p+=`[드라마 요소] ${deElems.join(', ')}\n`;
    if(htElems.length>0&&humanTouchLevel!=='none')p+=`[휴먼 터치] ${htElems.join(', ')} (강도: ${htLvl?.label})\n`;
    p+=`[창작 모드] ${cmLabel}\n`;
    if(gi)p+=`[대본 구조] ${gi.structure.join(' → ')}\n[BGM 무드] ${gi.bgm}\n`;
    p+=`\n--- 지시사항 ---\n`;
    p+=`1. 각 챕터를 [챕터1: 제목], [챕터2: 제목] 형태로 명확히 구분\n`;
    p+=`2. 화자를 [나레이션], [인물1:이름], [인물2:이름] 태그로 구분\n`;
    p+=`3. 화면 지시를 [화면: 설명] 태그로 표시\n`;
    p+=`4. 효과음/BGM을 [효과음: 설명], [BGM: 변경] 태그로 표시\n`;
    p+=`5. 강조 자막을 [자막강조: 텍스트] 태그로 표시\n`;
    if(humanTouchLevel==='medium'||humanTouchLevel==='maximum'){
      p+=`6. 휴먼 터치 삽입:\n`;
      if(humanTouchElements.includes('experience'))p+=`   - 도입부에 제작자 경험담 1~2문장 (예: "제가 이걸 처음 알았을 때...")\n`;
      if(humanTouchElements.includes('opinion'))p+=`   - 핵심 내용 후 의견 삽입 (예: "솔직히 이 부분은 정말 놀랍습니다")\n`;
      if(humanTouchElements.includes('perspective'))p+=`   - 관점 제시 (예: "만약 당신이 그 상황이었다면?")\n`;
      if(humanTouchElements.includes('educational'))p+=`   - 마무리에 교육적 정리 (예: "꼭 기억하셔야 할 것은...")\n`;
    }
    if(creativeMode==='strict')p+=`\n⚠️ 위 설정을 100% 엄격히 따르세요.\n`;
    else if(creativeMode==='free')p+=`\n💡 위 설정은 참고만 하고, 더 나은 방향이면 자유롭게 변경하세요.\n`;
    if(synopsisConfirmed&&selectedSynopsis>=0&&generatedSynopses[selectedSynopsis])p+=`\n[확정된 시놉시스]\n${generatedSynopses[selectedSynopsis]}\n\n위 시놉시스를 기반으로 대본을 작성하세요.\n`;
    return p;
  };

  // ── 핸들러 ──
  const handleSuggestTopics=async()=>{
    if(!getKey()){noKey();return;}
    setLoading(true);setResult('');
    const r=await callApiRaw('suggest-topics',{genre:genre?GENRE_MAP[genre]?.label:'',subGenre:subGenre?GENRE_MAP[genre]?.subs[subGenre]?.label:'',platform});
    const topics=r.split('\n').filter(l=>l.includes('[TOPIC_')).map(l=>l.replace(/\[TOPIC_\d+\]\s*/,'').trim());
    if(topics.length>0)setSuggestedTopics(topics);else{setSuggestedTopics([]);setResult(r);}
    setLoading(false);
  };

  const handleGenerateTitles=async(style?:string)=>{
    if(!getKey()){noKey();return;}
    setLoading(true);setResult('');
    const r=await callApiRaw('generate-titles',{topic,genre:genre?GENRE_MAP[genre]?.label:'',subGenre:subGenre?GENRE_MAP[genre]?.subs[subGenre]?.label:'',tone:TONE_OPTIONS.find(t=>t.id===toneId)?.label,platform,style:style||''});
    const tList=r.split('\n').filter(l=>l.includes('[TITLE_')).map(l=>l.replace(/\[TITLE_\d+\]\s*/,'').trim());
    if(tList.length>0)setGeneratedTitles(tList);else{setGeneratedTitles([]);setResult(r);}
    setLoading(false);
  };

  const handleGenerateSynopses=async()=>{
    if(!topic){setResult('❌ 주제를 입력하세요.');return;}if(!getKey()){noKey();return;}
    setLoading(true);setResult('');setSynopsisConfirmed(false);setSelectedSynopsis(-1);
    const arr:string[]=[];
    for(let i=0;i<5;i++){
      const gi=genre&&subGenre&&GENRE_MAP[genre]?.subs[subGenre];
      const prompt=`시놉시스 ${i+1}/5를 작성하세요. 다른 시놉시스와 차별화된 독특한 접근이어야 합니다.

주제: ${topic}
${selectedTitle?'제목: '+selectedTitle:''}
${gi?'장르: '+GENRE_MAP[genre].label+' > '+gi.label:''}
${gi?'구조: '+gi.structure.join(' → '):''}
챕터: ${chapterCount}개
${i===0?'접근: 정통 스토리라인':i===1?'접근: 반전 중심':i===2?'접근: 감성/감동 중심':i===3?'접근: 긴장감/서스펜스 중심':'접근: 독창적/실험적'}

다음을 포함하세요:
1. 핵심 메시지 (한 줄)
2. 전체 스토리라인 (3~5줄)
3. 챕터별 구성 (각 챕터 제목+내용 2줄)
4. 등장인물 (이름, 역할, 성격)
5. 감정 곡선
6. 차별화 포인트`;
      const r=await callApiRaw('generate-synopsis',{topic,genre:genre?GENRE_MAP[genre]?.label:'',chapterCount:parseInt(chapterCount),customPrompt:prompt});
      arr.push(r);
    }
    setGeneratedSynopses(arr);setResult('✅ 시놉시스 5개 생성 완료! 아래에서 선택하세요.');
    setLoading(false);
  };

  const handleScript=()=>{if(!topic){setResult('❌ 주제를 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('generate-script',{topic,platform,category,duration,audience,customPrompt:buildScriptPrompt()});};
  const handleEdit=()=>{if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}if(!getKey()){noKey();return;}if(editMode==='polish')callApi('polish-script',{script:scriptText,platform});else if(editMode==='rewrite')callApi('rewrite-script',{script:scriptText,platform,style:'트렌디'});else callApi('translate-script',{script:scriptText,targetLanguage:targetLang,platform});};
  const handleGuidelines=()=>{if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('check-guidelines',{script:scriptText,platform});};
  const handleAnalysis=()=>{if(!videoUrl){setResult('❌ URL을 입력하세요.');return;}if(!getKey()){noKey();return;}if(analysisMode==='video')callApi('analyze-video',{url:videoUrl,platform});else callApi('structure-analysis',{url:videoUrl,platform});};
  const handleMarket=()=>{if(!keyword){setResult('❌ 키워드를 입력하세요.');return;}if(!getKey()){noKey();return;}if(marketMode==='competitors')callApi('compare-competitors',{keyword,platform});else if(marketMode==='seo')callApi('seo-analysis',{keyword,platform});else callApi('trends',{keyword,platform});};
  const handleSeries=()=>{if(!topic){setResult('❌ 주제를 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('plan-series',{topic,platform,episodeCount:5});};
  const handleCommunity=()=>{if(!topic){setResult('❌ 주제를 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('community-post',{topic,platform});};
  const handlePublish=()=>{if(!getKey()){noKey();return;}if(publishMode==='description'){if(!topic){setResult('❌ 주제를 입력하세요.');return;}callApi('generate-description',{title:topic,platform});}else if(publishMode==='chapters'){if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}callApi('generate-chapters',{script:scriptText});}else{if(!topic){setResult('❌ 주제를 입력하세요.');return;}callApi('upload-checklist',{title:topic,platform});}};
  const handleAbTest=()=>{if(!titles){setResult('❌ 제목을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('title-ab-test',{titles:titles.split('\n').filter((t:string)=>t.trim()),topic,platform});};
  const handleCalendar=()=>{if(!topic){setResult('❌ 주제를 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('content-calendar',{topic,platform,weeks:parseInt(calendarWeeks),channelName});};
  const handleSubtitle=()=>{if(!videoUrl){setResult('❌ URL을 입력하세요.');return;}if(!getKey()){noKey();return;}if(subtitleMode==='subtitles')callApi('extract-subtitles',{url:videoUrl});else callApi('download-video',{url:videoUrl,platform});};
  const handleShopping=()=>{if(!shopInput){setResult('❌ 입력이 필요합니다.');return;}if(!getKey()){noKey();return;}callApi('shopping-content',{productName:shopInput,productPrice,productFeatures,platform,scriptStyle});};
  const handleMedia=()=>{if(!getKey()){noKey();return;}if(mediaMode==='tts'){if(!scriptText){setResult('❌ 텍스트를 입력하세요.');return;}callApi('tts-generate',{text:scriptText});}else{if(!topic){setResult('❌ 제목을 입력하세요.');return;}callApi('generate-thumbnail',{title:topic,style:platform});}};
  const handleExpand=()=>{if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('expand-script',{script:scriptText,targetLength:expandLength});};
  const handleCharacters=()=>{if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('analyze-characters',{script:scriptText});};
  const handleScenes=()=>{if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('split-scenes',{script:scriptText,imageStyle});};
  const handleBgm=()=>{if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('recommend-bgm',{script:scriptText,genre:genre?GENRE_MAP[genre]?.label:''});};
  const handleUpload=()=>{if(!topic){setResult('❌ 제목을 입력하세요.');return;}if(!getKey()){noKey();return;}callApi('upload-package',{title:topic,script:scriptText,category});};
  const handleFileUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=(ev)=>{setScriptText(ev.target?.result as string);setResult('✅ 파일 업로드 완료: '+file.name);};reader.readAsText(file);};

  /* ── UI 헬퍼 ── */
  const S={
    btn:(label:string,onClick:()=>void,color='#4f46e5')=><button onClick={onClick} disabled={loading} style={{padding:'10px 20px',borderRadius:8,background:loading?'#333':color,color:'#fff',border:'none',cursor:loading?'wait':'pointer',fontSize:14,fontWeight:600,width:'100%',marginTop:8,transition:'all 0.2s'}}>{loading?'⏳ 처리 중...':label}</button>,
    reset:()=><button onClick={handleReset} style={{padding:'8px',borderRadius:6,background:'transparent',color:'#666',border:'1px solid #333',cursor:'pointer',fontSize:12,width:'100%',marginTop:4}}>🗑️ 초기화</button>,
    input:(val:string,set:(v:string)=>void,ph:string)=><input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #252550',background:'#0d0d20',color:'#fff',fontSize:13,boxSizing:'border-box',marginBottom:6,outline:'none'}}/>,
    area:(val:string,set:(v:string)=>void,ph:string,rows=4)=><textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #252550',background:'#0d0d20',color:'#fff',fontSize:13,boxSizing:'border-box',marginBottom:6,resize:'vertical',outline:'none'}}/>,
    sel:(val:string,set:(v:string)=>void,opts:{v:string;l:string}[])=><select value={val} onChange={e=>set(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #252550',background:'#0d0d20',color:'#fff',fontSize:13,marginBottom:6}}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>,
    label:(t:string)=><p style={{color:'#888',marginBottom:3,marginTop:8,fontSize:12,fontWeight:500}}>{t}</p>,
    mini:(modes:{id:string;label:string}[],cur:string,set:(v:string)=>void)=><div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>{modes.map(m=><button key={m.id} onClick={()=>set(m.id)} style={{padding:'5px 12px',borderRadius:16,border:'none',background:cur===m.id?'#4f46e5':'#1a1a35',color:cur===m.id?'#fff':'#888',cursor:'pointer',fontSize:12,transition:'all 0.2s'}}>{m.label}</button>)}</div>,
  };

  const completedTabs=ALL_TABS.filter(t=>results[t.id]&&!results[t.id].startsWith('❌')).map(t=>t.id);
  if(genre&&subGenre&&!completedTabs.includes('genre-select'))completedTabs.push('genre-select');
  if(toneId&&speakerMode&&!completedTabs.includes('settings'))completedTabs.push('settings');
  if(selectedTitle&&!completedTabs.includes('topic-title'))completedTabs.push('topic-title');
  if(synopsisConfirmed&&!completedTabs.includes('synopsis'))completedTabs.push('synopsis');
  const totalSteps=ALL_TABS.length;const doneSteps=completedTabs.length;

  /* ════════════════════════════════════════
     탭 렌더링
     ════════════════════════════════════════ */
  function renderTab(){
    switch(tab){

    /* ── 프로젝트 개요 ── */
    case 'overview': return(<div>
      <h2 style={{fontSize:18,margin:'0 0 16px'}}>📊 프로젝트 개요</h2>
      <div style={{background:'#0d0d20',borderRadius:12,padding:16,border:'1px solid #252550',marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div><p style={{color:'#888',fontSize:11,margin:0}}>프로젝트명</p>
            <input value={projectName} onChange={e=>{setProjectName(e.target.value);localStorage.setItem('ai-factory-project',e.target.value)}} style={{background:'transparent',border:'none',color:'#fff',fontSize:16,fontWeight:600,padding:0,outline:'none',width:200}}/></div>
          <div style={{display:'flex',gap:8}}>
            <div style={{textAlign:'center',background:'#1a1a35',borderRadius:8,padding:'8px 16px'}}><p style={{color:'#4ade80',fontSize:20,fontWeight:700,margin:0}}>{doneSteps}</p><p style={{color:'#888',fontSize:10,margin:0}}>완료</p></div>
            <div style={{textAlign:'center',background:'#1a1a35',borderRadius:8,padding:'8px 16px'}}><p style={{color:'#f59e0b',fontSize:20,fontWeight:700,margin:0}}>{totalSteps-doneSteps}</p><p style={{color:'#888',fontSize:10,margin:0}}>남은 단계</p></div>
          </div>
        </div>
        <div style={{background:'#1a1a35',borderRadius:6,height:8,overflow:'hidden'}}><div style={{background:'linear-gradient(90deg,#4f46e5,#7c3aed)',height:'100%',width:`${(doneSteps/totalSteps)*100}%`,borderRadius:6,transition:'width 0.5s'}}/></div>
        <p style={{color:'#888',fontSize:11,marginTop:4,textAlign:'right'}}>{Math.round((doneSteps/totalSteps)*100)}% 완료</p>
      </div>
      {genre&&subGenre&&GENRE_MAP[genre]?.subs[subGenre]&&(<div style={{background:'#0d0d20',borderRadius:12,padding:14,border:'1px solid '+GENRE_MAP[genre].color+'30',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:28}}>{GENRE_MAP[genre].subs[subGenre].icon}</span>
          <div><p style={{fontSize:13,fontWeight:600,color:'#fff',margin:0}}>{GENRE_MAP[genre].label} → {GENRE_MAP[genre].subs[subGenre].label}</p>
            <p style={{fontSize:11,color:GENRE_MAP[genre].color,margin:0}}>톤: {TONE_OPTIONS.find(t=>t.id===toneId)?.label} | 화자: {speakerMode}명 | 나레이션 {narrationRatio}%</p></div>
          <button onClick={()=>setTab('genre-select')} style={{marginLeft:'auto',padding:'5px 10px',borderRadius:6,background:'#1a1a35',color:'#888',border:'1px solid #333',cursor:'pointer',fontSize:11}}>변경</button>
        </div>
      </div>)}
      {selectedTitle&&(<div style={{background:'#0d0d20',borderRadius:12,padding:14,border:'1px solid #4f46e530',marginBottom:12}}>
        <p style={{color:'#888',fontSize:11,margin:'0 0 4px'}}>선택된 제목</p>
        <p style={{color:'#fff',fontSize:14,fontWeight:600,margin:0}}>{selectedTitle}</p>
      </div>)}
      <h3 style={{fontSize:14,color:'#888',margin:'16px 0 8px'}}>⚡ 워크플로우</h3>
      {Object.entries(WORKFLOW).map(([group,items])=>(<div key={group} style={{marginBottom:12}}>
        <p style={{color:'#666',fontSize:11,fontWeight:600,margin:'0 0 4px',textTransform:'uppercase'}}>{group}</p>
        {items.map((item,i)=>(<div key={item.id} onClick={()=>setTab(item.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:6,cursor:'pointer',background:tab===item.id?'rgba(79,70,229,0.15)':'transparent',marginBottom:2}}>
          <span style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,background:completedTabs.includes(item.id)?'#4ade80':'#333',color:completedTabs.includes(item.id)?'#000':'#fff'}}>{completedTabs.includes(item.id)?'✓':(i+1)}</span>
          <span style={{fontSize:13,color:completedTabs.includes(item.id)?'#4ade80':'#ccc'}}>{item.icon} {item.label}</span>
        </div>))}
      </div>))}
    </div>);

    /* ── 장르 선택 ── */
    case 'genre-select': {
      const selectedCat=GENRE_MAP[genre];const selectedSub=selectedCat?.subs[subGenre];
      return(<div>
        <h2 style={{fontSize:18,margin:'0 0 6px'}}>🎭 장르 선택</h2>
        <p style={{color:'#888',fontSize:12,marginBottom:16}}>카테고리 → 서브장르 순서로 선택하세요</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:16}}>
          {GENRE_KEYS.map(key=>{const g=GENRE_MAP[key];const isSel=genre===key;const isHov=hoveredGenre===key;
            return(<div key={key} onClick={()=>{setGenre(key);setSubGenre('');}} onMouseEnter={()=>setHoveredGenre(key)} onMouseLeave={()=>setHoveredGenre('')}
              style={{background:isSel?g.gradient:isHov?'rgba(255,255,255,0.05)':'#0d0d20',border:'2px solid '+(isSel?g.color:isHov?g.color+'60':'#252550'),borderRadius:12,padding:'14px 8px',textAlign:'center',cursor:'pointer',transition:'all 0.25s',transform:isSel?'scale(1.02)':'scale(1)',boxShadow:isSel?'0 4px 20px '+g.color+'30':'none',position:'relative' as const}}>
              {isSel&&<div style={{position:'absolute',top:6,right:6,width:18,height:18,borderRadius:'50%',background:g.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#000',fontWeight:700}}>✓</div>}
              <div style={{fontSize:28,marginBottom:4}}>{g.icon}</div>
              <div style={{fontSize:11,fontWeight:600,color:isSel?'#fff':isHov?g.color:'#aaa'}}>{g.label}</div>
              <div style={{fontSize:9,color:isSel?'rgba(255,255,255,0.7)':'#555',marginTop:2}}>{Object.keys(g.subs).length}개</div>
            </div>);})}
        </div>
        {genre&&GENRE_MAP[genre]&&(<div style={{background:'#0d0d20',borderRadius:12,padding:16,border:'1px solid '+GENRE_MAP[genre].color+'30',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{fontSize:20}}>{GENRE_MAP[genre].icon}</span>
            <div><h3 style={{fontSize:15,margin:0,color:GENRE_MAP[genre].color}}>{GENRE_MAP[genre].label}</h3>
              <p style={{fontSize:11,color:'#666',margin:0}}>{GENRE_MAP[genre].desc}</p></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {Object.entries(GENRE_MAP[genre].subs).map(([key,sub])=>{const isSel=subGenre===key;const isHov=hoveredSub===key;
              return(<div key={key} onClick={()=>applyGenreSettings(genre,key)} onMouseEnter={()=>setHoveredSub(key)} onMouseLeave={()=>setHoveredSub('')}
                style={{background:isSel?GENRE_MAP[genre].gradient:isHov?GENRE_MAP[genre].color+'10':'#161630',border:'1.5px solid '+(isSel?GENRE_MAP[genre].color:isHov?GENRE_MAP[genre].color+'40':'#252550'),borderRadius:10,padding:12,cursor:'pointer',transition:'all 0.2s',transform:isSel?'scale(1.02)':'scale(1)'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span style={{fontSize:20}}>{sub.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,color:isSel?'#fff':GENRE_MAP[genre].color}}>{sub.label}</span>
                  {isSel&&<span style={{marginLeft:'auto',fontSize:9,background:GENRE_MAP[genre].color,color:'#000',padding:'1px 6px',borderRadius:8,fontWeight:700}}>선택됨</span>}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                  <span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'rgba(255,255,255,0.08)',color:'#aaa'}}>🎙️ {sub.speaker}</span>
                  <span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'rgba(255,255,255,0.08)',color:'#aaa'}}>🎵 {sub.bgm}</span>
                </div>
                <div style={{fontSize:10,color:isSel?'rgba(255,255,255,0.8)':'#555',marginTop:4,fontStyle:'italic'}}>"{sub.hookExample.slice(0,35)}..."</div>
              </div>);})}
          </div>
        </div>)}
        {selectedSub&&(<div style={{background:'#0d0d20',borderRadius:12,padding:16,border:'1px solid '+selectedCat!.color+'40'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{fontSize:24}}>{selectedSub.icon}</span>
            <div><h3 style={{fontSize:16,margin:0,color:'#fff'}}>{selectedCat!.label} → {selectedSub.label}</h3>
              <p style={{fontSize:11,color:selectedCat!.color,margin:0}}>자동 세팅 적용됨</p></div>
            <button onClick={()=>setTab('settings')} style={{marginLeft:'auto',padding:'6px 14px',borderRadius:8,background:selectedCat!.gradient,color:'#fff',border:'none',cursor:'pointer',fontSize:12,fontWeight:600}}>→ 대본 설정</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
            {[{l:'구조',v:selectedSub.structure.join('→'),c:'#a78bfa'},{l:'BGM',v:selectedSub.bgm,c:'#f472b6'},{l:'이미지',v:selectedSub.imageStyle,c:'#22d3ee'}].map(x=>(<div key={x.l} style={{background:'#0a0a1a',borderRadius:8,padding:'6px 10px'}}><p style={{fontSize:10,color:'#666',margin:0}}>{x.l}</p><p style={{fontSize:11,color:x.c,margin:0,fontWeight:600}}>{x.v}</p></div>))}
          </div>
        </div>)}
      </div>);
    }

    /* ── 대본 설정 (신규) ── */
    case 'settings': return(<div>
      <h2 style={{fontSize:18,margin:'0 0 12px'}}>⚙️ 대본 설정</h2>
      <p style={{color:'#888',fontSize:12,marginBottom:16}}>트파 스타일 세부 설정</p>

      {/* 콘텐츠 형식 */}
      {S.label('📐 콘텐츠 형식')}
      <div style={{display:'flex',gap:8,marginBottom:12}}>{CONTENT_FORMATS.map(f=>(<div key={f.id} onClick={()=>setContentFormat(f.id)} style={{flex:1,padding:'10px',borderRadius:8,background:contentFormat===f.id?'#4f46e5':'#0d0d20',border:'1px solid '+(contentFormat===f.id?'#4f46e5':'#252550'),cursor:'pointer',textAlign:'center'}}>
        <div style={{fontSize:20}}>{f.icon}</div><div style={{fontSize:12,color:'#fff',fontWeight:600}}>{f.label}</div><div style={{fontSize:10,color:'#888'}}>{f.desc}</div>
      </div>))}</div>

      {/* 출력 언어 */}
      {S.label('🌐 출력 언어')}
      <div style={{display:'flex',gap:4,marginBottom:12,flexWrap:'wrap'}}>{OUTPUT_LANGUAGES.map(l=>(<button key={l.id} onClick={()=>setOutputLang(l.id)} style={{padding:'5px 12px',borderRadius:16,border:'none',background:outputLang===l.id?'#4f46e5':'#1a1a35',color:outputLang===l.id?'#fff':'#888',cursor:'pointer',fontSize:12}}>{l.icon} {l.label}</button>))}</div>

      {/* 톤/문체 */}
      {S.label('✍️ 톤/문체')}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>{TONE_OPTIONS.map(t=>(<div key={t.id} onClick={()=>setToneId(t.id)} style={{padding:'8px',borderRadius:8,background:toneId===t.id?'#4f46e5':'#0d0d20',border:'1px solid '+(toneId===t.id?'#4f46e5':'#252550'),cursor:'pointer',textAlign:'center'}}>
        <div style={{fontSize:16}}>{t.icon}</div><div style={{fontSize:11,color:'#fff',fontWeight:600}}>{t.label}</div><div style={{fontSize:9,color:'#888'}}>{t.desc}</div>
      </div>))}</div>

      {/* 화자 모드 */}
      {S.label('🎙️ 화자 모드')}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6,marginBottom:12}}>{SPEAKER_MODES.map(m=>(<div key={m.total} onClick={()=>setSpeakerMode(m.total)} style={{padding:'10px',borderRadius:8,background:speakerMode===m.total?'#4f46e5':'#0d0d20',border:'1px solid '+(speakerMode===m.total?'#4f46e5':'#252550'),cursor:'pointer',textAlign:'center'}}>
        <div style={{fontSize:16}}>{m.icon}</div><div style={{fontSize:12,color:'#fff',fontWeight:600}}>{m.label}</div>
      </div>))}</div>

      {/* 나레이션:대사 비율 */}
      {S.label('📊 나레이션:대사 비율')}
      <div style={{background:'#0d0d20',borderRadius:8,padding:12,marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
          <span style={{fontSize:12,color:'#60a5fa'}}>🎙️ 나레이션 {narrationRatio}%</span>
          <span style={{fontSize:12,color:'#f472b6'}}>💬 대사 {100-narrationRatio}%</span>
        </div>
        <input type="range" min={0} max={100} step={10} value={narrationRatio} onChange={e=>setNarrationRatio(parseInt(e.target.value))} style={{width:'100%',accentColor:'#4f46e5'}}/>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
          {[0,20,40,60,80,100].map(v=>(<span key={v} style={{fontSize:9,color:narrationRatio===v?'#4f46e5':'#555'}}>{v}%</span>))}
        </div>
      </div>

      {/* 드라마 요소 */}
      {S.label('🎭 드라마적 요소 (다중 선택)')}
      <div style={{display:'flex',gap:4,marginBottom:12,flexWrap:'wrap'}}>{DRAMA_ELEMENTS.map(d=>{const sel=dramaElements.includes(d.id);return(<button key={d.id} onClick={()=>setDramaElements(sel?dramaElements.filter(x=>x!==d.id):[...dramaElements,d.id])} style={{padding:'5px 10px',borderRadius:16,border:sel?'1px solid #4f46e5':'1px solid #333',background:sel?'#4f46e520':'transparent',color:sel?'#a78bfa':'#888',cursor:'pointer',fontSize:11}}>{d.icon} {d.label}</button>);})}</div>

      {/* 휴먼 터치 */}
      {S.label('💬 휴먼 터치')}
      <div style={{background:'#0d0d20',borderRadius:8,padding:12,marginBottom:12}}>
        <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>{HUMAN_TOUCH_ELEMENTS.map(h=>{const sel=humanTouchElements.includes(h.id);return(<button key={h.id} onClick={()=>setHumanTouchElements(sel?humanTouchElements.filter(x=>x!==h.id):[...humanTouchElements,h.id])} style={{padding:'4px 10px',borderRadius:16,border:sel?'1px solid #22d3ee':'1px solid #333',background:sel?'#22d3ee15':'transparent',color:sel?'#22d3ee':'#666',cursor:'pointer',fontSize:10}}>{h.icon} {h.label}</button>);})}</div>
        <div style={{display:'flex',gap:4}}>{HUMAN_TOUCH_LEVELS.map(l=>(<button key={l.id} onClick={()=>setHumanTouchLevel(l.id)} style={{flex:1,padding:'6px',borderRadius:6,border:'none',background:humanTouchLevel===l.id?'#22d3ee':'#1a1a35',color:humanTouchLevel===l.id?'#000':'#888',cursor:'pointer',fontSize:11,fontWeight:humanTouchLevel===l.id?700:400}}>{l.label}</button>))}</div>
      </div>

      {/* 창작 모드 */}
      {S.label('🎨 창작 모드')}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>{CREATIVE_MODES.map(c=>(<div key={c.id} onClick={()=>setCreativeMode(c.id)} style={{padding:'10px',borderRadius:8,background:creativeMode===c.id?'#4f46e5':'#0d0d20',border:'1px solid '+(creativeMode===c.id?'#4f46e5':'#252550'),cursor:'pointer',textAlign:'center'}}>
        <div style={{fontSize:16}}>{c.icon}</div><div style={{fontSize:11,color:'#fff',fontWeight:600}}>{c.label}</div><div style={{fontSize:9,color:'#888'}}>{c.desc}</div>
      </div>))}</div>

      <button onClick={()=>setTab('topic-title')} style={{width:'100%',padding:'12px',borderRadius:8,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontSize:14,border:'none',cursor:'pointer',fontWeight:600,marginTop:8}}>→ 주제/제목 설정으로</button>
    </div>);

    /* ── 주제/제목 (신규) ── */
    case 'topic-title': return(<div>
      <h2 style={{fontSize:18,margin:'0 0 12px'}}>💡 주제 / 제목</h2>

      {/* 주제 입력 */}
      {S.label('주제')}
      <div style={{display:'flex',gap:6,marginBottom:4}}>
        <div style={{flex:1}}>{S.input(topic,setTopic,'주제를 입력하세요 (비우면 AI 추천)')}</div>
        <button onClick={handleSuggestTopics} disabled={loading} style={{padding:'10px 14px',borderRadius:8,background:'#1a1a35',color:'#a78bfa',border:'1px solid #252550',cursor:'pointer',fontSize:12,whiteSpace:'nowrap'}}>🎲 AI 추천</button>
      </div>

      {/* AI 추천 주제 */}
      {suggestedTopics.length>0&&(<div style={{background:'#0d0d20',borderRadius:8,padding:10,marginBottom:12,border:'1px solid #252550'}}>
        <p style={{color:'#888',fontSize:11,margin:'0 0 6px'}}>🎲 추천 주제 (클릭하여 선택)</p>
        {suggestedTopics.map((t,i)=>(<div key={i} onClick={()=>{setTopic(t);setSuggestedTopics([]);}} style={{padding:'6px 10px',borderRadius:6,cursor:'pointer',marginBottom:2,background:topic===t?'#4f46e520':'transparent',color:topic===t?'#a78bfa':'#ccc',fontSize:12,border:topic===t?'1px solid #4f46e5':'1px solid transparent'}}>{t}</div>))}
      </div>)}

      {/* 제목 생성 */}
      {S.label('제목 생성')}
      <div style={{display:'flex',gap:6,marginBottom:8}}>
        <button onClick={()=>handleGenerateTitles()} disabled={loading} style={{flex:1,padding:'10px',borderRadius:8,background:'#4f46e5',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>🎯 제목 10개 생성</button>
        <button onClick={()=>handleGenerateTitles('provocative')} disabled={loading} style={{flex:1,padding:'10px',borderRadius:8,background:'#dc2626',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>🔥 더 자극적으로</button>
      </div>

      {/* 생성된 제목 리스트 */}
      {generatedTitles.length>0&&(<div style={{background:'#0d0d20',borderRadius:8,padding:10,marginBottom:12,border:'1px solid #252550'}}>
        <p style={{color:'#888',fontSize:11,margin:'0 0 8px'}}>📋 제목 후보 (클릭하여 선택)</p>
        {generatedTitles.map((t,i)=>{const title=t.split('|')[0].trim();const hookType=t.split('|')[1]?.trim()||'';
          return(<div key={i} onClick={()=>setSelectedTitle(title)} style={{padding:'8px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,background:selectedTitle===title?'#4f46e520':'#161630',border:selectedTitle===title?'1.5px solid #4f46e5':'1px solid #252550',display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:22,height:22,borderRadius:'50%',background:selectedTitle===title?'#4f46e5':'#333',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,flexShrink:0}}>{selectedTitle===title?'✓':(i+1)}</span>
            <div style={{flex:1}}><p style={{fontSize:13,color:selectedTitle===title?'#fff':'#ccc',margin:0,fontWeight:selectedTitle===title?600:400}}>{title}</p>
              {hookType&&<p style={{fontSize:10,color:'#666',margin:0}}>{hookType}</p>}</div>
          </div>);})}
      </div>)}

      {/* 직접 입력 */}
      {S.label('또는 직접 입력')}
      {S.input(selectedTitle,setSelectedTitle,'제목을 직접 입력하세요')}

      {selectedTitle&&<button onClick={()=>setTab('synopsis')} style={{width:'100%',padding:'12px',borderRadius:8,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontSize:14,border:'none',cursor:'pointer',fontWeight:600,marginTop:8}}>→ 시놉시스 생성으로</button>}
    </div>);

    /* ── 시놉시스 (5개 선택형) ── */
    case 'synopsis': return(<div>
      <h2 style={{fontSize:18,margin:'0 0 12px'}}>📖 시놉시스 생성</h2>
      {genre&&subGenre&&GENRE_MAP[genre]?.subs[subGenre]&&(<div style={{background:GENRE_MAP[genre].color+'10',borderRadius:8,padding:'8px 12px',marginBottom:10,border:'1px solid '+GENRE_MAP[genre].color+'30',fontSize:12,color:GENRE_MAP[genre].color}}>
        {GENRE_MAP[genre].subs[subGenre].icon} {GENRE_MAP[genre].label} → {GENRE_MAP[genre].subs[subGenre].label} | 구조: {GENRE_MAP[genre].subs[subGenre].structure.join(' → ')}
      </div>)}
      {selectedTitle&&<div style={{background:'#4f46e510',borderRadius:8,padding:'8px 12px',marginBottom:10,border:'1px solid #4f46e530',fontSize:12,color:'#a78bfa'}}>🎯 제목: {selectedTitle}</div>}

      {S.label('주제')}{S.input(topic,setTopic,'예: 가문의 복수')}
      {S.label('챕터 수')}{S.sel(chapterCount,setChapterCount,[{v:'5',l:'5개'},{v:'6',l:'6개'},{v:'7',l:'7개'},{v:'8',l:'8개'},{v:'10',l:'10개'}])}

      {S.btn('📖 시놉시스 5개 생성 (선택형)',handleGenerateSynopses,'#7c3aed')}

      {/* 5개 시놉시스 카드 */}
      {generatedSynopses.length>0&&(<div style={{marginTop:16}}>
        <p style={{color:'#888',fontSize:12,marginBottom:8}}>📋 시놉시스 {generatedSynopses.length}개 — 클릭하여 선택</p>
        {generatedSynopses.map((syn,i)=>(<div key={i} onClick={()=>{setSelectedSynopsis(i);setSynopsisConfirmed(false);}} style={{background:selectedSynopsis===i?'#4f46e510':'#0d0d20',border:selectedSynopsis===i?'2px solid #4f46e5':'1px solid #252550',borderRadius:10,padding:12,marginBottom:8,cursor:'pointer',transition:'all 0.2s'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{width:24,height:24,borderRadius:'50%',background:selectedSynopsis===i?'#4f46e5':'#333',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>{selectedSynopsis===i?'✓':(i+1)}</span>
            <span style={{fontSize:13,fontWeight:600,color:selectedSynopsis===i?'#a78bfa':'#ccc'}}>시놉시스 #{i+1} — {['정통 스토리','반전 중심','감성/감동','긴장/서스펜스','독창/실험'][i]}</span>
          </div>
          <div style={{fontSize:12,color:'#aaa',lineHeight:1.6,maxHeight:selectedSynopsis===i?'none':100,overflow:'hidden'}} dangerouslySetInnerHTML={{__html:renderMarkdown(syn.slice(0,selectedSynopsis===i?99999:300)+(selectedSynopsis===i?'':'...'))}}/>
        </div>))}

        {selectedSynopsis>=0&&!synopsisConfirmed&&(<div style={{background:'#0d0d20',borderRadius:10,padding:16,border:'2px solid #4f46e5',marginTop:8}}>
          <p style={{color:'#fff',fontSize:14,fontWeight:600,margin:'0 0 8px'}}>시놉시스 #{selectedSynopsis+1}을 확정하시겠습니까?</p>
          <p style={{color:'#888',fontSize:12,margin:'0 0 12px'}}>확정 후 이 시놉시스를 기반으로 등장인물 분석 및 대본 생성이 진행됩니다.</p>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{setSynopsisConfirmed(true);setResult('✅ 시놉시스 #'+(selectedSynopsis+1)+' 확정! → 다음 단계로 진행하세요.');}} style={{flex:1,padding:'10px',borderRadius:8,background:'#4f46e5',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>✅ 줄거리 확정</button>
            <button onClick={()=>setSelectedSynopsis(-1)} style={{flex:1,padding:'10px',borderRadius:8,background:'#333',color:'#888',border:'none',cursor:'pointer',fontSize:13}}>취소</button>
          </div>
        </div>)}

        {synopsisConfirmed&&(<div style={{background:'#4ade8010',borderRadius:10,padding:16,border:'1px solid #4ade8040',marginTop:8}}>
          <p style={{color:'#4ade80',fontSize:14,fontWeight:600,margin:'0 0 8px'}}>✅ 시놉시스 #{selectedSynopsis+1} 확정됨</p>
          <button onClick={()=>setTab('script')} style={{width:'100%',padding:'10px',borderRadius:8,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>→ 대본 생성으로</button>
        </div>)}
      </div>)}
      {S.reset()}
    </div>);

  // ══════════════════════════════════════════════
  //  렌더 헬퍼: 장르 선택 카드 UI
  // ══════════════════════════════════════════════
  const renderGenreSelector = () => (
    <div style={{marginBottom:'32px'}}>
      <h3 style={{color:'#e2e8f0',fontSize:'18px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
        🎭 장르 선택
        {genre && subGenre && (
          <span style={{fontSize:'12px',padding:'4px 12px',borderRadius:'12px',
            background:GENRE_MAP[genre]?.gradient||'#4a5568',color:'#fff'}}>
            {GENRE_MAP[genre]?.label} → {GENRE_MAP[genre]?.subGenres[subGenre]?.label}
          </span>
        )}
      </h3>

      {/* 메인 장르 5열 그리드 */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px',marginBottom:'20px'}}>
        {GENRE_KEYS.map((gk:string) => {
          const g = (GENRE_MAP as any)[gk];
          if(!g) return null;
          const sel = genre === gk;
          return (
            <div key={gk} onClick={() => { setGenre(sel ? '' : gk); setSubGenre(''); }}
              style={{padding:'16px',borderRadius:'12px',cursor:'pointer',textAlign:'center',
                background: sel ? g.gradient : 'rgba(255,255,255,0.05)',
                border: sel ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                transform: sel ? 'scale(1.03)' : 'scale(1)',
                transition:'all 0.2s ease',
                boxShadow: sel ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'}}>
              <div style={{fontSize:'28px',marginBottom:'6px'}}>{g.icon}</div>
              <div style={{fontSize:'13px',fontWeight:600,color: sel ? '#fff' : '#cbd5e0'}}>{g.label}</div>
              <div style={{fontSize:'10px',color: sel ? 'rgba(255,255,255,0.8)' : '#718096',marginTop:'4px'}}>
                {Object.keys(g.subGenres).length}개 서브장르
              </div>
            </div>
          );
        })}
      </div>

      {/* 서브장르 3열 카드 */}
      {genre && (GENRE_MAP as any)[genre] && (
        <div style={{marginBottom:'20px'}}>
          <h4 style={{color:'#a0aec0',fontSize:'14px',marginBottom:'12px'}}>
            {(GENRE_MAP as any)[genre].icon} {(GENRE_MAP as any)[genre].label} 서브장르
          </h4>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
            {Object.entries((GENRE_MAP as any)[genre].subGenres).map(([sk, sv]: [string, any]) => {
              const ssel = subGenre === sk;
              return (
                <div key={sk} onClick={() => { setSubGenre(sk); applyGenreSettings(genre, sk); }}
                  style={{padding:'14px',borderRadius:'10px',cursor:'pointer',
                    background: ssel ? (GENRE_MAP as any)[genre].gradient : 'rgba(255,255,255,0.04)',
                    border: ssel ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    transition:'all 0.2s ease'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                    <span style={{fontSize:'20px'}}>{sv.icon}</span>
                    <span style={{fontSize:'13px',fontWeight:600,color: ssel ? '#fff' : '#e2e8f0'}}>{sv.label}</span>
                  </div>
                  <div style={{fontSize:'10px',color: ssel ? 'rgba(255,255,255,0.85)' : '#718096',lineHeight:'1.5'}}>
                    <div>🎵 {sv.bgm} · 🖼 {sv.imageStyle}</div>
                    <div>🗣 화자 {sv.speaker} · ⏱ {sv.duration}분</div>
                    <div style={{marginTop:'4px',fontStyle:'italic'}}>"{sv.hookExample}"</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 장르 프리뷰 패널 */}
      {genre && subGenre && (GENRE_MAP as any)[genre]?.subGenres[subGenre] && (() => {
        const sv = (GENRE_MAP as any)[genre].subGenres[subGenre];
        return (
          <div style={{padding:'20px',borderRadius:'12px',
            background:'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            border:'1px solid rgba(99,102,241,0.3)'}}>
            <h4 style={{color:'#a78bfa',fontSize:'14px',marginBottom:'12px'}}>📋 선택 장르 프리뷰</h4>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',fontSize:'12px',color:'#cbd5e0'}}>
              <div><span style={{color:'#718096'}}>톤:</span> {sv.tone}</div>
              <div><span style={{color:'#718096'}}>화자:</span> {sv.speaker}</div>
              <div><span style={{color:'#718096'}}>길이:</span> {sv.duration}분 · {sv.chapters}챕터</div>
              <div><span style={{color:'#718096'}}>BGM:</span> {sv.bgm}</div>
              <div><span style={{color:'#718096'}}>이미지:</span> {sv.imageStyle}</div>
              <div><span style={{color:'#718096'}}>나레이션:</span> {sv.narrationRatio}</div>
            </div>
            <div style={{marginTop:'12px',fontSize:'11px',color:'#a0aec0'}}>
              <span style={{color:'#718096'}}>구조:</span>{' '}
              {sv.structure?.join(' → ')}
            </div>
          </div>
        );
      })()}
    </div>
  );

  // ══════════════════════════════════════════════
  //  렌더 헬퍼: 상세 설정 패널
  // ══════════════════════════════════════════════
  const renderSettingsPanel = () => (
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px',marginBottom:'24px'}}>

      {/* 톤 선택 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>🎨 톤/스타일</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {TONE_OPTIONS.map((t:any) => (
            <button key={t.id} onClick={() => setToneId(t.id)}
              style={{padding:'6px 12px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                background: toneId===t.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: toneId===t.id ? '#fff' : '#cbd5e0'}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 화자 모드 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>🗣 화자 모드</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {SPEAKER_MODES.map((s:any) => (
            <button key={s.id} onClick={() => setSpeakerMode(s.id)}
              style={{padding:'6px 12px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                background: speakerMode===s.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: speakerMode===s.id ? '#fff' : '#cbd5e0'}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 나레이션 비율 슬라이더 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>📊 나레이션 비율</h4>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'11px',color:'#718096'}}>대화</span>
          <input type="range" min={10} max={90} step={10} value={narrationRatio}
            onChange={(e) => setNarrationRatio(Number(e.target.value))}
            style={{flex:1,accentColor:'#6366f1'}} />
          <span style={{fontSize:'11px',color:'#718096'}}>나레이션</span>
          <span style={{fontSize:'13px',fontWeight:700,color:'#a78bfa',minWidth:'40px',textAlign:'center'}}>
            {narrationRatio}%
          </span>
        </div>
      </div>

      {/* 창작 모드 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>⚡ 창작 모드</h4>
        <div style={{display:'flex',gap:'6px'}}>
          {CREATIVE_MODES.map((c:any) => (
            <button key={c.id} onClick={() => setCreativeMode(c.id)}
              style={{padding:'8px 14px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',flex:1,
                background: creativeMode===c.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: creativeMode===c.id ? '#fff' : '#cbd5e0',textAlign:'center'}}>
              {c.icon} {c.label}
              <div style={{fontSize:'9px',marginTop:'2px',opacity:0.7}}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 드라마 요소 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>🎭 드라마 요소</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {DRAMA_ELEMENTS.map((d:any) => {
            const on = dramaElements.includes(d.id);
            return (
              <button key={d.id} onClick={() => {
                setDramaElements((prev:string[]) => on ? prev.filter((x:string)=>x!==d.id) : [...prev, d.id]);
              }}
                style={{padding:'6px 10px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                  background: on ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  color: on ? '#fff' : '#cbd5e0'}}>
                {d.icon} {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 휴먼터치 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>💡 휴먼터치</h4>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'8px'}}>
          {HUMAN_TOUCH_ELEMENTS.map((h:any) => {
            const on = humanTouchElements.includes(h.id);
            return (
              <button key={h.id} onClick={() => {
                setHumanTouchElements((prev:string[]) => on ? prev.filter((x:string)=>x!==h.id) : [...prev, h.id]);
              }}
                style={{padding:'6px 10px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                  background: on ? '#10b981' : 'rgba(255,255,255,0.08)',
                  color: on ? '#fff' : '#cbd5e0'}}>
                {h.icon} {h.label}
              </button>
            );
          })}
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          {HUMAN_TOUCH_LEVELS.map((lv:any) => (
            <button key={lv.id} onClick={() => setHumanTouchLevel(lv.id)}
              style={{padding:'4px 10px',borderRadius:'6px',fontSize:'10px',border:'none',cursor:'pointer',flex:1,
                background: humanTouchLevel===lv.id ? '#10b981' : 'rgba(255,255,255,0.06)',
                color: humanTouchLevel===lv.id ? '#fff' : '#718096'}}>
              {lv.label} {lv.percent}
            </button>
          ))}
        </div>
      </div>

      {/* 출력 포맷 & 언어 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>📐 출력 설정</h4>
        <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
          {CONTENT_FORMATS.map((f:any) => (
            <button key={f.id} onClick={() => setContentFormat(f.id)}
              style={{padding:'6px 12px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                background: contentFormat===f.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: contentFormat===f.id ? '#fff' : '#cbd5e0'}}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <select value={outputLang} onChange={(e) => setOutputLang(e.target.value)}
          style={{width:'100%',padding:'8px',borderRadius:'8px',fontSize:'12px',
            background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
          {OUTPUT_LANGUAGES.map((l:any) => (
            <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
          ))}
        </select>
      </div>

      {/* 입력 방식 */}
      <div style={{padding:'16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)'}}>
        <h4 style={{color:'#a0aec0',fontSize:'13px',marginBottom:'10px'}}>📝 대본 입력 방식</h4>
        <div style={{display:'flex',gap:'6px',marginBottom:'10px'}}>
          {[{id:'ai',icon:'🤖',label:'AI 생성'},{id:'manual',icon:'✍️',label:'직접 입력'},{id:'file',icon:'📁',label:'파일 업로드'}].map(m => (
            <button key={m.id} onClick={() => setScriptInputMode(m.id)}
              style={{padding:'8px 14px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',flex:1,
                background: scriptInputMode===m.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: scriptInputMode===m.id ? '#fff' : '#cbd5e0'}}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        {scriptInputMode === 'manual' && (
          <textarea value={scriptText} onChange={(e) => setScriptText(e.target.value)}
            placeholder="대본을 직접 입력하세요..."
            style={{width:'100%',minHeight:'100px',padding:'10px',borderRadius:'8px',fontSize:'12px',
              background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
              resize:'vertical'}} />
        )}
        {scriptInputMode === 'file' && (
          <div style={{textAlign:'center',padding:'20px',borderRadius:'8px',
            border:'2px dashed rgba(255,255,255,0.15)',cursor:'pointer'}}
            onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept=".txt,.srt,.docx"
              style={{display:'none'}} onChange={handleFileUpload} />
            <div style={{fontSize:'24px',marginBottom:'8px'}}>📂</div>
            <div style={{fontSize:'12px',color:'#a0aec0'}}>
              {uploadedFileName || 'TXT, SRT, DOCX 파일을 선택하세요'}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  //  렌더 헬퍼: 제목 생성 UI
  // ══════════════════════════════════════════════
  const renderTitleGenerator = () => (
    <div style={{marginBottom:'24px',padding:'20px',borderRadius:'12px',
      background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <h4 style={{color:'#e2e8f0',fontSize:'15px'}}>🏷️ AI 제목 생성 (10개)</h4>
        <button onClick={handleSuggestTitles} disabled={loading}
          style={{padding:'8px 20px',borderRadius:'8px',fontSize:'12px',fontWeight:600,border:'none',
            cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
          {loading ? '생성 중...' : '✨ 제목 생성'}
        </button>
      </div>
      {generatedTitles.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
          {generatedTitles.map((t:any, i:number) => (
            <div key={i} onClick={() => { setSelectedTitle(t.title || t); setTopic(t.title || t); }}
              style={{padding:'12px',borderRadius:'8px',cursor:'pointer',
                background: selectedTitle === (t.title||t) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: selectedTitle === (t.title||t) ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                transition:'all 0.15s ease'}}>
              <div style={{fontSize:'13px',color:'#e2e8f0',fontWeight:500}}>
                {typeof t === 'string' ? t : t.title}
              </div>
              {t.hookType && (
                <div style={{fontSize:'10px',color:'#718096',marginTop:'4px'}}>
                  🎣 {t.hookType} {t.seoScore && `· SEO ${t.seoScore}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════
  //  렌더 헬퍼: 시놉시스 5개 생성 UI
  // ══════════════════════════════════════════════
  const renderSynopsisGenerator = () => (
    <div style={{marginBottom:'24px',padding:'20px',borderRadius:'12px',
      background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <h4 style={{color:'#e2e8f0',fontSize:'15px'}}>📖 AI 시놉시스 생성 (5개)</h4>
        <button onClick={handleGenerateSynopses} disabled={loading}
          style={{padding:'8px 20px',borderRadius:'8px',fontSize:'12px',fontWeight:600,border:'none',
            cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
          {loading ? '생성 중...' : '📝 시놉시스 생성'}
        </button>
      </div>
      {generatedSynopses.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {generatedSynopses.map((s:any, i:number) => (
            <div key={i} onClick={() => { setSelectedSynopsis(i); setSynopsisResult(typeof s === 'string' ? s : s.content || JSON.stringify(s)); }}
              style={{padding:'14px',borderRadius:'10px',cursor:'pointer',
                background: selectedSynopsis === i ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: selectedSynopsis === i ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                transition:'all 0.15s ease'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                <span style={{fontSize:'13px',fontWeight:600,color: selectedSynopsis===i ? '#10b981' : '#e2e8f0'}}>
                  시놉시스 #{i+1}
                  {typeof s === 'object' && s.style && ` — ${s.style}`}
                </span>
                {selectedSynopsis === i && <span style={{fontSize:'11px',color:'#10b981'}}>✓ 선택됨</span>}
              </div>
              <div style={{fontSize:'12px',color:'#a0aec0',lineHeight:'1.6',
                maxHeight: selectedSynopsis===i ? 'none' : '60px',overflow:'hidden'}}>
                {typeof s === 'string' ? s : s.content || JSON.stringify(s)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════
  //  렌더 헬퍼: 주제 추천 UI
  // ══════════════════════════════════════════════
  const renderTopicSuggester = () => (
    <div style={{marginBottom:'16px'}}>
      <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="주제를 입력하세요 (비워두면 AI가 추천)"
          style={{flex:1,padding:'10px 14px',borderRadius:'8px',fontSize:'13px',
            background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
        <button onClick={handleSuggestTopics} disabled={loading}
          style={{padding:'10px 16px',borderRadius:'8px',fontSize:'12px',fontWeight:600,border:'none',
            cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',whiteSpace:'nowrap'}}>
          💡 주제 추천
        </button>
      </div>
      {suggestedTopics.length > 0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {suggestedTopics.map((st:string, i:number) => (
            <button key={i} onClick={() => setTopic(st)}
              style={{padding:'6px 12px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                background: topic===st ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                color: topic===st ? '#000' : '#cbd5e0'}}>
              {st}
            </button>
          ))}
        </div>
      )}
    </div>
  );


  // ══════════════════════════════════════════════
  //  메인 렌더
  // ══════════════════════════════════════════════
  if(!authed) return <LoginScreen />;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>

      {/* ── 사이드바 ── */}
      <div style={{width: sidebarOpen ? '240px' : '60px',background:'rgba(0,0,0,0.3)',
        borderRight:'1px solid rgba(255,255,255,0.06)',transition:'width 0.3s ease',
        display:'flex',flexDirection:'column',flexShrink:0}}>

        {/* 로고 */}
        <div style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,0.06)',
          display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span style={{fontSize:'24px'}}>🎬</span>
          {sidebarOpen && <span style={{fontSize:'14px',fontWeight:700,color:'#e2e8f0'}}>AI Content Factory</span>}
        </div>

        {/* 프로젝트명 */}
        {sidebarOpen && (
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <input value={projectName} onChange={(e) => { setProjectName(e.target.value); localStorage.setItem('projectName',e.target.value); }}
              placeholder="프로젝트명"
              style={{width:'100%',padding:'8px',borderRadius:'6px',fontSize:'12px',
                background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
          </div>
        )}

        {/* 워크플로우 탭 */}
        <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
          {Object.entries(WORKFLOW).map(([groupKey, group]: [string, any]) => (
            <div key={groupKey} style={{marginBottom:'12px'}}>
              {sidebarOpen && (
                <div style={{fontSize:'10px',color:'#4a5568',textTransform:'uppercase',padding:'4px 8px',
                  fontWeight:700,letterSpacing:'1px'}}>{group.label}</div>
              )}
              {group.tabs.map((t:any) => (
                <div key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{display:'flex',alignItems:'center',gap:'8px',padding: sidebarOpen ? '8px 12px' : '8px',
                    borderRadius:'8px',cursor:'pointer',marginBottom:'2px',
                    background: activeTab===t.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: activeTab===t.id ? '#a78bfa' : '#718096',
                    transition:'all 0.15s ease',justifyContent: sidebarOpen ? 'flex-start' : 'center'}}>
                  <span style={{fontSize:'16px'}}>{t.icon}</span>
                  {sidebarOpen && <span style={{fontSize:'12px',fontWeight: activeTab===t.id ? 600 : 400}}>{t.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI 제공자 선택 */}
        {sidebarOpen && (
          <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <select value={aiProvider} onChange={(e) => { setAiProvider(e.target.value); localStorage.setItem('aiProvider',e.target.value); }}
              style={{width:'100%',padding:'8px',borderRadius:'6px',fontSize:'11px',
                background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',marginBottom:'6px'}}>
              <option value="gemini">🟢 Gemini</option>
              <option value="openai">🔵 OpenAI</option>
              <option value="claude">🟣 Claude</option>
            </select>
            <button onClick={() => setShowKeyModal(true)}
              style={{width:'100%',padding:'6px',borderRadius:'6px',fontSize:'11px',border:'none',
                cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#a0aec0'}}>
              🔑 API 키 설정
            </button>
          </div>
        )}
      </div>

      {/* ── 메인 컨텐츠 ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* 상단 바 */}
        <div style={{padding:'12px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)',
          display:'flex',justifyContent:'space-between',alignItems:'center',
          background:'rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <h2 style={{fontSize:'16px',fontWeight:700,color:'#e2e8f0',margin:0}}>
              {ALL_TABS.find((t:any) => t.id === activeTab)?.icon}{' '}
              {ALL_TABS.find((t:any) => t.id === activeTab)?.label}
            </h2>
            {genre && subGenre && (
              <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'10px',
                background:(GENRE_MAP as any)[genre]?.gradient || '#4a5568',color:'#fff'}}>
                {(GENRE_MAP as any)[genre]?.label} · {(GENRE_MAP as any)[genre]?.subGenres[subGenre]?.label}
              </span>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            {loading && <span style={{fontSize:'12px',color:'#f59e0b'}}>⏳ 처리 중...</span>}
            <span style={{fontSize:'11px',color:'#4a5568'}}>
              {projectName || 'Untitled Project'}
            </span>
          </div>
        </div>

        {/* 스크롤 가능 영역 */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>

          {/* ── API 키 모달 ── */}
          {showKeyModal && (
            <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',
              display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}
              onClick={() => setShowKeyModal(false)}>
              <div style={{background:'#1e293b',borderRadius:'16px',padding:'24px',width:'400px',
                border:'1px solid rgba(255,255,255,0.1)'}} onClick={(e) => e.stopPropagation()}>
                <h3 style={{color:'#e2e8f0',fontSize:'16px',marginBottom:'16px'}}>🔑 API 키 설정</h3>
                {[
                  {label:'Gemini',key:geminiKey,set:setGeminiKey,store:'geminiKey'},
                  {label:'OpenAI',key:openaiKey,set:setOpenaiKey,store:'openaiKey'},
                  {label:'Claude',key:claudeKey,set:setClaudeKey,store:'claudeKey'},
                  {label:'YouTube',key:youtubeKey,set:setYoutubeKey,store:'youtubeKey'}
                ].map(k => (
                  <div key={k.label} style={{marginBottom:'10px'}}>
                    <label style={{fontSize:'11px',color:'#a0aec0',display:'block',marginBottom:'4px'}}>{k.label} API Key</label>
                    <input type="password" value={k.key} onChange={(e) => { k.set(e.target.value); localStorage.setItem(k.store, e.target.value); }}
                      placeholder={`${k.label} API Key 입력`}
                      style={{width:'100%',padding:'8px',borderRadius:'6px',fontSize:'12px',
                        background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  </div>
                ))}
                <button onClick={() => setShowKeyModal(false)}
                  style={{width:'100%',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:600,
                    border:'none',cursor:'pointer',marginTop:'8px',
                    background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}}>
                  저장 완료
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  준비 > 개요 탭                      */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}}>
                {[
                  {icon:'📝',label:'프로젝트',value: projectName || '미설정'},
                  {icon:'🎭',label:'장르',value: genre && subGenre ? `${(GENRE_MAP as any)[genre]?.label} > ${(GENRE_MAP as any)[genre]?.subGenres[subGenre]?.label}` : '미선택'},
                  {icon:'🤖',label:'AI 제공자',value: aiProvider.toUpperCase()},
                  {icon:'📊',label:'진행률',value: `${[synopsisResult,scriptResult,editResult].filter(Boolean).length}/3 단계`}
                ].map((card,i) => (
                  <div key={i} style={{padding:'16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.08)',textAlign:'center'}}>
                    <div style={{fontSize:'24px',marginBottom:'6px'}}>{card.icon}</div>
                    <div style={{fontSize:'11px',color:'#718096',marginBottom:'2px'}}>{card.label}</div>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#e2e8f0'}}>{card.value}</div>
                  </div>
                ))}
              </div>
              {renderGenreSelector()}
              {renderSettingsPanel()}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  준비 > 시놉시스 탭                   */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'synopsis' && (
            <div>
              {renderTopicSuggester()}
              {renderTitleGenerator()}
              {renderSynopsisGenerator()}

              {/* 직접 시놉시스 생성 (기존 호환) */}
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'14px',marginBottom:'12px'}}>📄 단일 시놉시스 생성</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="주제 입력"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <input type="number" value={chapterCount} onChange={(e) => setChapterCount(Number(e.target.value))}
                    min={3} max={12} style={{width:'80px',padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <button onClick={() => handleSynopsis()} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                    {loading ? '생성 중...' : '시놉시스 생성'}
                  </button>
                </div>
                {synopsisResult && (
                  <div style={{padding:'16px',borderRadius:'8px',background:'rgba(0,0,0,0.3)',
                    maxHeight:'400px',overflowY:'auto'}}>
                    <div dangerouslySetInnerHTML={{__html: renderMarkdown(synopsisResult)}} />
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ════════════════════════════════════ */}
          {/*  분석 > 캐릭터 분석                   */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'characters' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>👥 등장인물 분석</h4>
                <p style={{fontSize:'12px',color:'#a0aec0',marginBottom:'12px'}}>
                  시놉시스 또는 대본을 기반으로 등장인물을 자동 분석합니다.
                </p>
                <textarea value={scriptText || synopsisResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="분석할 시놉시스 또는 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'120px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleCharacterAnalysis()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff'}}>
                  {loading ? '분석 중...' : '🔍 캐릭터 분석'}
                </button>
              </div>
              {characterResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(139,92,246,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(characterResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  분석 > 구조 분석                     */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'structure' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🏗️ 구조 분석</h4>
                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="분석할 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'120px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleStructureAnalysis()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  {loading ? '분석 중...' : '📐 구조 분석'}
                </button>
              </div>
              {structureResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(99,102,241,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(structureResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  분석 > 영상 분석                     */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'video-analysis' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🎥 영상 분석</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube URL 입력"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <select value={analysisMode} onChange={(e) => setAnalysisMode(e.target.value)}
                    style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <option value="full">전체 분석</option>
                    <option value="script">스크립트 분석</option>
                    <option value="engagement">참여도 분석</option>
                    <option value="seo">SEO 분석</option>
                  </select>
                  <button onClick={() => handleVideoAnalysis()} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff'}}>
                    {loading ? '분석 중...' : '🔍 분석'}
                  </button>
                </div>
              </div>
              {videoAnalysisResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(239,68,68,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(videoAnalysisResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > 대본 생성                     */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'script' && (
            <div>
              {/* 장르 미선택 경고 */}
              {(!genre || !subGenre) && (
                <div style={{padding:'14px',borderRadius:'10px',marginBottom:'16px',
                  background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)'}}>
                  <span style={{fontSize:'13px',color:'#f59e0b'}}>
                    ⚠️ 장르를 먼저 선택하면 더 정확한 대본이 생성됩니다.
                    <button onClick={() => setActiveTab('overview')}
                      style={{marginLeft:'8px',padding:'4px 12px',borderRadius:'6px',fontSize:'11px',
                        border:'none',cursor:'pointer',background:'#f59e0b',color:'#000',fontWeight:600}}>
                      장르 선택하기
                    </button>
                  </span>
                </div>
              )}

              {/* 주제 입력 + 추천 */}
              {renderTopicSuggester()}

              {/* 대본 설정 요약 */}
              {genre && subGenre && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'16px'}}>
                  {[
                    {label:'톤',value: TONE_OPTIONS.find((t:any)=>t.id===toneId)?.label || toneId},
                    {label:'화자',value: SPEAKER_MODES.find((s:any)=>s.id===speakerMode)?.label || speakerMode},
                    {label:'나레이션',value:`${narrationRatio}%`},
                    {label:'모드',value: CREATIVE_MODES.find((c:any)=>c.id===creativeMode)?.label || creativeMode}
                  ].map((s,i) => (
                    <div key={i} style={{padding:'8px',borderRadius:'8px',textAlign:'center',fontSize:'11px',
                      background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)'}}>
                      <div style={{color:'#718096'}}>{s.label}</div>
                      <div style={{color:'#a78bfa',fontWeight:600}}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 플랫폼·카테고리·길이·대상 */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'16px'}}>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                  style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <option value="youtube">YouTube</option>
                  <option value="shorts">YouTube Shorts</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram Reels</option>
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <option value="일반">일반</option>
                  <option value="교육">교육</option>
                  <option value="엔터테인먼트">엔터테인먼트</option>
                  <option value="뉴스">뉴스</option>
                  <option value="리뷰">리뷰</option>
                </select>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <option value="3">3분</option>
                  <option value="5">5분</option>
                  <option value="8">8분</option>
                  <option value="10">10분</option>
                  <option value="15">15분</option>
                  <option value="20">20분</option>
                </select>
                <select value={audience} onChange={(e) => setAudience(e.target.value)}
                  style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <option value="일반">일반</option>
                  <option value="10대">10대</option>
                  <option value="20-30대">20-30대</option>
                  <option value="40대이상">40대 이상</option>
                  <option value="전문가">전문가</option>
                </select>
              </div>

              {/* 생성 버튼 */}
              <button onClick={() => handleScript()} disabled={loading}
                style={{width:'100%',padding:'14px',borderRadius:'10px',fontSize:'14px',fontWeight:700,
                  border:'none',cursor:'pointer',marginBottom:'16px',
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',
                  boxShadow:'0 4px 16px rgba(99,102,241,0.3)'}}>
                {loading ? '⏳ 대본 생성 중...' : '✨ AI 대본 생성'}
              </button>

              {/* 대본 결과 */}
              {scriptResult && (
                <div style={{padding:'20px',borderRadius:'12px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(99,102,241,0.2)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                    <h4 style={{color:'#a78bfa',fontSize:'14px',margin:0}}>📜 생성된 대본</h4>
                    <span style={{fontSize:'11px',color:'#4a5568'}}>{scriptResult.length.toLocaleString()}자</span>
                  </div>
                  <div style={{maxHeight:'500px',overflowY:'auto'}}>
                    <div dangerouslySetInnerHTML={{__html: renderMarkdown(scriptResult)}} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > 대본 편집                     */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'edit' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>✏️ 대본 편집 (AI 윤문)</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  {['polish','rewrite','grammar','shorten','expand'].map(m => (
                    <button key={m} onClick={() => setEditMode(m)}
                      style={{padding:'8px 14px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                        background: editMode===m ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        color: editMode===m ? '#fff' : '#cbd5e0'}}>
                      {m==='polish' ? '✨ 윤문' : m==='rewrite' ? '🔄 리라이트' : m==='grammar' ? '📝 문법' : m==='shorten' ? '✂️ 축약' : '📐 확장'}
                    </button>
                  ))}
                </div>
                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="편집할 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'200px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleEdit()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                  {loading ? '편집 중...' : '✏️ AI 편집 실행'}
                </button>
              </div>
              {editResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(245,158,11,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(editResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > 대본 확장                     */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'expand' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📐 대본 확장</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  {[
                    {id:'15000',label:'15,000자'},
                    {id:'20000',label:'20,000자'},
                    {id:'30000',label:'30,000자'}
                  ].map(t => (
                    <button key={t.id} onClick={() => setExpandTarget(t.id)}
                      style={{padding:'10px 20px',borderRadius:'8px',fontSize:'12px',border:'none',cursor:'pointer',
                        background: expandTarget===t.id ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        color: expandTarget===t.id ? '#fff' : '#cbd5e0',fontWeight:600}}>
                      🎯 {t.label}
                    </button>
                  ))}
                </div>
                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="확장할 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'150px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleExpand()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                  {loading ? '확장 중...' : `📐 ${expandTarget}자로 확장`}
                </button>
              </div>
              {expandResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(16,185,129,0.3)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                    <span style={{fontSize:'12px',color:'#10b981'}}>확장 결과</span>
                    <span style={{fontSize:'11px',color:'#4a5568'}}>{expandResult.length.toLocaleString()}자</span>
                  </div>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(expandResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > 씬 분할                       */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'scenes' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🎬 씬 분할</h4>
                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="씬을 분할할 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'150px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleSceneSplit()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#ec4899,#db2777)',color:'#fff'}}>
                  {loading ? '분할 중...' : '✂️ 씬 분할'}
                </button>
              </div>
              {sceneResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(236,72,153,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(sceneResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > BGM 추천                      */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'bgm' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🎵 BGM 추천</h4>
                {genre && subGenre && (
                  <div style={{padding:'10px',borderRadius:'8px',marginBottom:'12px',
                    background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)'}}>
                    <span style={{fontSize:'12px',color:'#a78bfa'}}>
                      🎭 현재 장르 BGM 추천: {(GENRE_MAP as any)[genre]?.subGenres[subGenre]?.bgm}
                    </span>
                  </div>
                )}
                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="BGM을 추천받을 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'120px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleBGM()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff'}}>
                  {loading ? '추천 중...' : '🎵 BGM 추천'}
                </button>
              </div>
              {bgmResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(139,92,246,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(bgmResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > 미디어 생성                    */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'media' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🖼️ 미디어 생성</h4>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'12px'}}>
                  {['thumbnail','scene-image','chapter-image'].map(m => (
                    <button key={m} onClick={() => setMediaMode(m)}
                      style={{padding:'10px',borderRadius:'8px',fontSize:'12px',border:'none',cursor:'pointer',
                        background: mediaMode===m ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        color: mediaMode===m ? '#fff' : '#cbd5e0',fontWeight:500}}>
                      {m==='thumbnail' ? '📸 썸네일' : m==='scene-image' ? '🎨 씬 이미지' : '📖 챕터 이미지'}
                    </button>
                  ))}
                </div>

                {/* 이미지 스타일 선택 */}
                <div style={{marginBottom:'12px'}}>
                  <label style={{fontSize:'11px',color:'#718096',display:'block',marginBottom:'6px'}}>이미지 스타일</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {['실사','스틱맨','일러스트','애니메이션','수묵화','판타지','미니멀','시네마틱'].map(s => (
                      <button key={s} onClick={() => setImageStyle(s)}
                        style={{padding:'6px 12px',borderRadius:'6px',fontSize:'11px',border:'none',cursor:'pointer',
                          background: imageStyle===s ? '#6366f1' : 'rgba(255,255,255,0.06)',
                          color: imageStyle===s ? '#fff' : '#cbd5e0'}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="이미지를 생성할 대본 또는 씬 설명을 입력하세요..."
                  style={{width:'100%',minHeight:'100px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleMediaGeneration()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#06b6d4,#0891b2)',color:'#fff'}}>
                  {loading ? '생성 중...' : '🖼️ 미디어 생성'}
                </button>
              </div>
              {mediaResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(6,182,212,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(mediaResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > 자막 추출                     */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'subtitles' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📝 자막 추출 / 생성</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  {['extract','generate','sync'].map(m => (
                    <button key={m} onClick={() => setSubtitleMode(m)}
                      style={{padding:'8px 16px',borderRadius:'8px',fontSize:'12px',border:'none',cursor:'pointer',
                        background: subtitleMode===m ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        color: subtitleMode===m ? '#fff' : '#cbd5e0'}}>
                      {m==='extract' ? '📥 추출' : m==='generate' ? '✨ 생성' : '🔄 동기화'}
                    </button>
                  ))}
                </div>
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube URL 또는 영상 경로"
                  style={{width:'100%',padding:'10px',borderRadius:'8px',fontSize:'13px',marginBottom:'12px',
                    background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                <button onClick={() => handleSubtitleExtract()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#14b8a6,#0d9488)',color:'#fff'}}>
                  {loading ? '처리 중...' : '📝 자막 처리'}
                </button>
              </div>
              {subtitleResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(20,184,166,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(subtitleResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  제작 > TTS 음성 생성                 */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'tts' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🔊 TTS 음성 생성</h4>

                {/* TTS 엔진 선택 */}
                <div style={{marginBottom:'12px'}}>
                  <label style={{fontSize:'11px',color:'#718096',display:'block',marginBottom:'6px'}}>TTS 엔진</label>
                  <div style={{display:'flex',gap:'6px'}}>
                    {[
                      {id:'supertonic',label:'SuperTonic (무료)',icon:'🟢'},
                      {id:'edge',label:'Microsoft Edge',icon:'🔵'},
                      {id:'google',label:'Google TTS',icon:'🟡'},
                      {id:'elevenlabs',label:'ElevenLabs',icon:'🟣'}
                    ].map(e => (
                      <button key={e.id} onClick={() => setTtsEngine(e.id)}
                        style={{padding:'8px 12px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                          background: ttsEngine===e.id ? '#6366f1' : 'rgba(255,255,255,0.06)',
                          color: ttsEngine===e.id ? '#fff' : '#cbd5e0'}}>
                        {e.icon} {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 분할 옵션 */}
                <div style={{marginBottom:'12px'}}>
                  <label style={{fontSize:'11px',color:'#718096',display:'block',marginBottom:'6px'}}>분할 기준</label>
                  <div style={{display:'flex',gap:'6px'}}>
                    {[
                      {id:'sentence',label:'문장 단위'},
                      {id:'paragraph',label:'문단 단위'},
                      {id:'character',label:'글자 수 (500자)'},
                      {id:'speaker',label:'화자별'}
                    ].map(s => (
                      <button key={s.id} onClick={() => setTtsSplitMode(s.id)}
                        style={{padding:'6px 12px',borderRadius:'8px',fontSize:'11px',border:'none',cursor:'pointer',
                          background: ttsSplitMode===s.id ? '#10b981' : 'rgba(255,255,255,0.06)',
                          color: ttsSplitMode===s.id ? '#fff' : '#cbd5e0'}}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="TTS로 변환할 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'120px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleTTS()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff'}}>
                  {loading ? '생성 중...' : '🔊 TTS 생성'}
                </button>
              </div>
              {ttsResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(139,92,246,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(ttsResult)}} />
                </div>
              )}
            </div>
          )}


          {/* ════════════════════════════════════ */}
          {/*  마케팅 > SEO 분석                    */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'seo' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🔍 SEO 분석</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
                    placeholder="키워드 입력 (쉼표로 구분)"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube URL (선택)"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                </div>
                <button onClick={() => handleMarketResearch()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                  {loading ? '분석 중...' : '🔍 SEO 분석'}
                </button>
              </div>
              {marketResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(245,158,11,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(marketResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  마케팅 > 경쟁 분석                    */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'competitors' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>⚔️ 경쟁 채널 분석</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="경쟁 채널/영상 URL"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <button onClick={() => callApi('compare-competitors',{url:videoUrl,topic,keywords}).then(r => setMarketResult(r.result || JSON.stringify(r)))} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff'}}>
                    {loading ? '분석 중...' : '⚔️ 경쟁 분석'}
                  </button>
                </div>
              </div>
              {marketResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(239,68,68,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(marketResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  마케팅 > A/B 제목 테스트              */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'ab-test' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🔬 A/B 제목 테스트</h4>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                  <input value={titleA} onChange={(e) => setTitleA(e.target.value)}
                    placeholder="제목 A"
                    style={{padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <input value={titleB} onChange={(e) => setTitleB(e.target.value)}
                    placeholder="제목 B"
                    style={{padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                </div>
                <button onClick={() => handleABTest()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff'}}>
                  {loading ? '테스트 중...' : '🔬 A/B 테스트'}
                </button>
              </div>
              {abTestResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(139,92,246,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(abTestResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  마케팅 > 시리즈 기획                  */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'series' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📚 시리즈 기획</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="시리즈 주제"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <select value={seriesCount} onChange={(e) => setSeriesCount(Number(e.target.value))}
                    style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {[3,5,7,10,15,20].map(n => (
                      <option key={n} value={n}>{n}편</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => handleSeriesPlan()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  {loading ? '기획 중...' : '📚 시리즈 기획'}
                </button>
              </div>
              {seriesResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(99,102,241,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(seriesResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  마케팅 > 콘텐츠 캘린더                */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'calendar' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📅 콘텐츠 캘린더</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="채널 주제/키워드"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <select value={calendarWeeks} onChange={(e) => setCalendarWeeks(Number(e.target.value))}
                    style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {[1,2,4,8,12].map(w => (
                      <option key={w} value={w}>{w}주</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => handleCalendar()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                  {loading ? '생성 중...' : '📅 캘린더 생성'}
                </button>
              </div>
              {calendarResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(16,185,129,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(calendarResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  마케팅 > 트렌드                      */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'trends' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📈 트렌드 분석</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
                    placeholder="트렌드 키워드 (쉼표 구분)"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <button onClick={() => callApi('trends',{keywords,topic,platform}).then(r => setMarketResult(r.result || JSON.stringify(r)))} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                    {loading ? '분석 중...' : '📈 트렌드 분석'}
                  </button>
                </div>
              </div>
              {marketResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(245,158,11,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(marketResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  배포 > 커뮤니티 포스트                */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'community' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>💬 커뮤니티 포스트 생성</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="포스트 주제"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <select value={communityType} onChange={(e) => setCommunityType(e.target.value)}
                    style={{padding:'10px',borderRadius:'8px',fontSize:'12px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <option value="announcement">📢 공지</option>
                    <option value="poll">📊 투표</option>
                    <option value="behind">🎬 비하인드</option>
                    <option value="teaser">🎯 티저</option>
                    <option value="qna">❓ Q&A</option>
                  </select>
                </div>
                <button onClick={() => handleCommunityPost()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  {loading ? '생성 중...' : '💬 포스트 생성'}
                </button>
              </div>
              {communityResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(99,102,241,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(communityResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  배포 > 쇼핑 콘텐츠                    */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'shopping' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>🛍️ 쇼핑 콘텐츠</h4>
                <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="상품명 또는 주제"
                    style={{flex:1,padding:'10px',borderRadius:'8px',fontSize:'13px',
                      background:'rgba(255,255,255,0.06)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)'}} />
                  <button onClick={() => handleShoppingContent()} disabled={loading}
                    style={{padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'linear-gradient(135deg,#ec4899,#db2777)',color:'#fff'}}>
                    {loading ? '생성 중...' : '🛍️ 쇼핑 콘텐츠'}
                  </button>
                </div>
              </div>
              {shoppingResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(236,72,153,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(shoppingResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  배포 > 업로드 체크리스트              */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'checklist' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>✅ 업로드 체크리스트</h4>
                <p style={{fontSize:'12px',color:'#a0aec0',marginBottom:'12px'}}>
                  업로드 전 필수 항목을 확인합니다.
                </p>

                {/* 자동 체크 항목 */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'16px'}}>
                  {[
                    {label:'대본 완성',done: !!scriptResult},
                    {label:'시놉시스',done: !!synopsisResult},
                    {label:'편집 완료',done: !!editResult},
                    {label:'장르 설정',done: !!(genre && subGenre)},
                    {label:'제목 선택',done: !!selectedTitle},
                    {label:'API 키',done: !!(geminiKey || openaiKey || claudeKey)}
                  ].map((item,i) => (
                    <div key={i} style={{padding:'10px',borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px',
                      background: item.done ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: item.done ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'}}>
                      <span style={{fontSize:'16px'}}>{item.done ? '✅' : '❌'}</span>
                      <span style={{fontSize:'12px',color: item.done ? '#10b981' : '#ef4444'}}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handlePublish()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff'}}>
                  {loading ? '생성 중...' : '✅ 체크리스트 생성'}
                </button>
              </div>
              {publishResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(16,185,129,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(publishResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  배포 > 가이드라인 체크                */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'guidelines' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📋 가이드라인 체크</h4>
                <textarea value={scriptText || scriptResult} onChange={(e) => setScriptText(e.target.value)}
                  placeholder="가이드라인을 체크할 대본을 입력하세요..."
                  style={{width:'100%',minHeight:'120px',padding:'12px',borderRadius:'8px',fontSize:'12px',
                    background:'rgba(0,0,0,0.3)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.1)',
                    resize:'vertical',marginBottom:'12px'}} />
                <button onClick={() => handleGuidelines()} disabled={loading}
                  style={{padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                    cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff'}}>
                  {loading ? '체크 중...' : '📋 가이드라인 체크'}
                </button>
              </div>
              {guidelineResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(245,158,11,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(guidelineResult)}} />
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ */}
          {/*  배포 > 패키지 업로드                  */}
          {/* ════════════════════════════════════ */}
          {activeTab === 'package' && (
            <div>
              <div style={{padding:'20px',borderRadius:'12px',background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
                <h4 style={{color:'#e2e8f0',fontSize:'15px',marginBottom:'12px'}}>📦 패키지 업로드</h4>
                <p style={{fontSize:'12px',color:'#a0aec0',marginBottom:'16px'}}>
                  대본, 시놉시스, 설정값을 하나의 패키지로 묶어 내보냅니다.
                </p>

                {/* 패키지 내용 미리보기 */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'16px'}}>
                  {[
                    {label:'프로젝트명',value: projectName || '미설정',icon:'📁'},
                    {label:'장르',value: genre && subGenre ? `${(GENRE_MAP as any)[genre]?.label} > ${(GENRE_MAP as any)[genre]?.subGenres[subGenre]?.label}` : '미선택',icon:'🎭'},
                    {label:'대본',value: scriptResult ? `${scriptResult.length.toLocaleString()}자` : '없음',icon:'📜'},
                    {label:'시놉시스',value: synopsisResult ? '완료' : '없음',icon:'📖'},
                    {label:'편집',value: editResult ? '완료' : '없음',icon:'✏️'},
                    {label:'제목',value: selectedTitle || '미선택',icon:'🏷️'}
                  ].map((item,i) => (
                    <div key={i} style={{padding:'10px',borderRadius:'8px',fontSize:'11px',
                      background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                      <span>{item.icon} </span>
                      <span style={{color:'#718096'}}>{item.label}: </span>
                      <span style={{color:'#e2e8f0'}}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={() => handleUploadPackage()} disabled={loading}
                    style={{flex:1,padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                    {loading ? '처리 중...' : '📦 패키지 생성'}
                  </button>
                  <button onClick={() => {
                    const pkg = {
                      project: projectName, genre, subGenre, topic: selectedTitle || topic,
                      synopsis: synopsisResult, script: scriptResult, edit: editResult,
                      settings: { toneId, speakerMode, narrationRatio, creativeMode, dramaElements,
                        humanTouchElements, humanTouchLevel, contentFormat, outputLang, imageStyle,
                        platform, category, duration, audience, chapterCount }
                    };
                    const blob = new Blob([JSON.stringify(pkg, null, 2)], {type:'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `${projectName || 'project'}_package.json`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                    style={{padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,border:'none',
                      cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#cbd5e0'}}>
                    💾 JSON 다운로드
                  </button>
                </div>
              </div>
              {packageResult && (
                <div style={{padding:'16px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',
                  border:'1px solid rgba(99,102,241,0.3)'}}>
                  <div dangerouslySetInnerHTML={{__html: renderMarkdown(packageResult)}} />
                </div>
              )}
            </div>
          )}

        </div>{/* end 스크롤 영역 */}
      </div>{/* end 메인 컨텐츠 */}
    </div>
  );
}
