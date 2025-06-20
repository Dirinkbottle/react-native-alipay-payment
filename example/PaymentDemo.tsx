// example/src/PaymentDemo.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import AlipayPayment from 'react-native-alipay-payment';

export default function PaymentDemo() {
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('9999');
  const [quantity, setQuantity] = useState('1');
  const [charge, setCharge] = useState('');
  const [reqType, setReqType] = useState<'0' | '1'>('0');
  const [orderInfo, setOrderInfo] = useState('');
  
  // 直接使用orderInfo参数支付
  const handleDirectPayment = async () => {
    if (!orderInfo.trim()) {
      Alert.alert('错误', '请输入支付宝订单参数');
      return;
    }
    
    try {
      setLoading(true);
      
      // 重置支付状态
      await AlipayPayment.resetPaymentState();
      
      // 发起支付
      const result = await AlipayPayment.pay(orderInfo);
      
      // 处理支付结果
      if (AlipayPayment.isPaymentSuccess(result.resultStatus)) {
        Alert.alert('成功', '支付成功');
      } else if (AlipayPayment.isPaymentCancelled(result.resultStatus)) {
        Alert.alert('提示', '用户取消支付');
      } else {
        Alert.alert('提示', AlipayPayment.getPaymentMessage(result.resultStatus));
      }
    } catch (error) {
      Alert.alert('错误', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 模拟服务器创建订单并支付
  const mockServerCreateOrderAndPay = async () => {
    try {
      setLoading(true);
      
      // 设置沙箱环境(开发时使用)
      await AlipayPayment.setSandboxMode(true);
      
      // 这里应该调用您的服务器API创建订单
      // 在示例中我们模拟这个过程
      
      // 获取订单参数示例 - 实际上这应该从您的服务器获取
      const mockOrderInfo = 'app_id=2021000119653292&biz_content=%7B%22subject%22%3A%22%E5%95%86%E5%93%81%E8%B4%AD%E4%B9%B0%22%2C%22out_trade_no%22%3A%22ORDER_20230901123456%22%2C%22total_amount%22%3A%220.01%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%7D&charset=utf-8&format=json&method=alipay.trade.app.pay&notify_url=https%3A%2F%2Fapi.example.com%2Fpayment%2Falipay%2Fnotify&sign=SIGN_STRING&sign_type=RSA2&timestamp=2023-09-01+12%3A34%3A56&version=1.0';
      
      // 发起支付
      const result = await AlipayPayment.pay(mockOrderInfo);
      
      // 处理支付结果
      if (AlipayPayment.isPaymentSuccess(result.resultStatus)) {
        Alert.alert('成功', '支付成功');
      } else {
        Alert.alert('提示', AlipayPayment.getPaymentMessage(result.resultStatus));
      }
    } catch (error) {
      Alert.alert('错误', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>支付宝支付示例</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>方式1: 使用订单字符串</Text>
        <TextInput
          style={styles.input}
          placeholder="输入支付宝订单参数(orderInfo)"
          value={orderInfo}
          onChangeText={setOrderInfo}
          multiline
        />
        <Button
          title={loading ? '处理中...' : '直接发起支付'}
          onPress={handleDirectPayment}
          disabled={loading}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>方式2: 模拟完整支付流程</Text>
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
            style={[styles.input, styles.shortInput]}
            placeholder="商品ID"
            value={productId}
            onChangeText={setProductId}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>数量:</Text>
          <TextInput
            style={[styles.input, styles.shortInput]}
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
              style={[styles.input, styles.shortInput]}
              placeholder="充值金额"
              value={charge}
              onChangeText={setCharge}
              keyboardType="decimal-pad"
            />
          </View>
        )}
        
        <Button
          title={loading ? '处理中...' : '创建订单并支付'}
          onPress={mockServerCreateOrderAndPay}
          disabled={loading}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>沙箱环境设置</Text>
        <View style={styles.row}>
          <Button
            title="开启沙箱模式"
            onPress={() => AlipayPayment.setSandboxMode(true).then(() => Alert.alert('成功', '已开启沙箱模式'))}
          />
          <Button
            title="关闭沙箱模式"
            onPress={() => AlipayPayment.setSandboxMode(false).then(() => Alert.alert('成功', '已关闭沙箱模式'))}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Button
          title="重置支付状态"
          onPress={() => AlipayPayment.resetPaymentState().then(() => Alert.alert('成功', '已重置支付状态'))}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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