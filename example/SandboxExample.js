import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AlipayPayment from 'react-native-alipay-payment';

const SandboxExample = () => {
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // 组件加载时检查沙箱状态
  useEffect(() => {
    checkSandboxMode();
  }, []);

  // 检查当前沙箱模式状态
  const checkSandboxMode = async () => {
    setLoading(true);
    try {
      const isEnabled = await AlipayPayment.isSandboxEnabled();
      setSandboxEnabled(isEnabled);
      console.log(`当前沙箱模式状态: ${isEnabled ? '已启用' : '未启用'}`);
    } catch (error) {
      console.error('检查沙箱模式失败:', error);
      Alert.alert('检查失败', `无法获取沙箱模式状态: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 切换沙箱模式
  const toggleSandboxMode = async () => {
    setLoading(true);
    try {
      // 切换到相反状态
      const newState = !sandboxEnabled;
      await AlipayPayment.setSandboxMode(newState);
      setSandboxEnabled(newState);
      
      Alert.alert(
        '切换成功', 
        `已${newState ? '启用' : '禁用'}支付宝沙箱模式`,
        [
          {
            text: '确认',
            onPress: () => console.log(`沙箱模式已${newState ? '启用' : '禁用'}`)
          }
        ]
      );
    } catch (error) {
      console.error('切换沙箱模式失败:', error);
      Alert.alert('切换失败', `无法切换沙箱模式: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 验证当前沙箱状态
  const verifySandboxMode = async () => {
    setLoading(true);
    try {
      const isEnabled = await AlipayPayment.isSandboxEnabled();
      Alert.alert(
        '当前状态', 
        `支付宝支付当前${isEnabled ? '处于' : '不处于'}沙箱模式`,
        [
          {
            text: '确认',
            onPress: () => console.log(`检查完成: ${isEnabled ? '沙箱模式' : '正式环境'}`)
          }
        ]
      );
      
      // 更新状态，以防用户通过其他方式更改了沙箱状态
      setSandboxEnabled(isEnabled);
    } catch (error) {
      console.error('验证沙箱模式失败:', error);
      Alert.alert('验证失败', `无法验证沙箱模式状态: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>支付宝沙箱模式设置</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>当前状态:</Text>
        <Text style={[
          styles.statusValue, 
          {color: sandboxEnabled ? '#2ecc71' : '#e74c3c'}
        ]}>
          {loading ? '检查中...' : (sandboxEnabled ? '已启用沙箱模式' : '已启用正式环境')}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={toggleSandboxMode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '处理中...' : `切换至${sandboxEnabled ? '正式环境' : '沙箱模式'}`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton, loading && styles.disabledButton]} 
          onPress={verifySandboxMode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>验证当前模式</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton, loading && styles.disabledButton]} 
          onPress={checkSandboxMode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>刷新状态</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.noteContainer}>
        <Text style={styles.noteTitle}>使用说明：</Text>
        <Text style={styles.noteText}>沙箱模式仅用于开发测试，正式环境用于生产使用。</Text>
        <Text style={styles.noteText}>在沙箱模式下，支付宝交易将使用测试账号和测试资金。</Text>
        <Text style={styles.noteText}>请确保在上线前切换至正式环境。</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#7f8c8d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  noteContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  noteTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#2c3e50',
  },
  noteText: {
    color: '#7f8c8d',
    marginBottom: 5,
  },
});

export default SandboxExample; 