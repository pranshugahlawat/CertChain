"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-base-200 rounded-xl p-6 flex flex-col gap-4">
          <div className="text-2xl font-bold text-center">CertChain</div>

          <Link href="/issuer" className="btn btn-primary w-full">
            Issuer
          </Link>

          <Link href="/verify" className="btn btn-secondary w-full">
            Verify
          </Link>
        </div>
      </div>
    </div>
  );
}