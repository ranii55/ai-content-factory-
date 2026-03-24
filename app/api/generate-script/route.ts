import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, category, duration, audience, aiProvider, apiKey, customPrompt } = await req.json();
    if (!topic || !apiKey) return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });

    const prompt = customPrompt || `당신은 전문 ${platform || 'YouTube'} 크리에이터입니다. 다음 조건으로 영상 대본을 작성해주세요:\n\n주제: ${topic}\n플랫폼: ${platform || 'YouTube'}\n카테고리: ${category || '일반'}\n영상 길이: ${duration || '8'}분\n타깃 시청자: ${audience || '일반'}\n\n대본 구성:\n1. 🎬 인트로 (Hook)\n2. 📋 본론\n3. 💡 인사이트\n4. 📢 아웃트로\n\n요구사항:\n- 구어체\n- [B-roll], [자막], [효과음] 편집 포인트\n- 타임라인 포함\n\n전체 대본을 작성해주세요.`;

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
