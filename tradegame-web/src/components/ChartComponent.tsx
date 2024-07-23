import { useSelector } from "react-redux";
import {
  selectLiquidationPrice,
  selectOpenOrders,
  selectLastCandle,
  calculatePosPercent,
  selectPrice,
} from "@/redux/simulationReducer";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  LogicalRange,
  CandlestickData,
  Time,
  PriceFormat,
  PriceFormatCustom,
  SeriesMarker,
  UTCTimestamp,
} from "lightweight-charts";
import { formatPrice, formatUSD } from "@/lib/utils";

/*export interface CandlesChartType {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}*/
export type CandlesChartType = CandlestickData<UTCTimestamp>;

export function ChartComponent({
  data,
  fetchBackward,
  isWaiting,
  inViewCount,
}: {
  data: CandlesChartType[];
  fetchBackward: Function;
  isWaiting: boolean;
  inViewCount: number;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const openOrders = useSelector(selectOpenOrders);
  const liqPrice = useSelector(selectLiquidationPrice);
  const lastCandle = useSelector(selectLastCandle);

  const waitRef = useRef(isWaiting);
  useEffect(() => {
    waitRef.current = isWaiting;
  }, [isWaiting]);

  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) throw new Error();
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: Math.round(window.innerHeight / 2),
      localization: {
        priceFormatter: formatPrice,
      },
    });
    chartRef.current.timeScale().applyOptions({ timeVisible: true });
    //chartRef.current.timeScale().fitContent();
    /*chartRef.current.timeScale().setVisibleLogicalRange({
      from: 400 - inViewCount,
      to: 400,
    });*/

    const handleResize = () => {
      chartRef.current?.applyOptions({
        width: chartContainerRef.current?.clientWidth,
      });
    };

    seriesRef.current = chartRef.current.addCandlestickSeries();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chartRef.current?.remove();
    };
  }, [inViewCount]);
  useEffect(() => {
    if (!chartRef.current) return;
    const handler = async (logicalRange: LogicalRange | null) => {
      if (!logicalRange || !seriesRef.current || waitRef.current) return;
      const barsInfo = seriesRef.current.barsInLogicalRange(logicalRange);
      if (!barsInfo) return;
      if (
        seriesRef.current &&
        barsInfo.barsBefore < -10 &&
        !waitRef.current &&
        !isWaiting
      ) {
        //|| logicalRange.to > 250) {
        waitRef.current = true;
        const backData = (await fetchBackward()) || [];
        // if (backData.at(-1).time > seriesRef.current.data()[0].time)
        //   alert("BUG!!!");
        const newData = [...backData, ...seriesRef.current.data()];
        seriesRef.current.setData(newData);
        //await fetchBackward();
        /*seriesRef.current.setData([
          ...(await fetchBackward()),
          ...seriesRef.current.data(),
        ]);*/
        waitRef.current = false;
      }
    };
    chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(handler);
    return () => {
      chartRef.current
        ?.timeScale()
        .unsubscribeVisibleLogicalRangeChange(handler);
    };
  }, [fetchBackward, isWaiting]);

  useEffect(() => {
    if (seriesRef.current) seriesRef.current.setData(data);
  }, [data]);

  const currentPrice = useSelector(selectPrice);
  const priceLines = useRef<IPriceLine[]>([]);

  useEffect(() => {
    if (!seriesRef.current) return;
    for (const line of priceLines.current) {
      seriesRef.current!.removePriceLine(line);
    }
    const newPriceLines = openOrders.map((ord) =>
      seriesRef.current!.createPriceLine({
        price: ord.entryPrice,
        title: ord.type,
        color:
          calculatePosPercent(currentPrice, ord) > 1 ? "#26A69A" : "#EF5350",
      })
    );
    if (liqPrice) {
      newPriceLines.push(
        seriesRef.current!.createPriceLine({
          price: liqPrice,
          title: "LIQUIDATION",
          color: "#ff0000",
        })
      );
    }
    priceLines.current = newPriceLines;
  }, [openOrders, liqPrice, currentPrice]);
  useEffect(() => {
    if (seriesRef.current && lastCandle) {
      seriesRef.current.update({ ...lastCandle });
    }
  }, [lastCandle]);

  return <div ref={chartContainerRef} />;
}
