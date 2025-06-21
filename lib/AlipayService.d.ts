export type PaymentCallback = (result: PaymentResponse) => void;
interface PaymentResponse {
    success: boolean;
    processing?: boolean;
    cancelled?: boolean;
    message?: string;
    resultStatus?: string;
    orderSn?: string;
    result?: string;
    memo?: string;
    rawResult?: any;
}
/**
 * 支付宝支付服务，处理业务层面的支付逻辑
 */
export declare class PaymentService {
    private useSandbox;
    private eventListener;
    private paymentCallbacks;
    /**
     * 支付服务构造函数
     * @param config - 服务器支付配置
     * @param useSandbox - 是否使用沙箱环境
     */
    constructor(useSandbox?: boolean);
    /**
     * 设置支付宝支付结果事件监听
     */
    private setupEventListener;
    /**
     * 移除事件监听器
     */
    removeEventListener(): void;
    /**
     * 添加支付结果回调
     * @param callback - 支付结果回调函数
     */
    addPaymentCallback(callback: PaymentCallback): void;
    /**
     * 移除支付结果回调
     * @param callback - 要移除的回调函数
     */
    removePaymentCallback(callback: PaymentCallback): void;
    /**
     * 通知所有注册的回调
     * @param result - 支付结果
     */
    private notifyCallbacks;
    /**
     * 格式化支付结果
     * @param result - 原始支付结果
     * @returns 格式化后的支付结果
     */
    private formatPaymentResult;
    /**
     * 初始化支付环境
     * @returns Promise<boolean>
     */
    initialize(): Promise<boolean>;
    /**
     * 使用订单字符串直接支付
     * @param orderString - 完整的支付宝订单参数字符串
     * @param callback - 可选的回调函数，用于接收事件方式的结果通知
     * @returns Promise<PaymentResponse> - 支付结果
     */
    payWithOrderString(orderString: string, callback?: PaymentCallback): Promise<PaymentResponse>;
    /**
     * 获取支付结果消息
     * @param resultStatus - 结果状态码
     * @returns string - 提示消息
     */
    private getPaymentMessage;
    /**
     * 清理资源
     * 在组件卸载时调用此方法
     */
    cleanup(): void;
}
export declare const AlipayConstants: {
    SUCCESS: string;
    PROCESSING: string;
    FAILED: string;
    CANCEL: string;
    NETWORK_ERROR: string;
    UNKNOWN: string;
};
export default PaymentService;
