import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      titles,
      topic,
      platform = 'youtube',
      targetAudience = '일반',
      aiProvider = 'gemini',
      apiKey
    } = body;

    if (!titles || titles.length === 0) {
      return NextResponse.json({ error: '비교할 제목을 1개 이상 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API 키를 설정해 주세요.' }, { status: 400 });
    }

    const titlesText = titles.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n');

    const prompt = `당신은 ${platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : 'YouTube'} 콘텐츠 전문가이자 CTR(클릭률) 분석가입니다.

아래 제목 후보들을 분석하고 예상 CTR을 평가해 주세요.

【제목 후보들】
${titlesText}

${topic ? `【영상 주제】\n${topic}` : ''}
【플랫폼】 ${platform}
【타깃 시청자】 ${targetAudience}

【분석 기준】
1. 호기심 유발 (궁금증을 자극하는가?)
2. 감정 자극 (놀라움, 공감, 분노, 기쁨 등)
3. 구체성 (숫자, 기간, 결과 등 구체적 정보)
4. 긴급성/희소성 (지금 봐야 하는 이유)
5. 키워드 최적화 (검색에 잘 잡히는가?)
6. 길이 적절성 (${platform === 'youtube' ? '40~60자' : '30~50자'} 권장)

【출력 형식 (반드시 아래 형식으로)】

## 📊 제목 A/B 테스트 결과

### 종합 순위
| 순위 | 제목 | 예상 CTR | 총점 |
|------|------|----------|------|
(각 제목별 순위, 예상 CTR %, 100점 만점 총점)

### 각 제목 상세 분석

#### 제목 1: "(제목)"
- 예상 CTR: ___%
- 호기심: ___/20
- 감정 자극: ___/20
- 구체성: ___/20
- 긴급성: ___/20
- 키워드: ___/20
- 총점: ___/100
- 강점: (1줄)
- 약점: (1줄)

(모든 제목에 대해 반복)

### 🏆 최종 추천
(1위 제목 + 추천 이유)

### ✏️ 개선 제안
(1위 제목을 더 좋게 만드는 수정안 3개)`;

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
      titleCount: titles.length,
      result
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '제목 A/B 테스트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
