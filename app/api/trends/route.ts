import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, platform = 'youtube', aiProvider = 'gemini', apiKey } = body;

    if (!keyword) {
      return NextResponse.json({ error: '키워드를 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키를 설정해 주세요.' }, { status: 400 });
    }

    const platformName = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : 'YouTube';

    const prompt = `당신은 ${platformName} 트렌드 분석 전문가입니다.

"${keyword}" 키워드에 대해 최신 트렌드를 분석해 주세요.

【분석 항목】

## 📈 트렌드 개요
- 현재 "${keyword}" 관련 콘텐츠 트렌드 요약
- 인기 상승 중인 세부 주제 5개

## 🔥 인기 콘텐츠 유형
- 가장 많이 소비되는 콘텐츠 형식 (쇼츠, 롱폼, 라이브 등)
- 추천 영상 길이

## 🎯 추천 콘텐츠 아이디어
- "${keyword}" 관련 영상 아이디어 10개 (제목 포함)
- 각 아이디어별 예상 조회수 등급 (상/중/하)

## 📊 키워드 분석
- 관련 검색 키워드 15개
- 롱테일 키워드 10개

## #️⃣ 추천 해시태그
- ${platformName}용 해시태그 20개

## 💡 크리에이터 전략
- 이 트렌드를 활용한 채널 성장 전략 3가지
- 최적 업로드 시간대
- 타깃 시청자층`;

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
    return NextResponse.json({ error: error.message || '트렌드 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
