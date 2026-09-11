import type { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import SoulboundCertArtifact from "./abis/SoulboundCert.json";
import { Abi } from "viem";

const deployedContracts = {
  // Local Hardhat
  31337: {
    SoulboundCert: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: SoulboundCertArtifact.abi as unknown as Abi,
    },
  },

  // Sepolia
  11155111: {
    SoulboundCert: {
      address: "0xc68553a477160fb8F433385cFf331E97630a5445",
      abi: SoulboundCertArtifact.abi as unknown as Abi,
    },
  },
} as const satisfies GenericContractsDeclaration;

export default deployedContracts;