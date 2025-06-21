package com.inkbottle.alipayrn;

import android.app.Activity;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.alipay.sdk.app.PayTask;
import com.alipay.sdk.app.EnvUtils;
import com.alipay.sdk.app.AuthTask;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;



public class AlipayModule extends ReactContextBaseJavaModule {
    private static final int ALIPAY_SDK_REQUEST_CODE = 10000; // 支付宝SDK回调请求码
    private static final String TAG = "AlipayModule";
    private static final int SDK_PAY_FLAG = 1;
    private static final int SDK_AUTH_FLAG = 2;
    
    private final ReactApplicationContext reactContext;
    private boolean isPaymentInProgress = false;
    private long lastPaymentTime = 0;
    private boolean isSandboxMode = false;
    private boolean isDebugMode = false;
    
    // 活动监听器，用于处理支付宝回调
        private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
                Log.d(TAG, "支付宝活动回调: requestCode=" + requestCode + ", resultCode=" + resultCode);
                    // 获取当前Activity
                 final Activity currentActivity = getCurrentActivity();
    
                // 检查是否是支付宝SDK的回调
                if (requestCode == ALIPAY_SDK_REQUEST_CODE) {
                    if (data == null) {
                        Log.e(TAG, "支付宝回调数据为空");
                        
                        // 处理空数据情况
                        HashMap<String, String> errorResult = new HashMap<>();
                        errorResult.put("resultStatus", "6002"); // 网络错误
                        errorResult.put("memo", "支付宝返回数据为空");
                        errorResult.put("result", "");
                        
                        // 发送事件通知
                        WritableMap eventMap = Arguments.createMap();
                        for (Map.Entry<String, String> entry : errorResult.entrySet()) {
                            eventMap.putString(entry.getKey(), entry.getValue());
                        }
                        sendEvent("AlipayPaymentResult", eventMap);
                        
                        // 重置支付状态
                        resetPaymentStateInternal();
                        return;
                    }
                    
                    // 从Intent中提取支付结果
                    String resultData = data.getStringExtra("result");
                    String resultStatus = data.getStringExtra("resultStatus");
                    String memo = data.getStringExtra("memo");
                    
                    // 如果resultStatus为空，可能是旧版本SDK，尝试提取resultStatus
                    if (resultStatus == null && resultData != null) {
                        // 尝试从result中解析状态码
                        if (resultData.contains("resultStatus={")) {
                            int start = resultData.indexOf("resultStatus={") + 13;
                            int end = resultData.indexOf("}", start);
                            if (end > start) {
                                resultStatus = resultData.substring(start, end);
                            }
                        }
                        
                        // 如果仍然为空，设置为未知错误
                        if (resultStatus == null) {
                            resultStatus = "6004"; // 未知错误
                        }
                    }
                    
                    // 构建结果Map
                    HashMap<String, String> result = new HashMap<>();
                    result.put("resultStatus", resultStatus != null ? resultStatus : "6004");
                    result.put("result", resultData != null ? resultData : "");
                    result.put("memo", memo != null ? memo : "");
                    
                    // 发送事件通知
                    WritableMap eventMap = Arguments.createMap();
                    for (Map.Entry<String, String> entry : result.entrySet()) {
                        eventMap.putString(entry.getKey(), entry.getValue());
                    }
                    sendEvent("AlipayPaymentResult", eventMap);
                    
                    // 重置支付状态
                    resetPaymentStateInternal();
                    
                    Log.d(TAG, "支付宝回调已处理: resultStatus=" + resultStatus);
                }
            }
        };

    public AlipayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // 不默认设置沙箱环境，需要开发者主动调用setSandboxMode设置
        this.isSandboxMode = false;
        
        // 注册活动监听器
        reactContext.addActivityEventListener(activityEventListener);
        
        Log.d(TAG, "AlipayModule初始化成功");
    }

    @NonNull
    @Override
    public String getName() {
        return "AlipayModule";
    }

    /**
     * 发起支付宝支付
     * 
     * @param orderInfo 支付宝订单信息字符串
     * @param promise 回调Promise
     */
    @ReactMethod
    public void pay(final String orderInfo, final Promise promise) {
        Log.d(TAG, "发起支付宝支付请求，订单长度: " + orderInfo.length());

        // 获取当前Activity
        final Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ERR_ACTIVITY_NOT_FOUND", "Activity不存在");
            return;
        }

        // 空订单检查
        if (TextUtils.isEmpty(orderInfo)) {
            promise.reject("ERR_EMPTY_ORDER", "支付参数不能为空");
            return;
        }
        
        // 检查是否正在进行支付
        if (isPaymentInProgress) {
            long now = System.currentTimeMillis();
            // 如果上次支付还不到3秒，则拒绝这次请求
            if (now - lastPaymentTime < 3000) {
                Log.d(TAG, "支付请求被拒绝: 上一次支付还在进行中");
                promise.reject("PAY_IN_PROGRESS", "支付操作正在进行中，请稍后再试");
                return;
            } else {
                // 如果超过3秒，认为上次支付已经完成但回调可能丢失，重置状态
                Log.d(TAG, "重置支付状态: 上一次支付可能已超时");
                isPaymentInProgress = false;
            }
        }
        
            final Handler handler = new Handler(Looper.getMainLooper()) {
            @Override
            public void handleMessage(Message msg) {
                // 标记支付已结束
                resetPaymentStateInternal();
                Log.d(TAG, "支付回调后自动重置支付状态");
                
                if (msg.what == SDK_PAY_FLAG) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> result = (Map<String, String>) msg.obj;
                    
                    // 某些情况下支付结果可能通过onActivityResult返回
                    // 所以需要检查是否已经处理过这个结果
                    String resultStatus = result.get("resultStatus");
                    
                    // 为事件创建一个WritableMap
                    WritableMap eventMap = Arguments.createMap();
                    for (Map.Entry<String, String> entry : result.entrySet()) {
                        eventMap.putString(entry.getKey(), entry.getValue());
                    }
                    
                    // 发送支付结果事件
                    sendEvent("AlipayPaymentResult", eventMap);
                    
                    // 为Promise创建另一个新的WritableMap
                    WritableMap promiseMap = Arguments.createMap();
                    for (Map.Entry<String, String> entry : result.entrySet()) {
                        promiseMap.putString(entry.getKey(), entry.getValue());
                    }
                    
                    // 无论成功失败，都通过resolve返回结果
                    promise.resolve(promiseMap);
                }
            }
        };
        
        // 在子线程中进行支付操作
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.d(TAG, "开始调用支付宝SDK");
                    
                    // 构造PayTask对象
                    PayTask alipay = new PayTask(currentActivity);
                    
                    // 调用支付接口，获取支付结果
                    Map<String, String> result = alipay.payV2(orderInfo, true);
                    Log.d(TAG, "支付宝支付完成，结果: " + result.toString());
                    
                    Message msg = new Message();
                    msg.what = SDK_PAY_FLAG;
                    msg.obj = result;
                    handler.sendMessage(msg);
                } catch (Exception e) {
                    Log.e(TAG, "支付过程异常: " + e.getMessage());
                    resetPaymentStateInternal();
                    
                    // 构建错误信息
                    HashMap<String, String> errorResult = new HashMap<>();
                    errorResult.put("resultStatus", "4000");
                    errorResult.put("memo", "支付过程出现异常: " + e.getMessage());
                    
                    // 返回错误信息
                    Message msg = new Message();
                    msg.what = SDK_PAY_FLAG;
                    msg.obj = errorResult;
                    handler.sendMessage(msg);
                }
            }
        }).start();
    }
    
    /**
     * 支付宝授权接口，用于获取用户授权令牌
     * 
     * @param authInfo 授权参数字符串
     * @param promise 回调Promise
     */
    @ReactMethod
    public void auth(final String authInfo, final Promise promise) {
        if (TextUtils.isEmpty(authInfo)) {
            promise.reject("ERR_EMPTY_AUTH", "授权参数不能为空");
            return;
        }
        
        final Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ERR_ACTIVITY_NOT_FOUND", "Activity不存在");
            return;
        }
        
        final Handler handler = new Handler(Looper.getMainLooper()) {
            @Override
            public void handleMessage(Message msg) {
                if (msg.what == SDK_AUTH_FLAG) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> result = (Map<String, String>) msg.obj;
                    
                    WritableMap map = Arguments.createMap();
                    for (Map.Entry<String, String> entry : result.entrySet()) {
                        map.putString(entry.getKey(), entry.getValue());
                    }
                    
                    promise.resolve(map);
                }
            }
        };
        
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    AuthTask authTask = new AuthTask(currentActivity);
                    Map<String, String> result = authTask.authV2(authInfo, true);
                    
                    Message msg = new Message();
                    msg.what = SDK_AUTH_FLAG;
                    msg.obj = result;
                    handler.sendMessage(msg);
                } catch (Exception e) {
                    HashMap<String, String> errorResult = new HashMap<>();
                    errorResult.put("resultStatus", "4000");
                    errorResult.put("memo", "授权过程出现异常: " + e.getMessage());
                    
                    resetPaymentStateInternal();
                    
                    Message msg = new Message();
                    msg.what = SDK_AUTH_FLAG;
                    msg.obj = errorResult;
                    handler.sendMessage(msg);
                }
            }
        }).start();
    }
    
    /**
     * 设置是否使用沙箱环境
     * 
     * @param enabled 是否启用沙箱模式
     * @param promise 回调Promise
     */
    @ReactMethod
    public void setSandboxMode(final boolean enabled, final Promise promise) {
        try {
            this.isSandboxMode = enabled;
            
            if (enabled) {
                EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);
                Log.d(TAG, "已设置为沙箱环境");
            } else {
                EnvUtils.setEnv(EnvUtils.EnvEnum.ONLINE);
                Log.d(TAG, "已设置为正式环境");
            }
            promise.resolve(enabled);
        } catch (Exception e) {
            Log.e(TAG, "设置环境失败: " + e.getMessage());
            promise.reject("ENV_SETTING_ERROR", "设置环境失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取当前沙箱模式状态
     * 
     * @param promise 回调Promise
     */
    @ReactMethod
    public void isSandboxEnabled(final Promise promise) {
        promise.resolve(this.isSandboxMode);
    }
    
    /**
     * 检查支付宝是否安装
     * 
     * @param promise 回调Promise
     */
    @ReactMethod
    public void isAlipayInstalled(final Promise promise) {
        try {
            final Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.resolve(false);
                return;
            }
            
            PayTask payTask = new PayTask(currentActivity);
            boolean isInstalled = payTask.getVersion() != null;
            promise.resolve(isInstalled);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }
    
    /**
     * 获取支付宝SDK版本号
     * 
     * @param promise 回调Promise
     */
    @ReactMethod
    public void getAlipayVersion(final Promise promise) {
        try {
            final Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("ERR_ACTIVITY_NOT_FOUND", "Activity不存在");
                return;
            }
            
            PayTask payTask = new PayTask(currentActivity);
            String version = payTask.getVersion();
            promise.resolve(version);
        } catch (Exception e) {
            promise.reject("GET_VERSION_ERROR", e.getMessage());
        }
    }
    
    /**
     * 重置支付状态
     * 
     * @param promise 回调Promise
     */
    @ReactMethod
    public void resetPaymentState(final Promise promise) {
        Log.d(TAG, "手动重置支付状态");
        resetPaymentStateInternal();
        promise.resolve(true);
    }
    
    /**
     * 发送事件到JS层
     * 
     * @param eventName 事件名称
     * @param params 事件参数
     */
    private void sendEvent(String eventName, WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
    
    /**
     * 导出常量到JS层
     */
    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("SUCCESS", "9000");    // 支付成功
        constants.put("PROCESSING", "8000"); // 正在处理中
        constants.put("FAILED", "4000");     // 支付失败
        constants.put("CANCEL", "6001");     // 用户取消
        constants.put("NETWORK_ERROR", "6002"); // 网络连接出错
        constants.put("UNKNOWN", "6004");    // 未知错误
        return constants;
    }

    @Override
    public void invalidate() {
        // 在组件卸载时移除监听器
        reactContext.removeActivityEventListener(activityEventListener);
        super.invalidate();
    }

    /**
     * 启用或禁用调试模式，在调试模式下会输出更多日志
     *
     * @param enabled 是否启用调试模式
     * @param promise 回调Promise
     */
    @ReactMethod
    public void setDebugMode(final boolean enabled, final Promise promise) {
        this.isDebugMode = enabled;
        Log.d(TAG, "调试模式已" + (enabled ? "启用" : "禁用"));
        promise.resolve(enabled);
    }

    /**
     * 记录调试日志
     * 
     * @param level 日志级别 ("debug", "info", "warn", "error")
     * @param message 日志内容
     * @param promise 回调Promise
     */
    @ReactMethod
    public void logDebugInfo(final String level, final String message, final Promise promise) {
        if (!this.isDebugMode) {
            promise.resolve(false);
            return;
        }
        
        switch (level.toLowerCase()) {
            case "debug":
                Log.d(TAG, message);
                break;
            case "info":
                Log.i(TAG, message);
                break;
            case "warn":
                Log.w(TAG, message);
                break;
            case "error":
                Log.e(TAG, message);
                break;
            default:
                Log.d(TAG, message);
        }
        
        promise.resolve(true);
    }

    /**
     * 获取调试信息，包括设备信息、支付宝SDK版本等
     * 
     * @param promise 回调Promise
     */
    @ReactMethod
    public void getDebugInfo(final Promise promise) {
        try {
            final Activity currentActivity = getCurrentActivity();
            
            // 创建调试信息对象
            WritableMap debugInfo = Arguments.createMap();
            
            // 设备信息
            debugInfo.putString("device", android.os.Build.DEVICE);
            debugInfo.putString("model", android.os.Build.MODEL);
            debugInfo.putString("manufacturer", android.os.Build.MANUFACTURER);
            debugInfo.putString("androidVersion", android.os.Build.VERSION.RELEASE);
            debugInfo.putInt("androidSDKInt", android.os.Build.VERSION.SDK_INT);
            
            // 应用信息
            if (currentActivity != null) {
                try {
                    String packageName = currentActivity.getPackageName();
                    String appVersionName = currentActivity.getPackageManager()
                            .getPackageInfo(packageName, 0).versionName;
                    int appVersionCode;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                        appVersionCode = (int) currentActivity.getPackageManager()
                                .getPackageInfo(packageName, 0).getLongVersionCode();
                    } else {
                        appVersionCode = currentActivity.getPackageManager()
                                .getPackageInfo(packageName, 0).versionCode;
                    }
                    
                    debugInfo.putString("packageName", packageName);
                    debugInfo.putString("appVersionName", appVersionName);
                    debugInfo.putInt("appVersionCode", appVersionCode);
                } catch (Exception e) {
                    debugInfo.putString("appInfoError", e.getMessage());
                }
            }
            
            // 支付宝状态信息
            debugInfo.putBoolean("sandboxMode", isSandboxMode);
            debugInfo.putBoolean("paymentInProgress", isPaymentInProgress);
            debugInfo.putDouble("lastPaymentTime", lastPaymentTime);
            
            // 支付宝SDK相关信息
            if (currentActivity != null) {
                try {
                    PayTask payTask = new PayTask(currentActivity);
                    String version = payTask.getVersion();
                    boolean isAlipayInstalled = version != null && !version.isEmpty();
                    
                    debugInfo.putBoolean("alipayInstalled", isAlipayInstalled);
                    debugInfo.putString("alipayVersion", version != null ? version : "未安装");
                } catch (Exception e) {
                    debugInfo.putString("alipayError", e.getMessage());
                }
            }
            
            promise.resolve(debugInfo);
        } catch (Exception e) {
            promise.reject("GET_DEBUG_INFO_ERROR", "获取调试信息失败: " + e.getMessage());
        }
    }

    /**
     * 内部方法：重置支付状态所有变量
     * 在支付完成/错误/取消等所有情况后都会调用
     */
    private void resetPaymentStateInternal() {
        isPaymentInProgress = false;
        lastPaymentTime = 0;
        Log.d(TAG, "支付状态已重置");
    }
} 