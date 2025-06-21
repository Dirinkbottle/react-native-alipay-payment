##注意
包含1.1.2及其以下的版本已经不能正常运行，请使用1.1.3及其以上的版本，本模块长期更新维护，欢迎使用


# React Native Alipay 支付模块

适用于React Native项目的支付宝支付集成模块，支持Android平台。

## 特性

- ✅ 支付宝App支付功能（沙箱/正式环境）
- ✅ 完整的支付结果处理和状态管理
- ✅ 多种回调方式支持（Promise和事件）
- ✅ TypeScript类型支持
- ✅ 错误处理与格式化

## 安装

```bash
npm install react-native-alipay-payment --save
```

## 权限设置

模块已经在 AndroidManifest.xml 中包含了基本权限，并内置了运行时权限请求功能。使用方法：

```javascript
import AlipayPayment from 'react-native-alipay-payment';

// 请求支付宝所需的敏感权限（Android 6.0+需要）
AlipayPayment.requestPermissions()
  .then(result => {
    // result: {READ_PHONE_STATE: 'granted|denied', WRITE_EXTERNAL_STORAGE: 'granted|denied'}
    console.log('权限请求结果:', result);
    
    // 检查所有权限是否都已授予
    const allGranted = Object.values(result).every(status => status === 'granted');
    if (allGranted) {
      console.log('所有权限已授予，可以进行支付');
    } else {
      console.log('部分权限被拒绝，支付可能受影响');
    }
  })
  .catch(error => console.error('权限请求异常:', error));
```

如果遇到AndroidManifest合并冲突，在应用的AndroidManifest.xml中添加:

```xml
<!-- 解决支付宝SDK合并冲突 -->
<activity
    android:name="com.alipay.sdk.app.H5PayActivity"
    tools:replace="android:configChanges">
</activity>
<activity
    android:name="com.alipay.sdk.app.H5AuthActivity"
    tools:replace="android:configChanges">
</activity>
```

## 基本用法

### 快速支付

```javascript
import AlipayPayment from 'react-native-alipay-payment';

// 服务端生成的订单字符串
const orderInfo = 'app_id=2021000000000000&biz_content=...';

// 发起支付
AlipayPayment.payWithResult(orderInfo)
  .then(result => {
    if (result.success) {
      console.log('支付成功!');
    } else if (result.cancelled) {
      console.log('用户取消支付');
    } else {
      console.log('支付失败:', result.message);
    }
  })
  .catch(error => console.error('支付异常:', error));
```

### 环境配置

```javascript
// 开启沙箱模式(开发测试用)
await AlipayPayment.setSandboxMode(true);

// 检查支付宝是否安装
const installed = await AlipayPayment.isAlipayInstalled();
if (!installed) {
  // 提示用户安装支付宝
}
```

### 使用PaymentService类

```typescript
import { PaymentService } from 'react-native-alipay-payment/lib/src/AlipayService';

// 初始化支付服务
const paymentService = new PaymentService(true); // true表示使用沙箱环境

// 初始化并支付
const payOrder = async () => {
  try {
    // 初始化环境
    await paymentService.initialize();
    
    // 使用订单字符串支付（订单字符串需从服务器获取）
    const orderString = '...'; // 完整的支付宝订单参数字符串
    const result = await paymentService.payWithOrderString(orderString);
    
    console.log('支付结果:', result.success ? '成功' : '失败');
  } catch (error) {
    console.error('支付异常:', error);
  }
};

// 使用事件监听方式接收支付结果
paymentService.addPaymentCallback(result => {
  console.log('支付结果事件:', result);
});
```

## API参考

### 核心API

| 方法 | 描述 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `pay(orderInfo)` | 原始支付方法 | `orderInfo: string` | `Promise<AlipayPayResult>` |
| `payWithResult(orderInfo)` | 格式化结果的支付方法 | `orderInfo: string` | `Promise<AlipayFormattedResult>` |
| `setSandboxMode(enabled)` | 设置沙箱模式 | `enabled: boolean` | `Promise<boolean>` |
| `isSandboxEnabled()` | 获取沙箱模式状态 | - | `Promise<boolean>` |
| `resetPaymentState()` | 重置支付状态 | - | `Promise<boolean>` |
| `isAlipayInstalled()` | 检查支付宝是否安装 | - | `Promise<boolean>` |
| `getAlipayVersion()` | 获取支付宝SDK版本 | - | `Promise<string>` |


### 工具方法

| 方法 | 描述 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `isPaymentSuccess(resultStatus)` | 检查支付是否成功 | `resultStatus: string` | `boolean` |
| `isPaymentProcessing(resultStatus)` | 检查支付是否处理中 | `resultStatus: string` | `boolean` |
| `isPaymentCancelled(resultStatus)` | 检查支付是否取消 | `resultStatus: string` | `boolean` |
| `getPaymentMessage(resultStatus)` | 获取支付结果消息 | `resultStatus: string` | `string` |
| `formatPayResult(payResult)` | 格式化支付结果 | `payResult: Object` | `Object` |
| `validateOrderInfo(orderInfo)` | 验证订单信息 | `orderInfo: string` | `{isValid: boolean, missingFields: string[]}` |

### PaymentService API

| 方法 | 描述 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `constructor(useSandbox)` | 构造函数 | `useSandbox: boolean = false` | - |
| `initialize()` | 初始化支付环境 | - | `Promise<boolean>` |
| `payWithOrderString(orderString, callback?)` | 使用订单字符串支付 | `orderString: string, callback?: Function` | `Promise<PaymentResponse>` |
| `addPaymentCallback(callback)` | 添加支付回调 | `callback: Function` | `void` |
| `removePaymentCallback(callback)` | 移除支付回调 | `callback: Function` | `void` |
| `removeEventListener()` | 移除事件监听器 | - | `void` |
| `cleanup()` | 清理资源 | - | `void` |

### 调试API

| 方法 | 描述 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `setDebugMode(enabled)` | 设置调试模式 | `enabled: boolean` | `Promise<boolean>` |
| `getDebugInfo()` | 获取调试信息 | - | `Promise<AlipayDebugInfo>` |
| `logDebugInfo(level, message)` | 记录调试日志 | `level: string, message: string` | `Promise<boolean>` |

## 支付状态码

- `9000`: 支付成功
- `8000`: 处理中
- `4000`: 支付失败
- `6001`: 用户取消
- `6002`: 网络错误
- `6004`: 未知错误

## 故障排除

1. **无法唤起支付宝**：确认支付宝已安装，检查订单参数格式
2. **支付结果回调问题**：使用PaymentService的事件监听
3. **状态异常**：调用`resetPaymentState()`重置状态
4. **清单合并冲突**：在AndroidManifest.xml中添加tools:replace配置

## 版本记录

- 1.1.4:
  - 移除了PaymentService中的服务端交互功能
  - 简化了PaymentService构造函数
  - 增强了事件监听机制，支持事件回调方式获取支付结果
  - 修复ActivityEventListener处理问题
  - 提高支付结果回调可靠性
  - 添加内置权限请求功能

- 1.1.3:
  - 添加了resetPaymentStateInternal()方法统一重置状态
  - 在所有回调路径中确保状态重置
  - 增加日志记录便于调试

- 1.1.2:
  - 修复consummap重复使用问题
  - 修复回调闪退问题

- 1.1.1:
  - 新增isSandboxEnabled API
  - 更新示例代码

## 注意事项

- 正式环境必须使用真实商户信息和签名
- 支付参数应由服务器生成，确保安全性
- 支付结果应与服务器进行二次确认

## 许可证

MIT