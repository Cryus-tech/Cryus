import { BlockchainType } from '../bridge/bridgeService';

/**
 * Asset type enumeration
 */
export enum AssetType {
  NATIVE = 'native',       // Chain's native asset (like ETH, SOL, BNB)
  TOKEN = 'token',         // Standard tokens (like ERC20, SPL)
  NFT = 'nft'              // Non-fungible tokens (like ERC721, ERC1155)
}

/**
 * Token standard enumeration
 */
export enum TokenStandard {
  ERC20 = 'ERC20',         // Ethereum ERC20
  ERC721 = 'ERC721',       // Ethereum ERC721
  ERC1155 = 'ERC1155',     // Ethereum ERC1155
  SPL = 'SPL',             // Solana SPL token
  BEP20 = 'BEP20'          // BNB Chain BEP20
}

/**
 * Base asset interface
 */
export interface AssetBase {
  name: string;            // Asset name
  symbol: string;          // Asset symbol
  logo?: string;           // Asset logo URL
  type: AssetType;         // Asset type
  decimals?: number;       // Decimal places (valid for tokens)
  blockchain: BlockchainType; // Blockchain type
}

/**
 * Native asset interface
 */
export interface NativeAsset extends AssetBase {
  type: AssetType.NATIVE;
  decimals: number;        // Native assets usually have fixed decimal places
}

/**
 * Token asset interface
 */
export interface TokenAsset extends AssetBase {
  type: AssetType.TOKEN;
  address: string;         // Token contract address
  decimals: number;        // Token decimal places
  standard: TokenStandard; // Token standard
}

/**
 * NFT asset interface
 */
export interface NFTAsset extends AssetBase {
  type: AssetType.NFT;
  address: string;         // NFT contract address
  tokenId?: string;        // Optional specific NFT ID (if describing a specific NFT)
  standard: TokenStandard; // NFT standard (like ERC721, ERC1155)
  collection?: string;     // Optional collection name
}

/**
 * Unified asset type
 */
export type Asset = NativeAsset | TokenAsset | NFTAsset;

/**
 * Cross-chain mapping relationship
 * Describes mapping of the same asset across different chains
 */
export interface CrossChainMapping {
  id: string;                  // Unique identifier
  name: string;                // Mapping name (e.g., "USDC Cross-Chain Mapping")
  assets: Asset[];             // Assets included in the mapping
  description?: string;        // Optional description
  officialBridgeUrl?: string;  // Official bridge URL (if available)
}

/**
 * Asset mapping service class
 * Manages asset mapping relationships across different blockchains
 */
export class AssetMappingService {
  private nativeAssets: Map<BlockchainType, NativeAsset> = new Map();
  private tokenAssets: Map<string, TokenAsset> = new Map();
  private nftAssets: Map<string, NFTAsset> = new Map();
  private crossChainMappings: Map<string, CrossChainMapping> = new Map();
  
  /**
   * Constructor
   * Initializes basic native assets
   */
  constructor() {
    // Initialize common native assets
    this.initializeNativeAssets();
  }
  
  /**
   * Initialize native assets for supported blockchains
   * @private
   */
  private initializeNativeAssets(): void {
    // Ethereum native asset
    this.nativeAssets.set(BlockchainType.ETHEREUM, {
      name: 'Ethereum',
      symbol: 'ETH',
      logo: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/13c43/eth-diamond-black.png',
      type: AssetType.NATIVE,
      decimals: 18,
      blockchain: BlockchainType.ETHEREUM
    });
    
    // Solana native asset
    this.nativeAssets.set(BlockchainType.SOLANA, {
      name: 'Solana',
      symbol: 'SOL',
      logo: 'https://solana.com/src/img/branding/solanaLogoMark.svg',
      type: AssetType.NATIVE,
      decimals: 9,
      blockchain: BlockchainType.SOLANA
    });
    
    // BNB Chain native asset
    this.nativeAssets.set(BlockchainType.BNB, {
      name: 'BNB',
      symbol: 'BNB',
      logo: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
      type: AssetType.NATIVE,
      decimals: 18,
      blockchain: BlockchainType.BNB
    });

    // Initialize some well-known cross-chain mappings
    this.initializePredefinedMappings();
  }

  /**
   * Initialize predefined cross-chain asset mappings
   * @private
   */
  private initializePredefinedMappings(): void {
    // Register USDC across chains
    const ethUSDC: TokenAsset = this.registerTokenAsset({
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      standard: TokenStandard.ERC20,
      blockchain: BlockchainType.ETHEREUM,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      type: AssetType.TOKEN
    });

    const solUSDC: TokenAsset = this.registerTokenAsset({
      name: 'USD Coin',
      symbol: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      standard: TokenStandard.SPL,
      blockchain: BlockchainType.SOLANA,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      type: AssetType.TOKEN
    });

    const bscUSDC: TokenAsset = this.registerTokenAsset({
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 18,
      standard: TokenStandard.BEP20,
      blockchain: BlockchainType.BNB,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      type: AssetType.TOKEN
    });

    // Create USDC cross-chain mapping
    this.createCrossChainMapping({
      id: 'usdc-cross-chain',
      name: 'USDC Cross-Chain',
      assets: [ethUSDC, solUSDC, bscUSDC],
      description: 'USD Coin (USDC) mapped across Ethereum, Solana, and BNB Chain',
      officialBridgeUrl: 'https://www.circle.com/en/usdc-multichain'
    });
  }
  
