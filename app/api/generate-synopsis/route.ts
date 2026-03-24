import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, genre, chapterCount, aiProvider, apiKey, customPrompt } = await req.json();
    if (!topic || !apiKey) return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });

    const prompt = customPrompt || `당신은 전문 시나리오 작가입니다. 다음 주제로 시놉시스를 작성하세요:\n\n주제: ${topic}\n장르: ${genre || '정보/교육'}\n챕터: ${chapterCount || 7}개\n\n구성:\n1. 핵심 메시지\n2. 전체 스토리라인\n3. 챕터별 구성\n4. 등장인물\n5. 감정 곡선\n6. 차별화 포인트\n\n전체 시놉시스를 작성해주세요.`;

    let result = '';
    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: `Gemini: ${data.error.message}` }, { status: 500 });
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과 없음';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 8000 }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: `OpenAI: ${data.error.message}` }, { status: 500 });
      result = data.choices?.[0]?.message?.content || '결과 없음';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: `Claude: ${data.error.message}` }, { status: 500 });
      result = data.content?.[0]?.text || '결과 없음';
    } else return NextResponse.json({ error: 'AI 제공자를 선택해주세요.' }, { status: 400 });

    return NextResponse.json({ result });
  } catch (error: any) { return NextResponse.json({ error: error.message || '오류 발생' }, { status: 500 }); }
}
