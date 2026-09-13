import { sepolia } from "viem/chains";

export const DEFAULT_ALCHEMY_API_KEY = "IZYEU2cWBgnFmgiTAgpWD";

/**
 * Named export required by:
 * services/web3/wagmiConfig.tsx
 */
export const ScaffoldConfig = {
  // Vercel / production should target Sepolia (not hardhat)
  targetNetworks: [sepolia],

  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  rpcOverrides: {} as Record<number, string>,

  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  burnerWalletMode: "localNetworksOnly",
} as const;

const scaffoldConfig = {
  ...ScaffoldConfig,
} as const satisfies typeof ScaffoldConfig;

export default scaffoldConfig;