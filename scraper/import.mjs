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

// Function to process and insert data from a JSON file
async function processFile(filePath, ticker) {
  const data = fs.readFileSync(filePath, "utf8");
  const ohlcData = JSON.parse(data);

  const transformedData = ohlcData.map((item) => ({
    open_time: new Date(item[0]),
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4],
    volume: item[5],
    close_time: new Date(item[6]),
    quote_asset_volume: item[7],
    number_of_trades: item[8],
    taker_buy_base_asset_volume: item[9],
    taker_buy_quote_asset_volume: item[10],
    ticker: ticker,
  }));

  try {
    await OhlcModel.insertMany(transformedData, { ordered: false });
    console.log(`Successfully inserted data for ticker ${ticker}`);
  } catch (err) {
    console.error(`Error inserting data for ticker ${ticker}:`, err);
  }
}

// Main function to process all files in the data directory
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
    await processFile(filePath, ticker);
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => console.error(err));
