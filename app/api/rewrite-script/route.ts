import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { script, scriptText, platform, aiProvider, apiKey } = body;
    const text = script || scriptText;
    
    if (!text) {
      return NextResponse.json({ error: '대본을 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키를 설정해 주세요. (우측 상단 🔑 버튼)' }, { status: 400 });
    }

    const prompt = `다음 대본을 완전히 새로운 스타일로 리라이트해주세요:
- 같은 내용이지만 완전히 다른 어투와 구성으로
- 더 매력적이고 흥미로운 표현 사용
- 후킹을 강화하고 시청 유지율을 높이는 구성
- 원본의 핵심 메시지는 유지

원본 대본:
${text}

리라이트된 대본을 출력해주세요.`;

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
    return NextResponse.json({ error: error.message || '리라이트 중 오류 발생' }, { status: 500 });
  }
}
