import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { SolanaService } from '../services/blockchain/solanaService';
import { BlockchainTransaction } from '../models/BlockchainTransaction';
import * as ethereumService from '../services/blockchain/ethereumService';
import { WalletBalance, TokenBalance, NFT, Transaction, NetworkStatus } from '../models/interfaces';

// Create Solana service instance
const solanaService = new SolanaService();

/**
 * Record blockchain transaction
 * @param userId User ID
 * @param txType Transaction type
 * @param blockchain Blockchain
 * @param txData Transaction data
 * @param status Transaction status
 * @param error Error message (if any)
 * @returns Created transaction record
 */
async function recordTransaction(
  userId: string,
  txType: string, 
  blockchain: string, 
  txData: any, 
  status: string = 'pending', 
  error?: string
) {
  try {
    const transaction = await BlockchainTransaction.create({
      user: userId,
      transactionType: txType,
      blockchain,
      status,
      txHash: txData.signature,
      addresses: {
        source: txData.sourceAddress,
        destination: txData.destinationAddress,
        mint: txData.mintAddress,
        token: txData.tokenAccountAddress,
        nft: txData.nftAddress,
      },
      amount: txData.amount,
      data: txData,
      error,
    });
    return transaction;
  } catch (err) {
    console.error('Failed to record transaction:', err);
    // Don't throw error to avoid affecting main functionality
    return null;
  }
}

/**
 * Create token mint account
 */
export const createTokenMint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { decimals } = req.body;

    // Create token mint account
    const result = await solanaService.createTokenMint(decimals);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'mint_creation',
      'Solana',
      {
        decimals,
        mintAddress: result.mintAddress,
        signature: result.signature,
      }
    );

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'mint_creation',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Create token account
 */
export const createTokenAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mintAddress } = req.body;

    // Create token account
    const result = await solanaService.createTokenAccount(mintAddress);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'account_creation',
      'Solana',
      {
        mintAddress,
        tokenAccountAddress: result.tokenAccountAddress,
        signature: result.signature,
      }
    );

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'account_creation',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Mint tokens
 */
export const mintTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mintAddress, destinationAddress, amount } = req.body;

    // Mint tokens
    const signature = await solanaService.mintTokens(mintAddress, destinationAddress, amount);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'token_mint',
      'Solana',
      {
        mintAddress,
        destinationAddress,
        amount,
        signature,
      }
    );

    res.status(200).json({
      status: 'success',
      data: { signature },
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'token_mint',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Transfer tokens
 */
export const transferTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sourceAddress, destinationAddress, amount } = req.body;

    // Transfer tokens
    const signature = await solanaService.transferTokens(sourceAddress, destinationAddress, amount);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'token_transfer',
      'Solana',
      {
        sourceAddress,
        destinationAddress,
        amount,
        signature,
      }
    );

    res.status(200).json({
      status: 'success',
      data: { signature },
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'token_transfer',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Burn tokens
 */
export const burnTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenAccountAddress, mintAddress, amount } = req.body;

    // Burn tokens
    const signature = await solanaService.burnTokens(tokenAccountAddress, mintAddress, amount);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'token_burn',
      'Solana',
      {
        tokenAccountAddress,
        mintAddress,
        amount,
        signature,
      }
    );

    res.status(200).json({
      status: 'success',
      data: { signature },
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'token_burn',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Create NFT
 */
export const createNFT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, symbol, uri, royaltyPercentage, isMutable } = req.body;

    // Create NFT
    const result = await solanaService.createNFT(name, symbol, uri, royaltyPercentage, isMutable);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'nft_creation',
      'Solana',
      {
        name,
        symbol,
        uri,
        royaltyPercentage,
        isMutable,
        nftAddress: result.nftAddress,
        signature: result.signature,
      }
    );

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'nft_creation',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Transfer NFT ownership
 */
