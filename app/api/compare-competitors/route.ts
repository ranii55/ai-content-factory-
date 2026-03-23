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
    const { urls, provider, apiKey } = await request.json();
    if (!urls || urls.length < 2 || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const systemPrompt = "당신은 유튜브 채널 비교 분석 전문가입니다. 여러 채널/영상을 비교하여 각각의 강점, 약점, 스타일, 타겟을 분석하고 전략을 제안합니다.";
    const prompt = `아래 유튜브 채널/영상들을 비교 분석하세요.

URL 목록:
${urls.map((u: string, i: number) => `${i + 1}. ${u}`).join("\n")}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "channels": [
    {
      "name": "채널명 또는 영상 제목",
      "style": "콘텐츠 스타일 설명",
      "target": "타겟 오디언스",
      "strengths": "강점",
      "weaknesses": "약점"
    }
  ],
  "comparisonTable": "간단한 비교 요약 텍스트",
  "recommendations": ["전략 추천 1", "전략 추천 2", "전략 추천 3"]
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
    const message = error instanceof Error ? error.message : "비교 분석 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
