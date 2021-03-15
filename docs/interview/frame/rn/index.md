---
title: React Native
order: 1
group:
  title: 框架
  order: 3
---

# react-native

## 1. 你们在 RN 的项目中做了哪些事儿

首先我们由两部分，一部分是萌推商家端，这是一个纯 RN 的项目。
另一部分是萌推 C 端 APP，C 端 APP 是一个部分模块使用 RN 来做的。

然后我们做了一个 RN 统一化平台，一个是提供一些 RN 使用的 SDK（音视频、推送、埋点）给集团其他有需要的团队使用。二是 RN 的拆包和热更方案与热更发布平台。

拆包：业务包和基础包的拆分。
RN 打包：首先是基于 metro 的，rn 的打包是使用 metro，这个打包流程主要分为几步，首先通过 metro 从入口点构建所需要的所有模块，然后所有模块经过转换成目标平台可以理解的格式，转化完成就会被序列化，序列化就是将各个模块组合成一个 JavaScript 文件包。

主要的函数： `createModuleIdFactory`

```
function createModuleIdFactory() {
  const fileToIdMap = new Map();
  let nextId = 0;
  return path => {
    let id = fileToIdMap.get(path);

    if (typeof id !== "number") {
      id = nextId++;
      fileToIdMap.set(path, id);
    }

    return id;
  };
}

module.exports = createModuleIdFactory;
```

逻辑比较简单，就是 map 里没有查到这个模块则 ID 自增，然后将模块记录到 map 中。所以官方生成的 moduleId 的规则就是自增，这里要替换成我们配置逻辑，拆包就是要保证这个 ID 不能重复，但是这个 ID 只在打包时生成，如果我们单独打业务包，基础包，这个 ID 的连续性就会丢失，对于 ID 的处理，我们参考了`react-native-multibundler`，每个包邮十万位间隔区间的划分，基础包从 0 自增，业务包从 1000000（100w）开始自增，又或者可以通过模块的路径或者 uuid 去分配，避免碰撞，但是字符串会增大包的体积，没有使用物理路径。

我们做的就是把 createModuleIdFactory 修改的逻辑拆出来封装成 SDK。

## 2. RN 架构

#### 1. 原有架构及问题

```
一共分四个部分：
1.React 代码转换之后的 js
2.JS Bridge
3.JSCore/Webkit内核 js的运行环境
4.Native side
```

**JSBridge 是什么：JSBridge 是维护 JS 与 Native 之间双向通信的桥梁，在 RN 里 JS 与 Native 的双向通信不是通过 WebView 来的，而是通过在序列化 JSON 中维护 NativeModule 与 JavaScriptModule 的 moduleId 做的异步通信，Js 层与 Java 层存在同样的模块注册表，JSBridge 是通过维护这样的模块注册表来实现的通信。**

- 原有架构最大的问题：

组件和 API 太过依赖 JSBridge 的初始化，而且通讯能力也局限于这一条通道。
JS 和 Native 之间并不真正直接通信，它们的通信依赖于跨 Bridge 传输的异步 JSON 消息。

**_它们之间传递的信息，都要序列化为 JSON 之后进行异步传输。这样就造成一个比较常见的性能问题，比如快速滑动 ListView 的时候会白屏。
因为 JSBridge 的异步关系导致了 shadow 层最终呈现到原生的 UI 是异步的，而且滑动太快后会有大量的 UI 事件会阻塞在 JSBridge。_**

UI 的渲染过程分为三层：JS 业务层、shadow tree、原生 UI 层。

其中 JS 和 shadow tree 是通过 JSBridge 来同步数据的，JS 层会将所有 UI node 生成一串 JSON 数据，传递到原生 shadow 层，原生 shadow 层通过传入 node 数据，新增新 UI 或者删除一些不需要的 UI 组件。

从渲染的层次来看，React Native 是多线程运行的，最常见的是 JS 线程和原生端的线程，一旦线程间异常，JSBridge 整体将会阻塞，我们经常也能看到 JS 运行异常了，实际 JS 线程已经无响应了，但原生端还能响应滚动事件。

#### 2. 新架构与解决方法

`RN 在 0.59 版本使用 JSI 取代了先前的 JSBridge。`

##### 新架构将 bridge 分为两部分：

- Fabric，新架构的 UI manager
- TurboModules，这个与 native 端交互的新一代实现

```
1. Fabric: RN 的 UI 重构
2. CodeGen: 代码生成器，与 React Native Modules 相关，规范其接口
3. TurboModules：与 React Native Modules 相关，基于 JSI
4. JSI：JavaScript 与 Java/ObjeC/C++ 相互调用的一种机制
```

