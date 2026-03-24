import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, aiProvider, apiKey } = await req.json();
    if (!topic || !apiKey) {
      return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `"${topic}" 영상의 ${platform || 'YouTube'} 업로드 체크리스트를 만들어주세요:

체크리스트 항목:
☐ 촬영 전 준비
☐ 촬영 중 체크
☐ 편집 체크
☐ 썸네일 체크
☐ 제목/설명란 체크
☐ 태그/해시태그 체크
☐ 업로드 설정 체크
☐ 공개 후 체크
☐ 홍보 체크

각 항목별로 구체적인 세부 체크 항목을 포함해주세요.
바로 인쇄해서 쓸 수 있는 형식으로 작성해주세요.`;

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 }),
      });
      const data = await res.json();
      result = data.choices?.[0]?.message?.content || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      result = data.content?.[0]?.text || '결과를 생성할 수 없습니다.';
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '체크리스트 생성 중 오류 발생' }, { status: 500 });
  }
}

