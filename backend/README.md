# Cryus 跨链支持功能

## 功能概述

Cryus区块链开发平台现已支持跨链功能，可以在多个区块链网络之间无缝操作，目前支持：

- **Solana区块链**：支持SOL转账、SPL代币、NFT和智能合约部署
- **以太坊区块链**：支持ETH转账、ERC20代币、ERC721 NFT和智能合约部署
- **跨链转账**：通过整合第三方桥接技术，支持资产在不同区块链间的转移（模拟实现）

## 技术架构

跨链功能的实现基于以下组件：

1. **区块链服务层**：
   - `solanaService.ts`：处理与Solana网络的所有交互
   - `ethereumService.ts`：处理与以太坊网络的所有交互
   - 服务层提供统一接口，封装底层链操作细节

2. **控制器层**：
   - `blockchainController.ts`：整合不同区块链服务，根据请求参数动态路由到相应的链服务

3. **路由层**：
   - `blockchainRoutes.ts`：定义API端点，处理参数验证和权限控制

4. **类型定义**：
   - `interfaces.ts`：定义统一的跨链数据模型，保证数据格式一致性

## API文档

### 1. 查询钱包资产（跨链）

#### 获取钱包余额
```
GET /api/blockchain/wallet-balance?address={address}&blockchain={blockchain}&network={network}
```

#### 获取代币列表
```
GET /api/blockchain/tokens?address={address}&blockchain={blockchain}&network={network}
```

#### 获取NFT列表
```
GET /api/blockchain/nfts?address={address}&blockchain={blockchain}&network={network}
```

#### 获取交易历史
```
GET /api/blockchain/transactions?address={address}&limit={limit}&blockchain={blockchain}&network={network}
```

### 2. 资产操作（跨链）

#### 发送原生代币
```
POST /api/blockchain/send-asset
{
  "privateKey": "发送方私钥",
  "to": "接收方地址",
  "amount": "金额",
  "blockchain": "solana或ethereum",
  "network": "网络名称（可选）"
}
```

#### 发送代币
```
POST /api/blockchain/send-token
{
  "privateKey": "发送方私钥",
  "tokenAddress": "代币合约地址",
  "to": "接收方地址",
  "amount": "金额",
  "decimals": "代币精度（针对以太坊）",
  "blockchain": "solana或ethereum",
  "network": "网络名称（可选）"
}
```

### 3. 合约部署（跨链）

#### 部署代币合约
```
POST /api/blockchain/deploy-token
{
  "privateKey": "部署者私钥",
  "name": "代币名称",
  "symbol": "代币符号",
  "initialSupply": "初始供应量",
  "decimals": "精度",
  "maxSupply": "最大供应量（可选）",
  "blockchain": "solana或ethereum",
  "network": "网络名称（可选）"
}
```

#### 部署NFT合约
```
POST /api/blockchain/deploy-nft
{
  "privateKey": "部署者私钥",
  "name": "NFT集合名称",
  "symbol": "NFT集合符号",
  "baseURI": "基础URI（可选）",
  "maxSupply": "最大供应量（可选）",
  "royaltyFee": "版税（可选，0-10000表示0-100%）",
  "blockchain": "solana或ethereum",
  "network": "网络名称（可选）"
}
```

#### 铸造NFT
```
POST /api/blockchain/mint-nft
{
  "privateKey": "铸造者私钥",
  "contractAddress": "NFT合约地址",
  "to": "接收方地址",
  "metadataURI": "元数据URI",
  "blockchain": "solana或ethereum",
  "network": "网络名称（可选）"
}
```

### 4. 跨链操作

#### 跨链转账
```
POST /api/blockchain/cross-chain-transfer
{
  "fromPrivateKey": "发送方私钥",
  "toAddress": "接收方地址",
  "amount": "金额",
  "sourceChain": "源区块链（solana或ethereum）",
  "targetChain": "目标区块链（solana或ethereum）",
  "bridgeType": "桥接类型（可选，支持wormhole、synapse、celer）"
}
```

### 5. 网络状态

#### 获取网络状态
```
GET /api/blockchain/network-status?blockchain={blockchain}&network={network}
```

## 开发指南

### 设置开发环境

1. 克隆项目并安装依赖：
```bash
git clone https://github.com/your-org/cryus.git
cd cryus/backend
npm install
```

2. 配置环境变量（创建.env文件）：
```
# Solana配置
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
SOLANA_TESTNET_RPC=https://api.testnet.solana.com

# 以太坊配置
ETHEREUM_MAINNET_RPC=https://mainnet.infura.io/v3/your-infura-key
ETHEREUM_GOERLI_RPC=https://goerli.infura.io/v3/your-infura-key
ETHEREUM_SEPOLIA_RPC=https://sepolia.infura.io/v3/your-infura-key

# 应用配置
PORT=3000
JWT_SECRET=your-secret-key
```

3. 启动开发服务器：
```bash
npm run dev
```

### 扩展支持新的区块链

要添加新的区块链支持，请按照以下步骤：

1. 创建新的区块链服务文件（例如`services/blockchain/binanceService.ts`）
2. 在服务中实现标准接口函数（getWalletBalance, getTokenBalances等）
3. 更新控制器中的switch语句以包含新的区块链类型
4. 更新路由验证规则以支持新的区块链参数

## 注意事项

- 私钥处理需要特别小心，生产环境中应避免直接传输私钥
- 以太坊Gas费用会根据网络拥堵状况变化，应适当处理
- 跨链转账功能当前为模拟实现，实际集成时需要根据所选桥接协议进行开发
- 测试网络优先于主网进行开发和测试 