---
title: Android Dynamic Delivery
date: 2018-07-26 20:00:18
tags:
  - Android
---

最近试验了一下 Google Play Store 的 Dynamic Delivery 功能，感觉挺不错，记录一下。

Demo： [https://github.com/angnuoli/dynamic-features-demo](https://github.com/angnuoli/dynamic-features-demo)

> 官方文档：[Android App Bundles](https://developer.android.com/guide/app-bundle/)
>
> Google sample in Kotlin: [https://github.com/googlesamples/android-dynamic-features](https://github.com/googlesamples/android-dynamic-features).

有篇博客也可以看看

> [深入解读Android新特性——App Bundles](https://blog.csdn.net/qq_42154484/article/details/80653420)

<!-- more -->

## Summary

感觉现在这个 feature 还不是很成熟，实验一下不错，是否 enroll in product 需要考虑一下。

可以正常的下载 module，但是 module 不会立即生效，需要 app 冷启动之后才能加载新 module，默认会 kill app（注意）。

downloading module 会有一些问题，官方也说在测试

![1532603583978.png](https://i.loli.net/2018/07/27/5b5ab9bec271b.png)

### Problems

1. ClassNotFoundException. This can be solved by adding `split="modulename"` attribute in manifest file. 

2. ResourceNotFound. This error will happen on API 26 or higher using 

	```java
	api 'com.google.android.play:core:1.3.0'
	```

	**Details**

	After first installing the module, you should restart the app. 

	> Reference: [https://developer.android.com/guide/app-bundle/playcore#access_downloaded_modules](https://developer.android.com/guide/app-bundle/playcore#access_downloaded_modules)

	Before restarting the app, starting activity of the module will result in ResourceNotFound Exception on all API level. The stack trace is same with following stack trace. But if we restart the app, ResourceNotFound Exception will still happen on API 26 or higher and the module will work on API 25 or lower.

	**Root Cause**

	Just guess. 

	- On phones with API 26 or higher, the base.apk is stored in data/app/packageName + Random-hashcode.
	- On phones with API 25 or lower, the base.apk is stored in data/app/packageName-1 or 2, etc.

	I guess the difference may be here.

	```java
	2018-07-26 18:48:49.849 15788-15802/? W/dynamicfeature: Opening an oat file without a class loader. Are you using the deprecated DexFile APIs?
	2018-07-26 18:48:49.943 15827-15827/? I/dex2oat: /system/bin/dex2oat --dex-file=/data/user/0/com.demo.dynamicfeatures/files/splitcompat/37/verified-splits/dynamicFeature.apk --output-vdex-fd=60 --oat-fd=61 --oat-location=/data/user/0/com.demo.dynamicfeatures/files/splitcompat/37/verified-splits/oat/arm64/dynamicFeature.odex --compiler-filter=quicken --class-loader-context=&
	2018-07-26 18:48:50.063 15788-15802/? W/dynamicfeature: Skipping duplicate class check due to unsupported classloader
	2018-07-26 18:48:50.067 15788-15802/? W/dynamicfeature: Opening an oat file without a class loader. Are you using the deprecated DexFile APIs?
	2018-07-26 18:48:50.069 15788-15802/? E/SplitCompat: DexPathList.makeDexElement failed
	    java.io.IOException: No original dex files found for dex location /data/user/0/com.demo.dynamicfeatures/files/splitcompat/37/verified-splits/dynamicFeature.config.xxhdpi.apk
	        at dalvik.system.DexFile.openDexFileNative(Native Method)
	        at dalvik.system.DexFile.openDexFile(DexFile.java:354)
	        at dalvik.system.DexFile.<init>(DexFile.java:143)
	        at dalvik.system.DexFile.loadDex(DexFile.java:202)
	        at dalvik.system.DexPathList.loadDexFile(DexPathList.java:397)
	        at dalvik.system.DexPathList.makeDexElements(DexPathList.java:354)
	        at dalvik.system.DexPathList.makeDexElements(DexPathList.java:321)
	        at dalvik.system.DexPathList.makePathElements(DexPathList.java:443)
	        at java.lang.reflect.Method.invoke(Native Method)
	        at com.google.android.play.core.splitcompat.c.b.a(Unknown Source:24)
	        at com.google.android.play.core.splitcompat.b.i.b(Unknown Source:14)
	        at com.google.android.play.core.splitcompat.b.i.a(Unknown Source:0)
	        at com.google.android.play.core.splitcompat.b.j.a(Unknown Source:0)
	        at com.google.android.play.core.splitcompat.b.c.a(Unknown Source:121)
	        at com.google.android.play.core.splitcompat.b.o.b(Unknown Source:16)
	        at com.google.android.play.core.splitcompat.b.s.a(Unknown Source:0)
	        at com.google.android.play.core.splitcompat.SplitCompat.a(Unknown Source:120)
	        at com.google.android.play.core.splitcompat.SplitCompat.a(Unknown Source:70)
	        at com.google.android.play.core.splitcompat.SplitCompat.a(Unknown Source:1)
	        at com.google.android.play.core.splitcompat.a.b.run(Unknown Source:64)
	        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:458)
	        at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:301)
	        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1167)
	        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:641)
	        at java.lang.Thread.run(Thread.java:764)
	2018-07-26 18:48:50.070 15788-15802/? E/SplitCompat: Error installing additional splits
	    com.google.android.play.core.a.k: DexPathList.makeDexElement failed
	        at com.google.android.play.core.splitcompat.b.c.a(Unknown Source:138)
	        at com.google.android.play.core.splitcompat.b.o.b(Unknown Source:16)
	        at com.google.android.play.core.splitcompat.b.s.a(Unknown Source:0)
	        at com.google.android.play.core.splitcompat.SplitCompat.a(Unknown Source:120)
	        at com.google.android.play.core.splitcompat.SplitCompat.a(Unknown Source:70)
	        at com.google.android.play.core.splitcompat.SplitCompat.a(Unknown Source:1)
	        at com.google.android.play.core.splitcompat.a.b.run(Unknown Source:64)
	        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:458)
	        at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:301)
	        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1167)
	        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:641)
	        at java.lang.Thread.run(Thread.java:764)
	    	Suppressed: java.io.IOException: No original dex files found for dex location /data/user/0/com.demo.dynamicfeatures/files/splitcompat/37/verified-splits/dynamicFeature.config.xxhdpi.apk
	        at dalvik.system.DexFile.openDexFileNative(Native Method)
	        at dalvik.system.DexFile.openDexFile(DexFile.java:354)
	        at dalvik.system.DexFile.<init>(DexFile.java:143)
	        at dalvik.system.DexFile.loadDex(DexFile.java:202)
	        at dalvik.system.DexPathList.loadDexFile(DexPathList.java:397)
	        at dalvik.system.DexPathList.makeDexElements(DexPathList.java:354)
	        at dalvik.system.DexPathList.makeDexElements(DexPathList.java:321)
	        at dalvik.system.DexPathList.makePathElements(DexPathList.java:443)
	        at java.lang.reflect.Method.invoke(Native Method)
	        at com.google.android.play.core.splitcompat.c.b.a(Unknown Source:24)
	        at com.google.android.play.core.splitcompat.b.i.b(Unknown Source:14)
	        at com.google.android.play.core.splitcompat.b.i.a(Unknown Source:0)
	        at com.google.android.play.core.splitcompat.b.j.a(Unknown Source:0)
	        at com.google.android.play.core.splitcompat.b.c.a(Unknown Source:121)
	        		... 12 more
	2018-07-26 18:48:50.077 15788-15788/? D/dynamic-test: [ResolveInfo{4219d12 com.demo.dynamicfeatures/.DynamicFeatureActivity m=0x0}]
	2018-07-26 18:48:50.078 899-11333/? I/ActivityManager: START u0 {act=android.intent.action.VIEW cmp=com.demo.dynamicfeatures/.DynamicFeatureActivity} from uid 10232
	2018-07-26 18:48:50.121 15788-15788/? E/dynamicfeature: No package ID 7e found for ID 0x7e030000.
	2018-07-26 18:48:50.121 15788-15788/? E/AndroidRuntime: FATAL EXCEPTION: main
	    Process: com.demo.dynamicfeatures, PID: 15788
	    java.lang.RuntimeException: Unable to start activity ComponentInfo{com.demo.dynamicfeatures/com.demo.dynamicfeatures.DynamicFeatureActivity}: android.content.res.Resources$NotFoundException: Resource ID #0x7e030000
	        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2913)
	        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3048)
	        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78)
	        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
	        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
	        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1808)
	        at android.os.Handler.dispatchMessage(Handler.java:106)
	        at android.os.Looper.loop(Looper.java:193)
	        at android.app.ActivityThread.main(ActivityThread.java:6669)
	        at java.lang.reflect.Method.invoke(Native Method)
	        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493)
	        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858)
	     Caused by: android.content.res.Resources$NotFoundException: Resource ID #0x7e030000
	        at android.content.res.ResourcesImpl.getValue(ResourcesImpl.java:216)
	        at android.content.res.Resources.loadXmlResourceParser(Resources.java:2155)
	        at android.content.res.Resources.getLayout(Resources.java:1155)
	        at android.view.LayoutInflater.inflate(LayoutInflater.java:421)
	        at android.view.LayoutInflater.inflate(LayoutInflater.java:374)
	        at android.support.v7.app.AppCompatDelegateImplV9.setContentView(AppCompatDelegateImplV9.java:287)
	        at android.support.v7.app.AppCompatActivity.setContentView(AppCompatActivity.java:139)
	        at com.demo.dynamicfeatures.DynamicFeatureActivity.onCreate(DynamicFeatureActivity.java:21)
	        at android.app.Activity.performCreate(Activity.java:7136)
	        at android.app.Activity.performCreate(Activity.java:7127)
	        at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1271)
	        at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2893)
	        at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3048) 
	        at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:78) 
	        at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108) 
	        at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68) 
	        at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1808) 
	        at android.os.Handler.dispatchMessage(Handler.java:106) 
	        at android.os.Looper.loop(Looper.java:193) 
	        at android.app.ActivityThread.main(ActivityThread.java:6669) 
	        at java.lang.reflect.Method.invoke(Native Method) 
	        at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:493) 
	        at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:858) 
	```

3. getResource.getIdentifier() may not work in submodule. I think it is due to resource not in context. 

4. Be careful to manage resource name for avoiding resource name conflict, you can add prefix limit in build.gradle.

### 其他需要注意的地方

1. 用户第一次下载时会只下载 base module，当用户下载过几次 feature module 后，之后重新下载会将之前下载过的 module 一起下载（测试不是很方便）。

	**Clear all data** of Google Play probably result in only downloading base app module next time。

2. We should restart app to use module. Details see [https://developer.android.com/guide/app-bundle/playcore#access_downloaded_modules](https://developer.android.com/guide/app-bundle/playcore#access_downloaded_modules)

3. The app base.apk is in `data/app/packageName`

	Downloaded split-feature.apk is in `data/user/0/packageName/files/splitcompat/versionCode/verifiled-splits`

	We can try loading apk dynamically using DexClassLoader

	![1532666235048.png](https://i.loli.net/2018/07/27/5b5ab7670f371.png)

## Build a demo

### 场景

demo 只包含两个 Activity，MainActivity 和 DynamicFeatureActivity。两个 Activity 分别位于不同的 module中，MainActivity 仅包含一行字和两个 button，点击 button 可以 load module 或打开 DynamicFeatureActivity if module is loaded，里面会展示几幅图片。

要实现的是，用户在 first install 的时候只 install base module，而另一个包含 DynamicFeatureActivity 和图片资源的 module 在用户点击 button 之后才会被下载和安装。

### 流程

1. 先新建一个 app，只包含一个 MainActivity，只有一行字和两个 button。

	![1532064279798](https://i.loli.net/2018/07/26/5b59b6a337b7a.png)

2. Follow steps in the document: [Create a dynamic feature module](https://developer.android.com/guide/app-bundle/configure#dynamic_feature_modules) 

	![1532064609424](https://i.loli.net/2018/07/26/5b59b6f5034c0.png)

	可以选择更改 Module title.

	![1532064799392](https://i.loli.net/2018/07/26/5b59b720634ec.png)

	为了更明确地看到效果，我在此 module 中存了 1.5 MB 的图片，而 Base Apk 仅有1 MB。

	![1532440588833](https://i.loli.net/2018/07/26/5b59b73c56afe.png)

3. 在 MainActivity 中，设置 button onClickListener，使点击后能自动下载 module 并展示 DynamicFeatureActivity。

	```java
	private SplitInstallManager manager = SplitInstallManagerFactory.create(this);
	
	if (manager.getInstalledModules().contains(name)) {
	    updateProgressMessage("Already installed");
	    onSuccessfulLoad(name, true);
	    return;
	}
	
	SplitInstallRequest request = SplitInstallRequest.newBuilder()
	    .addModule(name)
	    .build();
	
	manager.startInstall(request);
	```

	其中需要我们将其他 module 的信息保存成 String，通过 Intent.setClassName(String, String) 来解决依赖问题。**packageName is equal to applicationId in build.gradle**

	```java
	private final String moduleName = "dynamicFeature";
	private final String packageName = "com.demo.dynamicfeatures"; // equal to applicationId
	private final String dynamicFeatureActivity = "com.demo.dynamicfeatures.DynamicFeatureActivity";
	```

	Enable SplitInstallManager, SplitInstallRequest, SplitInstallManagerFactory 需要在 Base Module 的 `build.gradle` 中添加

	```java
	implementation 'com.google.android.play:core:1.3.1'
	```

1. Generate bundle 并发布到 play store 上面

	![1532074902195](https://i.loli.net/2018/07/26/5b59b769ba6d5.png)