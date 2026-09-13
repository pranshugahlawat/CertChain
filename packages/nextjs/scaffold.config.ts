import { sepolia } from "viem/chains";

export const DEFAULT_ALCHEMY_API_KEY = "IZYEU2cWBgnFmgiTAgpWD";

// IMPORTANT: widen this type so wagmiConnectors comparisons are valid
export type BurnerWalletMode = "localNetworksOnly" | "allNetworks" | "disabled";

export const ScaffoldConfig = {
  targetNetworks: [sepolia],
  pollingInterval: 4000,
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  rpcOverrides: {} as Record<number, string>,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // WIDENED (do not let TS infer a single literal)
  burnerWalletMode: "localNetworksOnly" as BurnerWalletMode,
} as const;

export type ScaffoldConfig = typeof ScaffoldConfig;

const scaffoldConfig = {
  ...ScaffoldConfig,
} as const satisfies typeof ScaffoldConfig;

export default scaffoldConfig;