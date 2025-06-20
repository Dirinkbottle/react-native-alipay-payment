import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import AlipayPayment from 'react-native-alipay-payment';

const SimpleExample = () => {
  const [orderString, setOrderString] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [sandboxEnabled, setSandboxEnabled] = useState(true);

  // 设置沙箱模式
  const toggleSandboxMode = async () => {
    try {
      const newSandboxState = !sandboxEnabled;
      await AlipayPayment.setSandboxMode(newSandboxState);
      setSandboxEnabled(newSandboxState);
      Alert.alert('成功', `已${newSandboxState ? '开启' : '关闭'}沙箱模式`);
    } catch (error) {
      Alert.alert('错误', `设置沙箱模式失败: ${error.message}`);
    }
  };

  // 检查支付宝是否安装
  const checkAlipayInstalled = async () => {
    try {
      const isInstalled = await AlipayPayment.isAlipayInstalled();
      Alert.alert('检测结果', isInstalled ? '支付宝已安装' : '支付宝未安装');
    } catch (error) {
      Alert.alert('错误', `检测失败: ${error.message}`);
    }
  };

  // 获取支付宝版本
  const getAlipayVersion = async () => {
    try {
      const version = await AlipayPayment.getAlipayVersion();
      Alert.alert('支付宝版本', version || '无法获取版本');
    } catch (error) {
      Alert.alert('错误', `获取版本失败: ${error.message}`);
    }
  };

  // 发起支付
  const startPayment = async () => {
    if (!orderString.trim()) {
      Alert.alert('提示', '请输入支付宝订单参数');
      return;
    }

    setLoading(true);
    try {
      // 使用payWithResult方法获取格式化结果
      const result = await AlipayPayment.payWithResult(orderString);
      setPaymentResult(result);
      
      // 根据支付结果显示不同的提示
      if (result.success) {
        Alert.alert('支付成功', '订单支付成功');
      } else if (result.cancelled) {
        Alert.alert('支付取消', '用户取消了支付');
      } else if (result.processing) {
        Alert.alert('处理中', '支付结果确认中，请稍后查询订单状态');
      } else {
        Alert.alert('支付失败', result.message || '未知错误');
      }
    } catch (error) {
      Alert.alert('发生错误', `支付过程出现异常: ${error.message}`);
      setPaymentResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 重置支付状态
  const resetPaymentState = async () => {
    try {
      await AlipayPayment.resetPaymentState();
      setPaymentResult(null);
      Alert.alert('成功', '已重置支付状态');
    } catch (error) {
      Alert.alert('错误', `重置状态失败: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>支付宝支付示例</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>环境设置</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: sandboxEnabled ? '#2ecc71' : '#e74c3c' }]} 
          onPress={toggleSandboxMode}
        >
          <Text style={styles.buttonText}>
            {sandboxEnabled ? '已开启沙箱模式 (点击关闭)' : '已关闭沙箱模式 (点击开启)'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={checkAlipayInstalled}>
            <Text style={styles.buttonText}>检查支付宝安装</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.smallButton} onPress={getAlipayVersion}>
            <Text style={styles.buttonText}>获取支付宝版本</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>支付测试</Text>
        <TextInput
          style={styles.input}
          placeholder="输入支付宝订单参数 (由服务端生成)"
          value={orderString}
          onChangeText={setOrderString}
          multiline
        />
        
        <TouchableOpacity 
          style={[styles.button, loading ? styles.disabledButton : {}]} 
          onPress={startPayment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '处理中...' : '发起支付'}
          </Text>
        </TouchableOpacity>
      </View>

      {paymentResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>支付结果</Text>
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              状态: {paymentResult.success ? '成功' : 
                    paymentResult.processing ? '处理中' :
                    paymentResult.cancelled ? '已取消' : '失败'}
            </Text>
            <Text style={styles.resultText}>
              结果码: {paymentResult.resultStatus || 'N/A'}
            </Text>
            <Text style={styles.resultText}>
              消息: {paymentResult.message || 'N/A'}
            </Text>
            {paymentResult.error && (
              <Text style={[styles.resultText, {color: 'red'}]}>
                错误: {paymentResult.error}
              </Text>
            )}
          </View>
          
          <TouchableOpacity style={styles.button} onPress={resetPaymentState}>
            <Text style={styles.buttonText}>重置支付状态</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 5,
  },
  smallButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  resultContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default SimpleExample; 