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
    const { script, provider, apiKey } = await request.json();
    if (!script || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const systemPrompt = `당신은 유튜브 대본 구조 분석 전문가입니다.
대본의 인트로, 본문, 아웃트로 구조를 분석하고 점수를 매깁니다.
시청자 이탈률을 줄이고 끝까지 시청하게 만드는 구조를 추천합니다.`;

    const prompt = `아래 유튜브 대본의 구조를 상세히 분석해주세요.

대본:
${script}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "overallScore": 75,
  "structure": {
    "intro": {
      "score": 80,
      "hookStrength": "강함/보통/약함",
      "hookType": "훅 유형 (질문/충격/공감/통계 등)",
      "analysis": "인트로 분석 상세 설명",
      "improvement": "구체적 개선 제안"
    },
    "body": {
      "score": 70,
      "flowScore": 75,
      "analysis": "본문 구조 분석",
      "pacing": "빠름/적절/느림",
      "improvement": "구체적 개선 제안"
    },
    "outro": {
      "score": 60,
      "ctaPresent": true,
      "ctaStrength": "강함/보통/약함/없음",
      "analysis": "아웃트로 분석",
      "improvement": "구체적 개선 제안"
    }
  },
  "retentionPrediction": {
    "estimated30sec": "30초 시점 예상 시청 유지율 (%)",
    "estimatedMiddle": "중간 시점 예상 시청 유지율 (%)",
    "estimatedEnd": "끝 시점 예상 시청 유지율 (%)",
    "dropOffPoints": ["이탈 예상 지점 1", "이탈 예상 지점 2"]
  },
  "suggestions": [
    "구체적 개선 제안 1",
    "구체적 개선 제안 2",
    "구체적 개선 제안 3",
    "구체적 개선 제안 4",
    "구체적 개선 제안 5"
  ]
}

점수는 0~100 사이로 매겨주세요.`;

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
    const message = error instanceof Error ? error.message : "구조 분석 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
