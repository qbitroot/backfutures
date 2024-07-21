import {
  selectPrice,
  selectBalance,
  placeOrder,
} from "@/redux/simulationReducer";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  InputNumber,
  Tabs,
  Button,
  ButtonProps,
  ConfigProvider,
  Slider,
  SliderSingleProps,
} from "antd";
import { TinyColor } from "@ctrl/tinycolor";
import { ReactNode, useState } from "react";
import { formatPrice, formatUSD } from "@/lib/utils";

function ColorButton({
  bgColor,
  children,
  ...props
}: { bgColor: string } & ButtonProps) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: bgColor,
            colorPrimaryHover: new TinyColor(bgColor).lighten(5).toString(),
            colorPrimaryActive: new TinyColor(bgColor).darken(5).toString(),
            lineWidth: 0,
          },
        },
      }}
    >
      <Button {...props}>{children}</Button>
    </ConfigProvider>
  );
}

function OrderPanel({ type, price }: { type: "buy" | "sell"; price: number }) {
  const dispatch = useDispatch();
  const available = useSelector(selectBalance);
  const OrderButton = {
    buy: BuyButton,
    sell: SellButton,
  }[type];

  const [posPercent, setPosPercent] = useState(available);

  const handleClick = () =>
    dispatch(placeOrder({ entrySize: (available * posPercent) / 100, type }));

  return (
    <Col span={12}>
      <Row gutter={[0, 12]}>
        <Col span={24}>
          <p>Available: {formatUSD(available)}</p>
          <InputNumber
            addonBefore="Price"
            suffix="USDT"
            value={formatPrice(price)}
            disabled
            className="w-full"
          />
        </Col>
        <Col span={24}>
          <InputNumber
            addonBefore="Total"
            suffix="USDT"
            value={(available * posPercent) / 100}
            min={0}
            max={available}
            onChange={(v) => setPosPercent((posPercent / available) * 100)}
            precision={2}
            className="w-full"
          />
        </Col>
        <Col span={24}>
          <Slider
            min={1}
            max={100}
            value={posPercent}
            onChange={(v) => setPosPercent(v)}
            marks={[1, 50, 100].reduce((r, a) => {
              r[a] = `${a}%`;
              return r;
            }, {} as { [key: number]: string })}
          />
        </Col>
        <Col span={24}>
          <OrderButton
            onClick={handleClick}
            disabled={price == 0 || available == 0}
          />
        </Col>
      </Row>
    </Col>
  );
}

function BuyButton({ children, ...props }: ButtonProps) {
  return (
    <ColorButton bgColor="#26a69a" type="primary" block {...props}>
      Buy / Long
    </ColorButton>
  );
}
function SellButton({ children, ...props }: ButtonProps) {
  return (
    <ColorButton bgColor="#ef5350" type="primary" block {...props}>
      Sell / Short
    </ColorButton>
  );
}

function MarketTab() {
  const currentPrice = useSelector(selectPrice);
  return (
    <>
      <Row gutter={[42, 0]}>
        <OrderPanel type="buy" price={currentPrice} />
        <OrderPanel type="sell" price={currentPrice} />
      </Row>
    </>
  );
}

export default function OrderTabs() {
  return (
    <Tabs
      items={[
        /*{
          key: "limit",
          label: "Limit",
          children: "Coming soon...",
        },*/
        {
          key: "market",
          label: "Market",
          children: <MarketTab />,
        },
        /*{
          key: "stoplimit",
          label: "Stop-limit",
          children: "Coming soon...",
        },*/
      ]}
      defaultActiveKey="market"
      type="card"
    />
  );
}
