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
    const { script, format, provider, apiKey } = await request.json();
    if (!script || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const isShorts = format === "shorts";
    const systemPrompt = `당신은 유튜브 챕터/타임스탬프 생성 전문가입니다.
대본을 분석하여 자연스러운 구간별 타임스탬프를 생성합니다.
${isShorts ? "쇼츠(60초)용으로 5초 단위로 세밀하게 나눕니다." : "롱폼(8~15분)용으로 적절한 간격의 챕터를 만듭니다."}
유튜브 설명란에 바로 복사할 수 있는 형식으로 만듭니다.`;

    const prompt = `아래 대본을 분석하여 유튜브 챕터/타임스탬프를 생성하세요.

대본:
${script}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "chapters": [
    {
      "timestamp": "00:00",
      "title": "챕터 제목",
      "summary": "이 구간의 핵심 내용 한줄 요약"
    }
  ],
  "copyText": "00:00 인트로\\n00:15 첫번째 주제\\n...",
  "totalChapters": 0,
  "estimatedDuration": "예상 총 재생시간"
}

copyText는 유튜브 설명란에 바로 붙여넣을 수 있는 텍스트 형식이어야 합니다.
첫 챕터는 반드시 00:00부터 시작하세요.`;

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
    const message = error instanceof Error ? error.message : "챕터 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
