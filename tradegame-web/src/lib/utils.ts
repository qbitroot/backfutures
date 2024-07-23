import { CandlesChartType } from "@/components/ChartComponent";
import { UTCTimestamp } from "lightweight-charts";

export interface TickersInfoType {
  [key: string]: TickersApiType;
}
export interface CandlesApiType {
  open_time: string;
  open: string;
  high: string;
  low: string;
  close: string;
}
export interface TickersApiType {
  ticker: string;
  time_from: Date;
  time_to: Date;
  candle_count: number;
}

export const getFullURL = (path: string) =>
  new URL(path, process.env.NEXT_PUBLIC_WEBSITE_URL);

export const formatUSD = (price: number) =>
  price.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

export const formatPrice = (price: number) => {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (price >= 10) {
    return price.toFixed(2);
  } else if (price >= 0.0001) {
    return price.toFixed(7);
  } else if (price === 0) {
    return "0";
  } else {
    return price.toExponential(3);
  }
};

export const randomRange = (from: number, to: number) =>
  Math.round((to - from) * Math.random() + from);
export const randomGaussian = (from: number, to: number) => {
  let rand = 0;

  for (let i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  rand /= 6;
  return from + rand * (to - from);
};

export function getRandomTimeMs(tickerInfo: TickersApiType) {
  return randomRange(
    tickerInfo.time_from.getTime() + 6 * 30 * 86_400_000,
    tickerInfo.time_to.getTime() -
      parseInt(process.env.timeDeltaDays || "60") * 86_400_000
  );
}

export const expandCandle = (c: CandlesChartType, expandFactor: number) => {
  const expanded = [];
  const highIdx = randomRange(0, expandFactor - 2);
  let lowIdx = 0;
  while (highIdx == lowIdx) lowIdx = randomRange(0, expandFactor - 2);

  let localHigh = c.open;
  let localLow = c.open;
  for (let i = 0; i < expandFactor - 1; i++) {
    let val = null;
    switch (i) {
      case highIdx:
        val = c.high;
        break;
      case lowIdx:
        val = c.low;
        break;
      default:
        val = randomGaussian(c.high, c.low);
    }
    localHigh = Math.max(localHigh, val);
    localLow = Math.min(localLow, val);
    expanded.push({ ...c, high: localHigh, low: localLow, close: val });
  }
  expanded.push(c);
  return expanded;
};
export const expandData = (data: CandlesChartType[], expandFactor: number) =>
  data.flatMap((c) => expandCandle(c, expandFactor));

export async function fetchTickers() {
  let response = null;
  let data: TickersApiType[] = [];
  try {
    response = await fetch(getFullURL("/api/tickers"));
    data = await response.json();
  } catch (e) {
    console.error(e);
  }

  const processedData: TickersInfoType = {};
  for (const d of data) {
    processedData[d.ticker] = {
      ...d,
      time_from: new Date(d.time_from),
      time_to: new Date(d.time_to),
    };
  }

  return processedData;
  //setCurrentTicker(data[0].ticker);
}

export async function fetchChartData(
  params: Partial<{
    ticker: string;
    endTime: number;
    startTime: number;
    count: number;
  }>
) {
  const endpoint = getFullURL("/api/candles");
  params.count = 200;
  endpoint.search = new URLSearchParams(
    Object.entries(params).reduce((obj, [k, v]: any) => {
      obj[k] = v.toString();
      return obj;
    }, {} as Record<string, string>)
  ).toString();
  let res = null;
  let data: CandlesApiType[] = [];
  try {
    res = await fetch(endpoint);
    data = await res.json();
  } catch (e) {
    console.error(e);
  }
  if (!data) data = [];
  const processedData: CandlesChartType[] = data.map(
    (candle: CandlesApiType) => ({
      time: (new Date(candle.open_time).getTime() / 1000) as UTCTimestamp,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
    })
  );
  if (params.endTime) return processedData.reverse();
  else return processedData;
}
