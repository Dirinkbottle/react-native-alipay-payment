# React Native Alipay 支付模块

适用于React Native项目的支付宝支付集成模块，支持Android平台。

## 功能特性

- 支持支付宝App支付功能
- 支持沙箱和正式环境
- 提供支付结果状态判断工具方法
- 支持完整的支付流程管理
- 支持用户授权功能
- TypeScript类型支持

## 安装

```bash
npm install react-native-alipay-payment --save
```

## 项目配置

### Android

确保在项目的 `android/app/build.gradle` 文件中添加:

```gradle
dependencies {
    // ...其他依赖
    implementation project(':react-native-alipay-payment')
}
```

在 `android/settings.gradle` 中添加:

```gradle
include ':react-native-alipay-payment'
project(':react-native-alipay-payment').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-alipay-payment/android')
```

在 `MainApplication.java` 中添加:

```java
import com.inkbottle.alipayrn.AlipayPackage;

// ...

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        // ...其他包
        new AlipayPackage()
    );
}
```

### 权限配置

模块已经在 AndroidManifest.xml 中包含了支付宝所需权限。如果您的应用需要在Android 6.0+上运行，可能需要动态请求以下权限:

- `android.permission.READ_PHONE_STATE`
- `android.permission.WRITE_EXTERNAL_STORAGE`

### 可能的清单合并冲突解决

如果您在构建时遇到AndroidManifest合并冲突，您需要在应用级别的AndroidManifest.xml中添加以下代码：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="您的应用包名">
    
    <!-- ... 其他内容 ... -->
    
    <application>
        <!-- ... 其他内容 ... -->
        
        <!-- 解决支付宝SDK合并冲突 -->
        <activity
            android:name="com.alipay.sdk.app.H5PayActivity"
            tools:replace="android:configChanges">
        </activity>
        <activity
            android:name="com.alipay.sdk.app.H5AuthActivity"
            tools:replace="android:configChanges">
        </activity>
    </application>
</manifest>
```

或者尝试在app/build.gradle中添加下面的配置：

```gradle
android {
    // ...
    
    packagingOptions {
        exclude 'AndroidManifest.xml'
    }
}
```

## 基本用法

### 简单调用支付

```javascript
import AlipayPayment from 'react-native-alipay-payment';

// 支付宝订单信息字符串(通常由服务器生成)
const orderInfo = 'app_id=2021000000000000&biz_content=...';

// 发起支付
AlipayPayment.pay(orderInfo)
  .then(result => {
    console.log('支付结果:', result);
    // 判断是否支付成功
    if (AlipayPayment.isPaymentSuccess(result.resultStatus)) {
      console.log('支付成功!');
    } else {
      console.log('支付失败或取消:', AlipayPayment.getPaymentMessage(result.resultStatus));
    }
  })
  .catch(error => {
    console.error('支付异常:', error);
  });
```

### 使用简化方法

```javascript
// 使用直接返回格式化结果的方法
AlipayPayment.payWithResult(orderInfo)
  .then(result => {
    console.log('格式化支付结果:', result);
    if (result.success) {
      console.log('支付成功!');
    } else if (result.cancelled) {
      console.log('用户取消支付');
    } else if (result.processing) {
      console.log('支付处理中');
    } else {
      console.log('支付失败:', result.message);
    }
  });
```

### 沙箱模式管理

```javascript
// 开启沙箱模式(仅用于开发测试)
AlipayPayment.setSandboxMode(true)
  .then(() => console.log('已切换到沙箱环境'))
  .catch(error => console.error('切换环境失败:', error));

// 切换到正式环境
AlipayPayment.setSandboxMode(false)
  .then(() => console.log('已切换到正式环境'))
  .catch(error => console.error('切换环境失败:', error));

// 查询当前沙箱模式状态
AlipayPayment.isSandboxEnabled()
  .then(isEnabled => {
    console.log(`当前${isEnabled ? '处于' : '不处于'}沙箱模式`);
  })
  .catch(error => console.error('查询沙箱模式失败:', error));
```

### 使用PaymentService服务类

```typescript
import { PaymentService } from 'react-native-alipay-payment/lib/src/AlipayService';

// 初始化支付服务
const paymentService = new PaymentService({
  apiUrl: 'https://your-api.com',
  token: 'your-auth-token'
}, true); // true表示使用沙箱环境

