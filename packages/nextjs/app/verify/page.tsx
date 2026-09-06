"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { QRCodeCanvas } from "qrcode.react";
import { Address } from "@scaffold-ui/components";
import { useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

function ipfsToHttp(cidOrUri: string) {
  if (!cidOrUri) return "";
  if (cidOrUri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${cidOrUri.replace("ipfs://", "")}`;
  return `https://ipfs.io/ipfs/${cidOrUri}`;
}

// cast the hook itself (fixes "parameter of type never")
const useReadAny = useScaffoldReadContract as any;

function CertRow({ tokenId }: { tokenId: bigint }) {
  const { targetNetwork } = useTargetNetwork();

  const { data: cert } = useReadAny({
    contractName: "SoulboundCert",
    functionName: "certificate",
    args: [tokenId],
  });

  const issuer = cert?.issuer as `0x${string}` | undefined;
  const ipfsCid = cert?.ipfsCid as string | undefined;
  const revoked = cert?.revoked as boolean | undefined;

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/verify?tokenId=${tokenId.toString()}`;
  }, [tokenId]);

  return (
    <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-bold">Token #{tokenId.toString()}</div>
        <div className={revoked ? "text-error font-bold" : "text-success font-bold"}>{revoked ? "REVOKED" : "VALID"}</div>
      </div>

      <div className="text-sm">
        <div className="opacity-70">Issuer</div>
        <Address address={issuer} chain={targetNetwork} />
      </div>

      {ipfsCid ? (
        <a className="link text-sm break-all" href={ipfsToHttp(ipfsCid)} target="_blank" rel="noreferrer">
          {ipfsCid}
        </a>
      ) : (
        <div className="text-sm opacity-70">No CID</div>
      )}

      <div className="pt-2">
        <QRCodeCanvas value={verifyUrl || "http://localhost:3000"} size={120} />
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const searchParams = useSearchParams();

  const [wallet, setWallet] = useState("");
  const [tokenIdInput, setTokenIdInput] = useState("");

  useEffect(() => {
    const tid = searchParams.get("tokenId");
    if (tid) setTokenIdInput(tid);
  }, [searchParams]);

  const walletOk = useMemo(() => isAddress(wallet), [wallet]);

  const tokenId = useMemo(() => {
    try {
      return tokenIdInput ? BigInt(tokenIdInput) : null;
    } catch {
      return null;
    }
  }, [tokenIdInput]);

  const { data: tokenIds } = useReadAny({
    contractName: "SoulboundCert",
    functionName: "certificatesOf",
    args: walletOk ? [wallet] : undefined,
  });

  const ids = (tokenIds as bigint[] | undefined) ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">Verify</div>
        <Link className="link" href="/issuer">
          Issuer →
        </Link>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-xl p-4">
        <div className="font-semibold mb-2">By Token ID</div>
        <input className="input input-bordered w-full" placeholder="1" value={tokenIdInput} onChange={e => setTokenIdInput(e.target.value)} />
        {tokenId !== null ? (
          <div className="mt-3">
            <CertRow tokenId={tokenId} />
          </div>
        ) : null}
      </div>

      <div className="bg-base-100 border border-base-300 rounded-xl p-4">
        <div className="font-semibold mb-2">By Wallet</div>
        <input className="input input-bordered w-full" placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} />
        <div className="mt-4 grid grid-cols-1 gap-3">
          {walletOk && ids.length === 0 ? <div className="opacity-70 text-sm">No certificates found.</div> : null}
          {ids.map(id => (
            <CertRow key={id.toString()} tokenId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}