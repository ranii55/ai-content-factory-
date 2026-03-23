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
    const { topic, episodeCount, category, provider, apiKey } = await request.json();
    if (!topic || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const count = episodeCount || 5;

    const systemPrompt = "당신은 유튜브 시리즈 콘텐츠 기획 전문가입니다. 하나의 주제를 여러 에피소드로 나누어 시청자가 계속 보고 싶어하는 시리즈를 기획합니다. 각 에피소드마다 강력한 훅과 다음 편 예고를 포함합니다.";
    const prompt = `아래 주제로 ${count}편짜리 유튜브 시리즈를 기획하세요.

주제: ${topic}
카테고리: ${category || "일반"}
에피소드 수: ${count}편

각 에피소드는:
- 독립적으로도 볼 수 있지만 시리즈로 이어지는 구성
- 첫 3초 훅이 강력할 것
- 다음 편이 궁금해지는 마무리

반드시 아래 JSON 형식으로만 응답하세요:
{
  "seriesTitle": "시리즈 전체 제목",
  "concept": "시리즈 전체 컨셉 설명 (2~3문장)",
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "에피소드 제목",
      "summary": "에피소드 내용 요약 (3~4문장)",
      "hook": "첫 3초 훅 문장"
    }
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
    const message = error instanceof Error ? error.message : "시리즈 기획 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