JSI 是一个精简通用型的 JS 引擎接口，理论上可以对接任何 JS 引擎，包括 Google 的 V8 和微软的 ChakraCore，或者是 RN 现在使用的 JavaScriptCore（JSC）的新版本（JSI 已经集成到 RN 的 0.59 版本中，并且在该版本中升级了 JSC 的版本）。

##### 新架构核心的优势：

- JSI 是架起 JS 和 Native 之间的桥梁，通过在 C++层实现一个 JSI::HostObject，现在不需要序列化成 JSON 并双向传递等一系列操作，实现了 Native 和 JS 间的直接同步通讯。

JSI 是基于向 JavaScriptCore 注册用 C 编写的回调的 API 封装出来的框架。有了这个框架，我们就能更方便地在 JavaScript 世界和 Native 世界之间建立映射，而不必每次都从底层 API 搞起。

JSI 的另一优势是它抹平了 JavaScript 引擎的差异。使用 JSI，我们不必关心底层是 Hermes 引擎还是 JavaScriptCore 引擎，JSI 底层都消化了。因此只需要基于 JSI 的接口编写即可。

通过使用 JSI,Fabric 将 UI 操作作为函数公开给 JavaScript，新的 Shadow Tree（决定在屏幕上真正显示的内容）在两个领域之间共享，允许两端直接交互。

##### 新架构下 UI 渲染以及如何解决快速滑动过程中的白屏问题的（实线是同步，虚线是异步）：

- 初始化：JS 到 Shadow 层已经是同步操作了，而 shadow 层到原生 UI 变成了可以异步也可以同步操作了，组件可以根据自己的业务场景来适配不同的操作。
- 滑动过程：原生端直接控制 JS 层渲染，同时创建 shadow 层的 node 节点，node 节点会采用同步的方式渲染原生 UI，整个过程中滑动的渲染是采用的同步操作，所以不会出现旧架构下白屏的问题。

JSI 的另一优势是它抹平了 JavaScript 引擎的差异。使用 JSI，我们不必关心底层是 Hermes 引擎还是 JavaScriptCore 引擎，JSI 底层都消化了。因此只需要基于 JSI 的接口编写即可。

## 3. Turbo Module

引入了 Turbo Module，是对 Native Module 的全面升级。

初始化速度：React Native 首次启动时会先加载全部 Native Modules（不管是否真正用到），这会拖慢启动速度。
接口一致性：Native Module 所提供的接口，在 Native 侧和 JavaScript 侧各有一份，两者必须严格一致。但一致依赖缺少保障机制。
单例：Native Module 采用单例设计，生命周期过长。
多余运行时操作：Native Module 收集在运行时扫描，这一步其实没有必要放在运行时。
反射：Native Module 中的方法通过运行时反射调用。这个反射可以被优化。

- TurboCxxModule：将原有的 CxxModule 转换为 TurboModule。兼容老架构用的。
- JavaTurboModule：在 React Native 新架构中，Android 平台下基于 Java 的 Native Module 都基于此类。可以理解成将 Java 映射到 JavaScript。
- ObjCTurboModule：类似地，在 iOS 平台下将 ObjC Native Module 映射到 JavaScript。

我们说到 Turbo Module 是一个基类，通过它能分化出不同种类。Java Turbo Module 就是其分化出的一种。

Turbo Module 的功能是将 C++ 模块映射到 JavaScript 模块。

Java Turbo Module 再次基础上，实现了将 Java 模块映射到 JavaScript 模块。
具体来说：Java ⇌ C++ ⇌ JavaScript。

## 4. RN 的运行机制

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

## 5. 怎么实现一个 Native Bridge 的功能。

> 例子：实现判断应用是否开启通知，如果未打开通知则进入设置页面开启通知。

1. `IOS端 `

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

`RCT_EXPORT_METHOD `：用来设置给 JS 导出的 Native Module 名字。

`RCT_EXPORT_MODULE `：给 JS 提供的方法通过`RCT_EXPORT_METHOD()`宏实现，必须明确的声明要给 JavaScript 导出的方法，否则 React Native 不会导出任何方法。

2. `Android端 `

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
package com.mengtuiapp.mms.bridge;

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
                    packages.add(new RNInstallApkPackage());
                    packages.add(new RNUserAgentPackage());
                    packages.add(new RNKeyboardAdjustPackage());
                    packages.add(new CodePush(mContext.getString(R.string.InnotechCodepushKey), mContext, this.moduleId, BuildConfig.DEBUG, mContext.getString(R.string.InnotechCodepushServerUrl)));
                    return packages;
   }
```

3. JS 端调用

```
NativeModules.RNDataTransferManager.gotoOpenNotification()
就可以前往应用设置页面打开通知。
```
