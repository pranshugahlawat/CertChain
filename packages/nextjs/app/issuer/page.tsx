"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress, keccak256, stringToHex } from "viem";
import { Address } from "@scaffold-ui/components";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

// cast hooks to bypass broken typed registry (fixes "parameter of type never")
const useReadAny = useScaffoldReadContract as any;
const useWriteAny = useScaffoldWriteContract as any;

type PinnedFile = { cid: string; name?: string; mime?: string; size?: number };

export default function IssuerPage() {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [student, setStudent] = useState("");
  const [cid, setCid] = useState("");
  const [revokeTokenId, setRevokeTokenId] = useState("");

  // NEW: optional upload
  const [file, setFile] = useState<File | null>(null);
  const [mintStatus, setMintStatus] = useState<string>("");

  const studentOk = useMemo(() => isAddress(student), [student]);

  const metadataHash = useMemo(() => {
    if (!cid.trim()) return undefined;
    return keccak256(stringToHex(cid.trim()));
  }, [cid]);

  // READ: isIssuer
  const { data: issuerStatus } = useReadAny({
    contractName: "SoulboundCert",
    functionName: "isIssuer",
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  // READ: certificatesOf(student) (to show latest tokenId)
  const { data: studentTokenIds } = useReadAny({
    contractName: "SoulboundCert",
    functionName: "certificatesOf",
    args: studentOk ? [student] : undefined,
  });

  const ids = (studentTokenIds as bigint[] | undefined) ?? [];
  const latestId = ids.length ? ids[ids.length - 1] : undefined;

  // WRITE
  const { writeContractAsync, isMining } = useWriteAny({
    contractName: "SoulboundCert",
  });

  async function pinFileToIpfs(selected: File): Promise<PinnedFile> {
    const fd = new FormData();
    fd.append("file", selected);

    const res = await fetch("/api/pin-file", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : "pin-file failed");

    return data as PinnedFile; // { cid: "bafy..." }
  }

  async function pinJsonToIpfs(json: any): Promise<string> {
    const res = await fetch("/api/pin-json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : "pin-json failed");

    return data.cid as string; // metadata CID
  }

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">Issuer</div>
        <Link className="link" href="/verify">
          Verify →
        </Link>
      </div>

      <div className="bg-base-200 rounded-xl p-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="opacity-70">Connected:</span>
          <Address address={connectedAddress} chain={targetNetwork} />
        </div>
        <div className="mt-1">
          <span className="opacity-70">Issuer:</span>{" "}
          <span className={issuerStatus ? "text-success font-bold" : "text-error font-bold"}>
            {issuerStatus ? "YES" : "NO"}
          </span>
        </div>
      </div>

      <div className="bg-base-200 rounded-xl p-4">
        <div className="font-semibold mb-3">Mint Certificate</div>

        <input
          className="input input-bordered w-full mb-2"
          placeholder="Student address (0x...)"
          value={student}
          onChange={e => setStudent(e.target.value)}
        />

        <input
          className="input input-bordered w-full"
          placeholder="IPFS Metadata CID (bafy...) (optional if uploading file below)"
          value={cid}
          onChange={e => setCid(e.target.value)}
        />

        {/* NEW: file upload (optional) */}
        <div className="mt-3">
          <div className="text-sm opacity-70 mb-1">Upload proof (PDF/Image/Text) (optional)</div>
          <input
            className="file-input file-input-bordered w-full"
            type="file"
            accept="application/pdf,image/*,text/plain"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="text-xs opacity-70 mt-1">
              Selected: {file.name} ({file.type || "unknown"}) {Math.round(file.size / 1024)} KB
            </div>
          ) : null}
        </div>

        <button
          className="btn btn-primary w-full mt-3"
          disabled={!issuerStatus || !studentOk || isMining || (!cid.trim() && !file)}
          onClick={async () => {
            try {
              setMintStatus("");

              let cidToMint = cid.trim();

              // If a file is selected, generate metadata CID automatically
              if (file) {
                setMintStatus("Uploading file to IPFS...");
                const pinned = await pinFileToIpfs(file);

                setMintStatus("Pinning metadata JSON...");
                const metadata = {
                  app: "CertChain",
                  type: "AcademicCredential",
                  student: { address: student },
                  issuer: { address: connectedAddress },
                  attachment: {
                    uri: `ipfs://${pinned.cid}`,
                    name: pinned.name ?? file.name,
                    mime: pinned.mime ?? file.type,
                    size: pinned.size ?? file.size,
                  },
                  issuedAt: new Date().toISOString(),
                };

                cidToMint = await pinJsonToIpfs(metadata);
                setCid(cidToMint); // show it in the input for transparency
              }

              const hashToMint = keccak256(stringToHex(cidToMint));

              setMintStatus("Minting on-chain...");
              await writeContractAsync({
                functionName: "mint",
                args: [student, cidToMint, hashToMint],
              });

              setMintStatus("Minted ✅");
              setFile(null);
            } catch (err: any) {
              setMintStatus(`Error: ${err?.message ?? String(err)}`);
            }
          }}
        >
          {isMining ? "Working..." : file ? "Upload + Mint" : "Mint"}
        </button>

        {latestId !== undefined && (
          <div className="mt-3 text-sm">
            Latest token for this student: <span className="font-bold">#{latestId.toString()}</span>
          </div>
        )}

        {mintStatus ? <div className="mt-3 text-sm break-words">{mintStatus}</div> : null}
      </div>

      <div className="bg-base-200 rounded-xl p-4">
        <div className="font-semibold mb-3">Revoke Certificate</div>

        <input
          className="input input-bordered w-full"
          placeholder="Token ID (e.g. 1)"
          value={revokeTokenId}
          onChange={e => setRevokeTokenId(e.target.value)}
        />

        <button
          className="btn btn-warning w-full mt-3"
          disabled={!issuerStatus || !revokeTokenId || isMining}
          onClick={async () => {
            await writeContractAsync({
              functionName: "revoke",
              args: [BigInt(revokeTokenId)],
            });
          }}
        >
          {isMining ? "Working..." : "Revoke"}
        </button>
      </div>
    </div>
  );
}