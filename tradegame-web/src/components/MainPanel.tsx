import { useDispatch, useSelector } from "react-redux";
import {
  setLeverage,
  selectPrice,
  selectBalance,
  selectLeverage,
  selectEquity,
  selectLiquidated,
} from "@/redux/simulationReducer";

import { formatUSD } from "@/lib/utils";

import { Row, Col, InputNumber, Slider } from "antd";
import OrderTabs from "@/components/OrderTabs";
import { Dispatch, SetStateAction } from "react";

export default function MainPanel() {
  const dispatch = useDispatch();
  const currentPrice = useSelector(selectPrice);
  const currentBalance = useSelector(selectBalance);
  const currentEquity = useSelector(selectEquity);
  const leverage = useSelector(selectLeverage);
  const isLiquidated = useSelector(selectLiquidated);
  return (
    <>
      <Row gutter={[26, 0]}>
        <Col span={24}>
          <p className="text-xl">
            {!isLiquidated ? (
              <>
                <b>Available/Equity USDT: </b>
                <span>{formatUSD(currentBalance)}</span>
                <span className="text-base text-gray-400"> / </span>
                <span>{formatUSD(currentEquity)}</span>
              </>
            ) : (
              <p className="text-red-500">LIQUIDATED</p>
            )}
          </p>
        </Col>
      </Row>
      <hr className="my-4" />
      <Row gutter={[26, 0]}>
        <Col span={24}>
          <p>Leverage (Cross)</p>
        </Col>
        <Col flex="auto">
          <Slider
            min={1}
            max={125}
            value={leverage || 0}
            onChange={(val) => dispatch(setLeverage(val))}
            marks={[1, 25, 50, 75, 100, 125].reduce((a, r) => {
              a[r] = `${r}x`;
              return a;
            }, {} as { [key: number]: string })}
          />
        </Col>
        <Col flex="none">
          <InputNumber
            min={1}
            max={125}
            value={leverage}
            suffix="x"
            onChange={(val) => dispatch(setLeverage(val))}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <OrderTabs />
        </Col>
      </Row>
    </>
  );
}
