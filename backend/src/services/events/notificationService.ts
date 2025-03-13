import { EventEmitter } from 'events';
import axios from 'axios';
import { BlockchainType } from '../bridge/bridgeService';
import { Transaction, TransactionStatus } from '../../models/interfaces';

/**
 * 通知渠道枚举
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook'
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_FAILED = 'transaction_failed',
  BRIDGE_STARTED = 'bridge_started',
  BRIDGE_COMPLETED = 'bridge_completed',
  BRIDGE_FAILED = 'bridge_failed',
  SECURITY_ALERT = 'security_alert',
  PRICE_ALERT = 'price_alert',
  WALLET_CONNECTED = 'wallet_connected',
  WALLET_DISCONNECTED = 'wallet_disconnected'
}

/**
 * 区块链事件枚举
 */
export enum BlockchainEvent {
  BLOCK_MINED = 'block_mined',
  TRANSACTION_DETECTED = 'transaction_detected',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_FAILED = 'transaction_failed',
  TOKEN_TRANSFER = 'token_transfer',
  CONTRACT_INTERACTION = 'contract_interaction',
  GAS_PRICE_CHANGE = 'gas_price_change',
  NEW_TOKEN = 'new_token'
}

/**
 * 通知接收者接口
 */
export interface NotificationRecipient {
  id: string;
  channels: { [channel in NotificationChannel]?: string };
  preferences?: {
    types: NotificationType[];
    blockchains?: BlockchainType[];
    minAmount?: string;
    enabled: boolean;
  };
}

/**
 * 通知内容接口
 */
export interface NotificationContent {
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  timestamp: number;
}

/**
 * 事件订阅接口
 */
export interface EventSubscription {
  id: string;
  userId: string;
  event: BlockchainEvent | NotificationType;
  blockchain?: BlockchainType;
  address?: string;
  contractAddress?: string;
  filter?: any;
  callback?: (data: any) => void;
  active: boolean;
}

/**
 * 通知服务类
 * 处理区块链事件和用户通知
 */
export class NotificationService extends EventEmitter {
  private recipients: Map<string, NotificationRecipient> = new Map();
  private subscriptions: Map<string, EventSubscription> = new Map();
  private notificationHistory: Map<string, NotificationContent[]> = new Map();
  private maxHistoryLength: number = 50;
  
  // 外部服务配置
  private emailServiceUrl?: string;
  private smsServiceUrl?: string;
  private pushServiceUrl?: string;
  
  /**
   * 构造函数
   * @param config 服务配置
   */
  constructor(config?: {
    emailServiceUrl?: string;
    smsServiceUrl?: string;
    pushServiceUrl?: string;
    maxHistoryLength?: number;
  }) {
    super();
    
    if (config) {
      this.emailServiceUrl = config.emailServiceUrl;
      this.smsServiceUrl = config.smsServiceUrl;
      this.pushServiceUrl = config.pushServiceUrl;
      
      if (config.maxHistoryLength) {
        this.maxHistoryLength = config.maxHistoryLength;
      }
    }
    
    // 设置事件监听器
    this.setupListeners();
  }
  
  /**
   * 设置事件监听器
   */
  private setupListeners(): void {
    // 监听交易事件
    this.on(BlockchainEvent.TRANSACTION_DETECTED, this.handleTransactionDetected.bind(this));
    this.on(BlockchainEvent.TRANSACTION_CONFIRMED, this.handleTransactionConfirmed.bind(this));
    this.on(BlockchainEvent.TRANSACTION_FAILED, this.handleTransactionFailed.bind(this));
    
    // 监听通知类型事件
    Object.values(NotificationType).forEach(type => {
      this.on(type, (data) => this.processNotificationByType(type, data));
    });
  }
  
  /**
   * 添加通知接收者
   * @param recipient 接收者信息
   * @returns 接收者ID
   */
  addRecipient(recipient: NotificationRecipient): string {
    this.recipients.set(recipient.id, recipient);
    return recipient.id;
  }
  
