"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.default = PaymentDemo;
// example/src/PaymentDemo.tsx
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_alipay_payment_1 = __importDefault(require("react-native-alipay-payment"));
function PaymentDemo() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [productId, setProductId] = (0, react_1.useState)('9999');
    const [quantity, setQuantity] = (0, react_1.useState)('1');
    const [charge, setCharge] = (0, react_1.useState)('');
    const [reqType, setReqType] = (0, react_1.useState)('0');
    const [orderInfo, setOrderInfo] = (0, react_1.useState)('');
    // 直接使用orderInfo参数支付
    const handleDirectPayment = () => __awaiter(this, void 0, void 0, function* () {
        if (!orderInfo.trim()) {
            react_native_1.Alert.alert('错误', '请输入支付宝订单参数');
            return;
        }
        try {
            setLoading(true);
            // 重置支付状态
            yield react_native_alipay_payment_1.default.resetPaymentState();
            // 发起支付
            const result = yield react_native_alipay_payment_1.default.pay(orderInfo);
            // 处理支付结果
            if (react_native_alipay_payment_1.default.isPaymentSuccess(result.resultStatus)) {
                react_native_1.Alert.alert('成功', '支付成功');
            }
            else if (react_native_alipay_payment_1.default.isPaymentCancelled(result.resultStatus)) {
                react_native_1.Alert.alert('提示', '用户取消支付');
            }
            else {
                react_native_1.Alert.alert('提示', react_native_alipay_payment_1.default.getPaymentMessage(result.resultStatus));
            }
        }
        catch (error) {
            react_native_1.Alert.alert('错误', error.message);
        }
        finally {
            setLoading(false);
        }
    });
    // 模拟服务器创建订单并支付
    const mockServerCreateOrderAndPay = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            // 设置沙箱环境(开发时使用)
            yield react_native_alipay_payment_1.default.setSandboxMode(true);
            // 这里应该调用您的服务器API创建订单
            // 在示例中我们模拟这个过程
            // 获取订单参数示例 - 实际上这应该从您的服务器获取
            const mockOrderInfo = 'app_id=2021000119653292&biz_content=%7B%22subject%22%3A%22%E5%95%86%E5%93%81%E8%B4%AD%E4%B9%B0%22%2C%22out_trade_no%22%3A%22ORDER_20230901123456%22%2C%22total_amount%22%3A%220.01%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%7D&charset=utf-8&format=json&method=alipay.trade.app.pay&notify_url=https%3A%2F%2Fapi.example.com%2Fpayment%2Falipay%2Fnotify&sign=SIGN_STRING&sign_type=RSA2&timestamp=2023-09-01+12%3A34%3A56&version=1.0';
            // 发起支付
            const result = yield react_native_alipay_payment_1.default.pay(mockOrderInfo);
            // 处理支付结果
            if (react_native_alipay_payment_1.default.isPaymentSuccess(result.resultStatus)) {
                react_native_1.Alert.alert('成功', '支付成功');
            }
            else {
                react_native_1.Alert.alert('提示', react_native_alipay_payment_1.default.getPaymentMessage(result.resultStatus));
            }
        }
        catch (error) {
            react_native_1.Alert.alert('错误', error.message);
        }
        finally {
            setLoading(false);
        }
    });
    return (<react_native_1.ScrollView contentContainerStyle={styles.container}>
      <react_native_1.Text style={styles.title}>支付宝支付示例</react_native_1.Text>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>方式1: 使用订单字符串</react_native_1.Text>
        <react_native_1.TextInput style={styles.input} placeholder="输入支付宝订单参数(orderInfo)" value={orderInfo} onChangeText={setOrderInfo} multiline/>
        <react_native_1.Button title={loading ? '处理中...' : '直接发起支付'} onPress={handleDirectPayment} disabled={loading}/>
      </react_native_1.View>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>方式2: 模拟完整支付流程</react_native_1.Text>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>业务类型:</react_native_1.Text>
          <react_native_1.Button title="商品购买" onPress={() => setReqType('0')} color={reqType === '0' ? '#3498db' : '#bdc3c7'}/>
          <react_native_1.Button title="钱包充值" onPress={() => setReqType('1')} color={reqType === '1' ? '#3498db' : '#bdc3c7'}/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>商品ID:</react_native_1.Text>
          <react_native_1.TextInput style={[styles.input, styles.shortInput]} placeholder="商品ID" value={productId} onChangeText={setProductId} keyboardType="numeric"/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>数量:</react_native_1.Text>
          <react_native_1.TextInput style={[styles.input, styles.shortInput]} placeholder="购买数量" value={quantity} onChangeText={setQuantity} keyboardType="numeric"/>
        </react_native_1.View>
        
        {reqType === '1' && (<react_native_1.View style={styles.row}>
            <react_native_1.Text style={styles.label}>充值金额:</react_native_1.Text>
            <react_native_1.TextInput style={[styles.input, styles.shortInput]} placeholder="充值金额" value={charge} onChangeText={setCharge} keyboardType="decimal-pad"/>
          </react_native_1.View>)}
        
        <react_native_1.Button title={loading ? '处理中...' : '创建订单并支付'} onPress={mockServerCreateOrderAndPay} disabled={loading}/>
      </react_native_1.View>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>沙箱环境设置</react_native_1.Text>
        <react_native_1.View style={styles.row}>
          <react_native_1.Button title="开启沙箱模式" onPress={() => react_native_alipay_payment_1.default.setSandboxMode(true).then(() => react_native_1.Alert.alert('成功', '已开启沙箱模式'))}/>
          <react_native_1.Button title="关闭沙箱模式" onPress={() => react_native_alipay_payment_1.default.setSandboxMode(false).then(() => react_native_1.Alert.alert('成功', '已关闭沙箱模式'))}/>
        </react_native_1.View>
      </react_native_1.View>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.Button title="重置支付状态" onPress={() => react_native_alipay_payment_1.default.resetPaymentState().then(() => react_native_1.Alert.alert('成功', '已重置支付状态'))}/>
      </react_native_1.View>
    </react_native_1.ScrollView>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 25,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    shortInput: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    label: {
        width: 80,
    },
});
