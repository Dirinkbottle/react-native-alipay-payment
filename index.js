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
    if (!orderInfo || typeof orderInfo !== 'string') {
      throw new Error('支付参数不能为空且必须是字符串');
    }
    return await AlipayModule.pay(orderInfo);
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
    switch (resultStatus) {
      case STATUS_CODES.SUCCESS:
        return '支付成功';
      case STATUS_CODES.PROCESSING:
        return '支付结果确认中';
      case STATUS_CODES.FAILED:
        return '支付失败';
      case STATUS_CODES.CANCEL:
        return '用户取消支付';
      case STATUS_CODES.NETWORK_ERROR:
        return '网络连接错误';
      case STATUS_CODES.UNKNOWN:
      default:
        return '未知错误';
    }
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
      return this.formatPayResult(payResult);
    } catch (error) {
      return {
        success: false,
        processing: false,
        cancelled: false,
        pending: false,
        resultStatus: STATUS_CODES.FAILED,
        message: error.message || '支付失败',
        result: '',
        memo: error.message || '支付过程出错',
        rawResult: null,
        error
      };
    }
  },
  
  // 状态码常量导出
  STATUS_CODES
};

// 导出模块
export default AlipayPayment;

// 为了向后兼容也导出AlipayModule
export const ReactNativeAlipayPayment = AlipayPayment;

// 导出常量
export const AlipayConstants = STATUS_CODES;
