# Cryus Solana智能合约

这个目录包含了Cryus项目的Solana智能合约代码，包括代币合约和NFT合约。

## 目录结构

- `/token` - 代币智能合约，实现了基本的代币功能
- `/nft` - NFT智能合约，实现了NFT的创建、转移和更新功能

## 代币合约

代币合约实现了以下功能：

- 初始化代币铸造账户
- 铸造新代币
- 转账代币
- 销毁代币

详细信息请参考 [代币合约README](/token/README.md)。

## NFT合约

NFT合约实现了以下功能：

- 创建NFT，包括名称、符号、URI和版税设置
- 转移NFT所有权
- 更新NFT元数据（如果NFT被设置为可变）

## 构建和部署

### 前提条件

- Rust和Cargo
- Solana CLI工具

### 构建代币合约

```bash
cd token
cargo build-bpf
```

### 构建NFT合约

```bash
cd nft
cargo build-bpf
```

### 部署合约

```bash
solana program deploy <编译后的.so文件路径>
```

## 客户端示例

代币合约目录中包含了一个JavaScript客户端示例，展示了如何与代币合约交互。要运行这个示例，请执行以下步骤：

1. 安装依赖：
   ```bash
   cd token
   npm install
   ```

2. 运行示例：
   ```bash
   npm start
   ```

## 安全注意事项

这些合约仅用于演示目的，尚未经过安全审计。在生产环境中使用前，请确保进行全面的安全审查。 