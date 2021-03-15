---
title: Hybrid
order: 1
group:
  title: 框架
  order: 3
---

# Hybrid

## 1. JSBridge 的实现原理

hybrid 通过 JSBridge 让前端可以调用 Native 功能，是构建 Native 与非 Native 间消息双向通信的通道。
JS 向 Native 发消息：调用相关功能，通知 Native JS 当前的相关状态等。
Native 向 JS 端发消息：回执调用结果、消息推送、通知 JS 当前 Native 的状态。

`原理`:

### JS 调用 native

    1. 注入 API（Android 通过@JavascriptInterface、IOS 通过 webkit.messageHandlers 直接注入函数）
    2. 拦截 URL Scheme：Native WebView 的所有网络请求都可以被浏览器对象所拦截，于是 Native 拦截的请求中，我们只要发现是 jsbridge://开头的地址，就不进行内容的加载，转而执行相应的调用逻辑。
    3.改写浏览器原有对象，webView重写onJSPrompt

### Native 调用 JS

Native 调用 js 实际就是执行拼接 js 字符串，从外部调用对应方法，返回 js 执行结果。因此 js 方法必须放在全局的 Window 上

**我们做法分开的：**

- JS 调 Native

  - iOS：H5 通过 iframe 发起请求，由 IOS 端拦截请求，解析出相应的方法和参数。
  - Android：通过@JavascriptInterface 注入 API

- Native 调用 JavaScript 则直接执行拼接好的 JavaScript 代码即可。

```
mWebview.evaluateJavascript("javascript: func()", new ValueCallback<String>() {
    @Override
    public void onReceiveValue(String value) {
        return;
    }
});
```

主要的代码逻辑是：接收到 JavaScript 消息 => 解析参数，拿到 bridgeName、data 和 callbackId => 根据 bridgeName 找到功能方法，以 data 为参数执行 => 执行返回值和 callbackId 一起回传前端。 Native 调用 JavaScript 也同样简单，直接自动生成一个唯一的 ResponseId，并存储句柄，然后和 data 一起发送给前端即可。

### callback 的逻辑

```
public class CallBack {
    private  String cbName;
    private WebView mWebView;

    public CallBack(WebView webView, String cbName) {
        this.cbName = cbName;
        this.mWebView = webView;
    }

    public void apply(JSONObject jsonObject) {
        if (mWebView!=null) {
            mWebView.post(() -> {
                mWebView.evaluateJavascript("javascript:" + cbName + "(" + jsonObject.toString() + ")", new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        return;
                    }
                });
            });
        }
    }
}
```

callback 我们通过 Native 执行 JS，根据 callbackId 生成唯一句柄和 data 一起传给前端处理。

## 2. JSBridge 和 JSCore 的区别

JSBridge 是 JS 与 Native 的双向通信。
JSCore 是 JS 的运行环境。

## 3. RN 里 JSBridge 实现细节

- iOS：JS 与 OC 的交互是双方均维护一套相同的模块配置表，这个表是由 OC 遍历 OC 模块中带了暴露标记的方法以及 JS 中配置的模块方法而得到的，该操作是有 RN 自动完成。在 JS 调用 OC 方法时，bridge 会做一些格式化操作，并将其放在等待 OC 调用的队列中，而 CallbackID 则缓存在 JS 中间件上等待回调。在用户触发了事件时，OC 会调用 JS 模块配置表中 JS 模块的方法，此时 JS 会连同等待 OC 调用的队列一起传回 OC 中执行。
