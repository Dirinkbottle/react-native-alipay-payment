export default AlipayPayment;
declare namespace AlipayPayment {
    /**
     * 发起支付宝支付
     * @param {string} orderInfo - 支付宝订单信息字符串
     * @returns {Promise<Object>} - 支付结果
     */
    export function pay(orderInfo: string): Promise<Object>;
    /**
     * 设置是否使用沙箱环境(仅开发测试时使用)
     * @param {boolean} enabled - 是否启用沙箱模式
     * @returns {Promise<boolean>}
     */
    export function setSandboxMode(enabled: boolean): Promise<boolean>;
    /**
     * 重置支付状态(解决可能的支付状态卡住问题)
     * @returns {Promise<boolean>}
     */
    export function resetPaymentState(): Promise<boolean>;
    /**
     * 检查支付结果是否成功
     * @param {string} resultStatus - 支付结果状态码
     * @returns {boolean} - 是否支付成功
     */
    export function isPaymentSuccess(resultStatus: string): boolean;
    /**
     * 检查支付是否处理中
     * @param {string} resultStatus - 支付结果状态码
     * @returns {boolean} - 是否处理中
     */
    export function isPaymentProcessing(resultStatus: string): boolean;
    /**
     * 检查支付是否被取消
     * @param {string} resultStatus - 支付结果状态码
     * @returns {boolean} - 是否被取消
     */
    export function isPaymentCancelled(resultStatus: string): boolean;
    /**
     * 获取支付结果对应的文字消息
     * @param {string} resultStatus - 支付结果状态码
     * @returns {string} - 对应的文字消息
     */
    export function getPaymentMessage(resultStatus: string): string;
    /**
     * 格式化支付结果为易于理解的对象
     * @param {Object} payResult - 原始支付结果
     * @returns {Object} - 格式化后的结果对象
     */
    export function formatPayResult(payResult: Object): Object;
    /**
     * 简化的支付方法，直接返回格式化的结果
     * @param {string} orderInfo - 支付宝订单信息字符串
     * @returns {Promise<Object>} - 格式化的支付结果
     */
    export function payWithResult(orderInfo: string): Promise<Object>;
    export { STATUS_CODES };
}
declare namespace STATUS_CODES {
    const SUCCESS: string;
    const PROCESSING: string;
    const FAILED: string;
    const CANCEL: string;
    const NETWORK_ERROR: string;
    const UNKNOWN: string;
}
