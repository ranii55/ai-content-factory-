import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { topic, genre = '정보/교육', chapterCount = 7, aiProvider, apiKey } = await req.json();
    if (!topic || !apiKey) return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });
    const prompt = `전문 스토리 작가로서 아래 주제의 시놉시스를 작성하세요.\n\n주제: ${topic}\n장르: ${genre}\n챕터수: ${chapterCount}\n\n출력형식:\n## 📖 시놉시스\n### 🎯 핵심 메시지\n### 📋 전체 플롯 요약 (3~5줄)\n### 👤 등장인물 설정 (이름,성격,역할)\n### 📑 챕터 구성 (각 챕터: 제목,핵심내용,감정톤,예상길이,전환포인트)\n### 🎭 감정 곡선\n### 🎬 영상 스타일 제안\n### 📊 예상 영상 길이`;
    let result = '';
    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과 없음';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data.choices?.[0]?.message?.content || '결과 없음';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data.content?.[0]?.text || '결과 없음';
    }
    return NextResponse.json({ result });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
