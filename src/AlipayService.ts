// src/AlipayService.ts
import axios from 'axios';
// 使用NativeModules直接导入
import { NativeModules } from 'react-native';

// 直接使用NativeModules
const AlipayModule = NativeModules.AlipayModule;

interface OrderParams {
  productId: string;
  quantity: number;
  charge?: number;
  reqtype: number; // 0: 商品购买, 1: 钱包充值
}

interface PaymentResponse {
  success: boolean;
  processing?: boolean;
  cancelled?: boolean;
  message?: string;
  resultStatus?: string;
  orderSn?: string;
}

interface ServerPaymentConfig {
  apiUrl: string;
  token: string;
}

/**
 * 支付宝支付服务，处理业务层面的支付逻辑
 */
export class PaymentService {
  private apiUrl: string;
  private token: string;
  private useSandbox: boolean;
  
  /**
   * 支付服务构造函数
   * @param config - 服务器支付配置
   * @param useSandbox - 是否使用沙箱环境
   */
  constructor(config: ServerPaymentConfig, useSandbox: boolean = false) {
    this.apiUrl = config.apiUrl;
    this.token = config.token;
    this.useSandbox = useSandbox;
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
   * @returns Promise<PaymentResponse> - 支付结果
   */
  async payWithOrderString(orderString: string): Promise<PaymentResponse> {
    try {
      // 直接调用支付宝支付
      const result = await AlipayModule.pay(orderString);
      
      // 判断结果状态
      const success = result.resultStatus === '9000';
      const processing = result.resultStatus === '8000';
      const cancelled = result.resultStatus === '6001';
      
      return {
        success,
        processing,
        cancelled,
        message: this.getPaymentMessage(result.resultStatus),
        resultStatus: result.resultStatus
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || '支付过程出错'
      };
    }
  }
  
  /**
   * 创建订单并支付（完整流程）
   * @param params - 订单参数
   * @returns Promise<PaymentResponse> - 支付结果
   */
  async createOrderAndPay(params: OrderParams): Promise<PaymentResponse> {
    try {
      // 1. 确保环境已初始化
      await this.initialize();
      
      // 2. 从服务器获取支付宝订单信息
      const headers = {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(
        `${this.apiUrl}/api/payment/alipay`,
        {
          reqtype: params.reqtype,
          productId: params.productId,
          sumbuy: params.quantity,
          charge: params.charge
        },
        { headers }
      );
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || '获取支付信息失败');
      }
      
      // 3. 从服务器响应中提取orderStr和orderSn
      const orderStr = response.data.result;
      const orderSn = response.data.orderSn;
      
      if (!orderStr) {
        throw new Error('支付参数(orderStr)为空');
      }
      
      // 4. 调用支付宝SDK进行支付
      const result = await this.payWithOrderString(orderStr);
      
      return {
        ...result,
        orderSn
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || '支付过程出错'
      };
    }
  }
  
  /**
   * 查询订单状态
   * @param orderSn - 订单号
   * @returns Promise<any> - 订单状态查询结果
   */
  async queryOrderStatus(orderSn: string): Promise<any> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(
        `${this.apiUrl}/api/payment/query/${orderSn}`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      throw error;
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