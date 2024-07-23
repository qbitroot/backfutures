import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: {
    default: "BackFutures - Trade on historical data",
    template: "%s - BackFutures",
  },
  openGraph: {
    title: "BackFutures trading simulator",
    description:
      "No signup needed. Go back in time, practice your crypto trading skills with up to 125x leverage.",
  },
  description:
    "Learn trading on real market data. No signup needed. Use up to 125x leverage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
