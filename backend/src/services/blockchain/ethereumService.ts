import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { ERC20_ABI, ERC721_ABI } from '../../utils/contractABIs';
import { 
  TokenBalance, 
  NFT, 
  Transaction, 
  TransactionType, 
  TransactionStatus 
} from '../../models/interfaces';

// Load environment variables
dotenv.config();

// Initialize providers for different networks
const providers = {
  mainnet: new ethers.JsonRpcProvider(process.env.ETHEREUM_MAINNET_RPC || 'https://mainnet.infura.io/v3/your-infura-key'),
  goerli: new ethers.JsonRpcProvider(process.env.ETHEREUM_GOERLI_RPC || 'https://goerli.infura.io/v3/your-infura-key'),
  sepolia: new ethers.JsonRpcProvider(process.env.ETHEREUM_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/your-infura-key'),
};

// Well-known token addresses for price feeds
const WELL_KNOWN_TOKENS = {
  ETH: { 
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 
    decimals: 18, 
    symbol: 'ETH', 
    name: 'Ethereum'
  },
  USDT: { 
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
    decimals: 6, 
    symbol: 'USDT', 
    name: 'Tether USD'
  },
  USDC: { 
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
    decimals: 6, 
    symbol: 'USDC', 
    name: 'USD Coin'
  },
  DAI: { 
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
    decimals: 18, 
    symbol: 'DAI', 
    name: 'Dai Stablecoin'
  },
};

/**
 * Get the provider for the specified network
 * @param network Ethereum network name
 * @returns Ethers provider
 */
const getProvider = (network: string = 'mainnet'): ethers.Provider => {
  return providers[network as keyof typeof providers] || providers.mainnet;
};

/**
 * Get wallet balance in ETH and tokens
 * @param address Ethereum wallet address
 * @param network Ethereum network name
 * @returns Wallet balance information
 */
export const getWalletBalance = async (address: string, network: string = 'mainnet'): Promise<{ eth: number; usd_value: number; tokens: TokenBalance[] }> => {
  try {
    const provider = getProvider(network);
    
    // Get ETH balance
    const balanceWei = await provider.getBalance(address);
    const ethBalance = parseFloat(ethers.formatEther(balanceWei));
    
    // Get tokens (simplified - in a real app, you'd use a token indexer API)
    const tokens = await getTokenBalances(address, network);
    
    // For demo purposes, estimate a USD value (this should use a price oracle in production)
    const ethPrice = await getEthPrice();
    const usdValue = ethBalance * ethPrice;
    
    return {
      eth: ethBalance,
      usd_value: usdValue,
      tokens
    };
  } catch (error) {
    console.error('Error getting Ethereum wallet balance:', error);
    throw new Error('Failed to get wallet balance');
  }
};

/**
 * Get token balances for a wallet address
 * @param address Ethereum wallet address
 * @param network Ethereum network name
 * @returns Array of token balances
 */
export const getTokenBalances = async (address: string, network: string = 'mainnet'): Promise<TokenBalance[]> => {
  try {
    const provider = getProvider(network);
    const tokenBalances: TokenBalance[] = [];
    
    // In a real app, you would query a token indexer API or subgraph
    // For demo, we're checking a few well-known tokens
    const tokenAddresses = Object.values(WELL_KNOWN_TOKENS)
      .filter(token => token.symbol !== 'ETH')
      .map(token => token.address);
    
    for (const tokenAddress of tokenAddresses) {
      try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        
        if (balance > 0n) {
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();
          const name = await tokenContract.name();
          
          const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
          
          // Get USD value (in a real app, use a price API)
          const usdPrice = await getTokenPrice(tokenAddress);
          const usdValue = formattedBalance * usdPrice;
          
          tokenBalances.push({
            mint: tokenAddress,
            symbol,
            name,
            amount: formattedBalance,
            decimals,
            usd_value: usdValue,
          });
        }
      } catch (error) {
        console.error(`Error getting balance for token ${tokenAddress}:`, error);
        // Continue with other tokens
      }
    }
    
    return tokenBalances;
  } catch (error) {
    console.error('Error getting token balances:', error);
    throw new Error('Failed to get token balances');
  }
};

/**
 * Get NFTs owned by a wallet address
 * @param address Ethereum wallet address
 * @param network Ethereum network name
 * @returns Array of NFTs
 */
