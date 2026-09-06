# Claude.md — Working Context for CertChain

You are helping build and polish CertChain, a Web3 dApp for Hackblox PS2:
"On-Chain Verifiable Credentials (Soulbound Certificates)".

## What the app does
- Whitelisted issuers mint soulbound ERC-721 certificates to student wallets.
- Metadata is stored on IPFS (CID referenced on-chain) + metadataHash stored on-chain.
- Public verification by tokenId or wallet.
- Bonus: revocation + QR code.

## Repo layout
- `packages/hardhat`:
  - `contracts/SoulboundCert.sol`
  - `scripts/deploySoulboundDirect.mjs` (direct ethers deploy from artifact)
- `packages/nextjs`:
  - App Router pages:
    - `app/issuer/page.tsx`
    - `app/verify/page.tsx`
  - Contract registry:
    - `contracts/deployedContracts.ts`

## How to run locally (3 terminals)
1) Chain:
   - `yarn workspace @se-2/hardhat hardhat node`
2) Deploy:
   - `yarn workspace @se-2/hardhat hardhat compile`
   - `yarn workspace @se-2/hardhat node scripts/deploySoulboundDirect.mjs`
3) Frontend:
   - `cd packages/nextjs && npx next dev`

## Critical implementation notes
- Soulbound behavior must block transfers after mint; approvals should also be blocked.
- Only whitelisted issuers can mint and revoke.
- Revocation is a state change (no transfer).
- Scaffold-ETH typed hooks break if `deployedContracts.ts` is empty (contractName/functionName become `never`).

## What to optimize
- UI simplicity: remove unnecessary text, reduce clicks, keep issuer/verify flows clear.
- Demo readiness: show issuer status, minted tokenId, verification result, QR, revoked status.
- Stability: prefer local demo setup for recording, avoid fragile testnet dependencies.

## Output expectations when asked
- Provide exact copy-paste code for files.
- Provide minimal diffs and where to place them.
- Provide commands to run.
- Keep responses concise and actionable.