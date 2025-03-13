# Cryus - Cross-Chain Development Platform

<div align="center">
  <!-- For the logo, you should save the SVG file to assets/logos/cryus_logo.svg -->
  <img src="assets/logos/cryus_logo.svg" alt="Cryus Logo" width="250">
  <!-- If you don't have the actual image file, you can use this placeholder -->
  <!-- ![Cryus Logo](https://placeholder.com/wp-content/uploads/2018/10/placeholder.png) -->
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Website](https://img.shields.io/badge/Website-cryus.xyz-blue)](https://cryus.xyz)
  [![Twitter](https://img.shields.io/badge/Twitter-@cryusxyz-blue)](https://x.com/cryusxyz)
  [![GitHub](https://img.shields.io/badge/GitHub-Cryus--tech%2FCryus-blue)](https://github.com/Cryus-tech/Cryus)
</div>

Cryus is a comprehensive multi-chain development platform enabling seamless cross-chain operations, asset transfers, and decentralized applications that can operate across multiple blockchain networks.

## Features

- **Cross-Chain Asset Transfers**: Bridge assets between Ethereum, Solana, and BNB Chain
- **Real-Time Transaction Monitoring**: Track cross-chain transactions with live status updates
- **Multi-Chain Wallet Management**: Connect and manage wallets across different blockchains
- **Asset Mapping System**: Map equivalent assets across blockchain networks
- **Dynamic Fee Estimation**: Calculate optimal fees for cross-chain operations
- **Enhanced Security**: Multi-layered protection for cross-chain transactions

## Project Structure

```
cryus/
├── backend/             # Backend services and APIs
│   ├── src/             # Source code
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # API controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Core business logic
│   │   │   ├── assets/  # Asset mapping services
│   │   │   ├── blockchain/ # Blockchain-specific services
│   │   │   ├── bridge/  # Cross-chain bridging services
│   │   │   ├── events/  # Event and notification services
│   │   │   ├── fees/    # Fee estimation services
│   │   │   ├── security/ # Security services
│   │   │   └── wallet/  # Wallet adapter services
│   │   └── utils/       # Utility functions
│   ├── package.json     # Backend dependencies
│   └── tsconfig.json    # TypeScript configuration
├── frontend/            # Frontend application
│   ├── public/          # Static assets
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Application pages
│   │   ├── services/    # Frontend services
│   │   └── utils/       # Utility functions
│   ├── package.json     # Frontend dependencies
│   └── tsconfig.json    # TypeScript configuration
└── README.md            # This file
```

## Architecture

Cryus implements a modular, layered architecture that enables seamless cross-chain operations with high security and reliability.

### System Architecture

```
┌─────────────────────────────────────────────┐
│                Client Layer                  │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Web Interface│  │ Mobile App  │           │
│  └─────────────┘  └─────────────┘           │
└───────────────────────┬─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────┐
│                API Layer                     │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ REST API    │  │ WebSocket   │           │
│  └─────────────┘  └─────────────┘           │
└───────────────────────┬─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────┐
│            Service Layer                     │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Bridge      │  │ Monitor     │           │
│  │ Services    │  │ Services    │           │
│  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Asset       │  │ Fee         │           │
│  │ Services    │  │ Services    │           │
│  └─────────────┘  └─────────────┘           │
└───────────────────────┬─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────┐
│          Infrastructure Layer                │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Blockchain  │  │ Wallet      │           │
│  │ Adapters    │  │ Adapters    │           │
│  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Security    │  │ Event       │           │
│  │ Services    │  │ System      │           │
│  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────┘
```

### Cross-Chain Transaction Flow

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

## Core Components

### Bridge Service

Orchestrates asset transfers between blockchains using various bridge protocols:

- Wormhole
- Synapse
- Celer
- Portal

### Monitor Service

Provides real-time tracking of cross-chain transactions:

- Status updates via event emitters
- Automatic retry mechanisms
- Historical transaction data

### Asset Mapping Service

Maintains relationships between equivalent assets across different blockchains:

- Native assets (ETH, SOL, BNB)
- Tokens (ERC20, SPL, BEP20)
- NFTs (ERC721, ERC1155)

### Fee Estimation Service

Calculates optimal fees for cross-chain transactions:

- Dynamic fee estimation based on network conditions
- Multiple fee levels (low, medium, high)
- Fee conversion to USD for easy comparison

### Wallet Adapters

Provides a unified interface for connecting to different blockchain wallets:

- Ethereum wallets (MetaMask)
- Solana wallets (Phantom)
- Local wallet (private key management)

## Getting Started

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Access to Ethereum, Solana, and BNB Chain RPC endpoints

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Cryus-tech/Cryus.git
cd Cryus
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
```bash
cd ../backend
cp .env.example .env
# Edit .env with your configuration details
```

5. Build and start the backend:
```bash
npm run build
npm start
```

6. In a separate terminal, start the frontend:
```bash
cd ../frontend
npm start
```

## API Examples

### Initiate Cross-Chain Transfer

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

### Get Transaction Status

```http
GET /api/v1/bridge/status/tx-12345-abcde
```

### Estimate Bridge Fees

```http
GET /api/v1/bridge/estimate-fee?sourceChain=ethereum&targetChain=solana&amount=100&asset=USDC&bridgeType=wormhole
```

## Security Features

Cryus implements multiple security measures:

- Address validation with blockchain-specific checks
- Transaction validation against known attack vectors
- Smart contract risk assessment
- Rate limiting to prevent abuse
- Secure key management with encryption
- Phishing protection

## Future Development

Our roadmap includes:

1. **Additional Blockchain Support**:
   - Polygon
   - Avalanche
   - Arbitrum
   - Cosmos ecosystem

2. **Enhanced Bridge Protocols**:
   - LayerZero
   - Stargate Finance
   - Axelar Network

3. **Advanced Features**:
   - Cross-chain DEX aggregation
   - Multi-chain yield strategies
   - Gasless transactions

## Contributing

We welcome contributions to Cryus! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2025 Cryus Team. All rights reserved. 