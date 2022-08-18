import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-wifi-connect-helper' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const WifiConnectHelper = NativeModules.WifiConnectHelper
  ? NativeModules.WifiConnectHelper
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const IS_IOS = Platform.OS === 'ios';

export enum IS_REMOVE_WIFI_NETWORK_ERRORS {
  /**
   * Starting android 6, location permission needs to be granted for wifi scanning.
   */
  locationPermissionMissing = 'locationPermissionMissing',
  couldNotGetWifiManager = 'couldNotGetWifiManager',
  couldNotGetConnectivityManager = 'couldNotGetConnectivityManager',
}

export enum LOAD_WIFI_LIST_ERRORS {
  /**
   * Starting android 6, location permission needs to be granted for wifi scanning.
   */
  locationPermissionMissing = 'locationPermissionMissing',
  /**
   * Starting Android 6, location services needs to be on to scan for wifi networks.
   */
  locationServicesOff = 'locationServicesOff',
  /**
   * Json parsing exception while parsing the result.
   */
  jsonParsingException = 'jsonParsingException',
  /**
   * An exception caused by JS requesting the UI manager to perform an illegal view operation.
   */
  illegalViewOperationException = 'illegalViewOperationException',
}

export enum CONNECT_ERRORS {
  /**
   * Starting from iOS 11, NEHotspotConfigurationError is available
   */
  unavailableForOSVersion = 'unavailableForOSVersion',
  /**
   * If an unknown error is occurred (iOS)
   */
  invalid = 'invalid',
  /**
   * If the SSID is invalid
   */
  invalidSSID = 'invalidSSID',
  /**
   * If the SSID prefix is invalid
   */
  invalidSSIDPrefix = 'invalidSSIDPrefix',
  /**
   * If the passphrase is invalid
   */
  invalidPassphrase = 'invalidPassphrase',
  /**
   * If the user canceled the request to join the asked network
   */
  userDenied = 'userDenied',
  /**
   * Starting from iOS 13, location permission is denied (iOS)
   */
  locationPermissionDenied = 'locationPermissionDenied',
  /**
   * When an unknown error occurred
   */
  unableToConnect = 'unableToConnect',
  /**
   * Starting from iOS 13, location permission is restricted (iOS)
   */
  locationPermissionRestricted = 'locationPermissionRestricted',
  /**
   * Starting android 6, location permission needs to be granted for wifi scanning.
   */
  locationPermissionMissing = 'locationPermissionMissing',
  /**
   * Starting Android 6, location services needs to be on to scan for wifi networks.
   */
  locationServicesOff = 'locationServicesOff',
  /**
   * Starting Android 10, apps are no longer allowed to enable wifi.
   * User has to manually do this.
   */
  couldNotEnableWifi = 'couldNotEnableWifi',
  /**
   * Starting Android 9, it's only allowed to scan 4 times per 2 minuts in a foreground app.
   * https://developer.android.com/guide/topics/connectivity/wifi-scan
   */
  couldNotScan = 'couldNotScan',
  /**
   * If the SSID couldn't be detected
   */
  couldNotDetectSSID = 'couldNotDetectSSID',
  /**
   * If the wifi network is not in range, the security type is unknown and WifiUtils doesn't support
   * connecting to the network.
   */
  didNotFindNetwork = 'didNotFindNetwork',
  /**
   * Authentication error occurred while trying to connect.
   * The password could be incorrect or the user could have a saved network configuration with a
   * different password!
   */
  authenticationErrorOccurred = 'authenticationErrorOccurred',
  /**
   * Firmware bugs on OnePlus prevent it from connecting on some firmware versions.
   * More info: https://github.com/ThanosFisherman/WifiUtils/issues/63
   */
  android10ImmediatelyDroppedConnection = 'android10ImmediatelyDroppedConnection',
  /**
   * Could not connect in the timeout window.
   */
  timeoutOccurred = 'timeoutOccurred',
}

/**
 * 跳转到指定activity
 * @param action
 * @returns
 */
export const open = (action: string) => WifiConnectHelper?.open(action);

/**
 * 跳转到gps设置页面
 * @returns
 */
export const openGPSSetting = () =>
  open('android.settings.LOCATION_SOURCE_SETTINGS');

/**
 * 跳转到wifi设置页面
 * @returns
 */
export const openWifiSetting = () => open('android.settings.WIFI_SETTINGS');

/**
 * 检查wifi是否开启
 * @returns
 */
export const checkIsWifiEnable = (): Promise<boolean> =>
  WifiConnectHelper.checkIsWifiEnable?.();

/**
 * 检查GPS是否开启
 * @returns
 */
export const checkIsGPSEnable = (): Promise<boolean> =>
  WifiConnectHelper.checkIsGPSEnable?.();

/**
 * 返回当前连接的wifi名称
 */
export const getCurrentWifiSSID = (): Promise<string> =>
  WifiConnectHelper?.getCurrentWifiSSID?.();

/**
 * 设置wifi开关状态
 * @param enabled
 * @returns
 */
export const setEnabled = (enabled: boolean): void =>
  WifiConnectHelper.setEnabled?.(enabled);

/**
 * 获取当前连接wifi的信号强度
 * @returns
 */
export const getCurrentSignalStrength = (): Promise<number> =>
  WifiConnectHelper.getCurrentSignalStrength?.();

export interface WifiEntry {
  SSID: string;
  BSSID: string;
  capabilities: string;
  frequency: number;
  level: number;
  timestamp: number;
}
export const loadWifiList = (): Promise<WifiEntry[]> =>
  WifiConnectHelper.loadWifiList?.();

/**
 * 连接到指定wifi
 * @param SSID
 * @param password
 * @param isWEP
 * @param joinOnce
 * @returns
 */
export const connectToProtectedSSIDOnce = (
  SSID: string,
  password: string,
  isWEP: boolean,
  joinOnce: boolean
): Promise<void> =>
  WifiConnectHelper.connectToProtectedSSIDOnce?.(
    SSID,
    password,
    isWEP,
    joinOnce
  );

/**
 * 连接到指定wifi
 *
 * @param SSID Wifi 名称.
 * @param password 开放的wifi填null
 * @param isWep Used on iOS. If `true`, the network is WEP Wi-Fi; otherwise it is a WPA or WPA2 personal Wi-Fi network.
 */
export const connectToProtectedSSID = (
  SSID: string,
  password: string,
  isWEP: boolean = false
): Promise<void> =>
  IS_IOS
    ? connectToProtectedSSIDOnce?.(SSID, password, isWEP, false)
    : WifiConnectHelper.connectToProtectedSSID?.(SSID, password, isWEP);

/**
 * 连接到指定wifi
 *
 * @param SSID Wifi 名称.
 */
export const connectToSSID = (SSID: string): Promise<void> =>
  connectToProtectedSSID?.(SSID, '', false);
