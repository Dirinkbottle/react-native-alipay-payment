// example/src/PaymentService.ts
import axios from 'axios';
import { NativeModules } from 'react-native';

// 直接使用NativeModules
const { AlipayPayment } = NativeModules;

interface OrderParams {
  productId: string;
  quantity: number;
  charge?: number;
  reqtype: number; // 0: 商品购买, 1: 钱包充值
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  resultStatus?: string;
  orderSn?: string;
}

export class PaymentService {
  private apiUrl: string;
  private token: string;
  
  constructor(apiUrl: string, token: string) {
    this.apiUrl = apiUrl;
    this.token = token;
  }
  
  // 创建订单并支付
  async createOrderAndPay(params: OrderParams): Promise<PaymentResponse> {
    try {
      // 1. 确保沙箱环境已设置(开发环境)
      await AlipayPayment.setSandboxMode(true);
      
      // 2. 重置支付状态
      await AlipayPayment.resetPaymentState();
      
      // 3. 从服务器获取支付宝订单信息
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
      
      // 4. 从服务器响应中提取orderStr
      const orderStr = response.data.result;
      const orderSn = response.data.orderSn;
      
      if (!orderStr) {
        throw new Error('支付参数(orderStr)为空');
      }
      
      // 5. 调用支付宝SDK进行支付
      const result = await AlipayPayment.pay(orderStr);
      
      // 6. 处理支付结果
      const success = AlipayPayment.isPaymentSuccess(result.resultStatus);
      const message = AlipayPayment.getPaymentMessage(result.resultStatus);
      
      return {
        success,
        message,
        resultStatus: result.resultStatus,
        orderSn
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '支付过程出错'
      };
    }
  }
}