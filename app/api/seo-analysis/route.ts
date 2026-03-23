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
    const { script, title, provider, apiKey } = await request.json();
    if (!script || !provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const systemPrompt = `당신은 유튜브 SEO 분석 전문가입니다.
대본과 제목을 분석하여 검색 최적화 점수와 개선 방안을 제공합니다.
유튜브 알고리즘에 대한 깊은 이해를 바탕으로 분석합니다.`;

    const prompt = `아래 유튜브 대본과 제목의 SEO를 분석해주세요.

${title ? `제목: ${title}` : ""}
대본:
${script}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "overallScore": 75,
  "titleScore": 80,
  "keywordAnalysis": {
    "mainKeywords": ["핵심 키워드1", "핵심 키워드2"],
    "density": "키워드 밀도 설명",
    "missingKeywords": ["추가 추천 키워드1", "추가 추천 키워드2"]
  },
  "titleAnalysis": {
    "current": "현재 제목 분석",
    "suggestions": ["개선된 제목 1", "개선된 제목 2", "개선된 제목 3"],
    "clickbaitScore": 70,
    "seoScore": 75
  },
  "contentAnalysis": {
    "topicRelevance": "주제 관련성 분석",
    "searchIntent": "검색 의도 매칭 분석",
    "competitiveness": "경쟁도 분석"
  },
  "recommendations": [
    "구체적인 SEO 개선 제안 1",
    "구체적인 SEO 개선 제안 2",
    "구체적인 SEO 개선 제안 3",
    "구체적인 SEO 개선 제안 4",
    "구체적인 SEO 개선 제안 5"
  ],
  "tagSuggestions": ["태그1", "태그2", "태그3", "태그4", "태그5"]
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
    const message = error instanceof Error ? error.message : "SEO 분석 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