  /**
   * 更新通知接收者
   * @param id 接收者ID
   * @param updates 更新的字段
   * @returns 更新后的接收者信息
   */
  updateRecipient(id: string, updates: Partial<NotificationRecipient>): NotificationRecipient | null {
    const current = this.recipients.get(id);
    if (!current) {
      return null;
    }
    
    const updated = { ...current, ...updates };
    this.recipients.set(id, updated);
    return updated;
  }
  
  /**
   * 删除通知接收者
   * @param id 接收者ID
   * @returns 操作是否成功
   */
  removeRecipient(id: string): boolean {
    return this.recipients.delete(id);
  }
  
  /**
   * 添加事件订阅
   * @param subscription 订阅信息
   * @returns 订阅ID
   */
  subscribe(subscription: EventSubscription): string {
    this.subscriptions.set(subscription.id, subscription);
    return subscription.id;
  }
  
  /**
   * 取消事件订阅
   * @param id 订阅ID
   * @returns 操作是否成功
   */
  unsubscribe(id: string): boolean {
    return this.subscriptions.delete(id);
  }
  
  /**
   * 发送通知
   * @param recipientId 接收者ID
   * @param content 通知内容
   * @param forcedChannels 强制使用的渠道
   * @returns 发送结果
   */
  async sendNotification(
    recipientId: string,
    content: NotificationContent,
    forcedChannels?: NotificationChannel[]
  ): Promise<{ success: boolean; errors?: any[] }> {
    const recipient = this.recipients.get(recipientId);
    if (!recipient) {
      return { success: false, errors: [{ message: `接收者不存在: ${recipientId}` }] };
    }
    
    // 检查接收者的偏好设置
    if (recipient.preferences) {
      // 如果通知类型不在接收者的偏好列表中，且不是强制使用渠道，则跳过
      if (!recipient.preferences.enabled || 
          (recipient.preferences.types.length > 0 && 
           !recipient.preferences.types.includes(content.type) && 
           !forcedChannels)) {
        return { success: true }; // 根据接收者偏好跳过，仍视为成功
      }
    }
    
    // 将通知添加到历史记录
    this.addToHistory(recipientId, content);
    
    // 确定要使用的渠道
    const channelsToUse = forcedChannels || Object.keys(recipient.channels) as NotificationChannel[];
    const errors: any[] = [];
    
    // 通过每个渠道发送通知
    for (const channel of channelsToUse) {
      const channelId = recipient.channels[channel];
      if (!channelId) continue;
      
      try {
        await this.sendToChannel(channel, channelId, content);
      } catch (error) {
        errors.push({ channel, error: error.message });
      }
    }
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * 广播通知给多个接收者
   * @param content 通知内容
   * @param recipientIds 接收者ID列表
   * @returns 发送结果
   */
  async broadcastNotification(
    content: NotificationContent,
    recipientIds?: string[]
  ): Promise<{ total: number; successful: number; failed: number }> {
    let total = 0;
    let successful = 0;
    let failed = 0;
    
    // 确定接收者列表
    const targets = recipientIds || Array.from(this.recipients.keys());
    
    // 发送通知给每个接收者
    for (const id of targets) {
      total++;
      const result = await this.sendNotification(id, content);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }
    
    return { total, successful, failed };
  }
  
  /**
   * 通过特定渠道发送通知
   * @param channel 通知渠道
   * @param channelId 渠道ID
   * @param content 通知内容
   */
  private async sendToChannel(
    channel: NotificationChannel,
    channelId: string,
    content: NotificationContent
  ): Promise<void> {
    switch (channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmail(channelId, content);
        break;
      
      case NotificationChannel.SMS:
        await this.sendSMS(channelId, content);
        break;
      
      case NotificationChannel.PUSH:
        await this.sendPushNotification(channelId, content);
        break;
      
      case NotificationChannel.WEBHOOK:
        await this.callWebhook(channelId, content);
        break;
      
      default:
        throw new Error(`不支持的通知渠道: ${channel}`);
    }
  }
  
  /**
   * 发送邮件通知
   * @param email 邮箱地址
   * @param content 通知内容
   */
  private async sendEmail(email: string, content: NotificationContent): Promise<void> {
    if (!this.emailServiceUrl) {
      throw new Error('邮件服务未配置');
    }
    
    try {
      await axios.post(this.emailServiceUrl, {
        recipient: email,
        subject: content.title,
        message: content.message,
        type: content.type,
        metadata: content.data
      });
    } catch (error) {
      console.error('发送邮件失败:', error);
      throw new Error(`发送邮件失败: ${error.message}`);
    }
  }
  
  /**
   * 发送短信通知
   * @param phoneNumber 手机号码
   * @param content 通知内容
   */
  private async sendSMS(phoneNumber: string, content: NotificationContent): Promise<void> {
    if (!this.smsServiceUrl) {
      throw new Error('短信服务未配置');
    }
    
    try {
      await axios.post(this.smsServiceUrl, {
        recipient: phoneNumber,
        message: `${content.title}: ${content.message}`,
        type: content.type
      });
    } catch (error) {
      console.error('发送短信失败:', error);
      throw new Error(`发送短信失败: ${error.message}`);
    }
  }
  
  /**
   * 发送推送通知
   * @param deviceToken 设备令牌
   * @param content 通知内容
   */
  private async sendPushNotification(deviceToken: string, content: NotificationContent): Promise<void> {
    if (!this.pushServiceUrl) {
      throw new Error('推送服务未配置');
    }
    
    try {
      await axios.post(this.pushServiceUrl, {
        token: deviceToken,
        title: content.title,
        body: content.message,
        data: {
          type: content.type,
          ...content.data
        }
      });
    } catch (error) {
      console.error('发送推送通知失败:', error);
      throw new Error(`发送推送通知失败: ${error.message}`);
    }
  }
  
  /**
   * 调用Webhook
   * @param url Webhook URL
   * @param content 通知内容
   */
  private async callWebhook(url: string, content: NotificationContent): Promise<void> {
    try {
      await axios.post(url, {
        event: content.type,
        title: content.title,
        message: content.message,
        data: content.data,
        timestamp: content.timestamp
      });
    } catch (error) {
      console.error('调用Webhook失败:', error);
      throw new Error(`调用Webhook失败: ${error.message}`);
    }
  }
  
  /**
   * 处理检测到的交易
   * @param transaction 交易信息
   */
  private handleTransactionDetected(transaction: Transaction): void {
    // 查找与该交易相关的订阅
    const relevantSubscriptions = this.findRelevantSubscriptions(
      BlockchainEvent.TRANSACTION_DETECTED,
      transaction
    );
    
    // 为每个相关订阅创建通知
    for (const subscription of relevantSubscriptions) {
      // 如果订阅有回调函数，则调用
      if (subscription.callback) {
        subscription.callback(transaction);
      }
      
      // 创建通知内容
      const content: NotificationContent = {
        title: '检测到新交易',
        message: `交易 ${transaction.hash} 已被网络检测。`,
        type: NotificationType.TRANSACTION_CREATED,
        data: { transaction },
        timestamp: Date.now()
      };
      
      // 发送通知
      this.sendNotification(subscription.userId, content);
    }
    
    // 触发交易创建通知事件
    this.emit(NotificationType.TRANSACTION_CREATED, transaction);
  }
  
  /**
   * 处理确认的交易
   * @param transaction 交易信息
   */
  private handleTransactionConfirmed(transaction: Transaction): void {
    // 查找与该交易相关的订阅
    const relevantSubscriptions = this.findRelevantSubscriptions(
      BlockchainEvent.TRANSACTION_CONFIRMED,
      transaction
    );
    
    // 为每个相关订阅创建通知
    for (const subscription of relevantSubscriptions) {
      // 如果订阅有回调函数，则调用
      if (subscription.callback) {
        subscription.callback(transaction);
      }
      
      // 创建通知内容
      const content: NotificationContent = {
        title: '交易已确认',
        message: `交易 ${transaction.hash} 已成功确认，确认数: ${transaction.confirmations}。`,
        type: NotificationType.TRANSACTION_CONFIRMED,
        data: { transaction },
        timestamp: Date.now()
      };
      
      // 发送通知
      this.sendNotification(subscription.userId, content);
    }
    
    // 触发交易确认通知事件
    this.emit(NotificationType.TRANSACTION_CONFIRMED, transaction);
  }
  
  /**
   * 处理失败的交易
   * @param transaction 交易信息
   */
  private handleTransactionFailed(transaction: Transaction): void {
    // 查找与该交易相关的订阅
    const relevantSubscriptions = this.findRelevantSubscriptions(
      BlockchainEvent.TRANSACTION_FAILED,
      transaction
    );
    
    // 为每个相关订阅创建通知
    for (const subscription of relevantSubscriptions) {
      // 如果订阅有回调函数，则调用
      if (subscription.callback) {
        subscription.callback(transaction);
      }
      
      // 创建通知内容
      const content: NotificationContent = {
        title: '交易失败',
        message: `交易 ${transaction.hash} 失败。`,
        type: NotificationType.TRANSACTION_FAILED,
        data: { transaction },
        timestamp: Date.now()
      };
      
      // 发送通知
      this.sendNotification(subscription.userId, content);
    }
    
    // 触发交易失败通知事件
    this.emit(NotificationType.TRANSACTION_FAILED, transaction);
  }
  
  /**
   * 查找与事件相关的订阅
   * @param event 事件类型
   * @param data 事件数据
   * @returns 相关的订阅列表
   */
  private findRelevantSubscriptions(event: BlockchainEvent | NotificationType, data: any): EventSubscription[] {
    const relevant: EventSubscription[] = [];
    
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.active) continue;
      if (subscription.event !== event) continue;
      
      // 如果是交易类数据，根据地址和区块链类型筛选
      if (data.from && data.to && subscription.blockchain) {
        // 检查区块链类型
        if (data.blockchain && data.blockchain !== subscription.blockchain) {
          continue;
        }
        
        // 检查地址
        if (subscription.address &&
            subscription.address.toLowerCase() !== data.from.toLowerCase() &&
            subscription.address.toLowerCase() !== data.to.toLowerCase()) {
          continue;
        }
      }
      
      // 如果有合约地址过滤条件
      if (subscription.contractAddress && data.contractAddress) {
        if (subscription.contractAddress.toLowerCase() !== data.contractAddress.toLowerCase()) {
          continue;
        }
      }
      
      // 应用自定义过滤条件
      if (subscription.filter && typeof subscription.filter === 'object') {
        let passesFilter = true;
        
        for (const [key, value] of Object.entries(subscription.filter)) {
          if (data[key] !== value) {
            passesFilter = false;
            break;
          }
        }
        
        if (!passesFilter) continue;
      }
      
      relevant.push(subscription);
    }
    
