import mongoose from "mongoose";

export interface Candles extends mongoose.Document {
  ticker: string;
  open_time: Date;
  close_time: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  quote_asset_volume: string;
  number_of_trades: number;
  taker_buy_base_asset_volume: string;
  taker_buy_quote_asset_volume: string;
}

const CandleSchema = new mongoose.Schema<Candles>(
  {
    ticker: String,
    open_time: Date,
    close_time: Date,
    open: String,
    high: String,
    low: String,
    close: String,
    volume: String,
    quote_asset_volume: String,
    number_of_trades: Number,
    taker_buy_base_asset_volume: String,
    taker_buy_quote_asset_volume: String,
  },
  { collection: "candles" }
);

export default mongoose.models.Candle ||
  mongoose.model<Candles>("Candle", CandleSchema);
