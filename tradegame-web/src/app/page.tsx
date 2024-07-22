import Link from "next/link";
import { fetchTickers, TickersApiType } from "@/lib/utils";
import { Row, Col, Card, Button, SelectProps, Layout } from "antd";
import { SocialIcon } from "react-social-icons";
import CryptoIcon from "@/components/CryptoIcon";
import FakeChart from "@/components/FakeChart";

const { Header, Footer, Sider, Content } = Layout;

export default async function Home() {
  const tickersInfo = await fetchTickers();

  const cards = Object.keys(tickersInfo).map((k) => {
    const ticker = (
      <>
        <p>{k.replace("USDT", "/USDT")}</p>
      </>
    );
    const days = Math.round(
      (tickersInfo[k].time_to.getTime() - tickersInfo[k].time_from.getTime()) /
        86_400_000
    );
    return (
      <Col xs={24} md={12} lg={8} key={k}>
        <Link href={"/trade/" + k} prefetch={true} className="block mb-4">
          <Card
            title={ticker}
            hoverable
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CryptoIcon
              ticker={k.replace("USDT", "")}
              size={64}
              className="float-right"
            />
            <p>{days} days of data.</p>
            <p>From: {tickersInfo[k].time_from.toUTCString()}</p>
            <p>To: {tickersInfo[k].time_to.toUTCString()}</p>
          </Card>
        </Link>
      </Col>
    );
  });

  return (
    <>
      <FakeChart className="w-full h-[30vh] fixed opacity-15 -z-50" />
      <main
        className="pb-24 min-h-screen"
        style={{
          background: "radial-gradient(circle, transparent, silver) fixed",
        }}
      >
        <div className="py-12 text-center">
          <h1 className="text-4xl mb-1">Crypto Trading Simulator</h1>
          <i className="text-gray-500">
            &quot;97% of traders lose. Get in 3%&quot;
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
        <div className="m-auto max-w-7xl">
          <p>Choose a trading pair</p>
          <Row gutter={12}>{cards}</Row>
        </div>
        <div className="m-auto flex gap-4 w-fit my-12 grayscale">
          <SocialIcon target="_blank" url="https://youtube.com/@Virbox" />
          <SocialIcon target="_blank" url="https://x.com/qbitroot" />
          <SocialIcon
            target="_blank"
            url="https://github.com/qbitroot/backfutures"
          />
        </div>
        <p className="text-center">hello@backfutures.com</p>
      </main>
    </>
  );
}
