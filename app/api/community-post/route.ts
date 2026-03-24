import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, aiProvider, apiKey } = await req.json();
    if (!topic || !apiKey) {
      return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `"${topic}" 주제로 ${platform || 'YouTube'} 커뮤니티 글을 작성해주세요:

3가지 버전을 만들어주세요:
1. 투표형 (팬 참여 유도)
2. 공지/예고형 (다음 영상 예고)
3. 소통형 (일상/질문)

각 버전에 포함할 것:
- 본문 텍스트
- 이모지 활용
- 해시태그
- 최적 게시 시간 추천
- 참여율 높이는 팁

${platform === 'instagram' ? 'Instagram 스토리/피드용으로도 작성해주세요.' : ''}
${platform === 'tiktok' ? 'TikTok 댓글 고정용도 포함해주세요.' : ''}`;

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
    return NextResponse.json({ error: error.message || '커뮤니티 글 생성 중 오류 발생' }, { status: 500 });
  }
}

