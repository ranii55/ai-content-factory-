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
    const { script, chapters, titles, hashtags, provider, apiKey } = await request.json();
    if (!script || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const extraInfo = [];
    if (chapters) extraInfo.push(`챕터 정보:\n${chapters}`);
    if (titles && titles.length > 0) extraInfo.push(`추천 제목:\n${titles.join("\n")}`);
    if (hashtags && hashtags.length > 0) extraInfo.push(`해시태그:\n${hashtags.join(" ")}`);

    const systemPrompt = `당신은 유튜브 SEO 및 설명란 작성 전문가입니다.
대본 내용을 기반으로 유튜브 영상 설명란을 작성합니다.
검색 최적화(SEO)에 맞는 키워드를 자연스럽게 포함시킵니다.
시청자가 클릭하고 싶어하는 매력적인 설명을 작성합니다.`;

    const prompt = `아래 대본을 기반으로 유튜브 영상 설명란을 작성해주세요.

대본:
${script}

${extraInfo.length > 0 ? extraInfo.join("\n\n") : ""}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "description": "완성된 유튜브 설명란 텍스트 (줄바꿈 포함)",
  "seoKeywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3"],
  "callToAction": "구독/좋아요 유도 문구",
  "sections": {
    "intro": "영상 소개 (2~3줄)",
    "chapters": "타임스탬프 (있을 경우)",
    "links": "관련 링크 섹션",
    "social": "SNS 링크 섹션",
    "tags": "해시태그 섹션"
  }
}

설명란은 총 1000~2000자 사이로 작성하세요.`;

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
    const message = error instanceof Error ? error.message : "설명란 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
