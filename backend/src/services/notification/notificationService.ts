import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { Socket } from 'net';
import { v4 as uuidv4 } from 'uuid';
import { BridgeTransaction, BridgeStatus } from '../../models/interfaces';

/**
 * 事件类型枚举
 */
export enum EventType {
  // 系统事件
  SYSTEM_STATUS = 'system:status',

  // 钱包事件
  WALLET_CONNECTED = 'wallet:connected',
  WALLET_DISCONNECTED = 'wallet:disconnected',
  WALLET_TRANSACTION = 'wallet:transaction',
  WALLET_BALANCE_CHANGED = 'wallet:balanceChanged',

  // 交易事件
  TRANSACTION_CREATED = 'transaction:created',
  TRANSACTION_CONFIRMED = 'transaction:confirmed',
  TRANSACTION_FAILED = 'transaction:failed',
  TRANSACTION_STATUS_CHANGED = 'transaction:statusChanged',

  // 桥接事件
  BRIDGE_STARTED = 'bridge:started',
  BRIDGE_SOURCE_CONFIRMED = 'bridge:sourceConfirmed',
  BRIDGE_PROCESSING = 'bridge:processing',
  BRIDGE_TARGET_CONFIRMED = 'bridge:targetConfirmed',
  BRIDGE_COMPLETED = 'bridge:completed',
  BRIDGE_FAILED = 'bridge:failed',
  BRIDGE_STATUS_CHANGED = 'bridge:statusChanged',
  
  // 价格事件
  PRICE_UPDATED = 'price:updated',
  
  // 用户事件
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
}

/**
 * 通知订阅选项
 */
export interface SubscriptionOptions {
  // 用户ID(如果已登录)
  userId?: string;
  // 钱包地址
  walletAddress?: string;
  // 链类型
  chain?: string;
  // 交易哈希
  transactionHash?: string;
  // 桥接ID
  bridgeId?: string;
  // 资产符号
  assetSymbol?: string;
  // 自定义频道
  channel?: string;
}

/**
 * 通知数据接口
 */
export interface NotificationData {
  // 事件类型
  type: EventType;
  // 事件标题
  title: string;
  // 事件消息
  message: string;
  // 事件状态
  status?: 'success' | 'warning' | 'error' | 'info';
  // 事件关联的数据
  data?: any;
  // 时间戳
  timestamp: number;
  // 是否需要用户确认
  requiresConfirmation?: boolean;
  // 链接(如果有)
  link?: string;
}

/**
 * 通知服务
 * 处理系统中的事件通知，支持实时推送和历史记录
 */
export class NotificationService {
  private static instance: NotificationService;
  // 内部事件发射器
  private eventEmitter: EventEmitter;
  // WebSocket服务器
  private wss: WebSocketServer | null = null;
  // 客户端连接
  private clients: Map<string, any> = new Map();
  // 客户端订阅信息
  private subscriptions: Map<string, SubscriptionOptions> = new Map();
  // 最近的通知历史(仅内存中)
  private recentNotifications: Map<string, NotificationData[]> = new Map();
  // 通知历史最大长度
  private readonly MAX_NOTIFICATIONS = 100;
  
  /**
   * 获取服务实例
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * 构造函数
   */
  private constructor() {
    this.eventEmitter = new EventEmitter();
    // 设置最大监听器数量
    this.eventEmitter.setMaxListeners(100);
    
    // 全局错误处理
    process.on('uncaughtException', (error) => {
      console.error('未捕获的异常:', error);
      this.broadcastSystemNotification('系统错误', '发生了未处理的错误，某些功能可能受到影响。', 'error');
    });
    
    // 监听桥接事件
    this.setupBridgeEventListeners();
  }
  
