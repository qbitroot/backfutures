import fs from "fs/promises";

const API_URL = "https://www.binance.com/api/v3/uiKlines";
const SYMBOL = "PEPEUSDT";
const INTERVAL = "15m";
const END_TIME = 1720446127000;
const LIMIT = 1000;
const OUTPUT_FILE = `data/${SYMBOL}-${INTERVAL}.json`;

async function fetchData(endTime) {
  const url = `${API_URL}?endTime=${endTime}&limit=${LIMIT}&symbol=${SYMBOL}&interval=${INTERVAL}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function scrapeData() {
  let allData = [];
  let endTime = END_TIME;
  let keepFetching = true;

  while (keepFetching) {
    try {
      const data = await fetchData(endTime);

      if (data.length === 0) {
        keepFetching = false;
      } else {
        allData = data.concat(allData); // Prepend new data to the beginning
        endTime = data[0][0] - 1; // Update endTime to the timestamp of the first item in the current data batch
        console.log(
          `Fetched ${data.length} records, new endTime: ${endTime}, total: ${allData.length}`
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      keepFetching = false;
    }
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(allData, null, 2));
  console.log(`Saved ${allData.length} records to ${OUTPUT_FILE}`);
}

scrapeData();
