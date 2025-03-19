import { BlockchainAdapter } from './blockchainAdapter';
import { BSCAdapter } from './bscAdapter';
import { BlockchainType } from '../../models/contractInterfaces';

/**
 * Factory class for creating blockchain adapters
 */
export class BlockchainAdapterFactory {
  // RPC endpoints for different blockchains
  private static readonly RPC_ENDPOINTS = {
    [BlockchainType.BSC]: {
      mainnet: 'https://bsc-dataseed.binance.org/',
      testnet: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    },
    [BlockchainType.ETHEREUM]: {
      mainnet: 'https://mainnet.infura.io/v3/your-infura-id',
      testnet: 'https://sepolia.infura.io/v3/your-infura-id'
    },
    [BlockchainType.POLYGON]: {
      mainnet: 'https://polygon-rpc.com',
      testnet: 'https://rpc-mumbai.maticvigil.com'
    },
    [BlockchainType.ARBITRUM]: {
      mainnet: 'https://arb1.arbitrum.io/rpc',
      testnet: 'https://goerli-rollup.arbitrum.io/rpc'
    },
    [BlockchainType.AVALANCHE]: {
      mainnet: 'https://api.avax.network/ext/bc/C/rpc',
      testnet: 'https://api.avax-test.network/ext/bc/C/rpc'
    }
  };

  // Chain IDs for different blockchains
  private static readonly CHAIN_IDS = {
    [BlockchainType.BSC]: {
      mainnet: 56,
      testnet: 97
    },
    [BlockchainType.ETHEREUM]: {
      mainnet: 1,
      testnet: 11155111 // Sepolia
    },
    [BlockchainType.POLYGON]: {
      mainnet: 137,
      testnet: 80001
    },
    [BlockchainType.ARBITRUM]: {
      mainnet: 42161,
      testnet: 421613
    },
    [BlockchainType.AVALANCHE]: {
      mainnet: 43114,
      testnet: 43113
    }
  };

  // Use testnet by default for development
  private useTestnet: boolean = true;

  /**
   * Constructor for the factory
   * @param useTestnet Whether to use testnet (default: true)
   */
  constructor(useTestnet: boolean = true) {
    this.useTestnet = useTestnet;
  }

  /**
   * Get adapter for the specified blockchain
   * @param blockchainType Blockchain type
   * @returns Blockchain adapter instance
   */
  public getAdapter(blockchainType: BlockchainType): BlockchainAdapter | null {
    const network = this.useTestnet ? 'testnet' : 'mainnet';
    
    switch (blockchainType) {
      case BlockchainType.BSC:
        const bscEndpoint = BlockchainAdapterFactory.RPC_ENDPOINTS[BlockchainType.BSC][network];
        const bscChainId = BlockchainAdapterFactory.CHAIN_IDS[BlockchainType.BSC][network];
        return new BSCAdapter(bscEndpoint, bscChainId);
      
      // Add other blockchain adapters as they are implemented
      // case BlockchainType.ETHEREUM:
      //   return new EthereumAdapter(...);
      
      default:
        console.warn(`Adapter for ${blockchainType} not implemented yet`);
        return null;
    }
  }
} 