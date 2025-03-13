import { EventEmitter } from 'events';
import { 
  BridgeService, 
  BlockchainType, 
  BridgeType, 
  CrossChainTxStatus,
  CrossChainTxInfo
} from './bridgeService';

/**
 * Cross-chain monitoring event types
 */
export enum MonitorEventType {
  STATUS_CHANGED = 'status_changed',
  ERROR = 'error',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * Cross-chain transaction monitoring service
 * Responsible for tracking and updating the status of cross-chain transactions
 */
export class CrossChainMonitorService {
  private bridgeService: BridgeService;
  private eventEmitter: EventEmitter;
  private monitoredTxs: Map<string, {
    txInfo: CrossChainTxInfo;
    interval: NodeJS.Timeout;
    lastStatus: CrossChainTxStatus;
  }>;
  private readonly DEFAULT_POLLING_INTERVAL = 30000; // 30 seconds
  private readonly STATUS_CHANGE_CALLBACKS: Map<string, (txId: string, newStatus: CrossChainTxStatus) => void>;

  constructor(bridgeService: BridgeService) {
    this.bridgeService = bridgeService;
    this.eventEmitter = new EventEmitter();
    this.monitoredTxs = new Map();
    this.STATUS_CHANGE_CALLBACKS = new Map();
    
    // Set maximum number of listeners to avoid memory leak warnings
    this.eventEmitter.setMaxListeners(100);
  }

  /**
   * Start monitoring a cross-chain transaction
   * @param txInfo Cross-chain transaction information
   * @param pollingInterval Polling interval (milliseconds)
   * @returns Monitoring ID
   */
  public startMonitoring(
    txInfo: CrossChainTxInfo,
    pollingInterval: number = this.DEFAULT_POLLING_INTERVAL
  ): string {
    const txId = txInfo.id;
    
    // If already monitoring, return directly
    if (this.monitoredTxs.has(txId)) {
      console.log(`Transaction ${txId} is already being monitored`);
      return txId;
    }
    
    console.log(`Start monitoring cross-chain transaction: ${txId}, source chain: ${txInfo.sourceChain}, target chain: ${txInfo.targetChain}`);
    
    // Use setInterval to periodically check transaction status
    const interval = setInterval(async () => {
      try {
        await this.checkTransactionStatus(txId, txInfo.bridgeType);
      } catch (error) {
        console.error(`Error monitoring transaction ${txId}:`, error);
        this.eventEmitter.emit(MonitorEventType.ERROR, {
          txId,
          error: error.message
        });
      }
    }, pollingInterval);
    
    // Store transaction information and monitoring status
    this.monitoredTxs.set(txId, {
      txInfo,
      interval,
      lastStatus: txInfo.status
    });
    
    return txId;
  }

  /**
   * Stop monitoring a cross-chain transaction
   * @param txId Transaction ID
   */
  public stopMonitoring(txId: string): void {
    const monitored = this.monitoredTxs.get(txId);
    
    if (monitored) {
      console.log(`Stop monitoring cross-chain transaction: ${txId}`);
      clearInterval(monitored.interval);
      this.monitoredTxs.delete(txId);
    } else {
      console.warn(`Monitored transaction not found: ${txId}`);
    }
  }

  /**
   * Get current transaction status
   * @param txId Transaction ID
   * @returns Transaction information or undefined (if not found)
   */
  public getTransaction(txId: string): CrossChainTxInfo | undefined {
    const monitored = this.monitoredTxs.get(txId);
    return monitored?.txInfo;
  }

  /**
   * Get all monitored transactions
   * @returns Array of transaction information
   */
  public getAllMonitoredTransactions(): CrossChainTxInfo[] {
    return Array.from(this.monitoredTxs.values()).map(m => m.txInfo);
  }

  /**
   * Check transaction status and handle status changes
   * @param txId Transaction ID
   * @param bridgeType Bridge type
   * @private
   */
  private async checkTransactionStatus(txId: string, bridgeType: BridgeType): Promise<void> {
    const monitored = this.monitoredTxs.get(txId);
    
    if (!monitored) {
      console.warn(`Attempted to check unmonitored transaction: ${txId}`);
      return;
    }
    
    // Get latest status
    const currentStatus = await this.bridgeService.getTransactionStatus(txId, bridgeType);
    const lastStatus = monitored.lastStatus;
    
    // Status has changed
    if (currentStatus !== lastStatus) {
      console.log(`Transaction ${txId} status changed: ${lastStatus} -> ${currentStatus}`);
      
      // Update stored status
      monitored.lastStatus = currentStatus;
      monitored.txInfo.status = currentStatus;
      monitored.txInfo.updatedAt = new Date();
      
      // Trigger status change event
      this.eventEmitter.emit(MonitorEventType.STATUS_CHANGED, {
        txId,
        oldStatus: lastStatus,
        newStatus: currentStatus,
        txInfo: monitored.txInfo
      });
      
      // If transaction completed, failed, or refunded, stop monitoring
      if (
        currentStatus === CrossChainTxStatus.TARGET_CONFIRMED ||
        currentStatus === CrossChainTxStatus.FAILED ||
        currentStatus === CrossChainTxStatus.REFUNDED
      ) {
        // Trigger appropriate event
        if (currentStatus === CrossChainTxStatus.TARGET_CONFIRMED) {
          this.eventEmitter.emit(MonitorEventType.COMPLETED, {
            txId,
            txInfo: monitored.txInfo
          });
        } else if (currentStatus === CrossChainTxStatus.FAILED) {
          this.eventEmitter.emit(MonitorEventType.FAILED, {
            txId,
            txInfo: monitored.txInfo
          });
        } else if (currentStatus === CrossChainTxStatus.REFUNDED) {
          this.eventEmitter.emit(MonitorEventType.REFUNDED, {
            txId,
            txInfo: monitored.txInfo
          });
        }
        
        // Stop monitoring
        this.stopMonitoring(txId);
      }
      
      // Call registered callback function
      const callback = this.STATUS_CHANGE_CALLBACKS.get(txId);
      if (callback) {
        callback(txId, currentStatus);
      }
    }
  }

  /**
   * Subscribe to transaction status change events
   * @param eventType Event type
   * @param listener Listener function
   */
  public subscribe(
    eventType: MonitorEventType,
    listener: (data: any) => void
  ): void {
    this.eventEmitter.on(eventType, listener);
  }

  /**
   * Unsubscribe from transaction status change events
   * @param eventType Event type
   * @param listener Listener function
   */
  public unsubscribe(
    eventType: MonitorEventType,
    listener: (data: any) => void
  ): void {
    this.eventEmitter.off(eventType, listener);
  }

  /**
   * Register a status change callback for a single transaction
   * @param txId Transaction ID
   * @param callback Callback function
   */
  public registerStatusChangeCallback(
    txId: string,
    callback: (txId: string, newStatus: CrossChainTxStatus) => void
  ): void {
    this.STATUS_CHANGE_CALLBACKS.set(txId, callback);
  }

  /**
   * Remove a status change callback for a single transaction
   * @param txId Transaction ID
   */
  public removeStatusChangeCallback(txId: string): void {
    this.STATUS_CHANGE_CALLBACKS.delete(txId);
  }
} 