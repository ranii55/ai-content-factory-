import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, platform, quality = '720p', format = 'mp4' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL을 입력해 주세요.' }, { status: 400 });
    }

    // 플랫폼 자동 감지
    let detectedPlatform = platform || 'unknown';
    if (!platform) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) detectedPlatform = 'youtube';
      else if (url.includes('tiktok.com')) detectedPlatform = 'tiktok';
      else if (url.includes('instagram.com')) detectedPlatform = 'instagram';
    }

    if (detectedPlatform === 'youtube') {
      // YouTube 영상 ID 추출
      let videoId = '';
      const patterns = [
        /[?&]v=([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /shorts\/([a-zA-Z0-9_-]{11})/
      ];
      for (const p of patterns) {
        const m = url.match(p);
        if (m) { videoId = m[1]; break; }
      }
      if (!videoId) {
        return NextResponse.json({ error: '유효한 YouTube URL이 아닙니다.' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        platform: 'youtube',
        videoId,
        message: 'YouTube 다운로드 링크 생성',
        downloadOptions: [
          { quality: '1080p', format: 'mp4', url: `https://www.y2mate.com/youtube/${videoId}` },
          { quality: '720p', format: 'mp4', url: `https://www.y2mate.com/youtube/${videoId}` },
          { quality: '360p', format: 'mp4', url: `https://www.y2mate.com/youtube/${videoId}` },
          { quality: 'audio', format: 'mp3', url: `https://www.y2mate.com/youtube/${videoId}` }
        ],
        guide: '위 링크를 클릭하면 외부 다운로드 사이트로 이동합니다.',
        alternativeTools: ['yt-dlp (로컬 설치)', 'cobalt.tools', '4K Video Downloader']
      });
    }

    if (detectedPlatform === 'tiktok') {
      return NextResponse.json({
        success: true,
        platform: 'tiktok',
        message: 'TikTok 다운로드 (워터마크 제거)',
        downloadOptions: [
          { quality: 'HD', format: 'mp4', watermark: false, url: `https://snaptik.app/ko2` },
          { quality: 'HD', format: 'mp4', watermark: true, url: `https://snaptik.app/ko2` }
        ],
        guide: '1) 위 링크 클릭 → 2) TikTok URL 붙여넣기 → 3) 다운로드',
        alternativeTools: ['SnapTik', 'SSSTik', 'DDTik']
      });
    }

    if (detectedPlatform === 'instagram') {
      return NextResponse.json({
        success: true,
        platform: 'instagram',
        message: 'Instagram Reels 다운로드',
        downloadOptions: [
          { quality: 'HD', format: 'mp4', url: 'https://snapinsta.app/ko' }
        ],
        guide: '1) 위 링크 클릭 → 2) Instagram URL 붙여넣기 → 3) 다운로드',
        alternativeTools: ['SnapInsta', 'SaveInsta', 'iGram']
      });
    }

    return NextResponse.json({ error: '지원하지 않는 플랫폼입니다.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '다운로드 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