export const transferNFT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nftAddress, newOwnerAddress } = req.body;

    // Transfer NFT
    const signature = await solanaService.transferNFT(nftAddress, newOwnerAddress);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'nft_transfer',
      'Solana',
      {
        nftAddress,
        newOwnerAddress,
        signature,
      }
    );

    res.status(200).json({
      status: 'success',
      data: { signature },
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'nft_transfer',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Update NFT metadata
 */
export const updateNFTMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nftAddress, name, symbol, uri } = req.body;

    // Update NFT metadata
    const signature = await solanaService.updateNFTMetadata(nftAddress, name, symbol, uri);

    // Record transaction
    await recordTransaction(
      req.user._id,
      'nft_update',
      'Solana',
      {
        nftAddress,
        name,
        symbol,
        uri,
        signature,
      }
    );

    res.status(200).json({
      status: 'success',
      data: { signature },
    });
  } catch (error) {
    // Record failed transaction
    if (req.user) {
      await recordTransaction(
        req.user._id,
        'nft_update',
        'Solana',
        req.body,
        'failed',
        error.message
      );
    }
    next(error);
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const query: any = { user: userId };
    
    if (type) query.transactionType = type;
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const transactions = await BlockchainTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await BlockchainTransaction.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const transaction = await BlockchainTransaction.findOne({ 
      _id: id,
      user: userId, 
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction record not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get account balance
 */
export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    // Get balance
    const balance = await solanaService.getBalance(address);

    res.status(200).json({
      status: 'success',
      data: { balance },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get token account info
 */
export const getTokenAccountInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    // Get token account info
    const accountInfo = await solanaService.getTokenAccountInfo(address);

    res.status(200).json({
      status: 'success',
      data: { accountInfo },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get token mint info
 */
export const getMintInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    // Get mint info
    const mintInfo = await solanaService.getMintInfo(address);

    res.status(200).json({
      status: 'success',
      data: { mintInfo },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get NFT info
 */
export const getNFTInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    // Get NFT info
    const nftInfo = await solanaService.getNFTInfo(address);

    res.status(200).json({
      status: 'success',
      data: { nftInfo },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取钱包余额（跨链）
 * @param req - Express请求对象，需要包含address和blockchain参数
 * @param res - Express响应对象
 */
async function getWalletBalance(req: Request, res: Response): Promise<void> {
  try {
    const { address, blockchain = 'solana' } = req.query;
    
    if (!address) {
      res.status(400).json({ error: '缺少钱包地址' });
      return;
    }
    
    let balance: any;
    
    switch (blockchain) {
      case 'solana':
        balance = await solanaService.getWalletBalance(address as string);
        break;
      case 'ethereum':
        const network = req.query.network as string || 'mainnet';
        balance = await ethereumService.getWalletBalance(address as string, network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json(balance);
  } catch (error) {
    console.error('获取钱包余额时出错:', error);
    res.status(500).json({ error: '获取钱包余额失败' });
  }
}

/**
 * 获取代币余额（跨链）
 * @param req - Express请求对象，需要包含address和blockchain参数
 * @param res - Express响应对象
 */
async function getTokenBalances(req: Request, res: Response): Promise<void> {
  try {
    const { address, blockchain = 'solana' } = req.query;
    
    if (!address) {
      res.status(400).json({ error: '缺少钱包地址' });
      return;
    }
    
    let tokens: TokenBalance[] = [];
    
    switch (blockchain) {
      case 'solana':
        tokens = await solanaService.getTokenBalances(address as string);
        break;
      case 'ethereum':
        const network = req.query.network as string || 'mainnet';
        tokens = await ethereumService.getTokenBalances(address as string, network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json(tokens);
  } catch (error) {
    console.error('获取代币余额时出错:', error);
    res.status(500).json({ error: '获取代币余额失败' });
  }
}

/**
 * 获取NFT（跨链）
 * @param req - Express请求对象，需要包含address和blockchain参数
 * @param res - Express响应对象
 */
async function getNFTs(req: Request, res: Response): Promise<void> {
  try {
    const { address, blockchain = 'solana' } = req.query;
    
    if (!address) {
      res.status(400).json({ error: '缺少钱包地址' });
      return;
    }
    
    let nfts: NFT[] = [];
    
    switch (blockchain) {
      case 'solana':
        nfts = await solanaService.getNFTs(address as string);
        break;
      case 'ethereum':
        const network = req.query.network as string || 'mainnet';
        nfts = await ethereumService.getNFTs(address as string, network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json(nfts);
  } catch (error) {
    console.error('获取NFT时出错:', error);
    res.status(500).json({ error: '获取NFT失败' });
  }
}

/**
 * 获取交易历史（跨链）
 * @param req - Express请求对象，需要包含address、limit和blockchain参数
 * @param res - Express响应对象
 */
async function getTransactionHistory(req: Request, res: Response): Promise<void> {
  try {
    const { address, limit = '10', blockchain = 'solana' } = req.query;
    
    if (!address) {
      res.status(400).json({ error: '缺少钱包地址' });
      return;
    }
    
    const limitNum = parseInt(limit as string, 10);
    let transactions: Transaction[] = [];
    
    switch (blockchain) {
      case 'solana':
        transactions = await solanaService.getTransactionHistory(address as string, limitNum);
        break;
      case 'ethereum':
        const network = req.query.network as string || 'mainnet';
        transactions = await ethereumService.getTransactionHistory(address as string, limitNum, network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('获取交易历史时出错:', error);
    res.status(500).json({ error: '获取交易历史失败' });
  }
}

/**
 * 发送资产（SOL或ETH）
 * @param req - Express请求对象，需要包含privateKey、to、amount和blockchain参数
 * @param res - Express响应对象
 */
async function sendAsset(req: Request, res: Response): Promise<void> {
  try {
    const { privateKey, to, amount, blockchain = 'solana' } = req.body;
    
    if (!privateKey || !to || !amount) {
      res.status(400).json({ error: '缺少必要参数：privateKey、to或amount' });
      return;
    }
    
    let txHash: string;
    
    switch (blockchain) {
      case 'solana':
        txHash = await solanaService.sendSOL(privateKey, to, parseFloat(amount));
        break;
      case 'ethereum':
        const network = req.body.network || 'mainnet';
        txHash = await ethereumService.sendETH(privateKey, to, parseFloat(amount), network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json({ txHash });
  } catch (error) {
    console.error('发送资产时出错:', error);
    res.status(500).json({ error: '发送资产失败' });
  }
}

/**
 * 发送代币
 * @param req - Express请求对象，需要包含privateKey、tokenAddress、to、amount、decimals和blockchain参数
 * @param res - Express响应对象
 */
async function sendToken(req: Request, res: Response): Promise<void> {
  try {
    const { privateKey, tokenAddress, to, amount, decimals, blockchain = 'solana' } = req.body;
    
    if (!privateKey || !tokenAddress || !to || !amount) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    
    let txHash: string;
    
    switch (blockchain) {
      case 'solana':
        txHash = await solanaService.sendToken(privateKey, tokenAddress, to, parseFloat(amount));
        break;
      case 'ethereum':
        if (!decimals) {
          res.status(400).json({ error: '以太坊代币转账需要指定decimals参数' });
          return;
        }
        const network = req.body.network || 'mainnet';
        txHash = await ethereumService.sendToken(privateKey, tokenAddress, to, parseFloat(amount), parseInt(decimals, 10), network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json({ txHash });
  } catch (error) {
    console.error('发送代币时出错:', error);
    res.status(500).json({ error: '发送代币失败' });
  }
}

/**
 * 部署代币合约
 * @param req - Express请求对象，需要包含合约参数和blockchain参数
 * @param res - Express响应对象
 */
async function deployTokenContract(req: Request, res: Response): Promise<void> {
  try {
    const { 
      privateKey, 
      name, 
      symbol, 
      decimals = 9, 
      initialSupply, 
      maxSupply = 0, 
      blockchain = 'solana' 
    } = req.body;
    
    if (!privateKey || !name || !symbol || !initialSupply) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    
    let contractAddress: string;
    
    switch (blockchain) {
      case 'solana':
        contractAddress = await solanaService.createTokenMint(
          privateKey, 
          parseFloat(initialSupply), 
          parseInt(decimals, 10)
        );
        break;
      case 'ethereum':
        const network = req.body.network || 'goerli';
        contractAddress = await ethereumService.deployERC20(
          privateKey,
          name,
          symbol,
          parseInt(decimals, 10),
          parseFloat(initialSupply),
          parseFloat(maxSupply),
          network
        );
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json({ contractAddress });
  } catch (error) {
    console.error('部署代币合约时出错:', error);
    res.status(500).json({ error: '部署代币合约失败' });
  }
}

/**
 * 部署NFT合约
 * @param req - Express请求对象，需要包含合约参数和blockchain参数
 * @param res - Express响应对象
 */
async function deployNFTContract(req: Request, res: Response): Promise<void> {
  try {
    const { 
      privateKey, 
      name, 
      symbol, 
      baseURI = '', 
      maxSupply = 0, 
      royaltyFee = 0, 
      blockchain = 'solana' 
    } = req.body;
    
    if (!privateKey || !name || !symbol) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    
    let contractAddress: string;
    
    switch (blockchain) {
      case 'solana':
        // Solana的NFT铸造与以太坊不同，通常是直接创建NFT而不是先部署合约
        // 这里简化实现，实际上需要根据Metaplex标准处理
        contractAddress = await solanaService.createNFT(privateKey, name, symbol, baseURI);
        break;
      case 'ethereum':
        const network = req.body.network || 'goerli';
        contractAddress = await ethereumService.deployERC721(
          privateKey,
          name,
          symbol,
          baseURI,
          parseInt(maxSupply, 10),
          parseInt(royaltyFee, 10),
          network
        );
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json({ contractAddress });
  } catch (error) {
    console.error('部署NFT合约时出错:', error);
    res.status(500).json({ error: '部署NFT合约失败' });
  }
}

/**
 * 铸造NFT
 * @param req - Express请求对象，需要包含铸造参数和blockchain参数
 * @param res - Express响应对象
 */
async function mintNFT(req: Request, res: Response): Promise<void> {
  try {
    const { 
      privateKey, 
      contractAddress, 
      to, 
      metadataURI, 
      blockchain = 'solana' 
    } = req.body;
    
    if (!privateKey || !contractAddress || !to || !metadataURI) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    
    let txHash: string;
    
    switch (blockchain) {
      case 'solana':
        // Solana的NFT处理逻辑
        txHash = await solanaService.mintNFT(privateKey, contractAddress, to, metadataURI);
        break;
      case 'ethereum':
        const network = req.body.network || 'goerli';
        txHash = await ethereumService.mintNFT(privateKey, contractAddress, to, metadataURI, network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json({ txHash });
  } catch (error) {
    console.error('铸造NFT时出错:', error);
    res.status(500).json({ error: '铸造NFT失败' });
  }
}

/**
 * 获取网络状态（跨链）
 * @param req - Express请求对象，需要包含blockchain参数
 * @param res - Express响应对象
 */
async function getNetworkStatus(req: Request, res: Response): Promise<void> {
  try {
    const { blockchain = 'solana' } = req.query;
    
    let status: NetworkStatus;
    
    switch (blockchain) {
      case 'solana':
        status = await solanaService.getNetworkStatus();
        break;
      case 'ethereum':
        const network = req.query.network as string || 'mainnet';
        status = await ethereumService.getNetworkStatus(network);
        break;
      default:
        res.status(400).json({ error: '不支持的区块链类型' });
        return;
    }
    
    res.status(200).json(status);
  } catch (error) {
    console.error('获取网络状态时出错:', error);
    res.status(500).json({ error: '获取网络状态失败' });
  }
}

/**
 * 执行跨链转账
 * @param req - Express请求对象，需要包含跨链转账参数
 * @param res - Express响应对象
 */
async function executeCrossChainTransfer(req: Request, res: Response): Promise<void> {
  try {
    const { 
      fromPrivateKey, 
      toAddress, 
      amount, 
      sourceChain, 
      targetChain, 
      bridgeType = 'wormhole' 
    } = req.body;
    
    if (!fromPrivateKey || !toAddress || !amount || !sourceChain || !targetChain) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    
    // 跨链转账目前是模拟实现，实际上需要整合跨链桥接解决方案如Wormhole、Synapse等
    // 这里只返回一个虚拟的交易哈希
    const txHash = `cross_${sourceChain}_to_${targetChain}_${Date.now()}`;
    
    res.status(200).json({ 
      txHash,
      status: 'pending',
      estimated_completion_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      message: `已启动从${sourceChain}到${targetChain}的跨链转账，请等待确认`
    });
  } catch (error) {
    console.error('执行跨链转账时出错:', error);
    res.status(500).json({ error: '执行跨链转账失败' });
  }
} 