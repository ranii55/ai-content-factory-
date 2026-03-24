import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform, aiProvider, apiKey } = await req.json();
    if (!keyword || !apiKey) {
      return NextResponse.json({ error: '키워드와 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `"${keyword}" 키워드의 ${platform || 'YouTube'} SEO 분석을 해주세요:

1. 키워드 검색량 추정 (높음/중간/낮음)
2. 경쟁 강도 분석
3. 추천 메인 키워드 5개
4. 추천 롱테일 키워드 10개
5. 최적화된 제목 3개 제안
6. SEO 최적화 설명란 템플릿
7. 추천 태그 20개
8. 해시태그 추천 15개
9. 검색 노출 전략

상세하게 분석해주세요.`;

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 }),
      });
      const data = await res.json();
      result = data.choices?.[0]?.message?.content || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      result = data.content?.[0]?.text || '결과를 생성할 수 없습니다.';
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'SEO 분석 중 오류 발생' }, { status: 500 });
  }
}

