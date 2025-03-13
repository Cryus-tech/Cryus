import { EventEmitter } from 'events';
import * as bridgeService from '../bridge/bridgeService';
import { BridgeTransaction, BridgeStatus, CrossChainStats } from '../../models/interfaces';

// 创建事件发射器
export const crossChainEventEmitter = new EventEmitter();

// 存储活跃监控任务的Map
const monitoringTasks: Map<string, NodeJS.Timeout> = new Map();

// 存储交易统计信息
let transactionStats: CrossChainStats = {
  totalTransactions: 0,
  completedTransactions: 0,
  failedTransactions: 0,
  totalVolume: {},
  averageCompletionTime: 0,
  popularPaths: []
};

/**
 * 开始监控跨链交易
 * @param txId 交易ID
 * @param interval 监控间隔（毫秒）
 */
export function startMonitoring(txId: string, interval: number = 10000): void {
  if (monitoringTasks.has(txId)) {
    console.log(`跨链交易 ${txId} 已在监控中`);
    return;
  }
  
  // 初始检查
  checkTransactionStatus(txId);
  
  // 设置定期检查
  const taskId = setInterval(() => checkTransactionStatus(txId), interval);
  monitoringTasks.set(txId, taskId);
  
  console.log(`开始监控跨链交易 ${txId}，间隔 ${interval}ms`);
}

/**
 * 停止监控跨链交易
 * @param txId 交易ID
 */
export function stopMonitoring(txId: string): void {
  const taskId = monitoringTasks.get(txId);
  if (taskId) {
    clearInterval(taskId);
    monitoringTasks.delete(txId);
    console.log(`停止监控跨链交易 ${txId}`);
  }
}

/**
 * 检查交易状态
 * @param txId 交易ID
 */
async function checkTransactionStatus(txId: string): Promise<void> {
  try {
    // 获取交易信息
    const tx = bridgeService.getBridgeTransaction(txId);
    
    if (!tx) {
      console.error(`未找到跨链交易: ${txId}`);
      stopMonitoring(txId);
      return;
    }
    
    // 如果交易已完成或失败，停止监控
    if (tx.status === BridgeStatus.COMPLETED || tx.status === BridgeStatus.FAILED) {
      console.log(`跨链交易 ${txId} 已${tx.status === BridgeStatus.COMPLETED ? '完成' : '失败'}，停止监控`);
      
      // 更新统计信息
      updateTransactionStats(tx);
      
      // 触发完成事件
      crossChainEventEmitter.emit(`tx:${txId}:finished`, tx);
      
      // 停止监控
      stopMonitoring(txId);
      return;
    }
    
    // 实际生产环境应该查询真实的交易状态
    // 例如，从桥接API获取最新状态
    
    // 模拟不同阶段的状态检查
    switch (tx.status) {
      case BridgeStatus.PENDING:
        // 检查源链交易是否已开始
        checkSourceChainTransaction(txId, tx);
        break;
      
      case BridgeStatus.SOURCE_CHAIN_PROCESSING:
        // 检查源链交易是否已确认
        checkSourceChainConfirmation(txId, tx);
        break;
      
      case BridgeStatus.SOURCE_CHAIN_CONFIRMED:
        // 检查桥接处理是否已开始
        checkBridgeProcessing(txId, tx);
        break;
      
      case BridgeStatus.BRIDGE_PROCESSING:
        // 检查目标链交易是否已开始
        checkTargetChainTransaction(txId, tx);
        break;
      
      case BridgeStatus.TARGET_CHAIN_PROCESSING:
        // 检查目标链交易是否已确认
        checkTargetChainConfirmation(txId, tx);
        break;
    }
    
    // 发送状态更新事件
    crossChainEventEmitter.emit(`tx:${txId}:statusUpdate`, tx);
    
  } catch (error) {
    console.error(`检查跨链交易状态 ${txId} 失败:`, error);
  }
}

/**
 * 检查源链交易状态
 * @param txId 交易ID
 * @param tx 交易信息
 */
async function checkSourceChainTransaction(txId: string, tx: BridgeTransaction): Promise<void> {
  // 实际环境中应通过链上查询或API获取交易状态
  // 这里模拟状态变化
  
  // 假设源链交易已开始处理
  bridgeService.updateBridgeTransactionStatus(
    txId,
    BridgeStatus.SOURCE_CHAIN_PROCESSING,
    `源链 ${tx.sourceChain} 上的交易正在处理中...`
  );
}

