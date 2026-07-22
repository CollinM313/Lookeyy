import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.IDX_BROKER_API_KEY;
  if (!key) return NextResponse.json({ error: "IDX_BROKER_API_KEY not set" });

  const results: Record<string, unknown> = { keyLength: key.length };

  // Test 1: featured endpoint (known working)
  try {
    const r = await fetch("https://api.idxbroker.com/clients/featured", {
      headers: { accesskey: key, outputtype: "json" },
      cache: "no-store",
    });
    const d = await r.json();
    results.featured = { status: r.status, total: d?.total ?? "no total" };
  } catch (e) { results.featured = String(e); }

  // Test 2: savedlinks list
  try {
    const r = await fetch("https://api.idxbroker.com/clients/savedlinks", {
      headers: { accesskey: key, outputtype: "json" },
      cache: "no-store",
    });
    const d = await r.json();
    results.savedlinks = { status: r.status, count: Array.isArray(d) ? d.length : d };
  } catch (e) { results.savedlinks = String(e); }

  // Test 3: savedlinks/497/results without pt=all
  try {
    const r = await fetch("https://api.idxbroker.com/clients/savedlinks/497/results", {
      headers: { accesskey: key, outputtype: "json" },
      cache: "no-store",
    });
    const d = await r.json();
    results.results_no_params = { status: r.status, isArray: Array.isArray(d), count: Array.isArray(d) ? d.length : d };
  } catch (e) { results.results_no_params = String(e); }

  // Test 4: savedlinks/497/results with pt=all
  try {
    const r = await fetch("https://api.idxbroker.com/clients/savedlinks/497/results?count=5&pt=all", {
      headers: { accesskey: key, outputtype: "json" },
      cache: "no-store",
    });
    const d = await r.json();
    results.results_pt_all = { status: r.status, isArray: Array.isArray(d), count: Array.isArray(d) ? d.length : d };
  } catch (e) { results.results_pt_all = String(e); }

  // Test 5: with User-Agent header
  try {
    const r = await fetch("https://api.idxbroker.com/clients/savedlinks/497/results?count=5&pt=all", {
      headers: { accesskey: key, outputtype: "json", "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    const d = await r.json();
    results.results_with_ua = { status: r.status, isArray: Array.isArray(d), count: Array.isArray(d) ? d.length : d };
  } catch (e) { results.results_with_ua = String(e); }

  return NextResponse.json(results);
}
