import { useDispatch, useSelector } from "react-redux";
import type { Dispatch, SetStateAction } from "react";
import {
  selectInitialTimeMs,
  selectLastCandle,
  selectPaused,
  selectPrice,
  selectSimSpeed,
  selectTimeMs,
  setPaused,
  setSimSpeed,
} from "@/redux/simulationReducer";
import { Row, Col, Flex, Button, Slider, Select } from "antd";
import { CandlesChartType } from "./ChartComponent";
import { formatPrice, formatUSD } from "@/lib/utils";
import CryptoIcon from "@/components/CryptoIcon";

export default function TradesHeader({ ticker }: { ticker: string }) {
  const dispatch = useDispatch();
  const initialTimeMs = useSelector(selectInitialTimeMs);
  const currentTimeMs = useSelector(selectTimeMs);
  const currentPrice = useSelector(selectPrice);
  const lastCandle = useSelector(selectLastCandle);
  const isPaused = useSelector(selectPaused);
  const simSpeed = useSelector(selectSimSpeed);

  const timeSpentMinutes = Math.round((currentTimeMs - initialTimeMs) / 60000);

  return (
    <>
      <Row gutter={[26, 0]} className="items-center min-h-10">
        <Col lg={4} xl={4}>
          <span className="text-xl ml-4">
            <CryptoIcon
              ticker={ticker.replace("USDT", "")}
              className="inline-block"
            />
            {" " + ticker.replace("USDT", "/USDT")}
          </span>
        </Col>
        <Col lg={6} xl={3}>
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
        <Col lg={6} xl={3}>
          <p className="font-bold">Time spent: {timeSpentMinutes} minutes</p>
        </Col>
        <Col lg={8} xl={8}>
          <Select
            options={[
              { value: 1, label: "realtime" },
              { value: 10, label: "10 s/s (10x)" },
              { value: 60, label: "1 min/s (60x)" },
              { value: 180, label: "3 min/s (180x)" },
              { value: 300, label: "5 min/s (300x)" },
              { value: 900, label: "15 min/s (900x)" },
              { value: 1800, label: "30 min/s (1800x)" },
            ]}
            value={simSpeed}
            onChange={(v) => dispatch(setSimSpeed(v))}
          />
          <Button onClick={() => dispatch(setPaused(!isPaused))} type="primary">
            {isPaused ? "START" : "STOP"}
          </Button>
        </Col>
      </Row>
    </>
  );
}
