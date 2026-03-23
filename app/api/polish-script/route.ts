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
        max_tokens: 8000,
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
        max_tokens: 8000,
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
    const { script, mode, provider, apiKey } = await request.json();
    if (!script || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const modeInstructions: Record<string, string> = {
      fix: "오탈자 수정, 맞춤법 교정, 띄어쓰기 수정만 합니다. 문장 구조는 최대한 유지합니다.",
      natural: "오탈자 수정 + 어색한 문장을 자연스럽게 다듬습니다. 원래 의미와 톤은 유지합니다.",
      spoken: "문어체를 자연스러운 구어체(말하기 스타일)로 변환합니다. 유튜브 영상 나레이션에 적합하게 만듭니다.",
      written: "구어체를 깔끔한 문어체(글쓰기 스타일)로 변환합니다. 블로그나 자막에 적합하게 만듭니다.",
    };

    const modeInstruction = modeInstructions[mode] || modeInstructions.natural;

    const systemPrompt = `당신은 한국어 대본 교정 전문가입니다.
${modeInstruction}

규칙:
- 음성인식(STT)으로 생성된 텍스트의 오류를 감지하고 수정합니다
- 브랜드명, 고유명사는 문맥에 맞게 통일합니다
- 원래 의도와 핵심 메시지는 절대 변경하지 않습니다`;

    const prompt = `아래 대본을 교정해주세요.

원본 대본:
${script}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "polished": "교정된 전체 대본",
  "changes": [
    {
      "original": "원본 텍스트",
      "corrected": "수정된 텍스트",
      "reason": "수정 이유"
    }
  ],
  "summary": "총 수정 사항 요약 (예: 오탈자 5개, 문장 다듬기 3개, 띄어쓰기 2개)"
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
    const message = error instanceof Error ? error.message : "교정 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
