import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, genre, subGenre, tone, platform, style, aiProvider, apiKey } = await req.json();
    if (!apiKey) return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
    if (!topic) return NextResponse.json({ error: '주제를 입력하세요.' }, { status: 400 });

    const styleGuide = style === 'provocative' ? '자극적이고 클릭을 유발하는' :
      style === 'curiosity' ? '호기심을 자극하는 질문형' :
      style === 'emotional' ? '감성적이고 공감을 이끄는' : '다양한 스타일의';

    const prompt = `당신은 유튜브 제목 전문가입니다.

주제: ${topic}
장르: ${genre || '일반'} > ${subGenre || ''}
톤: ${tone || '기본'}
플랫폼: ${platform || 'YouTube'}

위 주제로 ${styleGuide} 유튜브 제목 10개를 만들어주세요.

규칙:
- 각 제목은 15~40자
- 후킹 요소 포함 (숫자, 질문, 감정, 반전 등)
- SEO 키워드 자연스럽게 포함
- 서로 다른 후킹 유형 사용

JSON 배열로만 반환하세요. 각 항목은 {title, hookType} 형태입니다.
예: [{"title":"제목1","hookType":"숫자 후킹"},{"title":"제목2","hookType":"질문형"}]`;

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 3000 } }),
      });
      const data = await res.json();
      result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 3000 }),
      });
      const data = await res.json();
      result = data?.choices?.[0]?.message?.content || '';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      result = data?.content?.[0]?.text || '';
    }

    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
