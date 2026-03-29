'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  Sparkles,
  Send,
  Shield,
  Flame,
  RefreshCw,
  Check,
  Wallet,
  Image,
  AlertCircle,
  ExternalLink,
  Loader2,
  User,
  CheckCircle2,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Stars,
  ScrollText,
  BarChart3
} from 'lucide-react';
import { cn } from './cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { useAccount, useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import type { Chain } from 'viem';

// Define custom Superposition chains
const superposition: Chain = {
  id: 55244,
  name: 'Superposition',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.superposition.so'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.superposition.so' },
  },
};

const superpositionTestnet: Chain = {
  id: 98985,
  name: 'Superposition Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SPN',
    symbol: 'SPN',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.superposition.so'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet-explorer.superposition.so' },
  },
  testnet: true,
};

const robinhoodTestnet: Chain = {
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.chain.robinhood.com' },
  },
  testnet: true,
};

// ERC721 ABI for the deployed Stylus NFT contract (IStylusNFT)
const ERC721_ABI = [
  // ERC721 Standard Interface
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 token_id) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 token_id, bytes data)",
  "function safeTransferFrom(address from, address to, uint256 token_id)",
  "function transferFrom(address from, address to, uint256 token_id)",
  "function approve(address approved, uint256 token_id)",
  "function setApprovalForAll(address operator, bool approved)",
  "function getApproved(uint256 token_id) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  // Metadata support (ERC-721 extension)
  "function tokenURI(uint256 token_id) view returns (string)",
  "function setBaseUri(string new_base_uri)",
  // StylusNFT Specific Functions (from lib.rs)
  "function mint()",
  "function mintTo(address to)",
  "function safeMint(address to)",
  "function burn(uint256 token_id)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed token_id)",
];

// Network-specific default contract addresses (only for networks where contracts are deployed)
const DEFAULT_CONTRACT_ADDRESSES: Record<string, string | undefined> = {
  'arbitrum-sepolia': '0xe2a8cd01354ecc63a8341a849e9b89f14ff9f08f',
  'arbitrum': undefined, // No default contract deployed on mainnet
  'superposition': undefined, // No default contract deployed on mainnet
  'superposition-testnet': '0xa0cc35ec0ce975c28dacc797edb7808e882043c3',
  'robinhood-testnet': '0xa0cc35ec0ce975c28dacc797edb7808e882043c3',
};

// Network configurations
const NETWORKS = {
  'arbitrum-sepolia': {
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    chainId: arbitrumSepolia.id,
    chain: arbitrumSepolia,
  },
  'arbitrum': {
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    chainId: arbitrum.id,
    chain: arbitrum,
  },
  'superposition': {
    name: 'Superposition',
    rpcUrl: 'https://rpc.superposition.so',
    explorerUrl: 'https://explorer.superposition.so',
    chainId: 55244,
    chain: superposition,
  },
  'superposition-testnet': {
    name: 'Superposition Testnet',
    rpcUrl: 'https://testnet-rpc.superposition.so',
    explorerUrl: 'https://testnet-explorer.superposition.so',
    chainId: 98985,
    chain: superpositionTestnet,
  },
  'robinhood-testnet': {
    name: 'Robinhood Chain Testnet',
    rpcUrl: 'https://rpc.testnet.chain.robinhood.com',
    explorerUrl: 'https://explorer.testnet.chain.robinhood.com',
    chainId: 46630,
    chain: robinhoodTestnet,
  },
};

interface ChainLogos {
  arbitrum?: string;
  superposition?: string;
  robinhood?: string;
}

interface ERC721InteractionPanelProps {
  contractAddress?: string;
  network?: SupportedNetworkId;
  /** Optional: URLs for chain logos (arbitrum, superposition, robinhood) - pass to show logos in network selector */
  logos?: ChainLogos;
}

interface TxStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  message: string;
  hash?: string;
}

interface NFTGalleryItem {
  tokenId: string;
  owner: string;
  // Metadata optional fields
  name?: string;
  description?: string;
  image?: string;
  uri?: string;
}

interface MintSuccessState {
  visible: boolean;
  tokenId?: string;
  hash?: string;
}

const NETWORK_IDS = ['arbitrum', 'arbitrum-sepolia', 'superposition', 'superposition-testnet', 'robinhood-testnet'] as const;
type SupportedNetworkId = typeof NETWORK_IDS[number];

function getLogoForNetwork(net: (typeof NETWORK_IDS)[number], logos?: ChainLogos): string | undefined {
  if (!logos) return undefined;
  if (net.includes('arbitrum')) return logos.arbitrum;
  if (net.includes('superposition')) return logos.superposition;
  if (net.includes('robinhood')) return logos.robinhood;
  return undefined;
}

function normalizeErrorMessage(error: unknown): string {
  const message = String((error as any)?.reason || (error as any)?.shortMessage || (error as any)?.message || error || '');
  if (!message) return 'Something went wrong. Please try again.';
  if (message.includes('User rejected') || message.includes('user rejected')) return 'Transaction was canceled in your wallet.';
  if (message.includes('insufficient funds')) return 'Insufficient funds to complete this transaction.';
  if (message.includes('execution reverted')) return 'Transaction reverted by contract rules.';
  if (message.includes('No contract address')) return 'Please select or enter a valid contract address.';
  if (message.includes('connect your wallet')) return 'Connect your wallet to continue.';
  return message.length > 140 ? `${message.slice(0, 140)}...` : message;
}

