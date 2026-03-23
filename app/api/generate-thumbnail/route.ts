import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      style = 'youtube',
      mood = '밝고 눈에 띄는',
      aiProvider = 'openai',
      apiKey
    } = body;

    if (!title) {
      return NextResponse.json({ error: '영상 제목을 입력해 주세요.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키를 설정해 주세요.' }, { status: 400 });
    }

    const styleGuide: Record<string, string> = {
      youtube: 'YouTube 썸네일 (16:9, 1280x720), 큰 텍스트, 밝은 색상, 얼굴 클로즈업 또는 강렬한 이미지',
      tiktok: 'TikTok 커버 (9:16, 1080x1920), 세로형, 트렌디한 디자인, 짧은 텍스트',
      instagram: 'Instagram Reels 커버 (9:16, 1080x1920), 감성적, 깔끔한 레이아웃',
      shopping: '쇼핑 콘텐츠 썸네일, 상품이 돋보이는 구도, 가격/할인 강조, 깔끔한 배경'
    };

    // OpenAI DALL-E 사용
    if (aiProvider === 'openai') {
      const imagePrompt = `Create a ${styleGuide[style] || styleGuide.youtube} thumbnail image.
Topic: ${title}
${description ? `Description: ${description}` : ''}
Mood: ${mood}
Style: Professional YouTube thumbnail design with bold visual impact. No text in the image.
The image should be eye-catching, high contrast, and make viewers want to click.`;

      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: style === 'youtube' ? '1792x1024' : '1024x1792',
          quality: 'standard'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'DALL-E 이미지 생성 실패');
      }

      const data = await res.json();
      const imageUrl = data?.data?.[0]?.url;
      const revisedPrompt = data?.data?.[0]?.revised_prompt;

      return NextResponse.json({
        success: true,
        provider: 'openai-dalle3',
        imageUrl,
        revisedPrompt,
        style,
        size: style === 'youtube' ? '1792x1024' : '1024x1792',
        message: '썸네일 이미지가 생성되었습니다.',
        tips: [
          '생성된 이미지 위에 Canva나 Photoshop으로 텍스트를 추가하세요.',
          '제목은 3~5단어로 짧게, 폰트 크기는 크게 설정하세요.',
          '밝은 테두리나 그림자를 추가하면 눈에 더 잘 띕니다.'
        ]
      });
    }

    // Gemini 사용 (텍스트 프롬프트만 생성)
    if (aiProvider === 'gemini') {
      const promptForGemini = `당신은 유튜브 썸네일 디자인 전문가입니다.

아래 영상 정보를 바탕으로 썸네일 디자인 가이드를 만들어 주세요.

영상 제목: ${title}
${description ? `설명: ${description}` : ''}
플랫폼: ${style}
분위기: ${mood}

【출력 형식】

## 🎨 썸네일 디자인 가이드

### 레이아웃 구성
(배치, 구도, 비율 설명)

### 색상 팔레트
(추천 색상 3~5개, HEX 코드 포함)

### 텍스트 배치
(제목 텍스트 추천 3개, 폰트 스타일, 크기, 위치)

### 이미지/소재 추천
(어떤 이미지나 아이콘을 사용할지)

### DALL-E / Midjourney 프롬프트
(이미지 생성 AI에 바로 넣을 수 있는 영문 프롬프트)

### Canva 제작 팁
(Canva에서 만들 때 참고할 포인트 3가지)`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptForGemini }] }] })
        }
      );
      const data = await res.json();
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';

      return NextResponse.json({
        success: true,
        provider: 'gemini',
        result,
        style,
        message: 'Gemini는 텍스트 가이드만 생성합니다. 실제 이미지는 OpenAI API 키로 전환하세요.'
      });
    }

    return NextResponse.json({ error: '지원하지 않는 AI 제공자입니다.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '썸네일 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
