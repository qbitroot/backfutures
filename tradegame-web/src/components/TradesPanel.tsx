import { useDispatch, useSelector } from "react-redux";
import {
  calculatePosSize,
  calculatePosPercent,
  closeOrder,
  selectOpenOrders,
  selectPrice,
} from "@/redux/simulationReducer";
import { Button, Tabs, Table } from "antd";
import type { TableProps } from "antd";
import { formatPrice, formatUSD } from "@/lib/utils";

interface OpenPositionsType {
  key: string;
  type: "buy" | "sell";
  entryPrice: string;
  entrySize: string;
  PnL: {
    percent: number;
    position: number;
  };
  leverage: string;
}

const openOrdersColumns: TableProps<OpenPositionsType>["columns"] = [
  {
    title: "Side",
    dataIndex: "type",
    key: "type",
    render: (type: string) => {
      const classes = { buy: "text-green-800", sell: "text-red-800" } as {
        [key: string]: string;
      };
      return <p className={classes[type]}>{type.toUpperCase()}</p>;
    },
  },
  { title: "Leverage", dataIndex: "leverage", key: "leverage" },
  { title: "Size USDT", dataIndex: "entrySize", key: "entrySize" },
  { title: "Entry Price", dataIndex: "entryPrice", key: "entryPrice" },
  {
    title: "PnL",
    dataIndex: "PnL",
    key: "PnL",
    width: 400,
    render: ({ percent, position }) => {
      const sign = percent > 0 ? "+" : "";
      return (
        <span
          className={
            percent > 0 ? "text-green-800" : percent < 0 ? "text-red-800" : ""
          }
        >
          {sign}
          {formatUSD(position)} USDT ({sign}
          {formatUSD(percent * 100)}%)
        </span>
      );
    },
  },
  {
    title: <CloseAllPositionsButton />,
    dataIndex: "key",
    render: (key) => <ClosePositionButton orderKey={parseInt(key)} />,
    fixed: "right",
    width: 200,
  },
];

function CloseAllPositionsButton() {
  const openOrders = useSelector(selectOpenOrders);
  const dispatch = useDispatch();
  return (
    <Button
      onClick={() => {
        for (const ord of openOrders) {
          dispatch(closeOrder(ord));
        }
      }}
      danger
      disabled={openOrders.length == 0}
    >
      Close all
    </Button>
  );
}

function ClosePositionButton({ orderKey }: { orderKey: number }) {
  const dispatch = useDispatch();
  return (
    <Button onClick={() => dispatch(closeOrder(orderKey))} type="primary">
      Close
    </Button>
  );
}

function OpenPositions() {
  const openOrders = useSelector(selectOpenOrders);
  const price = useSelector(selectPrice);
  const table = [];
  for (const idx in openOrders) {
    const ord = openOrders[idx];
    table.push({
      ...ord,
      leverage: `${ord.leverage}x`,
      key: idx.toString(),
      PnL: {
        percent: calculatePosPercent(price, ord) - 1,
        position: calculatePosSize(price, ord) - ord.entrySize,
      },
      entryPrice: formatPrice(ord.entryPrice),
      entrySize: formatUSD(ord.entrySize) + " USDT",
    });
  }
  return (
    <Table
      columns={openOrdersColumns}
      dataSource={table}
      className="overflow-x-auto"
    />
  );
}

export default function TradesPanel() {
  return (
    <Tabs
      items={[
        { key: "open", label: "Open positions", children: <OpenPositions /> },
      ]}
      defaultActiveKey="open"
      type="card"
    />
  );
}