function gradientForToken(tokenId: string): string {
  let hash = 0;
  for (let i = 0; i < tokenId.length; i += 1) hash = ((hash << 5) - hash + tokenId.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  const hue2 = (hue + 72) % 360;
  return `linear-gradient(135deg, hsl(${hue} 80% 55%), hsl(${hue2} 85% 45%))`;
}

/**
 * Fetches metadata JSON from a URI
 * Handles both HTTP/HTTPS URLs and data URIs
 * 
 * @param uri The metadata URI (from tokenURI contract function)
 * @returns Parsed metadata object or null if fetch fails
 * 
 * Example metadata:
 * {
 *   "name": "Sample NFT #5",
 *   "description": "A demo NFT from the workshop",
 *   "image": "https://placekitten.com/300/300"
 * }
 */
async function fetchNFTMetadata(uri: string): Promise<Partial<NFTGalleryItem> | null> {
  try {
    // Handle data URIs (base64 encoded JSON)
    if (uri.startsWith('data:')) {
      const dataUrl = uri.replace(/^data:[^;]*;base64,/, '');
      const jsonStr = atob(dataUrl);
      const metadata = JSON.parse(jsonStr);
      return metadata;
    }

    // Handle HTTP/HTTPS URLs - use CORS-proxy for public NFT metadata
    // In production, you'd want your own IPFS gateway or metadata server
    let fetchUrl = uri;
    
    // If it's an IPFS URL, convert to HTTP gateway
    if (uri.startsWith('ipfs://')) {
      fetchUrl = `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
    }
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch metadata from ${uri}: ${response.status}`);
      return null;
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.warn(`Error fetching metadata from ${uri}:`, error);
    return null;
  }
}

export function ERC721InteractionPanel({
  contractAddress: initialAddress,
  network: initialNetwork = 'arbitrum-sepolia',
  logos,
}: ERC721InteractionPanelProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetworkId>(initialNetwork);
  const [contractAddress, setContractAddress] = useState(initialAddress || DEFAULT_CONTRACT_ADDRESSES[initialNetwork] || '');
  const [showCustomContract, setShowCustomContract] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const networkConfig = NETWORKS[selectedNetwork];
  const rpcUrl = networkConfig.rpcUrl;
  const explorerUrl = networkConfig.explorerUrl;

  // Wagmi hooks for wallet connection
  const { address: userAddress, isConnected: walletConnected, chain: currentChain } = useAccount();
  const publicClient = usePublicClient({ chainId: networkConfig.chainId as any });
  const { data: walletClient } = useWalletClient({ chainId: networkConfig.chainId as any });
  const { switchChainAsync } = useSwitchChain();

  // NFT info and dashboard data
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);  // Total NFTs minted
  const [showDataDashboard, setShowDataDashboard] = useState(true);  // Show data dashboard by default

  // Form inputs - Write operations
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferTokenId, setTransferTokenId] = useState('');
  const [approveAddress, setApproveAddress] = useState('');
  const [approveTokenId, setApproveTokenId] = useState('');
  const [operatorAddress, setOperatorAddress] = useState('');
  const [operatorApproved, setOperatorApproved] = useState(true);
  const [burnTokenId, setBurnTokenId] = useState('');
  const [mintToAddress, setMintToAddress] = useState('');
  const [safeMintToAddress, setSafeMintToAddress] = useState('');

  // Read operations
  const [ownerOfTokenId, setOwnerOfTokenId] = useState('');
  const [ownerOfResult, setOwnerOfResult] = useState<string | null>(null);
  const [balanceCheckAddress, setBalanceCheckAddress] = useState('');
  const [balanceCheckResult, setBalanceCheckResult] = useState<string | null>(null);
  const [getApprovedTokenId, setGetApprovedTokenId] = useState('');
  const [getApprovedResult, setGetApprovedResult] = useState<string | null>(null);
  const [approvalCheckOwner, setApprovalCheckOwner] = useState('');
  const [approvalCheckOperator, setApprovalCheckOperator] = useState('');
  const [approvalCheckResult, setApprovalCheckResult] = useState<boolean | null>(null);

  const [txStatus, setTxStatus] = useState<TxStatus>({ status: 'idle', message: '' });
  const [customAddressError, setCustomAddressError] = useState<string | null>(null);
  const [isValidatingContract, setIsValidatingContract] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<NFTGalleryItem[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<MintSuccessState>({ visible: false });
  const confettiPieces = useMemo(
    () => Array.from({ length: 28 }, (_, index) => ({ id: index, left: ((index * 37) % 100) + 1, delay: (index % 7) * 0.08 })),
    []
  );

  // Check if using the default contract for the selected network
  const defaultAddress = DEFAULT_CONTRACT_ADDRESSES[selectedNetwork];
  const isUsingDefaultContract = defaultAddress && contractAddress === defaultAddress;
  const hasDefaultContract = !!defaultAddress;
  const displayExplorerUrl = explorerUrl;

  // Update contract address when network changes
  useEffect(() => {
    const newDefault = DEFAULT_CONTRACT_ADDRESSES[selectedNetwork];
    if (newDefault && (isUsingDefaultContract || !initialAddress)) {
      setContractAddress(newDefault);
    } else if (!newDefault && !initialAddress) {
      setContractAddress('');
    }
  }, [selectedNetwork]);

  // Validate if an address is a contract
  const validateContract = async (address: string): Promise<boolean> => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const code = await provider.getCode(address);
      return code !== '0x' && code.length > 2;
    } catch (error) {
      return false;
    }
  };

  // Update contract address when using custom
  const handleUseCustomContract = async () => {
    if (!customAddress || !ethers.isAddress(customAddress)) {
      setCustomAddressError('Invalid address format');
      return;
    }

    setIsValidatingContract(true);
    setCustomAddressError(null);

    const isContract = await validateContract(customAddress);
    if (!isContract) {
      setCustomAddressError('Address is not a contract');
      setIsValidatingContract(false);
      return;
    }

    setContractAddress(customAddress);
    setIsValidatingContract(false);
  };

  // Reset to default contract for the selected network
  const handleUseDefaultContract = () => {
    const defaultAddr = DEFAULT_CONTRACT_ADDRESSES[selectedNetwork];
    setContractAddress(defaultAddr || '');
    setCustomAddress('');
    setCustomAddressError(null);
    setShowCustomContract(false);
  };

  const getReadContract = useCallback(() => {
    if (!contractAddress || !rpcUrl) return null;
    // Create a fresh provider with the current RPC URL
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(contractAddress, ERC721_ABI, provider);
  }, [contractAddress, rpcUrl, selectedNetwork]);

  const getWriteContract = useCallback(async () => {
    if (!contractAddress) {
      throw new Error('No contract address specified');
    }

    if (!walletConnected) {
      throw new Error('Please connect your wallet first');
    }

    // Check if ethereum provider exists
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask from https://metamask.io and refresh this page.');
    }

    // Check if MetaMask is ready
    if (!ethereum.isConnected?.()) {
      throw new Error('MetaMask is not connected. Please ensure MetaMask is unlocked and connected to this site.');
    }

    // Switch chain if necessary
    const targetChainIdHex = `0x${networkConfig.chainId.toString(16)}`;

    if (currentChain?.id !== networkConfig.chainId) {
      try {
        // Try to switch to the chain
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainIdHex }],
        });
      } catch (switchError: any) {
        // Chain doesn't exist, try to add it
        if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain') || switchError.message?.includes('wallet_addEthereumChain')) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainIdHex,
                chainName: networkConfig.name,
                nativeCurrency: networkConfig.chain.nativeCurrency,
                rpcUrls: [networkConfig.rpcUrl],
                blockExplorerUrls: [networkConfig.explorerUrl],
              }],
            });
          } catch (addError: any) {
            throw new Error(`Failed to add ${networkConfig.name} to wallet: ${addError.message}`);
          }
        } else if (switchError.code === 4001) {
          throw new Error('You rejected the network switch. Please try again and approve in MetaMask.');
        } else {
          throw new Error(`Failed to switch network: ${switchError.message || 'Unknown error'}`);
        }
      }
    }

    // Use ethers with window.ethereum directly for better compatibility
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);
    return contract;
  }, [contractAddress, walletConnected, currentChain?.id, networkConfig]);

  // Helper for RPC timeout protection
  const withTimeout = useCallback(async <T,>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`RPC call timeout after ${ms}ms`)), ms)
      )
    ]);
  }, []);

  // Helper to parse RPC/contract errors into user-friendly messages
  const parseContractError = useCallback((error: any): string => {
    const errorMessage = error?.message || error?.reason || String(error);

    if (errorMessage.includes('BAD_DATA') || errorMessage.includes('could not decode result data')) {
      return `Contract not found or not deployed on ${networkConfig.name}. The contract may only exist on a different network.`;
    }
    if (errorMessage.includes('call revert exception')) {
      return `Contract call failed. The contract may not support this function or is not properly deployed on ${networkConfig.name}.`;
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return `Network connection error. Please check your connection and try again.`;
    }
    if (errorMessage.includes('execution reverted')) {
      return `Transaction reverted: ${error?.reason || 'Unknown reason'}`;
    }

    return `Error: ${error?.reason || error?.shortMessage || errorMessage.slice(0, 100)}`;
  }, [networkConfig.name]);

  const fetchNFTInfo = useCallback(async () => {
    const contract = getReadContract();
    if (!contract) return;

    setContractError(null);

    try {
      const [name, symbol] = await withTimeout(Promise.all([
        contract.name().catch(() => null),
        contract.symbol().catch(() => null),
      ]), 8000);

      // Check if we got valid data
      if (name === null && symbol === null) {
        setContractError(`Unable to read contract data. The contract may not be deployed on ${networkConfig.name}.`);
        setIsConnected(false);
        return;
      }

      setCollectionName(name);
      setCollectionSymbol(symbol);

      if (userAddress) {
        try {
          const balance = await withTimeout(contract.balanceOf(userAddress), 5000);
          setUserBalance(balance.toString());
        } catch (balanceError: any) {
          setContractError(parseContractError(balanceError));
        }
      }
      
      // Fetch total supply for dashboard
      try {
        const supply = await withTimeout(contract.totalSupply(), 5000);
        setTotalSupply(supply.toString());
      } catch (supplyError: any) {
        console.warn('Could not fetch total supply:', supplyError);
      }
      
      setIsConnected(true);
    } catch (error: any) {
      setContractError(parseContractError(error));
      setIsConnected(false);
    }
  }, [getReadContract, userAddress, networkConfig.name, parseContractError]);

  const findMintedTokenId = useCallback((receipt: ethers.TransactionReceipt): string | undefined => {
    for (const log of receipt.logs) {
      try {
        const parsedLog = new ethers.Interface(ERC721_ABI).parseLog({
          data: log.data,
          topics: log.topics as string[],
        });
        if (!parsedLog || parsedLog.name !== 'Transfer') continue;
        const from = String(parsedLog.args[0]).toLowerCase();
        if (from === ethers.ZeroAddress) {
          return parsedLog.args[2].toString();
        }
      } catch {
        // Ignore unrelated logs
      }
    }
    return undefined;
  }, []);

  const fetchOwnedNFTs = useCallback(async () => {
    if (!userAddress || !contractAddress) {
      setGalleryItems([]);
      setGalleryError(null);
      return;
    }

    setIsGalleryLoading(true);
    setGalleryError(null);

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      const user = userAddress.toLowerCase();
      
      // Wrap queryFilter with timeout
      const toLogs = await withTimeout(contract.queryFilter(contract.filters.Transfer(null, userAddress), 0, 'latest'), 12000);
      const fromLogs = await withTimeout(contract.queryFilter(contract.filters.Transfer(userAddress, null), 0, 'latest'), 12000);

      const combined = [...toLogs, ...fromLogs].sort((a: any, b: any) => {
        if (a.blockNumber !== b.blockNumber) return Number(a.blockNumber) - Number(b.blockNumber);
        const aIndex = Number(a.index ?? a.logIndex ?? 0);
        const bIndex = Number(b.index ?? b.logIndex ?? 0);
        return aIndex - bIndex;
      });

      const ownedTokenIds = new Set<string>();
      for (const log of combined) {
        const parsedLog = contract.interface.parseLog(log);
        if (!parsedLog || parsedLog.name !== 'Transfer') continue;

        const from = String(parsedLog.args[0]).toLowerCase();
        const to = String(parsedLog.args[1]).toLowerCase();
        const tokenId = parsedLog.args[2].toString();

        if (to === user) ownedTokenIds.add(tokenId);
        if (from === user) ownedTokenIds.delete(tokenId);
      }

      const gallery = Array.from(ownedTokenIds)
        .sort((a, b) => Number(a) - Number(b))
        .map((tokenId) => ({ tokenId, owner: userAddress }));

      // Fetch metadata for each NFT
      const enrichedGallery = await Promise.all(
        gallery.map(async (item) => {
          try {
            // Get the tokenURI from the contract
            const uri = await withTimeout(contract.tokenURI(item.tokenId), 5000);
            
            // Fetch owner info
            const ownerAddress = await withTimeout(contract.ownerOf(item.tokenId), 5000);
            
            // Fetch and parse the metadata JSON
            const metadata = await fetchNFTMetadata(uri);
            
            return {
              ...item,
              uri,
              owner: ownerAddress, // Update with verified owner from contract
              name: metadata?.name || `Token #${item.tokenId}`,
              description: metadata?.description,
              image: metadata?.image,
            };
          } catch (error) {
            console.warn(`Failed to fetch metadata for token ${item.tokenId}:`, error);
            // Return item with fallback name even if metadata fetch fails
            return {
              ...item,
              name: `Token #${item.tokenId}`,
            };
          }
        })
      );

      setGalleryItems(enrichedGallery);
    } catch (error) {
      setGalleryError(normalizeErrorMessage(error));
      setGalleryItems([]);
    } finally {
      setIsGalleryLoading(false);
    }
  }, [contractAddress, rpcUrl, userAddress, withTimeout]);

  useEffect(() => {
    if (!mintSuccess.visible) return;
    const timer = setTimeout(() => setMintSuccess({ visible: false }), 4200);
    return () => clearTimeout(timer);
  }, [mintSuccess.visible]);

  // Only fetch gallery when explicitly requested or after successful mint
  useEffect(() => {
    if (!showGallery && !mintSuccess.visible) return;
    fetchOwnedNFTs();
  }, [fetchOwnedNFTs, contractAddress, selectedNetwork, userAddress, showGallery, mintSuccess.visible]);

  useEffect(() => {
    if (txStatus.status === 'success') fetchOwnedNFTs();
  }, [txStatus.status, txStatus.hash, fetchOwnedNFTs]);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [galleryItems.length, isConnected, walletConnected, selectedNetwork, txStatus.status]);

  useEffect(() => {
    if (contractAddress && rpcUrl) {
      fetchNFTInfo();
    }
  }, [contractAddress, rpcUrl, fetchNFTInfo, userAddress]);

  const handleTransaction = async (
    operation: () => Promise<ethers.TransactionResponse>,
    successMessage: string,
    onSuccess?: (receipt: ethers.TransactionReceipt, txHash: string) => void
  ) => {
    if (txStatus.status === 'pending') {
      return;
    }

    if (!walletConnected) {
      setTxStatus({ status: 'error', message: 'Please connect your wallet first' });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
      return;
    }

    try {
      setTxStatus({ status: 'pending', message: 'Please confirm in wallet...' });
      const tx = await operation();
      setTxStatus({ status: 'pending', message: 'Transaction pending...', hash: tx.hash });
      const receipt = await tx.wait();
      setTxStatus({ status: 'success', message: successMessage, hash: tx.hash });
      fetchNFTInfo();
      if (receipt) onSuccess?.(receipt, tx.hash);
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
    }
    setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 7000);
  };

  const handleMint = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract) return;
      handleTransaction(
        () => contract.mint(),
        'NFT minted to your wallet.',
        (receipt, txHash) => {
          const tokenId = findMintedTokenId(receipt);
          setMintSuccess({ visible: true, tokenId, hash: txHash });
          fetchOwnedNFTs();
        }
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const handleMintTo = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract || !mintToAddress) return;
      handleTransaction(
        () => contract.mintTo(mintToAddress),
        'NFT minted successfully.',
        (receipt, txHash) => {
          const tokenId = findMintedTokenId(receipt);
          setMintSuccess({ visible: true, tokenId, hash: txHash });
          fetchOwnedNFTs();
        }
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const handleSafeMint = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract || !safeMintToAddress) return;
      handleTransaction(
        () => contract['safeMint(address)'](safeMintToAddress),
        'NFT safely minted.',
        (receipt, txHash) => {
          const tokenId = findMintedTokenId(receipt);
          setMintSuccess({ visible: true, tokenId, hash: txHash });
          fetchOwnedNFTs();
        }
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const handleTransfer = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract || !transferFrom || !transferTo || !transferTokenId) return;
      handleTransaction(
        () => contract['safeTransferFrom(address,address,uint256)'](transferFrom, transferTo, transferTokenId),
        `NFT #${transferTokenId} transferred!`
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const handleApprove = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract || !approveAddress || !approveTokenId) return;
      handleTransaction(
        () => contract.approve(approveAddress, approveTokenId),
        `Approval set for NFT #${approveTokenId}!`
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const handleSetApprovalForAll = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract || !operatorAddress) return;
      handleTransaction(
        () => contract.setApprovalForAll(operatorAddress, operatorApproved),
        `Operator ${operatorApproved ? 'approved' : 'revoked'}!`
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const handleBurn = async () => {
    try {
      const contract = await getWriteContract();
      if (!contract || !burnTokenId) return;
      handleTransaction(
        () => contract.burn(burnTokenId),
        `NFT #${burnTokenId} burned!`
      );
    } catch (error: any) {
      setTxStatus({ status: 'error', message: normalizeErrorMessage(error) });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  const checkOwnerOf = async () => {
    const contract = getReadContract();
    if (!contract || !ownerOfTokenId) return;
    try {
      const owner = await contract.ownerOf(ownerOfTokenId);
      setOwnerOfResult(owner);
    } catch {
      setOwnerOfResult('Token does not exist');
    }
  };

  const checkBalance = async () => {
    const contract = getReadContract();
    if (!contract || !balanceCheckAddress) return;
    try {
      const balance = await contract.balanceOf(balanceCheckAddress);
      setBalanceCheckResult(balance.toString());
    } catch (error: any) {
      setBalanceCheckResult(normalizeErrorMessage(error));
    }
  };

  const checkGetApproved = async () => {
    const contract = getReadContract();
    if (!contract || !getApprovedTokenId) return;
    try {
      const approved = await contract.getApproved(getApprovedTokenId);
      setGetApprovedResult(approved);
    } catch {
      setGetApprovedResult('Token does not exist');
    }
  };

  const checkApprovalForAll = async () => {
    const contract = getReadContract();
    if (!contract || !approvalCheckOwner || !approvalCheckOperator) return;
    try {
      const isApproved = await contract.isApprovedForAll(approvalCheckOwner, approvalCheckOperator);
      setApprovalCheckResult(isApproved);
    } catch {
      setApprovalCheckResult(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {mintSuccess.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMintSuccess({ visible: false })} />
          <div className="relative w-full max-w-sm rounded-2xl border border-emerald-400/40 bg-forge-surface shadow-2xl p-5 success-popover">
            <button
              onClick={() => setMintSuccess({ visible: false })}
              className="absolute right-3 top-3 text-forge-muted hover:text-white transition-colors"
              aria-label="Close success dialog"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Stars className="w-4 h-4 text-emerald-300" />
              <p className="text-sm font-semibold text-emerald-200">Mint Successful</p>
            </div>
            <p className="text-xs text-forge-muted mb-3">
              Your NFT is now on-chain and visible in your gallery.
            </p>
            {mintSuccess.tokenId && (
              <p className="text-xs text-white mb-1">
                Token ID: <span className="font-mono text-emerald-300">#{mintSuccess.tokenId}</span>
              </p>
            )}
            {mintSuccess.hash && (
              <a
                href={`${explorerUrl}/tx/${mintSuccess.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-violet-300 hover:text-violet-200"
              >
                View transaction on explorer
              </a>
            )}

            <div className="confetti-wrap pointer-events-none">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    left: `${piece.left}%`,
                    animationDelay: `${piece.delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="p-3 rounded-lg border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-transparent reveal-on-scroll">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white">
            {collectionName || 'ERC-721'} {collectionSymbol ? `(${collectionSymbol})` : 'NFT'}
          </span>
        </div>
        <p className="text-[10px] text-forge-muted">Stylus NFT Contract Interaction</p>
      </div>

      {/* Wallet Status */}
      <div className={cn(
        'p-2.5 rounded-lg border reveal-on-scroll',
        walletConnected ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'
      )}>
        <div className="flex items-center gap-2">
          <Wallet className={cn('w-3.5 h-3.5', walletConnected ? 'text-green-400' : 'text-amber-400')} />
          {walletConnected ? (
            <span className="text-[10px] text-green-300">
              Connected: <code className="text-green-400">{userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</code>
            </span>
          ) : (
            <span className="text-[10px] text-amber-300">Connect wallet via Wallet Auth node for write ops</span>
          )}
        </div>
      </div>

      {/* Network Selector */}
      <div className="space-y-1.5 reveal-on-scroll">
        <label className="text-xs text-forge-muted flex items-center gap-1.5">
          <Globe className="w-3 h-3" /> Network
        </label>
        <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as typeof selectedNetwork)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                {getLogoForNetwork(selectedNetwork, logos) && (
                  <img src={getLogoForNetwork(selectedNetwork, logos)} alt="" width={16} height={16} className="rounded" />
                )}
                <span>{NETWORKS[selectedNetwork].name}</span>
                {NETWORKS[selectedNetwork].chain.testnet && (
                  <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Testnet</span>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {NETWORK_IDS.map((net) => (
              <SelectItem key={net} value={net}>
                <div className="flex items-center gap-2">
                  {getLogoForNetwork(net, logos) && (
                    <img src={getLogoForNetwork(net, logos)} alt="" width={16} height={16} className="rounded" />
                  )}
                  <span>{NETWORKS[net].name}</span>
                  {NETWORKS[net].chain.testnet && (
                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Testnet</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contract Info */}
      <div className="p-2.5 rounded-lg bg-forge-bg/50 border border-forge-border/30 reveal-on-scroll">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-forge-muted">Contract:</span>
            {isUsingDefaultContract && (
              <span className="text-[8px] px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded">Default</span>
            )}
          </div>
          <a
            href={`${displayExplorerUrl}/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-violet-400 hover:underline flex items-center gap-1"
          >
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Custom Contract Toggle */}
      <button
        onClick={() => setShowCustomContract(!showCustomContract)}
        className="w-full flex items-center justify-between px-3 py-2 bg-forge-bg/50 border border-forge-border/30 rounded-lg text-xs text-forge-muted hover:text-white transition-colors"
      >
        <span>Use Custom Contract</span>
        {showCustomContract ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showCustomContract && (
        <div className="p-3 rounded-lg bg-forge-bg/30 border border-forge-border/30 space-y-2">
          <input
            type="text"
            value={customAddress}
            onChange={(e) => {
              setCustomAddress(e.target.value);
              setCustomAddressError(null);
            }}
            placeholder="0x..."
            className={cn(
              "w-full px-3 py-2 bg-forge-bg border rounded-lg text-xs text-white placeholder-forge-muted focus:outline-none",
              customAddressError ? "border-red-500/50" : "border-forge-border/50 focus:border-violet-500/50"
            )}
          />
          {customAddressError && (
            <p className="text-[10px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {customAddressError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleUseCustomContract}
              disabled={!customAddress || isValidatingContract}
              className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-medium disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {isValidatingContract ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Validating...
                </>
              ) : (
                'Use Custom'
              )}
            </button>
            <button
              onClick={handleUseDefaultContract}
              className="flex-1 py-1.5 bg-forge-border hover:bg-forge-muted/20 text-white rounded text-[10px] font-medium"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      <button
        onClick={fetchNFTInfo}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Refresh
      </button>

            {/* Contract Error Banner */}
      {contractError && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 reveal-on-scroll">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-red-300 font-medium">Contract Error</p>
              <p className="text-[10px] text-red-300/90 mt-1">{contractError}</p>
            </div>
            <button
              onClick={() => setContractError(null)}
              className="text-red-400/60 hover:text-red-300 text-xs"
              aria-label="Dismiss contract error"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {txStatus.status !== 'idle' && (
        <div className={cn(
          'rounded-lg p-2.5 border flex items-start gap-2 reveal-on-scroll',
          txStatus.status === 'pending' && 'bg-blue-500/10 border-blue-500/30',
          txStatus.status === 'success' && 'bg-emerald-500/10 border-emerald-500/30',
          txStatus.status === 'error' && 'bg-red-500/10 border-red-500/30'
        )}>
          {txStatus.status === 'pending' && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />}
          {txStatus.status === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          {txStatus.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-[10px] font-medium truncate',
              txStatus.status === 'pending' && 'text-blue-300',
              txStatus.status === 'success' && 'text-emerald-300',
              txStatus.status === 'error' && 'text-red-300'
            )}>{txStatus.message}</p>
            {txStatus.status === 'pending' && (
              <div className="mt-2 h-1 w-full rounded-full bg-blue-500/20 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-blue-400 tx-loading-bar" />
              </div>
            )}
            {txStatus.hash && (
              <a href={`${explorerUrl}/tx/${txStatus.hash}`} target="_blank" rel="noopener noreferrer"
                className="text-[9px] text-forge-muted hover:text-white flex items-center gap-1">
                Explorer <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Data Dashboard - Etherscan + NFT Dashboard Style */}
      {isConnected && walletConnected && showDataDashboard && (
        <div className="space-y-3 reveal-on-scroll">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-white">Dashboard</span>
            </div>
            <button
              onClick={() => setShowDataDashboard(!showDataDashboard)}
              className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              {showDataDashboard ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* User Balance */}
            <div className="p-3 rounded-lg bg-forge-bg/50 border border-violet-400/30 hover:border-violet-400/50 transition-colors">
              <p className="text-[10px] text-forge-muted mb-1.5">Your Balance</p>
              <p className="text-lg font-bold text-violet-300">{userBalance || '0'}</p>
              <p className="text-[9px] text-forge-muted mt-1">NFTs owned</p>
            </div>

            {/* Total Supply */}
            <div className="p-3 rounded-lg bg-forge-bg/50 border border-cyan-400/30 hover:border-cyan-400/50 transition-colors">
              <p className="text-[10px] text-forge-muted mb-1.5">Total Supply</p>
              <p className="text-lg font-bold text-cyan-300">{totalSupply || '0'}</p>
              <p className="text-[9px] text-forge-muted mt-1">Total minted</p>
            </div>

            {/* Collection Info */}
            {collectionName && (
              <div className="p-3 rounded-lg bg-forge-bg/50 border border-indigo-400/30 hover:border-indigo-400/50 transition-colors col-span-2">
                <p className="text-[10px] text-forge-muted mb-1.5">Collection</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-300">{collectionName}</span>
                  {collectionSymbol && (
                    <span className="text-[9px] px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
                      {collectionSymbol}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Address */}
            {userAddress && (
              <div className="p-3 rounded-lg bg-forge-bg/50 border border-emerald-400/30 hover:border-emerald-400/50 transition-colors col-span-2">
                <p className="text-[10px] text-forge-muted mb-1.5">Connected Wallet</p>
                <a
                  href={`${explorerUrl}/address/${userAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-emerald-300 hover:text-emerald-200 flex items-center gap-1 group"
                >
                  {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            )}
          </div>

          {/* Owned NFTs Count */}
          {galleryItems.length > 0 && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] text-forge-muted">Owned NFTs Listed</span>
                </div>
                <span className="text-sm font-bold text-violet-300">{galleryItems.length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NFT Stats */}
      {isConnected && walletConnected && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-forge-bg/50 border border-forge-border/30">
            <div className="flex items-center gap-1.5">
              <Image className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] text-forge-muted">Your NFTs</span>
            </div>
            <span className="text-xs font-medium text-white">{userBalance || '0'}</span>
          </div>
        </div>
      )}

      {/* NFT Gallery */}
      {isConnected && walletConnected && (
        <div className="space-y-3 reveal-on-scroll">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-white">NFT Gallery</span>
            </div>
            <button
              onClick={fetchOwnedNFTs}
              className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              Reload
            </button>
          </div>

          {isGalleryLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="h-36 rounded-xl border border-forge-border/40 bg-forge-bg/40 animate-pulse" />
              ))}
            </div>
          )}

          {galleryError && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200">
              {galleryError}
            </div>
          )}

          {!isGalleryLoading && !galleryError && galleryItems.length === 0 && (
            <div className="p-4 rounded-xl border border-forge-border/40 bg-forge-bg/40 text-[11px] text-forge-muted text-center">
              No NFTs in this wallet yet. Mint one to see it here.
            </div>
          )}

          {!isGalleryLoading && galleryItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 nft-gallery-grid">
              {galleryItems.map((item) => (
                <article key={item.tokenId} className="nft-card reveal-on-scroll">
                  <div className="nft-card-inner">
                    {/* Front of card - displays image and name */}
                    <div className="nft-card-face nft-card-front border border-forge-border/40 rounded-xl p-3 flex flex-col">
                      {/* NFT Image or gradient fallback */}
                      <div className="h-24 rounded-lg mb-3 shadow-lg overflow-hidden bg-cover bg-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => {
                            e.currentTarget.style.background = gradientForToken(item.tokenId);
                            e.currentTarget.style.backgroundImage = 'none';
                          }} />
                        ) : (
                          <div style={{ background: gradientForToken(item.tokenId) }} className="w-full h-full" />
                        )}
                      </div>
                      
                      {/* NFT name and description preview */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-white font-semibold truncate">{item.name || `Token #${item.tokenId}`}</p>
                          {item.description && (
                            <p className="text-[10px] text-forge-muted mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <p className="text-[10px] text-forge-muted mt-2">{networkConfig.name}</p>
                      </div>
                    </div>

                    {/* Back of card - displays owner and contract info */}
                    <div className="nft-card-face nft-card-back border border-violet-400/40 rounded-xl p-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Owner Info */}
                        <div>
                          <p className="text-[9px] text-violet-200 font-medium upper case mb-1">OWNER</p>
                          <a
                            href={`${explorerUrl}/address/${item.owner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-white font-mono hover:text-violet-200 flex items-center gap-1 group break-all"
                          >
                            {item.owner.slice(0, 8)}...{item.owner.slice(-6)}
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </a>
                        </div>

                        {/* Token ID */}
                        <div>
                          <p className="text-[9px] text-violet-200 font-medium mb-1">TOKEN ID</p>
                          <p className="text-[10px] text-cyan-300 font-mono font-bold">#{item.tokenId}</p>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="space-y-2 border-t border-violet-400/20 pt-2">
                        {item.uri && (
                          <a href={item.uri} target="_blank" rel="noopener noreferrer"
                            className="text-[9px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 group">
                            View metadata
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        <a href={`${explorerUrl}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer"
                          className="text-[9px] text-violet-300 hover:text-violet-200 flex items-center gap-1 group">
                          Contract
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Write Operations */}
      {isConnected && walletConnected && (
        <div className="space-y-3 reveal-on-scroll">
          <div className="flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-white">Write Operations</span>
          </div>

          {/* Mint (to self) */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-medium text-violet-400">Mint (to yourself)</span>
            </div>
            <button onClick={handleMint} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              Mint NFT
            </button>
          </div>

          {/* Mint To */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-fuchsia-400" />
              <span className="text-[10px] font-medium text-fuchsia-400">Mint To Address</span>
            </div>
            <input type="text" value={mintToAddress} onChange={(e) => setMintToAddress(e.target.value)}
              placeholder="To Address (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={handleMintTo} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              Mint To
            </button>
          </div>

          {/* Safe Mint */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">Safe Mint</span>
            </div>
            <input type="text" value={safeMintToAddress} onChange={(e) => setSafeMintToAddress(e.target.value)}
              placeholder="To Address (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={handleSafeMint} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              Safe Mint
            </button>
          </div>

          {/* Safe Transfer */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <span className="text-[10px] font-medium text-cyan-400">Safe Transfer</span>
            <input type="text" value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)}
              placeholder="From (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <input type="text" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}
              placeholder="To (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <input type="number" value={transferTokenId} onChange={(e) => setTransferTokenId(e.target.value)}
              placeholder="Token ID"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={handleTransfer} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              Transfer NFT
            </button>
          </div>

          {/* Approve */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">Approve Token</span>
            </div>
            <input type="text" value={approveAddress} onChange={(e) => setApproveAddress(e.target.value)}
              placeholder="Approved Address (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <input type="number" value={approveTokenId} onChange={(e) => setApproveTokenId(e.target.value)}
              placeholder="Token ID"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={handleApprove} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              Approve
            </button>
          </div>

          {/* Set Approval For All */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-medium text-indigo-400">Set Approval For All</span>
            </div>
            <input type="text" value={operatorAddress} onChange={(e) => setOperatorAddress(e.target.value)}
              placeholder="Operator (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={operatorApproved} onChange={(e) => setOperatorApproved(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-forge-bg border-forge-border" />
              <span className="text-[10px] text-forge-muted">Grant Approval</span>
            </label>
            <button onClick={handleSetApprovalForAll} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              {operatorApproved ? 'Grant' : 'Revoke'} Access
            </button>
          </div>

          {/* Burn */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-medium text-orange-400">Burn NFT</span>
            </div>
            <input type="number" value={burnTokenId} onChange={(e) => setBurnTokenId(e.target.value)}
              placeholder="Token ID"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={handleBurn} disabled={txStatus.status === 'pending'}
              className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-[10px] font-medium disabled:opacity-50">
              Burn
            </button>
          </div>
        </div>
      )}

      {/* Read Operations */}
      {isConnected && (
        <div className="space-y-3 reveal-on-scroll">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-medium text-white">Read Operations</span>
          </div>

          {/* Owner Of */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <span className="text-[10px] font-medium text-violet-400">Owner Of</span>
            <input type="number" value={ownerOfTokenId} onChange={(e) => setOwnerOfTokenId(e.target.value)}
              placeholder="Token ID"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={checkOwnerOf}
              className="w-full py-1.5 bg-violet-600/50 hover:bg-violet-600 text-white rounded text-[10px] font-medium">
              Check Owner
            </button>
            {ownerOfResult && (
              <div className="p-2 bg-violet-500/10 border border-violet-500/30 rounded">
                <p className="text-[9px] text-violet-300 mb-0.5">Owner:</p>
                <p className="text-[10px] font-mono text-white break-all">{ownerOfResult}</p>
              </div>
            )}
          </div>

          {/* Balance Of */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <span className="text-[10px] font-medium text-fuchsia-400">Balance Of</span>
            <input type="text" value={balanceCheckAddress} onChange={(e) => setBalanceCheckAddress(e.target.value)}
              placeholder="Address (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={checkBalance}
              className="w-full py-1.5 bg-fuchsia-600/50 hover:bg-fuchsia-600 text-white rounded text-[10px] font-medium">
              Check Balance
            </button>
            {balanceCheckResult && (
              <div className="p-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded">
                <p className="text-[10px] text-fuchsia-300">NFTs owned: <span className="font-medium text-white">{balanceCheckResult}</span></p>
              </div>
            )}
          </div>

          {/* Get Approved */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <span className="text-[10px] font-medium text-blue-400">Get Approved</span>
            <input type="number" value={getApprovedTokenId} onChange={(e) => setGetApprovedTokenId(e.target.value)}
              placeholder="Token ID"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={checkGetApproved}
              className="w-full py-1.5 bg-blue-600/50 hover:bg-blue-600 text-white rounded text-[10px] font-medium">
              Check Approved
            </button>
            {getApprovedResult && (
              <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-[9px] text-blue-300 mb-0.5">Approved:</p>
                <p className="text-[10px] font-mono text-white break-all">{getApprovedResult}</p>
              </div>
            )}
          </div>

          {/* Is Approved For All */}
          <div className="p-3 rounded-lg bg-forge-bg/50 border border-forge-border/30 space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-medium text-indigo-400">Is Approved For All</span>
            </div>
            <input type="text" value={approvalCheckOwner} onChange={(e) => setApprovalCheckOwner(e.target.value)}
              placeholder="Owner (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <input type="text" value={approvalCheckOperator} onChange={(e) => setApprovalCheckOperator(e.target.value)}
              placeholder="Operator (0x...)"
              className="w-full px-2.5 py-1.5 bg-forge-bg border border-forge-border/50 rounded text-xs text-white placeholder-forge-muted focus:outline-none" />
            <button onClick={checkApprovalForAll}
              className="w-full py-1.5 bg-indigo-600/50 hover:bg-indigo-600 text-white rounded text-[10px] font-medium">
              Check Approval
            </button>
            {approvalCheckResult !== null && (
              <div className={cn(
                'p-2 rounded border',
                approvalCheckResult ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
              )}>
                <p className={cn('text-[10px] font-medium', approvalCheckResult ? 'text-emerald-300' : 'text-red-300')}>
                  {approvalCheckResult ? '✓ Operator is approved' : '✗ Operator is not approved'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

