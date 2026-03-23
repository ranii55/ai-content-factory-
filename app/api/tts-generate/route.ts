import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'ko-female-1', speed = 1.0, aiProvider = 'openai', apiKey } = body;

    if (!text) {
      return NextResponse.json({ error: '텍스트를 입력해 주세요.' }, { status: 400 });
    }

    // OpenAI TTS 사용
    if (aiProvider === 'openai' && apiKey) {
      const voiceMap: Record<string, string> = {
        'ko-female-1': 'nova',
        'ko-female-2': 'shimmer',
        'ko-male-1': 'onyx',
        'ko-male-2': 'echo',
        'ko-alloy': 'alloy',
        'ko-fable': 'fable'
      };

      const selectedVoice = voiceMap[voice] || 'nova';

      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.slice(0, 4096),
          voice: selectedVoice,
          speed: speed,
          response_format: 'mp3'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'OpenAI TTS 요청 실패');
      }

      const audioBuffer = await res.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      return NextResponse.json({
        success: true,
        provider: 'openai',
        voice: selectedVoice,
        speed,
        textLength: text.length,
        audioBase64: base64Audio,
        audioFormat: 'mp3',
        message: 'TTS 음성이 생성되었습니다. 아래 재생 버튼을 눌러 확인하세요.'
      });
    }

    // API 키가 없을 경우 Web Speech API 안내
    return NextResponse.json({
      success: true,
      provider: 'browser',
      text: text,
      voice,
      speed,
      textLength: text.length,
      message: 'OpenAI API 키가 없어 브라우저 내장 TTS를 사용합니다.',
      guide: '브라우저에서 직접 음성을 재생합니다. 다운로드는 OpenAI API 키 설정 후 가능합니다.',
      availableVoices: [
        { id: 'ko-female-1', name: '여성 1 (Nova)', provider: 'openai' },
        { id: 'ko-female-2', name: '여성 2 (Shimmer)', provider: 'openai' },
        { id: 'ko-male-1', name: '남성 1 (Onyx)', provider: 'openai' },
        { id: 'ko-male-2', name: '남성 2 (Echo)', provider: 'openai' },
        { id: 'ko-alloy', name: '중성 (Alloy)', provider: 'openai' },
        { id: 'ko-fable', name: '내레이션 (Fable)', provider: 'openai' }
      ]
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'TTS 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
