import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      script,
      targetLanguage = 'en',
      platform = 'youtube',
      keepTone = true,
      aiProvider = 'gemini',
      apiKey
    } = body;

    if (!script) {
      return NextResponse.json({ error: '번역할 대본을 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API 키를 설정해 주세요.' }, { status: 400 });
    }

    const langMap: Record<string, string> = {
      en: '영어 (English)',
      ja: '일본어 (日本語)',
      zh: '중국어 간체 (简体中文)',
      'zh-tw': '중국어 번체 (繁體中文)',
      es: '스페인어 (Español)',
      vi: '베트남어 (Tiếng Việt)',
      th: '태국어 (ภาษาไทย)',
      id: '인도네시아어 (Bahasa Indonesia)',
      pt: '포르투갈어 (Português)',
      de: '독일어 (Deutsch)',
      fr: '프랑스어 (Français)'
    };

    const targetLangName = langMap[targetLanguage] || targetLanguage;

    const prompt = `당신은 전문 콘텐츠 번역가입니다. ${platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : 'YouTube'} 콘텐츠에 최적화된 번역을 해주세요.

【번역 규칙】
1. 직역이 아닌 해당 언어권 시청자에게 자연스러운 의역을 해주세요.
2. ${keepTone ? '원본의 말투와 톤을 최대한 유지해 주세요.' : '해당 언어권에서 인기 있는 크리에이터 말투로 변환해 주세요.'}
3. 문화적 맥락이 다른 표현은 현지화해 주세요.
4. 숫자, 단위, 화폐 등은 해당 국가 기준으로 변환해 주세요.
5. SEO를 고려해 해당 언어의 검색 키워드를 자연스럽게 포함해 주세요.

【원본 대본 (한국어)】
${script}

【출력 형식 (반드시 아래 형식으로)】

## 🌐 번역 결과 (${targetLangName})

### 번역된 대본
(전체 번역 대본)

### 📝 번역 노트
- 의역한 부분과 이유 (3~5개)
- 현지화 변경 사항

### 🔍 SEO 키워드 (${targetLangName})
(해당 언어 검색 최적화 키워드 10개)

### #️⃣ 해시태그 (${targetLangName})
(해당 언어 해시태그 15개)

### 📌 제목 번역 후보
(매력적인 제목 번역안 3개)

### ⚠️ 주의사항
(문화적 차이로 주의할 점)`;

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
      targetLanguage: targetLangName,
      platform,
      originalLength: script.length,
      result
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '번역 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
