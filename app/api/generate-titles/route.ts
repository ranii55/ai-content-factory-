import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { topic, genre, subGenre, tone, platform, style, aiProvider, apiKey } = await req.json();
    if (!apiKey) return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });

    const prompt = `당신은 유튜브 제목 전문가입니다.
${genre ? `장르: ${genre}` : ''}${subGenre ? ` > ${subGenre}` : ''}
${topic ? `주제: ${topic}` : '장르에 맞는 인기 주제를 자동 선정하세요.'}
톤: ${tone || '일반'}
플랫폼: ${platform || 'YouTube'}
${style === 'provocative' ? '\n⚡ 더 자극적이고 클릭을 강하게 유도하는 스타일로 작성하세요. 호기심, 충격, 긴급성을 극대화하세요.' : ''}

유튜브 영상 제목을 정확히 10개 생성하세요.

각 제목은:
- 15~30자 사이
- 클릭을 유도하는 후킹 요소 포함 (숫자, 감정단어, 궁금증, 충격)
- 검색 최적화(SEO)를 고려한 키워드 포함
- 서로 다른 스타일 (궁금증형, 충격형, 숫자형, 감정형, 비교형 등)

다음 형식으로 출력하세요 (반드시 이 형식 준수):

[TITLE_1] 제목내용
[TITLE_2] 제목내용
[TITLE_3] 제목내용
[TITLE_4] 제목내용
[TITLE_5] 제목내용
[TITLE_6] 제목내용
[TITLE_7] 제목내용
[TITLE_8] 제목내용
[TITLE_9] 제목내용
[TITLE_10] 제목내용

각 제목 뒤에 | 구분자로 후킹 타입을 추가하세요.
예: [TITLE_1] 99%가 모르는 충격적 진실 | 숫자+충격형`;

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
