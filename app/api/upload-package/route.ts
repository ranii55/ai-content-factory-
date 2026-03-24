import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { title, script, scriptText, category = '교육', aiProvider, apiKey } = await req.json();
    if (!title || !apiKey) return NextResponse.json({ error: '제목과 API 키가 필요합니다.' }, { status: 400 });
    const text = script || scriptText || '';
    const prompt = `유튜브 콘텐츠 매니저로서 업로드 메타데이터를 한번에 생성하세요.\n\n제목: ${title}\n카테고리: ${category}\n${text ? '대본요약:\n'+text.slice(0,2000) : ''}\n\n출력:\n## 📦 업로드 패키지\n### 📌 제목 후보 3개 (SEO/호기심/감성)\n### 📝 설명란 (타임스탬프+링크+해시태그 포함, 복사용)\n### 🏷️ 태그 30개 (쉼표구분)\n### #️⃣ 해시태그 15개\n### 🖼️ 썸네일 텍스트 3개\n### 📱 Shorts 변환 제안\n### ⏰ 업로드 최적 시간\n### ✅ 업로드 전 체크리스트`;
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
