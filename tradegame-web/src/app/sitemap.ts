import { MetadataRoute } from "next";
import { getFullURL, fetchTickers } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tickers = await fetchTickers();
  const tickersSitemap = Object.keys(tickers).map((t) => ({
    url: getFullURL("/trade/" + t).toString(),
  }));
  return [
    { url: process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://backfutures.com" },
    ...tickersSitemap,
  ];
}
