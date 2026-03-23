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
    const { script, tone, targetFormat, provider, apiKey } = await request.json();
    if (!script || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const toneMap: Record<string, string> = {
      professional: "전문적이고 신뢰감 있는 톤. 정확한 정보 전달에 초점.",
      casual: "친근하고 편안한 톤. 친구에게 이야기하듯이.",
      humor: "유머러스하고 재치 있는 톤. 웃기면서도 정보를 전달.",
      emotional: "감성적이고 공감을 이끄는 톤. 스토리텔링 중심.",
    };

    const formatMap: Record<string, string> = {
      shorts: "60초 이내 쇼츠 영상에 맞게 핵심만 압축. 첫 3초 훅 필수.",
      long: "8~15분 롱폼 영상에 맞게 상세하게 확장. 챕터 구분 가능하게.",
      same: "현재 길이를 유지하면서 톤만 변경.",
    };

    const toneInstruction = toneMap[tone] || toneMap.casual;
    const formatInstruction = formatMap[targetFormat] || formatMap.same;

    const systemPrompt = `당신은 유튜브 대본 리라이팅 전문가입니다.
원본 대본의 핵심 메시지와 정보는 유지하면서, 요청된 톤과 형식으로 재작성합니다.

톤 스타일: ${toneInstruction}
형식: ${formatInstruction}`;

    const prompt = `아래 대본을 리라이팅해주세요.

원본 대본:
${script}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "rewritten": "리라이팅된 전체 대본",
  "tone": "적용된 톤 설명",
  "format": "적용된 형식",
  "originalLength": 0,
  "newLength": 0,
  "estimatedDuration": "예상 재생시간",
  "keyChanges": ["변경 포인트 1", "변경 포인트 2", "변경 포인트 3"],
  "hookSuggestion": "추천 오프닝 훅 문장"
}

originalLength와 newLength는 글자수(숫자)로 적어주세요.`;

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
    const message = error instanceof Error ? error.message : "리라이팅 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
