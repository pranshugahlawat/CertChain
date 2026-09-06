import type { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import type { Abi } from "viem";
import SoulboundCertArtifact from "./abis/SoulboundCert.json";

const deployedContracts = {
  31337: {
    SoulboundCert: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: SoulboundCertArtifact.abi as unknown as Abi,
    },
  },
} as const satisfies GenericContractsDeclaration;

export default deployedContracts;