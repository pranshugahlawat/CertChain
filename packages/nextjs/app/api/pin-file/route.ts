export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const PINATA_JWT = process.env.PINATA_JWT;
  if (!PINATA_JWT) return NextResponse.json({ error: "Missing PINATA_JWT" }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const pinataForm = new FormData();
  pinataForm.append("file", file, file.name);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: pinataForm,
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });

  return NextResponse.json({
    cid: data.IpfsHash, // bafy...
    name: file.name,
    mime: file.type,
    size: file.size,
  });
}