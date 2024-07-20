import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = "mongodb://192.168.121.177:27017/cryptoData";

const getModel = (collectionName) => {
  const ohlcSchema = new mongoose.Schema({
    unix_ms: { type: Number, unique: true },
    open: String,
    high: String,
    low: String,
    close: String,
    volume: String,
    close_time: Number,
    quote_asset_volume: String,
    number_of_trades: Number,
    taker_buy_base_asset_volume: String,
    taker_buy_quote_asset_volume: String,
  });

  return mongoose.model(collectionName, ohlcSchema, collectionName);
};

// Function to process and insert data from a JSON file
async function processFile(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  const ohlcData = JSON.parse(data);

  const transformedData = ohlcData.map((item) => ({
    unix_ms: item[0],
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4],
    volume: item[5],
    close_time: item[6],
    quote_asset_volume: item[7],
    number_of_trades: item[8],
    taker_buy_base_asset_volume: item[9],
    taker_buy_quote_asset_volume: item[10],
  }));

  const fileName = path.basename(filePath, path.extname(filePath));
  const collectionName = fileName.split("-")[0]; // Extract ticker name from file name
  const OhlcModel = getModel(collectionName);

  try {
    await OhlcModel.insertMany(transformedData, { ordered: false });
    console.log(
      `Successfully inserted data from ${fileName} into collection ${collectionName}`
    );
  } catch (err) {
    console.error(`Error inserting data from ${fileName}:`, err);
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
    await processFile(filePath);
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => console.error(err));
