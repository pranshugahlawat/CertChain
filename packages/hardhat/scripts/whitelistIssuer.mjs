import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { ethers } from "ethers";

const rpcUrl = process.env.RPC_URL?.trim() || "http://127.0.0.1:8545";
const pk = (process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "").trim();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const TARGET = process.argv[2]; // address to whitelist

if (!TARGET) throw new Error("Usage: node scripts/whitelistIssuer.mjs 0xYourAddress");
if (!/^0x[0-9a-fA-F]{40}$/.test(TARGET)) throw new Error("Invalid target address");
if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) throw new Error("Invalid __RUNTIME_DEPLOYER_PRIVATE_KEY");

const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "SoulboundCert.sol", "SoulboundCert.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(pk, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

console.log("Whitelisting issuer:", TARGET);
const tx = await contract.setIssuer(TARGET, true);
await tx.wait();
console.log("✅ Done");