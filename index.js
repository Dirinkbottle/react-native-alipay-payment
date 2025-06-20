import { NativeModules, Platform } from 'react-native';

const { AlipayModule } = NativeModules;

// 检查原生模块是否正确加载
if (!AlipayModule) {
  throw new Error('AlipayModule 原生模块未找到，请检查原生部分是否正确安装和链接');
}

// 状态码常量
const STATUS_CODES = {
  SUCCESS: '9000', // 支付成功
  PROCESSING: '8000', // 支付结果确认中
  FAILED: '4000', // 支付失败
  CANCEL: '6001', // 用户取消
  NETWORK_ERROR: '6002', // 网络连接出错
  UNKNOWN: '6004', // 未知错误
};

// 扩展错误码映射表
const ERROR_CODE_MAP = {
  // 支付宝官方错误码
  '9000': { type: 'SUCCESS', message: '支付成功' },
  '8000': { type: 'PROCESSING', message: '正在处理中，支付结果未知' },
  '4000': { type: 'BUSINESS_ERROR', message: '支付失败，订单或参数错误' },
  '6001': { type: 'USER_CANCEL', message: '用户取消支付操作' },
  '6002': { type: 'NETWORK_ERROR', message: '网络连接错误' },
  '6004': { type: 'UNKNOWN', message: '支付结果未知，请稍后查询' },
  '6005': { type: 'OTHER_ERROR', message: '其他支付错误' },
  // 扩展的网络错误子类别
  'NET_DISCONNECTED': { type: 'NETWORK_ERROR', message: '网络连接已断开' },
  'NET_TIMEOUT': { type: 'NETWORK_ERROR', message: '网络连接超时' },
  'SERVER_ERROR': { type: 'NETWORK_ERROR', message: '服务器响应错误' },
  'GATEWAY_ERROR': { type: 'NETWORK_ERROR', message: '网关错误' },
  // 内部错误码
  'ALIPAY_NOT_INSTALLED': { type: 'ENVIRONMENT_ERROR', message: '未安装支付宝客户端' },
  'INVALID_PARAMETER': { type: 'PARAMETER_ERROR', message: '参数格式不正确' },
  'PAYMENT_IN_PROGRESS': { type: 'STATE_ERROR', message: '已有支付操作正在进行中' }
};

/**
 * 支付宝支付模块
 */
