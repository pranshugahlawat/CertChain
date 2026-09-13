import type { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import SoulboundCertArtifact from "./abis/SoulboundCert.json";

const deployedContracts = {
  31337: {
    SoulboundCert: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: SoulboundCertArtifact.abi as any,
    },
  },

  11155111: {
    SoulboundCert: {
      // MUST be the *Sepolia contract address* (from deploy output)
      address: "0xc68553a477160fb8F433385cFf331E97630a5445",
      abi: SoulboundCertArtifact.abi as any,
    },
  },
} as const satisfies GenericContractsDeclaration;

export default deployedContracts;