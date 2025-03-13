import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { 
  WalletConnectionRequest, 
  WalletConnectionResponse, 
  WalletSignRequest, 
  WalletSignResponse 
} from '../../types/wallet';
import EventEmitter from 'events';

// 钱包事件发射器
export const walletEventEmitter = new EventEmitter();

// 当前连接的钱包状态
let currentWallet: {
  connected: boolean;
  address?: string;
  chain?: string;
  walletType?: string;
  provider?: any;
} = {
  connected: false
};

/**
 * 连接钱包
 * @param request 钱包连接请求
 * @returns 钱包连接响应
 */
export async function connectWallet(request: WalletConnectionRequest): Promise<WalletConnectionResponse> {
  try {
    // 先断开已连接的钱包
    if (currentWallet.connected) {
      await disconnectWallet();
    }
    
    let response: WalletConnectionResponse = { connected: false };
    
    // 根据钱包类型和链进行连接
    switch (request.walletType) {
      case 'metamask':
        response = await connectMetamask(request.chain);
        break;
      case 'phantom':
        response = await connectPhantom(request.chain);
        break;
      case 'solflare':
        response = await connectSolflare(request.chain);
        break;
      case 'walletconnect':
        response = await connectWalletConnect(request.chain);
        break;
      default:
        return { connected: false, error: 'Unsupported wallet type' };
    }
    
    // 更新当前钱包状态
    if (response.connected && response.address) {
      currentWallet = {
        connected: true,
        address: response.address,
        chain: request.chain,
        walletType: request.walletType,
        provider: (window as any)[getProviderKey(request.walletType)]
      };
      
      // 触发连接事件
      walletEventEmitter.emit('wallet:connected', {
        address: response.address,
        chain: request.chain,
        walletType: request.walletType
      });
    }
    
    return response;
  } catch (error) {
    console.error('钱包连接失败:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 断开钱包连接
 * @returns 断开结果
 */
export async function disconnectWallet(): Promise<boolean> {
  try {
    if (!currentWallet.connected) {
      return true;
    }
    
    // 根据钱包类型进行断开
    if (currentWallet.walletType === 'phantom' || currentWallet.walletType === 'solflare') {
      const provider = (window as any).solana;
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } else if (currentWallet.walletType === 'metamask' || currentWallet.walletType === 'walletconnect') {
      // MetaMask和WalletConnect没有明确的断开方法，只需清除状态
    }
    
    // 清除当前钱包状态
    const oldAddress = currentWallet.address;
    const oldChain = currentWallet.chain;
    
    currentWallet = { connected: false };
    
    // 触发断开事件
    walletEventEmitter.emit('wallet:disconnected', {
      address: oldAddress,
      chain: oldChain
    });
    
    return true;
  } catch (error) {
    console.error('钱包断开失败:', error);
    return false;
  }
}

/**
 * 获取当前钱包状态
 * @returns 钱包状态
 */
export function getWalletStatus(): {
  connected: boolean;
  address?: string;
  chain?: string;
  walletType?: string;
} {
  return {
    connected: currentWallet.connected,
    address: currentWallet.address,
    chain: currentWallet.chain,
    walletType: currentWallet.walletType
  };
}

/**
 * 签名消息
 * @param request 签名请求
 * @returns 签名响应
 */
export async function signMessage(request: WalletSignRequest): Promise<WalletSignResponse> {
  try {
    if (!currentWallet.connected || !currentWallet.address) {
      return { error: '钱包未连接' };
    }
    
    if (request.address !== currentWallet.address) {
      return { error: '地址不匹配' };
    }
    
    let signature: string;
    
    // 根据链类型进行签名
    if (currentWallet.chain === 'solana') {
      signature = await signSolanaMessage(request.message);
    } else if (currentWallet.chain === 'ethereum' || currentWallet.chain?.includes('evm')) {
      signature = await signEthereumMessage(request.message);
    } else {
      return { error: '不支持的链类型' };
    }
    
    return { signature };
  } catch (error) {
    console.error('消息签名失败:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * 连接MetaMask钱包
 * @param chain 链
 * @returns 钱包连接响应
 */
async function connectMetamask(chain: string): Promise<WalletConnectionResponse> {
  try {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum || !ethereum.isMetaMask) {
      return { connected: false, error: 'MetaMask未安装' };
    }
    
    // 请求账户访问
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      return { connected: false, error: '用户拒绝连接' };
    }
    
    // 切换到指定网络（如果需要）
    if (chain !== 'ethereum' && chain !== 'mainnet') {
      try {
        await switchEthereumChain(ethereum, chain);
      } catch (switchError) {
        return { connected: false, error: `无法切换到 ${chain} 网络` };
      }
    }
    
    return {
      connected: true,
      address: accounts[0],
      chain
    };
  } catch (error) {
    console.error('MetaMask连接失败:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'MetaMask连接失败' 
    };
  }
}

/**
 * 切换以太坊网络
 * @param provider 以太坊提供者
 * @param chain 目标链
 */
async function switchEthereumChain(provider: any, chain: string): Promise<void> {
  let chainId: string;
  
  // 获取链ID
  switch (chain) {
    case 'ethereum':
    case 'mainnet':
      chainId = '0x1'; // 以太坊主网
      break;
    case 'goerli':
      chainId = '0x5'; // Goerli测试网
      break;
    case 'sepolia':
      chainId = '0xaa36a7'; // Sepolia测试网
      break;
    case 'polygon':
      chainId = '0x89'; // Polygon Mainnet
      break;
    case 'mumbai':
      chainId = '0x13881'; // Polygon Mumbai
      break;
    case 'binance-chain':
    case 'bsc':
      chainId = '0x38'; // BSC Mainnet
      break;
    case 'avalanche':
      chainId = '0xa86a'; // Avalanche Mainnet
      break;
    default:
      throw new Error(`不支持的链: ${chain}`);
  }
  
  try {
    // 尝试切换到目标链
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // 如果链不存在，尝试添加链
    if (switchError.code === 4902) {
      await addEthereumChain(provider, chain, chainId);
    } else {
      throw switchError;
    }
  }
}

/**
 * 添加以太坊链
 * @param provider 以太坊提供者
 * @param chain 链名称
 * @param chainId 链ID
 */
async function addEthereumChain(provider: any, chain: string, chainId: string): Promise<void> {
  let params;
  
  switch (chain) {
    case 'polygon':
      params = {
        chainId,
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
      };
      break;
    case 'binance-chain':
    case 'bsc':
      params = {
        chainId,
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
      };
      break;
    case 'avalanche':
      params = {
        chainId,
        chainName: 'Avalanche Network',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io']
      };
      break;
    default:
      throw new Error(`不支持添加链: ${chain}`);
  }
  
  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [params],
  });
}

/**
 * 连接Phantom钱包
 * @param chain 链
 * @returns 钱包连接响应
 */
async function connectPhantom(chain: string): Promise<WalletConnectionResponse> {
  try {
    // 检查链是否为Solana
    if (chain !== 'solana') {
      return { connected: false, error: 'Phantom钱包只支持Solana链' };
    }
    
    const solana = (window as any).solana;
    
    if (!solana || !solana.isPhantom) {
      return { connected: false, error: 'Phantom钱包未安装' };
    }
    
    // 连接钱包
    const { publicKey } = await solana.connect();
    
    if (!publicKey) {
      return { connected: false, error: '用户拒绝连接' };
    }
    
    return {
      connected: true,
      address: publicKey.toString(),
      chain: 'solana'
    };
  } catch (error) {
    console.error('Phantom连接失败:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Phantom连接失败' 
    };
  }
}

/**
 * 连接Solflare钱包
 * @param chain 链
 * @returns 钱包连接响应
 */
async function connectSolflare(chain: string): Promise<WalletConnectionResponse> {
  try {
    // 检查链是否为Solana
    if (chain !== 'solana') {
      return { connected: false, error: 'Solflare钱包只支持Solana链' };
    }
    
    const solflare = (window as any).solflare;
    
    if (!solflare || !solflare.isSolflare) {
      return { connected: false, error: 'Solflare钱包未安装' };
    }
    
    // 连接钱包
    const { publicKey } = await solflare.connect();
    
    if (!publicKey) {
      return { connected: false, error: '用户拒绝连接' };
    }
    
    return {
      connected: true,
      address: publicKey.toString(),
      chain: 'solana'
    };
  } catch (error) {
    console.error('Solflare连接失败:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Solflare连接失败' 
    };
  }
}

/**
 * 连接WalletConnect
 * @param chain 链
 * @returns 钱包连接响应
 */
async function connectWalletConnect(chain: string): Promise<WalletConnectionResponse> {
  try {
    // 检查链是否为EVM兼容链
    if (chain === 'solana') {
      return { connected: false, error: 'WalletConnect暂不支持Solana链' };
    }
    
    // 实际项目中应集成WalletConnect库
    // 这里只是示例
    return { connected: false, error: 'WalletConnect集成尚未完成' };
  } catch (error) {
    console.error('WalletConnect连接失败:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'WalletConnect连接失败' 
    };
  }
}

/**
 * 签名Solana消息
 * @param message 消息
 * @returns 签名
 */
async function signSolanaMessage(message: string): Promise<string> {
  const provider = (window as any).solana || (window as any).solflare;
  
  if (!provider) {
    return { error: 'Unsupported chain type' };
  }
  
  // 将消息转换为Uint8Array
  const messageBytes = new TextEncoder().encode(message);
  
  // 签名消息
  const { signature } = await provider.signMessage(messageBytes, 'utf8');
  
  return Buffer.from(signature).toString('hex');
}

/**
 * 签名以太坊消息
 * @param message 消息
 * @returns 签名
 */
async function signEthereumMessage(message: string): Promise<string> {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  
  // 签名消息
  const signature = await signer.signMessage(message);
  
  return signature;
}

/**
 * 获取提供者键
 * @param walletType 钱包类型
 * @returns 提供者键
 */
function getProviderKey(walletType: string): string {
  switch (walletType) {
    case 'metamask':
      return 'ethereum';
    case 'phantom':
      return 'solana';
    case 'solflare':
      return 'solflare';
    case 'walletconnect':
      return 'walletConnect';
    default:
      return '';
  }
} 