import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, category, duration, audience, aiProvider, apiKey } = await req.json();
    if (!topic || !apiKey) {
      return NextResponse.json({ error: '주제와 API 키가 필요합니다.' }, { status: 400 });
    }

    const prompt = `당신은 전문 ${platform || 'YouTube'} 크리에이터입니다. 다음 조건으로 영상 대본을 작성해주세요:

주제: ${topic}
플랫폼: ${platform || 'YouTube'}
카테고리: ${category || '일반'}
영상 길이: ${duration || '8'}분
타깃 시청자: ${audience || '일반'}

대본 구성:
1. 🎬 인트로 (Hook - 처음 5초 시청자를 사로잡는 멘트)
2. 📋 본론 (핵심 내용을 단계별로 설명)
3. 💡 팁/인사이트 (시청자에게 추가 가치 제공)
4. 📢 아웃트로 (구독/좋아요 유도 + 다음 영상 예고)

요구사항:
- 구어체로 자연스럽게 작성
- 시청자와 대화하는 듯한 톤
- 중간중간 시청자 참여 유도 (질문, 댓글 유도)
- [B-roll], [자막], [효과음] 등 편집 포인트 표시
- 예상 타임라인 포함

전체 대본을 작성해주세요.`;

    let result = '';

    if (aiProvider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `Gemini API 오류: ${data.error.message}` }, { status: 500 });
      }
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 })
      });
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `OpenAI API 오류: ${data.error.message}` }, { status: 500 });
      }
      result = data.choices?.[0]?.message?.content || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `Claude API 오류: ${data.error.message}` }, { status: 500 });
      }
      result = data.content?.[0]?.text || '결과를 생성할 수 없습니다.';
    } else {
      return NextResponse.json({ error: 'AI 제공자를 선택해주세요.' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '대본 생성 중 오류 발생' }, { status: 500 });
  }
}

