import * as hardhat from "hardhat";
const hre: any = (hardhat as any).default ?? hardhat;

console.log("hre.ethers exists?", !!hre.ethers);