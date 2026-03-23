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
    const { category, format, scriptData, provider, apiKey } = await request.json();
    if (!provider || !apiKey) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const formatName = format === "shorts" ? "쇼츠 (60초)" : "롱폼 (8~15분)";

    const scriptInfo = scriptData
      ? `
현재 생성된 대본 정보:
- 제목: ${scriptData.title || "없음"}
- 썸네일 문구: ${scriptData.thumbnailTexts?.join(", ") || "없음"}
- 해시태그: ${scriptData.hashtags?.join(", ") || "없음"}
- BGM 추천: ${scriptData.bgmSuggestion || "없음"}
- TTS 대본: ${scriptData.ttsOptimized ? "있음" : "없음"}
- 장면 수: ${scriptData.scenes?.length || 0}개
- 이미지 프롬프트: ${scriptData.scenes?.filter((s: { imagePrompt?: string }) => s.imagePrompt).length || 0}개 생성됨
- 유튜브 추천 제목: ${scriptData.youtubeTitle?.join(", ") || "없음"}
- 훅 강도: ${scriptData.hookScore || "없음"}
- 예상 시간: ${scriptData.estimatedDuration || "없음"}
`
      : "대본이 아직 생성되지 않았습니다.";

    const systemPrompt = `당신은 유튜브 업로드 프로세스 전문가입니다.
영상 업로드 전 확인해야 할 모든 항목을 체크리스트로 만듭니다.
각 항목마다 실용적인 팁을 함께 제공합니다.

중요: 현재 생성된 대본 정보를 분석하여 이미 완료된 항목은 done: true로 자동 설정하세요.
예를 들어:
- 대본이 있으면 "대본 작성" → done: true
- 썸네일 문구가 있으면 "썸네일 텍스트 준비" → done: true
- 해시태그가 있으면 "해시태그 준비" → done: true
- 이미지 프롬프트가 있으면 "이미지/영상 소스 준비" → done: true
- TTS 대본이 있으면 "나레이션 준비" → done: true
- BGM 추천이 있으면 "BGM 선정" → done: true
- 제목이 있으면 "제목 작성" → done: true
아직 완료되지 않은 항목은 done: false로 설정하세요.`;

    const prompt = `"${formatName}" 형식의 유튜브 영상 업로드 전 체크리스트를 만들어주세요.

카테고리: ${category || "일반"}

${scriptInfo}

아래 카테고리별로 체크 항목을 만드세요:
1. 영상 제작 (촬영/편집 관련)
2. 썸네일 (디자인/텍스트)
3. 제목 & 설명 (SEO/키워드)
4. 태그 & 해시태그
5. 나레이션 & 오디오
6. 이미지/영상 소스
7. 업로드 설정 (공개/예약/연령)
8. 커뮤니티 (알림/소통)
9. 최종 점검

반드시 아래 JSON 형식으로만 응답하세요:
{
  "items": [
    {
      "category": "카테고리명",
      "task": "체크할 항목",
      "done": true 또는 false,
      "tip": "실용적인 팁 (done이 true면 '✅ AI 콘텐츠 팩토리에서 자동 완료됨' 추가)"
    }
  ]
}

총 20~25개 항목을 만드세요. 위의 대본 정보를 분석하여 이미 준비된 항목은 반드시 done: true로 설정하세요.`;

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
    const message = error instanceof Error ? error.message : "체크리스트 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
