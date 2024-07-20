import mongoose from "mongoose";

export interface Tickers extends mongoose.Document {
  ticker: string;
  time_from: Date;
  time_to: Date;
  candle_count: number;
}

const TickersSchema = new mongoose.Schema<Tickers>(
  {
    ticker: String,
    time_from: { type: Date },
    time_to: { type: Date },
    candle_count: Number,
  },
  { collection: "tickers" }
);

export default mongoose.models.Ticker ||
  mongoose.model<Tickers>("Ticker", TickersSchema);
