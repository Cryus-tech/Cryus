import { ContractTemplate } from '../../templateManager';
import { TokenFeature, BlockchainType } from '../../../../models/contractInterfaces';

/**
 * Mintable BEP-20 token template
 * Provides basic token functionality plus minting:
 * - Transfer
 * - Allowance
 * - Burnable
 * - Mintable (with ownership control)
 */
export const mintableBEP20Template: ContractTemplate = {
  name: 'Mintable BEP-20 Token',
  description: 'BEP-20 token with minting capability for creating new tokens after deployment',
  blockchain: BlockchainType.BSC,
  features: [TokenFeature.MINTABLE, TokenFeature.BURNABLE],
  
  // Mintable BEP-20 ABI
  abi: [
    {
      "inputs": [
        { "internalType": "string", "name": "name_", "type": "string" },
        { "internalType": "string", "name": "symbol_", "type": "string" },
        { "internalType": "uint8", "name": "decimals_", "type": "uint8" },
        { "internalType": "uint256", "name": "initialSupply_", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
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
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
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
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
      "stateMutability": "view",
      "type": "function"
    },
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
    {
      "inputs": [],
      "name": "name",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "recipient", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "sender", "type": "address" },
        { "internalType": "address", "name": "recipient", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "transferFrom",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
  // Mintable BEP-20 bytecode (this is a placeholder - actual bytecode would be much longer)
  bytecode: '0x60806040523480156200001157600080fd5b5060405162001259380380620012598339810160408190526200003491620001db565b8351849084906200004d9060039060208501906200007b565b508151620000639060049060208401906200007b565b5060058054600160ff199091168117909155600655506200029c915050565b8280546200008990620001fc565b90600052602060002090601f016020900481019282620000ad5760008555620000f8565b82601f10620000c857805160ff1916838001178555620000f8565b82800160010185558215620000f8579182015b82811115620000f8578251825591602001919060010190620000db565b50620001069291506200010a565b5090565b5b808211156200010657600081556001016200010b565b634e487b7160e01b600052604160045260246000fd5b60005b838110156200015557818101518382015260200162000137565b8381111562000165576000848401525b50505050565b600082601f8301126200017d57600080fd5b81516001600160401b03808211156200019a576200019a62000121565b604051601f8301601f19908116603f01168101908282118183101715620001c557620001c562000121565b81604052838152602092508683858801011115620001e257600080fd5b600091505b83821015620002065785820183015181830184015290820190620001e7565b83821115620002185760008385830101525b9695505050505050565b80516001600160401b03811681146200023957600080fd5b919050565b600082601f8301126200025057600080fd5b8151620002616200025b8262000281565b62000250565b818152906001600160401b03820183019086111562000280576000805462000280565b6000865550600090601f01919150565b6000819050919050565b6000606082840312156200029557600080fd5b5050919050565b600080600080608085870312156200029557600080fd5b84516001600160401b0380821115620002ba57600080fd5b620002c8888389016200016b565b95506020870151915080821115620002df57600080fd5b620002ed888389016200016b565b9450620002fd6040880162000221565b935060608701519150809211156200031457600080fd5b5062000323878288016200023f565b91505092959194509250565b610ead806200033f6000396000f3fe608060405236600082376000803683855af43d806000803e80610e8d573d6000fd5b5091905056fa220c42f4a7696e92f1291ec5a3ac1142',
}; 