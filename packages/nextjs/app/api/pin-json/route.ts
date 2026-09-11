export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const PINATA_JWT = process.env.PINATA_JWT;
  if (!PINATA_JWT) return NextResponse.json({ error: "Missing PINATA_JWT" }, { status: 500 });

  const json = await req.json();

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name: `certchain-${Date.now()}` },
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });

  return NextResponse.json({ cid: data.IpfsHash });
}