/**
 * ERC721 NFT Interaction Functions
 */

import { ethers } from 'ethers';
import type { Address, Hash } from 'viem';
import { ERC721_ABI } from './constants';
import type { CollectionInfo, NFTInfo, BalanceInfo } from './types';

/**
 * Get collection information
 */
export async function getCollectionInfo(
  contractAddress: Address,
  rpcEndpoint: string
): Promise<CollectionInfo> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

  const [name, symbol] = await Promise.all([
    contract.name(),
    contract.symbol(),
  ]);

  return {
    address: contractAddress,
    name,
    symbol,
  };
}

/**
 * Get balance of an address (number of NFTs owned)
 */
export async function getBalance(
  contractAddress: Address,
  accountAddress: Address,
  rpcEndpoint: string
): Promise<BalanceInfo> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

  const balance = await contract.balanceOf(accountAddress);
  
  return {
    balance: BigInt(balance),
  };
}

/**
 * Get NFT information
 */
export async function getNFTInfo(
  contractAddress: Address,
  tokenId: bigint,
  rpcEndpoint: string
): Promise<NFTInfo> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

  const [owner, approved] = await Promise.all([
    contract.ownerOf(tokenId),
    contract.getApproved(tokenId),
  ]);

  return {
    tokenId,
    owner: owner as Address,
    approved: approved as Address,
  };
}

/**
 * Mint a new NFT
 */
export async function mint(
  contractAddress: Address,
  to: Address,
  privateKey: string,
  rpcEndpoint: string
): Promise<{ hash: Hash; tokenId: bigint }> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.mintTo(to);
  const receipt = await tx.wait();
  
  // Parse the Transfer event to get the token ID
  let tokenId = BigInt(0);
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === 'Transfer') {
        tokenId = BigInt(parsed.args[2] as bigint);
        break;
      }
    } catch {
      // Skip unparseable logs
    }
  }
  
  return {
    hash: receipt.hash as Hash,
    tokenId,
  };
}

/**
 * Transfer an NFT
 */
export async function transferFrom(
  contractAddress: Address,
  from: Address,
  to: Address,
  tokenId: bigint,
  privateKey: string,
  rpcEndpoint: string
): Promise<Hash> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.transferFrom(from, to, tokenId);
  const receipt = await tx.wait();
  
  return receipt.hash as Hash;
}

/**
 * Safe transfer an NFT
 */
export async function safeTransferFrom(
  contractAddress: Address,
  from: Address,
  to: Address,
  tokenId: bigint,
  privateKey: string,
  rpcEndpoint: string
): Promise<Hash> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.safeTransferFrom(from, to, tokenId);
  const receipt = await tx.wait();
  
  return receipt.hash as Hash;
}

/**
 * Approve an address to transfer a specific NFT
 */
export async function approve(
  contractAddress: Address,
  approved: Address,
  tokenId: bigint,
  privateKey: string,
  rpcEndpoint: string
): Promise<Hash> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.approve(approved, tokenId);
  const receipt = await tx.wait();
  
  return receipt.hash as Hash;
}

/**
 * Set approval for all NFTs
 */
export async function setApprovalForAll(
  contractAddress: Address,
  operator: Address,
  approved: boolean,
  privateKey: string,
  rpcEndpoint: string
): Promise<Hash> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.setApprovalForAll(operator, approved);
  const receipt = await tx.wait();
  
  return receipt.hash as Hash;
}

/**
 * Burn an NFT
 */
export async function burn(
  contractAddress: Address,
  tokenId: bigint,
  privateKey: string,
  rpcEndpoint: string
): Promise<Hash> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.burn(tokenId);
  const receipt = await tx.wait();
  
  return receipt.hash as Hash;
}
