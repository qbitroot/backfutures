import dbConnect from "@/lib/dbConnect";
import Candle from "@/models/Candle";

const getInt = (sp: URLSearchParams, key: string) =>
  parseInt(sp.get(key) || "");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const startTime = getInt(searchParams, "startTime");
  const endTime = getInt(searchParams, "endTime");
  const count = getInt(searchParams, "count");
  const ticker = searchParams.get("ticker");

  if (!(endTime || startTime) || !ticker || !count)
    return Response.json([], { status: 400 });

  await dbConnect();
  let query = Candle.find({ ticker: ticker })
    .select("open_time open high low close -_id")
    .where("open_time");
  query = endTime
    ? query.sort({ open_time: -1 }).lt(endTime)
    : query.sort({ open_time: 1 }).gt(startTime);
  //query = endTime ? query.lt(endTime) : query.gt(startTime);
  query = query.limit(Math.min(count, 1000));
  const candles = await query.exec();

  return Response.json(candles);
}
