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
} from "antd";
import { TinyColor } from "@ctrl/tinycolor";
import { ReactNode } from "react";
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
  const handleClick = () =>
    dispatch(placeOrder({ entrySize: available, type }));
  return (
    <Col span={12}>
      <Row gutter={[0, 12]}>
        <Col span={24}>
          <p>Available: {formatUSD(available)}</p>
          <InputNumber
            addonBefore="Price"
            value={formatPrice(price)}
            disabled
          />
        </Col>
        <Col span={24}>
          <InputNumber
            addonBefore="Total"
            value={available}
            precision={2}
            disabled
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
      <Row gutter={[24, 0]}>
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
