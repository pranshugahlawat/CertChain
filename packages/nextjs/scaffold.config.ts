import { sepolia } from "viem/chains";

export const DEFAULT_ALCHEMY_API_KEY = "IZYEU2cWBgnFmgiTAgpWD";

export const ScaffoldConfig = {
  
  targetNetworks: [sepolia],

  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  rpcOverrides: {} as Record<number, string>,

  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  burnerWalletMode: "localNetworksOnly",
} as const;

export type ScaffoldConfig = typeof ScaffoldConfig;

const scaffoldConfig = {
  targetNetworks: [sepolia],
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  rpcOverrides: {},
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  burnerWalletMode: "localNetworksOnly",
} as const;


export default scaffoldConfig;