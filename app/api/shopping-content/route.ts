import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName,
      productPrice,
      productFeatures,
      productLink,
      platform = 'youtube',
      scriptLength = '60초',
      aiProvider = 'gemini',
      apiKey
    } = body;

    if (!productName) {
      return NextResponse.json({ error: '상품명을 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API 키를 설정해 주세요.' }, { status: 400 });
    }

    const prompt = `당신은 쇼핑 콘텐츠 전문 카피라이터입니다.

아래 상품 정보를 바탕으로 ${platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram Reels' : 'YouTube'} 쇼핑 쇼츠 콘텐츠를 만들어 주세요.

【상품 정보】
- 상품명: ${productName}
- 가격: ${productPrice || '미정'}
- 특징: ${productFeatures || '없음'}
- 링크: ${productLink || '없음'}
- 영상 길이: ${scriptLength}

【출력 형식 (반드시 아래 형식으로)】

## 🎬 쇼핑 쇼츠 대본
(${scriptLength} 기준, 훅→문제제기→상품소개→사용후기느낌→CTA 구조)

### 훅 (처음 3초)
(시청자를 멈추게 할 강렬한 한 마디)

### 문제 제기 (5초)
(타깃의 고민/불편함 언급)

### 상품 소개 (15~30초)
(핵심 기능 3가지, 시각적 묘사 포함)

### 사용 후기 느낌 (10초)
(실제 사용한 듯한 생생한 리뷰 톤)

### CTA (마지막 5초)
(구매 유도 문구 + 링크 안내)

---

## 🏷️ 쇼핑 태그 텍스트
- 상품명 태그: (상품명 그대로)
- 가격 태그: (가격 표시)
- CTA 태그: (구매하기/자세히보기 등)

## 📝 설명란/캡션
(${platform === 'tiktok' ? '150~300자, 해시태그 포함' : platform === 'instagram' ? '200~500자, 해시태그 포함' : '500~1000자, 타임스탬프+링크 포함'})

## #️⃣ 해시태그 추천
(${platform} 최적화 해시태그 15~20개)

## ⚠️ 가이드라인 체크
- 과대광고 표현 여부: (확인 결과)
- 효과 보장 문구 여부: (확인 결과)
- 최저가 표현 여부: (확인 결과)
- 유료광고/협찬 표시 필요 여부: (판단 결과)
- 의료/건강 관련 주의사항: (해당 시 안내)`;

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await res.json();
      result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 3000 })
      });
      const data = await res.json();
      result = data?.choices?.[0]?.message?.content || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      result = data?.content?.[0]?.text || '결과를 생성할 수 없습니다.';
    }

    return NextResponse.json({
      success: true,
      platform,
      productName,
      scriptLength,
      result
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '쇼핑 콘텐츠 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
