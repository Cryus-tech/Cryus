# Cryus NFT智能合约

这是一个基于Solana区块链的NFT智能合约，实现了基本的NFT功能，包括：

- 创建NFT，包括名称、符号、URI和版税设置
- 转移NFT所有权
- 更新NFT元数据（如果NFT被设置为可变）

## 合约结构

合约主要包含以下组件：

1. **NFTMetadata** - NFT元数据的数据结构
2. **NFTInstruction** - 定义了合约支持的指令类型
3. **处理函数** - 处理各种NFT操作的函数

## 指令

### 创建NFT (CreateNFT)

创建一个新的NFT，设置其名称、符号、URI、版税百分比和是否可变。

### 转移NFT (TransferNFT)

将NFT的所有权从当前所有者转移到新所有者。

### 更新元数据 (UpdateMetadata)

如果NFT被设置为可变，允许所有者更新NFT的名称、符号或URI。

## 构建和部署

### 前提条件

- Rust和Cargo
- Solana CLI工具

### 构建

```bash
cargo build-bpf
```

### 部署

```bash
solana program deploy target/deploy/cryus_nft.so
```

## 使用示例

### 创建NFT

要创建一个新的NFT，客户端需要：

1. 创建一个新的账户来存储NFT元数据
2. 调用`CreateNFT`指令，提供NFT的名称、符号、URI、版税百分比和是否可变

### 转移NFT

要转移NFT所有权，客户端需要：

1. 调用`TransferNFT`指令，提供新所有者的公钥
2. 确保当前所有者签名了交易

### 更新元数据

要更新NFT元数据，客户端需要：

1. 调用`UpdateMetadata`指令，提供要更新的字段（名称、符号或URI）
2. 确保NFT被设置为可变
3. 确保当前所有者签名了交易

## 安全注意事项

此合约仅用于演示目的，尚未经过安全审计。在生产环境中使用前，请确保进行全面的安全审查。 