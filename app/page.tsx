'use client';
import { useState, useEffect, useCallback } from 'react';

/* ══════════════════════════════════════════════
   1. GENRE MAP — 3계층 장르 시스템
   ══════════════════════════════════════════════ */
const GENRE_MAP: Record<string, {
  icon: string; label: string; color: string; gradient: string; desc: string;
  subs: Record<string, { icon: string; label: string; tone: string; speaker: string; narrationRatio: number; structure: string[]; bgm: string; imageStyle: string; duration: string; chapters: number; hookExample: string; }>;
}> = {
  storytelling: {
    icon: '📖', label: '스토리텔링', color: '#a78bfa', gradient: 'linear-gradient(135deg,#4c1d95,#7c3aed)',
    desc: '미스터리, 공포, 실화, 도시전설 등 이야기 중심 콘텐츠',
    subs: {
      mystery: { icon:'🔍', label:'미스터리/추리', tone:'긴장감', speaker:'내레이터 90%', narrationRatio:90, structure:['후킹','단서제시','반전','결론','여운'], bgm:'Dark Ambient', imageStyle:'cinematic', duration:'12분', chapters:7, hookExample:'아무도 눈치채지 못한 그 밤의 진실...' },
      horror: { icon:'👻', label:'공포/괴담', tone:'으스스', speaker:'내레이터 95%', narrationRatio:95, structure:['공포후킹','배경','전개','클라이맥스','충격결말'], bgm:'Horror Drone', imageStyle:'cinematic', duration:'10분', chapters:6, hookExample:'절대 이 영상을 밤에 혼자 보지 마세요...' },
      realCase: { icon:'📋', label:'실화/사건', tone:'담담+긴장', speaker:'내레이터 85%', narrationRatio:85, structure:['사건개요','인물','전개','수사','결말','분석'], bgm:'Tension Build', imageStyle:'realistic', duration:'15분', chapters:8, hookExample:'실제로 일어난 이 사건, 아직도 미해결입니다...' },
      urbanLegend: { icon:'🌃', label:'도시전설', tone:'미스터리', speaker:'내레이터 90%', narrationRatio:90, structure:['도입','전설소개','증거','분석','결론'], bgm:'Eerie Ambient', imageStyle:'cinematic', duration:'10분', chapters:6, hookExample:'전 세계에서 동시에 목격된 이것의 정체는...' },
      mythology: { icon:'⚔️', label:'신화/전설', tone:'서사적', speaker:'내레이터 80%', narrationRatio:80, structure:['시대배경','인물','대립','전투','교훈'], bgm:'Epic Orchestral', imageStyle:'illustration', duration:'12분', chapters:7, hookExample:'신들조차 두려워한 단 하나의 존재...' },
      drama: { icon:'🎭', label:'드라마/감동', tone:'감성', speaker:'다중화자 60%', narrationRatio:40, structure:['일상','사건','갈등','절정','감동결말'], bgm:'Emotional Piano', imageStyle:'cinematic', duration:'10분', chapters:6, hookExample:'그 날 이후, 아무것도 같지 않았습니다...' },
    }
  },
  education: {
    icon: '📚', label: '교육/정보', color: '#60a5fa', gradient: 'linear-gradient(135deg,#1e3a5f,#3b82f6)',
    desc: '지식, 노하우, 학습 콘텐츠',
    subs: {
      knowledge: { icon:'💡', label:'지식/상식', tone:'친근+전문', speaker:'내레이터 100%', narrationRatio:100, structure:['질문후킹','개요','핵심포인트3개','사례','정리'], bgm:'Light Corporate', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'99%가 모르는 이 사실, 알면 인생이 바뀝니다...' },
      howto: { icon:'🛠️', label:'방법/튜토리얼', tone:'실용적', speaker:'내레이터 100%', narrationRatio:100, structure:['문제제시','준비물','단계별설명','팁','마무리'], bgm:'Upbeat Lo-fi', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'이 방법만 따라하면 누구나 할 수 있습니다...' },
      language: { icon:'🌐', label:'어학/언어', tone:'교육적', speaker:'내레이터 80%', narrationRatio:80, structure:['도입','핵심표현','예문','연습','정리'], bgm:'Calm Acoustic', imageStyle:'character', duration:'8분', chapters:5, hookExample:'원어민이 매일 쓰는 이 표현, 학교에선 안 알려줍니다...' },
      psychology: { icon:'🧠', label:'심리/자기계발', tone:'공감+동기부여', speaker:'내레이터 95%', narrationRatio:95, structure:['공감후킹','문제분석','해결법3가지','실천팁','마무리'], bgm:'Motivational', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'성공하는 사람들이 절대 하지 않는 3가지...' },
      science: { icon:'🔬', label:'과학/기술', tone:'호기심', speaker:'내레이터 100%', narrationRatio:100, structure:['질문','현상설명','원리','실험/사례','결론'], bgm:'Techy Ambient', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'과학자들도 설명하지 못하는 이 현상...' },
    }
  },
  finance: {
    icon: '💰', label: '재테크/비즈니스', color: '#34d399', gradient: 'linear-gradient(135deg,#064e3b,#10b981)',
    desc: '주식, 부동산, 창업, 부업 정보',
    subs: {
      investment: { icon:'📈', label:'주식/투자', tone:'전문+신뢰', speaker:'내레이터 100%', narrationRatio:100, structure:['시장현황','분석','전략','리스크','결론'], bgm:'Corporate', imageStyle:'realistic', duration:'12분', chapters:7, hookExample:'지금 이 종목을 사지 않으면 후회합니다...' },
      realestate: { icon:'🏠', label:'부동산', tone:'실용', speaker:'내레이터 100%', narrationRatio:100, structure:['현황','지역분석','투자포인트','주의사항','전망'], bgm:'Calm Corporate', imageStyle:'realistic', duration:'12분', chapters:7, hookExample:'2026년 부동산, 이 지역만 오릅니다...' },
      sidehustle: { icon:'💼', label:'부업/창업', tone:'동기부여', speaker:'내레이터 95%', narrationRatio:95, structure:['성공사례','방법소개','수익구조','시작방법','주의점'], bgm:'Upbeat', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'직장 다니면서 월 300 버는 현실적인 방법...' },
      crypto: { icon:'🪙', label:'코인/블록체인', tone:'트렌디+분석', speaker:'내레이터 100%', narrationRatio:100, structure:['시장동향','기술분석','전략','리스크','전망'], bgm:'Electronic', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'비트코인 다음 타자, 전문가들이 주목하는 코인...' },
    }
  },
  history: {
    icon: '🏛️', label: '역사/문화', color: '#f59e0b', gradient: 'linear-gradient(135deg,#78350f,#f59e0b)',
    desc: '역사, 인물, 문명, 문화유산',
    subs: {
      koreanHistory: { icon:'🇰🇷', label:'한국사', tone:'서사적', speaker:'내레이터 90%', narrationRatio:90, structure:['시대배경','인물','사건','의미','교훈'], bgm:'Traditional Korean', imageStyle:'illustration', duration:'12분', chapters:7, hookExample:'교과서가 감춘 조선시대의 충격적 진실...' },
      worldHistory: { icon:'🌍', label:'세계사', tone:'장대', speaker:'내레이터 90%', narrationRatio:90, structure:['배경','원인','전개','결과','영향'], bgm:'Cinematic Orchestra', imageStyle:'cinematic', duration:'15분', chapters:8, hookExample:'로마 제국이 멸망한 진짜 이유...' },
      warHistory: { icon:'⚔️', label:'전쟁/군사', tone:'긴박', speaker:'내레이터 85%', narrationRatio:85, structure:['전쟁배경','전략','전투','결과','분석'], bgm:'War Drums', imageStyle:'cinematic', duration:'15분', chapters:8, hookExample:'역사상 가장 미친 작전, 성공 확률 0.1%...' },
      culture: { icon:'🎨', label:'문화/예술', tone:'감성', speaker:'내레이터 90%', narrationRatio:90, structure:['소개','배경','특징','의미','현재'], bgm:'Classical', imageStyle:'illustration', duration:'10분', chapters:6, hookExample:'천재 화가의 마지막 작품에 숨겨진 비밀...' },
    }
  },
  entertainment: {
    icon: '🎪', label: '엔터/유머', color: '#f472b6', gradient: 'linear-gradient(135deg,#831843,#ec4899)',
    desc: '웃긴 이야기, 랭킹, 퀴즈, 리액션',
    subs: {
      comedy: { icon:'😂', label:'코미디/웃긴', tone:'유쾌', speaker:'다중화자 50%', narrationRatio:50, structure:['도입','상황설정','반전1','반전2','폭소결말'], bgm:'Funny/Quirky', imageStyle:'character', duration:'8분', chapters:5, hookExample:'이걸 보고 안 웃으면 사람이 아닙니다...' },
      ranking: { icon:'🏆', label:'랭킹/TOP', tone:'흥미진진', speaker:'내레이터 100%', narrationRatio:100, structure:['도입','순위발표(역순)','1위발표','정리'], bgm:'Energetic Pop', imageStyle:'realistic', duration:'10분', chapters:7, hookExample:'전 세계 TOP 10, 1위는 아무도 예상 못합니다...' },
      quiz: { icon:'❓', label:'퀴즈/상식', tone:'참여유도', speaker:'내레이터 80%', narrationRatio:80, structure:['규칙설명','문제출제','힌트','정답공개','해설'], bgm:'Game Show', imageStyle:'character', duration:'8분', chapters:6, hookExample:'IQ 130 이상만 맞출 수 있는 문제...' },
      reaction: { icon:'😮', label:'리액션/반응', tone:'과장+재미', speaker:'리액터 70%', narrationRatio:30, structure:['소개','시청/체험','리액션','총평'], bgm:'Pop/Upbeat', imageStyle:'realistic', duration:'8분', chapters:4, hookExample:'한국인이 이걸 처음 봤을 때 반응...' },
    }
  },
  science_tech: {
    icon: '🚀', label: '과학/테크', color: '#22d3ee', gradient: 'linear-gradient(135deg,#164e63,#06b6d4)',
    desc: 'IT, AI, 우주, 미래기술',
    subs: {
      ai_tech: { icon:'🤖', label:'AI/IT', tone:'트렌디', speaker:'내레이터 100%', narrationRatio:100, structure:['트렌드소개','기술설명','사례','전망','정리'], bgm:'Synth/Electronic', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'ChatGPT도 두려워하는 새로운 AI가 나왔습니다...' },
      space: { icon:'🪐', label:'우주/천문', tone:'경이로움', speaker:'내레이터 95%', narrationRatio:95, structure:['도입','현상','과학적설명','시각화','결론'], bgm:'Cosmic Ambient', imageStyle:'cinematic', duration:'12분', chapters:7, hookExample:'우주 끝에서 발견된 이것, 과학자들 충격...' },
      future: { icon:'🔮', label:'미래/예측', tone:'상상력', speaker:'내레이터 100%', narrationRatio:100, structure:['현재상황','변화예측','시나리오','영향','결론'], bgm:'Futuristic', imageStyle:'cinematic', duration:'10분', chapters:6, hookExample:'2050년, 인류는 이렇게 살고 있을 겁니다...' },
      gadget: { icon:'📱', label:'가젯/리뷰', tone:'실용', speaker:'내레이터 100%', narrationRatio:100, structure:['제품소개','스펙','장점','단점','추천대상'], bgm:'Modern Pop', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'이 가격에 이 성능? 역대급 가성비...' },
    }
  },
  health: {
    icon: '💪', label: '건강/웰빙', color: '#4ade80', gradient: 'linear-gradient(135deg,#14532d,#22c55e)',
    desc: '건강, 운동, 다이어트, 의학',
    subs: {
      medical: { icon:'🏥', label:'의학/질병', tone:'신뢰+걱정', speaker:'내레이터 100%', narrationRatio:100, structure:['증상소개','원인','예방법','치료법','정리'], bgm:'Calm Piano', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'이 증상이 나타나면 즉시 병원에 가세요...' },
      fitness: { icon:'🏋️', label:'운동/피트니스', tone:'활기', speaker:'트레이너 80%', narrationRatio:60, structure:['효과설명','준비','동작설명','세트구성','마무리'], bgm:'Workout EDM', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'하루 10분으로 뱃살 빼는 확실한 방법...' },
      diet: { icon:'🥗', label:'식단/다이어트', tone:'실용+응원', speaker:'내레이터 90%', narrationRatio:90, structure:['문제제기','원리','식단소개','일주일플랜','주의점'], bgm:'Light Acoustic', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'이것만 먹었더니 한 달에 5kg 빠졌습니다...' },
      mental: { icon:'🧘', label:'멘탈/명상', tone:'차분', speaker:'내레이터 95%', narrationRatio:95, structure:['공감','원인분석','해결법','실천가이드','마무리'], bgm:'Meditation', imageStyle:'illustration', duration:'10분', chapters:5, hookExample:'불안과 스트레스에서 벗어나는 과학적 방법...' },
    }
  },
  lifestyle: {
    icon: '✨', label: '라이프스타일', color: '#c084fc', gradient: 'linear-gradient(135deg,#581c87,#a855f7)',
    desc: '일상, 여행, 인테리어, 요리',
    subs: {
      travel: { icon:'✈️', label:'여행', tone:'설렘', speaker:'브이로거 60%', narrationRatio:40, structure:['도착','명소소개','맛집','꿀팁','총평'], bgm:'Tropical House', imageStyle:'cinematic', duration:'10분', chapters:6, hookExample:'이 나라 여행, 100만원이면 일주일 가능합니다...' },
      food: { icon:'🍳', label:'요리/먹방', tone:'편안', speaker:'요리사 70%', narrationRatio:30, structure:['메뉴소개','재료','조리과정','완성','시식'], bgm:'Jazz/Bossa', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'집에서 5분만에 만드는 미쉐린급 요리...' },
      interior: { icon:'🏠', label:'인테리어', tone:'감성', speaker:'내레이터 80%', narrationRatio:80, structure:['비포','컨셉','변화과정','에프터','비용'], bgm:'Chill Lo-fi', imageStyle:'realistic', duration:'10분', chapters:5, hookExample:'10만원으로 방을 호텔처럼 바꾸는 방법...' },
      vlog: { icon:'📹', label:'브이로그', tone:'일상적', speaker:'브이로거 90%', narrationRatio:10, structure:['아침','메인활동','중간일상','하이라이트','마무리'], bgm:'Indie Pop', imageStyle:'realistic', duration:'10분', chapters:5, hookExample:'서울에서 가장 힙한 동네의 하루...' },
    }
  },
  commerce: {
    icon: '🛍️', label: '커머스/리뷰', color: '#fb923c', gradient: 'linear-gradient(135deg,#7c2d12,#f97316)',
    desc: '제품 리뷰, 비교, 언박싱, 추천',
    subs: {
      review: { icon:'⭐', label:'제품 리뷰', tone:'솔직', speaker:'리뷰어 80%', narrationRatio:60, structure:['첫인상','스펙','장점','단점','총평점수'], bgm:'Modern Pop', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'사기 전에 이 영상을 꼭 보세요...' },
      comparison: { icon:'⚖️', label:'비교/대결', tone:'객관적', speaker:'내레이터 100%', narrationRatio:100, structure:['후보소개','항목별비교','승자발표','추천대상'], bgm:'Competitive', imageStyle:'realistic', duration:'10분', chapters:6, hookExample:'아이폰 vs 갤럭시, 최종 승자는...' },
      unboxing: { icon:'📦', label:'언박싱', tone:'기대감', speaker:'리뷰어 90%', narrationRatio:30, structure:['도착','개봉','첫인상','사용후기','추천'], bgm:'Upbeat Pop', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'역대급 가성비 제품이 도착했습니다...' },
      bestPick: { icon:'🏅', label:'추천/베스트', tone:'실용', speaker:'내레이터 100%', narrationRatio:100, structure:['선정기준','순위발표','1위상세','구매팁','정리'], bgm:'Bright Corporate', imageStyle:'realistic', duration:'10분', chapters:7, hookExample:'2026년 꼭 사야 할 가성비 TOP 5...' },
    }
  },
  news: {
    icon: '📰', label: '뉴스/시사', color: '#f87171', gradient: 'linear-gradient(135deg,#7f1d1d,#ef4444)',
    desc: '시사, 이슈, 분석, 팩트체크',
    subs: {
      breaking: { icon:'🔴', label:'속보/이슈', tone:'긴급', speaker:'앵커 100%', narrationRatio:100, structure:['속보도입','사건경위','영향분석','전망','마무리'], bgm:'News Intro', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'방금 터진 이 뉴스, 전 국민이 알아야 합니다...' },
      analysis: { icon:'📊', label:'심층분석', tone:'분석적', speaker:'해설자 90%', narrationRatio:90, structure:['이슈소개','배경','다각도분석','전문가의견','전망'], bgm:'Serious Corporate', imageStyle:'realistic', duration:'15분', chapters:8, hookExample:'언론이 말하지 않는 이 사건의 진짜 이유...' },
      factcheck: { icon:'✅', label:'팩트체크', tone:'객관적', speaker:'내레이터 100%', narrationRatio:100, structure:['주장소개','검증과정','근거제시','판정','정리'], bgm:'Neutral', imageStyle:'realistic', duration:'8분', chapters:5, hookExample:'이 뉴스가 사실인지 직접 확인해봤습니다...' },
      global: { icon:'🌐', label:'국제/글로벌', tone:'시사적', speaker:'내레이터 95%', narrationRatio:95, structure:['이슈소개','국가별상황','원인','영향','전망'], bgm:'World News', imageStyle:'realistic', duration:'12분', chapters:7, hookExample:'전 세계가 주목하는 이 사건의 전말...' },
    }
  },
};

