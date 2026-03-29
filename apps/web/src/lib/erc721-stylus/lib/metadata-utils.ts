/**
 * ERC-721 Metadata Utility Functions
 * 
 * This module provides helper functions for working with ERC-721 metadata following the standard:
 * https://docs.opensea.io/docs/contract-level-metadata
 * 
 * Metadata is stored as a JSON file at the URI returned by tokenURI(tokenId)
 */

/** Standard ERC-721 metadata format */
export interface NFTMetadata {
  /** The name of the NFT */
  name: string;
  
  /** A description of the NFT */
  description?: string;
  
  /** URL to the image (supports IPFS, HTTP, etc.) */
  image?: string;
  
  /** URL to an external website about the NFT */
  external_url?: string;
  
  /** Traits/attributes of the NFT */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  
  /** Animation URL if the NFT is animated */
  animation_url?: string;
  
  /** YouTube URL if the NFT has a video */
  youtube_url?: string;
}

/**
 * Generates a data URI with base64-encoded JSON metadata
 * Useful for storing metadata directly on-chain
 * 
 * @param metadata The NFT metadata object
 * @returns Base64 data URI string
 * 
 * Example:
 * const metadata: NFTMetadata = {
 *   name: "My NFT #1",
 *   description: "An example NFT",
 *   image: "ipfs://QmXxxx...",
 *   attributes: [{ trait_type: "Rarity", value: "Rare" }]
 * };
 * const uri = createDataURI(metadata);
 * // Returns: data:application/json;base64,eyJuYW1lIjoiTXkgTkZUIi4uLn0=
 */
export function createDataURI(metadata: NFTMetadata): string {
  const jsonString = JSON.stringify(metadata);
  const encodedJson = btoa(jsonString); // Base64 encode
  return `data:application/json;base64,${encodedJson}`;
}

/**
 * Generates a HTTP metadata URL
 * Assumes a server/API that stores metadata JSON files by ID
 * 
 * @param baseUrl The base URL of your metadata server (e.g., "https://api.example.com/metadata/")
 * @param tokenId The token ID
 * @returns The full metadata URL
 * 
 * Example:
 * const url = createHttpMetadataUrl("https://api.example.com/metadata/", "5");
 * // Returns: https://api.example.com/metadata/5.json
 */
export function createHttpMetadataUrl(baseUrl: string, tokenId: string | number): string {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}${tokenId}.json`;
}

/**
 * Generates an IPFS metadata URL
 * For use with IPFS gateways
 * 
 * @param ipfsHash The IPFS hash (e.g., "QmXxxx...")
 * @param gatewayUrl Optional custom IPFS gateway (defaults to https://ipfs.io/ipfs/)
 * @returns The IPFS gateway URL
 * 
 * Example:
 * const url = createIPFSMetadataUrl("QmXxxx123...");
 * // Returns: https://ipfs.io/ipfs/QmXxxx123...
 */
export function createIPFSMetadataUrl(ipfsHash: string, gatewayUrl: string = "https://ipfs.io/ipfs/"): string {
  return `${gatewayUrl}${ipfsHash}`;
}

/**
 * Validates an ERC-721 metadata object
 * Checks that required fields are present and properly formatted
 * 
 * @param metadata The metadata to validate
 * @returns Object with isValid boolean and errors array
 */
export function validateMetadata(metadata: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!metadata || typeof metadata !== 'object') {
    errors.push('Metadata must be an object');
    return { isValid: false, errors };
  }
  
  const meta = metadata as Record<string, unknown>;
  
  if (!meta.name || typeof meta.name !== 'string') {
    errors.push('Metadata must have a "name" field of type string');
  }
  
  if (meta.image && typeof meta.image !== 'string') {
    errors.push('"image" must be a string URL');
  }
  
  if (meta.description && typeof meta.description !== 'string') {
    errors.push('"description" must be a string');
  }
  
  if (meta.attributes && !Array.isArray(meta.attributes)) {
    errors.push('"attributes" must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sample metadata examples for testing
 */
export const SAMPLE_METADATA: Record<string, NFTMetadata> = {
  kitten: {
    name: "Cute Kitten #1",
    description: "A adorable random kitten generated with AI",
    image: "https://placekitten.com/300/300",
    external_url: "https://example.com",
    attributes: [
      { trait_type: "Species", value: "Kitten" },
      { trait_type: "Color", value: "Orange" },
      { trait_type: "Rarity", value: "Common" },
    ],
  },
  
  robot: {
    name: "Robot Worker #42",
    description: "A futuristic robot designed for the metaverse",
    image: "https://robohash.org/42?set=set4&size=300x300",
    attributes: [
      { trait_type: "Type", value: "Robot" },
      { trait_type: "Model", value: "Generation 5" },
      { trait_type: "Power Level", value: "9000" },
    ],
  },
};

/**
 * Creates a simple metadata JSON file content for downloading
 * Useful for creating metadata files to host manually
 * 
 * @param metadata The metadata object
 * @returns JSON string suitable for a .json file
 */
export function exportMetadataJSON(metadata: NFTMetadata): string {
  return JSON.stringify(metadata, null, 2);
}

/**
 * Example contract storage setup instructions:
 * 
 * In Rust Stylus contract:
 * 
 * sol_storage! {
 *   struct YourNFT {
 *     String base_uri;  // e.g., "https://api.example.com/metadata/"
 *     mapping(uint256 => String) token_uris;  // Optional: custom URIs per token
 *   }
 * }
 * 
 * pub fn token_uri(&self, token_id: U256) -> String {
 *   let base = self.base_uri.clone();
 *   let uri = format!("{}{}.json", base, token_id);
 *   uri
 * }
 * 
 * pub fn set_base_uri(&mut self, new_uri: String) {
 *   self.base_uri = new_uri;
 * }
 */

/**
 * Metadata Storage Options:
 * 
 * 1. IPFS (Recommended for permanence):
 *    - Upload metadata to IPFS via pinning service (Pinata, NFT.storage, etc.)
 *    - Set base_uri to IPFS gateway: "https://ipfs.io/ipfs/QmXxxx/"
 *    - Metadata accessed via: "https://ipfs.io/ipfs/QmXxxx/1.json"
 *    - Pros: Decentralized, permanent, cheap
 *    - Cons: Requires pinning to stay available
 * 
 * 2. HTTP Server (Flexible):
 *    - Host metadata JSON files on your own server
 *    - Set base_uri to: "https://yourapi.com/metadata/"
 *    - Via contentId pattern: "https://yourapi.com/metadata/{id}.json"
 *    - Pros: Full control, fast, updatable
 *    - Cons: Centralized, depends on server uptime
 * 
 * 3. On-Chain (Data URI):
 *    - Store base64-encoded JSON directly in contract storage
 *    - Use createDataURI() function to generate
 *    - Pros: Truly permanent, no external dependencies
 *    - Cons: Expensive gas, limited metadata size
 * 
 * 4. Hybrid Approach:
 *    - Store base URI on-chain
 *    - Use external storage for JSON files
 *    - Update base_uri as needed (e.g., migrate between IPFS providers)
 *    - Pros: Flexible, permanent, cost-effective
 */
