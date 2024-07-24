import Link from "next/link";
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
        <Col sm={12} lg={7} xl={6}>
          <Link href="/">
            <Button type="link">Home</Button>
          </Link>
          <span className="text-xl ml-4">
            <CryptoIcon
              ticker={ticker.replace("USDT", "")}
              className="inline-block"
            />
            {" " + ticker.replace("USDT", "/USDT")}
          </span>
        </Col>
        <Col sm={12} lg={5} xl={3}>
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
        <Col sm={12} lg={9} xl={6}>
          <div className="flex">
            <p className="font-bold inline w-full">
              Time spent: {timeSpentMinutes} minutes
            </p>
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
          </div>
        </Col>
        <Col sm={12} lg={3} xl={3}>
          <Button
            onClick={() => dispatch(setPaused(!isPaused))}
            type="primary"
            className="w-full"
          >
            {isPaused ? "START" : "STOP"}
          </Button>
        </Col>
      </Row>
    </>
  );
}