const GENRE_KEYS = Object.keys(GENRE_MAP);

/* ══════════════════════════════════════════════
   2. 로그인 화면
   ══════════════════════════════════════════════ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0a0a1a,#12122a)' }}>
      <div style={{ background:'#161630', padding:40, borderRadius:16, textAlign:'center', minWidth:340, border:'1px solid #252550' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🎬</div>
        <h1 style={{ fontSize:24, marginBottom:4, color:'#fff' }}>AI 콘텐츠 팩토리</h1>
        <p style={{ color:'#666', marginBottom:24, fontSize:13 }}>영상 제작의 모든 것을 AI로</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(pw==='rani2024!'?(localStorage.setItem('ai-factory-auth','true'),onLogin()):setError('비밀번호가 틀렸습니다.'))} placeholder="비밀번호" style={{ width:'100%', padding:'12px 16px', borderRadius:8, border:'1px solid #252550', background:'#0a0a1a', color:'#fff', fontSize:15, marginBottom:12, boxSizing:'border-box' }} />
        {error && <p style={{ color:'#ef4444', marginBottom:12, fontSize:13 }}>{error}</p>}
        <button onClick={()=>pw==='rani2024!'?(localStorage.setItem('ai-factory-auth','true'),onLogin()):setError('비밀번호가 틀렸습니다.')} style={{ width:'100%', padding:'12px', borderRadius:8, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', fontSize:15, border:'none', cursor:'pointer', fontWeight:600 }}>로그인</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   3. 마크다운 렌더러
   ══════════════════════════════════════════════ */
