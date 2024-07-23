import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { ticker: string } }) {
  const pair = params.ticker.replace("USDT", "/USDT");
  return {
    title: pair,
    description: `Trade ${pair} perpetual futures on historical data with no risk.`,
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
