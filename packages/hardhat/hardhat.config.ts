import "dotenv/config";
import { defineConfig } from "hardhat/config";

import * as hardhatEthersMod from "@nomicfoundation/hardhat-ethers";
const hardhatEthers = (hardhatEthersMod as any).default ?? hardhatEthersMod;

const providerApiKey = (process.env.ALCHEMY_API_KEY ?? "").trim();
const pk = (process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "").trim();
const accounts = /^0x[0-9a-fA-F]{64}$/.test(pk) ? [pk] : [];

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: { compilers: [{ version: "0.8.30" }] },
  networks: {
    sepolia: {
      type: "http",
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts,
    },
    hardhat: { type: "edr-simulated" },
  },
});