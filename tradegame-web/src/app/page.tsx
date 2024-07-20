import { fetchTickers, TickersApiType } from "@/lib/utils";
import { Row, Col, Card, Button, SelectProps, Layout } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";

const { Header, Footer, Sider, Content } = Layout;

export default async function Home() {
  const tickersInfo = await fetchTickers();

  const cards = Object.keys(tickersInfo).map((k) => {
    const ticker = k.replace("USDT", "/USDT");
    const days = Math.round(
      (tickersInfo[k].time_to.getTime() - tickersInfo[k].time_from.getTime()) /
        86_400_000
    );
    return (
      <Link href={"/trade/" + k} key={k} className="block mb-4">
        <Card title={ticker} hoverable>
          <p>{days} days of data.</p>
          <p>From: {tickersInfo[k].time_from.toString()}</p>
          <p>To: {tickersInfo[k].time_to.toString()}</p>
        </Card>
      </Link>
    );
  });

  return (
    <>
      <main className="mb-36">
        <div className="my-12 text-center">
          <h1 className="text-4xl mb-1">Crypto Trading Simulator</h1>
          <i className="text-gray-500">
            &quot;Lose fake money before losing real money&quot;
          </i>
        </div>
        <div className="m-auto text-center max-w-2xl mb-10">
          <p className="text-xl">
            Train your skills on{" "}
            <u>
              <b>historical</b> market data
            </u>{" "}
            with up to 125x leverage!
          </p>
        </div>
        <div className="m-auto max-w-xl">
          <p>Choose a trading pair</p>
          {cards}
        </div>
      </main>
    </>
  );
}