/**
 * 检查源链确认状态
 * @param txId 交易ID
 * @param tx 交易信息
 */
async function checkSourceChainConfirmation(txId: string, tx: BridgeTransaction): Promise<void> {
  // 实际环境中应通过链上查询或API获取确认状态
  // 这里模拟状态变化
  
  // 假设源链交易已确认
  bridgeService.updateBridgeTransactionStatus(
    txId,
    BridgeStatus.SOURCE_CHAIN_CONFIRMED,
    `源链 ${tx.sourceChain} 上的交易已确认，交易哈希: ${tx.sourceTxHash}`
  );
}

/**
 * 检查桥接处理状态
 * @param txId 交易ID
 * @param tx 交易信息
 */
async function checkBridgeProcessing(txId: string, tx: BridgeTransaction): Promise<void> {
  // 实际环境中应通过桥接API获取处理状态
  // 这里模拟状态变化
  
  // 假设桥接处理已开始
  bridgeService.updateBridgeTransactionStatus(
    txId,
    BridgeStatus.BRIDGE_PROCESSING,
    `${tx.bridgeType} 桥正在处理跨链转账...`
  );
}

/**
 * 检查目标链交易状态
 * @param txId 交易ID
 * @param tx 交易信息
 */
async function checkTargetChainTransaction(txId: string, tx: BridgeTransaction): Promise<void> {
  // 实际环境中应通过链上查询或API获取交易状态
  // 这里模拟状态变化
  
  // 假设目标链交易已开始处理
  if (!tx.targetTxHash) {
    tx.targetTxHash = `target_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
  
  bridgeService.updateBridgeTransactionStatus(
    txId,
    BridgeStatus.TARGET_CHAIN_PROCESSING,
    `目标链 ${tx.targetChain} 上的交易正在处理中，交易哈希: ${tx.targetTxHash}`
  );
}

/**
 * 检查目标链确认状态
 * @param txId 交易ID
 * @param tx 交易信息
 */
async function checkTargetChainConfirmation(txId: string, tx: BridgeTransaction): Promise<void> {
  // 实际环境中应通过链上查询或API获取确认状态
  // 这里模拟状态变化
  
  // 假设目标链交易已确认
  bridgeService.updateBridgeTransactionStatus(
    txId,
    BridgeStatus.COMPLETED,
    `跨链转账已完成！资产已到达 ${tx.targetChain} 上的目标地址 ${tx.toAddress}`
  );
}

/**
 * 更新交易统计信息
 * @param tx 交易信息
 */
function updateTransactionStats(tx: BridgeTransaction): void {
  // 增加总交易数
  transactionStats.totalTransactions++;
  
  // 更新完成/失败交易数
  if (tx.status === BridgeStatus.COMPLETED) {
    transactionStats.completedTransactions++;
    
    // 更新交易量
    if (!transactionStats.totalVolume[tx.asset]) {
      transactionStats.totalVolume[tx.asset] = 0;
    }
    transactionStats.totalVolume[tx.asset] += tx.amount;
    
    // 更新完成时间（如果有）
    if (tx.createdAt && tx.updatedAt) {
      const createdTime = new Date(tx.createdAt).getTime();
      const completedTime = new Date(tx.updatedAt).getTime();
      const timeDiff = (completedTime - createdTime) / 1000; // 秒
      
      // 计算平均完成时间
      transactionStats.averageCompletionTime = 
        (transactionStats.averageCompletionTime * (transactionStats.completedTransactions - 1) + timeDiff) / 
        transactionStats.completedTransactions;
    }
  } else if (tx.status === BridgeStatus.FAILED) {
    transactionStats.failedTransactions++;
  }
  
  // 更新热门路径
  const pathKey = `${tx.sourceChain}-${tx.targetChain}`;
  const existingPath = transactionStats.popularPaths.find(
    p => p.sourceChain === tx.sourceChain && p.targetChain === tx.targetChain
  );
  
  if (existingPath) {
    existingPath.count++;
  } else {
    transactionStats.popularPaths.push({
      sourceChain: tx.sourceChain,
      targetChain: tx.targetChain,
      count: 1
    });
  }
  
  // 按计数排序热门路径
  transactionStats.popularPaths.sort((a, b) => b.count - a.count);
}

/**
 * 获取交易统计信息
 * @returns 交易统计信息
 */
export function getTransactionStats(): CrossChainStats {
  return { ...transactionStats };
} 