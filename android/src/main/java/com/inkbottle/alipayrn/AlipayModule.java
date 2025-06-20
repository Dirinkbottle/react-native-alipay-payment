package com.inkbottle.buyeveryday;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.alipay.sdk.app.PayTask;
import com.alipay.sdk.app.EnvUtils;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

public class AlipayModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AlipayModule";
    private static final int SDK_PAY_FLAG = 1;
    
    private final ReactApplicationContext reactContext;
    private boolean isPaymentInProgress = false;
    private long lastPaymentTime = 0;

    public AlipayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);
        Log.d(TAG, "AlipayModule初始化: 已设置为沙箱环境");
    }

    @NonNull
    @Override
    public String getName() {
        return "AlipayModule";
    }

    @ReactMethod
    public void pay(final String orderInfo, final Promise promise) {
        Log.d(TAG, "支付宝支付请求 orderInfo: " + (orderInfo.length() > 30 ? orderInfo.substring(0, 30) + "..." : orderInfo));
        
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
        
        final Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ERR_ACTIVITY_NOT_FOUND", "Activity不存在");
            return;
        }
        
        // 标记支付开始
        isPaymentInProgress = true;
        lastPaymentTime = System.currentTimeMillis();
        
        final Handler handler = new Handler(Looper.getMainLooper()) {
            @Override
            public void handleMessage(Message msg) {
                // 标记支付已结束
                isPaymentInProgress = false;
                
                if (msg.what == SDK_PAY_FLAG) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> result = (Map<String, String>) msg.obj;
                    
                    WritableMap map = Arguments.createMap();
                    for (Map.Entry<String, String> entry : result.entrySet()) {
                        map.putString(entry.getKey(), entry.getValue());
                    }
                    
                    // 判断支付结果
                    String resultStatus = result.get("resultStatus");
                    Log.d(TAG, "支付宝返回状态码: " + resultStatus);
                    
                    // 无论成功失败，都通过resolve返回结果，让JS层来处理
                    promise.resolve(map);
                }
            }
        };
        
        // 在子线程中进行支付操作
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    // 构造PayTask对象
                    PayTask alipay = new PayTask(currentActivity);
                    // 调用支付接口，获取支付结果
                    Map<String, String> result = alipay.payV2(orderInfo, true);
                    Log.d(TAG, "支付宝支付结果: " + result.toString());
                    
                    Message msg = new Message();
                    msg.what = SDK_PAY_FLAG;
                    msg.obj = result;
                    handler.sendMessage(msg);
                } catch (Exception e) {
                    Log.e(TAG, "支付过程异常: " + e.getMessage());
                    isPaymentInProgress = false;
                    
                    // 构建错误信息
                    WritableMap errorMap = Arguments.createMap();
                    errorMap.putString("resultStatus", "4000");
                    errorMap.putString("memo", "支付过程出现异常: " + e.getMessage());
                    
                    // 返回错误信息
                    Message msg = new Message();
                    msg.what = SDK_PAY_FLAG;
                    msg.obj = new HashMap<String, String>() {{
                        put("resultStatus", "4000");
                        put("memo", "支付过程出现异常: " + e.getMessage());
                    }};
                    handler.sendMessage(msg);
                }
            }
        }).start();
    }
    
    @ReactMethod
    public void setSandboxMode(final boolean enabled, final Promise promise) {
        try {
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
    
    @ReactMethod
    public void resetPaymentState(final Promise promise) {
        Log.d(TAG, "手动重置支付状态");
        isPaymentInProgress = false;
        lastPaymentTime = 0;
        promise.resolve(true);
    }
    
    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("SUCCESS", "9000");
        constants.put("CANCEL", "6001");
        constants.put("FAILED", "4000");
        return constants;
    }
} 