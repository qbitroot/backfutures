"use client";
import { usePathname, useRouter } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setTimeMs,
  setInitialTimeMs,
  setPrice,
  selectTimeMs,
  selectInitialTimeMs,
  selectPaused,
  selectLiquidated,
  selectSimSpeed,
  selectLastCandle,
  selectLastCandleIdx,
  setPaused,
  setLastCandle,
  resetState,
} from "@/redux/simulationReducer";

import {
  fetchTickers,
  fetchChartData,
  getRandomTimeMs,
  TickersInfoType,
  expandData,
} from "@/lib/utils";

import { Row, Col, Button, Input, Card } from "antd";
import { ChartComponent, CandlesChartType } from "@/components/ChartComponent";
import MainPanel from "@/components/MainPanel";
import TradesPanel from "@/components/TradesPanel";
import LiquidationModal from "@/components/LiquidationModal";
import TradesHeader from "@/components/TradesHeader";
import { SocialIcon } from "react-social-icons";
import Link from "next/link";
//import { subscribeEmail } from "./actions";

const CANDLE_MIN = 15;
const CANDLES_INITIAL = 100;
const CANDLE_EXPANSION = 10;

export default function Trade({ params }: { params: { ticker: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [chartData, setChartData] = useState<CandlesChartType[]>([]);
  const [chartDataNew, setChartDataNew] = useState<CandlesChartType[]>([]);
  const [tickersData, setTickersData] = useState<TickersInfoType>({});
  const [isWaiting, setWaiting] = useState(false);
  const isPaused = useSelector(selectPaused);
  const lastCandle = useSelector(selectLastCandle);
  const lastCandleIdx = useSelector(selectLastCandleIdx);
  const simSpeed = useSelector(selectSimSpeed);
  const currentTimeMs = useSelector(selectTimeMs);
  const initialTimeMs = useSelector(selectInitialTimeMs);
  const isLiquidated = useSelector(selectLiquidated);

  const [timesFetchedMs, setTimesFetchedMs] = useState<{
    from: number;
    to: number;
  }>({ from: 0, to: 0 });

  useEffect(() => {
    (async () => {
      setTickersData(await fetchTickers());
    })();
  }, []);

  useEffect(() => {
    if (Object.keys(tickersData).length === 0 || !params.ticker) return;
    const initialFetch = async () => {
      console.log(navigator.userAgent);
      if (initialTimeMs != 0) return;
      if (!(params.ticker in tickersData)) {
        router.replace("/trade/BTCUSDT");
        return;
      }
      const newData = await fetchChartData({
        ticker: params.ticker,
        endTime: getRandomTimeMs(tickersData[params.ticker]),
      });
      const initData = newData.slice(0, CANDLES_INITIAL);
      const initDataLast = initData.at(-1);
      if (!initDataLast) {
        console.error("initData is empty");
        return;
      }
      setChartData(initData);
      setChartDataNew(
        expandData(newData.slice(CANDLES_INITIAL), CANDLE_EXPANSION)
      );
      const newTime = initDataLast.time * 1000;
      dispatch(setTimeMs(newTime));
      dispatch(setInitialTimeMs(newTime));
      setTimesFetchedMs({
        from: newData[0].time * 1000,
        to: newData.at(-1)!.time * 1000,
      });
      dispatch(setPrice(initDataLast.close));
    };
    initialFetch();
  }, [tickersData, initialTimeMs, params.ticker, dispatch, router]);

  useEffect(() => {
    if (lastCandle) {
      dispatch(setPrice(lastCandle.close));
    }
  }, [lastCandle, dispatch]);

  useEffect(() => {
    if (isLiquidated) {
      dispatch(setPaused(true));
    }
  }, [isLiquidated, dispatch]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused || isLiquidated || isWaiting || chartDataNew.length === 0)
        return;
      const timestep = async () => {
        const updCandle = chartDataNew[lastCandleIdx];
        if (!isWaiting && currentTimeMs > timesFetchedMs.to) {
          setWaiting(true);
          //clearInterval(interval);
          const newData = await fetchChartData({
            ticker: params.ticker,
            startTime: timesFetchedMs.to + 1,
          });
          const newDataLast = newData.at(-1);
          if (!newDataLast) {
            console.error("No new data");
            return;
          }
          const expandedData = expandData(newData, CANDLE_EXPANSION);
          setChartDataNew((oldData) => [...oldData, ...expandedData]);
          setTimesFetchedMs({
            ...timesFetchedMs,
            to: newDataLast.time * 1000,
          });
          setWaiting(false);
          //setChartData([...chartData, ...newData]);
        }
        const newTime = currentTimeMs + (CANDLE_MIN * 60000) / CANDLE_EXPANSION;
        dispatch(setTimeMs(newTime));
        dispatch(setLastCandle(updCandle));
      };
      timestep();
    }, (CANDLE_MIN * 60000) / simSpeed / CANDLE_EXPANSION);
    return () => clearInterval(interval);
  }, [
    lastCandleIdx,
    isPaused,
    isWaiting,
    isLiquidated,
    chartDataNew,
    initialTimeMs,
    currentTimeMs,
    timesFetchedMs,
    dispatch,
    params.ticker,
    simSpeed,
  ]);

  useEffect(() => {
    setWaiting(false);
    setChartDataNew([]);
    setChartData([]);
    dispatch(resetState());
  }, [pathname, dispatch]);

  async function fetchBackward() {
    //if (currentTimeMs - timesFetchedMs.from > 14 * 86_400_000) return;
    setWaiting(true);
    const newData = await fetchChartData({
      ticker: params.ticker,
      endTime: timesFetchedMs.from - 1,
    });
    //setChartData([...newData, ...chartData]);
    setWaiting(false);
    setTimesFetchedMs({ ...timesFetchedMs, from: newData[0].time * 1000 });
    return newData;
  }
  return (
    <main className="mb-24">
      <TradesHeader ticker={params.ticker} />
      <Row gutter={[32, 0]}>
        <Col flex="auto" lg={24} xl={18}>
          {chartData.length > 0 ? (
            <ChartComponent
              data={chartData}
              inViewCount={100}
              {...{ lastCandle, fetchBackward, isWaiting }}
            />
          ) : (
            <p className="text-center h-[50vh]">LOADING...</p>
          )}
        </Col>
        <Col lg={24} xl={6}>
          <MainPanel />
        </Col>
        <Col lg={24} xl={18}>
          <TradesPanel />
        </Col>
        <Col lg={24} xl={6}>
          <Link
            href="https://x.com/qbitroot"
            className="xcom-link"
            target="_blank"
          >
            Follow me on {"\u{1d54f}"}/Twitter
          </Link>
        </Col>
      </Row>
      <LiquidationModal isLiquidated={isLiquidated} />
    </main>
  );
}
