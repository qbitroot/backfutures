import { useSelector } from "react-redux";
import {
  selectInitialTimeMs,
  selectPrice,
  selectTimeMs,
} from "@/redux/simulationReducer";
import { Row, Col, Flex, Button, Slider, Select } from "antd";
import { CandlesChartType } from "./ChartComponent";
import { Dispatch, SetStateAction } from "react";
import { formatPrice, formatUSD } from "@/lib/utils";

export default function TradesHeader({
  ticker,
  lastCandle,
  setPaused,
  isPaused,
  simSpeed,
  setSimSpeed,
}: {
  ticker: string;
  lastCandle: CandlesChartType | null;
  setPaused: Dispatch<SetStateAction<boolean>>;
  isPaused: boolean;
  simSpeed: number;
  setSimSpeed: Dispatch<SetStateAction<number>>;
}) {
  const initialTimeMs = useSelector(selectInitialTimeMs);
  const currentTimeMs = useSelector(selectTimeMs);
  const currentPrice = useSelector(selectPrice);

  const timeSpentMinutes = Math.round((currentTimeMs - initialTimeMs) / 60000);

  return (
    <>
      <Row className="items-center min-h-10">
        <Col span={3}>
          <p className="text-xl ml-4">{ticker.replace("USDT", "/USDT")}</p>
        </Col>
        <Col span={3}>
          <p
            className={
              "font-mono text-2xl " +
              (lastCandle
                ? lastCandle.close > lastCandle.open
                  ? "text-green-600"
                  : "text-red-600"
                : "")
            }
          >
            {formatPrice(currentPrice)}
          </p>
        </Col>
        <Col span={3}>
          <p className="font-bold">Time spent: {timeSpentMinutes} minutes</p>
        </Col>
        <Col span={8}>
          <Select
            options={[
              { value: 1, label: "realtime" },
              { value: 10, label: "10 s/s (10x)" },
              { value: 60, label: "1 min/s (60x)" },
              { value: 180, label: "3 min/s (180x)" },
              { value: 300, label: "5 min/s (300x)" },
              { value: 900, label: "15 min/s (900x)" },
            ]}
            value={simSpeed}
            onChange={setSimSpeed}
          />
          <Button onClick={() => setPaused((p) => !p)} type="primary">
            {isPaused ? "START" : "STOP"}
          </Button>
        </Col>
      </Row>
    </>
  );
}
