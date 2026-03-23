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
    const { topic, category, provider, apiKey } = await request.json();
    if (!topic || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const systemPrompt = "당신은 유튜브 커뮤니티 탭 운영 전문가입니다. 구독자 참여를 높이는 글, 투표, 질문을 작성합니다. 친근하고 캐주얼한 톤으로 작성하며, 구독자가 댓글을 달고 싶어하는 글을 만듭니다.";
    const prompt = `아래 주제로 유튜브 커뮤니티 탭에 올릴 글 3개를 만들어주세요.

주제: ${topic}
카테고리: ${category || "일반"}

3가지 유형으로 만드세요:
1. 일반 글 (공지/소통형)
2. 투표 글 (선택지 4개)
3. 질문 글 (댓글 유도형)

반드시 아래 JSON 형식으로만 응답하세요:
[
  {
    "type": "일반 글",
    "text": "커뮤니티에 올릴 글 내용"
  },
  {
    "type": "투표",
    "text": "투표 질문 내용",
    "pollOptions": ["선택지1", "선택지2", "선택지3", "선택지4"]
  },
  {
    "type": "질문",
    "text": "댓글을 유도하는 질문 글 내용"
  }
]`;

    const result = await callAI(prompt, systemPrompt, provider, apiKey);
    let parsed;
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      parsed = [];
    }
    return NextResponse.json({ success: true, data: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "커뮤니티 글 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
