import dbConnect from "@/lib/dbConnect";
import Ticker from "@/models/Ticker";

export async function GET(req: Request) {
  await dbConnect();

  return Response.json(
    await Ticker.find({}, { _id: 0, __v: 0 }).sort("-candle_count")
  );
}
