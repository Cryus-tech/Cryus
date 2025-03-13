# Cryus Token Smart Contract

This is a token smart contract based on the Solana blockchain, implementing basic token functionalities including:

- Initializing token mint accounts
- Minting new tokens
- Transferring tokens
- Burning tokens

## Contract Structure

The contract primarily consists of the following components:

1. **TokenInstruction** - Defines the instruction types supported by the contract
2. **TokenAccount** - Data structure for token accounts
3. **Mint** - Data structure for token mint accounts
4. **Processing Functions** - Functions that handle various token operations

## Instructions

### Initialize Token Mint (InitializeMint)

Creates a new token type, setting its decimals and minting authority.

### Mint Tokens (MintTo)

Creates new tokens by the minting authority and adds them to a specified account.

### Transfer Tokens (Transfer)

Transfers tokens between accounts.

### Burn Tokens (Burn)

Removes tokens from circulation.

## Building and Deployment

### Prerequisites

- Rust and Cargo
- Solana CLI tools

### Building

```bash
cargo build-bpf
```

### Deployment

```bash
solana program deploy target/deploy/cryus_token.so
```

## Usage Examples

Please refer to the Solana documentation and sample client code to learn how to interact with this contract.

## Security Considerations

This contract is for demonstration purposes only and has not undergone a security audit. Before using in a production environment, please ensure a comprehensive security review is conducted. 