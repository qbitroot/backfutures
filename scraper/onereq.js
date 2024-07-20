fetch(
  "https://www.binance.com/api/v3/uiKlines?endTime=1720446127000&limit=1000&symbol=BTCUSDT&interval=15m"
)
  .then((r) => r.json())
  .then((j) => {
    console.log(j.at(-1));
  })
  .catch(console.error);
