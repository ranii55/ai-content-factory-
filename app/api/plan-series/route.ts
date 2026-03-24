import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, aiProvider, apiKey } = await req.json();
    if (!topic || !apiKey) {
      return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `"${topic}" 주제로 ${platform || 'YouTube'} 시리즈를 기획해주세요:

1. 시리즈 제목 (메인)
2. 시리즈 컨셉 설명
3. 타깃 시청자
4. 에피소드 구성 (8~12편)
   - 각 에피소드 제목
   - 핵심 내용 요약
   - 예상 길이
5. 시리즈 촬영 순서 추천
6. 시리즈 홍보 전략
7. 수익화 방안

상세하게 기획해주세요.`;

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
    return NextResponse.json({ error: error.message || '시리즈 기획 중 오류 발생' }, { status: 500 });
  }
}

