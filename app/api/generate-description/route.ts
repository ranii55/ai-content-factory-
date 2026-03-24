import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, aiProvider, apiKey } = await req.json();
    if (!topic || !apiKey) {
      return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `"${topic}" 영상의 ${platform || 'YouTube'} 설명란을 작성해주세요:

포함 항목:
1. SEO 최적화된 설명 (처음 2줄이 검색에 노출되므로 핵심 키워드 포함)
2. 영상 내용 요약 (3~5줄)
3. 타임스탬프 (예상)
4. 관련 링크 섹션
5. SNS 링크 섹션
6. 해시태그 15~20개
7. 추천 태그 20개
8. 검색 노출을 위한 키워드 배치 팁

설명란 전체를 바로 복사해서 쓸 수 있게 작성해주세요.`;

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
    return NextResponse.json({ error: error.message || '설명란 생성 중 오류 발생' }, { status: 500 });
  }
}

