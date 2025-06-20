interface OrderParams {
    productId: string;
    quantity: number;
    charge?: number;
    reqtype: number;
}
interface PaymentResponse {
    success: boolean;
    processing?: boolean;
    cancelled?: boolean;
    message?: string;
    resultStatus?: string;
    orderSn?: string;
}
interface ServerPaymentConfig {
    apiUrl: string;
    token: string;
}
/**
 * 支付宝支付服务，处理业务层面的支付逻辑
 */
export declare class PaymentService {
    private apiUrl;
    private token;
    private useSandbox;
    /**
     * 支付服务构造函数
     * @param config - 服务器支付配置
     * @param useSandbox - 是否使用沙箱环境
     */
    constructor(config: ServerPaymentConfig, useSandbox?: boolean);
    /**
     * 初始化支付环境
     * @returns Promise<boolean>
     */
    initialize(): Promise<boolean>;
    /**
     * 使用订单字符串直接支付
     * @param orderString - 完整的支付宝订单参数字符串
     * @returns Promise<PaymentResponse> - 支付结果
     */
    payWithOrderString(orderString: string): Promise<PaymentResponse>;
    /**
     * 创建订单并支付（完整流程）
     * @param params - 订单参数
     * @returns Promise<PaymentResponse> - 支付结果
     */
    createOrderAndPay(params: OrderParams): Promise<PaymentResponse>;
    /**
     * 查询订单状态
     * @param orderSn - 订单号
     * @returns Promise<any> - 订单状态查询结果
     */
    queryOrderStatus(orderSn: string): Promise<any>;
    /**
     * 获取支付结果消息
     * @param resultStatus - 结果状态码
     * @returns string - 提示消息
     */
    private getPaymentMessage;
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
