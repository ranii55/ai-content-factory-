'use client';
import { useState, useEffect, useCallback } from 'react';

/* ── 로그인 화면 ── */
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

/* ── 마크다운 렌더러 ── */
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

/* ── 워크플로우 단계 정의 (트파 스타일) ── */
const WORKFLOW = {
  준비: [
    { id:'overview', icon:'📊', label:'프로젝트 개요' },
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

/* ── 메인 컴포넌트 ── */
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

  // 입력 상태
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
  const [genre, setGenre] = useState('정보/교육');
  const [chapterCount, setChapterCount] = useState('7');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [expandLength, setExpandLength] = useState('15000');

  // 모드 상태
  const [editMode, setEditMode] = useState('polish');
  const [analysisMode, setAnalysisMode] = useState('video');
  const [marketMode, setMarketMode] = useState('competitors');
  const [publishMode, setPublishMode] = useState('description');
  const [subtitleMode, setSubtitleMode] = useState('subtitles');
  const [mediaMode, setMediaMode] = useState('tts');

  const result = results[tab] || '';
  const setResult = (v: string) => setResults(p => ({ ...p, [tab]: v }));
  const handleReset = () => setResults(p => ({ ...p, [tab]: '' }));

  useEffect(() => {
    if (localStorage.getItem('ai-factory-auth') === 'true') setAuthed(true);
    const s = localStorage.getItem('ai-factory-keys');
    if (s) { const k = JSON.parse(s); setGeminiKey(k.gemini||''); setOpenaiKey(k.openai||''); setClaudeKey(k.claude||''); setYoutubeKey(k.youtube||''); }
    const p = localStorage.getItem('ai-factory-project');
    if (p) setProjectName(p);
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

  // ── 핸들러들 ──
  const handleScript = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('generate-script',{topic,platform,category,duration,audience}); };
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
  // 새 핸들러들
  const handleSynopsis = () => { if(!topic){setResult('❌ 주제를 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('generate-synopsis',{topic,genre,chapterCount:parseInt(chapterCount)}); };
  const handleExpand = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('expand-script',{script:scriptText,targetLength:expandLength}); };
  const handleCharacters = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('analyze-characters',{script:scriptText}); };
  const handleScenes = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('split-scenes',{script:scriptText,imageStyle}); };
  const handleBgm = () => { if(!scriptText){setResult('❌ 대본을 입력하세요.');return;} if(!getKey())return noKey()&&undefined; callApi('recommend-bgm',{script:scriptText,genre}); };
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
  const totalSteps = ALL_TABS.length;
  const doneSteps = completedTabs.length;

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

      case 'synopsis': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📖 시놉시스 / 플롯 생성</h2>
        <p style={{color:'#888',fontSize:12,marginBottom:12}}>대본 작성 전 전체 구조를 먼저 기획합니다</p>
        {S.label('주제')}{S.input(topic,setTopic,'예: 조선시대 최고의 검객 이야기')}
        {S.label('장르')}{S.sel(genre,setGenre,[{v:'정보/교육',l:'📚 정보/교육'},{v:'스토리텔링',l:'📖 스토리텔링'},{v:'드라마',l:'🎭 드라마'},{v:'미스터리',l:'🔍 미스터리'},{v:'공포',l:'👻 공포'},{v:'코미디',l:'😂 코미디'},{v:'다큐멘터리',l:'🎬 다큐멘터리'}])}
        {S.label('챕터 수')}{S.sel(chapterCount,setChapterCount,[{v:'5',l:'5개'},{v:'7',l:'7개'},{v:'8',l:'8개'},{v:'10',l:'10개'},{v:'12',l:'12개'}])}
        {S.btn('📖 시놉시스 생성',handleSynopsis)}
        {S.reset()}
      </div>);

      case 'script': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>📝 대본 생성</h2>
        {S.label('플랫폼')}{S.sel(platform,setPlatform,[{v:'youtube',l:'YouTube'},{v:'tiktok',l:'TikTok'},{v:'instagram',l:'Instagram Reels'}])}
        {S.label('카테고리')}{S.sel(category,setCategory,[{v:'교육/정보',l:'교육/정보'},{v:'엔터테인먼트',l:'엔터테인먼트'},{v:'뷰티/패션',l:'뷰티/패션'},{v:'먹방/요리',l:'먹방/요리'},{v:'게임',l:'게임'},{v:'브이로그',l:'브이로그'},{v:'리뷰',l:'리뷰'},{v:'뉴스/시사',l:'뉴스/시사'}])}
        {S.label('영상 길이')}{S.sel(duration,setDuration,[{v:'1분 (쇼츠)',l:'1분 (쇼츠)'},{v:'5분',l:'5분'},{v:'8분',l:'8분'},{v:'10분',l:'10분'},{v:'15분',l:'15분'},{v:'20분+',l:'20분+'}])}
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
        <p style={{color:'#888',fontSize:12,marginBottom:12}}>짧은 대본을 원하는 길이로 확장합니다</p>
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
        <p style={{color:'#888',fontSize:12,marginBottom:12}}>대본에서 등장인물을 추출하고 TTS 음성을 추천합니다</p>
        {S.area(scriptText,setScriptText,'분석할 대본을 붙여넣으세요...',6)}
        {S.btn('👥 캐릭터 분석',handleCharacters)}{S.reset()}
      </div>);

      case 'scenes': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🎬 장면 분할</h2>
        <p style={{color:'#888',fontSize:12,marginBottom:12}}>대본을 장면별로 나누고 이미지 프롬프트를 생성합니다</p>
        {S.label('이미지 스타일')}{S.sel(imageStyle,setImageStyle,[{v:'realistic',l:'📷 사실적'},{v:'character',l:'🧸 캐릭터/3D'},{v:'illustration',l:'🎨 일러스트'},{v:'animation',l:'📺 애니메이션'},{v:'cinematic',l:'🎬 시네마틱'}])}
        {S.area(scriptText,setScriptText,'장면을 분할할 대본을 붙여넣으세요...',6)}
        {S.btn('🎬 장면 분할',handleScenes)}{S.reset()}
      </div>);

      case 'bgm': return (<div>
        <h2 style={{fontSize:18,margin:'0 0 12px'}}>🎵 BGM / 효과음 추천</h2>
        <p style={{color:'#888',fontSize:12,marginBottom:12}}>대본 분위기에 맞는 무료 BGM과 효과음을 추천합니다</p>
        {S.label('장르')}{S.sel(genre,setGenre,[{v:'정보/교육',l:'📚 정보/교육'},{v:'스토리텔링',l:'📖 스토리텔링'},{v:'드라마',l:'🎭 드라마'},{v:'코미디',l:'😂 코미디'},{v:'공포/스릴러',l:'👻 공포/스릴러'},{v:'감성/힐링',l:'💆 감성/힐링'}])}
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
        {subtitleMode==='subtitles'&&<>{S.label('번역 언어')}{S.sel(targetLang,setTargetLang,[{v:'none',l:'번역 안 함'},{v:'en',l:'영어'},{v:'ja',l:'일본어'},{v:'zh',l:'중국어'},{v:'ko',l:'한국어'}])}</>}
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
        <p style={{color:'#888',fontSize:12,marginBottom:12}}>제목·설명·태그·해시태그·썸네일 텍스트를 한번에 생성</p>
        {S.label('영상 제목')}{S.input(topic,setTopic,'영상 제목')}
        {S.label('카테고리')}{S.sel(category,setCategory,[{v:'교육',l:'교육'},{v:'엔터테인먼트',l:'엔터테인먼트'},{v:'게임',l:'게임'},{v:'뷰티',l:'뷰티'},{v:'음악',l:'음악'},{v:'뉴스',l:'뉴스'}])}
        {S.label('대본 (선택)')}{S.area(scriptText,setScriptText,'대본이 있으면 더 정확한 결과',3)}
        {S.btn('🚀 패키지 생성',handleUpload)}{S.reset()}
      </div>);

      default: return null;
    }
  }

  /* ── 메인 레이아웃 (트파 스타일) ── */
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a1a', color:'#fff', fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif', display:'flex' }}>

      {/* ── 왼쪽 사이드바 ── */}
      <div style={{ width:sidebarOpen?220:0, minHeight:'100vh', background:'#101025', borderRight:'1px solid #1e1e3e', transition:'width 0.3s', overflow:'hidden', flexShrink:0, display:'flex', flexDirection:'column' }}>
        {/* 로고 */}
        <div style={{ padding:'16px 14px', borderBottom:'1px solid #1e1e3e' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>
            <div><p style={{ margin:0, fontSize:13, fontWeight:700, color:'#fff' }}>AI 콘텐츠 팩토리</p><p style={{ margin:0, fontSize:10, color:'#666' }}>Project Editor</p></div>
          </div>
        </div>

        {/* 프로젝트명 */}
        <div style={{ padding:'10px 14px', borderBottom:'1px solid #1e1e3e' }}>
          <p style={{ margin:0, fontSize:11, color:'#666' }}>현재 프로젝트</p>
          <p style={{ margin:'2px 0 0', fontSize:13, color:'#fff', fontWeight:500 }}>{projectName}</p>
        </div>

        {/* 탭 메뉴 - 상단 네비 */}
        <div style={{ display:'flex', borderBottom:'1px solid #1e1e3e' }}>
          {['설정','미디어','분석'].map((l,i)=><button key={l} style={{ flex:1, padding:'8px 0', background:'transparent', border:'none', color:i===0?'#fff':'#666', cursor:'pointer', fontSize:11, borderBottom:i===0?'2px solid #4f46e5':'none' }}>{l}</button>)}
        </div>

        {/* 워크플로우 메뉴 */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {Object.entries(WORKFLOW).map(([group, items]) => (
            <div key={group} style={{ marginBottom:4 }}>
              <p style={{ color:'#555', fontSize:10, fontWeight:700, padding:'6px 14px 2px', margin:0, letterSpacing:1 }}>{group === '준비' ? '📋 준비' : group === '분석' ? '🔬 분석' : group === '제작' ? '🛠️ 제작' : group === '마케팅' ? '📈 마케팅' : '🚀 배포'}</p>
              {items.map(item => (
                <button key={item.id} onClick={()=>setTab(item.id)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 14px', background:tab===item.id?'rgba(79,70,229,0.2)':'transparent', border:'none', color:tab===item.id?'#a5b4fc':completedTabs.includes(item.id)?'#4ade80':'#999', cursor:'pointer', fontSize:12, textAlign:'left', borderLeft:tab===item.id?'3px solid #4f46e5':'3px solid transparent', transition:'all 0.15s' }}>
                  {completedTabs.includes(item.id) ? <span style={{color:'#4ade80',fontSize:11}}>✓</span> : <span style={{fontSize:11}}>{item.icon}</span>}
                  <span>{item.label}</span>
                  {completedTabs.includes(item.id) && <span style={{marginLeft:'auto',fontSize:9,color:'#4ade80'}}>완료</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── 메인 영역 ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* 상단 헤더 */}
        <div style={{ background:'#101025', borderBottom:'1px solid #1e1e3e', padding:'8px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:'transparent', border:'1px solid #333', borderRadius:6, color:'#888', cursor:'pointer', padding:'4px 8px', fontSize:14 }}>{sidebarOpen?'◀':'▶'}</button>
            <span style={{ color:'#888', fontSize:13 }}>{ALL_TABS.find(t=>t.id===tab)?.icon} {ALL_TABS.find(t=>t.id===tab)?.label}</span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <select value={provider} onChange={e=>setProvider(e.target.value)} style={{ padding:'5px 8px', borderRadius:6, border:'1px solid #333', background:'#0d0d20', color:'#fff', fontSize:12 }}>
              <option value="gemini">Gemini</option><option value="openai">GPT-4o</option><option value="claude">Claude</option>
            </select>
            <button onClick={()=>setShowKeys(!showKeys)} style={{ padding:'5px 10px', borderRadius:6, background:showKeys?'#4f46e5':'#1a1a35', color:'#fff', border:'1px solid #333', cursor:'pointer', fontSize:12 }}>🔑</button>
            <button onClick={logout} style={{ padding:'5px 10px', borderRadius:6, background:'#1a1a35', color:'#ef4444', border:'1px solid #333', cursor:'pointer', fontSize:12 }}>🚪</button>
          </div>
        </div>

        {/* API 키 패널 */}
        {showKeys && (
          <div style={{ background:'#101025', borderBottom:'1px solid #1e1e3e', padding:'12px 16px' }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'end' }}>
              <div style={{flex:1,minWidth:150}}><p style={{color:'#888',fontSize:10,margin:'0 0 3px'}}>Gemini</p><input value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} placeholder="AIza..." style={{width:'100%',padding:'6px 8px',borderRadius:6,border:'1px solid #252550',background:'#0d0d20',color:'#fff',fontSize:12,boxSizing:'border-box'}} /></div>
              <div style={{flex:1,minWidth:150}}><p style={{color:'#888',fontSize:10,margin:'0 0 3px'}}>OpenAI</p><input value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} placeholder="sk-..." style={{width:'100%',padding:'6px 8px',borderRadius:6,border:'1px solid #252550',background:'#0d0d20',color:'#fff',fontSize:12,boxSizing:'border-box'}} /></div>
              <div style={{flex:1,minWidth:150}}><p style={{color:'#888',fontSize:10,margin:'0 0 3px'}}>Claude</p><input value={claudeKey} onChange={e=>setClaudeKey(e.target.value)} placeholder="sk-ant-..." style={{width:'100%',padding:'6px 8px',borderRadius:6,border:'1px solid #252550',background:'#0d0d20',color:'#fff',fontSize:12,boxSizing:'border-box'}} /></div>
              <button onClick={saveKeys} style={{padding:'6px 16px',borderRadius:6,background:'#4f46e5',color:'#fff',border:'none',cursor:'pointer',fontSize:12,fontWeight:600}}>💾 저장</button>
            </div>
          </div>
        )}

        {/* 콘텐츠 영역 */}
        <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>
          {/* 왼쪽 패널 - 입력 */}
          <div style={{ width:360, minWidth:300, borderRight:'1px solid #1e1e3e', overflowY:'auto', padding:16, background:'#0e0e22' }}>
            {renderTab()}
          </div>

          {/* 오른쪽 패널 - 결과 */}
          <div style={{ flex:1, overflowY:'auto', padding:16, background:'#0a0a1a' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <h3 style={{ margin:0, fontSize:14, color:'#888' }}>📋 결과</h3>
              {result && <div style={{display:'flex',gap:4}}>
                <button onClick={()=>{navigator.clipboard.writeText(result);alert('복사됨!');}} style={{padding:'4px 10px',borderRadius:6,background:'#1a1a35',color:'#fff',border:'1px solid #333',cursor:'pointer',fontSize:11}}>📋 복사</button>
                <button onClick={handleReset} style={{padding:'4px 10px',borderRadius:6,background:'#1a1a35',color:'#ef4444',border:'1px solid #333',cursor:'pointer',fontSize:11}}>🗑️</button>
              </div>}
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <div style={{ width:40, height:40, border:'3px solid #252550', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
                <p style={{ color:'#888', fontSize:13 }}>AI가 작업 중입니다...</p>
              </div>
            ) : result ? (
              result.startsWith('❌') ? (
                <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:16 }}>
                  <p style={{ color:'#ef4444', margin:0, fontSize:14 }}>{result}</p>
                </div>
              ) : (
                <div style={{ fontSize:14, lineHeight:1.8, color:'#d1d5db' }} dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }} />
              )
            ) : (
              <div style={{ textAlign:'center', padding:60 }}>
                <p style={{ fontSize:40, marginBottom:8 }}>{ALL_TABS.find(t=>t.id===tab)?.icon || '📋'}</p>
                <p style={{ color:'#555', fontSize:13 }}>왼쪽에서 입력 후 실행하면 결과가 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: #252550; border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
      `}</style>
    </div>
  );
}