  /**
   * Get all native assets
   * @returns Array of native assets
   */
  public getAllNativeAssets(): NativeAsset[] {
    return Array.from(this.nativeAssets.values());
  }
  
  /**
   * Get native asset by blockchain type
   * @param blockchain Blockchain type
   * @returns Native asset or undefined if not found
   */
  public getNativeAsset(blockchain: BlockchainType): NativeAsset | undefined {
    return this.nativeAssets.get(blockchain);
  }
  
  /**
   * Register a token asset
   * @param asset Token asset data
   * @returns Registered token asset
   */
  public registerTokenAsset(asset: TokenAsset): TokenAsset {
    const key = `${asset.blockchain}-${asset.address}`;
    
    // First, validate the asset data
    if (!asset.name || !asset.symbol || !asset.address) {
      throw new Error('Token asset must have name, symbol, and address');
    }
    
    // Check if this asset is already registered
    if (this.tokenAssets.has(key)) {
      return this.tokenAssets.get(key) as TokenAsset;
    }
    
    // Store the asset
    this.tokenAssets.set(key, asset);
    return asset;
  }
  
  /**
   * Register an NFT asset
   * @param nft NFT asset information
   * @returns Registered NFT asset
   */
  registerNFTAsset(nft: NFTAsset): NFTAsset {
    const key = this.getNFTKey(nft.blockchain, nft.address, nft.tokenId);
    this.nftAssets.set(key, nft);
    return nft;
  }
  
  /**
   * Get NFT asset information
   * @param blockchain Blockchain type
   * @param address NFT contract address
   * @param tokenId Optional specific NFT ID
   * @returns NFT asset information or undefined
   */
  getNFTAsset(blockchain: BlockchainType, address: string, tokenId?: string): NFTAsset | undefined {
    const key = this.getNFTKey(blockchain, address, tokenId);
    return this.nftAssets.get(key);
  }
  
  /**
   * Create a cross-chain asset mapping
   * @param mapping Cross-chain mapping information
   * @returns Created cross-chain mapping
   */
  createCrossChainMapping(mapping: CrossChainMapping): CrossChainMapping {
    // Validate mapping has at least two assets and they are from different chains
    if (mapping.assets.length < 2) {
      throw new Error('Cross-chain mapping requires at least two assets');
    }
    
    const blockchains = new Set(mapping.assets.map(asset => asset.blockchain));
    if (blockchains.size < 2) {
      throw new Error('Cross-chain mapping requires assets from different chains');
    }
    
    this.crossChainMappings.set(mapping.id, mapping);
    return mapping;
  }
  
  /**
   * Get cross-chain asset mapping
   * @param id Mapping ID
   * @returns Cross-chain mapping or undefined
   */
  getCrossChainMapping(id: string): CrossChainMapping | undefined {
    return this.crossChainMappings.get(id);
  }
  
  /**
   * Find all cross-chain mappings containing a specific asset
   * @param blockchain Blockchain type
   * @param address Asset address (valid for tokens and NFTs)
   * @param tokenId Optional specific NFT ID
   * @returns All cross-chain mappings containing the asset
   */
  findMappingsForAsset(
    blockchain: BlockchainType,
    address?: string,
    tokenId?: string
  ): CrossChainMapping[] {
    const results: CrossChainMapping[] = [];
    
    // For native assets
    if (!address) {
      for (const mapping of this.crossChainMappings.values()) {
        if (mapping.assets.some(asset => 
          asset.type === AssetType.NATIVE && asset.blockchain === blockchain
        )) {
          results.push(mapping);
        }
      }
      return results;
    }
    
    // For tokens and NFTs
    for (const mapping of this.crossChainMappings.values()) {
      if (mapping.assets.some(asset => 
        asset.blockchain === blockchain && 
        (asset.type === AssetType.TOKEN || asset.type === AssetType.NFT) &&
        (asset as TokenAsset | NFTAsset).address === address &&
        (asset.type !== AssetType.NFT || tokenId === undefined || (asset as NFTAsset).tokenId === tokenId)
      )) {
        results.push(mapping);
      }
    }
    
    return results;
  }
  
