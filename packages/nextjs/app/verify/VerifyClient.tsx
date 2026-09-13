"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { QRCodeCanvas } from "qrcode.react";
import { Address } from "@scaffold-ui/components";
import { useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

// cast the hook itself (fixes "parameter of type never")
const useReadAny = useScaffoldReadContract as any;

const FILE_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

function ipfsToHttp(cidOrUri: string) {
  if (!cidOrUri) return "";
  const cid = cidOrUri.startsWith("ipfs://") ? cidOrUri.slice("ipfs://".length) : cidOrUri;
  return `${FILE_GATEWAY}${cid}`;
}

async function fetchMetadataJson(cidOrUri: string) {
  const cid = cidOrUri.startsWith("ipfs://") ? cidOrUri.slice("ipfs://".length) : cidOrUri;
  const res = await fetch(`/api/ipfs-json?cid=${encodeURIComponent(cid)}`, { cache: "no-store" });

  if (res.ok) return await res.json();

  // 422 means not-json; 500 means gateway fetch failed
  const err = await res.json().catch(() => ({}));
  throw new Error(err?.error || "Metadata fetch failed");
}

function CertRow({ tokenId }: { tokenId: bigint }) {
  const { targetNetwork } = useTargetNetwork();

  const { data: cert } = useReadAny({
    contractName: "SoulboundCert",
    functionName: "certificate",
    args: [tokenId],
  });

  const issuer = cert?.issuer as `0x${string}` | undefined;
  const ipfsCid = cert?.ipfsCid as string | undefined; // should be metadata CID
  const revoked = cert?.revoked as boolean | undefined;

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/verify?tokenId=${tokenId.toString()}`;
  }, [tokenId]);

  const metadataUrl = ipfsCid ? ipfsToHttp(ipfsCid) : "";

  const [metadata, setMetadata] = useState<any>(null);
  const [metaErr, setMetaErr] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setMetadata(null);
      setMetaErr("");
      if (!ipfsCid) return;

      try {
        const json = await fetchMetadataJson(ipfsCid);
        setMetadata(json);
      } catch (e: any) {
        setMetaErr(e?.message ?? "Metadata JSON not readable");
      }
    };
    run();
  }, [ipfsCid]);

  const attachmentUri: string | undefined = metadata?.attachment?.uri;
  const attachmentName: string | undefined = metadata?.attachment?.name;
  const attachmentMime: string | undefined = metadata?.attachment?.mime;

  const attachmentUrl = attachmentUri ? ipfsToHttp(attachmentUri) : "";
  const directFileUrl = ipfsCid ? ipfsToHttp(ipfsCid) : "";

  return (
    <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-bold">Token #{tokenId.toString()}</div>
        <div className={revoked ? "text-error font-bold" : "text-success font-bold"}>
          {revoked ? "REVOKED" : "VALID"}
        </div>
      </div>

      <div className="text-sm">
        <div className="opacity-70">Issuer</div>
        <Address address={issuer} chain={targetNetwork} />
      </div>

      {/* Link 1: metadata CID (JSON) */}
      {ipfsCid ? (
        <a className="link text-sm break-all" href={metadataUrl} target="_blank" rel="noreferrer">
          Metadata JSON: {ipfsCid}
        </a>
      ) : (
        <div className="text-sm opacity-70">No CID</div>
      )}

      {metaErr ? (
        <div className="text-xs text-warning break-words">
          {metaErr}. If this CID is a direct file (not JSON), use:{" "}
          <a className="link" href={directFileUrl} target="_blank" rel="noreferrer">
            Open CID
          </a>
        </div>
      ) : null}

      {/* Link 2: document from metadata.attachment.uri */}
      {attachmentUrl ? (
        <div className="mt-1">
          <a className="link text-sm break-all" href={attachmentUrl} target="_blank" rel="noreferrer">
            Document: {attachmentName ?? attachmentUri}
          </a>

          {/* Preview for images */}
          {attachmentMime?.startsWith("image/") ? (
            <img className="mt-2 rounded border border-base-300" src={attachmentUrl} alt="document preview" />
          ) : null}

          {/* PDF preview (if it works) */}
          {attachmentMime === "application/pdf" ? (
            <object className="mt-2 w-full h-96 rounded border border-base-300" data={attachmentUrl} type="application/pdf">
              <div className="p-2 text-sm">
                PDF preview blocked.{" "}
                <a className="link" href={attachmentUrl} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              </div>
            </object>
          ) : null}
        </div>
      ) : null}

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
          {ids.map((id: bigint) => (
            <CertRow key={id.toString()} tokenId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}