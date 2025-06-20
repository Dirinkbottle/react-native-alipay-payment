// example/src/CompleteExample.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { PaymentService } from './PaymentService';

export default function CompleteExample() {
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('9999');
  const [quantity, setQuantity] = useState('1');
  const [charge, setCharge] = useState('');
  const [reqType, setReqType] = useState<'0' | '1'>('0');
  
  // 模拟登录状态和API URL
  const apiUrl = 'https://api.example.com';
  const token = 'USER_AUTH_TOKEN';
  
  // 创建支付服务实例
  const paymentService = new PaymentService(apiUrl, token);
  
  const handlePayment = async () => {
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
      const result = await paymentService.createOrderAndPay(params);
      
      if (result.success) {
        Alert.alert('支付成功', `订单号: ${result.orderSn}`);
      } else {
        Alert.alert('支付结果', result.message || '支付失败');
      }
    } catch (error) {
      Alert.alert('错误', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>完整支付流程示例</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>业务类型:</Text>
          <Button
            title="商品购买"
            onPress={() => setReqType('0')}
            color={reqType === '0' ? '#3498db' : '#bdc3c7'}
          />
          <Button
            title="钱包充值"
            onPress={() => setReqType('1')}
            color={reqType === '1' ? '#3498db' : '#bdc3c7'}
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>商品ID:</Text>
          <TextInput
            style={styles.input}
            placeholder="商品ID"
            value={productId}
            onChangeText={setProductId}
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>数量:</Text>
          <TextInput
            style={styles.input}
            placeholder="购买数量"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        
        {reqType === '1' && (
          <View style={styles.row}>
            <Text style={styles.label}>充值金额:</Text>
            <TextInput
              style={styles.input}
              placeholder="充值金额"
              value={charge}
              onChangeText={setCharge}
              keyboardType="decimal-pad"
            />
          </View>
        )}
        
        <Button
          title={loading ? '处理中...' : '发起支付'}
          onPress={handlePayment}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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