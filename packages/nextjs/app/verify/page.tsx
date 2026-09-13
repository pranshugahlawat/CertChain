import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export const dynamic = "force-dynamic"; // prevents static prerender issues

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading verifier…</div>}>
      <VerifyClient />
    </Suspense>
  );
}