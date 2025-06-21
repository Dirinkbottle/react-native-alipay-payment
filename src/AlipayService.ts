// src/AlipayService.ts

// 使用NativeModules和DeviceEventEmitter
import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';

// 直接使用NativeModules
const AlipayModule = NativeModules.AlipayModule;

// 回调函数类型定义
export type PaymentCallback = (result: PaymentResponse) => void;


interface PaymentResponse {
  success: boolean;
  processing?: boolean;
  cancelled?: boolean;
  message?: string;
  resultStatus?: string;
  orderSn?: string;
  result?: string;
  memo?: string;
  rawResult?: any;
}


/**
 * 支付宝支付服务，处理业务层面的支付逻辑
 */
export class PaymentService {
  private useSandbox: boolean;
  private eventListener: EmitterSubscription | null = null;
  private paymentCallbacks: PaymentCallback[] = [];
  
  /**
   * 支付服务构造函数
   * @param config - 服务器支付配置
   * @param useSandbox - 是否使用沙箱环境
   */
  constructor(useSandbox: boolean = false) {
    this.useSandbox = useSandbox;
    
    // 设置事件监听
    this.setupEventListener();
  }
  
  /**
   * 设置支付宝支付结果事件监听
   */
  private setupEventListener(): void {
    // 先移除之前可能存在的监听器
    this.removeEventListener();
    
    // 添加新的事件监听器
    this.eventListener = DeviceEventEmitter.addListener(
      'AlipayPaymentResult',
      (result) => {
        console.log('收到支付宝支付结果事件:', result);
        
        // 转换为标准PaymentResponse格式
        const paymentResponse: PaymentResponse = this.formatPaymentResult(result);
        
        // 通知所有注册的回调
        this.notifyCallbacks(paymentResponse);
      }
    );
  }
  
  /**
   * 移除事件监听器
   */
  public removeEventListener(): void {
    if (this.eventListener) {
      this.eventListener.remove();
      this.eventListener = null;
    }
  }
  
  /**
   * 添加支付结果回调
   * @param callback - 支付结果回调函数
   */
  public addPaymentCallback(callback: PaymentCallback): void {
    this.paymentCallbacks.push(callback);
  }
  
  /**
   * 移除支付结果回调
   * @param callback - 要移除的回调函数
   */
  public removePaymentCallback(callback: PaymentCallback): void {
    const index = this.paymentCallbacks.indexOf(callback);
    if (index !== -1) {
      this.paymentCallbacks.splice(index, 1);
    }
  }
  
  /**
   * 通知所有注册的回调
   * @param result - 支付结果
   */
  private notifyCallbacks(result: PaymentResponse): void {
    this.paymentCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error("支付回调执行异常:", error);
      }
    });
  }
  
  /**
   * 格式化支付结果
   * @param result - 原始支付结果
   * @returns 格式化后的支付结果
   */
  private formatPaymentResult(result: any): PaymentResponse {
    const resultStatus = result.resultStatus;
    const success = resultStatus === '9000';
    const processing = resultStatus === '8000';
    const cancelled = resultStatus === '6001';
    
    return {
      success,
      processing,
      cancelled,
      message: this.getPaymentMessage(resultStatus),
      resultStatus: resultStatus,
      result: result.result,
      memo: result.memo,
      rawResult: result
    };
  }
  
  /**
   * 初始化支付环境
   * @returns Promise<boolean>
   */
  async initialize(): Promise<boolean> {
    try {
      // 设置沙箱环境
      await AlipayModule.setSandboxMode(this.useSandbox);
      
      // 重置支付状态
      await AlipayModule.resetPaymentState();
      
      // 检查支付宝是否已安装
      const isInstalled = await AlipayModule.isAlipayInstalled();
      
      return isInstalled;
    } catch (error) {
      console.error("支付宝初始化异常:", error);
      return false;
    }
  }
  
  /**
   * 使用订单字符串直接支付
   * @param orderString - 完整的支付宝订单参数字符串
   * @param callback - 可选的回调函数，用于接收事件方式的结果通知
   * @returns Promise<PaymentResponse> - 支付结果
   */
  async payWithOrderString(
    orderString: string, 
    callback?: PaymentCallback
  ): Promise<PaymentResponse> {
    try {
      // 如果提供了回调函数，添加到回调列表
      if (callback) {
        this.addPaymentCallback(callback);
      }
      
      // 直接调用支付宝支付
      const result = await AlipayModule.pay(orderString);
      
      // 格式化结果
      return this.formatPaymentResult(result);
    } catch (error: any) {
      const errorResponse: PaymentResponse = {
        success: false,
        message: error?.message || '支付过程出错'
      };
      
      // 如果是事件方式的回调，也发送错误通知
      if (callback) {
        setTimeout(() => {
          this.notifyCallbacks(errorResponse);
          // 调用完成后移除一次性回调
          this.removePaymentCallback(callback);
        }, 0);
      }
      
      return errorResponse;
    }
  }
  
  /**
   * 获取支付结果消息
   * @param resultStatus - 结果状态码
   * @returns string - 提示消息
   */
  private getPaymentMessage(resultStatus: string): string {
    switch (resultStatus) {
      case '9000':
        return '支付成功';
      case '8000':
        return '支付结果确认中';
      case '4000':
        return '支付失败';
      case '6001':
        return '用户取消支付';
      case '6002':
        return '网络连接错误';
      case '6004':
      default:
        return '未知错误';
    }
  }
  
  /**
   * 清理资源
   * 在组件卸载时调用此方法
   */
  public cleanup(): void {
    this.removeEventListener();
    this.paymentCallbacks = [];
  }
}

// 导出支付宝常量
export const AlipayConstants = {
  SUCCESS: '9000',
  PROCESSING: '8000',
  FAILED: '4000',
  CANCEL: '6001',
  NETWORK_ERROR: '6002',
  UNKNOWN: '6004'
};

export default PaymentService;