# ERC-721 Metadata Implementation Guide

## Overview

This guide explains how to set up NFT metadata for your Stylus ERC-721 contract. Metadata consists of JSON files containing information about each NFT (name, description, image URL, etc.).

## Contract Changes (Rust Stylus)

### 1. Storage Structure

The updated `lib.rs` now includes:

```rust
sol_storage! {
    struct RobinhoodNFT {
        String base_uri;  // Base URL for all token metadata
        mapping(uint256 => String) token_uris;  // Custom URI per token (optional)
        #[borrow]
        Erc721<RobinhoodNFTParams> erc721;
    }
}
```

**What it does:**
- `base_uri`: Stores a base URL like `"https://api.example.com/metadata/"`
- `token_uris`: Allows setting custom URIs for specific tokens (overrides base_uri)

### 2. Three New Functions

#### `token_uri(token_id: U256) -> String`
Returns the metadata URI for a given token ID.

```rust
// If custom URI exists, returns it
// Otherwise, returns: base_uri + token_id + ".json"
// Example: "https://api.example.com/metadata/5.json"
```

#### `set_base_uri(new_base_uri: String)`
Sets the base URI for all tokens.

```rust
// Usage in contract deployment or initialization
contract.set_base_uri("https://api.example.com/metadata/");
```

#### `set_token_uri(token_id: U256, uri: String)`
Sets a custom URI for a specific token (overrides base_uri).

```rust
// For special tokens with different metadata locations
contract.set_token_uri(5, "https://special-metadata.com/token5.json");
```

---

## Frontend Changes (React/Next.js)

### 1. Updated ABI

The ERC721_ABI now includes metadata functions:

```typescript
"function tokenURI(uint256 token_id) view returns (string)",
"function setBaseUri(string new_base_uri)",
```

### 2. Metadata Utility Function

New helper: `fetchNFTMetadata(uri: string)`

```typescript
// Fetches and parses metadata from any URI
// Handles: HTTP/HTTPS, IPFS, Data URIs
const metadata = await fetchNFTMetadata("https://api.example.com/metadata/5.json");
// Returns: { name: "NFT #5", description: "...", image: "..." }
```

### 3. Enhanced NFT Gallery

The gallery now:
1. Fetches tokenURI for each owned NFT
2. Fetches metadata JSON from that URI
3. Displays image, name, and description on NFT cards
4. Shows fallback gradient if image fails to load

---

## Metadata Storage Options

### Option 1: **IPFS (Recommended)**

**Best for:** Decentralized, permanent NFTs

