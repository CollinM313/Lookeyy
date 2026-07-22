import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.IDX_BROKER_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "IDX_BROKER_API_KEY not set" });
  }

  try {
    const res = await fetch(
      "https://api.idxbroker.com/clients/savedlinks/497/results?count=5&pt=all",
      { headers: { accesskey: key, outputtype: "json" } }
    );
    const status = res.status;
    const data = await res.json();
    return NextResponse.json({
      keyPresent: true,
      keyLength: key.length,
      apiStatus: status,
      count: Array.isArray(data) ? data.length : "not array",
      sample: Array.isArray(data) ? data[0]?.address : data,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
