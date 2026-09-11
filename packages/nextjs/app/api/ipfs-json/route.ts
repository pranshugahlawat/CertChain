export const runtime = "nodejs";

import { NextResponse } from "next/server";

const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://dweb.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cidParam = searchParams.get("cid");
  if (!cidParam) return NextResponse.json({ error: "Missing cid" }, { status: 400 });

  const cid = cidParam.replace(/^ipfs:\/\//, "").trim();

  let lastErr: any = null;

  for (const gw of GATEWAYS) {
    try {
      const res = await fetch(gw + cid, { cache: "no-store" });
      const text = await res.text();

      try {
        const json = JSON.parse(text);
        return NextResponse.json(json);
      } catch {
        // Not JSON (maybe gateway returned HTML/error page or CID is a file)
        return NextResponse.json(
          { error: "NOT_JSON", preview: text.slice(0, 200), gateway: gw },
          { status: 422 },
        );
      }
    } catch (e) {
      lastErr = e;
    }
  }

  return NextResponse.json(
    { error: "FETCH_FAILED", detail: String(lastErr) },
    { status: 500 },
  );
}