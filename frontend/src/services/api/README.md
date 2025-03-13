# Blockchain API Services

This directory contains API services related to blockchain functionality for interacting with the backend API.

## Directory Structure

```
api/
├── blockchain.ts        # Blockchain-related API
├── index.ts             # API export index
├── types.ts             # API type definitions
└── README.md            # This document
```

## Usage

### Importing API Services

```typescript
// Import specific API service
import { BlockchainAPI } from '../services/api';

// Or use default export
import API from '../services/api';
const BlockchainAPI = API.blockchain;
```

### Using API Services to Call Backend

```typescript
// Example 1: Get wallet balance
const getWalletBalance = async (walletAddress: string) => {
  try {
    const balance = await BlockchainAPI.getWalletBalance(walletAddress);
    console.log('Wallet balance:', balance);
    return balance;
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    throw error;
  }
};

// Example 2: Transfer tokens
const transferToken = async (
  sourceAddress: string,
  destinationAddress: string,
  mintAddress: string,
  amount: number,
  decimals: number
) => {
  try {
    const result = await BlockchainAPI.transferToken({
      sourceAddress,
      destinationAddress,
      mintAddress,
      amount,
      decimals
    });
    console.log('Transfer result:', result);
    return result;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

// Example 3: Using type definitions
import { TokenBalance, Transaction } from '../services/api/types';

const displayTokens = (tokens: TokenBalance[]) => {
  tokens.forEach(token => {
    console.log(`${token.name} (${token.symbol}): ${token.amount}`);
  });
};

const getTransactionHistory = async (walletAddress: string) => {
  try {
    const transactions = await BlockchainAPI.getTransactionHistory(walletAddress);
    displayTransactions(transactions);
    return transactions;
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    throw error;
  }
};

const displayTransactions = (transactions: Transaction[]) => {
  transactions.forEach(tx => {
    console.log(`
      Transaction ID: ${tx.id}
      Type: ${tx.type}
      Status: ${tx.status}
      Amount: ${tx.amount}
      Time: ${new Date(tx.timestamp).toLocaleString()}
    `);
  });
};
```

### Using in React Components

```tsx
import React, { useState, useEffect } from 'react';
import { BlockchainAPI } from '../services/api';
import { WalletBalance } from '../services/api/types';

const WalletInfo: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const data = await BlockchainAPI.getWalletBalance(walletAddress);
        setBalance(data);
        setError(null);
      } catch (err) {
        setError('Failed to get wallet information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!balance) return <div>No data</div>;

  return (
    <div>
      <h2>Wallet Information</h2>
      <p>SOL Balance: {balance.sol}</p>
      <p>Value (USD): ${balance.usd_value}</p>
      
      <h3>Token List:</h3>
      <ul>
        {balance.tokens.map(token => (
          <li key={token.mint}>
            {token.name} ({token.symbol}): {token.amount}
            {token.usd_value && ` - $${token.usd_value}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalletInfo;
```

## Error Handling

The API service has built-in error interceptors that automatically handle common error situations:

1. If the server returns a 401 unauthorized error, it will automatically clear the locally stored token and redirect to the login page
2. All API errors are logged in the console
3. All API calls should use try/catch to capture and handle possible errors

## How to Extend

Adding new API methods:

1. Add a new method in `blockchain.ts`
2. If needed, add corresponding type definitions in `types.ts`
3. Ensure new methods follow existing naming and parameter conventions 