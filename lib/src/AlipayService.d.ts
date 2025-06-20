interface OrderParams {
    productId: string;
    quantity: number;
    charge?: number;
    reqtype: number;
}
interface PaymentResponse {
    success: boolean;
    message?: string;
    resultStatus?: string;
    orderSn?: string;
}
export declare class PaymentService {
    private apiUrl;
    private token;
    constructor(apiUrl: string, token: string);
    createOrderAndPay(params: OrderParams): Promise<PaymentResponse>;
}
export {};
