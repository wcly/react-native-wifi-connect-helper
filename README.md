# react-native-wifi-connect-helper

Wifi配网助手，参考了**[react-native-wifi-reborn](https://github.com/JuanSeBestia/react-native-wifi-reborn)**的代码

## 安装

```sh
npm install react-native-wifi-connect-helper
```

或者

```sh
yarn add react-native-wifi-connect-helper
```

### Android

需要在`/android/app/src/main/AndroidManifest.xml`，加入一下权限

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<!-- 连接wifi需要 -->
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
```

### iOS

开启 `Access WIFI Information` 和 `Hotspot Configuration`（连接wifi需要）。

还需要在 `info.plist `加入 `Privacy - Location When In Use Usage Description` 描述。

### 连接（linking）

#### 自动连接 (React Native 60+)

 React Native 60+ 以上会自动连接，无需其它操作 🎉.

#### 通过cli连接(针对React Native 0.59以下版本)

需要手动运行以下命令

```sh
react-native link react-native-wifi-connect-helper
```

#### 手动连接 

##### iOS

1. 打开XCode, 在项目导航器中, 右键 `Libraries` ➜ `Add Files to [your project's name]`
2. 打开 `node_modules` ➜ `react-native-wifi-connect-helper` and add `WifiConnectHelper.xcodeproj`
3. 打开XCode, 在项目导航器中, 选择你的项目. 添加 `libWifiConnectHelper.a` 到你项目的 `Build Phases` 中➜ `Link Binary With Libraries`
4. 运行你的项目 (`Cmd+R`)

##### Android

1. 打开 `android/app/src/main/java/[...]/MainActivity.java`

- 添加 `import com.reactlibrary.reactnativewificonnecthelper.WifiConnectHelperPackage;` 到文件顶部
- 在`getPackages()` 方法中添加 `new WifiConnectHelperPackage()` 到列表中

2. 添加下列代码到 `android/settings.gradle` ：

```gradle
include ':react-native-wifi-connect-helper'
project(':react-native-wifi-connect-helper').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-wifi-connect-helper/android')
```

3. 将下列代码添加到 `android/app/build.gradle` 的 `dependencies`  块中：

```gradle
implementation project(':react-native-wifi-connect-helper')
```

## 使用

```js
import {
  getCurrentWifiSSID,
  connectToProtectedSSID,
} from 'react-native-wifi-connect-helper';

// ...

connectToProtectedSSID(ssid, password, isWep).then(
  () => {
    console.log("连接成功!");
  },
  () => {
    console.log("连接失败!");
  }
);

getCurrentWifiSSID().then(
  ssid => {
    console.log("你当前连接的 wifi ssid 是" + ssid);
  },
  () => {
    console.log("无法获取当前ssid!");
  }
);
```

## 例子

下载项目：

```sh
git clone https://github.com/wcly/react-native-wifi-connect-helper.git
cd react-native-wifi-connect-helper
yarn
yarn example android
yarn example ios
```

打开项目`react-native-wifi-connect-helper`

```sh
cd react-native-wifi-connect-helper
```

安装依赖：

```sh
yarn
```

运行 Android 例子：

```sh
yarn example android
```

运行 iOS 例子：

运行 iOS 例子：

```
yarn example ios
```
## 方法

| 名称                       | 描述                       | 支持的平台   |
| -------------------------- | -------------------------- | ------------ |
| connectToProtectedSSID     | 连接wifi                   | ios, android |
| getCurrentWifiSSID         | 获取当前连接的wifi名称     | ios, android |
| checkIsWifiEnable          | 检查wifi开关是否打开       | ios, android |
| checkIsGPSEnable           | 检查定位服务是否打开       | ios, android |
| connectToSSID              | 连接到开放的wifi           | ios          |
| connectToProtectedSSIDOnce | 连接到wifi，只连一次       | ios          |
| loadWifiList               | 获取wifi列表               | android      |
| getCurrentSignalStrength   | 获取当前连接的wifi信号强度 | android      |
| setEnabled                 | 设置wifi开关               | android      |
| openGPSSetting             | 跳转到定位服务设置页面     | android      |
| openWifiSetting            | 跳转到wifi设置页面         | android      |
| open                       | 跳转到任意页面             | android      |

## 贡献

请参阅 [贡献指南](CONTRIBUTING.md) 以了解如何为库和开发工作流程做出贡献

## 许可

MIT