function renderMarkdown(text: string) {
  if (!text) return '';
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#0a0a1a;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid #252550;margin:12px 0;font-size:13px;line-height:1.6"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:#1e1e3e;padding:2px 6px;border-radius:4px;font-size:13px;color:#a78bfa">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#a78bfa;font-size:15px;margin:18px 0 6px;padding-bottom:4px;border-bottom:1px solid #252550">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#818cf8;font-size:17px;margin:22px 0 8px;padding-bottom:6px;border-bottom:1px solid #303060">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#6366f1;font-size:20px;margin:22px 0 10px;padding-bottom:8px;border-bottom:2px solid #4f46e5">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em style="color:#e2e8f0">$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#94a3b8">$1</em>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #252550;margin:14px 0"/>')
    .replace(/^- \[x\] (.+)$/gm, '<div style="padding:3px 0;color:#4ade80">✅ $1</div>')
    .replace(/^- \[ \] (.+)$/gm, '<div style="padding:3px 0;color:#666">⬜ $1</div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding:3px 0 3px 8px"><span style="color:#6366f1;font-weight:700;margin-right:6px">$1.</span>$2</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="padding:3px 0 3px 8px"><span style="color:#6366f1;margin-right:6px">●</span>$1</div>')
    .replace(/^> (.+)$/gm, '<div style="border-left:3px solid #4f46e5;padding:6px 12px;margin:6px 0;background:rgba(79,70,229,0.06);border-radius:0 6px 6px 0;color:#a5b4fc">$1</div>')
    .replace(/\n\n/g, '<div style="height:10px"></div>')
    .replace(/\n/g, '<br/>');
}

/* ══════════════════════════════════════════════
   4. 워크플로우 정의
   ══════════════════════════════════════════════ */
const WORKFLOW: Record<string, {id:string;icon:string;label:string}[]> = {
  준비: [
    { id:'overview', icon:'📊', label:'프로젝트 개요' },
    { id:'genre-select', icon:'🎭', label:'장르 선택' },
    { id:'synopsis', icon:'📖', label:'시놉시스/플롯' },
    { id:'script', icon:'📝', label:'대본 생성' },
    { id:'edit', icon:'✨', label:'대본 편집' },
    { id:'expand', icon:'📐', label:'대본 확장' },
    { id:'guidelines', icon:'✅', label:'가이드라인' },
  ],
  분석: [
    { id:'characters', icon:'👥', label:'캐릭터 분석' },
    { id:'scenes', icon:'🎬', label:'장면 분할' },
    { id:'bgm', icon:'🎵', label:'BGM 추천' },
    { id:'analysis', icon:'🎥', label:'영상 분석' },
  ],
  제작: [
    { id:'media', icon:'🎨', label:'미디어 생성' },
    { id:'subtitle', icon:'💬', label:'자막 생성' },
  ],
  마케팅: [
    { id:'market', icon:'🔍', label:'경쟁·SEO' },
    { id:'ab-test', icon:'🧪', label:'제목 A/B' },
    { id:'series', icon:'📚', label:'시리즈 기획' },
    { id:'calendar', icon:'📅', label:'캘린더' },
    { id:'community', icon:'💬', label:'커뮤니티' },
    { id:'shopping', icon:'🛒', label:'쇼핑 콘텐츠' },
  ],
  배포: [
    { id:'publish', icon:'📄', label:'설명·챕터' },
    { id:'upload', icon:'🚀', label:'업로드 패키지' },
  ],
};
const ALL_TABS = Object.values(WORKFLOW).flat();

