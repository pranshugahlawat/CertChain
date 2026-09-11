import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { ethers } from "ethers";

const artifactPath = path.join(
  process.cwd(),
  "artifacts",
  "contracts",
  "SoulboundCert.sol",
  "SoulboundCert.json"
);


const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const alchemyKey = (process.env.ALCHEMY_API_KEY ?? "").trim();
const pk = (process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "").trim();

if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
  throw new Error("Invalid __RUNTIME_DEPLOYER_PRIVATE_KEY in packages/hardhat/.env");
}
if (!alchemyKey) {
  throw new Error("Missing ALCHEMY_API_KEY in packages/hardhat/.env");
}

const rpcUrl = (process.env.RPC_URL ?? "").trim();
if (!rpcUrl) throw new Error("Missing RPC_URL in packages/hardhat/.env");
const isSepolia = rpcUrl.includes("sepolia");

const provider = new ethers.JsonRpcProvider(rpcUrl, { name: "sepolia", chainId: 11155111 });
const wallet = new ethers.Wallet(pk, provider);

console.log("Deployer:", wallet.address);

const factory = new ethers.ContractFactory(abi, bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log("✅ SoulboundCert deployed to:", address);

let nonce = await provider.getTransactionCount(wallet.address, "latest");

console.log("Setting deployer as UniversityAdmin + Issuer...");
await (await contract.setUniversityAdmin(wallet.address, true, { nonce: nonce++ })).wait();
await (await contract.setIssuer(wallet.address, true, { nonce: nonce++ })).wait();
console.log("✅ Whitelisted deployer");