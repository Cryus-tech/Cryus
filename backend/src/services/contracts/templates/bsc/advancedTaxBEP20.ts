import { ContractTemplate } from '../../templateManager';
import { TokenFeature, BlockchainType } from '../../../../models/contractInterfaces';

/**
 * Advanced Tax BEP-20 token template for BSC
 * This token includes customizable tax mechanisms for buys, sells, and transfers
 * All tax fees can be directed to different wallets (marketing, development, liquidity)
 */
export const advancedTaxBEP20Template: ContractTemplate = {
  name: 'advancedTaxBEP20',
  description: 'BEP-20 token with advanced tax mechanisms for buys, sells, and transfers',
  blockchain: BlockchainType.BSC,
  features: [
    TokenFeature.MINTABLE, 
    TokenFeature.BURNABLE,
    TokenFeature.TAX,
    TokenFeature.ANTI_BOT,
    TokenFeature.BLACKLIST
  ],
  
  // Advanced Tax BEP-20 ABI (abbreviated for readability)
  abi: [
    {
      "inputs": [
        { "internalType": "string", "name": "name_", "type": "string" },
        { "internalType": "string", "name": "symbol_", "type": "string" },
        { "internalType": "uint8", "name": "decimals_", "type": "uint8" },
        { "internalType": "uint256", "name": "initialSupply_", "type": "uint256" },
        { "internalType": "address", "name": "marketingWallet_", "type": "address" },
        { "internalType": "address", "name": "devWallet_", "type": "address" },
        { "internalType": "address", "name": "liquidityWallet_", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    // Standard BEP-20 Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "Transfer",
      "type": "event"
    },
    // Ownership Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    // Tax Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "uint256", "name": "buyMarketingTax", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "buyDevTax", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "buyLiquidityTax", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "sellMarketingTax", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "sellDevTax", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "sellLiquidityTax", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "transferTax", "type": "uint256" }
      ],
      "name": "TaxesUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "TaxFeeCollected",
      "type": "event"
    },
    // Blacklist Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "account", "type": "address" },
        { "indexed": false, "internalType": "bool", "name": "isBlacklisted", "type": "bool" }
      ],
      "name": "BlacklistUpdated",
      "type": "event"
    },
    // Anti-Bot Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "bool", "name": "enabled", "type": "bool" },
        { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }
      ],
      "name": "AntiBotStatusUpdated",
      "type": "event"
    },
    // Standard BEP-20 Functions
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "spender", "type": "address" }
      ],
      "name": "allowance",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "approve",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "transferFrom",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Mintable Functions
    {
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Burnable Functions
    {
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Tax Management Functions
    {
      "inputs": [
        { "internalType": "uint256", "name": "buyMarketingTax_", "type": "uint256" },
        { "internalType": "uint256", "name": "buyDevTax_", "type": "uint256" },
        { "internalType": "uint256", "name": "buyLiquidityTax_", "type": "uint256" },
        { "internalType": "uint256", "name": "sellMarketingTax_", "type": "uint256" },
        { "internalType": "uint256", "name": "sellDevTax_", "type": "uint256" },
        { "internalType": "uint256", "name": "sellLiquidityTax_", "type": "uint256" },
        { "internalType": "uint256", "name": "transferTax_", "type": "uint256" }
      ],
      "name": "setTaxes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "marketingWallet_", "type": "address" },
        { "internalType": "address", "name": "devWallet_", "type": "address" },
        { "internalType": "address", "name": "liquidityWallet_", "type": "address" }
      ],
      "name": "setTaxWallets",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "dexPair_", "type": "address" }],
      "name": "setAutomatedMarketMaker",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bool", "name": "enabled_", "type": "bool" }],
      "name": "setTaxEnabled",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Blacklist Functions
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" },
        { "internalType": "bool", "name": "isBlacklisted", "type": "bool" }
      ],
      "name": "setBlacklist",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address[]", "name": "accounts", "type": "address[]" },
        { "internalType": "bool", "name": "isBlacklisted", "type": "bool" }
      ],
      "name": "bulkSetBlacklist",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "isBlacklisted",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    // Anti-Bot Functions
    {
      "inputs": [
        { "internalType": "bool", "name": "enabled_", "type": "bool" },
        { "internalType": "uint256", "name": "duration_", "type": "uint256" }
      ],
      "name": "setAntiBotProtection",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" },
        { "internalType": "bool", "name": "exempt", "type": "bool" }
      ],
      "name": "setAntiBotExempt",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Tax View Functions
    {
      "inputs": [],
      "name": "getTaxInfo",
      "outputs": [
        { "internalType": "uint256", "name": "buyMarketingTax", "type": "uint256" },
        { "internalType": "uint256", "name": "buyDevTax", "type": "uint256" },
        { "internalType": "uint256", "name": "buyLiquidityTax", "type": "uint256" },
        { "internalType": "uint256", "name": "sellMarketingTax", "type": "uint256" },
        { "internalType": "uint256", "name": "sellDevTax", "type": "uint256" },
        { "internalType": "uint256", "name": "sellLiquidityTax", "type": "uint256" },
        { "internalType": "uint256", "name": "transferTax", "type": "uint256" },
        { "internalType": "bool", "name": "taxEnabled", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTaxWallets",
      "outputs": [
        { "internalType": "address", "name": "marketingWallet", "type": "address" },
        { "internalType": "address", "name": "devWallet", "type": "address" },
        { "internalType": "address", "name": "liquidityWallet", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  
  // Advanced Tax BEP-20 bytecode (this is a placeholder - actual bytecode would be much longer)
  bytecode: '0x608060405234801561001057600080fd5b50604051620025a8380380620025a8833981016040819052610031916102a9565b8651865114610081576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201526f125394915050151051195113d497d25395604482015260640160405180910390fd5b600080546001600160a01b03191633179055845161010090046001600160a01b0316156100d85784516001600160a01b03908116610100909204161760a052610114565b60405180906000906100ea908490602001610339565b6040516020818303038152906040528051906020012060a05260016101115760006101115760006000fd5b505b83516101279060019060208701906101eb565b50825161013b9060029060208601906101eb565b506003805461ffff191661010060ff8716021790556004839055600580546001600160a01b0319166001600160a01b038781169190911790915560068054918716919091179055600780549185169184169190911790556101e5848484848080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508e9250508c9150899050610269565b50505050505050505050565b8280546101f7906103a5565b90600052602060002090601f01602090048101928261021957600085556102a0565b82601f1061023257805160ff191683800117855561025f565b8280016001018555821561025f579182015b8281111561025f578251825591602001919060010190610244565b5061026b92915061027c565b5090565b8361027657600080fd5b50505050565b5b8082111561026b576000815560010161027d565b805180151581146102a457600080fd5b919050565b600080600080600080600080610100898b0312156102c657600080fd5b88516001600160401b03808211156102dd57600080fd5b6102e98c838d016102f2565b995060208b01519850604089015196506060890151955060808901519450610312608060a08c01610294565b9350610320608060c08c01610294565b9250610120608060e08c01610294565b915050809150509295985092959890939650565b602080825281016001600160401b0381111561035557600080fd5b825180820285010160208101910161036c57600080fd5b8181528381602001915060200182905b8381101561039a578051835260209283019201610382565b505050505050565b600181811c908216806103b957607f821691505b602082108114156103da57634e487b7160e01b600052602260045260246000fd5b5091905056fea2646970667358221220f51e5ce72dd4dc23a2dfabce26b6b4f4c4a298dba4d73'
}; 