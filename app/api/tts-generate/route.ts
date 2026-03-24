import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'Kore', speed = 1.0, engine = 'gemini', apiKey, aiProvider } = body;
    const provider = engine || aiProvider || 'gemini';

    if (!text) {
      return NextResponse.json({ error: '텍스트를 입력해 주세요.' }, { status: 400 });
    }

    /* ── Google AI Studio (Gemini) TTS ── */
    if (provider === 'gemini' && apiKey) {
      const voiceMap: Record<string, string> = {
        'ko-female-1': 'Kore',
        'ko-female-2': 'Leda',
        'ko-male-1': 'Puck',
        'ko-male-2': 'Charon',
        'ko-narrator': 'Kore',
        'en-female': 'Zephyr',
        'en-male': 'Orion',
      };
      const selectedVoice = voiceMap[voice] || voice || 'Kore';

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: text.slice(0, 5000) }] }],
            generationConfig: {
              response_modalities: ['AUDIO'],
              speech_config: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice }
                }
              }
            }
          })
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || `Gemini TTS 실패 (${res.status})`);
      }

      const data = await res.json();
      const audioPart = data?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.mimeType?.startsWith('audio/')
      );

      if (audioPart?.inlineData?.data) {
        return NextResponse.json({
          success: true,
          provider: 'gemini',
          voice: selectedVoice,
          speed,
          textLength: text.length,
          audioBase64: audioPart.inlineData.data,
          audioFormat: audioPart.inlineData.mimeType?.includes('wav') ? 'wav' : 'mp3',
          mimeType: audioPart.inlineData.mimeType || 'audio/wav',
        });
      }
      throw new Error('Gemini TTS 응답에 오디오 데이터가 없습니다.');
    }

    /* ── OpenAI TTS ── */
    if (provider === 'openai' && apiKey) {
      const voiceMap: Record<string, string> = {
        'ko-female-1': 'nova',
        'ko-female-2': 'shimmer',
        'ko-male-1': 'onyx',
        'ko-male-2': 'echo',
        'ko-alloy': 'alloy',
        'ko-fable': 'fable',
        'ko-narrator': 'fable',
      };
      const selectedVoice = voiceMap[voice] || voice || 'nova';

      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.slice(0, 4096),
          voice: selectedVoice,
          speed,
          response_format: 'mp3',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'OpenAI TTS 실패');
      }

      const buf = await res.arrayBuffer();
      return NextResponse.json({
        success: true,
        provider: 'openai',
        voice: selectedVoice,
        speed,
        textLength: text.length,
        audioBase64: Buffer.from(buf).toString('base64'),
        audioFormat: 'mp3',
        mimeType: 'audio/mpeg',
      });
    }

    /* ── API 키 없음: 브라우저 TTS 안내 ── */
    return NextResponse.json({
      success: true,
      provider: 'browser',
      text,
      voice,
      speed,
      textLength: text.length,
      message: 'API 키가 없어 브라우저 내장 TTS를 사용합니다.',
      availableVoices: [
        { id: 'Kore', name: '여성 (Kore)', provider: 'gemini' },
        { id: 'Puck', name: '남성 (Puck)', provider: 'gemini' },
        { id: 'Charon', name: '남성 (Charon)', provider: 'gemini' },
        { id: 'Leda', name: '여성 (Leda)', provider: 'gemini' },
        { id: 'nova', name: '여성 (Nova)', provider: 'openai' },
        { id: 'onyx', name: '남성 (Onyx)', provider: 'openai' },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'TTS 생성 중 오류' },
      { status: 500 }
    );
  }
}
