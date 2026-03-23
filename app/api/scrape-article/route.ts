import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });

    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const $ = cheerio.load(response.data);

    let title = "";
    let content = "";

    if (url.includes("naver.com")) {
      title = $("#title_area").text().trim() || $(".media_end_head_headline").text().trim();
      content = $("#dic_area").text().trim() || $(".newsct_article").text().trim();
    } else {
      title = $("h1").first().text().trim() || $("title").text().trim();
      content = $("article").text().trim() || $("p").map((_, el) => $(el).text()).get().join("\n");
    }

    if (!title && !content) {
      title = $("title").text().trim();
      content = $("body").text().trim().substring(0, 5000);
    }

    return NextResponse.json({
      success: true,
      data: { title: title.substring(0, 200), content: content.substring(0, 5000), url },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "스크래핑 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
