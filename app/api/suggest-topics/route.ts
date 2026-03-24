import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { genre, subGenre, platform, aiProvider, apiKey } = await req.json();
    if (!apiKey) return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });

    const prompt = `당신은 유튜브 콘텐츠 기획 전문가입니다.

장르: ${genre || '일반'}${subGenre ? ' > ' + subGenre : ''}
플랫폼: ${platform || 'YouTube'}

이 장르에서 조회수가 높을 만한 영상 주제를 정확히 10개 추천하세요.

조건:
- 각 주제는 구체적이고 흥미를 끌어야 합니다
- 트렌드를 반영하세요
- 서로 다른 각도의 주제여야 합니다
- 한 줄에 하나씩, 간결하게 작성하세요

다음 형식으로 출력하세요:

[TOPIC_1] 주제내용
[TOPIC_2] 주제내용
[TOPIC_3] 주제내용
[TOPIC_4] 주제내용
[TOPIC_5] 주제내용
[TOPIC_6] 주제내용
[TOPIC_7] 주제내용
[TOPIC_8] 주제내용
[TOPIC_9] 주제내용
[TOPIC_10] 주제내용`;

    let result = '';
    if (aiProvider === 'gemini') {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: 'Gemini: ' + data.error.message }, { status: 500 });
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: 'OpenAI: ' + data.error.message }, { status: 500 });
      result = data.choices?.[0]?.message?.content || '';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: 'Claude: ' + data.error.message }, { status: 500 });
      result = data.content?.[0]?.text || '';
    }

    return NextResponse.json({ result });
  } catch (error) { return NextResponse.json({ error: error.message || '오류 발생' }, { status: 500 }); }
}
