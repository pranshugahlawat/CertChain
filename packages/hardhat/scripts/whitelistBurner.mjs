import "dotenv/config";
import { ethers } from "ethers";
import fs from "node:fs";

const rpcUrl = process.env.RPC_URL?.trim() || "http://127.0.0.1:8545";
const pk = (process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "").trim();

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const BURNER = "0x284d81127829e541DeBBD27c4148Fc6e75753bb2";

const artifact = JSON.parse(
  fs.readFileSync(new URL("../artifacts/contracts/SoulboundCert.sol/SoulboundCert.json", import.meta.url), "utf8"),
);

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(pk, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

console.log("Whitelisting burner as issuer:", BURNER);
const tx = await contract.setIssuer(BURNER, true);
await tx.wait();
console.log("✅ Done");