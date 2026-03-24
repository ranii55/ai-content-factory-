import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { script, scriptText, genre = '정보/교육', aiProvider, apiKey } = await req.json();
    const text = script || scriptText;
    if (!text || !apiKey) return NextResponse.json({ error: '대본과 API 키가 필요합니다.' }, { status: 400 });
    const prompt = `영상 음악감독으로서 대본을 분석하여 BGM과 효과음을 추천하세요.\n\n대본:\n${text}\n장르: ${genre}\n\n출력:\n## 🎵 BGM & 효과음 추천\n### 🎼 전체 분위기\n### 📑 장면별 BGM (장르,악기,BPM,볼륨)\n- YouTube Audio Library 검색키워드\n- Pixabay Music 검색키워드\n### 🔔 효과음 포인트 (타이밍+종류+무료사이트)\n### 🎚️ 오디오 믹싱 가이드 (내레이션/BGM/효과음 dB)\n### 📦 무료 BGM 사이트 모음 (URL포함)`;
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
