import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { script, scriptText, aiProvider, apiKey } = await req.json();
    const text = script || scriptText;
    if (!text || !apiKey) return NextResponse.json({ error: '대본과 API 키가 필요합니다.' }, { status: 400 });
    const prompt = `영상 제작 전문가로서 아래 대본의 등장인물을 분석하세요.\n\n대본:\n${text}\n\n출력:\n## 👥 등장인물 분석\n### 📋 등장인물 목록 (이름,역할,성격,말투,등장빈도,대사비율)\n### 🎭 화자 구분 (내레이션 vs 대사 분리)\n### 🔊 TTS 음성 추천 (각 인물별 성별,나이,톤,OpenAI보이스명)\n### 📊 대사 통계 (총대사수,내레이션%,대화%,평균길이)\n### 🎨 캐릭터 이미지 프롬프트 (DALL-E용 영문)`;
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
