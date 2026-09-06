import * as hardhat from "hardhat";

async function main() {
  const hre: any = (hardhat as any).default ?? hardhat;
  console.log("has hre.ethers?", !!hre.ethers);

  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("SoulboundCert");
  const cert = await Factory.deploy();
  await cert.waitForDeployment();

  console.log("✅ Deployed:", await cert.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});