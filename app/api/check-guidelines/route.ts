import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { scriptText, platform, aiProvider, apiKey } = await req.json();
    if (!scriptText || !apiKey) {
      return NextResponse.json({ error: '대본과 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `다음 ${platform || 'YouTube'} 대본을 커뮤니티 가이드라인 기준으로 검사해주세요:

검사 항목:
1. 폭력적/선정적 표현
2. 혐오 발언/차별적 표현
3. 저작권 위반 가능성
4. 광고/협찬 표시 필요 여부
5. 연령 제한 필요 여부
6. 스팸/오해 소지 표현
7. 개인정보 노출 위험

대본:
${scriptText}

각 항목별로 ✅ 통과 / ⚠️ 주의 / ❌ 위반 으로 판정하고, 구체적인 수정 제안을 해주세요.
마지막에 종합 점수(100점 만점)를 알려주세요.`;

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
    return NextResponse.json({ error: error.message || '가이드라인 체크 중 오류 발생' }, { status: 500 });
  }
}

