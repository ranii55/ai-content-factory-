import { NextRequest, NextResponse } from 'next/server';

const SCRIPT_STYLES: Record<string, string> = {
  'review': '솔직 리뷰형: "이거 써봤는데 솔직히..." 스타일. 실제 사용 후기처럼 장단점을 솔직하게 비교하고, 별점 멘트를 넣어 신뢰감을 최대화하세요.',
  'compare': '비교형: "A vs B 뭐가 더 좋을까?" 스타일. 두 제품의 스펙, 가격, 사용감을 비교하고 결론에서 명확히 추천하세요.',
  'unboxing': '언박싱형: "드디어 도착했습니다!" 스타일. 택배 개봉부터 첫 사용까지, ASMR 요소와 리액션을 넣으세요.',
  'tips': '꿀팁/활용형: "이렇게 쓰면 10배 좋아져요" 스타일. 제품의 숨겨진 활용법, 꿀조합을 소개하세요.',
  'asmr': 'ASMR형: 말 없이 소리와 비주얼 중심. 제품 소리, 질감, 클로즈업. 자막만으로 정보를 전달하세요.',
  'story': '스토리텔링형: "이걸 안 샀으면 큰일날 뻔했어요" 스타일. 개인 경험담 + 감정 변화 + 제품 등장 순서로 구성하세요.',
  'ranking': '랭킹형: "TOP 3 추천!" 스타일. 순위 형식으로 여러 제품을 소개하고 1위를 마지막에 공개하세요.',
  'haul': '하울형: "이번 달 구매한 것들!" 스타일. 여러 제품을 한꺼번에 빠르게 소개하세요.',
  'before-after': 'Before/After형: "사용 전 vs 사용 후" 스타일. 극적인 변화를 보여주는 비포애프터 비교하세요.',
  'price-shock': '가격 충격형: "이게 만원이라고?!" 스타일. 가격 대비 놀라운 품질을 강조하세요.',
  'trend-react': '트렌드 반응형: "틱톡에서 난리난 이 제품 써봤습니다" 스타일. 바이럴 제품을 직접 검증하세요.',
  'gift': '선물 추천형: "여자친구 선물 고민 끝!" 스타일. 상황/대상별 선물 큐레이션으로 구성하세요.',
};

const PLATFORM_GUIDE: Record<string, string> = {
  'youtube': '유튜브 쇼츠 (60초 이내, 세로 9:16). 유튜브 알고리즘에 맞는 제목, 설명란, 태그, 쇼핑링크 문구를 포함하세요. 쿠팡파트너스 링크 안내도 포함.',
  'tiktok': '틱톡 (15~60초). 틱톡 트렌드 스타일, 빠른 전환, 트렌드 사운드 추천, 틱톡샵 연동 문구, #TikTokMadeMeBuyIt 등 바이럴 해시태그 포함.',
  'instagram': '인스타 릴스 (30~90초). 인스타 감성 편집, 깔끔한 비주얼, 스토리 공유용 문구 포함.',
};

function detectInputType(input: string): 'coupang' | 'naver' | 'tiktok' | 'youtube' | 'instagram' | 'keyword' {
  if (input.includes('coupang.com')) return 'coupang';
  if (input.includes('naver.com') || input.includes('smartstore')) return 'naver';
  if (input.includes('tiktok.com')) return 'tiktok';
  if (input.includes('youtube.com') || input.includes('youtu.be')) return 'youtube';
  if (input.includes('instagram.com')) return 'instagram';
  return 'keyword';
}

async function scrapeProductInfo(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const priceMatch = html.match(/(\d{1,3}(,\d{3})*)\s*원/);
    const title = titleMatch ? titleMatch[1].replace(/ - .*$/, '').trim() : '상품명 추출 실패';
    const price = priceMatch ? priceMatch[0] : '가격 정보 없음';
    return `상품명: ${title}\n가격: ${price}\n상품URL: ${url}`;
  } catch {
    return `상품URL: ${url}\n(상품 정보 자동 추출 실패 - AI가 URL 기반으로 추정합니다)`;
  }
}

