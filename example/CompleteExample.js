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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompleteExample;
// example/src/CompleteExample.tsx
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const PaymentService_1 = require("./PaymentService");
function CompleteExample() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [productId, setProductId] = (0, react_1.useState)('9999');
    const [quantity, setQuantity] = (0, react_1.useState)('1');
    const [charge, setCharge] = (0, react_1.useState)('');
    const [reqType, setReqType] = (0, react_1.useState)('0');
    // 模拟登录状态和API URL
    const apiUrl = 'https://api.example.com';
    const token = 'USER_AUTH_TOKEN';
    // 创建支付服务实例
    const paymentService = new PaymentService_1.PaymentService(apiUrl, token);
    const handlePayment = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            const params = {
                productId,
                quantity: parseInt(quantity),
                reqtype: parseInt(reqType),
            };
            // 如果是钱包充值，添加充值金额
            if (reqType === '1' && charge) {
                params.charge = parseFloat(charge);
            }
            // 发起支付
            const result = yield paymentService.createOrderAndPay(params);
            if (result.success) {
                react_native_1.Alert.alert('支付成功', `订单号: ${result.orderSn}`);
            }
            else {
                react_native_1.Alert.alert('支付结果', result.message || '支付失败');
            }
        }
        catch (error) {
            react_native_1.Alert.alert('错误', error.message);
        }
        finally {
            setLoading(false);
        }
    });
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>完整支付流程示例</react_native_1.Text>
      
      <react_native_1.View style={styles.section}>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>业务类型:</react_native_1.Text>
          <react_native_1.Button title="商品购买" onPress={() => setReqType('0')} color={reqType === '0' ? '#3498db' : '#bdc3c7'}/>
          <react_native_1.Button title="钱包充值" onPress={() => setReqType('1')} color={reqType === '1' ? '#3498db' : '#bdc3c7'}/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>商品ID:</react_native_1.Text>
          <react_native_1.TextInput style={styles.input} placeholder="商品ID" value={productId} onChangeText={setProductId}/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>数量:</react_native_1.Text>
          <react_native_1.TextInput style={styles.input} placeholder="购买数量" value={quantity} onChangeText={setQuantity} keyboardType="numeric"/>
        </react_native_1.View>
        
        {reqType === '1' && (<react_native_1.View style={styles.row}>
            <react_native_1.Text style={styles.label}>充值金额:</react_native_1.Text>
            <react_native_1.TextInput style={styles.input} placeholder="充值金额" value={charge} onChangeText={setCharge} keyboardType="decimal-pad"/>
          </react_native_1.View>)}
        
        <react_native_1.Button title={loading ? '处理中...' : '发起支付'} onPress={handlePayment} disabled={loading}/>
      </react_native_1.View>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        width: 80,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
    },
});
