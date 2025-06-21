"use strict";
// src/AlipayService.ts
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
exports.AlipayConstants = exports.PaymentService = void 0;
// 使用NativeModules和DeviceEventEmitter
const react_native_1 = require("react-native");
// 直接使用NativeModules
const AlipayModule = react_native_1.NativeModules.AlipayModule;
/**
 * 支付宝支付服务，处理业务层面的支付逻辑
 */
class PaymentService {
    /**
     * 支付服务构造函数
     * @param config - 服务器支付配置
     * @param useSandbox - 是否使用沙箱环境
     */
    constructor(useSandbox = false) {
        this.eventListener = null;
        this.paymentCallbacks = [];
        this.useSandbox = useSandbox;
        // 设置事件监听
        this.setupEventListener();
    }
    /**
     * 设置支付宝支付结果事件监听
     */
    setupEventListener() {
        // 先移除之前可能存在的监听器
        this.removeEventListener();
        // 添加新的事件监听器
        this.eventListener = react_native_1.DeviceEventEmitter.addListener('AlipayPaymentResult', (result) => {
            console.log('收到支付宝支付结果事件:', result);
            // 转换为标准PaymentResponse格式
            const paymentResponse = this.formatPaymentResult(result);
            // 通知所有注册的回调
            this.notifyCallbacks(paymentResponse);
        });
    }
    /**
     * 移除事件监听器
     */
    removeEventListener() {
        if (this.eventListener) {
            this.eventListener.remove();
            this.eventListener = null;
        }
    }
    /**
     * 添加支付结果回调
     * @param callback - 支付结果回调函数
     */
    addPaymentCallback(callback) {
        this.paymentCallbacks.push(callback);
    }
    /**
     * 移除支付结果回调
     * @param callback - 要移除的回调函数
     */
    removePaymentCallback(callback) {
        const index = this.paymentCallbacks.indexOf(callback);
        if (index !== -1) {
            this.paymentCallbacks.splice(index, 1);
        }
    }
    /**
     * 通知所有注册的回调
     * @param result - 支付结果
     */
    notifyCallbacks(result) {
        this.paymentCallbacks.forEach(callback => {
            try {
                callback(result);
            }
            catch (error) {
                console.error("支付回调执行异常:", error);
            }
        });
    }
    /**
     * 格式化支付结果
     * @param result - 原始支付结果
     * @returns 格式化后的支付结果
     */
    formatPaymentResult(result) {
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
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 设置沙箱环境
                yield AlipayModule.setSandboxMode(this.useSandbox);
                // 重置支付状态
                yield AlipayModule.resetPaymentState();
                // 检查支付宝是否已安装
                const isInstalled = yield AlipayModule.isAlipayInstalled();
                return isInstalled;
            }
            catch (error) {
                console.error("支付宝初始化异常:", error);
                return false;
            }
        });
    }
    /**
     * 使用订单字符串直接支付
     * @param orderString - 完整的支付宝订单参数字符串
     * @param callback - 可选的回调函数，用于接收事件方式的结果通知
     * @returns Promise<PaymentResponse> - 支付结果
     */
    payWithOrderString(orderString, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 如果提供了回调函数，添加到回调列表
                if (callback) {
                    this.addPaymentCallback(callback);
                }
                // 直接调用支付宝支付
                const result = yield AlipayModule.pay(orderString);
                // 格式化结果
                return this.formatPaymentResult(result);
            }
            catch (error) {
                const errorResponse = {
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) || '支付过程出错'
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
        });
    }
    /**
     * 获取支付结果消息
     * @param resultStatus - 结果状态码
     * @returns string - 提示消息
     */
    getPaymentMessage(resultStatus) {
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
    cleanup() {
        this.removeEventListener();
        this.paymentCallbacks = [];
    }
}
exports.PaymentService = PaymentService;
// 导出支付宝常量
exports.AlipayConstants = {
    SUCCESS: '9000',
    PROCESSING: '8000',
    FAILED: '4000',
    CANCEL: '6001',
    NETWORK_ERROR: '6002',
    UNKNOWN: '6004'
};
exports.default = PaymentService;
