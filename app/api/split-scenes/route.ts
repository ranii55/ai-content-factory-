import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { script, scriptText, imageStyle = 'realistic', aiProvider, apiKey } = await req.json();
    const text = script || scriptText;
    if (!text || !apiKey) return NextResponse.json({ error: '대본과 API 키가 필요합니다.' }, { status: 400 });
    const styles: Record<string,string> = { realistic:'사실적 사진,고해상도,영화적조명', character:'캐릭터 일러스트,3D렌더링', illustration:'디지털 일러스트,파스텔톤', animation:'2D 애니메이션,카툰풍', cinematic:'시네마틱,와이드앵글,극적조명' };
    const prompt = `스토리보드 전문가로서 대본을 장면별로 분할하고 이미지 프롬프트를 만드세요.\n\n대본:\n${text}\n\n스타일: ${styles[imageStyle]||styles.realistic}\n\n출력:\n## 🎬 장면 분할\n### 📊 전체구성 (챕터수,장면수,예상길이)\n\n각 장면마다:\n- 📝 대사/내레이션\n- ⏱️ 예상길이(초)\n- 🎨 이미지프롬프트(영문)\n- 🎵 BGM분위기\n- 📸 카메라워크(줌인/줌아웃/패닝/고정)\n\n마지막에 전체 장면을 표로 정리`;
    let result = '';
    if (aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 12000 } }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과 없음';
    } else if (aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 12000 }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data.choices?.[0]?.message?.content || '결과 없음';
    } else if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 12000, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      result = data.content?.[0]?.text || '결과 없음';
    }
    return NextResponse.json({ result });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
