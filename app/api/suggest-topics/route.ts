import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { genre, subGenre, platform, aiProvider, apiKey } = await req.json();
    if (!apiKey) return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });

    const prompt = `당신은 유튜브 콘텐츠 기획 전문가입니다.

장르: ${genre || '일반'}
서브장르: ${subGenre || ''}
플랫폼: ${platform || 'YouTube'}

위 장르에 맞는 유튜브 영상 주제 10개를 추천해주세요.
각 주제는 15~30자 이내로, 시청자의 호기심을 자극하는 형태로 작성하세요.
JSON 배열 형식으로만 반환하세요. 예: ["주제1","주제2",...]`;

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2000 } }),
      });
      const data = await res.json();
      result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }),
      });
      const data = await res.json();
      result = data?.choices?.[0]?.message?.content || '';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      result = data?.content?.[0]?.text || '';
    }

    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