const AlipayPayment = {
  /**
   * 发起支付宝支付
   * @param {string} orderInfo - 支付宝订单信息字符串
   * @returns {Promise<Object>} - 支付结果
   */
  async pay(orderInfo) {
    // 增强参数校验
    if (!orderInfo) {
      throw new Error('支付参数不能为空');
    }
    
    if (typeof orderInfo !== 'string') {
      throw new Error('支付参数必须是字符串类型');
    }
    
    // 简单格式校验
    if (orderInfo.length < 10) {
      throw new Error('支付参数格式不正确');
    }
    
    try {
      return await AlipayModule.pay(orderInfo);
    } catch (error) {
      const formattedError = this.formatError(error);
      throw formattedError;
    }
  },
  
  /**
   * 设置是否使用沙箱环境(仅开发测试时使用)
   * @param {boolean} enabled - 是否启用沙箱模式
   * @returns {Promise<boolean>}
   */
  async setSandboxMode(enabled) {
    return await AlipayModule.setSandboxMode(!!enabled);
  },
  
  /**
   * 获取当前沙箱模式状态
   * @returns {Promise<boolean>} - 是否处于沙箱模式
   */
  async isSandboxEnabled() {
    return await AlipayModule.isSandboxEnabled();
  },
  
  /**
   * 重置支付状态(解决可能的支付状态卡住问题)
   * @returns {Promise<boolean>}
   */
  async resetPaymentState() {
    return await AlipayModule.resetPaymentState();
  },
  
  /**
   * 检查支付宝是否已安装
   * @returns {Promise<boolean>}
   */
  async isAlipayInstalled() {
    if (Platform.OS === 'android') {
      return await AlipayModule.isAlipayInstalled();
    } else {
      // 暂不支持iOS
      return false;
    }
  },
  
  /**
   * 获取支付宝SDK版本
   * @returns {Promise<string>}
   */
  async getAlipayVersion() {
    if (Platform.OS === 'android') {
      return await AlipayModule.getAlipayVersion();
    } else {
      // 暂不支持iOS
      throw new Error('仅支持Android平台');
    }
  },
  
  /**
   * 检查支付结果是否成功
   * @param {string} resultStatus - 支付结果状态码
   * @returns {boolean} - 是否支付成功
   */
  isPaymentSuccess(resultStatus) {
    return resultStatus === STATUS_CODES.SUCCESS;
  },

  /**
   * 检查支付是否处理中
   * @param {string} resultStatus - 支付结果状态码
   * @returns {boolean} - 是否处理中
   */
  isPaymentProcessing(resultStatus) {
    return resultStatus === STATUS_CODES.PROCESSING;
  },

  /**
   * 检查支付是否被取消
   * @param {string} resultStatus - 支付结果状态码
   * @returns {boolean} - 是否被取消
   */
  isPaymentCancelled(resultStatus) {
    return resultStatus === STATUS_CODES.CANCEL;
  },
  
  /**
   * 获取支付结果对应的文字消息
   * @param {string} resultStatus - 支付结果状态码
   * @returns {string} - 对应的文字消息
   */
  getPaymentMessage(resultStatus) {
    // 使用错误码映射表获取消息
    const errorInfo = ERROR_CODE_MAP[resultStatus];
    if (errorInfo) {
      return errorInfo.message;
    }
    
    // 兜底返回
    return '未知状态：' + resultStatus;
  },
  
  /**
   * 格式化支付结果为易于理解的对象
   * @param {Object} payResult - 原始支付结果
   * @returns {Object} - 格式化后的结果对象
   */
  formatPayResult(payResult) {
    const success = this.isPaymentSuccess(payResult.resultStatus);
    const processing = this.isPaymentProcessing(payResult.resultStatus);
    const cancelled = this.isPaymentCancelled(payResult.resultStatus);
    
    return {
      success,
      processing,
      cancelled,
      pending: processing,
      resultStatus: payResult.resultStatus,
      message: this.getPaymentMessage(payResult.resultStatus),
      result: payResult.result || '',
      memo: payResult.memo || '',
      rawResult: payResult
    };
  },
  
  /**
   * 简化的支付方法，直接返回格式化的结果
   * @param {string} orderInfo - 支付宝订单信息字符串
   * @returns {Promise<Object>} - 格式化的支付结果
   */
  async payWithResult(orderInfo) {
    try {
      const payResult = await this.pay(orderInfo);
      return {
        ...this.formatPayResult(payResult),
        timestamp: new Date().getTime(),
        orderInfo: orderInfo.substring(0, 20) + '...' // 仅保留部分参数用于调试
      };
    } catch (error) {
      // 统一错误返回格式
      const standardErrorResult = {
        success: false,
        processing: false,
        cancelled: false,
        pending: false,
        resultStatus: STATUS_CODES.FAILED,
        message: error.message || '支付失败',
        result: '',
        memo: error.message || '支付过程出错',
        rawResult: null,
        error: error,
        errorType: error.errorType || 'UNKNOWN_ERROR',
        userFriendlyMessage: error.userFriendlyMessage || '支付过程出现错误',
        timestamp: new Date().getTime()
      };
      return standardErrorResult;
    }
  },
  
  /**
   * 验证订单信息字段
   * @param {string} orderInfo - 支付宝订单信息字符串
   * @returns {Object} - 验证结果，包含isValid和missingFields
   */
  validateOrderInfo(orderInfo) {
    // 必要的订单参数
    const requiredFields = ['app_id', 'method', 'format', 'charset', 'sign_type', 'sign', 'timestamp', 'version'];
    const missingFields = [];
    
    // 检查必要参数是否存在
    for (const field of requiredFields) {
      if (!orderInfo.includes(field + '=')) {
        missingFields.push(field);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields
    };
  },
  
  /**
   * 设置调试模式
   * @param {boolean} enabled - 是否启用调试模式
   * @returns {Promise<boolean>}
   */
  async setDebugMode(enabled) {
    if (Platform.OS === 'android') {
      return await AlipayModule.setDebugMode(!!enabled);
    }
    // 在开发模式下输出警告
    if (__DEV__) {
      console.warn('[AlipayPayment] 调试模式目前仅支持Android平台');
    }
    return false;
  },
  
  /**
   * 获取调试信息
   * @returns {Promise<Object>}
   */
  async getDebugInfo() {
    if (Platform.OS === 'android') {
      return await AlipayModule.getDebugInfo();
    } else {
      throw new Error('获取调试信息功能仅支持Android平台');
    }
  },
  
  /**
   * 记录调试日志
   * @param {string} level - 日志级别 ("debug", "info", "warn", "error")
   * @param {string} message - 日志内容
   * @returns {Promise<boolean>}
   */
  async logDebugInfo(level, message) {
    if (Platform.OS === 'android') {
      return await AlipayModule.logDebugInfo(level, message);
    }
    return false;
  },
  
  /**
   * 格式化错误对象，统一错误处理
   * @param {Error|Object} error - 错误对象
   * @returns {Error} - 格式化后的错误对象
   */
  formatError(error) {
    // 确保是Error对象
    if (!(error instanceof Error)) {
      const errorMessage = typeof error === 'string' ? error : 
                          (error?.message || '未知错误');
      error = new Error(errorMessage);
    }
    
    // 添加额外信息
    error.errorCode = error.code || 'UNKNOWN_ERROR';
    error.errorType = this.getErrorType(error);
    error.userFriendlyMessage = this.getUserFriendlyErrorMessage(error);
    
    // 方便调试
    if (__DEV__) {
      console.warn('[AlipayPayment] 错误:', error.message, error);
      // 在调试模式下记录到原生日志
      this.logDebugInfo('error', `支付错误: ${error.message}`).catch(() => {});
    }
    
    return error;
  },

  /**
   * 获取错误类型分类
   * @param {Error} error - 错误对象
   * @returns {string} - 错误类型
   */
  getErrorType(error) {
    const message = error.message || '';
    if (message.includes('network') || message.includes('网络')) {
      // 使用细分的网络错误
      return this.getNetworkErrorDetail(error);
    } else if (message.includes('支付宝') || message.includes('alipay')) {
      return 'ALIPAY_ERROR';
    } else if (message.includes('参数')) {
      return 'PARAMETER_ERROR';
    }
    return 'UNKNOWN_ERROR';
  },

  /**
   * 获取用户友好的错误提示
   * @param {Error} error - 错误对象
   * @returns {string} - 用户友好的错误提示
   */
  getUserFriendlyErrorMessage(error) {
    const errorType = error.errorType || this.getErrorType(error);
    
    switch (errorType) {
      case 'NETWORK_ERROR':
        return '网络连接出现问题，请检查您的网络设置后重试';
      case 'ALIPAY_ERROR':
        return '支付宝处理请求时出错，请稍后再试';
      case 'PARAMETER_ERROR':
        return '支付参数有误，请联系客服处理';
      default:
        return '支付过程中出现未知错误，请稍后重试';
    }
  },
  
  /**
   * 获取网络错误的具体类型
   * @param {Error} error - 错误对象
   * @returns {string} - 具体的网络错误类型
   */
  getNetworkErrorDetail(error) {
    const message = (error.message || '').toLowerCase();
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'NET_TIMEOUT';
    } else if (message.includes('disconnected') || message.includes('offline')) {
      return 'NET_DISCONNECTED';
    } else if (message.includes('server') || message.includes('500')) {
      return 'SERVER_ERROR';
    } else if (message.includes('gateway') || message.includes('502')) {
      return 'GATEWAY_ERROR';
    }
    
    // 兜底网络错误类型
    return 'NETWORK_ERROR';
  },
  
  /**
   * 处理网络相关错误
   * @param {Error} error - 网络错误对象
   * @returns {Object} - 处理后的错误信息
   */
  handleNetworkError(error) {
    const networkErrorType = this.getNetworkErrorDetail(error);
    const errorInfo = ERROR_CODE_MAP[networkErrorType] || ERROR_CODE_MAP['NETWORK_ERROR'];
    
    return {
      success: false,
      resultStatus: '6002', // 通用网络错误码
      errorType: networkErrorType,
      message: errorInfo.message,
      userFriendlyMessage: `网络连接问题: ${errorInfo.message}，请检查网络后重试`
    };
  },
  
  // 状态码常量导出
  STATUS_CODES,
  
  // 导出详细错误码映射
  ERROR_CODE_MAP
};

// 导出模块
export default AlipayPayment;

// 为了向后兼容也导出AlipayModule
export const ReactNativeAlipayPayment = AlipayPayment;

// 导出常量
export const AlipayConstants = STATUS_CODES;

// 导出错误码映射
export const AlipayErrorCodes = ERROR_CODE_MAP;
