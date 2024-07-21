import { createSlice } from "@reduxjs/toolkit";
import type { CandlesChartType } from "@/components/ChartComponent";

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
  isPaused: boolean;
  currentPrice: number;
  leverage: number;
  openOrders: OrderType[];
  isLiquidated: boolean;
  lastCandle: CandlesChartType | null;
  lastCandleIdx: number;
  simSpeed: number;
  error: string | null;
}

interface GlobalStateType {
  simulation: SimulationType;
}

export const simulationInitial: SimulationType = {
  currentBalance: 100,
  currentTimeMs: 0,
  initialTimeMs: 0,
  isPaused: true,
  currentPrice: 0,
  leverage: 10,
  openOrders: [],
  isLiquidated: false,
  lastCandle: null,
  lastCandleIdx: 0,
  simSpeed: 180,
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
    setTimeMs: (state, { payload }) => {
      state.currentTimeMs = payload;
    },
    setInitialTimeMs: (state, { payload }) => {
      state.initialTimeMs = payload;
    },
    setPaused: (state, { payload }) => {
      state.isPaused = payload;
    },
    setLeverage: (state, { payload }) => {
      state.leverage = payload;
    },
    placeOrder: (state, { payload }) => {
      if (
        state.currentBalance > 0 &&
        payload.entrySize > 0 &&
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
    setLastCandle: (state, { payload }) => {
      state.lastCandle = payload;
      state.lastCandleIdx++;
    },
    setSimSpeed: (state, { payload }) => {
      state.simSpeed = payload;
    },
    resetBalance: (state) => {
      state.currentBalance = 100;
      state.openOrders = [];
      state.isLiquidated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => simulationInitial,
  },
});

export const {
  setPrice,
  setTimeMs,
  setInitialTimeMs,
  setPaused,
  setLeverage,
  setLastCandle,
  setSimSpeed,
  placeOrder,
  closeOrder,
  resetBalance,
  clearError,
  resetState,
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
export const selectPaused = ({ simulation }: GlobalStateType) =>
  simulation.isPaused;
export const selectBalance = ({ simulation }: GlobalStateType) =>
  simulation.currentBalance;
export const selectLeverage = ({ simulation }: GlobalStateType) =>
  simulation.leverage;
export const selectOpenOrders = ({ simulation }: GlobalStateType) =>
  simulation.openOrders;
export const selectLiquidated = ({ simulation }: GlobalStateType) =>
  simulation.isLiquidated;
export const selectLastCandle = ({ simulation }: GlobalStateType) =>
  simulation.lastCandle;
export const selectLastCandleIdx = ({ simulation }: GlobalStateType) =>
  simulation.lastCandleIdx;
export const selectSimSpeed = ({ simulation }: GlobalStateType) =>
  simulation.simSpeed;

export const selectEquity = ({ simulation }: GlobalStateType) =>
  simulation.openOrders.reduce(
    (r, a) => r + calculatePosSize(simulation.currentPrice, a),
    0
  ) + simulation.currentBalance;
export const selectLiquidationPrice = ({ simulation }: GlobalStateType) => {
  const { openOrders, currentPrice, currentBalance } = simulation;

  if (openOrders.length === 0) return null;

  let avgEntry = 0;
  let sumEntry = 0;
  let netLeverage = 0;
  for (const ord of openOrders) {
    avgEntry += ord.entryPrice * ord.entrySize;
    sumEntry += ord.entrySize;
    netLeverage += ord.leverage * orderSign[ord.type];
  }
  if (netLeverage === 0) return null;
  avgEntry /= sumEntry;
  const liqPrice = avgEntry / (1 + 1 / netLeverage);
  return liqPrice;
};

export default simulationSlice.reducer;
