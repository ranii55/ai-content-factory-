'use client';
import { useState, useEffect } from 'react';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const handleLogin = () => {
    if (pw === 'rani2024!') {
      localStorage.setItem('ai-factory-auth', 'true');
      onLogin();
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)' }}>
      <div style={{ background: '#1e1e3a', padding: 40, borderRadius: 16, textAlign: 'center', minWidth: 320 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>🔒 AI 콘텐츠 팩토리</h1>
        <p style={{ color: '#aaa', marginBottom: 24 }}>비밀번호를 입력하세요</p>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="비밀번호" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #333', background: '#0f0f23', color: '#fff', fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</p>}
        <button onClick={handleLogin} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontSize: 16, border: 'none', cursor: 'pointer' }}>로그인</button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'script', icon: '📝', label: '대본 생성' },
  { id: 'edit', icon: '✨', label: '대본 편집' },
  { id: 'guidelines', icon: '✅', label: '가이드라인' },
  { id: 'analysis', icon: '🎥', label: '영상 분석' },
  { id: 'market', icon: '🔍', label: '경쟁·SEO' },
  { id: 'series', icon: '📚', label: '시리즈' },
  { id: 'community', icon: '💬', label: '커뮤니티' },
  { id: 'publish', icon: '📄', label: '설명·챕터' },
  { id: 'ab-test', icon: '🧪', label: '제목 A/B' },
  { id: 'calendar', icon: '📅', label: '캘린더' },
  { id: 'subtitle', icon: '💬', label: '자막·다운' },
  { id: 'shopping', icon: '🛒', label: '쇼핑 콘텐츠' },
  { id: 'media', icon: '🎨', label: '미디어' },
];

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('script');
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  // 탭별 결과 저장 (탭 이동해도 유지됨)
  const [results, setResults] = useState<Record<string, string>>({});

  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [provider, setProvider] = useState('gemini');

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
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productFeatures, setProductFeatures] = useState('');
  const [calendarWeeks, setCalendarWeeks] = useState('2');
  const [channelName, setChannelName] = useState('');
  const [shopInput, setShopInput] = useState('');
  const [scriptStyle, setScriptStyle] = useState('review');

  const [editMode, setEditMode] = useState('polish');
  const [analysisMode, setAnalysisMode] = useState('video');
  const [marketMode, setMarketMode] = useState('competitors');
  const [publishMode, setPublishMode] = useState('description');
  const [subtitleMode, setSubtitleMode] = useState('subtitles');
  const [mediaMode, setMediaMode] = useState('tts');

  // 현재 탭의 결과 가져오기/설정하기
  const result = results[tab] || '';
  const setResult = (val: string) => setResults(prev => ({ ...prev, [tab]: val }));

  // 현재 탭의 결과만 초기화
  function handleReset() {
    setResults(prev => ({ ...prev, [tab]: '' }));
  }

  useEffect(() => {
    const a = localStorage.getItem('ai-factory-auth');
    if (a === 'true') setAuthed(true);
    const saved = localStorage.getItem('ai-factory-keys');
    if (saved) {
      const k = JSON.parse(saved);
      setGeminiKey(k.gemini || '');
      setOpenaiKey(k.openai || '');
      setClaudeKey(k.claude || '');
      setYoutubeKey(k.youtube || '');
    }
  }, []);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  function saveKeys() {
    localStorage.setItem('ai-factory-keys', JSON.stringify({ gemini: geminiKey, openai: openaiKey, claude: claudeKey, youtube: youtubeKey }));
    alert('API 키가 저장되었습니다!');
    setShowKeys(false);
  }
  function getKey() {
    if (provider === 'gemini') return geminiKey;
    if (provider === 'openai') return openaiKey;
    if (provider === 'claude') return claudeKey;
    return geminiKey;
  }
  function logout() {
    localStorage.removeItem('ai-factory-auth');
    setAuthed(false);
  }
  async function callApi(endpoint: string, body: any) {
    setLoading(true); setResult('');
    try {
      const res = await fetch(`/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, aiProvider: provider, apiKey: getKey() }) });
      const data = await res.json();
      if (data.error) { setResult('❌ ' + data.error); } else { setResult(data.result || data.text || data.content || JSON.stringify(data, null, 2)); }
    } catch (e: any) { setResult('❌ ' + e.message); }
    setLoading(false);
  }
  function handleScript() {
    if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요.'); return; }
    callApi('generate-script', { topic, platform, category, duration, audience });
  }
  function handleEdit() {
    if (!scriptText) { setResult('❌ 대본을 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    if (editMode === 'polish') callApi('polish-script', { script: scriptText, platform });
    else if (editMode === 'rewrite') callApi('rewrite-script', { script: scriptText, platform, style: '트렌디' });
    else if (editMode === 'translate') callApi('translate-script', { script: scriptText, targetLanguage: targetLang, platform });
  }
  function handleGuidelines() {
    if (!scriptText) { setResult('❌ 대본을 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    callApi('check-guidelines', { script: scriptText, platform });
  }
  function handleAnalysis() {
    if (!videoUrl) { setResult('❌ 영상 URL을 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    if (analysisMode === 'video') callApi('analyze-video', { url: videoUrl, platform });
    else callApi('structure-analysis', { url: videoUrl, platform });
  }
  function handleMarket() {
    if (!keyword) { setResult('❌ 키워드를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    if (marketMode === 'competitors') callApi('compare-competitors', { keyword, platform });
    else if (marketMode === 'seo') callApi('seo-analysis', { keyword, platform });
    else callApi('trends', { keyword, platform });
  }
  function handleSeries() {
    if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    callApi('plan-series', { topic, platform, episodeCount: 5 });
  }
  function handleCommunity() {
    if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    callApi('community-post', { topic, platform });
  }
  function handlePublish() {
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    if (publishMode === 'description') {
      if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
      callApi('generate-description', { title: topic, platform });
    } else if (publishMode === 'chapters') {
      if (!scriptText) { setResult('❌ 대본을 입력해 주세요.'); return; }
      callApi('generate-chapters', { script: scriptText });
    } else {
      if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
      callApi('upload-checklist', { title: topic, platform });
    }
  }
  function handleAbTest() {
    if (!titles) { setResult('❌ 제목 후보를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    const titleList = titles.split('\n').filter((t: string) => t.trim());
    callApi('title-ab-test', { titles: titleList, topic, platform });
  }
  function handleCalendar() {
    if (!topic) { setResult('❌ 채널 주제를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    callApi('content-calendar', { topic, platform, weeks: parseInt(calendarWeeks), channelName });
  }
  function handleSubtitle() {
    if (!videoUrl) { setResult('❌ 영상 URL을 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    if (subtitleMode === 'subtitles') callApi('extract-subtitles', { url: videoUrl });
    else callApi('download-video', { url: videoUrl, platform });
  }
  function handleShopping() {
    if (!shopInput) { setResult('❌ URL 또는 키워드를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    callApi('shopping-content', { productName: shopInput, productPrice, productFeatures, platform, scriptStyle });
  }
  function handleMedia() {
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요. (우측 상단 🔑 버튼)'); return; }
    if (mediaMode === 'tts') {
      if (!scriptText) { setResult('❌ 텍스트를 입력해 주세요.'); return; }
      callApi('tts-generate', { text: scriptText });
    } else {
      if (!topic) { setResult('❌ 제목을 입력해 주세요.'); return; }
      callApi('generate-thumbnail', { title: topic, style: platform });
    }
  }

  const btn = (label: string, onClick: () => void, color = '#667eea') => (
    <button onClick={onClick} disabled={loading} style={{ padding: '12px 24px', borderRadius: 8, background: loading ? '#555' : color, color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: 15, fontWeight: 600, width: '100%', marginTop: 8 }}>
      {loading ? '⏳ 처리 중...' : label}
    </button>
  );
  const resetBtn = () => (
    <button onClick={handleReset} style={{ padding: '10px 24px', borderRadius: 8, background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, width: '100%', marginTop: 6 }}>
      🗑️ 초기화
    </button>
  );
  const input = (val: string, set: (v: string) => void, ph: string) => (
    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 8 }} />
  );
  const textarea = (val: string, set: (v: string) => void, ph: string) => (
    <textarea value={val} onChange={e => set(e.target.value)} placeholder={ph} rows={5} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 8, resize: 'vertical' }} />
  );
  const select = (val: string, set: (v: string) => void, opts: { v: string; l: string }[]) => (
    <select value={val} onChange={e => set(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, marginBottom: 8 }}>
      {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
  const miniTab = (modes: { id: string; label: string }[], cur: string, set: (v: string) => void) => (
    <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
      {modes.map(m => (
        <button key={m.id} onClick={() => set(m.id)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: cur === m.id ? '#667eea' : '#2a2a4a', color: '#fff', cursor: 'pointer', fontSize: 13 }}>{m.label}</button>
      ))}
    </div>
  );
  function renderTab() {
    switch (tab) {
      case 'script':
        return (
          <div>
            <h2>📝 대본 생성</h2>
            <p style={{ color: '#aaa', marginBottom: 4 }}>플랫폼</p>
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram Reels' }])}
            <p style={{ color: '#aaa', marginBottom: 4 }}>카테고리</p>
            {select(category, setCategory, [{ v: '교육/정보', l: '교육/정보' }, { v: '엔터테인먼트', l: '엔터테인먼트' }, { v: '뷰티/패션', l: '뷰티/패션' }, { v: '먹방/요리', l: '먹방/요리' }, { v: '게임', l: '게임' }, { v: '브이로그', l: '브이로그' }, { v: '리뷰', l: '리뷰' }, { v: '뉴스/시사', l: '뉴스/시사' }])}
            <p style={{ color: '#aaa', marginBottom: 4 }}>영상 길이</p>
            {select(duration, setDuration, [{ v: '1분 (쇼츠)', l: '1분 (쇼츠)' }, { v: '5분 (짧은)', l: '5분 (짧은)' }, { v: '8분', l: '8분' }, { v: '10분 (중간)', l: '10분 (중간)' }, { v: '15분 (긴)', l: '15분 (긴)' }, { v: '20분+', l: '20분+' }])}
            <p style={{ color: '#aaa', marginBottom: 4 }}>타깃 시청자</p>
            {select(audience, setAudience, [{ v: '일반', l: '일반' }, { v: '10대', l: '10대' }, { v: '20대', l: '20대' }, { v: '30대', l: '30대' }, { v: '40대+', l: '40대+' }, { v: '전문가', l: '전문가' }])}
            <p style={{ color: '#aaa', marginBottom: 4 }}>주제</p>
            {input(topic, setTopic, '예: 왕초보 유튜브 시작하는 방법')}
            {btn('🚀 대본 생성', handleScript)}
            {resetBtn()}
          </div>
        );
      case 'edit':
        return (
          <div>
            <h2>✨ 대본 편집</h2>
            {miniTab([{ id: 'polish', label: '✨ 교정' }, { id: 'rewrite', label: '🔄 리라이트' }, { id: 'translate', label: '🌐 번역' }], editMode, setEditMode)}
            {textarea(scriptText, setScriptText, '대본을 붙여넣으세요...')}
            {editMode === 'translate' && (
              <>
                <p style={{ color: '#aaa', marginBottom: 4 }}>번역 언어</p>
                {select(targetLang, setTargetLang, [{ v: 'en', l: '영어' }, { v: 'ja', l: '일본어' }, { v: 'zh', l: '중국어' }, { v: 'es', l: '스페인어' }, { v: 'vi', l: '베트남어' }, { v: 'th', l: '태국어' }])}
              </>
            )}
            {btn('✨ 편집 실행', handleEdit)}
            {resetBtn()}
          </div>
        );
      case 'guidelines':
        return (
          <div>
            <h2>✅ 가이드라인 체크</h2>
            <p style={{ color: '#aaa', marginBottom: 4 }}>플랫폼</p>
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram' }])}
            {textarea(scriptText, setScriptText, '검사할 대본을 붙여넣으세요...')}
            {btn('✅ 가이드라인 체크', handleGuidelines)}
            {resetBtn()}
          </div>
        );
      case 'analysis':
        return (
          <div>
            <h2>🎥 영상 분석</h2>
            {miniTab([{ id: 'video', label: '🎥 영상 분석' }, { id: 'structure', label: '🏗️ 구조 분석' }], analysisMode, setAnalysisMode)}
            {input(videoUrl, setVideoUrl, 'YouTube/TikTok 영상 URL 입력')}
            {btn('🔍 분석', handleAnalysis)}
            {resetBtn()}
          </div>
        );
      case 'market':
        return (
          <div>
            <h2>🔍 경쟁·SEO·트렌드</h2>
            {miniTab([{ id: 'competitors', label: '🔍 경쟁 비교' }, { id: 'seo', label: '🔎 SEO' }, { id: 'trends', label: '📈 트렌드' }], marketMode, setMarketMode)}
            {input(keyword, setKeyword, '키워드 입력 (예: 유튜브 성장법)')}
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram' }])}
            {btn('🔍 분석', handleMarket)}
            {resetBtn()}
          </div>
        );
      case 'series':
        return (
          <div>
            <h2>📚 시리즈 기획</h2>
            {input(topic, setTopic, '시리즈 주제 (예: 초보 유튜버 성장기)')}
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram' }])}
            {btn('📚 시리즈 기획', handleSeries)}
            {resetBtn()}
          </div>
        );
      case 'community':
        return (
          <div>
            <h2>💬 커뮤니티 글</h2>
            {input(topic, setTopic, '주제 입력')}
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram' }])}
            {btn('💬 커뮤니티 글 생성', handleCommunity)}
            {resetBtn()}
          </div>
        );
      case 'publish':
        return (
          <div>
            <h2>📄 설명·챕터·체크리스트</h2>
            {miniTab([{ id: 'description', label: '📄 설명란' }, { id: 'chapters', label: '📑 챕터' }, { id: 'checklist', label: '☑️ 체크리스트' }], publishMode, setPublishMode)}
            {publishMode === 'chapters' ? textarea(scriptText, setScriptText, '대본을 붙여넣으세요...') : input(topic, setTopic, '영상 제목/주제 입력')}
            {btn('📄 생성', handlePublish)}
            {resetBtn()}
          </div>
        );
      case 'ab-test':
        return (
          <div>
            <h2>🧪 제목 A/B 테스트</h2>
            <p style={{ color: '#aaa', marginBottom: 4 }}>제목 후보들 (줄바꿈으로 구분)</p>
            {textarea(titles, setTitles, '제목 1\n제목 2\n제목 3')}
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram' }])}
            {btn('🧪 A/B 분석', handleAbTest)}
            {resetBtn()}
          </div>
        );
      case 'calendar':
        return (
          <div>
            <h2>📅 콘텐츠 캘린더</h2>
            {input(channelName, setChannelName, '채널명 입력')}
            {input(topic, setTopic, '채널 주제 (예: IT 리뷰, 뷰티, 먹방)')}
            <p style={{ color: '#aaa', marginBottom: 4 }}>기간</p>
            {select(calendarWeeks, setCalendarWeeks, [{ v: '1', l: '1주' }, { v: '2', l: '2주' }, { v: '4', l: '4주 (1달)' }])}
            {select(platform, setPlatform, [{ v: 'youtube', l: 'YouTube' }, { v: 'tiktok', l: 'TikTok' }, { v: 'instagram', l: 'Instagram' }])}
            {btn('📅 캘린더 생성', handleCalendar)}
            {resetBtn()}
          </div>
        );
      case 'subtitle':
        return (
          <div>
            <h2>💬 자막·다운로드</h2>
            {miniTab([{ id: 'subtitles', label: '💬 자막 추출' }, { id: 'download', label: '⬇️ 다운로드' }], subtitleMode, setSubtitleMode)}
            {input(videoUrl, setVideoUrl, 'YouTube 영상 URL 입력')}
            {subtitleMode === 'subtitles' && (
              <>
                <p style={{ color: '#aaa', marginBottom: 4 }}>번역 언어 (선택)</p>
                {select(targetLang, setTargetLang, [{ v: 'none', l: '번역 안 함' }, { v: 'en', l: '영어' }, { v: 'ja', l: '일본어' }, { v: 'zh', l: '중국어' }, { v: 'ko', l: '한국어' }])}
              </>
            )}
            {btn(subtitleMode === 'subtitles' ? '💬 자막 추출' : '⬇️ 정보 가져오기', handleSubtitle)}
            {resetBtn()}
          </div>
        );
      case 'shopping':
        return (
          <div>
            <h2>🛒 쇼핑 콘텐츠</h2>
            <p style={{ color: '#aaa', marginBottom: 4, fontSize: 12 }}>URL 또는 키워드를 입력하세요 (쿠팡/네이버/틱톡/유튜브 URL 또는 제품 키워드)</p>
            {input(shopInput, setShopInput, '예: https://www.coupang.com/... 또는 "여름 선크림 추천"')}
            <p style={{ color: '#aaa', marginBottom: 4 }}>대본 스타일</p>
            {select(scriptStyle, setScriptStyle, [
              { v: 'review', l: '🎯 솔직 리뷰형' },
              { v: 'comparison', l: '⚖️ 비교형' },
              { v: 'unboxing', l: '📦 언박싱형' },
              { v: 'tip', l: '💡 꿀팁/활용법형' },
              { v: 'asmr', l: '🎧 ASMR형' },
              { v: 'storytelling', l: '📖 스토리텔링형' },
              { v: 'ranking', l: '🏆 랭킹/TOP N형' },
              { v: 'haul', l: '🛍️ 하울형' },
              { v: 'before-after', l: '🔄 비포애프터형' },
              { v: 'price-shock', l: '💰 가격 충격형' },
              { v: 'trend-reaction', l: '🔥 트렌드 반응형' },
              { v: 'gift', l: '🎁 선물 추천형' },
            ])}
            <p style={{ color: '#aaa', marginBottom: 4 }}>플랫폼</p>
            {select(platform, setPlatform, [
              { v: 'youtube-shorts', l: '📱 YouTube Shorts (60초)' },
              { v: 'tiktok', l: '🎵 TikTok (15-60초)' },
              { v: 'instagram-reels', l: '📸 Instagram Reels (30-90초)' },
            ])}
            <p style={{ color: '#aaa', marginBottom: 4 }}>추가 제품 정보 (선택)</p>
            {input(productPrice, setProductPrice, '가격 (예: 29,900원)')}
            {input(productFeatures, setProductFeatures, '주요 특징 (예: 방수, 50시간 배터리)')}
            {btn('🛒 쇼핑 콘텐츠 생성', handleShopping)}
            {resetBtn()}
          </div>
        );
      case 'media':
        return (
          <div>
            <h2>🎨 미디어</h2>
            {miniTab([{ id: 'tts', label: '🔊 TTS' }, { id: 'thumbnail', label: '🖼️ 썸네일' }], mediaMode, setMediaMode)}
            {mediaMode === 'tts' ? (
              <>
                {textarea(scriptText, setScriptText, 'TTS로 변환할 텍스트...')}
                {btn('🔊 TTS 생성', handleMedia)}
              </>
            ) : (
              <>
                {input(topic, setTopic, '썸네일 주제/컨셉 입력')}
                {btn('🖼️ 썸네일 생성', handleMedia)}
              </>
            )}
            {resetBtn()}
          </div>
        );
      default:
        return null;
    }
  }
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'rgba(30,30,58,0.95)', borderBottom: '1px solid #333', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>🎬 AI 콘텐츠 팩토리</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={provider} onChange={e => setProvider(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #444', background: '#1e1e3a', color: '#fff', fontSize: 13 }}>
            <option value="gemini">Gemini</option>
            <option value="openai">GPT-4o</option>
            <option value="claude">Claude</option>
          </select>
          <button onClick={() => setShowKeys(!showKeys)} style={{ padding: '6px 12px', borderRadius: 6, background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>🔑 API 키</button>
          <button onClick={logout} style={{ padding: '6px 12px', borderRadius: 6, background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>🚪 로그아웃</button>
        </div>
      </div>

      {/* API Key Panel */}
      {showKeys && (
        <div style={{ background: '#1e1e3a', border: '1px solid #333', borderRadius: 12, padding: 20, margin: '12px 20px' }}>
          <h3 style={{ marginTop: 0 }}>🔑 API 키 설정</h3>
          <p style={{ color: '#aaa', marginBottom: 4 }}>Gemini API Key</p>
          <input value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="AIza..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#0f0f23', color: '#fff', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
          <p style={{ color: '#aaa', marginBottom: 4 }}>OpenAI API Key</p>
          <input value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#0f0f23', color: '#fff', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
          <p style={{ color: '#aaa', marginBottom: 4 }}>Claude API Key</p>
          <input value={claudeKey} onChange={e => setClaudeKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#0f0f23', color: '#fff', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
          <p style={{ color: '#aaa', marginBottom: 4 }}>YouTube Data API Key</p>
          <input value={youtubeKey} onChange={e => setYoutubeKey(e.target.value)} placeholder="AIza..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#0f0f23', color: '#fff', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
          <button onClick={saveKeys} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}>💾 저장</button>
        </div>
      )}

      {/* Tab Menu - 탭 이동해도 결과 유지! */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 4, padding: '12px 20px', borderBottom: '1px solid #222' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', borderRadius: 8, border: tab === t.id ? '1px solid #667eea' : '1px solid #333', background: tab === t.id ? 'rgba(102,126,234,0.2)' : 'transparent', color: tab === t.id ? '#667eea' : '#888', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13, flexShrink: 0 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: 20, padding: 20, maxWidth: 1400, margin: '0 auto', flexWrap: 'wrap' }}>
        {/* Left Panel - Input */}
        <div style={{ flex: 1, minWidth: 340, background: '#1e1e3a', borderRadius: 12, padding: 20, border: '1px solid #333' }}>
          {renderTab()}
        </div>

        {/* Right Panel - Result */}
        <div style={{ flex: 1, minWidth: 340, background: '#1e1e3a', borderRadius: 12, padding: 20, border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>📋 결과</h3>
            {result && (
              <button onClick={() => { navigator.clipboard.writeText(result); alert('복사됨!'); }} style={{ padding: '6px 12px', borderRadius: 6, background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>📋 복사</button>
            )}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
              <p style={{ color: '#aaa' }}>AI가 작업 중입니다...</p>
            </div>
          ) : result ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ddd', fontSize: 14, lineHeight: 1.7, margin: 0, maxHeight: '70vh', overflowY: 'auto' }}>{result}</pre>
          ) : (
            <p style={{ color: '#555', textAlign: 'center', padding: 40 }}>왼쪽에서 기능을 선택하고 실행하면 결과가 여기에 표시됩니다.</p>
          )}
        </div>
      </div>
      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px', color: '#444', fontSize: 12 }}>
        AI 콘텐츠 팩토리 v2.0 — 쇼핑 콘텐츠 통합 버전
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a3e; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        * { scrollbar-width: thin; scrollbar-color: #444 #1a1a3e; }
      `}</style>
    </div>
  );
}
