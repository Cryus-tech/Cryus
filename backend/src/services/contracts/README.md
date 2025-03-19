# Smart Contract Template System

This directory contains the Smart Contract Template System for the Cryus AI-Driven Token Generation Platform. The system is designed to provide a flexible and extensible way to manage and generate smart contract templates for various blockchains.

## System Architecture

The Smart Contract Template System consists of the following components:

### 1. Template Manager

The `TemplateManager` class (`templateManager.ts`) is responsible for:
- Registering smart contract templates
- Selecting the appropriate template based on token configuration
- Providing access to available templates for a given blockchain

### 2. Contract Templates

Contract templates are organized by blockchain and type:
- `/templates/bsc/` - Templates for BNB Smart Chain (BSC)
  - `standardBEP20.ts` - Standard BEP-20 token with basic functionality
  - `mintableBEP20.ts` - BEP-20 token with minting capability
  - `fullFeatureBEP20.ts` - Full-featured BEP-20 token with voting, permits, and snapshots
  - `advancedTaxBEP20.ts` - Advanced BEP-20 token with tax mechanisms for buys, sells, and transfers

Each template implements the `ContractTemplate` interface, providing:
- Metadata (name, description)
- Blockchain compatibility
- Supported token features
- ABI (Application Binary Interface)
- Bytecode

### 3. Integration with Blockchain Adapters

The Template System integrates with blockchain adapters (`../blockchain/`) to:
- Deploy contracts to the blockchain
- Estimate deployment fees
- Monitor transaction statuses

## Supported Token Features

The system supports various token features:

| Feature | Description |
|---------|-------------|
| MINTABLE | Allows creating new tokens after deployment |
| BURNABLE | Allows destroying tokens |
| PAUSABLE | Allows pausing token transfers in emergencies |
| PERMIT | Enables gasless approvals using EIP-2612 |
| VOTES | Enables governance voting functionality |
| SNAPSHOT | Allows taking balance snapshots at specific blocks |
| FLASH_MINTING | Supports flash loans/minting |
| ANTI_BOT | Anti-bot protection mechanisms |
| LIQUIDITY_GENERATOR | Automatic liquidity generation on transfers |
| TAX | Configurable tax on buys, sells, and transfers |
| MAX_TRANSACTION | Limits on maximum transaction amounts |
| MAX_WALLET | Limits on maximum wallet holdings |
| BLACKLIST | Ability to blacklist malicious addresses |

## Usage Example

```typescript
import { TemplateManager } from './templateManager';
import { TokenConfig, TokenFeature, BlockchainType } from '../../models/contractInterfaces';

// Create token configuration
const tokenConfig: TokenConfig = {
  name: "My Token",
  symbol: "MTK",
  decimals: 18,
  initialSupply: "1000000",
  features: [
    TokenFeature.MINTABLE,
    TokenFeature.BURNABLE,
    TokenFeature.PAUSABLE
  ]
};

// Get appropriate template
const templateManager = new TemplateManager();
const template = templateManager.getTemplateForToken(tokenConfig, BlockchainType.BSC);

// Template can then be used with a blockchain adapter to deploy the token
console.log(`Selected template: ${template.name}`);
console.log(`Description: ${template.description}`);
console.log(`Supported features: ${template.features.join(', ')}`);
```

## Adding New Templates

To add a new contract template:

1. Create a new file in the appropriate blockchain directory
2. Implement the `ContractTemplate` interface
3. Register the template in the `TemplateManager` constructor

Example for a new BSC template:

```typescript
import { ContractTemplate } from '../../templateManager';
import { TokenFeature, BlockchainType } from '../../../../models/contractInterfaces';

export const newTemplate: ContractTemplate = {
  name: 'newTemplateName',
  description: 'Description of the new template',
  blockchain: BlockchainType.BSC,
  features: [TokenFeature.MINTABLE, TokenFeature.BURNABLE],
  abi: [...],
  bytecode: '0x...'
};
```

Then register it in `templateManager.ts`:

```typescript
constructor() {
  // Register BSC templates
  this.registerTemplate(standardBEP20Template);
  this.registerTemplate(mintableBEP20Template);
  this.registerTemplate(fullFeatureBEP20Template);
  this.registerTemplate(advancedTaxBEP20Template);
  this.registerTemplate(newTemplate); // Register your new template
}
```

## Future Extensions

The template system is designed to be extensible for future blockchains and token standards:

- Support for Ethereum (ERC-20, ERC-721, ERC-1155)
- Support for Solana (SPL tokens)
- Support for Polygon, Avalanche, and other EVM-compatible chains
- Integration with AI-driven code generation for customized contracts 