// 创建订单并支付
const payOrder = async () => {
  try {
    // 初始化环境
    await paymentService.initialize();
    
    // 创建订单并支付
    const result = await paymentService.createOrderAndPay({
      productId: '123',
      quantity: 1,
      reqtype: 0 // 0: 商品购买, 1: 钱包充值
    });
    
    if (result.success) {
      console.log('支付成功!');
    } else {
      console.log('支付失败:', result.message);
    }
  } catch (error) {
    console.error('支付过程异常:', error);
  }
};
```

### 检查支付宝是否安装

```javascript
AlipayPayment.isAlipayInstalled()
  .then(installed => {
    if (installed) {
      console.log('支付宝已安装');
    } else {
      console.log('支付宝未安装，请引导用户安装');
    }
  });
```

### 获取支付宝SDK版本

```javascript
AlipayPayment.getAlipayVersion()
  .then(version => {
    console.log('支付宝SDK版本:', version);
  })
  .catch(error => {
    console.error('获取版本失败:', error);
  });
```

### 支付状态管理

模块内部已实现支付状态自动管理机制，每次支付完成后(无论成功、失败或取消)都会自动重置支付状态，无需手动调用重置方法。

```javascript
// 通常情况下无需手动重置支付状态
// 仅在特殊情况下（如支付状态异常）才需要手动重置
AlipayPayment.resetPaymentState()
  .then(() => {
    console.log('已手动重置支付状态');
  })
  .catch(error => {
    console.error('重置状态失败:', error);
  });
```

## 支付状态码参考

- `9000`: 支付成功
- `8000`: 正在处理中
- `4000`: 支付失败
- `6001`: 用户取消
- `6002`: 网络连接错误
- `6004`: 未知错误

## 故障排除

如果遇到支付调用后没有响应或无法唤起支付宝的问题，可以尝试以下解决方案:

1. 检查支付宝是否已安装，使用 `AlipayPayment.isAlipayInstalled()`
2. 重置支付状态 `AlipayPayment.resetPaymentState()`
3. 确保支付参数正确，尤其是app_id和签名
4. 在AndroidManifest.xml中确认已添加所需的权限和Activity声明
5. 检查是否有网络连接问题

### 常见问题解决方案

1. **清单合并冲突**：如果您的项目使用了其他包含支付宝SDK的库，您可能会遇到清单合并冲突。参考上面的清单合并冲突解决方案。

2. **无法调起支付宝**：
   - 确保支付宝已安装
   - 确保网络连接正常
   - 检查订单字符串格式是否正确
   - 确保正确设置了沙箱/正式环境

3. **支付结果总是失败**：
   - 检查签名参数是否正确
   - 在沙箱模式下，需要使用沙箱账号测试
   - 检查商户信息是否正确配置

4. **崩溃问题**：
   - 确保已添加所需权限
   - 检查设备系统版本是否受支持
   - 检查是否有Android混淆配置影响

## 注意事项

- 正式环境下必须使用真实的商户信息和签名
- 支付宝SDK需要相关权限，请在敏感权限上做好用户提示
- 支付参数订单字符串应由服务器生成，确保安全性
- 支付结果应与服务器进行二次确认

## 版本记录
-1.1.3
 -在AlipayModule.java中添加了resetPaymentStateInternal()私有方法，统一重置所有状态变量
 -在支付回调、异常处理和授权异常的所有路径中都调用了状态重置
 -重置过程会记录日志，便于调试
-1.1.2
  -修复consummap重复使用
  -修复回调闪退
- 1.1.1:
  - 新增 `isSandboxEnabled` API 用于查询当前沙箱模式状态
  - 更新示例代码，提供沙箱模式管理示例

- 1.1.0:
  - 修复了无法调起支付宝的问题
  - 解决了AndroidManifest.xml合并冲突
  - 更新了支付宝SDK版本到15.8.35
  - 移除了过时的API调用

- 1.0.9:
  - 更新了导入逻辑
  - 修复了TypeScript编译错误

- 1.0.0-1.0.8:
  - 初始版本发布和迭代更新

## 更多功能

查看完整的API文档了解更多功能，包括授权、订单查询等高级功能。

## 许可证

MIT