**Steps:**
1. Upload metadata JSON to IPFS via pinning service:
   - [Pinata.cloud](https://pinata.cloud)
   - [NFT.storage](https://nft.storage)
   - [Web3.storage](https://web3.storage)

2. Each metadata file is named with token ID:
   ```
   1.json
   2.json
   3.json
   ```

3. Get IPFS hash (e.g., `QmXxxx123...`)

4. Set base URI in contract:
   ```javascript
   await contract.set_base_uri("https://ipfs.io/ipfs/QmXxxx123/");
   // Now: tokenURI(5) returns "https://ipfs.io/ipfs/QmXxxx123/5.json"
   ```

**Pros:**
- Decentralized and permanent
- Industry standard for NFTs
- Multiple gateway options

**Cons:**
- Requires pinning for availability
- Slightly slower than HTTP

---

### Option 2: **HTTP Server**

**Best for:** Flexibility and control

**Steps:**
1. Create a metadata endpoint on your server:
   ```
   GET /metadata/{token_id}.json
   ```

2. Each request returns JSON:
   ```json
   {
     "name": "Sample NFT #5",
     "description": "A demo NFT",
     "image": "https://example.com/images/5.png"
   }
   ```

3. Set base URI:
   ```javascript
   await contract.set_base_uri("https://yourapi.com/metadata/");
   // Now: tokenURI(5) returns "https://yourapi.com/metadata/5.json"
   ```

**Pros:**
- Full control over metadata
- Can update metadata later
- Fast and flexible

**Cons:**
- Centralized
- Depends on server uptime

---

### Option 3: **On-Chain Storage (Data URLs)**

**Best for:** Permanent, immutable metadata

**Steps:**
1. Create metadata JSON:
   ```json
   {
     "name": "Sample NFT #5",
     "description": "A demo NFT",
     "image": "https://placekitten.com/300/300"
   }
   ```

2. Base64 encode it:
   ```javascript
   const json = JSON.stringify(metadata);
   const base64 = btoa(json);
   const dataURI = `data:application/json;base64,${base64}`;
   ```

3. Set as custom URI:
   ```javascript
   await contract.set_token_uri(5, dataURI);
   ```

**Pros:**
- Truly permanent and immutable
- No external dependencies

**Cons:**
- Expensive gas costs
- Limited to ~5KB per token
- Not indexed by metadata sites

---

### Option 4: **Hybrid (IPFS + Base URI)**

**Best for:** Balance of permanence and flexibility

**Setup:**
1. Store metadata folder on IPFS
2. Pin to ensure availability
3. Use base URI pattern
4. Can migrate between IPFS providers if needed

---

## ERC-721 Metadata Standard

Standard format for `tokenURI()` JSON response:

```json
{
  "name": "Sample NFT #1",
  "description": "A demo NFT from the workshop",
  "image": "https://placekitten.com/300/300",
  "external_url": "https://example.com/nft/1",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Orange"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

**Supported Fields:**
- `name` (required): NFT name
- `description`: What the NFT is
- `image`: URL to image/media
- `external_url`: Link to more info
- `attributes`: Traits visible on marketplaces
- `animation_url`: Video/animation URL
- `youtube_url`: YouTube video link

---

## Example Usage

### Deploy Contract and Set Metadata

```rust
// In Stylus contract
#[public]
impl RobinhoodNFT {
    pub fn initialize_metadata(&mut self) -> Result<(), Vec<u8>> {
        // Set base URI for all future NFTs
        self.set_base_uri("https://api.example.com/metadata/".to_string())?;
        Ok(())
    }
}
```

### Frontend: Implement Metadata Fetching

Already implemented in `ERC721InteractionPanel.tsx`:

```typescript
// 1. Get the tokenURI
const uri = await contract.tokenURI(5);

// 2. Fetch metadata from that URI
const metadata = await fetchNFTMetadata(uri);
// { name: "Sample NFT #5", image: "https://...", ... }

// 3. Display in gallery (automatic)
// The gallery now shows: image, name, description
```

---

## Testing Locally

### Using Sample Metadata URLs

The frontend supports these test URLs:

```typescript
import { SAMPLE_METADATA, createDataURI } from './lib/metadata-utils';

// Generate test data URI
const dataUri = createDataURI(SAMPLE_METADATA.kitten);
// Use for testing without external dependencies
```

### Setting Test Metadata

```javascript
// In browser console
const testUri = "data:application/json;base64,eyJuYW1lIjoiVGVzdCBORlQiLCJkZXNjcmlwdGlvbiI6IkEgdGVzdCBORlQiLCJpbWFnZSI6Imh0dHBzOi8vcGxhY2VraXR0ZW4uY29tLzMwMC8zMDAifQ==";
await contract.set_token_uri(1, testUri);
```

---

## Troubleshooting

### Gallery Shows "Token #X" Instead of Metadata

**Cause:** Contract doesn't have base_uri set

**Fix:**
```javascript
await contract.set_base_uri("https://api.example.com/metadata/");
```

### Images Not Loading

**Cause:** Image URLs are unreachable or CORS blocked

**Fix:**
- Ensure image URLs are publicly accessible
- Use HTTPS instead of HTTP
- Test image URL directly in browser
- Consider using a CDN or image proxy

### Metadata Not Updating

**Cause:** IPFS cached metadata or browser cache

**Fix:**
- Clear browser cache
- Use different IPFS gateway
- Wait for IPFS propagation (up to 1 hour)
- Use HTTP server if you need instant updates

### High Gas Costs

**Cause:** Storing too much data on-chain

**Fix:**
- Use HTTP server or IPFS instead of data URIs
- Use base_uri pattern with small individual token files
- Only store necessary metadata

---

## Files Updated

1. **Contract (`contracts/erc721/src/lib.rs`)**
   - Added `base_uri` storage field
   - Added `token_uris` mapping
   - Added `token_uri()`, `set_base_uri()`, `set_token_uri()` functions

2. **Frontend (`apps/web/src/lib/erc721-stylus/src/ERC721InteractionPanel.tsx`)**
   - Updated ABI to include metadata functions
   - Added `fetchNFTMetadata()` helper function
   - Enhanced `fetchOwnedNFTs()` to fetch metadata
   - Updated NFT gallery UI to display metadata

3. **Utilities (`apps/web/src/lib/erc721-stylus/lib/metadata-utils.ts`)**
   - Helper functions for metadata operations
   - Validation functions
   - Sample metadata examples

---

## Next Steps

1. Set up metadata storage (IPFS, HTTP, or on-chain)
2. Deploy contract with `set_base_uri()`
3. Mint NFTs and verify metadata displays in gallery
4. (Optional) List on OpenSea or other marketplaces
5. Update metadata as needed for your dApp

Happy NFT building! 🚀
