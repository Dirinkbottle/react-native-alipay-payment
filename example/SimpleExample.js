import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Switch } from 'react-native';
import AlipayPayment from 'react-native-alipay-payment';

const SimpleExample = () => {
  const [orderString, setOrderString] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // 应用启动时初始化
    const initialize = async () => {
      try {
        // 检查当前沙箱状态
        const isSandbox = await AlipayPayment.isSandboxEnabled();
        setSandboxEnabled(isSandbox);
        
        // 重置支付状态
        await AlipayPayment.resetPaymentState();
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };
    
    initialize();
  }, []);

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

  // 设置调试模式
  const toggleDebugMode = async () => {
    try {
      const newDebugState = !debugMode;
      await AlipayPayment.setDebugMode(newDebugState);
      setDebugMode(newDebugState);
      Alert.alert('成功', `已${newDebugState ? '开启' : '关闭'}调试模式`);
    } catch (error) {
      Alert.alert('错误', `设置调试模式失败: ${error.message}`);
    }
  };

  // 获取调试信息
  const getDebugInfo = async () => {
    try {
      const info = await AlipayPayment.getDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      Alert.alert('错误', `获取调试信息失败: ${error.message}`);
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

  // 验证订单参数
  const validateOrder = () => {
    if (!orderString.trim()) {
      Alert.alert('提示', '请输入支付宝订单参数');
      return false;
    }
    
    const validation = AlipayPayment.validateOrderInfo(orderString);
    if (!validation.isValid) {
      Alert.alert(
        '订单参数验证失败',
        `缺少必要参数: ${validation.missingFields.join(', ')}`
      );
      return false;
    }
    
    return true;
  };

  // 发起支付
  const startPayment = async () => {
    if (!validateOrder()) {
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
        // 使用用户友好提示
        Alert.alert(
          '支付失败',
          result.userFriendlyMessage || result.message || '未知错误'
        );
      }
    } catch (error) {
      // 使用格式化的错误信息
      const formattedError = error.userFriendlyMessage || error.message;
      Alert.alert('发生错误', `支付过程出现异常: ${formattedError}`);
      setPaymentResult({
        error: error.message,
        errorType: error.errorType || 'UNKNOWN_ERROR',
        userFriendlyMessage: error.userFriendlyMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // 模拟网络错误支付
  const simulateNetworkErrorPayment = async () => {
    setLoading(true);
    try {
      // 先设置无效的订单字符串引发网络错误
      const invalidOrderString = 'invalid_order_string_to_trigger_network_error';
      const result = await AlipayPayment.payWithResult(invalidOrderString);
      setPaymentResult(result);
    } catch (error) {
      Alert.alert('网络错误', `${error.userFriendlyMessage || error.message}`);
      setPaymentResult({
        error: error.message,
        errorType: error.errorType
      });
    } finally {
      setLoading(false);
    }
  };

  // 重置支付状态
  const resetPaymentState = async () => {
    try {
      await AlipayPayment.resetPaymentState();
      setPaymentResult(null);
      Alert.alert('成功', '已手动重置支付状态（注意：支付状态现在会在支付完成后自动重置）');
    } catch (error) {
      Alert.alert('错误', `重置状态失败: ${error.message}`);
    }
  };

  // 清除调试信息
  const clearDebugInfo = () => {
    setDebugInfo(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>支付宝支付示例</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>环境设置</Text>
        <View style={styles.switchRow}>
          <Text>沙箱模式:</Text>
          <Switch
            value={sandboxEnabled}
            onValueChange={toggleSandboxMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={sandboxEnabled ? '#2196F3' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.switchRow}>
          <Text>调试模式:</Text>
          <Switch
            value={debugMode}
            onValueChange={toggleDebugMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={debugMode ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={checkAlipayInstalled}>
            <Text style={styles.buttonText}>检查支付宝安装</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.smallButton} onPress={getAlipayVersion}>
            <Text style={styles.buttonText}>获取支付宝版本</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={getDebugInfo}>
            <Text style={styles.buttonText}>获取调试信息</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.smallButton} onPress={clearDebugInfo}>
            <Text style={styles.buttonText}>清除调试信息</Text>
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
        
        <TouchableOpacity 
          style={[styles.button, styles.errorButton, loading ? styles.disabledButton : {}]} 
          onPress={simulateNetworkErrorPayment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            模拟网络错误
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={resetPaymentState}>
          <Text style={styles.buttonText}>手动重置状态（备用）</Text>
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
            <Text style={styles.resultText}>
              时间: {paymentResult.timestamp ? new Date(paymentResult.timestamp).toLocaleString() : 'N/A'}
            </Text>
            {paymentResult.error && (
              <Text style={[styles.resultText, {color: 'red'}]}>
                错误: {paymentResult.error}
              </Text>
            )}
            {paymentResult.errorType && (
              <Text style={[styles.resultText, {color: 'orange'}]}>
                错误类型: {paymentResult.errorType}
              </Text>
            )}
            {paymentResult.userFriendlyMessage && (
              <Text style={[styles.resultText, {color: 'blue'}]}>
                友好提示: {paymentResult.userFriendlyMessage}
              </Text>
            )}
          </View>
        </View>
      )}
      
      {debugInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>调试信息</Text>
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>设备: {debugInfo.model} ({debugInfo.manufacturer})</Text>
            <Text style={styles.resultText}>Android: {debugInfo.androidVersion} (API {debugInfo.androidSDKInt})</Text>
            <Text style={styles.resultText}>应用: {debugInfo.appVersionName} (code: {debugInfo.appVersionCode})</Text>
            <Text style={styles.resultText}>支付宝: {debugInfo.alipayInstalled ? '已安装' : '未安装'} {debugInfo.alipayVersion || ''}</Text>
            <Text style={styles.resultText}>沙箱模式: {debugInfo.sandboxMode ? '开启' : '关闭'}</Text>
            <Text style={styles.resultText}>支付状态: {debugInfo.paymentInProgress ? '进行中' : '空闲'}</Text>
            <Text style={styles.resultText}>上次支付: {debugInfo.lastPaymentTime > 0 ? new Date(debugInfo.lastPaymentTime).toLocaleString() : 'N/A'}</Text>
            
            {debugInfo.alipayError && (
              <Text style={[styles.resultText, {color: 'red'}]}>
                支付宝错误: {debugInfo.alipayError}
              </Text>
            )}
          </View>
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
  errorButton: {
    backgroundColor: '#e74c3c',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 10,
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