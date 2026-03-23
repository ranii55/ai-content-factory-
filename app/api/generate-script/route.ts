import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, platform = 'youtube', category = '교육/정보', duration = '8분', audience = '일반', aiProvider = 'gemini', apiKey } = body;

    if (!topic) {
      return NextResponse.json({ error: '주제를 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키를 설정해 주세요. 오른쪽 위 ⚙️ 버튼을 클릭하세요.' }, { status: 400 });
    }

    const platformName = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram Reels' : 'YouTube';

    const prompt = `당신은 ${platformName} 전문 대본 작가입니다.

아래 조건에 맞는 영상 대본을 작성해 주세요.

【조건】
- 플랫폼: ${platformName}
- 카테고리: ${category}
- 영상 길이: ${duration}
- 타깃 시청자: ${audience}
- 주제: ${topic}

【대본 형식】
## 🎬 영상 제목
(클릭을 유도하는 매력적인 제목 3개 제안)

## 🎣 후킹 (처음 5초)
(시청자를 잡는 강력한 오프닝 멘트)

## 📝 본문 대본
(${duration} 분량에 맞는 상세한 대본. 자연스러운 말투로 작성)

## 🔚 엔딩
(구독/좋아요 유도 + 다음 영상 예고)

## #️⃣ 해시태그
(관련 해시태그 15개)

## 📌 촬영 팁
(이 영상을 촬영할 때 참고할 포인트 3가지)`;

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
        return NextResponse.json({ error: data.error.message || 'Gemini API 오류' }, { status: 500 });
      }
      result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 })
      });
      const data = await res.json();
      result = data?.choices?.[0]?.message?.content || '결과를 생성할 수 없습니다.';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
     result = data?.content?.[0]?.text || '결과를 생성할 수 없습니다.';
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '대본 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
