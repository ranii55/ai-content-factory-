import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channelTopic,
      platforms = ['youtube'],
      duration = '4주',
      uploadsPerWeek = 3,
      contentStyle = '정보/교육',
      aiProvider = 'gemini',
      apiKey
    } = body;

    if (!channelTopic) {
      return NextResponse.json({ error: '채널 주제를 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API 키를 설정해 주세요.' }, { status: 400 });
    }

    const platformList = platforms.join(', ');

    const prompt = `당신은 콘텐츠 마케팅 전략가이자 유튜브/틱톡 채널 운영 전문가입니다.

아래 정보를 바탕으로 콘텐츠 업로드 캘린더를 만들어 주세요.

【채널 정보】
- 주제: ${channelTopic}
- 플랫폼: ${platformList}
- 기간: ${duration}
- 주당 업로드 횟수: ${uploadsPerWeek}회
- 콘텐츠 스타일: ${contentStyle}

【출력 형식 (반드시 아래 형식으로)】

## 📅 콘텐츠 캘린더 (${duration})

### 전체 전략 요약
(채널 성장을 위한 핵심 전략 3줄)

### 주차별 계획

#### 📌 1주차
| 요일 | 플랫폼 | 콘텐츠 유형 | 제목 (안) | 핵심 키워드 |
|------|--------|------------|----------|------------|
(주당 ${uploadsPerWeek}개 콘텐츠)

#### 📌 2주차
(같은 형식)

#### 📌 3주차
(같은 형식)

#### 📌 4주차
(같은 형식)

${duration !== '4주' ? '(추가 주차도 동일 형식으로 작성)' : ''}

### 🔄 콘텐츠 믹스 비율
- 메인 콘텐츠 (롱폼): ____%
- 쇼츠/릴스 (숏폼): ____%
- 커뮤니티/소통: ____%
- 트렌드/이슈: ____%

### ⏰ 추천 업로드 시간
(플랫폼별 최적 업로드 시간대)

### 📈 성장 마일스톤
- 1주차 목표: 
- 2주차 목표: 
- 3주차 목표: 
- 4주차 목표: 

### 💡 추가 팁
(채널 성장을 위한 실행 가능한 팁 5가지)`;

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
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      result = data?.content?.[0]?.text || '결과를 생성할 수 없습니다.';
    }

    return NextResponse.json({
      success: true,
      channelTopic,
      platforms,
      duration,
      uploadsPerWeek,
      result
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '콘텐츠 캘린더 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
