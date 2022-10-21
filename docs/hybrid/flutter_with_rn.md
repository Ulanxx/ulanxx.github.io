---
title: 跨平台 APP 开发实践（RN、Flutter）
order: 1
group:
  title: hybrid
  order: 3
---

# 跨平台 APP 开发实践（RN、Flutter）

## 0. 前言

`跨平台的优势`：

> - `真正的原生应用`：产生的不是网页应用，不是混合应用，而是一个原生的移动应用。
> - `快速开发应用`：相比原生漫长的编译过程，Hot Reload 简直不要太爽。
> - `可随时呼叫原生外援`：完美兼容 Java/Swift/OC 的组件，一部分用原生一部分用 RN 来做完全可以。
> - `跨平台`：一套业务逻辑代码可以稳定运行在两个+平台。
> - `节省劳动力`：为企业节省劳动力。。。（不知道算不算好事儿）。

- ##### 使用 Flutter 的应用：闲鱼、美团 B 端、阿里（FlutterGo、AliFlutter、淘宝特价版）、字节（今日头条、西瓜视频、皮皮虾）

- ##### 使用 React Native 的应用：携程、美团 C 端、字节（今日头条）、手机 QQ、FaceBook

可以看出 RN 和 Flutter 还是呈五五开的发展态势。

> github：

