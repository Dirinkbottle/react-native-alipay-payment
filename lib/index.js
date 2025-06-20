"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const { AlipayModule } = react_native_1.NativeModules;
// 检查原生模块是否正确加载
if (!AlipayModule) {
    throw new Error('AlipayModule 原生模块未找到，请检查原生部分是否正确安装和链接');
}
// 状态码常量
const STATUS_CODES = {
    SUCCESS: '9000',
    PROCESSING: '8000',
    FAILED: '4000',
    CANCEL: '6001',
    NETWORK_ERROR: '6002',
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
    pay(orderInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!orderInfo || typeof orderInfo !== 'string') {
                throw new Error('支付参数不能为空且必须是字符串');
            }
            return yield AlipayModule.pay(orderInfo);
        });
    },
    /**
     * 设置是否使用沙箱环境(仅开发测试时使用)
     * @param {boolean} enabled - 是否启用沙箱模式
     * @returns {Promise<boolean>}
     */
    setSandboxMode(enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AlipayModule.setSandboxMode(!!enabled);
        });
    },
    /**
     * 重置支付状态(解决可能的支付状态卡住问题)
     * @returns {Promise<boolean>}
     */
    resetPaymentState() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AlipayModule.resetPaymentState();
        });
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
    payWithResult(orderInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payResult = yield this.pay(orderInfo);
                return this.formatPayResult(payResult);
            }
            catch (error) {
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
        });
    },
    // 状态码常量导出
    STATUS_CODES
};
exports.default = AlipayPayment;