  /**
   * Find corresponding asset of an asset on another blockchain
   * @param sourceBlockchain Source blockchain
   * @param targetBlockchain Target blockchain
   * @param address Asset address (undefined for native assets)
   * @param tokenId Optional specific NFT ID
   * @returns Corresponding asset on target blockchain, or undefined if not found
   */
  findMappedAsset(
    sourceBlockchain: BlockchainType,
    targetBlockchain: BlockchainType,
    address?: string,
    tokenId?: string
  ): Asset | undefined {
    // Get all mappings containing source asset
    const mappings = this.findMappingsForAsset(sourceBlockchain, address, tokenId);
    
    // Traverse mappings, look for corresponding asset on target blockchain
    for (const mapping of mappings) {
      // Find source asset
      const sourceAsset = mapping.assets.find(asset => 
        asset.blockchain === sourceBlockchain &&
        (
          (asset.type === AssetType.NATIVE && !address) ||
          ((asset.type === AssetType.TOKEN || asset.type === AssetType.NFT) && 
           (asset as TokenAsset | NFTAsset).address === address &&
           (asset.type !== AssetType.NFT || tokenId === undefined || (asset as NFTAsset).tokenId === tokenId))
        )
      );
      
      if (!sourceAsset) continue;
      
      // Find target asset
      const targetAsset = mapping.assets.find(asset => 
        asset.blockchain === targetBlockchain
      );
      
      if (targetAsset) {
        return targetAsset;
      }
    }
    
    return undefined;
  }
  
  /**
   * Get predefined cross-chain token mappings
   * Initialize some common cross-chain token mappings
   */
  getPresetTokenMappings(): CrossChainMapping[] {
    const mappings: CrossChainMapping[] = [];
    
    // USDC cross-chain mapping
    mappings.push({
      id: 'usdc-mapping',
      name: 'USDC Cross-Chain Mapping',
      description: 'USD Coin mapping across different chains',
      officialBridgeUrl: 'https://www.circle.com/en/usdc',
      assets: [
        {
          name: 'USD Coin',
          symbol: 'USDC',
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          type: AssetType.TOKEN,
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Ethereum USDC
          decimals: 6,
          standard: TokenStandard.ERC20,
          blockchain: BlockchainType.ETHEREUM
        },
        {
          name: 'USD Coin',
          symbol: 'USDC',
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          type: AssetType.TOKEN,
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Solana USDC
          decimals: 6,
          standard: TokenStandard.SPL,
          blockchain: BlockchainType.SOLANA
        },
        {
          name: 'USD Coin',
          symbol: 'USDC',
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          type: AssetType.TOKEN,
          address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // BNB Chain USDC
          decimals: 18,
          standard: TokenStandard.BEP20,
          blockchain: BlockchainType.BNB
        }
      ]
    });
    
    // WBTC cross-chain mapping
    mappings.push({
      id: 'wbtc-mapping',
      name: 'Wrapped BTC Cross-Chain Mapping',
      description: 'Wrapped Bitcoin mapping across different chains',
      assets: [
        {
          name: 'Wrapped Bitcoin',
          symbol: 'WBTC',
          logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
          type: AssetType.TOKEN,
          address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // Ethereum WBTC
          decimals: 8,
          standard: TokenStandard.ERC20,
          blockchain: BlockchainType.ETHEREUM
        },
        {
          name: 'Wrapped Bitcoin',
          symbol: 'WBTC',
          logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
          type: AssetType.TOKEN,
          address: '7RfNz2j8Dc5LD7NkJ4pT5XtHJmX8VNuSA588k9EyLmn', // Solana WBTC (assumed address)
          decimals: 8,
          standard: TokenStandard.SPL,
          blockchain: BlockchainType.SOLANA
        },
        {
          name: 'Wrapped Bitcoin',
          symbol: 'WBTC',
          logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
          type: AssetType.TOKEN,
          address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BNB Chain WBTC (BTCB)
          decimals: 18,
          standard: TokenStandard.BEP20,
          blockchain: BlockchainType.BNB
        }
      ]
    });
    
    return mappings;
  }
  
  /**
   * Batch load predefined asset mappings
   */
  loadPresetMappings(): void {
    const presetMappings = this.getPresetTokenMappings();
    for (const mapping of presetMappings) {
      this.crossChainMappings.set(mapping.id, mapping);
      
      // Register token assets in the mapping
      for (const asset of mapping.assets) {
        if (asset.type === AssetType.TOKEN) {
          this.registerTokenAsset(asset as TokenAsset);
        } else if (asset.type === AssetType.NFT) {
          this.registerNFTAsset(asset as NFTAsset);
        }
      }
    }
  }
  
  /**
   * Get token key
   * @param blockchain Blockchain type
   * @param address Token address
   */
  private getTokenKey(blockchain: BlockchainType, address: string): string {
    return `${blockchain}:${address.toLowerCase()}`;
  }
  
  /**
   * Get NFT key
   * @param blockchain Blockchain type
   * @param address NFT address
   * @param tokenId Optional NFT ID
   */
  private getNFTKey(blockchain: BlockchainType, address: string, tokenId?: string): string {
    const baseKey = `${blockchain}:${address.toLowerCase()}`;
    return tokenId ? `${baseKey}:${tokenId}` : baseKey;
  }
} 