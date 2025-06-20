declare module 'react-native-alipay-payment' {
  /**
   * 支付结果状态码常量
   */
  export interface AlipayStatusCodes {
    SUCCESS: string;      // 支付成功
    PROCESSING: string;   // 处理中
    FAILED: string;       // 支付失败
    CANCEL: string;       // 用户取消
    NETWORK_ERROR: string; // 网络错误
    UNKNOWN: string;      // 未知错误
  }
  
  /**
   * 错误码详细映射
   */
  export interface AlipayErrorCodeInfo {
    type: string;      // 错误类型
    message: string;   // 错误消息
  }
  
  /**
   * 错误码映射表
   */
  export interface AlipayErrorCodeMap {
    [errorCode: string]: AlipayErrorCodeInfo;
  }
  
  /**
   * 原始支付结果
   */
  export interface AlipayPayResult {
    resultStatus: string;    // 支付结果状态码
    result?: string;         // 支付结果数据
    memo?: string;           // 支付结果备注
    [key: string]: any;      // 其他可能的字段
  }
  
  /**
   * 格式化后的支付结果
   */
  export interface AlipayFormattedResult {
    success: boolean;        // 是否支付成功
    processing: boolean;     // 是否处理中
    cancelled: boolean;      // 是否被取消
    pending?: boolean;       // 是否等待处理
    resultStatus: string;    // 原始结果状态码
    message: string;         // 结果消息
    result?: string;         // 原始结果数据
    memo?: string;           // 备注信息
    rawResult?: AlipayPayResult; // 原始返回数据
    timestamp?: number;      // 时间戳
    orderInfo?: string;      // 订单信息片段
    error?: Error;           // 错误对象
    errorType?: string;      // 错误类型
    userFriendlyMessage?: string; // 用户友好提示
  }
  
  /**
   * 调试信息
   */
  export interface AlipayDebugInfo {
    device: string;          // 设备型号
    model: string;           // 设备模型
    manufacturer: string;    // 设备制造商
    androidVersion: string;  // Android版本
    androidSDKInt: number;   // Android SDK版本
    packageName?: string;    // 应用包名
    appVersionName?: string; // 应用版本名
    appVersionCode?: number; // 应用版本号
    sandboxMode: boolean;    // 是否沙箱模式
    paymentInProgress: boolean; // 是否支付进行中
    lastPaymentTime: number; // 上次支付时间
    alipayInstalled?: boolean; // 是否安装支付宝
    alipayVersion?: string;  // 支付宝版本
    appInfoError?: string;   // 应用信息错误
    alipayError?: string;    // 支付宝相关错误
  }
  
  /**
   * 订单验证结果
   */
  export interface OrderValidationResult {
    isValid: boolean;        // 是否有效
    missingFields: string[]; // 缺失字段列表
  }

  const AlipayPayment: {
    /**
     * 发起支付宝支付
     * @param orderInfo 完整的支付宝订单信息字符串
     * @returns 支付结果
     */
    pay(orderInfo: string): Promise<AlipayPayResult>;

    /**
     * 设置是否使用沙箱模式
     * @param enabled 是否启用沙箱模式
     * @returns 设置结果
     */
    setSandboxMode(enabled: boolean): Promise<boolean>;

    /**
     * 获取当前沙箱模式状态
     * @returns 是否处于沙箱模式
     */
    isSandboxEnabled(): Promise<boolean>;

    /**
     * 重置支付状态(解决可能的状态卡住问题)
     * @returns 操作结果
     */
    resetPaymentState(): Promise<boolean>;

    /**
     * 检查支付宝是否已安装
     * @returns 是否安装
     */
    isAlipayInstalled(): Promise<boolean>;

    /**
     * 获取支付宝SDK版本号
     * @returns 版本号
     */
    getAlipayVersion(): Promise<string>;

    /**
     * 检查支付结果是否成功
     * @param resultStatus 支付结果状态码
     * @returns 是否支付成功
     */
    isPaymentSuccess(resultStatus: string): boolean;

    /**
     * 检查支付是否处理中
     * @param resultStatus 支付结果状态码
     * @returns 是否处理中
     */
    isPaymentProcessing(resultStatus: string): boolean;

    /**
     * 检查支付是否被取消
     * @param resultStatus 支付结果状态码
     * @returns 是否取消
     */
    isPaymentCancelled(resultStatus: string): boolean;

    /**
     * 获取支付结果对应的文字消息
     * @param resultStatus 支付结果状态码
     * @returns 对应的文字消息
     */
    getPaymentMessage(resultStatus: string): string;

    /**
     * 格式化支付结果
     * @param payResult 原始支付结果
     * @returns 格式化后的结果
     */
    formatPayResult(payResult: AlipayPayResult): AlipayFormattedResult;

    /**
     * 发起支付并返回格式化的结果
     * @param orderInfo 支付宝订单信息字符串
     * @returns 格式化的支付结果
     */
    payWithResult(orderInfo: string): Promise<AlipayFormattedResult>;

    /**
     * 格式化错误对象
     * @param error 错误对象
     * @returns 格式化后的错误对象
     */
    formatError(error: any): Error;

    /**
     * 获取错误类型
     * @param error 错误对象
     * @returns 错误类型
     */
    getErrorType(error: Error): string;

    /**
     * 获取用户友好的错误提示
     * @param error 错误对象
     * @returns 用户友好的错误提示
     */
    getUserFriendlyErrorMessage(error: Error): string;

    /**
     * 验证订单参数
     * @param orderInfo 订单信息
     * @returns 验证结果
     */
    validateOrderInfo(orderInfo: string): OrderValidationResult;

    /**
     * 获取网络错误详情
     * @param error 错误对象
     * @returns 网络错误类型
     */
    getNetworkErrorDetail(error: Error): string;

    /**
     * 处理网络错误
     * @param error 错误对象
     * @returns 处理后的错误信息
     */
    handleNetworkError(error: Error): any;

    /**
     * 设置调试模式
     * @param enabled 是否启用
     * @returns 设置结果
     */
    setDebugMode(enabled: boolean): Promise<boolean>;

    /**
     * 获取调试信息
     * @returns 调试信息对象
     */
    getDebugInfo(): Promise<AlipayDebugInfo>;

    /**
     * 记录调试日志
     * @param level 日志级别
     * @param message 日志内容
     * @returns 记录结果
     */
    logDebugInfo(level: 'debug' | 'info' | 'warn' | 'error', message: string): Promise<boolean>;

    /** 支付状态码常量 */
    STATUS_CODES: AlipayStatusCodes;

    /** 错误码映射表 */
    ERROR_CODE_MAP: AlipayErrorCodeMap;
  };

  export const ReactNativeAlipayPayment: typeof AlipayPayment;
  export const AlipayConstants: AlipayStatusCodes;
  export const AlipayErrorCodes: AlipayErrorCodeMap;
  
  export default AlipayPayment;
} 