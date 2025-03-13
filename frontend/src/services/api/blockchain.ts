import axios from 'axios';

// 设置axios的基础配置
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('API错误:', error.response.data);
      
      // 如果是401未授权，可能是token过期
      if (error.response.status === 401) {
        // 清除本地存储的token
        localStorage.removeItem('auth_token');
        // 重定向到登录页面
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('网络错误: 未收到响应', error.request);
    } else {
      // 请求配置出错
      console.error('请求错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 区块链API服务
 */
const BlockchainAPI = {
  /**
   * 获取钱包余额
   * @param walletAddress 钱包地址
   * @returns Promise 钱包余额信息
   */
  getWalletBalance: async (walletAddress: string) => {
    return apiClient.get(`/blockchain/wallet/${walletAddress}/balance`);
  },
  
  /**
   * 获取代币列表
   * @param walletAddress 钱包地址
   * @returns Promise 代币列表
   */
  getTokens: async (walletAddress: string) => {
    return apiClient.get(`/blockchain/wallet/${walletAddress}/tokens`);
  },
  
  /**
   * 获取NFT列表
   * @param walletAddress 钱包地址
   * @returns Promise NFT列表
   */
  getNFTs: async (walletAddress: string) => {
    return apiClient.get(`/blockchain/wallet/${walletAddress}/nfts`);
  },
  
  /**
   * 创建代币铸造账户
   * @param tokenData 代币数据
   * @returns Promise 创建结果
   */
  createTokenMint: async (tokenData: { name: string; symbol: string; decimals: number }) => {
    return apiClient.post('/blockchain/tokens/mint', tokenData);
  },
  
  /**
   * 创建代币账户
   * @param data 账户创建数据
   * @returns Promise 创建结果
   */
  createTokenAccount: async (data: { mintAddress: string; ownerAddress?: string }) => {
    return apiClient.post('/blockchain/tokens/account', data);
  },
  
  /**
   * 铸造代币
   * @param data 铸造数据
   * @returns Promise 铸造结果
   */
  mintToken: async (data: { mintAddress: string; destinationAddress: string; amount: number; decimals: number }) => {
    return apiClient.post('/blockchain/tokens/mint-tokens', data);
  },
  
  /**
   * 转账代币
   * @param data 转账数据
   * @returns Promise 转账结果
   */
  transferToken: async (data: { 
    sourceAddress: string; 
    destinationAddress: string; 
    mintAddress: string; 
    amount: number; 
    decimals: number 
  }) => {
    return apiClient.post('/blockchain/tokens/transfer', data);
  },
  
  /**
   * 销毁代币
   * @param data 销毁数据
   * @returns Promise 销毁结果
   */
  burnToken: async (data: { accountAddress: string; mintAddress: string; amount: number; decimals: number }) => {
    return apiClient.post('/blockchain/tokens/burn', data);
  },
  
  /**
   * 创建NFT
   * @param data NFT数据
   * @returns Promise 创建结果
   */
  createNFT: async (data: { 
    name: string; 
    symbol: string; 
    uri: string; 
    ownerAddress?: string;
    sellerFeeBasisPoints?: number;
    creators?: Array<{ address: string; share: number }>;
  }) => {
    return apiClient.post('/blockchain/nfts/create', data);
  },
  
  /**
   * 更新NFT元数据
   * @param data 更新数据
   * @returns Promise 更新结果
   */
  updateNFTMetadata: async (data: { mintAddress: string; uri: string; name?: string; symbol?: string }) => {
    return apiClient.patch(`/blockchain/nfts/${data.mintAddress}/metadata`, data);
  },
  
  /**
   * 转移NFT
   * @param data 转移数据
   * @returns Promise 转移结果
   */
  transferNFT: async (data: { mintAddress: string; sourceAddress: string; destinationAddress: string }) => {
    return apiClient.post('/blockchain/nfts/transfer', data);
  },
  
  /**
   * 获取交易历史
   * @param walletAddress 钱包地址
   * @param params 查询参数
   * @returns Promise 交易历史
   */
  getTransactionHistory: async (walletAddress: string, params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiClient.get(`/blockchain/wallet/${walletAddress}/transactions`, { params });
  },
  
  /**
   * 获取交易详情
   * @param txHash 交易哈希
   * @returns Promise 交易详情
   */
  getTransaction: async (txHash: string) => {
    return apiClient.get(`/blockchain/transactions/${txHash}`);
  },
  
  /**
   * 连接钱包
   * @param data 连接数据
   * @returns Promise 连接结果
   */
  connectWallet: async (data: { provider: string; publicKey: string; signature?: string; message?: string }) => {
    return apiClient.post('/blockchain/wallet/connect', data);
  },
  
  /**
   * 断开钱包连接
   * @returns Promise 断开结果
   */
  disconnectWallet: async () => {
    return apiClient.post('/blockchain/wallet/disconnect');
  },
  
  /**
   * 获取网络状态
   * @returns Promise 网络状态
   */
  getNetworkStatus: async () => {
    return apiClient.get('/blockchain/network/status');
  },
  
  /**
   * 获取代币价格
   * @param symbols 代币符号数组
   * @returns Promise 代币价格
   */
  getTokenPrices: async (symbols: string[]) => {
    return apiClient.get('/blockchain/tokens/prices', { params: { symbols: symbols.join(',') } });
  },
  
  /**
   * 执行算法交易策略
   * @param data 策略数据
   * @returns Promise 执行结果
   */
  executeStrategy: async (data: {
    strategyId: string;
    parameters?: Record<string, any>;
  }) => {
    return apiClient.post('/blockchain/trading/execute', data);
  },
  
  /**
   * 创建交易策略
   * @param data 策略数据
   * @returns Promise 创建结果
   */
  createStrategy: async (data: {
    name: string;
    description: string;
    type: string;
    asset: string;
    conditions: any[];
    actions: any[];
    parameters?: Record<string, any>;
    isActive?: boolean;
  }) => {
    return apiClient.post('/blockchain/trading/strategies', data);
  },
  
  /**
   * 获取策略列表
   * @param params 查询参数
   * @returns Promise 策略列表
   */
  getStrategies: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) => {
    return apiClient.get('/blockchain/trading/strategies', { params });
  },
  
  /**
   * 获取策略详情
   * @param strategyId 策略ID
   * @returns Promise 策略详情
   */
  getStrategy: async (strategyId: string) => {
    return apiClient.get(`/blockchain/trading/strategies/${strategyId}`);
  },
  
  /**
   * 更新策略
   * @param strategyId 策略ID
   * @param data 更新数据
   * @returns Promise 更新结果
   */
  updateStrategy: async (strategyId: string, data: {
    name?: string;
    description?: string;
    conditions?: any[];
    actions?: any[];
    parameters?: Record<string, any>;
    isActive?: boolean;
  }) => {
    return apiClient.patch(`/blockchain/trading/strategies/${strategyId}`, data);
  },
  
  /**
   * 删除策略
   * @param strategyId 策略ID
   * @returns Promise 删除结果
   */
  deleteStrategy: async (strategyId: string) => {
    return apiClient.delete(`/blockchain/trading/strategies/${strategyId}`);
  },
  
  /**
   * 进行策略回测
   * @param data 回测数据
   * @returns Promise 回测结果
   */
  backtestStrategy: async (data: {
    strategyId?: string;
    strategyData?: any;
    asset: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  }) => {
    return apiClient.post('/blockchain/trading/backtest', data);
  },
  
  /**
   * 获取风险分析
   * @param walletAddress 钱包地址
   * @returns Promise 风险分析
   */
  getRiskAnalysis: async (walletAddress: string) => {
    return apiClient.get(`/blockchain/risk/${walletAddress}/analysis`);
  },
  
  /**
   * 设置风险偏好
   * @param data 风险偏好数据
   * @returns Promise 设置结果
   */
  setRiskPreferences: async (data: {
    riskTolerance: number;
    investmentHorizon: string;
    rebalancingFrequency: string;
    maxLossPercentage: number;
    autoRebalancing: boolean;
    stopLossEnabled: boolean;
    notificationsEnabled: boolean;
    riskProtectionLevel: string;
  }) => {
    return apiClient.post('/blockchain/risk/preferences', data);
  },
  
  /**
   * 获取风险偏好
   * @returns Promise 风险偏好
   */
  getRiskPreferences: async () => {
    return apiClient.get('/blockchain/risk/preferences');
  },
  
  /**
   * 获取市场数据
   * @returns Promise 市场数据
   */
  getMarketData: async () => {
    return apiClient.get('/blockchain/market/overview');
  },
  
  /**
   * 获取币种数据
   * @param params 查询参数
   * @returns Promise 币种数据
   */
  getCoins: async (params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }) => {
    return apiClient.get('/blockchain/market/coins', { params });
  },
  
  /**
   * 获取币种详情
   * @param symbol 币种符号
   * @returns Promise 币种详情
   */
  getCoinDetails: async (symbol: string) => {
    return apiClient.get(`/blockchain/market/coins/${symbol}`);
  },
  
  /**
   * 获取币种历史价格
   * @param symbol 币种符号
   * @param timeRange 时间范围
   * @returns Promise 历史价格
   */
  getCoinPriceHistory: async (symbol: string, timeRange: string) => {
    return apiClient.get(`/blockchain/market/coins/${symbol}/history`, { params: { timeRange } });
  },
  
  /**
   * 获取市场新闻
   * @param params 查询参数
   * @returns Promise 新闻数据
   */
  getMarketNews: async (params?: {
    page?: number;
    limit?: number;
    categories?: string[];
    symbols?: string[];
  }) => {
    return apiClient.get('/blockchain/market/news', { params });
  },
};

export default BlockchainAPI; 