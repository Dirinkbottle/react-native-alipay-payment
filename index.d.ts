declare module 'react-native-alipay-payment' {
  export interface AlipayResult {
    resultStatus: string;
    result?: string;
    memo?: string;
    [key: string]: any;
  }

  export interface FormattedPayResult {
    success: boolean;
    processing: boolean;
    cancelled: boolean;
    pending: boolean;
    resultStatus: string;
    message: string;
    result: string;
    memo: string;
    rawResult: AlipayResult | null;
    error?: Error;
  }

  export interface StatusCodes {
    SUCCESS: string;
    PROCESSING: string;
    FAILED: string;
    CANCEL: string;
    NETWORK_ERROR: string;
    UNKNOWN: string;
  }

  const AlipayPayment: {
    /**
     * 发起支付宝支付
     * @param orderInfo - 支付宝订单信息字符串
     * @returns 支付结果
     */
    pay(orderInfo: string): Promise<AlipayResult>;

    /**
     * 设置是否使用沙箱环境(仅开发测试时使用)
     * @param enabled - 是否启用沙箱模式
     */
    setSandboxMode(enabled: boolean): Promise<boolean>;

    /**
     * 重置支付状态(解决可能的支付状态卡住问题)
     */
    resetPaymentState(): Promise<boolean>;

    /**
     * 检查支付宝是否安装
     * @returns 是否已安装支付宝
     */
    isAlipayInstalled(): Promise<boolean>;

    /**
     * 获取支付宝SDK版本
     * @returns 支付宝SDK版本号
     */
    getAlipayVersion(): Promise<string>;

    /**
     * 检查支付结果是否成功
     * @param resultStatus - 支付结果状态码
     * @returns 是否支付成功
     */
    isPaymentSuccess(resultStatus: string): boolean;

    /**
     * 检查支付是否处理中
     * @param resultStatus - 支付结果状态码
     * @returns 是否处理中
     */
    isPaymentProcessing(resultStatus: string): boolean;

    /**
     * 检查支付是否被取消
     * @param resultStatus - 支付结果状态码
     * @returns 是否被取消
     */
    isPaymentCancelled(resultStatus: string): boolean;

    /**
     * 获取支付结果对应的文字消息
     * @param resultStatus - 支付结果状态码
     * @returns 对应的文字消息
     */
    getPaymentMessage(resultStatus: string): string;

    /**
     * 格式化支付结果为易于理解的对象
     * @param payResult - 原始支付结果
     * @returns 格式化后的结果对象
     */
    formatPayResult(payResult: AlipayResult): FormattedPayResult;

    /**
     * 简化的支付方法，直接返回格式化的结果
     * @param orderInfo - 支付宝订单信息字符串
     * @returns 格式化的支付结果
     */
    payWithResult(orderInfo: string): Promise<FormattedPayResult>;

    /**
     * 支付宝状态码常量
     */
    STATUS_CODES: StatusCodes;
  };

  export const AlipayConstants: StatusCodes;
  export const ReactNativeAlipayPayment: typeof AlipayPayment;
  
  export default AlipayPayment;
} 