- [react-native](https://github.com/facebook/react-native)
- [flutter](https://github.com/flutter/flutter)

但是 Flutter 是在 18 年底才发行了以第一个稳定版，而 React Native 是 15 年就已经推出。这么一看，Flutter 突然 🔥 起来，就 1 年的时间就挤掉了 RN 的大半市场，今天我们一起看一下，这两个跨平台的框架究竟有什么神奇的地方。

---

## 0. React Native 的入门与实践

React Native 是带着 React 的光环出生的一个跨平台框架，具备 React 的一切新特性，让从 Ionic 与 HBuilder 的时代走过的 Hybrid 的开发欲罢不能。因为他能通过 React 的代码与通用的业务逻辑，编写一套完全原生的 App 应用，而且 APP 的使用感受与 OC/JAVA 编写的 Native APP 完全一致。

## 1. RN 的运行机制

看到这里会有这样的一个疑问`为什么js代码可以运行在APP中？`

> 是因为 RN 有两个核心

- JSC 引擎：1 → 因为 RN 的包里一个有 JS 执行引擎（WebKit 的内核 JavaScriptCore），所以它可以运行 js 代码。（前期是 JSC 的环境，在 0.60.x 之后添加了 Hermes 作为 js 引擎）。
  > [干货 | 加载速度提升 15%，携程对 RN 新一代 JS 引擎 Hermes 的调研](https://cloud.tencent.com/developer/article/1492194)
  >
  > [React Native JSC 源码](https://sourcegraph.com/github.com/facebook/react-native@0.30-stable/-/blob/ReactCommon/cxxreact/JSCExecutor.cpp#L24:11)
- JSI 通信：其实就是 JSBridge，作为 JS 与 Native 的桥梁，运行在 JSC 环境下，通过 C++实现的 Native 类的代理对象，这样就可以实现 JS 与 Native 通信。

所以：JSC/Hermes 会将作为 JS 的运行环境（解释器），JS 层通过 JSI 获取到对应的 C++层的 module 对象的代理，最终通过 JNI 回调 Java 层的 module，在通过 JNI 映射到 Native 的函数。

[RN Native Android Module 源码](https://sourcegraph.com/github.com/facebook/react-native@v0.63.0-rc.1/-/tree/ReactAndroid/src/main/java/com/facebook/react/views/text)

[RN Native IOS Module 源码](https://sourcegraph.com/github.com/facebook/react-native@v0.63.0-rc.1/-/blob/React/Views/RCTView.m)

所以，RN 中所有的标签其实都不是真是的控件，js 代码中所有的控件，都是一个“Map 对中的 key”，JS 通过这个 key 组合的 DOM，放到 VDOM 的 js 数据结构中，然后通过 JSBridge 代理到 Native，Native 端会解析这个 DOM，从而获得对应的 Native 的控件。

## 2.怎么实现一个 Native Bridge 的功能。

> 例子：实现判断应用是否开启通知，如果未打开通知则进入设置页面开启通知。

1. `IOS端`

- IOS 在 React Native 中，一个“原生模块”就是一个实现了“RCTBridgeModule”协议的 Objective-C 类。

```先定义头文件
#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

@interface RNDataTransferManager : RCTEventEmitter <RCTBridgeModule>

@end

```

```实现
#import "RNDataTransferManager.h"

@implementation RNDataTransferManager

RCT_EXPORT_MODULE();
// 判断notification是否开启
RCT_EXPORT_METHOD(isNotificationEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  BOOL isEnable = NO;
  UIUserNotificationSettings *setting = [[UIApplication sharedApplication] currentUserNotificationSettings];
  isEnable = (UIUserNotificationTypeNone == setting.types) ? NO : YES;
  return resolve(@(isEnable));
}

// 进入设置开启Notification
RCT_EXPORT_METHOD(gotoOpenNotification) {
  [self goToAppSystemSetting];
}
```

注意两个宏：

`RCT_EXPORT_METHOD`：用来设置给 JS 导出的 Native Module 名字。

`RCT_EXPORT_MODULE`：给 JS 提供的方法通过`RCT_EXPORT_METHOD()`宏实现，必须明确的声明要给 JavaScript 导出的方法，否则 React Native 不会导出任何方法。

2. `Android端`

首先新建一个 JavaModule 类继承 ReactContextBaseJavaModule。

```
public class RNDataTransferManager extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    public static RNDataTransferManager rnDataTransferManager;

    public static String currentBindAlias = "";

    public RNDataTransferManager(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    public static RNDataTransferManager getInstance() {
        if (null == rnDataTransferManager) {
            rnDataTransferManager = new RNDataTransferManager(reactContext);
        }
        return rnDataTransferManager;
    }

    @Nonnull
    @Override
    public String getName() {
        return "RNDataTransferManager";
    }

        @ReactMethod
    public void isNotificationEnabled(Promise promise) {
        if (promise != null) {
            if (MainApplication.getContext() != null) {
                if (NotificationManagerCompat.from(MainApplication.getContext())
                        .areNotificationsEnabled()) {
                    Log.e("push", "推送开启 isNotificationEnabled -> true");
                    promise.resolve(true);
                } else {
                    Log.e("push", "推送未开启 isNotificationEnabled -> false");
                    promise.resolve(false);
                }
            } else {
                promise.resolve(false);
            }
        }
    }

    @ReactMethod
    public boolean gotoOpenNotification() {
        if (MainApplication.getContext() == null) {
            return false;
        }
        Intent intent = getSetIntent(MainApplication.getContext());
        PackageManager packageManager = MainApplication.getContext().getPackageManager();
        List<ResolveInfo> list = packageManager.queryIntentActivities(intent, 0);
        if (list != null && list.size() > 0) {
            try {
                MainApplication.getContext().startActivity(intent);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

}

```

写好了 Native Module 之后需要注册模块。

1）首先通过 ReactPackage 的 createNativeModules 来注册模块。

```
package com.xxx.bridge;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;

public class DataTransferPackage implements ReactPackage {

    private RNDataTransferManager transferModule;

    @Nonnull
    @Override
    public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        List<NativeModule> nativeModules = new ArrayList<>();
        transferModule = new RNDataTransferManager(reactContext);
        RNDataTransferManager.rnDataTransferManager = transferModule;
        nativeModules.add(transferModule);
        return nativeModules;
    }

    @Nonnull
    @Override
    public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}

```

2）然后让你的应用拿到注册到的 package，需要在 Application 的 getPackages 方法中提供。

```
   @Override
   protected List<ReactPackage> getPackages() {
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    packages.add(new DataTransferPackage());
                    return packages;
   }
```

3. JS 端调用

```
NativeModules.RNDataTransferManager.gotoOpenNotification()
就可以前往应用设置页面打开通知。
```

- 当然我们实际开发中不会围绕这么多 Native Module 来做文章，但是可以看出，做 RN 是需要一个基本的原生的操作能力。

## 3. 这样做的优势和问题

#### 优势：

> - 相比 Hybrid 性能更高、因为都是原生组件的渲染。
> - 从 render 到 virtual dom 的过程都是 React 驱动，具备 React 的一切优秀特性，可以使用 React 的社区优秀工具。
> - 项目搭建起来了，用 JS 写 APP 又具有原生的渲染效率简直爽，一份代码 Android、IOS、web 都可以适配（毕竟 vDom 层是一样的，jsbridge 就随你魔改了）。
> - 相比原生的编译速度，开发 JS 使用 HotReload 简直太爽了。

#### 问题：

> - 跨平台，但是 Android、IOS 毕竟是不同的系统与生态，组件与功能都有一些跨平台的差异，RN 的原生组件的平台差异性很大。
> - 性能问题：动画性能不好、列表数据量大性能不好，主要集中在低端机，大数据列表快速滑动会有白屏，动画层级多在 Android 低于 30fps 的情况频繁。
> - 白屏问题，加载 bundle 的时间会有一个白屏出现，需要手动改 Native 代码。
> - 开发业务功能不需要原生能力，但是开发一个完整的跨平台项目，是需要具备一定的双端原生能力（有很多要写 Native 的，许多功能和组件也需要自己封装）
> - 这也是 RN 做的不好的地方，版本迭代太慢，不痛不痒的迭代了 5 年了，很多问题还是没有解决。这也是 Flutter 为什么这么火的原因。

### 4. 那么 Flutter 怎么做的

Flutter 使用 Dart 作为开发语言，作为一个 AOT 框架，Flutter 是在运行时直接将 Dart 转化成客户端的可执行文件，然后通过 Skia 渲染引擎直接渲染到硬件平台。如果说 RN 是为开发者做了平台兼容，那 Flutter 更像是为开发者屏蔽了平台的概念。RN 需要被转译为本地对应的组件，而 Flutter 是直接编译成可执行文件并渲染到设备。Flutter 可以直接控制屏幕上的每一个像素，这样就可以避免由于使用 JSBridge 导致的性能问题。

> 三要素：

- Dart 语言开发。
- 任何 Dart 代码都是 AOT 运行前编译成本地可执行文件，使用 Skia（渲染引擎）直接渲染到本机。
- 不使用原生的组件，具有自己的 widget 库，开发时构建自己的 widget 树来画页面。

##### 如果是页面级的应用来说，Flutter 是不需要任何原生代码来写组件，所有组件和页面都可以通过 Flutter 直接写好。

### 8. 总结

今天我们主要看了一下两个框架开发时的代码结构，与代码书写形式，还有简单了解了一下它是怎么运行。那之后如果小伙伴想继续去学习，或做一个自己的应用，还有以下几个方面需要注意：

    1. APP初始化与生命周期状态。
    2. 数据持久化 - 数据管理、SP、本地数据库。
    3. 碎片化处理。
    4. 打包三要素：Android（混淆、签名、加固），IOS（生成证书、导入证书、使用证书）。
    5. 拆包、热更新、原生集成。

Flutter 因为自带了渲染引擎，理论上是要比 RN 渲染效率要高，但是其实实际使用上，在性能过剩的移动端设备中，并没有出现特别大的差异，而 Facebook 的团队在 Flutter 的持续施压之下也决定重构底层，并在最近几个版本有了一些进步，所以大家有兴趣的都可以研究一下。
