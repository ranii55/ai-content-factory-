'use client';
import { useState, useEffect } from 'react';

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
  { id: 'media', icon: '🎨', label: '미디어' },
];

export default function Home() {
  const [tab, setTab] = useState('script');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showKeys, setShowKeys] = useState(false);

  // 서브 모드
  const [scriptMode, setScriptMode] = useState<'general'|'shopping'>('general');
  const [editMode, setEditMode] = useState<'polish'|'rewrite'|'translate'>('polish');
  const [analysisMode, setAnalysisMode] = useState<'video'|'structure'>('video');
  const [marketMode, setMarketMode] = useState<'competitors'|'seo'|'trends'>('competitors');
  const [publishMode, setPublishMode] = useState<'description'|'chapters'|'checklist'>('description');
  const [subtitleMode, setSubtitleMode] = useState<'subtitles'|'download'>('subtitles');
  const [mediaMode, setMediaMode] = useState<'tts'|'thumbnail'>('thumbnail');

  // API Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [provider, setProvider] = useState('gemini');

  // 입력 필드
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

  useEffect(() => {
    const saved = localStorage.getItem('ai-factory-keys');
    if (saved) {
      const k = JSON.parse(saved);
      setGeminiKey(k.gemini || '');
      setOpenaiKey(k.openai || '');
      setClaudeKey(k.claude || '');
      setYoutubeKey(k.youtube || '');
    }
  }, []);

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

  async function callApi(endpoint: string, body: any) {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, aiProvider: provider, apiKey: getKey() })
      });
      const data = await res.json();
      if (data.error) {
        setResult('❌ 에러: ' + data.error);
      } else {
        setResult(data.result || data.text || data.content || (typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)));
      }
    } catch (e: any) {
      setResult('❌ 요청 실패: ' + e.message);
    }
    setLoading(false);
  }

  // 핸들러
  function handleScript() {
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요.'); return; }
    if (scriptMode === 'shopping') {
      if (!productName) { setResult('❌ 상품명을 입력해 주세요.'); return; }
      callApi('shopping-content', { productName, productPrice, productFeatures, platform });
    } else {
      if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
      callApi('generate-script', { topic, platform, category, duration, audience });
    }
  }
  function handleEdit() {
    if (!scriptText) { setResult('❌ 대본을 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요.'); return; }
    if (editMode === 'polish') callApi('polish-script', { script: scriptText, platform });
    else if (editMode === 'rewrite') callApi('rewrite-script', { script: scriptText, platform, style: '트렌디' });
    else callApi('translate-script', { script: scriptText, targetLanguage: targetLang, platform });
  }
  function handleGuidelines() {
    if (!scriptText) { setResult('❌ 대본을 입력해 주세요.'); return; }
    callApi('check-guidelines', { script: scriptText, platform });
  }
  function handleAnalysis() {
    if (!videoUrl) { setResult('❌ 영상 URL을 입력해 주세요.'); return; }
    if (analysisMode === 'video') callApi('analyze-video', { url: videoUrl, platform });
    else callApi('structure-analysis', { url: videoUrl, platform });
  }
  function handleMarket() {
    if (!keyword) { setResult('❌ 키워드를 입력해 주세요.'); return; }
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요.'); return; }
    if (marketMode === 'competitors') callApi('compare-competitors', { keyword, platform });
    else if (marketMode === 'seo') callApi('seo-analysis', { keyword, platform });
    else callApi('trends', { keyword, platform });
  }
  function handleSeries() {
    if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
    callApi('plan-series', { topic, platform, episodeCount: 5 });
  }
  function handleCommunity() {
    if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
    callApi('community-post', { topic, platform });
  }
  function handlePublish() {
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요.'); return; }
    if (publishMode === 'description') {
      if (!topic) { setResult('❌ 주제를 입력해 주세요.'); return; }
      callApi('generate-description', { title: topic, platform });
    } else if (publishMode === 'chapters') {
      if (!scriptText) { setResult('❌ 대본을 입력해 주세요.'); return; }
      callApi('generate-chapters', { script: scriptText });
    } else {
      if (!topic) { setResult('❌ 영상 제목을 입력해 주세요.'); return; }
      callApi('upload-checklist', { title: topic, platform });
    }
  }
  function handleAbTest() {
    if (!titles) { setResult('❌ 제목 후보를 입력해 주세요.'); return; }
    const titleList = titles.split('\n').filter((t: string) => t.trim());
    callApi('title-ab-test', { titles: titleList, topic, platform });
  }
  function handleCalendar() {
    if (!topic) { setResult('❌ 채널 주제를 입력해 주세요.'); return; }
    callApi('content-calendar', { topic, platform, weeks: parseInt(calendarWeeks), channelName });
  }
  function handleSubtitle() {
    if (!videoUrl) { setResult('❌ 영상 URL을 입력해 주세요.'); return; }
    if (subtitleMode === 'subtitles') callApi('extract-subtitles', { url: videoUrl });
    else callApi('download-video', { url: videoUrl, platform });
  }
  function handleMedia() {
    if (!getKey()) { setResult('❌ API 키를 설정해 주세요.'); return; }
    if (mediaMode === 'tts') {
      if (!scriptText) { setResult('❌ 텍스트를 입력해 주세요.'); return; }
      callApi('tts-generate', { text: scriptText });
    } else {
      if (!topic) { setResult('❌ 제목을 입력해 주세요.'); return; }
      callApi('generate-thumbnail', { title: topic, style: platform, aiProvider: provider, apiKey: getKey() });
    }
  }
  // 스타일
  const box: React.CSSProperties = { background: 'linear-gradient(145deg, #1e1e3a, #16162e)', borderRadius: 16, padding: 28, marginBottom: 16, border: '1px solid rgba(102,126,234,0.15)' };
  const input: React.CSSProperties = { width: '100%', padding: 14, borderRadius: 10, border: '1px solid #2a2a4a', background: '#12122a', color: '#fff', fontSize: 14, marginBottom: 14, boxSizing: 'border-box' as const, outline: 'none' };
  const textarea: React.CSSProperties = { ...input, minHeight: 130, resize: 'vertical' as const };
  const btnStyle: React.CSSProperties = { width: '100%', padding: 16, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer', marginBottom: 12, opacity: loading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(102,126,234,0.3)' };
  const select: React.CSSProperties = { ...input, cursor: 'pointer' };
  const lbl: React.CSSProperties = { display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 6, fontWeight: 500 };

  const modeBtn = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px', borderRadius: 10, border: active ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#888', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
  });

  const platformSelect = (
    <>
      <label style={lbl}>플랫폼</label>
      <select style={select} value={platform} onChange={e => setPlatform(e.target.value)}>
        <option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option>
      </select>
    </>
  );

  function renderTab() {
    switch (tab) {

      // ========== 1. 대본 생성 (일반 + 쇼핑) ==========
      case 'script':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(scriptMode === 'general')} onClick={() => setScriptMode('general')}>📝 일반 대본</button>
              <button style={modeBtn(scriptMode === 'shopping')} onClick={() => setScriptMode('shopping')}>🛒 쇼핑 대본</button>
            </div>
            {platformSelect}
            {scriptMode === 'general' ? (
              <>
                <label style={lbl}>카테고리</label>
                <select style={select} value={category} onChange={e => setCategory(e.target.value)}>
                  <option>교육/정보</option><option>엔터테인먼트</option><option>리뷰</option><option>브이로그</option><option>뉴스/시사</option><option>쿡방/먹방</option><option>게임</option><option>뷰티/패션</option><option>기술/IT</option>
                </select>
                <label style={lbl}>영상 길이</label>
                <select style={select} value={duration} onChange={e => setDuration(e.target.value)}>
                  <option>60초 (쇼츠)</option><option>3분</option><option>5분</option><option>8분</option><option>10분</option><option>15분</option><option>20분 이상</option>
                </select>
                <label style={lbl}>타깃 시청자</label>
                <select style={select} value={audience} onChange={e => setAudience(e.target.value)}>
                  <option>일반</option><option>10대</option><option>20대</option><option>30대</option><option>40대 이상</option><option>직장인</option><option>학생</option><option>주부</option>
                </select>
                <label style={lbl}>주제 *</label>
                <textarea style={textarea} placeholder="영상 주제를 입력하세요" value={topic} onChange={e => setTopic(e.target.value)} />
              </>
            ) : (
              <>
                <label style={lbl}>상품명 *</label>
                <input style={input} placeholder="상품명 (예: 에어팟 프로 2)" value={productName} onChange={e => setProductName(e.target.value)} />
                <label style={lbl}>가격</label>
                <input style={input} placeholder="가격 (예: 359,000원)" value={productPrice} onChange={e => setProductPrice(e.target.value)} />
                <label style={lbl}>특징</label>
                <textarea style={textarea} placeholder="상품 특징 (예: 노이즈캔슬링, USB-C)" value={productFeatures} onChange={e => setProductFeatures(e.target.value)} />
              </>
            )}
            <button style={btnStyle} onClick={handleScript} disabled={loading}>{loading ? '⏳ 생성 중...' : '🚀 대본 생성'}</button>
          </div>
        );

      // ========== 2. 대본 편집 (교정 + 리라이트 + 번역) ==========
      case 'edit':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(editMode === 'polish')} onClick={() => setEditMode('polish')}>✨ 교정</button>
              <button style={modeBtn(editMode === 'rewrite')} onClick={() => setEditMode('rewrite')}>🔄 리라이트</button>
              <button style={modeBtn(editMode === 'translate')} onClick={() => setEditMode('translate')}>🌐 번역</button>
            </div>
            {platformSelect}
            {editMode === 'translate' && (
              <>
                <label style={lbl}>번역 언어</label>
                <select style={select} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                  <option value="en">영어</option><option value="ja">일본어</option><option value="zh">중국어(간체)</option><option value="es">스페인어</option><option value="vi">베트남어</option><option value="th">태국어</option><option value="id">인도네시아어</option><option value="pt">포르투갈어</option><option value="de">독일어</option><option value="fr">프랑스어</option>
                </select>
              </>
            )}
            <label style={lbl}>대본 *</label>
            <textarea style={{...textarea, minHeight: 220}} placeholder="대본을 붙여넣으세요" value={scriptText} onChange={e => setScriptText(e.target.value)} />
            <button style={btnStyle} onClick={handleEdit} disabled={loading}>
              {loading ? '⏳ 처리 중...' : editMode === 'polish' ? '✨ 대본 교정' : editMode === 'rewrite' ? '🔄 리라이트' : '🌐 번역'}
            </button>
          </div>
        );

      // ========== 3. 가이드라인 ==========
      case 'guidelines':
        return (
          <div style={box}>
            {platformSelect}
            <label style={lbl}>검사할 대본 *</label>
            <textarea style={{...textarea, minHeight: 220}} placeholder="대본을 붙여넣으세요" value={scriptText} onChange={e => setScriptText(e.target.value)} />
            <button style={btnStyle} onClick={handleGuidelines} disabled={loading}>{loading ? '⏳ 검사 중...' : '🔍 가이드라인 검사'}</button>
          </div>
        );

      // ========== 4. 영상 분석 (종합 + 구조) ==========
      case 'analysis':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(analysisMode === 'video')} onClick={() => setAnalysisMode('video')}>🎥 종합 분석</button>
              <button style={modeBtn(analysisMode === 'structure')} onClick={() => setAnalysisMode('structure')}>🏗️ 구조 분석</button>
            </div>
            <label style={lbl}>영상 URL *</label>
            <input style={input} placeholder="YouTube, TikTok, Instagram URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
            <button style={btnStyle} onClick={handleAnalysis} disabled={loading}>
              {loading ? '⏳ 분석 중...' : analysisMode === 'video' ? '🎥 종합 분석' : '🏗️ 구조 분석'}
            </button>
          </div>
        );

      // ========== 5. 경쟁·SEO (경쟁 + SEO + 트렌드) ==========
      case 'market':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(marketMode === 'competitors')} onClick={() => setMarketMode('competitors')}>🔍 경쟁 분석</button>
              <button style={modeBtn(marketMode === 'seo')} onClick={() => setMarketMode('seo')}>🔎 SEO</button>
              <button style={modeBtn(marketMode === 'trends')} onClick={() => setMarketMode('trends')}>📈 트렌드</button>
            </div>
            {platformSelect}
            <label style={lbl}>키워드 *</label>
            <input style={input} placeholder="분석할 키워드 (예: AI, 유튜브 시작)" value={keyword} onChange={e => setKeyword(e.target.value)} />
            <button style={btnStyle} onClick={handleMarket} disabled={loading}>
              {loading ? '⏳ 분석 중...' : marketMode === 'competitors' ? '🔍 경쟁 분석' : marketMode === 'seo' ? '🔎 SEO 분석' : '📈 트렌드 분석'}
            </button>
          </div>
        );

      // ========== 6. 시리즈 ==========
      case 'series':
        return (
          <div style={box}>
            {platformSelect}
            <label style={lbl}>시리즈 주제 *</label>
            <textarea style={textarea} placeholder="시리즈로 만들 주제 (예: 코딩 왕초보 탈출기)" value={topic} onChange={e => setTopic(e.target.value)} />
            <button style={btnStyle} onClick={handleSeries} disabled={loading}>{loading ? '⏳ 기획 중...' : '📚 시리즈 기획'}</button>
          </div>
        );

      // ========== 7. 커뮤니티 ==========
      case 'community':
        return (
          <div style={box}>
            {platformSelect}
            <label style={lbl}>주제 *</label>
            <textarea style={textarea} placeholder="커뮤니티 글 주제" value={topic} onChange={e => setTopic(e.target.value)} />
            <button style={btnStyle} onClick={handleCommunity} disabled={loading}>{loading ? '⏳ 생성 중...' : '💬 커뮤니티 글 생성'}</button>
          </div>
        );
      // ========== 8. 설명·챕터 (설명란 + 챕터 + 체크리스트) ==========
      case 'publish':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(publishMode === 'description')} onClick={() => setPublishMode('description')}>📄 설명란</button>
              <button style={modeBtn(publishMode === 'chapters')} onClick={() => setPublishMode('chapters')}>📑 챕터</button>
              <button style={modeBtn(publishMode === 'checklist')} onClick={() => setPublishMode('checklist')}>☑️ 체크리스트</button>
            </div>
            {platformSelect}
            {publishMode === 'chapters' ? (
              <>
                <label style={lbl}>대본 *</label>
                <textarea style={{...textarea, minHeight: 220}} placeholder="챕터를 나눌 대본을 붙여넣으세요" value={scriptText} onChange={e => setScriptText(e.target.value)} />
              </>
            ) : (
              <>
                <label style={lbl}>{publishMode === 'description' ? '영상 제목 *' : '영상 제목 *'}</label>
                <input style={input} placeholder="영상 제목 입력" value={topic} onChange={e => setTopic(e.target.value)} />
              </>
            )}
            <button style={btnStyle} onClick={handlePublish} disabled={loading}>
              {loading ? '⏳ 생성 중...' : publishMode === 'description' ? '📄 설명란 생성' : publishMode === 'chapters' ? '📑 챕터 생성' : '☑️ 체크리스트 생성'}
            </button>
          </div>
        );

      // ========== 9. 제목 A/B ==========
      case 'ab-test':
        return (
          <div style={box}>
            {platformSelect}
            <label style={lbl}>주제</label>
            <input style={input} placeholder="영상 주제" value={topic} onChange={e => setTopic(e.target.value)} />
            <label style={lbl}>제목 후보들 * (한 줄에 하나씩)</label>
            <textarea style={textarea} placeholder={"제목 후보 1\n제목 후보 2\n제목 후보 3"} value={titles} onChange={e => setTitles(e.target.value)} />
            <button style={btnStyle} onClick={handleAbTest} disabled={loading}>{loading ? '⏳ 분석 중...' : '🧪 제목 A/B 테스트'}</button>
          </div>
        );

      // ========== 10. 캘린더 ==========
      case 'calendar':
        return (
          <div style={box}>
            {platformSelect}
            <label style={lbl}>채널 주제 *</label>
            <input style={input} placeholder="채널 주제 (예: IT 리뷰, 요리, 여행)" value={topic} onChange={e => setTopic(e.target.value)} />
            <label style={lbl}>채널명</label>
            <input style={input} placeholder="채널명 (선택)" value={channelName} onChange={e => setChannelName(e.target.value)} />
            <label style={lbl}>기간</label>
            <select style={select} value={calendarWeeks} onChange={e => setCalendarWeeks(e.target.value)}>
              <option value="1">1주</option><option value="2">2주</option><option value="4">4주 (1개월)</option>
            </select>
            <button style={btnStyle} onClick={handleCalendar} disabled={loading}>{loading ? '⏳ 생성 중...' : '📅 캘린더 생성'}</button>
          </div>
        );

      // ========== 11. 자막·다운로드 ==========
      case 'subtitle':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(subtitleMode === 'subtitles')} onClick={() => setSubtitleMode('subtitles')}>💬 자막 추출</button>
              <button style={modeBtn(subtitleMode === 'download')} onClick={() => setSubtitleMode('download')}>⬇️ 다운로드</button>
            </div>
            <label style={lbl}>영상 URL *</label>
            <input style={input} placeholder="YouTube, TikTok, Instagram URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
            <button style={btnStyle} onClick={handleSubtitle} disabled={loading}>
              {loading ? '⏳ 처리 중...' : subtitleMode === 'subtitles' ? '💬 자막 추출' : '⬇️ 다운로드 정보'}
            </button>
          </div>
        );

      // ========== 12. 미디어 (TTS + 썸네일) ==========
      case 'media':
        return (
          <div style={box}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button style={modeBtn(mediaMode === 'thumbnail')} onClick={() => setMediaMode('thumbnail')}>🖼️ 썸네일</button>
              <button style={modeBtn(mediaMode === 'tts')} onClick={() => setMediaMode('tts')}>🔊 TTS</button>
            </div>
            {mediaMode === 'thumbnail' ? (
              <>
                {platformSelect}
                <label style={lbl}>영상 제목 *</label>
                <input style={input} placeholder="썸네일을 만들 영상 제목" value={topic} onChange={e => setTopic(e.target.value)} />
              </>
            ) : (
              <>
                <label style={lbl}>읽을 텍스트 * (OpenAI 키 필요)</label>
                <textarea style={{...textarea, minHeight: 220}} placeholder="음성으로 변환할 텍스트" value={scriptText} onChange={e => setScriptText(e.target.value)} />
              </>
            )}
            <button style={btnStyle} onClick={handleMedia} disabled={loading}>
              {loading ? '⏳ 생성 중...' : mediaMode === 'thumbnail' ? '🖼️ 썸네일 생성' : '🔊 TTS 음성 생성'}
            </button>
          </div>
        );

      default:
        return <div style={box}><p>탭을 선택하세요</p></div>;
    }
  }
  const tabBtn = (t: any, isActive: boolean): React.CSSProperties => ({
    padding: '12px 20px',
    borderRadius: 12,
    border: isActive ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.08)',
    background: isActive ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.04)',
    color: isActive ? '#fff' : '#9ca3af',
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2d 50%, #0a0a1a 100%)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* 헤더 */}
      <div style={{ background: 'rgba(15,15,35,0.95)', backdropFilter: 'blur(20px)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(102,126,234,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎬</span>
          <div>
            <h1 style={{ fontSize: 18, margin: 0, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI 콘텐츠 팩토리</h1>
            <p style={{ fontSize: 11, margin: 0, color: '#666' }}>12개 메뉴 · 22개 기능</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#12122a', color: '#fff', fontSize: 12 }} value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="gemini">✨ Gemini (무료)</option>
            <option value="openai">🤖 OpenAI (유료)</option>
            <option value="claude">🟣 Claude (유료)</option>
          </select>
          <button onClick={() => setShowKeys(!showKeys)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(102,126,234,0.3)', background: showKeys ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(102,126,234,0.1)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>⚙️ API 키</button>
        </div>
      </div>

      {/* API 키 패널 */}
      {showKeys && (
        <div style={{ background: 'linear-gradient(145deg, #1a1a3e, #16162e)', padding: 24, borderBottom: '1px solid rgba(102,126,234,0.15)', animation: 'slideDown 0.3s ease' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#667eea' }}>🔑 API 키 설정</h3>
            <label style={{ color: '#9ca3af', fontSize: 11 }}>Gemini API Key (무료)</label>
            <input type="password" placeholder="AIza..." value={geminiKey} onChange={e => setGeminiKey(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #2a2a4a', background: '#12122a', color: '#fff', fontSize: 13 }} />
            <label style={{ color: '#9ca3af', fontSize: 11 }}>YouTube Data API Key (무료)</label>
            <input type="password" placeholder="AIza..." value={youtubeKey} onChange={e => setYoutubeKey(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #2a2a4a', background: '#12122a', color: '#fff', fontSize: 13 }} />
            <label style={{ color: '#9ca3af', fontSize: 11 }}>OpenAI API Key (유료 - 선택)</label>
            <input type="password" placeholder="sk-..." value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #2a2a4a', background: '#12122a', color: '#fff', fontSize: 13 }} />
            <label style={{ color: '#9ca3af', fontSize: 11 }}>Claude API Key (유료 - 선택)</label>
            <input type="password" placeholder="sk-ant-..." value={claudeKey} onChange={e => setClaudeKey(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #2a2a4a', background: '#12122a', color: '#fff', fontSize: 13 }} />
            <button onClick={saveKeys} style={{ padding: 14, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: 4, fontSize: 14, boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }}>💾 키 저장</button>
          </div>
        </div>
      )}

      {/* 탭 바 - 2줄 깔끔하게 */}
      <div style={{ background: 'rgba(15,15,35,0.8)', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            {TABS.slice(0, 6).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setResult(''); }} style={tabBtn(t, tab === t.id)}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {TABS.slice(6, 12).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setResult(''); }} style={tabBtn(t, tab === t.id)}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 로딩 바 */}
      {loading && (
        <div style={{ height: 3, background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)', backgroundSize: '200% 100%', animation: 'loadingBar 1.5s infinite' }} />
      )}

      {/* 메인 콘텐츠 */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 20px' }}>
        <h2 style={{ fontSize: 22, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{TABS.find(t => t.id === tab)?.icon}</span>
          <span>{TABS.find(t => t.id === tab)?.label}</span>
        </h2>

        {renderTab()}

        {/* 결과 */}
        {result && (
          <div style={{ marginTop: 24, animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: '#667eea', display: 'flex', alignItems: 'center', gap: 8 }}>📋 결과</h3>
            <div style={{ background: 'linear-gradient(145deg, #1e1e3a, #16162e)', border: '1px solid rgba(102,126,234,0.15)', borderRadius: 14, padding: 24, whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#e0e0e0', maxHeight: 600, overflowY: 'auto', fontSize: 14 }}>
              {result}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(result); alert('복사되었습니다!'); }} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(102,126,234,0.3)', background: 'rgba(102,126,234,0.1)', color: '#667eea', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>📋 결과 복사</button>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#444', fontSize: 12 }}>
        AI 콘텐츠 팩토리 v3.0 • 12개 메뉴 · 22개 기능 올인원
      </div>

      <style>{`
        @keyframes loadingBar { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        button:hover { filter: brightness(1.15); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: #667eea; border-radius: 3px; }
        ::selection { background: #667eea; color: #fff; }
      `}</style>
    </div>
  );
}
