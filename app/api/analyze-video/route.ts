import { NextRequest, NextResponse } from "next/server";

async function callAI(prompt: string, systemPrompt: string, provider: string, apiKey: string): Promise<string> {
  if (provider === "gemini") {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { systemInstruction: systemPrompt },
    });
    return response.text || "";
  } else if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        max_tokens: 4096,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } else if (provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }
  throw new Error("지원하지 않는 AI");
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, category, provider, apiKey } = await request.json();
    if (!videoUrl || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const systemPrompt = `당신은 유튜브 영상 분석 전문가입니다. URL을 기반으로 다음을 종합 분석합니다:
1. 영상 내용 요약
2. 타겟 오디언스 (연령, 성별, 관심사)
3. 채널 스타일 (톤, 페이싱, 비주얼, 키워드)
4. 인기 영상 패턴 (조회수 높은 영상의 공통점)
5. 댓글 감성 분석 (긍정/부정/요청)
6. 벤치마킹 액션 아이템 (내 채널에 적용할 전략)`;

    const prompt = `아래 유튜브 영상을 종합 분석하세요.

영상 URL: ${videoUrl}
카테고리: ${category || "자동 감지"}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "영상 제목 (추정)",
  "summary": "영상 내용 요약 (3~5문장)",
  "targetAudience": {
    "ageRange": "주요 시청 연령대 (예: 20~35세)",
    "gender": "주요 성별 비율 (예: 남성 60%, 여성 40%)",
    "interests": ["관심사1", "관심사2", "관심사3"]
  },
  "channelStyle": {
    "tone": "말투/톤 설명",
    "pacing": "영상 속도감 설명",
    "visualStyle": "비주얼 스타일 설명",
    "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
  },
  "popularPatterns": [
    "이 채널/영상에서 발견되는 인기 패턴 1",
    "인기 패턴 2",
    "인기 패턴 3"
  ],
  "commentSentiment": {
    "positive": 70,
    "negative": 15,
    "requests": ["시청자 요청 1", "시청자 요청 2", "시청자 요청 3"]
  },
  "benchmarkActions": [
    "내 채널에 적용할 수 있는 구체적 액션 1",
    "액션 2",
    "액션 3",
    "액션 4",
    "액션 5"
  ],
  "suggestions": [
    "추가 제안 1",
    "추가 제안 2"
  ]
}`;

    const result = await callAI(prompt, systemPrompt, provider, apiKey);
    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: result };
    } catch {
      parsed = { raw: result };
    }
    return NextResponse.json({ success: true, data: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "영상 분석 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
