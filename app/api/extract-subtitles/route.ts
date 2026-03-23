import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, aiProvider, apiKey } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL을 입력해 주세요.' }, { status: 400 });
    }

    // YouTube 영상 ID 추출
    let videoId = '';
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) { videoId = m[1]; break; }
    }

    if (!videoId) {
      return NextResponse.json({ error: '유효한 YouTube URL이 아닙니다.' }, { status: 400 });
    }

    // YouTube 페이지에서 자막 추출 시도
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await pageRes.text();

    // 제목 추출
    const titleMatch = html.match(/"title":"(.*?)"/);
    const title = titleMatch ? titleMatch[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"') : '제목 없음';

    // 자막 트랙 찾기 (여러 패턴 시도)
    let subtitleText = '';
    let language = 'N/A';

    // 패턴 1: captionTracks
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionMatch) {
      try {
        const tracks = JSON.parse(captionMatch[1]);
        const koTrack = tracks.find((t: any) => t.languageCode === 'ko');
        const selectedTrack = koTrack || tracks[0];

        if (selectedTrack?.baseUrl) {
          language = selectedTrack.languageCode || 'unknown';
          const subRes = await fetch(selectedTrack.baseUrl);
          const subXml = await subRes.text();

          subtitleText = subXml
            .replace(/<[^>]+>/g, '\n')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .join(' ');
        }
      } catch (e) {}
    }

    // 패턴 2: playerCaptionsTracklistRenderer
    if (!subtitleText) {
      const rendererMatch = html.match(/"playerCaptionsTracklistRenderer":\s*\{.*?"captionTracks":\s*(\[.*?\])/s);
      if (rendererMatch) {
        try {
          const tracks = JSON.parse(rendererMatch[1]);
          const koTrack = tracks.find((t: any) => t.languageCode === 'ko');
          const selectedTrack = koTrack || tracks[0];

          if (selectedTrack?.baseUrl) {
            language = selectedTrack.languageCode || 'unknown';
            const cleanUrl = selectedTrack.baseUrl.replace(/\\u0026/g, '&');
            const subRes = await fetch(cleanUrl);
            const subXml = await subRes.text();

            subtitleText = subXml
              .replace(/<[^>]+>/g, '\n')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line.length > 0)
              .join(' ');
          }
        } catch (e) {}
      }
    }

    // 자막을 찾지 못한 경우
    if (!subtitleText) {
      return NextResponse.json({
        success: true,
        platform: 'youtube',
        videoId,
        title,
        text: '이 영상에서 자막을 자동으로 추출할 수 없습니다. YouTube가 서버 측 자막 접근을 제한하고 있을 수 있습니다.',
        language: 'N/A',
        characterCount: 0,
        tip: '대안: YouTube에서 직접 자막을 복사하세요. 영상 하단 ··· → 스크립트 열기 → 텍스트 복사'
      });
    }

    return NextResponse.json({
      success: true,
      platform: 'youtube',
      videoId,
      title,
      text: subtitleText,
      language,
      characterCount: subtitleText.length
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '자막 추출 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
