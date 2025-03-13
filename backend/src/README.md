# Cryus Cross-Chain Support System

![Cryus Banner](https://via.placeholder.com/1200x300/0077cc/ffffff?text=Cryus+Cross-Chain+System)

## Overview

Cryus Cross-Chain Support System is a comprehensive architecture that enables seamless asset transfer and communication between multiple blockchain networks. The system provides a unified interface for developers and users to interact with different blockchains, manage assets across chains, and execute cross-chain transactions with real-time monitoring.

### Currently Supported Blockchains

- Ethereum
- Solana
- BNB Chain (formerly Binance Smart Chain)

### Future Support (Planned)

- Polygon
- Avalanche
- Arbitrum

## Key Features

- **Multi-Bridge Protocol Support**: Implements Wormhole, Synapse, Celer, and Portal bridge protocols
- **Asset Mapping System**: Maps equivalent assets across different blockchains
- **Universal Wallet Adapter**: Provides a unified interface for various wallet connections
- **Real-time Transaction Monitoring**: Tracks and reports transaction status changes
- **Dynamic Fee Estimation**: Calculates optimal fees across different networks
- **Enhanced Security Layer**: Implements multiple validation and verification mechanisms

## Architecture

The system follows a modular multi-layered architecture that enables high flexibility, maintainability, and extensibility.

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                        Application Layer                       │
│    ┌─────────────────────┐      ┌─────────────────────────┐   │
│    │   User Interface    │      │   Third-party Systems   │   │
│    └──────────┬──────────┘      └───────────┬─────────────┘   │
│               │                             │                 │
└───────────────┼─────────────────────────────┼─────────────────┘
                ▼                             ▼
┌───────────────────────────────────────────────────────────────┐
│                           API Layer                            │
│    ┌─────────────────────┐      ┌─────────────────────────┐   │
│    │      REST API       │      │     WebSocket API       │   │
│    └──────────┬──────────┘      └───────────┬─────────────┘   │
│               │                             │                 │
└───────────────┼─────────────────────────────┼─────────────────┘
                ▼                             ▼
┌───────────────────────────────────────────────────────────────┐
│                       Controller Layer                         │
│    ┌─────────────────────┐      ┌─────────────────────────┐   │
│    │  Bridge Controller  │      │   Asset Controller      │   │
│    └──────────┬──────────┘      └───────────┬─────────────┘   │
│               │                             │                 │
└───────────────┼─────────────────────────────┼─────────────────┘
                ▼                             ▼
┌───────────────────────────────────────────────────────────────┐
│                        Service Layer                           │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│    │   Bridge    │ │  Monitor    │ │  Asset Mapping      │    │
│    │   Service   │ │  Service    │ │  Service            │    │
│    └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │
│           │               │                   │               │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│    │    Fee      │ │   Security  │ │  Notification       │    │
│    │   Service   │ │   Service   │ │  Service            │    │
│    └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │
│           │               │                   │               │
└───────────┼───────────────┼───────────────────┼───────────────┘
            ▼               ▼                   ▼
┌───────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                        │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│    │  Ethereum   │ │   Solana    │ │      BNB Chain      │    │
│    │   Adapter   │ │   Adapter   │ │      Adapter        │    │
│    └─────────────┘ └─────────────┘ └─────────────────────┘    │
│                                                               │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│    │  Wallet     │ │   Bridge    │ │      Database       │    │
│    │  Adapters   │ │   Adapters  │ │      Access         │    │
│    └─────────────┘ └─────────────┘ └─────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### Module Dependencies

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Bridge        │────▶│  Monitor       │────▶│  Notification  │
│  Service       │     │  Service       │     │  Service       │
│                │     │                │     │                │
└───────┬────────┘     └────────────────┘     └────────────────┘
        │
        │
        ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Asset         │◀───▶│  Blockchain    │◀───▶│  Fee           │
│  Mapping       │     │  Services      │     │  Service       │
│                │     │                │     │                │
└────────────────┘     └───────┬────────┘     └────────────────┘
                               │
                               │
                               ▼
                      ┌────────────────┐     ┌────────────────┐
                      │                │     │                │
                      │  Wallet        │◀───▶│  Security      │
                      │  Adapters      │     │  Service       │
                      │                │     │                │
                      └────────────────┘     └────────────────┘
```

## Technical Implementation

### Core Components

#### 1. Bridge Service

The BridgeService is the central component that orchestrates cross-chain transfers using various bridge protocols:

```typescript
export class BridgeService {
  // Bridge assets between chains
  async bridgeAssets(
    sourceChain: BlockchainType,
    targetChain: BlockchainType,
    sourceAsset: string,
    targetAsset: string,
    amount: number,
    fromAddress: string,
    toAddress: string,
    privateKey: string,
    bridgeType: BridgeType = BridgeType.WORMHOLE
  ): Promise<CrossChainTxInfo> {
    // Implementation routes to the appropriate bridge protocol handler
  }

  // Estimate bridge fees
  async estimateBridgeFee(
    sourceChain: BlockchainType,
    targetChain: BlockchainType,
    sourceAsset: string,
    targetAsset: string,
    amount: number,
    bridgeType: BridgeType = BridgeType.WORMHOLE
  ): Promise<{
    sourceFee: number;
    bridgeFee: number;
    targetFee: number;
    totalFee: number;
    estimatedTime: number;
  }> {
    // Implementation calculates fees for the selected bridge protocol
  }

  // Get transaction status
  async getTransactionStatus(
    txId: string,
    bridgeType: BridgeType = BridgeType.WORMHOLE
  ): Promise<CrossChainTxStatus> {
    // Implementation retrieves current transaction status
  }
}
```

#### 2. Monitor Service

The CrossChainMonitorService tracks the status of cross-chain transactions and emits events as the transaction progresses through different stages:

```typescript
export class CrossChainMonitorService {
  // Start monitoring a transaction
  public startMonitoring(
    txInfo: CrossChainTxInfo,
    pollingInterval: number = this.DEFAULT_POLLING_INTERVAL
  ): string {
    // Sets up polling to check transaction status
  }

  // Check transaction status
  private async checkTransactionStatus(txId: string, bridgeType: BridgeType): Promise<void> {
    // Verifies status and triggers appropriate events
  }

  // Subscribe to transaction events
  public subscribe(
    eventType: MonitorEventType,
    listener: (data: any) => void
  ): void {
    // Allows external systems to listen for events
  }
}
```

#### 3. Asset Mapping Service

The AssetMappingService maintains relationships between equivalent assets across different blockchains:

```typescript
export class AssetMappingService {
  // Find mapped asset on target chain
  findMappedAsset(
    sourceBlockchain: BlockchainType,
    targetBlockchain: BlockchainType,
    address?: string,
    tokenId?: string
  ): Asset | undefined {
    // Finds the equivalent asset on the target chain
  }

  // Create cross-chain mapping
  createCrossChainMapping(mapping: CrossChainMapping): CrossChainMapping {
    // Validates and stores the mapping
  }
}
```

#### 4. Fee Service

The FeeService calculates transaction fees across different blockchains with various priority levels:

```typescript
export class FeeService {
  // Estimate fee based on blockchain
  async estimateFee(
    blockchainType: BlockchainType,
    level: FeeLevel = FeeLevel.MEDIUM
  ): Promise<FeeEstimate> {
    // Routes to chain-specific estimation logic
  }

  // Estimate combined bridge fees
  estimateBridgeFee(
    sourceFee: FeeEstimate,
    targetFee: FeeEstimate,
    bridgeFee: number
  ): {
    totalFeeUSD: number;
    breakdown: {
      sourceFeeUSD: number;
      targetFeeUSD: number;
      bridgeFeeUSD: number;
    }
  } {
    // Calculates total fees across the entire process
  }
}
```

#### 5. Wallet Adapters

The WalletAdapter interface provides a unified way to interact with different blockchain wallets:

```typescript
export interface WalletAdapter {
  getAddress(): string | Promise<string>;
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signMessage(message: string): Promise<string>;
  isConnected(): boolean;
  getBlockchainType(): BlockchainType;
}

// Implementation examples
export class MetamaskAdapter extends EthereumWalletAdapterBase { /* ... */ }
export class PhantomAdapter extends SolanaWalletAdapterBase { /* ... */ }
export class LocalWalletAdapter implements WalletAdapter { /* ... */ }
```

#### 6. Security Service

The SecurityService provides multiple layers of security for cross-chain operations:

```typescript
export class SecurityService {
  // Validate blockchain address
  validateAddress(
    address: string,
    blockchain: BlockchainType,
    options: AddressValidationOptions = {}
  ): SecurityCheckResult {
    // Verifies address format and checksum
  }

  // Validate transaction parameters
  validateTransaction(
    fromAddress: string,
    toAddress: string,
    amount: string,
    blockchain: BlockchainType,
    options: TransactionValidationOptions = {}
  ): SecurityCheckResult {
    // Checks for suspicious transaction parameters
  }

  // Assess smart contract risk
  assessSmartContractRisk(options: SmartContractRiskOptions): SecurityCheckResult {
    // Analyzes contract code for potential vulnerabilities
  }
}
```

### Cross-Chain Transaction Flow

The cross-chain transaction process involves multiple steps:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Initiate    │     │  Source      │     │  Bridge      │     │  Target      │
│  Transaction │────▶│  Chain       │────▶│  Protocol    │────▶│  Chain       │
│              │     │  Transaction │     │  Processing  │     │  Transaction │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
        │                   │                    │                    │
        │                   │                    │                    │
        ▼                   ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Real-Time Transaction Monitoring                      │
└──────────────────────────────────────────────────────────────────────────────┘
        │                   │                    │                    │
        │                   │                    │                    │
        ▼                   ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PENDING     │────▶│  SOURCE      │────▶│  BRIDGE      │────▶│  TARGET      │
│  Status      │     │  CONFIRMED   │     │  CONFIRMED   │     │  CONFIRMED   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Data Flow

### Transaction Execution Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User        │     │ Bridge      │     │ Monitoring  │     │ Notification│
│ Interface   │     │ Service     │     │ Service     │     │ Service     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Initiate       │                   │                   │
       │ Transfer          │                   │                   │
       │ ─────────────────▶│                   │                   │
       │                   │                   │                   │
       │                   │ 2. Create         │                   │
       │                   │ Transaction       │                   │
       │                   │ & Execute         │                   │
       │                   │ ─────────────────▶│                   │
       │                   │                   │                   │
       │ 3. Return         │                   │                   │
       │ Transaction ID    │                   │                   │
       │ ◀─────────────────│                   │                   │
       │                   │                   │ 4. Monitor        │
       │                   │                   │ Status            │
       │                   │                   │ ───────┐          │
       │                   │                   │        │          │
       │                   │                   │ ◀──────┘          │
       │                   │                   │                   │
       │ 5. Poll for       │                   │                   │
       │ Updates           │                   │                   │
       │ ───────────────────────────────────▶ │                   │
       │                   │                   │                   │
       │ 6. Status         │                   │                   │
       │ Updates           │                   │                   │
       │ ◀─────────────────────────────────── │                   │
       │                   │                   │                   │
       │                   │                   │ 7. Status         │
       │                   │                   │ Change            │
       │                   │                   │ ────────────────▶ │
       │                   │                   │                   │
       │                   │                   │                   │ 8. Send
       │                   │                   │                   │ Notification
       │                   │                   │                   │ ───────┐
       │                   │                   │                   │        │
       │                   │                   │                   │ ◀──────┘
```

### Asset Mapping Data Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Source        │     │  Asset         │     │  Target        │
│  Blockchain    │     │  Mapping       │     │  Blockchain    │
│  Asset         │     │  Service       │     │  Asset         │
│                │     │                │     │                │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │ 1. Query with        │                      │
        │ Asset Details        │                      │
        │ ─────────────────────▶                      │
        │                      │                      │
        │                      │ 2. Look up           │
        │                      │ Mappings             │
        │                      │ ──────┐              │
        │                      │       │              │
        │                      │ ◀─────┘              │
        │                      │                      │
        │                      │ 3. Retrieve          │
        │                      │ Target Asset         │
        │                      │ ─────────────────────▶
        │                      │                      │
        │                      │ 4. Return            │
        │                      │ Asset Details        │
        │                      │ ◀─────────────────────
        │                      │                      │
        │ 5. Return            │                      │
        │ Mapping              │                      │
        │ ◀─────────────────────                      │
        │                      │                      │
```

## Bridge Protocols

The system currently supports four cross-chain bridge protocols:

### 1. Wormhole

Wormhole is a generic message passing protocol that connects multiple chains, allowing for token transfers and arbitrary message passing between chains.

- **Supported Chains**: Ethereum ↔ Solana, Ethereum ↔ BNB Chain
- **Assets**: ETH, SOL, BNB, USDC, USDT, DAI

### 2. Synapse

Synapse is a cross-chain layer that enables bridging assets across multiple chains with optimized liquidity and security.

- **Supported Chains**: Ethereum ↔ Solana, Ethereum ↔ BNB Chain, Solana ↔ BNB Chain
- **Assets**: ETH, USDC, USDT, DAI, WBTC

### 3. Celer

Celer is a bridging protocol that focuses on low fees and fast transfer times.

- **Supported Chains**: Ethereum ↔ BNB Chain, Ethereum ↔ Solana
- **Assets**: ETH, BNB, USDC, USDT

### 4. Portal

Portal is designed specifically for secure token transfers and messaging between EVM-compatible chains.

- **Supported Chains**: Ethereum ↔ BNB Chain
- **Assets**: ETH, BNB, USDC, USDT, DAI, LINK

## API Reference

### Bridge Operations

```http
POST /api/v1/bridge/transfer
Content-Type: application/json

{
  "sourceChain": "ethereum",
  "targetChain": "solana",
  "sourceAsset": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "targetAsset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": 100.50,
  "fromAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "toAddress": "AH8de7JNqo8jJUJHG4YA1F99iCoZLNH1XVCJv3NbVhet",
  "bridgeType": "wormhole"
}
```

```http
GET /api/v1/bridge/status/{txId}
```

```http
GET /api/v1/bridge/estimate-fee?sourceChain=ethereum&targetChain=solana&amount=100&asset=USDC&bridgeType=wormhole
```

### Asset Operations

```http
GET /api/v1/assets/mapping?sourceChain=ethereum&sourceAsset=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&targetChain=solana
```

```http
GET /api/v1/assets/supported
```

### Wallet Operations

```http
POST /api/v1/wallet/connect
Content-Type: application/json

{
  "walletType": "metamask",
  "chainType": "ethereum"
}
```

## Security Features

### Multi-Layer Protection

1. **Address Validation**: Ensures addresses match the expected format for each blockchain
2. **Transaction Validation**: Verifies parameters and detects suspicious transactions
3. **Smart Contract Risk Assessment**: Analyzes contract code before interaction
4. **Secure Key Management**: Temporary, encrypted storage of private keys
5. **Rate Limiting**: Protection against brute force attacks and DoS
6. **Phishing Protection**: Detection of known malicious addresses and domains
7. **Signature Verification**: Cryptographic verification of all transaction signatures

## Installation Guide

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- Access to Ethereum, Solana, and BNB Chain RPC endpoints

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Cryus-tech/Cryus.git
cd Cryus
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env file with your specific configuration
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

## Testing

The system includes comprehensive testing across all components:

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=bridge

# Run with coverage report
npm test -- --coverage
```

## Future Development

Planned enhancements to the Cryus Cross-Chain Support System include:

1. **Additional Blockchain Support**
   - Polygon
   - Avalanche
   - Arbitrum
   - Optimism

2. **Enhanced Bridge Protocols**
   - LayerZero integration
   - Axelar Network support
   - THORChain integration

3. **Advanced Features**
   - Cross-chain DEX aggregation
   - Multi-chain yield optimization
   - Gasless transactions
   - Advanced analytics dashboard

4. **Performance Improvements**
   - Parallel transaction execution
   - Optimized fee calculation algorithms
   - Enhanced error recovery mechanisms

## Contributing

Contributions to the Cryus Cross-Chain Support System are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for your changes
5. Submit a pull request

Please adhere to the existing code style and include appropriate tests.

## Community & Support

- **Website**: [cryus.xyz](https://cryus.xyz)
- **Twitter**: [@cryusxyz](https://x.com/cryusxyz)
- **GitHub**: [Cryus-tech/Cryus](https://github.com/Cryus-tech/Cryus)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2025 Cryus Team. All rights reserved. 