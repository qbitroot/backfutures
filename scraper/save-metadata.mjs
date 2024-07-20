import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = "mongodb://127.0.0.1:27017/cryptoData";

const ohlcSchema = new mongoose.Schema(
  {
    open_time: { type: Date },
    close_time: { type: Date },
    open: String,
    high: String,
    low: String,
    close: String,
    volume: String,
    quote_asset_volume: String,
    number_of_trades: Number,
    taker_buy_base_asset_volume: String,
    taker_buy_quote_asset_volume: String,
    ticker: String,
  },
  { collection: "candles" }
);

const OhlcModel = mongoose.model("Ohlc", ohlcSchema);

const tickersSchema = new mongoose.Schema(
  {
    ticker: String,
    time_from: { type: Date },
    time_to: { type: Date },
    candle_count: Number,
  },
  { collection: "tickers" }
);

const TickerModel = mongoose.model("Ticker", tickersSchema);

async function processTicker(ticker) {
  const first = (
    await OhlcModel.findOne({ ticker: ticker }, null, {
      sort: "open_time",
    }).exec()
  ).open_time;
  const last = (
    await OhlcModel.findOne({ ticker: ticker }, null, {
      sort: "-open_time",
    }).exec()
  ).open_time;

  const count = await OhlcModel.countDocuments({ ticker: ticker }).exec();
  console.log(ticker, first, last, count);

  try {
    await TickerModel.create({
      ticker: ticker,
      time_from: first,
      time_to: last,
      candle_count: count,
    });
    console.log(`Successfully inserted data for ticker ${ticker}`);
  } catch (err) {
    console.error("Error", err);
  }
}

async function main() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const directoryPath = path.join(process.cwd(), "data");
  const files = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const ticker = path.basename(file, path.extname(file)).split("-")[0];
    console.log(`Processing ${ticker}`);
    await processTicker(ticker);
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => console.error(err));