export const getNFTs = async (address: string, network: string = 'mainnet'): Promise<NFT[]> => {
  try {
    const provider = getProvider(network);
    const nfts: NFT[] = [];
    
    // In a real app, you would query an NFT indexer API or subgraph
    // This is a simplified placeholder version
    
    // For example, check if the address owns any NFTs from a sample collection
    const sampleNFTAddresses = [
      '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYC
      '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', // CryptoPunks
    ];
    
    for (const contractAddress of sampleNFTAddresses) {
      try {
        const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
        const balance = await nftContract.balanceOf(address);
        
        if (balance > 0n) {
          const name = await nftContract.name();
          const symbol = await nftContract.symbol();
          
          // Find token IDs owned by the address
          for (let i = 0; i < parseInt(balance.toString()); i++) {
            try {
              const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
              const uri = await nftContract.tokenURI(tokenId);
              
              nfts.push({
                mint: contractAddress,
                name: `${name} #${tokenId.toString()}`,
                symbol,
                uri,
                owner: address,
                image_url: '', // In a real app, fetch from metadata
                description: '', // In a real app, fetch from metadata
              });
            } catch (error) {
              console.error(`Error getting NFT details at index ${i}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking NFTs for contract ${contractAddress}:`, error);
      }
    }
    
    return nfts;
  } catch (error) {
    console.error('Error getting NFTs:', error);
    throw new Error('Failed to get NFTs');
  }
};

/**
 * Get transaction history for a wallet address
 * @param address Ethereum wallet address
 * @param limit Maximum number of transactions to return
 * @param network Ethereum network name
 * @returns Array of transactions
 */
export const getTransactionHistory = async (address: string, limit: number = 10, network: string = 'mainnet'): Promise<Transaction[]> => {
  try {
    const provider = getProvider(network);
    const transactions: Transaction[] = [];
    
    // Get the latest block number
    const blockNumber = await provider.getBlockNumber();
    
    // Start from the latest block and go backwards
    for (let i = blockNumber; i > blockNumber - 1000 && transactions.length < limit; i -= 10) {
      try {
        const block = await provider.getBlock(i, true);
        
        if (block && block.transactions) {
          // Filter transactions involving the address
          const relevantTxs = block.transactions.filter((tx) => 
            tx.from?.toLowerCase() === address.toLowerCase() || 
            tx.to?.toLowerCase() === address.toLowerCase()
          );
          
          for (const tx of relevantTxs) {
            if (transactions.length >= limit) break;
            
            const txReceipt = await provider.getTransactionReceipt(tx.hash);
            const successStatus = txReceipt?.status === 1;
            
            let txType = TransactionType.OTHER;
            if (tx.data === '0x' && tx.to) {
              txType = TransactionType.ETH_TRANSFER;
            } else {
              // In a real app, you would decode the transaction data to determine the type
              txType = TransactionType.TOKEN_TRANSFER;
            }
            
            transactions.push({
              id: tx.hash,
              hash: tx.hash,
              type: txType,
              status: successStatus ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
              amount: parseFloat(ethers.formatEther(tx.value || 0n)),
              fee: txReceipt ? parseFloat(ethers.formatEther((txReceipt.gasUsed || 0n) * (txReceipt.gasPrice || 0n))) : 0,
              from: tx.from || '',
              to: tx.to || '',
              timestamp: new Date((block.timestamp || 0) * 1000).toISOString(),
              confirmations: blockNumber - block.number,
              block_number: block.number,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing block ${i}:`, error);
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw new Error('Failed to get transaction history');
  }
};

/**
 * Send ETH to another address
 * @param privateKey Sender's private key
 * @param to Recipient address
 * @param amount Amount to send in ETH
 * @param network Ethereum network name
 * @returns Transaction hash
 */
export const sendETH = async (privateKey: string, to: string, amount: number, network: string = 'mainnet'): Promise<string> => {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toString()),
    });
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending ETH:', error);
    throw new Error('Failed to send ETH');
  }
};

/**
 * Send tokens to another address
 * @param privateKey Sender's private key
 * @param tokenAddress Token contract address
 * @param to Recipient address
 * @param amount Amount to send (in token units)
 * @param decimals Token decimals
 * @param network Ethereum network name
 * @returns Transaction hash
 */
export const sendToken = async (
  privateKey: string, 
  tokenAddress: string, 
  to: string, 
  amount: number, 
  decimals: number, 
  network: string = 'mainnet'
): Promise<string> => {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);
    
    const tx = await tokenContract.transfer(to, amountInWei);
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending token:', error);
    throw new Error('Failed to send token');
  }
};

/**
 * Deploy an ERC20 token contract
 * @param privateKey Deployer's private key
 * @param name Token name
 * @param symbol Token symbol
 * @param decimals Token decimals
 * @param initialSupply Initial supply (in token units)
 * @param maxSupply Maximum supply (0 for unlimited)
 * @param network Ethereum network name
 * @returns Deployed contract address
 */
export const deployERC20 = async (
  privateKey: string,
  name: string,
  symbol: string,
  decimals: number,
  initialSupply: number,
  maxSupply: number,
  network: string = 'goerli'
): Promise<string> => {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // ERC20 contract bytecode and ABI would be imported from compilation result
    // This is simplified for demonstration
    const abi = [/* ERC20 ABI */];
    const bytecode = '0x...'; // Compiled bytecode
    
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(
      name,
      symbol,
      decimals,
      ethers.parseUnits(initialSupply.toString(), decimals),
      maxSupply > 0 ? ethers.parseUnits(maxSupply.toString(), decimals) : 0,
      wallet.address
    );
    
    await contract.deploymentTransaction()?.wait();
    
    return contract.target as string;
  } catch (error) {
    console.error('Error deploying ERC20 token:', error);
    throw new Error('Failed to deploy ERC20 token');
  }
};

/**
 * Deploy an ERC721 (NFT) token contract
 * @param privateKey Deployer's private key
 * @param name Collection name
 * @param symbol Collection symbol
 * @param baseURI Base URI for token metadata
 * @param maxSupply Maximum supply (0 for unlimited)
 * @param royaltyFee Royalty fee basis points (e.g., 250 = 2.5%)
 * @param network Ethereum network name
 * @returns Deployed contract address
 */
export const deployERC721 = async (
  privateKey: string,
  name: string,
  symbol: string,
  baseURI: string,
  maxSupply: number,
  royaltyFee: number,
  network: string = 'goerli'
): Promise<string> => {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // ERC721 contract bytecode and ABI would be imported from compilation result
    // This is simplified for demonstration
    const abi = [/* ERC721 ABI */];
    const bytecode = '0x...'; // Compiled bytecode
    
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(
      name,
      symbol,
      maxSupply,
      royaltyFee,
      wallet.address,
      wallet.address
    );
    
    await contract.deploymentTransaction()?.wait();
    
    // Set the base URI if provided
    if (baseURI) {
      await contract.setBaseURI(baseURI);
    }
    
    return contract.target as string;
  } catch (error) {
    console.error('Error deploying ERC721 token:', error);
    throw new Error('Failed to deploy ERC721 token');
  }
};

/**
 * Mint an NFT from an ERC721 contract
 * @param privateKey Minter's private key
 * @param contractAddress NFT contract address
 * @param to Recipient address
 * @param tokenURI Token URI for metadata
 * @param network Ethereum network name
 * @returns Transaction hash
 */
export const mintNFT = async (
  privateKey: string,
  contractAddress: string,
  to: string,
  tokenURI: string,
  network: string = 'goerli'
): Promise<string> => {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);
    const tx = await nftContract.mint(to, tokenURI, '');
    
    return tx.hash;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw new Error('Failed to mint NFT');
  }
};

/**
 * Get the current ETH price in USD
 * @returns ETH price in USD
 */
const getEthPrice = async (): Promise<number> => {
  try {
    // In a real app, you would call a price oracle or API
    // This is a placeholder implementation
    return 3500; // Example ETH price in USD
  } catch (error) {
    console.error('Error getting ETH price:', error);
    return 3500; // Default fallback price
  }
};

/**
 * Get the price of a token in USD
 * @param tokenAddress Token contract address
 * @returns Token price in USD
 */
const getTokenPrice = async (tokenAddress: string): Promise<number> => {
  try {
    // In a real app, you would call a price oracle or API
    // This is a placeholder implementation
    const tokenPrices: Record<string, number> = {
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 1.0, // USDT
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 1.0, // USDC
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 1.0, // DAI
    };
    
    return tokenPrices[tokenAddress.toLowerCase()] || 0;
  } catch (error) {
    console.error('Error getting token price:', error);
    return 0; // Default fallback price
  }
};

/**
 * Get the current network status
 * @param network Ethereum network name
 * @returns Network status information
 */
export const getNetworkStatus = async (network: string = 'mainnet'): Promise<{ 
  name: string;
  current_block: number;
  gas_price: number;
  is_healthy: boolean;
}> => {
  try {
    const provider = getProvider(network);
    
    const [blockNumber, gasPrice] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData().then(data => data.gasPrice || 0n),
    ]);
    
    return {
      name: network,
      current_block: blockNumber,
      gas_price: parseFloat(ethers.formatUnits(gasPrice, 'gwei')),
      is_healthy: true,
    };
  } catch (error) {
    console.error('Error getting network status:', error);
    return {
      name: network,
      current_block: 0,
      gas_price: 0,
      is_healthy: false,
    };
  }
}; 