async function analyzeVideoUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow'
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/name="description"\s+content="(.*?)"/i);
    const title = titleMatch ? titleMatch[1] : '';
    const desc = descMatch ? descMatch[1] : '';
    return `영상 제목: ${title}\n영상 설명: ${desc}\n영상URL: ${url}`;
  } catch {
    return `영상URL: ${url}\n(영상 정보 자동 추출 실패)`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, productPrice, productFeatures, platform = 'youtube', scriptStyle = 'review', apiKey, aiProvider = 'gemini' } = body;

    if (!productName) return NextResponse.json({ error: '상품명 또는 URL 또는 키워드를 입력해 주세요.' }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: 'API 키를 설정해 주세요.' }, { status: 400 });

    const inputType = detectInputType(productName);
    let productInfo = '';

    if (inputType === 'coupang' || inputType === 'naver') {
      productInfo = await scrapeProductInfo(productName);
    } else if (inputType === 'tiktok' || inputType === 'youtube' || inputType === 'instagram') {
      productInfo = await analyzeVideoUrl(productName);
    } else {
      productInfo = `검색 키워드: ${productName}`;
      if (productPrice) productInfo += `\n가격대: ${productPrice}`;
      if (productFeatures) productInfo += `\n특징: ${productFeatures}`;
    }

    const styleGuide = SCRIPT_STYLES[scriptStyle] || SCRIPT_STYLES['review'];
    const platformGuide = PLATFORM_GUIDE[platform] || PLATFORM_GUIDE['youtube'];
    let prompt = '';

    if (inputType === 'tiktok' || inputType === 'youtube' || inputType === 'instagram') {
      prompt = `당신은 쇼핑 콘텐츠 전문가입니다.

아래 영상 정보를 분석해서:
1. 영상에서 소개하는 제품을 찾아주세요 (제품명, 추정 가격, 카테고리)
2. 해당 제품의 쿠팡/네이버 검색 키워드를 추천해주세요
3. 해당 제품으로 쇼핑 콘텐츠 대본을 작성해주세요

【영상 정보】
${productInfo}

【대본 스타일】
${styleGuide}

【플랫폼】
${platformGuide}

【대본 구성 - 반드시 포함】
## 🔍 제품 분석
- 제품명, 추정 가격, 카테고리
- 쿠팡 검색 키워드: "___"
- 네이버 검색 키워드: "___"

## 🎬 쇼핑 대본
### 🎣 후킹 (0~3초)
(스크롤을 멈추게 하는 강력한 첫 마디)

### ❓ 문제 제기 (3~8초)
(시청자의 고민/니즈 공감)

### 📦 제품 소개 (8~25초)
(핵심 특징 3가지 + 사용 장면)

### ⭐ 증거/신뢰 (25~40초)
(후기, 별점, 판매량 등)

### 📢 CTA (40~60초)
(구매 유도 + 링크 안내)

## 📝 온스크린 텍스트
(화면에 띄울 자막 5개)

## 🎬 촬영 가이드
(앵글, 조명, 편집 포인트, BGM 추천)

## #️⃣ 해시태그 (20개)

## 🖼️ 썸네일/커버 문구 (3개)

## 📄 설명란 템플릿
(제휴링크 포함 설명란)`;
    } else if (inputType === 'keyword') {
      prompt = `당신은 쇼핑 콘텐츠 전문가입니다.

아래 키워드로 트렌드 제품을 추천하고 쇼핑 대본을 작성해주세요.

【키워드 정보】
${productInfo}

【대본 스타일】
${styleGuide}

【플랫폼】
${platformGuide}

【대본 구성 - 반드시 포함】
## 🔥 트렌드 제품 추천 (3~5개)
각 제품: 제품명 | 가격대 | 인기 이유 | 쿠팡 검색 키워드

## 🏆 1위 추천 제품 상세
- 제품명, 가격, 핵심 특징 3가지

## 🎬 쇼핑 대본 (1위 제품 기준)
### 🎣 후킹 (0~3초)
### ❓ 문제 제기 (3~8초)
### 📦 제품 소개 (8~25초)
### ⭐ 증거/신뢰 (25~40초)
### 📢 CTA (40~60초)

## 📝 온스크린 텍스트 (5개)
## 🎬 촬영 가이드
## #️⃣ 해시태그 (20개)
## 🖼️ 썸네일/커버 문구 (3개)
## 📄 설명란 템플릿`;
    } else {
      prompt = `당신은 쇼핑 콘텐츠 전문가입니다.

아래 상품 정보로 쇼핑 콘텐츠 대본을 작성해주세요.

【상품 정보】
${productInfo}

【대본 스타일】
${styleGuide}

【플랫폼】
${platformGuide}

【대본 구성 - 반드시 포함】
## 📦 상품 정보 요약
- 상품명, 가격, 핵심 특징

## 🎬 쇼핑 대본
### 🎣 후킹 (0~3초)
### ❓ 문제 제기 (3~8초)
### 📦 제품 소개 (8~25초)
### ⭐ 증거/신뢰 (25~40초)
### 📢 CTA (40~60초)

## 📝 온스크린 텍스트 (5개)
## 🎬 촬영 가이드
## #️⃣ 해시태그 (20개)
## 🖼️ 썸네일/커버 문구 (3개)
## 📄 설명란 템플릿`;
    }

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '결과 생성 실패';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 })
      });
      const data = await res.json();
      result = data?.choices?.[0]?.message?.content || '결과 생성 실패';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      result = data?.content?.[0]?.text || '결과 생성 실패';
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '쇼핑 콘텐츠 생성 중 오류' }, { status: 500 });
  }
}