    return relevant;
  }
  
  /**
   * 根据通知类型处理通知
   * @param type 通知类型
   * @param data 通知数据
   */
  private processNotificationByType(type: NotificationType, data: any): void {
    let title = '';
    let message = '';
    
    switch (type) {
      case NotificationType.TRANSACTION_CREATED:
        title = '新交易已创建';
        message = `交易 ${data.hash || data.id || '未知'} 已创建，等待确认。`;
        break;
      
      case NotificationType.TRANSACTION_CONFIRMED:
        title = '交易已确认';
        message = `交易 ${data.hash || data.id || '未知'} 已成功确认。`;
        break;
      
      case NotificationType.TRANSACTION_FAILED:
        title = '交易失败';
        message = `交易 ${data.hash || data.id || '未知'} 执行失败。`;
        break;
      
      case NotificationType.BRIDGE_STARTED:
        title = '跨链桥操作已开始';
        message = `从 ${data.sourceChain} 到 ${data.targetChain} 的桥接已开始。`;
        break;
      
      case NotificationType.BRIDGE_COMPLETED:
        title = '跨链桥操作已完成';
        message = `从 ${data.sourceChain} 到 ${data.targetChain} 的桥接已成功完成。`;
        break;
      
      case NotificationType.BRIDGE_FAILED:
        title = '跨链桥操作失败';
        message = `从 ${data.sourceChain} 到 ${data.targetChain} 的桥接失败。`;
        break;
      
      case NotificationType.SECURITY_ALERT:
        title = '安全警报';
        message = data.message || '检测到安全风险。';
        break;
      
      case NotificationType.PRICE_ALERT:
        title = '价格提醒';
        message = `${data.symbol} 价格 ${data.price} ${data.direction === 'up' ? '上涨' : '下跌'}。`;
        break;
      
      case NotificationType.WALLET_CONNECTED:
        title = '钱包已连接';
        message = `钱包 ${data.address} 已成功连接。`;
        break;
      
      case NotificationType.WALLET_DISCONNECTED:
        title = '钱包已断开连接';
        message = `钱包 ${data.address} 已断开连接。`;
        break;
      
      default:
        title = '系统通知';
        message = '收到新的系统通知。';
    }
    
    // 查找与该通知相关的订阅
    const relevantSubscriptions = this.findRelevantSubscriptions(type, data);
    
    // 为每个相关订阅创建通知
    for (const subscription of relevantSubscriptions) {
      if (subscription.callback) {
        subscription.callback(data);
      }
      
      // 创建通知内容
      const content: NotificationContent = {
        title,
        message,
        type,
        data,
        timestamp: Date.now()
      };
      
      // 发送通知
      this.sendNotification(subscription.userId, content);
    }
  }
  
  /**
   * 将通知添加到历史记录
   * @param userId 用户ID
   * @param content 通知内容
   */
  private addToHistory(userId: string, content: NotificationContent): void {
    // 获取用户的通知历史，如果不存在则创建
    let history = this.notificationHistory.get(userId);
    if (!history) {
      history = [];
      this.notificationHistory.set(userId, history);
    }
    
    // 添加新通知
    history.unshift(content);
    
    // 如果超过最大长度，则删除最旧的通知
    if (history.length > this.maxHistoryLength) {
      history.pop();
    }
  }
  
  /**
   * 获取用户的通知历史
   * @param userId 用户ID
   * @returns 通知历史记录
   */
  getNotificationHistory(userId: string): NotificationContent[] {
    return this.notificationHistory.get(userId) || [];
  }
  
  /**
   * 监听区块链交易
   * 用于将区块链服务的交易事件转发到通知系统
   * @param transaction 交易信息
   */
  monitorTransaction(transaction: Transaction): void {
    // 根据交易状态触发相应事件
    switch (transaction.status) {
      case TransactionStatus.PENDING:
        this.emit(BlockchainEvent.TRANSACTION_DETECTED, transaction);
        break;
      
      case TransactionStatus.CONFIRMED:
        this.emit(BlockchainEvent.TRANSACTION_CONFIRMED, transaction);
        break;
      
      case TransactionStatus.FAILED:
        this.emit(BlockchainEvent.TRANSACTION_FAILED, transaction);
        break;
    }
  }
  
  /**
   * 发送安全警报
   * @param message 警报消息
   * @param data 相关数据
   * @param recipientIds 接收者ID（未指定则发送给所有用户）
   */
  sendSecurityAlert(
    message: string,
    data: any,
    recipientIds?: string[]
  ): Promise<{ total: number; successful: number; failed: number }> {
    const content: NotificationContent = {
      title: '安全警报',
      message,
      type: NotificationType.SECURITY_ALERT,
      data,
      timestamp: Date.now()
    };
    
    // 广播安全警报
    return this.broadcastNotification(content, recipientIds);
  }
  
  /**
   * 发送价格提醒
   * @param symbol 代币符号
   * @param price 当前价格
   * @param direction 方向（上涨/下跌）
   * @param threshold 触发阈值
   * @param recipientIds 接收者ID
   */
  sendPriceAlert(
    symbol: string,
    price: number,
    direction: 'up' | 'down',
    threshold: number,
    recipientIds?: string[]
  ): Promise<{ total: number; successful: number; failed: number }> {
    const content: NotificationContent = {
      title: `${symbol} 价格提醒`,
      message: `${symbol} 价格已${direction === 'up' ? '上涨至' : '下跌至'} $${price}，${direction === 'up' ? '超过' : '低于'}阈值 $${threshold}。`,
      type: NotificationType.PRICE_ALERT,
      data: { symbol, price, direction, threshold },
      timestamp: Date.now()
    };
    
    // 广播价格提醒
    return this.broadcastNotification(content, recipientIds);
  }
} 