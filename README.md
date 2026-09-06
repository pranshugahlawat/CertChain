# CertChain — Soulbound Credential Verification

Built with ♥ by [Pranshu Gahlawat](https://github.com/pranshugahlawat)

## Problem (Hackblox Web3 PS2)
Fake degrees and certificates are common and verification is slow in Web2 (emails, manual checks). The goal is instant, tamper‑proof verification of academic credentials on-chain.

## Solution
CertChain is a dApp where authorized issuers mint **non-transferable (soulbound) ERC‑721 NFTs** as certificates to a student wallet. Anyone can verify authenticity and issuer information on-chain by searching via **tokenId** or **wallet address**.

## Key Features
- **Soulbound ERC‑721**: transfers blocked after mint (non-transferable credentials)
- **Issuer whitelist**: only authorized issuers can mint
- **IPFS metadata reference**: certificate metadata stored on IPFS (CID referenced on-chain) + `metadataHash` stored on-chain
- **Public verification**:
  - verify by tokenId
  - verify by wallet (lists all certificates)
- **Issuer dashboard**:
  - mint certificates
  - revoke certificates (bonus)
- **QR code verification** (bonus): QR links directly to token verify view

## Tech Stack
- **Solidity** + OpenZeppelin (ERC‑721, Ownable)
- **Hardhat** local node (chainId `31337`)
- **Ethers.js v6** deploy scripts (direct deploy from artifacts)
- **Next.js (App Router)** + Scaffold‑ETH‑2 + Wagmi/Viem
- **IPFS** (CID-based metadata workflow)

---

## Repo / Workspace Structure
- `packages/hardhat/` — contracts + compile + scripts
- `packages/nextjs/` — frontend (App Router)
- `packages/nextjs/contracts/deployedContracts.ts` — local contract registry used by Scaffold‑ETH hooks

---

## Prerequisites
- Node.js **v22.13+**
- Yarn

---

## Local Quickstart (Recommended Demo)
### 1) Install dependencies
From repo root:
```bash
yarn install"# CertChain" 
