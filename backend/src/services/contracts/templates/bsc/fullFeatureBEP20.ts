import { ContractTemplate } from '../../templateManager';
import { TokenFeature, BlockchainType } from '../../../../models/contractInterfaces';

/**
 * Full-featured BEP-20 token template for BSC
 * This token includes advanced features like voting rights, permit for gasless approvals, and snapshots
 */
export const fullFeatureBEP20Template: ContractTemplate = {
  name: 'fullFeatureBEP20',
  description: 'Advanced BEP-20 token with voting, permits, and snapshots',
  blockchain: BlockchainType.BSC,
  features: [
    TokenFeature.MINTABLE, 
    TokenFeature.BURNABLE,
    TokenFeature.PAUSABLE,
    TokenFeature.PERMIT,
    TokenFeature.VOTES,
    TokenFeature.SNAPSHOT
  ],
  
  // Full-featured BEP-20 ABI (abbreviated for readability)
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
    // Pausable Events
    {
      "anonymous": false,
      "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }],
      "name": "Unpaused",
      "type": "event"
    },
    // Snapshot Events
    {
      "anonymous": false,
      "inputs": [{ "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }],
      "name": "Snapshot",
      "type": "event"
    },
    // Voting Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "delegator", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "toDelegate", "type": "address" }
      ],
      "name": "DelegateChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "delegate", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "previousBalance", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }
      ],
      "name": "DelegateVotesChanged",
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
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "burnFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Pausable Functions
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    // Snapshot Functions
    {
      "inputs": [],
      "name": "snapshot",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" },
        { "internalType": "uint256", "name": "snapshotId", "type": "uint256" }
      ],
      "name": "balanceOfAt",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "snapshotId", "type": "uint256" }],
      "name": "totalSupplyAt",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    // Voting Functions
    {
      "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }],
      "name": "delegate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "delegatee", "type": "address" },
        { "internalType": "uint256", "name": "nonce", "type": "uint256" },
        { "internalType": "uint256", "name": "expiry", "type": "uint256" },
        { "internalType": "uint8", "name": "v", "type": "uint8" },
        { "internalType": "bytes32", "name": "r", "type": "bytes32" },
        { "internalType": "bytes32", "name": "s", "type": "bytes32" }
      ],
      "name": "delegateBySig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "getVotes",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" },
        { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }
      ],
      "name": "getPastVotes",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    // Permit Functions
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
        { "internalType": "uint8", "name": "v", "type": "uint8" },
        { "internalType": "bytes32", "name": "r", "type": "bytes32" },
        { "internalType": "bytes32", "name": "s", "type": "bytes32" }
      ],
      "name": "permit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
      "name": "nonces",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  
  // Full-featured BEP-20 bytecode (this is a placeholder - actual bytecode would be much longer)
  bytecode: '0x60806040523480156200001157600080fd5b5060405162002559380380620025598339810160408190526200003491620001db565b8351849084906200004d9060039060208501906200007b565b508151620000639060049060208401906200007b565b5060058054600160ff199091168117909155600655506200029c915050565b8280546200008990620001fc565b90600052602060002090601f016020900481019282620000ad5760008555620000f8565b82601f10620000c857805160ff1916838001178555620000f8565b82800160010185558215620000f8579182015b82811115620000f8578251825591602001919060010190620000db565b50620001069291506200010a565b5090565b5b808211156200010657600081556001016200010b565b634e487b7160e01b600052604160045260246000fd5b60005b838110156200015557818101518382015260200162000137565b8381111562000165576000848401525b50505050565b600082601f8301126200017d57600080fd5b81516001600160401b03808211156200019a576200019a62000121565b604051601f8301601f19908116603f01168101908282118183101715620001c557620001c562000121565b81604052838152602092508683858801011115620001e257600080fd5b600091505b83821015620002065785820183015181830184015290820190620001e7565b83821115620002185760008385830101525b9695505050505050565b80516001600160401b03811681146200023957600080fd5b919050565b600082601f8301126200025057600080fd5b8151620002616200025b8262000281565b62000250565b818152906001600160401b03820183019086111562000280576000805462000280565b6000865550600090601f01919150565b6000819050919050565b6000606082840312156200029557600080fd5b5050919050565b600080600080608085870312156200029557600080fd5b84516001600160401b0380821115620002ba57600080fd5b620002c8888389016200016b565b95506020870151915080821115620002df57600080fd5b620002ed888389016200016b565b9450620002fd6040880162000221565b935060608701519150809211156200031457600080fd5b5062000323878288016200023f565b91505092959194509250565b610ead806200033f6000396000f3fe608060405236600082376000803683855af43d806000803e80610e8d573d6000fd5b5091905056fa220c42f4a7696e92f1291ec5a3ac1142',
}; 