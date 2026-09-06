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

export default function IssuerPage() {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [student, setStudent] = useState("");
  const [cid, setCid] = useState("");
  const [revokeTokenId, setRevokeTokenId] = useState("");

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
          placeholder="IPFS CID (bafy...)"
          value={cid}
          onChange={e => setCid(e.target.value)}
        />

        <button
          className="btn btn-primary w-full mt-3"
          disabled={!issuerStatus || !studentOk || !cid.trim() || !metadataHash || isMining}
          onClick={async () => {
            await writeContractAsync({
              functionName: "mint",
              args: [student, cid.trim(), metadataHash],
            });
            setCid("");
          }}
        >
          {isMining ? "Working..." : "Mint"}
        </button>

        {latestId !== undefined && (
          <div className="mt-3 text-sm">
            Latest token for this student: <span className="font-bold">#{latestId.toString()}</span>
          </div>
        )}
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