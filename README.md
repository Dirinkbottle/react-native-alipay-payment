# React Native 支付宝支付模块

一个简单易用的React Native支付宝支付集成模块。

## 安装

```bash
npm install --save react-native-alipay-payment
# 或
yarn add react-native-alipay-payment
```

### 自动链接 (React Native 0.60+)
React Native 0.60+版本会自动链接模块。

### 手动链接 (React Native < 0.60)
```bash
react-native link react-native-alipay-payment
```

## Android配置

1. 在`android/app/build.gradle`添加支付宝SDK依赖:

```gradle
dependencies {
   api 'com.alipay.sdk:alipaysdk-android:+@aar'
    // 其他依赖...
}
```

2. 在AndroidManifest.xml中添加权限:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

## iOS配置

// TODO: 添加iOS配置说明

## 使用方法

```javascript
import AlipayPayment from 'react-native-alipay-payment';

// 设置沙箱环境（开发测试时使用）
await AlipayPayment.setSandboxMode(true);

// 发起支付
try {
  // orderInfo是从服务端获取的支付宝订单字符串
  const result = await AlipayPayment.pay(orderInfo);
  
  // 检查支付结果
  if (AlipayPayment.isPaymentSuccess(result.resultStatus)) {
    console.log('支付成功');
  } else {
    console.log('支付失败:', AlipayPayment.getPaymentMessage(result.resultStatus));
  }
} catch (error) {
  console.error('支付过程出错:', error);
}
```

## API参考

### setSandboxMode(enabled: boolean): Promise<boolean>
设置是否使用支付宝沙箱环境。

### resetPaymentState(): Promise<boolean>
重置支付状态，解决可能的支付状态问题。

### pay(orderInfo: string): Promise<AlipayResult>
发起支付宝支付。

### isPaymentSuccess(resultStatus: string): boolean
判断支付是否成功。

### isPaymentCancelled(resultStatus: string): boolean
判断用户是否取消支付。

### getPaymentMessage(resultStatus: string): string
获取支付结果的友好提示信息。

## 示例

查看[示例项目](./example)了解完整用法。

## 许可证

MIT