/* ══════════════════════════════════════════════
   5. 메인 컴포넌트
   ══════════════════════════════════════════════ */
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [results, setResults] = useState<Record<string,string>>({});
  const [projectName, setProjectName] = useState('새 프로젝트');

  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [provider, setProvider] = useState('gemini');

  // 기본 입력
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [category, setCategory] = useState('교육/정보');
  const [duration, setDuration] = useState('8분');
  const [audience, setAudience] = useState('일반');
  const [videoUrl, setVideoUrl] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [titles, setTitles] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [productPrice, setProductPrice] = useState('');
  const [productFeatures, setProductFeatures] = useState('');
  const [calendarWeeks, setCalendarWeeks] = useState('2');
  const [channelName, setChannelName] = useState('');
  const [shopInput, setShopInput] = useState('');
  const [scriptStyle, setScriptStyle] = useState('review');
  const [genre, setGenre] = useState('');
  const [subGenre, setSubGenre] = useState('');
  const [chapterCount, setChapterCount] = useState('7');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [expandLength, setExpandLength] = useState('15000');
  const [tone, setTone] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [bgmMood, setBgmMood] = useState('');
  const [scriptStructure, setScriptStructure] = useState<string[]>([]);

  // 모드
  const [editMode, setEditMode] = useState('polish');
  const [analysisMode, setAnalysisMode] = useState('video');
  const [marketMode, setMarketMode] = useState('competitors');
  const [publishMode, setPublishMode] = useState('description');
  const [subtitleMode, setSubtitleMode] = useState('subtitles');
  const [mediaMode, setMediaMode] = useState('tts');

  // 장르 선택 UI
  const [hoveredGenre, setHoveredGenre] = useState('');
  const [hoveredSub, setHoveredSub] = useState('');

  const result = results[tab] || '';
  const setResult = (v: string) => setResults(p => ({ ...p, [tab]: v }));
  const handleReset = () => setResults(p => ({ ...p, [tab]: '' }));

  useEffect(() => {
    if (localStorage.getItem('ai-factory-auth') === 'true') setAuthed(true);
    const s = localStorage.getItem('ai-factory-keys');
    if (s) { const k = JSON.parse(s); setGeminiKey(k.gemini||''); setOpenaiKey(k.openai||''); setClaudeKey(k.claude||''); setYoutubeKey(k.youtube||''); }
    const p = localStorage.getItem('ai-factory-project');
    if (p) setProjectName(p);
    const g = localStorage.getItem('ai-factory-genre');
    if (g) { const gd = JSON.parse(g); setGenre(gd.genre||''); setSubGenre(gd.sub||''); }
  }, []);

  // 장르 선택 시 자동 세팅 적용
  const applyGenreSettings = useCallback((genreKey: string, subKey: string) => {
    const cat = GENRE_MAP[genreKey];
    if (!cat) return;
    const sub = cat.subs[subKey];
    if (!sub) return;
    setGenre(genreKey);
    setSubGenre(subKey);
    setTone(sub.tone);
    setSpeaker(sub.speaker);
    setBgmMood(sub.bgm);
    setImageStyle(sub.imageStyle);
    setDuration(sub.duration);
    setChapterCount(String(sub.chapters));
    setScriptStructure(sub.structure);
    localStorage.setItem('ai-factory-genre', JSON.stringify({ genre:genreKey, sub:subKey }));
  }, []);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const saveKeys = () => { localStorage.setItem('ai-factory-keys', JSON.stringify({ gemini:geminiKey, openai:openaiKey, claude:claudeKey, youtube:youtubeKey })); alert('저장됨!'); setShowKeys(false); };
  const getKey = () => provider==='gemini'?geminiKey:provider==='openai'?openaiKey:provider==='claude'?claudeKey:geminiKey;
  const logout = () => { localStorage.removeItem('ai-factory-auth'); setAuthed(false); };

  const callApi = async (endpoint: string, body: any) => {
    setLoading(true); setResult('');
    try {
      const res = await fetch(`/api/${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...body, aiProvider:provider, apiKey:getKey() }) });
      const data = await res.json();
      if (data.error) setResult('❌ '+data.error); else setResult(data.result||data.text||data.content||JSON.stringify(data,null,2));
    } catch(e:any) { setResult('❌ '+e.message); }
    setLoading(false);
  };
  const noKey = () => { setResult('❌ API 키를 먼저 설정하세요. (상단 🔑 버튼)'); return true; };

  // ── 핸들러 ──
  const handleScript = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; const genreInfo = genre && subGenre && GENRE_MAP[genre]?.subs[subGenre]; const customPrompt = genreInfo ? `당신은 유튜브 "${GENRE_MAP[genre].label} > ${genreInfo.label}" 장르 전문 작가입니다.\n\n[장르 설정]\n- 톤: ${genreInfo.tone}\n- 화자: ${genreInfo.speaker}\n- 대본 구조: ${genreInfo.structure.join(' → ')}\n- BGM 무드: ${genreInfo.bgm}\n- 이미지 스타일: ${genreInfo.imageStyle}\n- 목표 길이: ${genreInfo.duration}\n\n[주제] ${topic}\n[플랫폼] ${platform}\n[타깃] ${audience}\n\n위 설정에 맞는 ${genreInfo.duration} 분량의 완성도 높은 대본을 작성해주세요.\n후킹 예시: "${genreInfo.hookExample}"\n\n대본에는 다음을 포함하세요:\n1. 강력한 후킹 (3초 내 시선 잡기)\n2. ${genreInfo.structure.join(' → ')} 구조에 맞는 전개\n3. 화면 지시(이미지/영상 전환 포인트)\n4. 효과음/BGM 삽입 시점\n5. 자막 강조 포인트\n6. 몰입도 높은 문체 (${genreInfo.tone} 톤)\n\n각 챕터별로 명확히 구분해서 작성해주세요.` : undefined; callApi('generate-script',{topic,platform,category,duration,audience,...(customPrompt?{customPrompt}:{})}); };
  const handleSynopsis = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; const genreInfo = genre && subGenre && GENRE_MAP[genre]?.subs[subGenre]; const customPrompt = genreInfo ? `장르: ${GENRE_MAP[genre].label} > ${genreInfo.label}\n톤: ${genreInfo.tone}\n구조: ${genreInfo.structure.join(' → ')}\n\n주제 "${topic}"에 대해 ${chapterCount}개 챕터의 시놉시스를 작성해주세요.\n각 챕터별 내용, 분위기, 핵심 대사, 이미지 컨셉을 포함하세요.` : undefined; callApi('generate-synopsis',{topic,genre:genre?GENRE_MAP[genre]?.label:'',chapterCount:parseInt(chapterCount),...(customPrompt?{customPrompt}:{})}); };
  const handleEdit = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; if(editMode==='polish')callApi('polish-script',{script:scriptText,platform}); else if(editMode==='rewrite')callApi('rewrite-script',{script:scriptText,platform,style:'트렌디'}); else callApi('translate-script',{script:scriptText,targetLanguage:targetLang,platform}); };
  const handleGuidelines = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('check-guidelines',{script:scriptText,platform}); };
  const handleAnalysis = () => { if(!videoUrl){setResult('❌ URL을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; if(analysisMode==='video')callApi('analyze-video',{url:videoUrl,platform}); else callApi('structure-analysis',{url:videoUrl,platform}); };
  const handleMarket = () => { if(!keyword){setResult('❌ 키워드를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; if(marketMode==='competitors')callApi('compare-competitors',{keyword,platform}); else if(marketMode==='seo')callApi('seo-analysis',{keyword,platform}); else callApi('trends',{keyword,platform}); };
  const handleSeries = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('plan-series',{topic,platform,episodeCount:5}); };
  const handleCommunity = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('community-post',{topic,platform}); };
  const handlePublish = () => { if(!getKey())return noKey()&&undefined; if(publishMode==='description'){if(!topic){setResult('❌ 주제를 입력하세요.');return;}callApi('generate-description',{title:topic,platform});} else if(publishMode==='chapters'){if(!scriptText){setResult('❌ 대본을 입력하세요.');return;}callApi('generate-chapters',{script:scriptText});} else{if(!topic){setResult('❌ 주제를 입력하세요.');return;}callApi('upload-checklist',{title:topic,platform});} };
  const handleAbTest = () => { if(!titles){setResult('❌ 제목을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('title-ab-test',{titles:titles.split('\n').filter((t:string)=>t.trim()),topic,platform}); };
  const handleCalendar = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('content-calendar',{topic,platform,weeks:parseInt(calendarWeeks),channelName}); };
  const handleSubtitle = () => { if(!videoUrl){setResult('❌ URL을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; if(subtitleMode==='subtitles')callApi('extract-subtitles',{url:videoUrl}); else callApi('download-video',{url:videoUrl,platform}); };
  const handleShopping = () => { if(!shopInput){setResult('❌ 입력이 필요합니다.');return;} if(!getKey())return noKey()&&undefined; callApi('shopping-content',{productName:shopInput,productPrice,productFeatures,platform,scriptStyle}); };
  const handleMedia = () => { if(!getKey())return noKey()&&undefined; if(mediaMode==='tts'){if(!scriptText){setResult('❌ 텍스트를 입력하세요.');return;}callApi('tts-generate',{text:scriptText});} else{if(!topic){setResult('❌ 제목을 입력하세요.');return;}callApi('generate-thumbnail',{title:topic,style:platform});} };
  const handleExpand = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('expand-script',{script:scriptText,targetLength:expandLength}); };
  const handleCharacters = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('analyze-characters',{script:scriptText}); };
  const handleScenes = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('split-scenes',{script:scriptText,imageStyle}); };
  const handleBgm = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('recommend-bgm',{script:scriptText,genre:genre?GENRE_MAP[genre]?.label:''}); };
  const handleUpload = () => { if(!topic){setResult('❌ 제목을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('upload-package',{title:topic,script:scriptText,category}); };

  /* ── UI 헬퍼 ── */
  const S = {
    btn: (label:string, onClick:()=>void, color='#4f46e5') => <button onClick={onClick} disabled={loading} style={{ padding:'10px 20px', borderRadius:8, background:loading?'#333':color, color:'#fff', border:'none', cursor:loading?'wait':'pointer', fontSize:14, fontWeight:600, width:'100%', marginTop:8, transition:'all 0.2s' }}>{loading?'⏳ 처리 중...':label}</button>,
    reset: () => <button onClick={handleReset} style={{ padding:'8px', borderRadius:6, background:'transparent', color:'#666', border:'1px solid #333', cursor:'pointer', fontSize:12, width:'100%', marginTop:4 }}>🗑️ 초기화</button>,
    input: (val:string, set:(v:string)=>void, ph:string) => <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #252550', background:'#0d0d20', color:'#fff', fontSize:13, boxSizing:'border-box', marginBottom:6, outline:'none' }} />,
    area: (val:string, set:(v:string)=>void, ph:string, rows=4) => <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #252550', background:'#0d0d20', color:'#fff', fontSize:13, boxSizing:'border-box', marginBottom:6, resize:'vertical', outline:'none' }} />,
    sel: (val:string, set:(v:string)=>void, opts:{v:string;l:string}[]) => <select value={val} onChange={e=>set(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #252550', background:'#0d0d20', color:'#fff', fontSize:13, marginBottom:6 }}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>,
    label: (t:string) => <p style={{ color:'#888', marginBottom:3, marginTop:8, fontSize:12, fontWeight:500 }}>{t}</p>,
    mini: (modes:{id:string;label:string}[], cur:string, set:(v:string)=>void) => <div style={{ display:'flex', gap:4, marginBottom:10, flexWrap:'wrap' }}>{modes.map(m=><button key={m.id} onClick={()=>set(m.id)} style={{ padding:'5px 12px', borderRadius:16, border:'none', background:cur===m.id?'#4f46e5':'#1a1a35', color:cur===m.id?'#fff':'#888', cursor:'pointer', fontSize:12, transition:'all 0.2s' }}>{m.label}</button>)}</div>,
  };

  const completedTabs = ALL_TABS.filter(t => results[t.id] && !results[t.id].startsWith('❌')).map(t => t.id);
  const genreSelected = genre && subGenre;
  if (genreSelected && !completedTabs.includes('genre-select')) completedTabs.push('genre-select');
  const totalSteps = ALL_TABS.length;
  const doneSteps = completedTabs.length;

  /* ── 장르 선택 비주얼 UI ── */
  function renderGenreSelector() {
    const selectedCat = GENRE_MAP[genre];
    const selectedSub = selectedCat?.subs[subGenre];

    return (
      <div>
        <h2 style={{fontSize:18,margin:'0 0 6px'}}>🎭 장르 선택</h2>
        <p style={{color:'#888',fontSize:12,marginBottom:16}}>카테고리를 선택하면 서브장르가 나타납니다. 서브장르 선택 시 톤·화자·구조·BGM이 자동으로 세팅됩니다.</p>

        {/* ── 대카테고리 그리드 ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginBottom:16 }}>
          {GENRE_KEYS.map(key => {
            const g = GENRE_MAP[key];
            const isSelected = genre === key;
            const isHovered = hoveredGenre === key;
            return (
              <div key={key}
                onClick={() => { setGenre(key); setSubGenre(''); }}
                onMouseEnter={() => setHoveredGenre(key)}
                onMouseLeave={() => setHoveredGenre('')}
                style={{
                  background: isSelected ? g.gradient : isHovered ? 'rgba(255,255,255,0.05)' : '#0d0d20',
                  border: `2px solid ${isSelected ? g.color : isHovered ? g.color+'60' : '#252550'}`,
                  borderRadius: 12,
                  padding: '14px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  transform: isSelected ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isSelected ? `0 4px 20px ${g.color}30` : 'none',
                  position: 'relative' as const,
                  overflow: 'hidden',
                }}>
                {isSelected && <div style={{position:'absolute',top:6,right:6,width:18,height:18,borderRadius:'50%',background:g.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#000',fontWeight:700}}>✓</div>}
                <div style={{fontSize:28, marginBottom:4, filter: isSelected ? 'none' : 'grayscale(30%)', transition:'filter 0.2s'}}>{g.icon}</div>
                <div style={{fontSize:12, fontWeight:600, color: isSelected ? '#fff' : isHovered ? g.color : '#aaa', transition:'color 0.2s'}}>{g.label}</div>
                <div style={{fontSize:9, color: isSelected ? 'rgba(255,255,255,0.7)' : '#555', marginTop:2, lineHeight:1.3}}>{Object.keys(g.subs).length}개 장르</div>
              </div>
            );
          })}
        </div>

        {/* ── 서브장르 카드 ── */}
        {genre && GENRE_MAP[genre] && (
          <div style={{ background:'#0d0d20', borderRadius:12, padding:16, border:`1px solid ${GENRE_MAP[genre].color}30`, marginBottom:16 }}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <span style={{fontSize:20}}>{GENRE_MAP[genre].icon}</span>
              <div>
                <h3 style={{fontSize:15,margin:0,color:GENRE_MAP[genre].color}}>{GENRE_MAP[genre].label}</h3>
                <p style={{fontSize:11,color:'#666',margin:0}}>{GENRE_MAP[genre].desc}</p>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
              {Object.entries(GENRE_MAP[genre].subs).map(([key, sub]) => {
                const isSelected = subGenre === key;
                const isHovered = hoveredSub === key;
                return (
                  <div key={key}
                    onClick={() => applyGenreSettings(genre, key)}
                    onMouseEnter={() => setHoveredSub(key)}
                    onMouseLeave={() => setHoveredSub('')}
                    style={{
                      background: isSelected ? GENRE_MAP[genre].gradient : isHovered ? `${GENRE_MAP[genre].color}10` : '#161630',
                      border: `1.5px solid ${isSelected ? GENRE_MAP[genre].color : isHovered ? GENRE_MAP[genre].color+'40' : '#252550'}`,
                      borderRadius: 10,
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? `0 2px 12px ${GENRE_MAP[genre].color}20` : 'none',
                    }}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                      <span style={{fontSize:20}}>{sub.icon}</span>
                      <span style={{fontSize:13,fontWeight:600,color:isSelected?'#fff':GENRE_MAP[genre].color}}>{sub.label}</span>
                      {isSelected && <span style={{marginLeft:'auto',fontSize:10,background:GENRE_MAP[genre].color,color:'#000',padding:'1px 6px',borderRadius:8,fontWeight:700}}>선택됨</span>}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:6}}>
                      <span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'rgba(255,255,255,0.08)',color:'#aaa'}}>🎙️ {sub.speaker}</span>
                      <span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'rgba(255,255,255,0.08)',color:'#aaa'}}>🎵 {sub.bgm}</span>
                    </div>
                    <div style={{fontSize:10,color:isSelected?'rgba(255,255,255,0.8)':'#555',lineHeight:1.4,fontStyle:'italic'}}>
                      "{sub.hookExample.slice(0,40)}..."
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 선택 결과 미리보기 ── */}
        {selectedSub && (
          <div style={{ background:'linear-gradient(135deg,#0d0d20,#161630)', borderRadius:12, padding:16, border:`1px solid ${selectedCat!.color}40` }}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <span style={{fontSize:24}}>{selectedSub.icon}</span>
              <div>
                <h3 style={{fontSize:16,margin:0,color:'#fff'}}>{selectedCat!.label} → {selectedSub.label}</h3>
                <p style={{fontSize:11,color:selectedCat!.color,margin:0}}>자동 세팅이 적용되었습니다</p>
              </div>
              <button onClick={()=>setTab('synopsis')} style={{marginLeft:'auto',padding:'6px 14px',borderRadius:8,background:selectedCat!.gradient,color:'#fff',border:'none',cursor:'pointer',fontSize:12,fontWeight:600}}>→ 시놉시스 작성</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:8,marginBottom:12}}>
              {[
                {icon:'🎭',label:'톤',value:selectedSub.tone,color:'#a78bfa'},
                {icon:'🎙️',label:'화자',value:selectedSub.speaker,color:'#60a5fa'},
                {icon:'⏱️',label:'길이',value:selectedSub.duration,color:'#4ade80'},
                {icon:'📑',label:'챕터',value:`${selectedSub.chapters}개`,color:'#f59e0b'},
                {icon:'🎵',label:'BGM',value:selectedSub.bgm,color:'#f472b6'},
                {icon:'🖼️',label:'이미지',value:selectedSub.imageStyle,color:'#22d3ee'},
              ].map(item => (
                <div key={item.label} style={{background:'#0a0a1a',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:16}}>{item.icon}</span>
                  <div>
                    <p style={{fontSize:10,color:'#666',margin:0}}>{item.label}</p>
                    <p style={{fontSize:12,color:item.color,margin:0,fontWeight:600}}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:'#0a0a1a',borderRadius:8,padding:10}}>
              <p style={{fontSize:10,color:'#888',margin:'0 0 6px',fontWeight:600}}>📐 대본 구조</p>
              <div style={{display:'flex',alignItems:'center',gap:0,flexWrap:'wrap'}}>
                {selectedSub.structure.map((step,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center'}}>
                    <span style={{
                      fontSize:11,
                      padding:'4px 10px',
                      borderRadius:16,
                      background:`${selectedCat!.color}15`,
                      color:selectedCat!.color,
                      fontWeight:500,
                      border:`1px solid ${selectedCat!.color}30`,
                    }}>{step}</span>
                    {i < selectedSub.structure.length - 1 && <span style={{color:'#444',margin:'0 2px',fontSize:10}}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginTop:10,background:'#0a0a1a',borderRadius:8,padding:10}}>
              <p style={{fontSize:10,color:'#888',margin:'0 0 4px',fontWeight:600}}>💡 후킹 예시</p>
              <p style={{fontSize:12,color:'#e2e8f0',margin:0,fontStyle:'italic',lineHeight:1.5}}>"{selectedSub.hookExample}"</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── 탭 렌더링 ── */
  function renderTab() {
    switch(tab) {
      case 'overview': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 16px'}}>📊 프로젝트 개요</h2>
        <div style={{background:'#0d0d20',borderRadius:12,padding:16,border:'1px solid #252550',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <p style={{color:'#888',fontSize:11,margin:0}}>프로젝트명</p>
              <input value={projectName} onChange={e=>{setProjectName(e.target.value);localStorage.setItem('ai-factory-project',e.target.value)}} style={{background:'transparent',border:'none',color:'#fff',fontSize:16,fontWeight:600,padding:0,outline:'none',width:200}} />
            </div>
            <div style={{display:'flex',gap:8}}>
              <div style={{textAlign:'center',background:'#1a1a35',borderRadius:8,padding:'8px 16px'}}>
                <p style={{color:'#4ade80',fontSize:20,fontWeight:700,margin:0}}>{doneSteps}</p>
                <p style={{color:'#888',fontSize:10,margin:0}}>완료</p>
              </div>
              <div style={{textAlign:'center',background:'#1a1a35',borderRadius:8,padding:'8px 16px'}}>
                <p style={{color:'#f59e0b',fontSize:20,fontWeight:700,margin:0}}>{totalSteps - doneSteps}</p>
                <p style={{color:'#888',fontSize:10,margin:0}}>남은 단계</p>
              </div>
            </div>
          </div>
          <div style={{background:'#1a1a35',borderRadius:6,height:8,overflow:'hidden'}}>
            <div style={{background:'linear-gradient(90deg,#4f46e5,#7c3aed)',height:'100%',width:`${(doneSteps/totalSteps)*100}%`,borderRadius:6,transition:'width 0.5s'}} />
          </div>
          <p style={{color:'#888',fontSize:11,marginTop:4,textAlign:'right'}}>{Math.round((doneSteps/totalSteps)*100)}% 완료</p>
        </div>
        {/* 현재 장르 표시 */}
        {genre && subGenre && GENRE_MAP[genre]?.subs[subGenre] && (
          <div style={{background:'#0d0d20',borderRadius:12,padding:14,border:`1px solid ${GENRE_MAP[genre].color}30`,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:28}}>{GENRE_MAP[genre].subs[subGenre].icon}</span>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'#fff',margin:0}}>{GENRE_MAP[genre].label} → {GENRE_MAP[genre].subs[subGenre].label}</p>
                <p style={{fontSize:11,color:GENRE_MAP[genre].color,margin:0}}>톤: {GENRE_MAP[genre].subs[subGenre].tone} | BGM: {GENRE_MAP[genre].subs[subGenre].bgm} | {GENRE_MAP[genre].subs[subGenre].duration}</p>
              </div>
              <button onClick={()=>setTab('genre-select')} style={{marginLeft:'auto',padding:'5px 10px',borderRadius:6,background:'#1a1a35',color:'#888',border:'1px solid #333',cursor:'pointer',fontSize:11}}>변경</button>
            </div>
          </div>
        )}
        <h3 style={{fontSize:14,color:'#888',margin:'16px 0 8px'}}>⚡ 워크플로우 단계</h3>
        {Object.entries(WORKFLOW).map(([group, items]) => (
          <div key={group} style={{marginBottom:12}}>
            <p style={{color:'#666',fontSize:11,fontWeight:600,margin:'0 0 4px',textTransform:'uppercase'}}>{group}</p>
            {items.map((item,i) => (
              <div key={item.id} onClick={()=>setTab(item.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:6,cursor:'pointer',background:tab===item.id?'rgba(79,70,229,0.15)':'transparent',marginBottom:2}}>
                <span style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,background:completedTabs.includes(item.id)?'#4ade80':i===0&&!completedTabs.includes(item.id)?'#4f46e5':'#333',color:completedTabs.includes(item.id)?'#000':'#fff'}}>{completedTabs.includes(item.id)?'✓':(i+1)}</span>
                <span style={{fontSize:13,color:completedTabs.includes(item.id)?'#4ade80':'#ccc'}}>{item.icon} {item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>);

      case 'genre-select': return renderGenreSelector();

      case 'synopsis': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📖 시놉시스 / 플롯 생성</h2>
        {genre && subGenre && GENRE_MAP[genre]?.subs[subGenre] && (
          <div style={{background:`${GENRE_MAP[genre].color}10`,borderRadius:8,padding:'8px 12px',marginBottom:10,border:`1px solid ${GENRE_MAP[genre].color}30`,display:'flex',alignItems:'center',gap:8}}>
            <span>{GENRE_MAP[genre].subs[subGenre].icon}</span>
            <span style={{fontSize:12,color:GENRE_MAP[genre].color,fontWeight:500}}>{GENRE_MAP[genre].label} → {GENRE_MAP[genre].subs[subGenre].label}</span>
            <span style={{fontSize:10,color:'#666'}}>| 구조: {GENRE_MAP[genre].subs[subGenre].structure.join(' → ')}</span>
          </div>
        )}
        {S.label('주제')}{S.input(topic,setTopic,'예: 조선시대 최고의 검객 이야기')}
        {S.label('챕터 수')}{S.sel(chapterCount,setChapterCount,[{v:'5',l:'5개'},{v:'7',l:'7개'},{v:'8',l:'8개'},{v:'10',l:'10개'},{v:'12',l:'12개'}])}
        {S.btn('📖 시놉시스 생성',handleSynopsis)}
        {S.reset()}
      </div>);

      case 'script': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📝 대본 생성</h2>
        {genre && subGenre && GENRE_MAP[genre]?.subs[subGenre] && (
          <div style={{background:`${GENRE_MAP[genre].color}10`,borderRadius:8,padding:'8px 12px',marginBottom:10,border:`1px solid ${GENRE_MAP[genre].color}30`,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <span>{GENRE_MAP[genre].subs[subGenre].icon}</span>
            <span style={{fontSize:12,color:GENRE_MAP[genre].color,fontWeight:500}}>{GENRE_MAP[genre].label} → {GENRE_MAP[genre].subs[subGenre].label}</span>
            <span style={{fontSize:10,color:'#666'}}>| 톤: {tone} | {duration} | {speaker}</span>
          </div>
        )}
        {S.label('플랫폼')}{S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram Reels'}])}
        {S.label('타깃 시청자')}{S.sel(audience,setAudience,[{v:'일반',l:'일반'},{v:'10대',l:'10대'},{v:'20대',l:'20대'},{v:'30대',l:'30대'},{v:'40대+',l:'40대+'},{v:'전문가',l:'전문가'}])}
        {S.label('주제')}{S.input(topic,setTopic,'예: 왕초보 유튜브 시작하는 방법')}
        {S.btn('🚀 대본 생성',handleScript)}
        {S.reset()}
      </div>);

      case 'edit': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>✨ 대본 편집</h2>
        {S.mini([{id:'polish',label:'✨ 교정'},{id:'rewrite',label:'🔄 리라이트'},{id:'translate',label:'🌐 번역'}],editMode,setEditMode)}
        {S.area(scriptText,setScriptText,'대본을 붙여넣으세요...')}
        {editMode==='translate'&&<>{S.label('번역 언어')}{S.sel(targetLang,setTargetLang,[{v:'en',l:'영어'},{v:'ja',l:'일본어'},{v:'zh',l:'중국어'},{v:'es',l:'스페인어'},{v:'vi',l:'베트남어'}])}</>}
        {S.btn('✨ 편집 실행',handleEdit)}{S.reset()}
      </div>);

      case 'expand': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📐 대본 확장</h2>
        {S.label('목표 글자 수')}{S.sel(expandLength,setExpandLength,[{v:'10000',l:'10,000자 (약 5분)'},{v:'15000',l:'15,000자 (약 8분)'},{v:'20000',l:'20,000자 (약 10분)'},{v:'30000',l:'30,000자 (약 15분)'}])}
        {S.area(scriptText,setScriptText,'확장할 대본을 붙여넣으세요...',6)}
        {S.btn('📐 대본 확장',handleExpand)}{S.reset()}
      </div>);

      case 'guidelines': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>✅ 가이드라인 체크</h2>
        {S.label('플랫폼')}{S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram'}])}
        {S.area(scriptText,setScriptText,'검사할 대본을 붙여넣으세요...')}
        {S.btn('✅ 가이드라인 체크',handleGuidelines)}{S.reset()}
      </div>);

      case 'characters': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>👥 캐릭터 분석</h2>
        {S.area(scriptText,setScriptText,'분석할 대본을 붙여넣으세요...',6)}
        {S.btn('👥 캐릭터 분석',handleCharacters)}{S.reset()}
      </div>);

      case 'scenes': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🎬 장면 분할</h2>
        {S.label('이미지 스타일')}{S.sel(imageStyle,setImageStyle,[{v:'realistic',l:'📷 사실적'},{v:'character',l:'🧸 캐릭터/3D'},{v:'illustration',l:'🎨 일러스트'},{v:'animation',l:'📺 애니메이션'},{v:'cinematic',l:'🎬 시네마틱'}])}
        {S.area(scriptText,setScriptText,'장면을 분할할 대본을 붙여넣으세요...',6)}
        {S.btn('🎬 장면 분할',handleScenes)}{S.reset()}
      </div>);

      case 'bgm': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🎵 BGM / 효과음 추천</h2>
        {bgmMood && <div style={{background:'#1a1a35',borderRadius:8,padding:'6px 12px',marginBottom:8,display:'inline-block'}}><span style={{fontSize:11,color:'#a78bfa'}}>🎵 현재 BGM 무드: {bgmMood}</span></div>}
        {S.area(scriptText,setScriptText,'BGM을 추천받을 대본을 붙여넣으세요...',6)}
        {S.btn('🎵 BGM 추천',handleBgm)}{S.reset()}
      </div>);

      case 'analysis': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🎥 영상 분석</h2>
        {S.mini([{id:'video',label:'🎥 영상 분석'},{id:'structure',label:'🏗️ 구조 분석'}],analysisMode,setAnalysisMode)}
        {S.input(videoUrl,setVideoUrl,'YouTube/TikTok 영상 URL')}
        {S.btn('🔍 분석',handleAnalysis)}{S.reset()}
      </div>);

      case 'media': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🎨 미디어 생성</h2>
        {S.mini([{id:'tts',label:'🔊 TTS'},{id:'thumbnail',label:'🖼️ 썸네일'}],mediaMode,setMediaMode)}
        {mediaMode==='tts'?<>{S.area(scriptText,setScriptText,'TTS 텍스트...')}{S.btn('🔊 TTS 생성',handleMedia)}</>:<>{S.input(topic,setTopic,'썸네일 주제/컨셉')}{S.btn('🖼️ 썸네일 생성',handleMedia)}</>}
        {S.reset()}
      </div>);

      case 'subtitle': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>💬 자막 생성</h2>
        {S.mini([{id:'subtitles',label:'💬 자막 추출'},{id:'download',label:'⬇️ 다운로드'}],subtitleMode,setSubtitleMode)}
        {S.input(videoUrl,setVideoUrl,'YouTube 영상 URL')}
        {S.btn(subtitleMode==='subtitles'?'💬 자막 추출':'⬇️ 정보 가져오기',handleSubtitle)}{S.reset()}
      </div>);

      case 'market': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🔍 경쟁·SEO·트렌드</h2>
        {S.mini([{id:'competitors',label:'🔍 경쟁'},{id:'seo',label:'🔎 SEO'},{id:'trends',label:'📈 트렌드'}],marketMode,setMarketMode)}
        {S.input(keyword,setKeyword,'키워드 (예: 유튜브 성장법)')}
        {S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram'}])}
        {S.btn('🔍 분석',handleMarket)}{S.reset()}
      </div>);

      case 'ab-test': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🧪 제목 A/B 테스트</h2>
        {S.label('제목 후보들 (줄바꿈 구분)')}{S.area(titles,setTitles,'제목 1\n제목 2\n제목 3')}
        {S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram'}])}
        {S.btn('🧪 A/B 분석',handleAbTest)}{S.reset()}
      </div>);

      case 'series': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📚 시리즈 기획</h2>
        {S.input(topic,setTopic,'시리즈 주제')}{S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram'}])}
        {S.btn('📚 시리즈 기획',handleSeries)}{S.reset()}
      </div>);

      case 'calendar': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📅 콘텐츠 캘린더</h2>
        {S.input(channelName,setChannelName,'채널명')}{S.input(topic,setTopic,'채널 주제')}
        {S.label('기간')}{S.sel(calendarWeeks,setCalendarWeeks,[{v:'1',l:'1주'},{v:'2',l:'2주'},{v:'4',l:'4주'}])}
        {S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram'}])}
        {S.btn('📅 캘린더 생성',handleCalendar)}{S.reset()}
      </div>);

      case 'community': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>💬 커뮤니티 글</h2>
        {S.input(topic,setTopic,'주제')}{S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram'}])}
        {S.btn('💬 커뮤니티 글 생성',handleCommunity)}{S.reset()}
      </div>);

      case 'shopping': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🛒 쇼핑 콘텐츠</h2>
        {S.input(shopInput,setShopInput,'URL 또는 키워드')}
        {S.label('대본 스타일')}{S.sel(scriptStyle,setScriptStyle,[{v:'review',l:'🎯 솔직 리뷰'},{v:'comparison',l:'⚖️ 비교형'},{v:'unboxing',l:'📦 언박싱'},{v:'tip',l:'💡 꿀팁'},{v:'ranking',l:'🏆 랭킹'},{v:'storytelling',l:'📖 스토리텔링'}])}
        {S.label('플랫폼')}{S.sel(platform,setPlatform,[{v:'youtube-shorts',l:'YouTube Shorts'},{v:'tiktok',l:'TikTok'},{v:'instagram-reels',l:'Instagram Reels'}])}
        {S.input(productPrice,setProductPrice,'가격 (선택)')}{S.input(productFeatures,setProductFeatures,'특징 (선택)')}
        {S.btn('🛒 쇼핑 콘텐츠 생성',handleShopping)}{S.reset()}
      </div>);

      case 'publish': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📄 설명·챕터</h2>
        {S.mini([{id:'description',label:'📄 설명란'},{id:'chapters',label:'📑 챕터'},{id:'checklist',label:'☑️ 체크리스트'}],publishMode,setPublishMode)}
        {publishMode==='chapters'?S.area(scriptText,setScriptText,'대본을 붙여넣으세요...'):S.input(topic,setTopic,'영상 제목/주제')}
        {S.btn('📄 생성',handlePublish)}{S.reset()}
      </div>);

      case 'upload': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🚀 업로드 패키지</h2>
        {S.input(topic,setTopic,'영상 제목')}{S.area(scriptText,setScriptText,'대본 (선택)')}{S.input(category,setCategory,'카테고리')}
        {S.btn('🚀 패키지 생성',handleUpload)}{S.reset()}
      </div>);

      default: return <p style={{color:'#888'}}>탭을 선택해주세요.</p>;
    }
  }

  /* ══════════════════════════════════════════════
     메인 렌더
     ══════════════════════════════════════════════ */
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0a1a', color:'#e2e8f0', fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif' }}>
      {/* 사이드바 */}
      <div style={{ width:sidebarOpen?220:60, background:'#0d0d1a', borderRight:'1px solid #1a1a35', transition:'width 0.3s', overflow:'hidden', flexShrink:0, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 12px', borderBottom:'1px solid #1a1a35', display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={()=>setSidebarOpen(!sidebarOpen)}>
          <span style={{fontSize:20}}>🎬</span>
          {sidebarOpen && <span style={{fontSize:13,fontWeight:600,color:'#fff'}}>AI 팩토리</span>}
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {Object.entries(WORKFLOW).map(([group, items]) => (
            <div key={group}>
              {sidebarOpen && <p style={{color:'#444',fontSize:9,fontWeight:700,padding:'8px 14px 2px',textTransform:'uppercase',letterSpacing:1}}>{group}</p>}
              {items.map(item => (
                <div key={item.id} onClick={()=>setTab(item.id)} style={{
                  display:'flex',alignItems:'center',gap:8,padding:sidebarOpen?'7px 14px':'7px 0',
                  cursor:'pointer',
                  background:tab===item.id?'rgba(79,70,229,0.15)':'transparent',
                  borderRight:tab===item.id?'3px solid #4f46e5':'3px solid transparent',
                  justifyContent:sidebarOpen?'flex-start':'center',
                }}>
                  <span style={{fontSize:sidebarOpen?14:18,opacity:completedTabs.includes(item.id)?1:0.5}}>{item.icon}</span>
                  {sidebarOpen && <span style={{fontSize:12,color:completedTabs.includes(item.id)?'#4ade80':tab===item.id?'#fff':'#888'}}>{item.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        {sidebarOpen && <div style={{padding:12,borderTop:'1px solid #1a1a35'}}>
          <button onClick={logout} style={{width:'100%',padding:'6px',borderRadius:6,background:'#1a1a35',color:'#666',border:'none',cursor:'pointer',fontSize:11}}>🚪 로그아웃</button>
        </div>}
      </div>

      {/* 메인 영역 */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* 상단 바 */}
        <div style={{ padding:'10px 20px', borderBottom:'1px solid #1a1a35', display:'flex', alignItems:'center', gap:12, background:'#0d0d1a' }}>
          <span style={{fontSize:14,fontWeight:600,color:'#fff'}}>{projectName}</span>
          {genre && subGenre && GENRE_MAP[genre]?.subs[subGenre] && (
            <span style={{fontSize:11,padding:'3px 8px',borderRadius:12,background:`${GENRE_MAP[genre].color}20`,color:GENRE_MAP[genre].color,border:`1px solid ${GENRE_MAP[genre].color}30`}}>
              {GENRE_MAP[genre].subs[subGenre].icon} {GENRE_MAP[genre].subs[subGenre].label}
            </span>
          )}
          <div style={{flex:1}} />
          <select value={provider} onChange={e=>setProvider(e.target.value)} style={{padding:'5px 10px',borderRadius:6,background:'#1a1a35',color:'#fff',border:'1px solid #252550',fontSize:12}}>
            <option value="gemini">Gemini</option><option value="openai">OpenAI</option><option value="claude">Claude</option>
          </select>
          <button onClick={()=>setShowKeys(!showKeys)} style={{padding:'5px 10px',borderRadius:6,background:showKeys?'#4f46e5':'#1a1a35',color:'#fff',border:'none',cursor:'pointer',fontSize:12}}>🔑</button>
        </div>

        {/* API 키 패널 */}
        {showKeys && (
          <div style={{padding:16,background:'#0d0d1a',borderBottom:'1px solid #1a1a35',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            <input value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} placeholder="Gemini API Key" style={{flex:1,minWidth:150,padding:'6px 10px',borderRadius:6,border:'1px solid #252550',background:'#0a0a15',color:'#fff',fontSize:12}} />
            <input value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} placeholder="OpenAI API Key" style={{flex:1,minWidth:150,padding:'6px 10px',borderRadius:6,border:'1px solid #252550',background:'#0a0a15',color:'#fff',fontSize:12}} />
            <input value={claudeKey} onChange={e=>setClaudeKey(e.target.value)} placeholder="Claude API Key" style={{flex:1,minWidth:150,padding:'6px 10px',borderRadius:6,border:'1px solid #252550',background:'#0a0a15',color:'#fff',fontSize:12}} />
            <button onClick={saveKeys} style={{padding:'6px 16px',borderRadius:6,background:'#4f46e5',color:'#fff',border:'none',cursor:'pointer',fontSize:12,fontWeight:600}}>저장</button>
          </div>
        )}

        {/* 콘텐츠 영역 */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* 입력 패널 */}
          <div style={{ width:'42%', overflowY:'auto', padding:20, borderRight:'1px solid #1a1a35' }}>
            {renderTab()}
          </div>
          {/* 결과 패널 */}
          <div style={{ flex:1, overflowY:'auto', padding:20, background:'#080815' }}>
            {loading ? (
              <div style={{textAlign:'center',padding:40}}>
                <div style={{fontSize:32,marginBottom:12,animation:'spin 1s linear infinite'}}>⏳</div>
                <p style={{color:'#888',fontSize:13}}>AI가 열심히 작업 중입니다...</p>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : result ? (
              <div>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <button onClick={()=>{navigator.clipboard.writeText(result);}} style={{padding:'5px 12px',borderRadius:6,background:'#1a1a35',color:'#888',border:'none',cursor:'pointer',fontSize:11}}>📋 복사</button>
                  <button onClick={()=>setScriptText(result)} style={{padding:'5px 12px',borderRadius:6,background:'#1a1a35',color:'#888',border:'none',cursor:'pointer',fontSize:11}}>📝 대본에 적용</button>
                </div>
                <div dangerouslySetInnerHTML={{__html:renderMarkdown(result)}} style={{lineHeight:1.7,fontSize:14}} />
              </div>
            ) : (
              <div style={{textAlign:'center',padding:40,color:'#333'}}>
                <div style={{fontSize:48,marginBottom:12}}>📋</div>
                <p style={{fontSize:14}}>왼쪽에서 작업을 실행하면 결과가 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
