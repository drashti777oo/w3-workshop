# W3 Workshop

Multi-chain ERC-721 workshop project with:
- Next.js frontend (`apps/web`)
- Rust Stylus contract (`contracts/erc721`)
- deployment and security scripts (`scripts`)

## Folder Structure

```text
w3-workshop/
|- apps/
|  |- web/
|  |  |- src/
|  |  |  |- app/                         # Next.js App Router pages/providers
|  |  |  |- components/                  # UI components (wallet, chain selector, demo mint panel)
|  |  |  |- lib/
|  |  |  |  |- erc721-stylus/            # ERC-721 interaction logic + panels + generators
|  |  |  |  |- wallet-auth/              # Wallet auth helpers
|  |  |  |  |- chains.ts                 # Chain definitions
|  |  |  |  |- wagmi.ts                  # Wagmi config
|  |  |  |- types/
|  |  |- package.json
|  |  |- next.config.js
|  |  |- tailwind.config.js
|- contracts/
|  |- erc721/
|  |  |- src/
|  |  |  |- lib.rs
|  |  |  |- erc721.rs
|  |  |  |- main.rs
|  |  |- Cargo.toml
|- docs/
|  |- erc721-nft.md
|  |- METADATA_IMPLEMENTATION.md
|  |- SMARTCACHE_USAGE.md
|  |- RADAR_SECURITY_ANALYSIS.md
|  |- frontend/README.md
|- scripts/
|  |- deploy-erc721.ts
|  |- deploy-sepolia.sh
|  |- deploy-mainnet.sh
|  |- install-radar.sh
|  |- run-radar.sh
|- MULTI_CHAIN_GUIDE.md
|- package.json
|- README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm (or pnpm)

### Install

```bash
npm install
cd apps/web
npm install
```

### Run Frontend

```bash
cd apps/web
npm run dev
```

### Typecheck Frontend

```bash
cd apps/web
npm run typecheck
```

## Scripts

### Root (`package.json`)
- `npm run deploy:erc721` - Deploy ERC-721 via TypeScript script.
- `npm run deploy:sepolia` - Deploy shell workflow for Sepolia.
- `npm run deploy:mainnet` - Deploy shell workflow for mainnet.
- `npm run security:install` - Install Radar security tooling.
- `npm run security:analyze` - Run Radar analysis.
- `npm run fix-scripts` - Normalize script line endings.

### Frontend (`apps/web/package.json`)
- `npm run dev` - Start Next.js app.
- `npm run build` - Build app.
- `npm run start` - Serve production build.
- `npm run lint` - Typecheck alias (tsc noEmit).
- `npm run typecheck` - TypeScript type check.

## Smart Contract

Contract source is in `contracts/erc721`.

Key files:
- `contracts/erc721/src/lib.rs`
- `contracts/erc721/src/erc721.rs`
- `contracts/erc721/src/main.rs`

## Docs

See `docs/` for:
- ERC-721 and metadata notes
- frontend notes
- security analysis references

## License

MIT