/**
 * 跨链资产映射配置
 * 定义不同区块链上相同资产的地址和精度
 */
export interface AssetInfo {
  address: string;
  decimals: number;
  name?: string;
  symbol?: string;
  logoUrl?: string;
}

export type ChainType = 'ethereum' | 'solana' | 'binance-chain' | 'polygon';

export type AssetMapping = {
  [chain in ChainType]?: AssetInfo;
};

export const ASSET_MAPPINGS: Record<string, AssetMapping> = {
  // 原生代币
  'ETH': {
    'ethereum': { 
      address: 'native', 
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
      logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
    'solana': { 
      address: 'So11111111111111111111111111111111111111112', 
      decimals: 9,
      name: 'Wrapped Ethereum (Sollet)',
      symbol: 'soETH',
      logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
    'binance-chain': { 
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 
      decimals: 18,
      name: 'Binance-Peg Ethereum Token',
      symbol: 'ETH',
      logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
    'polygon': { 
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    }
  },
  'SOL': {
    'solana': { 
      address: 'native', 
      decimals: 9,
      name: 'Solana',
      symbol: 'SOL',
      logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
    },
    'ethereum': { 
      address: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c', 
      decimals: 9,
      name: 'Wrapped SOL',
      symbol: 'wSOL',
      logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
    },
    'binance-chain': { 
      address: '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF', 
      decimals: 9,
      name: 'Wrapped SOL',
      symbol: 'wSOL',
      logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
    }
  },
  'BNB': {
    'binance-chain': { 
      address: 'native', 
      decimals: 18,
      name: 'Binance Coin',
      symbol: 'BNB',
      logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
    },
    'ethereum': { 
      address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', 
      decimals: 18,
      name: 'Binance Coin',
      symbol: 'BNB',
      logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
    },
    'solana': { 
      address: '9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa', 
      decimals: 8,
      name: 'Wrapped BNB (Sollet)',
      symbol: 'soBNB',
      logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
    }
  },
  'MATIC': {
    'polygon': { 
      address: 'native', 
      decimals: 18,
      name: 'Polygon',
      symbol: 'MATIC',
      logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
    },
    'ethereum': { 
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 
      decimals: 18,
      name: 'Polygon',
      symbol: 'MATIC',
      logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
    }
  },

  // 稳定币
  'USDC': {
    'ethereum': { 
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    'solana': { 
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    'binance-chain': { 
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 
      decimals: 18,
      name: 'Binance-Peg USD Coin',
      symbol: 'USDC',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    'polygon': { 
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 
      decimals: 6,
      name: 'USD Coin (PoS)',
      symbol: 'USDC',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    }
  },
  'USDT': {
    'ethereum': { 
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
      decimals: 6,
      name: 'Tether',
      symbol: 'USDT',
      logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
    },
    'solana': { 
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 
      decimals: 6,
      name: 'USDT',
      symbol: 'USDT',
      logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
    },
    'binance-chain': { 
      address: '0x55d398326f99059fF775485246999027B3197955', 
      decimals: 18,
      name: 'Binance-Peg BUSD-T',
      symbol: 'USDT',
      logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
    },
    'polygon': { 
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 
      decimals: 6,
      name: 'Tether USD (PoS)',
      symbol: 'USDT',
      logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
    }
  },
  'DAI': {
    'ethereum': { 
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/4943.png'
    },
    'solana': { 
      address: 'FYpdBuyAHSbdaAyD1sKkxyLWbAP8uUW9h6uvWX8VfKgW', 
      decimals: 9,
      name: 'Dai Stablecoin (Sollet)',
      symbol: 'soDAI',
      logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/4943.png'
    },
    'binance-chain': { 
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 
      decimals: 18,
      name: 'Binance-Peg Dai Token',
      symbol: 'DAI',
      logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/4943.png'
    },
    'polygon': { 
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 
      decimals: 18,
      name: 'Dai Stablecoin (PoS)',
      symbol: 'DAI',
      logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/4943.png'
    }
  }
};

/**
 * 获取特定链上特定资产的信息
 * @param assetSymbol 资产符号
 * @param chain 区块链
 * @returns 资产信息或undefined
 */
export function getAssetInfo(assetSymbol: string, chain: ChainType): AssetInfo | undefined {
  return ASSET_MAPPINGS[assetSymbol]?.[chain];
}

/**
 * 获取链上支持的所有资产列表
 * @param chain 区块链
 * @returns 资产列表
 */
export function getChainAssets(chain: ChainType): Array<{symbol: string; info: AssetInfo}> {
  return Object.entries(ASSET_MAPPINGS)
    .filter(([_, mapping]) => !!mapping[chain])
    .map(([symbol, mapping]) => ({
      symbol,
      info: mapping[chain]!
    }));
}

/**
 * 检查资产是否支持跨链转移
 * @param assetSymbol 资产符号
 * @param sourceChain 源链
 * @param targetChain 目标链
 * @returns 是否支持
 */
export function isCrossChainSupported(
  assetSymbol: string,
  sourceChain: ChainType,
  targetChain: ChainType
): boolean {
  const assetMapping = ASSET_MAPPINGS[assetSymbol];
  return !!assetMapping?.[sourceChain] && !!assetMapping?.[targetChain];
} 