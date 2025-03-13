# Cryus Blockchain Service

This directory contains the blockchain integration service for the Cryus project, supporting interactions with Solana smart contracts.

## Feature Overview

The blockchain service provides the following main features:

### Token Operations

- Create token mint accounts
- Create token accounts
- Mint tokens
- Transfer tokens
- Burn tokens

### NFT Operations

- Create NFTs
- Transfer NFT ownership
- Update NFT metadata

### Query Functions

- Get account balances
- Get token account information
- Get mint account information
- Get NFT information
- Query transaction history
- Get transaction details

## Configuration

Before using the blockchain service, you need to configure the following environment variables in the `.env` file:

```
SOLANA_NETWORK=devnet               # Options: mainnet, testnet, devnet
SOLANA_KEYPAIR_PATH=/path/to/keypair.json  # Path to Solana wallet keypair file
SOLANA_TOKEN_PROGRAM_ID=your_token_program_id   # Token contract ID
SOLANA_NFT_PROGRAM_ID=your_nft_program_id       # NFT contract ID
```

## How to Use

### Using the Blockchain Service in Controllers

```typescript
import { SolanaService } from '../services/blockchain/solanaService';

// Create service instance
const solanaService = new SolanaService();

// Create token mint account
const result = await solanaService.createTokenMint(9); // Create a token with 9 decimal places
console.log(`Mint account address: ${result.mintAddress}`);
console.log(`Transaction signature: ${result.signature}`);

// Create token account
const accountResult = await solanaService.createTokenAccount(result.mintAddress);
console.log(`Token account address: ${accountResult.tokenAccountAddress}`);

// Mint tokens
const mintSignature = await solanaService.mintTokens(
  result.mintAddress,
  accountResult.tokenAccountAddress,
  1000000000 // Mint 1 token (assuming 9 decimal places)
);
```

### Using Blockchain Features via API

All blockchain features are provided through the following API endpoints (authentication required):

```
POST /api/blockchain/token/mint           # Create token mint account
POST /api/blockchain/token/account        # Create token account
POST /api/blockchain/token/mint-tokens    # Mint tokens
POST /api/blockchain/token/transfer       # Transfer tokens
POST /api/blockchain/token/burn           # Burn tokens

POST /api/blockchain/nft/create           # Create NFT
POST /api/blockchain/nft/transfer         # Transfer NFT
POST /api/blockchain/nft/update-metadata  # Update NFT metadata

GET  /api/blockchain/balance/:address     # Get account balance
GET  /api/blockchain/token/account/:address # Get token account info
GET  /api/blockchain/token/mint/:address  # Get mint account info
GET  /api/blockchain/nft/:address         # Get NFT info

GET  /api/blockchain/transactions         # Get transaction history
GET  /api/blockchain/transactions/:id     # Get transaction details
```

## Transaction Records

All blockchain interactions are recorded in the `BlockchainTransaction` model, including:

- Transaction type
- Blockchain network
- Transaction status
- Transaction hash
- Related addresses
- Transaction amount
- Other transaction data

## Error Handling

Blockchain operations may encounter various errors, such as:

- Network errors
- Blockchain errors (e.g., insufficient balance)
- Signature errors

All errors are captured and properly handled, with failed transactions recorded in the database along with error information.

## Security Considerations

- Do not hardcode keys in your code
- Only authenticated users should access blockchain functions
- All transactions are logged in the database for auditing
- It is recommended to use hardware wallets to manage keys in production environments 