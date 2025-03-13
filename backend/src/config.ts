/**
 * Cryus平台配置
 */
export const config = {
  // 应用程序配置
  app: {
    name: 'Cryus跨链开发平台',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: '/api/v1',
    cors: {
      allowedOrigins: ['http://localhost:3000', 'https://cryus.io'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Total-Count'],
      credentials: true,
      maxAge: 86400, // 24小时
    },
    rateLimits: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 每个IP每15分钟最多100个请求
    }
  },

  // 数据库配置
  database: {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/cryus',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
      ttl: 86400 // 24小时
    }
  },

  // 区块链RPC配置
  rpc: {
    // 以太坊网络
    ethereum: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key',
    goerli: process.env.GOERLI_RPC_URL || 'https://goerli.infura.io/v3/your-infura-key',
    sepolia: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-infura-key',
    
    // Polygon网络
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    mumbai: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    
    // 币安智能链
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    'bsc-testnet': process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    
    // Avalanche
    avalanche: process.env.AVAX_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    fuji: process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    
    // Solana
    solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'solana-devnet': process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
    'solana-testnet': process.env.SOLANA_TESTNET_RPC_URL || 'https://api.testnet.solana.com'
  },

  // 区块链资源管理器配置
  explorers: {
    ethereum: 'https://etherscan.io',
    goerli: 'https://goerli.etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    polygon: 'https://polygonscan.com',
    mumbai: 'https://mumbai.polygonscan.com',
    bsc: 'https://bscscan.com',
    'bsc-testnet': 'https://testnet.bscscan.com',
    avalanche: 'https://snowtrace.io',
    fuji: 'https://testnet.snowtrace.io',
    solana: 'https://explorer.solana.com',
    'solana-devnet': 'https://explorer.solana.com/?cluster=devnet',
    'solana-testnet': 'https://explorer.solana.com/?cluster=testnet'
  },

  // 桥接配置
  bridge: {
    wormhole: {
      api: process.env.WORMHOLE_API_URL || 'https://wormhole-v2-mainnet-api.certus.one',
      guardians: []
    },
    synapse: {
      api: process.env.SYNAPSE_API_URL || 'https://api.synapseprotocol.com',
      v3: process.env.SYNAPSE_V3_API_URL || 'https://api.synapseprotocol.com/v3'
    },
    celer: {
      api: process.env.CELER_API_URL || 'https://api.celerscan.com'
    },
    socket: {
      api: process.env.SOCKET_API_URL || 'https://api.socket.tech/v2',
      apiKey: process.env.SOCKET_API_KEY || ''
    },
    defaultBridge: 'wormhole'
  },

  // 价格API配置
  priceApi: {
    coingecko: {
      url: 'https://api.coingecko.com/api/v3',
      apiKey: process.env.COINGECKO_API_KEY || '',
      ttl: 60 * 5 // 5分钟缓存
    },
    coinmarketcap: {
      url: 'https://pro-api.coinmarketcap.com/v1',
      apiKey: process.env.COINMARKETCAP_API_KEY || '',
      ttl: 60 * 5 // 5分钟缓存
    },
    defillama: {
      url: 'https://coins.llama.fi',
      ttl: 60 * 5 // 5分钟缓存
    },
    defaultProvider: 'coingecko'
  },

  // 安全配置
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: '7d' // 7天
    },
    bcrypt: {
      saltRounds: 10
    },
    limiter: {
      // 敏感API请求速率限制
      sensitive: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 20 // 每个IP每15分钟最多20个请求
      }
    }
  },

  // 日志配置
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      path: process.env.LOG_FILE_PATH || './logs/cryus.log',
      maxSize: '20m', // 20 MB
      maxFiles: '14d' // 保留14天
    }
  },

  // 通知配置
  notifications: {
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      from: process.env.EMAIL_FROM || 'noreply@cryus.io',
      smtp: {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      }
    },
    webpush: {
      enabled: process.env.WEBPUSH_ENABLED === 'true',
      publicKey: process.env.WEBPUSH_PUBLIC_KEY || '',
      privateKey: process.env.WEBPUSH_PRIVATE_KEY || '',
      subject: process.env.WEBPUSH_SUBJECT || 'mailto:webpush@cryus.io'
    }
  },

  // 定时任务配置
  cron: {
    priceSync: '*/5 * * * *', // 每5分钟
    transactionStatusCheck: '*/1 * * * *', // 每1分钟
    cleanup: '0 0 * * *' // 每天0点
  },

  // 钱包配置
  wallet: {
    // 派生路径
    derivationPaths: {
      ethereum: "m/44'/60'/0'/0/",
      solana: "m/44'/501'/0'/0/"
    },
    // 默认开发钱包(仅用于测试环境!)
    dev: {
      mnemonic: process.env.DEV_WALLET_MNEMONIC || 'test test test test test test test test test test test junk',
      password: process.env.DEV_WALLET_PASSWORD || 'testpassword'
    }
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: {
      short: 60, // 1分钟
      medium: 60 * 15, // 15分钟
      long: 60 * 60, // 1小时
      day: 60 * 60 * 24 // 1天
    }
  },

  // AI服务配置
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000')
    },
    llama: {
      enabled: process.env.LLAMA_ENABLED === 'true',
      endpoint: process.env.LLAMA_ENDPOINT || 'http://localhost:8080/v1'
    },
    embeddings: {
      model: process.env.EMBEDDINGS_MODEL || 'text-embedding-ada-002',
      dimensions: parseInt(process.env.EMBEDDINGS_DIMENSIONS || '1536')
    },
    defaultProvider: 'openai'
  },

  // 开发人员API配置
  devApi: {
    rateLimit: {
      free: {
        requestsPerDay: 100
      },
      pro: {
        requestsPerDay: 1000
      },
      enterprise: {
        requestsPerDay: 10000
      }
    },
    apiKeys: {
      // 测试API密钥
      testKey: process.env.DEV_API_TEST_KEY || 'test-api-key-1234567890'
    }
  },

  // 智能合约相关配置
  contracts: {
    defaultGasLimit: {
      erc20Transfer: '65000',
      erc20Approve: '50000',
      erc721Transfer: '200000',
      nftMint: '500000'
    },
    compilers: {
      solcVersions: ['0.8.19', '0.8.17', '0.7.6', '0.6.12', '0.5.17'],
      defaultSolcVersion: '0.8.19'
    },
    templates: {
      basePath: './templates',
      solana: {
        token: './solana/token_template.rs',
        nft: './solana/nft_template.rs'
      },
      ethereum: {
        erc20: './ethereum/ERC20_template.sol',
        erc721: './ethereum/ERC721_template.sol'
      }
    }
  }
}; 