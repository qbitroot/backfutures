import { createSlice } from "@reduxjs/toolkit";

export interface OrderType {
  type: "buy" | "sell";
  entryPrice: number;
  entrySize: number;
  leverage: number;
}

export interface SimulationType {
  currentBalance: number;
  currentTimeMs: number;
  initialTimeMs: number;
  currentPrice: number;
  leverage: number;
  openOrders: OrderType[];
  isLiquidated: boolean;
  error: string | null;
}

interface GlobalStateType {
  simulation: SimulationType;
}

export const simulationInitial: SimulationType = {
  currentBalance: 100,
  currentTimeMs: 0,
  initialTimeMs: 0,
  currentPrice: 0,
  leverage: 10,
  openOrders: [],
  isLiquidated: false,
  error: null,
};

export const simulationSlice = createSlice({
  name: "simulation",
  initialState: simulationInitial,
  reducers: {
    setPrice: (state, { payload }) => {
      state.currentPrice = payload;
      if (selectEquity({ simulation: state }) <= 0) state.isLiquidated = true;
    },
    setTimeMs: (state, { payload }) => ({ ...state, currentTimeMs: payload }),
    setInitialTimeMs: (state, { payload }) => ({
      ...state,
      initialTimeMs: payload,
    }),
    setLeverage: (state, { payload }) => ({ ...state, leverage: payload }),
    placeOrder: (state, { payload }) => {
      if (
        state.currentBalance > 0 &&
        state.currentBalance >= payload.entrySize
      ) {
        state.currentBalance -= payload.entrySize;
        state.openOrders.push({
          ...payload,
          entryPrice: state.currentPrice,
          leverage: state.leverage,
        });
      } else {
        state.error = "Not enough available balance.";
        console.log(state.error);
      }
    },
    closeOrder: (state, { payload }) => {
      const [closed] = state.openOrders.splice(payload, 1);
      state.currentBalance +=
        Math.ceil(calculatePosSize(state.currentPrice, closed) * 100) / 100;
    },
    resetBalance: (state) => ({
      ...state,
      currentBalance: 100,
      openOrders: [],
      isLiquidated: false,
    }),
    clearError: (state, _) => ({ ...state, error: null }),
  },
});

export const {
  setPrice,
  setTimeMs,
  setInitialTimeMs,
  setLeverage,
  placeOrder,
  closeOrder,
  resetBalance,
  clearError,
} = simulationSlice.actions;

const orderSign = { buy: 1, sell: -1 };
export const calculatePosPercent = (currentPrice: number, order: OrderType) =>
  (currentPrice / order.entryPrice - 1) *
    order.leverage *
    orderSign[order.type] +
  1;
export const calculatePosSize = (currentPrice: number, order: OrderType) =>
  calculatePosPercent(currentPrice, order) * order.entrySize;

export const selectPrice = ({ simulation }: GlobalStateType) =>
  simulation.currentPrice;
export const selectTimeMs = ({ simulation }: GlobalStateType) =>
  simulation.currentTimeMs;
export const selectInitialTimeMs = ({ simulation }: GlobalStateType) =>
  simulation.initialTimeMs;
export const selectBalance = ({ simulation }: GlobalStateType) =>
  simulation.currentBalance;
export const selectLeverage = ({ simulation }: GlobalStateType) =>
  simulation.leverage;
export const selectOpenOrders = ({ simulation }: GlobalStateType) =>
  simulation.openOrders;
export const selectLiquidated = ({ simulation }: GlobalStateType) =>
  simulation.isLiquidated;

export const selectEquity = ({ simulation }: GlobalStateType) =>
  simulation.openOrders.reduce(
    (r, a) => r + calculatePosSize(simulation.currentPrice, a),
    0
  ) + simulation.currentBalance;
export const selectLiquidationPrice = ({ simulation }: GlobalStateType) => {
  let sumLiqPricesW = 0;
  let sumEntries = 0;
  for (const ord of simulation.openOrders) {
    sumLiqPricesW +=
      ord.entrySize *
      ord.entryPrice *
      (1 - (1 / ord.leverage) * orderSign[ord.type]);
    sumEntries += ord.entrySize;
  }
  const liqPrice = sumLiqPricesW / sumEntries;
  return liqPrice || null;
};

export default simulationSlice.reducer;
