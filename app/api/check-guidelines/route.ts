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

    const systemPrompt = `당신은 유튜브 커뮤니티 가이드라인, 광고 수익화 정책, 저작권법 전문가입니다.
대본을 분석하여 다음을 모두 검사합니다:
1. 유튜브 커뮤니티 가이드라인 위반 여부
2. 광고 수익화 가능성 (광고주 친화적인지)
3. 연령 제한 가능성
4. 저작권 위험 요소 (브랜드명, 음악, 이미지 언급)
5. 문제가 되는 구체적 문장과 대체 문장 제안`;

    const prompt = `아래 유튜브 대본을 상세히 분석하세요.

대본:
${script}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "overallPass": true,
  "score": 85,
  "monetizationScore": "높음 (광고 제한 없음)",
  "ageRestriction": "전체 이용가",
  "copyrightRisks": [
    "위험 요소가 있으면 여기에 기재 (없으면 빈 배열)"
  ],
  "highlightedIssues": [
    {
      "text": "문제가 되는 원본 문장",
      "suggestion": "대체할 수 있는 안전한 문장"
    }
  ],
  "checks": [
    {
      "item": "폭력적 콘텐츠",
      "pass": true,
      "detail": "폭력적 표현이 없습니다"
    },
    {
      "item": "성적 콘텐츠",
      "pass": true,
      "detail": "성적 표현이 없습니다"
    },
    {
      "item": "혐오 발언",
      "pass": true,
      "detail": "혐오 표현이 없습니다"
    },
    {
      "item": "위험한 행위",
      "pass": true,
      "detail": "위험한 행위 조장이 없습니다"
    },
    {
      "item": "괴롭힘/사이버불링",
      "pass": true,
      "detail": "괴롭힘 요소가 없습니다"
    },
    {
      "item": "스팸/기만적 행위",
      "pass": true,
      "detail": "기만적 요소가 없습니다"
    },
    {
      "item": "저작권",
      "pass": true,
      "detail": "저작권 위반 소지가 없습니다"
    },
    {
      "item": "광고주 친화성",
      "pass": true,
      "detail": "광고 게재에 적합합니다"
    },
    {
      "item": "민감한 사건/이슈",
      "pass": true,
      "detail": "민감한 사건 언급이 없습니다"
    },
    {
      "item": "어린이 안전",
      "pass": true,
      "detail": "어린이에게 부적절한 내용이 없습니다"
    }
  ],
  "suggestions": [
    "개선 제안 1",
    "개선 제안 2"
  ]
}

각 항목을 꼼꼼하게 검사하고, 문제가 있으면 pass를 false로, detail에 구체적 이유를 적으세요.
overallPass는 모든 checks가 pass일 때만 true입니다.
score는 0~100 사이 점수입니다.`;

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
    const message = error instanceof Error ? error.message : "가이드라인 검사 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
