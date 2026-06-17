import { NextResponse } from "next/server";

export async function GET() {
  const rssUrl = "https://feeds.bbci.co.uk/news/rss.xml";
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=3`;

  const res = await fetch(apiUrl, { next: { revalidate: 900 } });
  const data = await res.json();

  const articles = (data.items || []).slice(0, 3).map((item: { title: string; link: string; description: string; pubDate: string }) => ({
    title: item.title,
    link: item.link,
    description: item.description?.replace(/<[^>]+>/g, "").slice(0, 120) + "…",
    pubDate: item.pubDate,
  }));

  return NextResponse.json({ articles });
}
