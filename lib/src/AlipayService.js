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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
// example/src/PaymentService.ts
const axios_1 = __importDefault(require("axios"));
const react_native_1 = require("react-native");
// 直接使用NativeModules
const { AlipayPayment } = react_native_1.NativeModules;
class PaymentService {
    constructor(apiUrl, token) {
        this.apiUrl = apiUrl;
        this.token = token;
    }
    // 创建订单并支付
    createOrderAndPay(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. 确保沙箱环境已设置(开发环境)
                yield AlipayPayment.setSandboxMode(true);
                // 2. 重置支付状态
                yield AlipayPayment.resetPaymentState();
                // 3. 从服务器获取支付宝订单信息
                const headers = {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                };
                const response = yield axios_1.default.post(`${this.apiUrl}/api/payment/alipay`, {
                    reqtype: params.reqtype,
                    productId: params.productId,
                    sumbuy: params.quantity,
                    charge: params.charge
                }, { headers });
                if (!response.data || !response.data.success) {
                    throw new Error(((_a = response.data) === null || _a === void 0 ? void 0 : _a.message) || '获取支付信息失败');
                }
                // 4. 从服务器响应中提取orderStr
                const orderStr = response.data.result;
                const orderSn = response.data.orderSn;
                if (!orderStr) {
                    throw new Error('支付参数(orderStr)为空');
                }
                // 5. 调用支付宝SDK进行支付
                const result = yield AlipayPayment.pay(orderStr);
                // 6. 处理支付结果
                const success = AlipayPayment.isPaymentSuccess(result.resultStatus);
                const message = AlipayPayment.getPaymentMessage(result.resultStatus);
                return {
                    success,
                    message,
                    resultStatus: result.resultStatus,
                    orderSn
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: error instanceof Error ? error.message : '支付过程出错'
                };
            }
        });
    }
}
exports.PaymentService = PaymentService;