  /**
   * 初始化WebSocket服务器
   * @param server HTTP服务器实例
   */
  public initializeWebSocketServer(server: Server): void {
    if (this.wss) {
      return;
    }
    
    // 创建WebSocket服务器
    this.wss = new WebSocketServer({ server });
    
    // 处理连接
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      
      // 保存客户端连接
      this.clients.set(clientId, {
        ws,
        connectedAt: Date.now(),
        ipAddress: req.socket.remoteAddress
      });
      
      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'connection',
        message: '已连接到Cryus通知服务',
        clientId,
        timestamp: Date.now()
      }));
      
      // 处理消息
      ws.on('message', (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          this.handleClientMessage(clientId, parsedMessage);
        } catch (error) {
          console.error('处理客户端消息失败:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: '无效的消息格式',
            timestamp: Date.now()
          }));
        }
      });
      
      // 处理关闭
      ws.on('close', () => {
        this.clients.delete(clientId);
        this.subscriptions.delete(clientId);
        console.log(`客户端 ${clientId} 已断开连接`);
      });
      
      // 处理错误
      ws.on('error', (error) => {
        console.error(`客户端 ${clientId} 连接错误:`, error);
      });
      
      console.log(`新客户端 ${clientId} 已连接，IP: ${req.socket.remoteAddress}`);
    });
    
    console.log('通知WebSocket服务器已初始化');
  }
  
  /**
   * 发送通知
   * @param type 事件类型
   * @param title 标题
   * @param message 消息
   * @param options 附加选项
   */
  public sendNotification(
    type: EventType,
    title: string,
    message: string,
    options?: {
      status?: 'success' | 'warning' | 'error' | 'info';
      data?: any;
      requiresConfirmation?: boolean;
      link?: string;
      userId?: string;
      walletAddress?: string;
      chain?: string;
    }
  ): void {
    const notification: NotificationData = {
      type,
      title,
      message,
      status: options?.status || 'info',
      data: options?.data,
      timestamp: Date.now(),
      requiresConfirmation: options?.requiresConfirmation,
      link: options?.link
    };
    
    // 发射事件
    this.eventEmitter.emit(type, notification);
    
    // 发送WebSocket通知
    this.broadcastNotification(notification, {
      userId: options?.userId,
      walletAddress: options?.walletAddress,
      chain: options?.chain
    });
    
    // 保存到历史记录
    this.saveNotificationToHistory(notification, options?.userId, options?.walletAddress);
  }
  
  /**
   * 设置桥接事件监听器
   */
  private setupBridgeEventListeners(): void {
    // 监听桥接状态变更事件
    this.eventEmitter.on('bridge:statusChanged', (data: { transaction: BridgeTransaction, previousStatus: BridgeStatus }) => {
      const { transaction, previousStatus } = data;
      
      // 根据状态变化发送特定通知
      switch (transaction.status) {
        case 'source_chain_confirmed':
          this.sendNotification(
            EventType.BRIDGE_SOURCE_CONFIRMED,
            '源链交易已确认',
            `您的 ${transaction.asset} 跨链交易源链部分已确认，正在等待桥接处理。`,
            {
              status: 'success',
              data: transaction,
              walletAddress: transaction.sourceAddress
            }
          );
          break;
          
        case 'bridge_processing':
          this.sendNotification(
            EventType.BRIDGE_PROCESSING,
            '桥接处理中',
            `您的 ${transaction.asset} 跨链交易正在桥接中，预计完成时间: ${new Date(transaction.estimatedCompletionTime || 0).toLocaleString()}`,
            {
              status: 'info',
              data: transaction,
              walletAddress: transaction.sourceAddress
            }
          );
          break;
          
        case 'target_chain_processing':
          this.sendNotification(
            EventType.BRIDGE_TARGET_CONFIRMED,
            '目标链处理中',
            `您的 ${transaction.asset} 跨链交易已进入目标链处理阶段。`,
            {
              status: 'info',
              data: transaction,
              walletAddress: transaction.targetAddress
            }
          );
          break;
          
        case 'completed':
          this.sendNotification(
            EventType.BRIDGE_COMPLETED,
            '跨链交易完成',
            `您的 ${transaction.amount} ${transaction.asset} 已成功从 ${transaction.sourceChain} 转移到 ${transaction.targetChain}。`,
            {
              status: 'success',
              data: transaction,
              walletAddress: transaction.targetAddress,
              link: this.generateExplorerLink(transaction.targetTxHash, transaction.targetChain)
            }
          );
          break;
          
        case 'failed':
          this.sendNotification(
            EventType.BRIDGE_FAILED,
            '跨链交易失败',
            `您的 ${transaction.asset} 跨链交易失败。请查看详情以获取更多信息。`,
            {
              status: 'error',
              data: transaction,
              walletAddress: transaction.sourceAddress,
              requiresConfirmation: true
            }
          );
          break;
      }
    });
  }
  
  /**
   * 生成区块浏览器链接
   * @param txHash 交易哈希
   * @param chain 链类型
   */
  private generateExplorerLink(txHash?: string, chain?: string): string | undefined {
    if (!txHash || !chain) {
      return undefined;
    }
    
    switch (chain) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'goerli':
        return `https://goerli.etherscan.io/tx/${txHash}`;
      case 'sepolia':
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      case 'mumbai':
        return `https://mumbai.polygonscan.com/tx/${txHash}`;
      case 'bsc':
        return `https://bscscan.com/tx/${txHash}`;
      case 'bsc-testnet':
        return `https://testnet.bscscan.com/tx/${txHash}`;
      case 'avalanche':
        return `https://snowtrace.io/tx/${txHash}`;
      case 'fuji':
        return `https://testnet.snowtrace.io/tx/${txHash}`;
      case 'solana':
        return `https://explorer.solana.com/tx/${txHash}`;
      case 'solana-devnet':
        return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
      case 'solana-testnet':
        return `https://explorer.solana.com/tx/${txHash}?cluster=testnet`;
      default:
        return undefined;
    }
  }
  
  /**
   * 处理客户端消息
   * @param clientId 客户端ID
   * @param message 客户端消息
   */
  private handleClientMessage(clientId: string, message: any): void {
    if (!message.action) {
      return;
    }
    
    switch (message.action) {
      case 'subscribe':
        this.handleSubscribe(clientId, message.options);
        break;
        
      case 'unsubscribe':
        this.handleUnsubscribe(clientId);
        break;
        
      case 'getHistory':
        this.handleGetHistory(clientId, message.options);
        break;
        
      case 'markAsRead':
        // 实际应用中可能需要数据库持久化
        // 这里简化处理
        break;
        
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          timestamp: Date.now()
        });
        break;
    }
  }
  
  /**
   * 处理订阅请求
   * @param clientId 客户端ID
   * @param options 订阅选项
   */
  private handleSubscribe(clientId: string, options: SubscriptionOptions): void {
    this.subscriptions.set(clientId, options);
    
    // 确认订阅
    this.sendToClient(clientId, {
      type: 'subscribed',
      message: '订阅成功',
      options,
      timestamp: Date.now()
    });
    
    console.log(`客户端 ${clientId} 已订阅，选项:`, options);
  }
  
  /**
   * 处理取消订阅请求
   * @param clientId 客户端ID
   */
  private handleUnsubscribe(clientId: string): void {
    this.subscriptions.delete(clientId);
    
    // 确认取消订阅
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      message: '已取消订阅',
      timestamp: Date.now()
    });
    
    console.log(`客户端 ${clientId} 已取消订阅`);
  }
  
  /**
   * 处理获取历史记录请求
   * @param clientId 客户端ID
   * @param options 历史记录选项
   */
  private handleGetHistory(clientId: string, options: {
    userId?: string;
    walletAddress?: string;
    limit?: number;
    offset?: number;
  }): void {
    const { userId, walletAddress, limit = 20, offset = 0 } = options;
    
    let notifications: NotificationData[] = [];
    
    if (userId && this.recentNotifications.has(`user_${userId}`)) {
      notifications = notifications.concat(this.recentNotifications.get(`user_${userId}`) || []);
    }
    
    if (walletAddress && this.recentNotifications.has(`wallet_${walletAddress.toLowerCase()}`)) {
      notifications = notifications.concat(this.recentNotifications.get(`wallet_${walletAddress.toLowerCase()}`) || []);
    }
    
    // 排序、去重和分页
    const uniqueNotifications = this.getUniqueNotifications(notifications);
    const paginatedNotifications = uniqueNotifications
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);
    
    // 发送历史记录
    this.sendToClient(clientId, {
      type: 'history',
      notifications: paginatedNotifications,
      total: uniqueNotifications.length,
      timestamp: Date.now()
    });
  }
  
  /**
   * 获取去重后的通知
   * @param notifications 通知数组
   */
  private getUniqueNotifications(notifications: NotificationData[]): NotificationData[] {
    const seen = new Set();
    return notifications.filter(notification => {
      const key = `${notification.type}_${notification.timestamp}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  /**
   * 保存通知到历史记录
   * @param notification 通知数据
   * @param userId 用户ID
   * @param walletAddress 钱包地址
   */
  private saveNotificationToHistory(
    notification: NotificationData,
    userId?: string,
    walletAddress?: string
  ): void {
    // 保存到系统历史
    if (!this.recentNotifications.has('system')) {
      this.recentNotifications.set('system', []);
    }
    
    const systemNotifications = this.recentNotifications.get('system') || [];
    systemNotifications.push(notification);
    
    // 限制系统历史大小
    if (systemNotifications.length > this.MAX_NOTIFICATIONS) {
      systemNotifications.shift();
    }
    
    this.recentNotifications.set('system', systemNotifications);
    
    // 保存到用户历史
    if (userId) {
      const userKey = `user_${userId}`;
      if (!this.recentNotifications.has(userKey)) {
        this.recentNotifications.set(userKey, []);
      }
      
      const userNotifications = this.recentNotifications.get(userKey) || [];
      userNotifications.push(notification);
      
      // 限制用户历史大小
      if (userNotifications.length > this.MAX_NOTIFICATIONS) {
        userNotifications.shift();
      }
      
      this.recentNotifications.set(userKey, userNotifications);
    }
    
    // 保存到钱包历史
    if (walletAddress) {
      const walletKey = `wallet_${walletAddress.toLowerCase()}`;
      if (!this.recentNotifications.has(walletKey)) {
        this.recentNotifications.set(walletKey, []);
      }
      
      const walletNotifications = this.recentNotifications.get(walletKey) || [];
      walletNotifications.push(notification);
      
      // 限制钱包历史大小
      if (walletNotifications.length > this.MAX_NOTIFICATIONS) {
        walletNotifications.shift();
      }
      
      this.recentNotifications.set(walletKey, walletNotifications);
    }
  }
  
  /**
   * 广播通知
   * @param notification 通知数据
   * @param filter 过滤选项
   */
  private broadcastNotification(
    notification: NotificationData,
    filter?: {
      userId?: string;
      walletAddress?: string;
      chain?: string;
    }
  ): void {
    if (!this.wss) {
      return;
    }
    
    // 遍历所有客户端
    for (const [clientId, client] of this.clients.entries()) {
      // 获取客户端订阅
      const subscription = this.subscriptions.get(clientId);
      
      if (!subscription) {
        continue;
      }
      
      // 检查订阅是否匹配过滤条件
      if (this.shouldSendToSubscription(subscription, filter)) {
        this.sendToClient(clientId, {
          type: 'notification',
          notification,
          timestamp: Date.now()
        });
      }
    }
  }
  
  /**
   * 广播系统通知
   * @param title 标题
   * @param message 消息
   * @param status 状态
   */
  private broadcastSystemNotification(
    title: string,
    message: string,
    status: 'success' | 'warning' | 'error' | 'info' = 'info'
  ): void {
    const notification: NotificationData = {
      type: EventType.SYSTEM_STATUS,
      title,
      message,
      status,
      timestamp: Date.now()
    };
    
    // 发送给所有客户端
    for (const [clientId] of this.clients.entries()) {
      this.sendToClient(clientId, {
        type: 'notification',
        notification,
        timestamp: Date.now()
      });
    }
    
    // 保存到系统历史
    this.saveNotificationToHistory(notification);
  }
  
  /**
   * 检查订阅是否应该接收通知
   * @param subscription 订阅选项
   * @param filter 过滤选项
   */
  private shouldSendToSubscription(
    subscription: SubscriptionOptions,
    filter?: {
      userId?: string;
      walletAddress?: string;
      chain?: string;
    }
  ): boolean {
    // 如果没有过滤条件，所有订阅都接收
    if (!filter) {
      return true;
    }
    
    // 匹配用户ID
    if (filter.userId && subscription.userId === filter.userId) {
      return true;
    }
    
    // 匹配钱包地址
    if (filter.walletAddress && subscription.walletAddress &&
        filter.walletAddress.toLowerCase() === subscription.walletAddress.toLowerCase()) {
      return true;
    }
    
    // 匹配链类型
    if (filter.chain && subscription.chain === filter.chain) {
      return true;
    }
    
    // 如果有过滤条件但都不匹配
    return false;
  }
  
  /**
   * 向特定客户端发送消息
   * @param clientId 客户端ID
   * @param data 消息数据
   */
  private sendToClient(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    
    if (!client || !client.ws) {
      return;
    }
    
    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error(`向客户端 ${clientId} 发送消息失败:`, error);
    }
  }
  
  /**
   * 关闭服务
   */
  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }
      
      // 向所有客户端发送关闭通知
      for (const [clientId, client] of this.clients.entries()) {
        try {
          client.ws.send(JSON.stringify({
            type: 'server_shutdown',
            message: '服务器正在关闭，连接将断开',
            timestamp: Date.now()
          }));
          client.ws.close();
        } catch (error) {
          console.error(`关闭客户端 ${clientId} 连接失败:`, error);
        }
      }
      
      // 清空客户端和订阅
      this.clients.clear();
      this.subscriptions.clear();
      
      // 关闭WebSocket服务器
      this.wss.close(() => {
        console.log('通知WebSocket服务器已关闭');
        this.wss = null;
        resolve();
      });
    });
  }
  
  /**
   * 添加自定义事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  public on(eventType: EventType, listener: (data: any) => void): void {
    this.eventEmitter.on(eventType, listener);
  }
  
  /**
   * 移除自定义事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  public off(eventType: EventType, listener: (data: any) => void): void {
    this.eventEmitter.off(eventType, listener);
  }
  
  /**
   * 获取连接的客户端数量
   */
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
} 