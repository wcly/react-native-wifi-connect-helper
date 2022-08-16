declare module 'react-native-wifi-connect-helper' {
  export type WiFiObject = {
    SSID: string;
    BSSID: string;
    capabilities: string;
    frequency: number;
    level: number;
    timestamp: number;
  };

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
   * Connects to a WiFi network. Rejects with an error if it couldn't connect.
   *
   * @param SSID Wifi name.
   * @param password `null` for open networks.
   * @param isWep Used on iOS. If `true`, the network is WEP Wi-Fi; otherwise it is a WPA or WPA2 personal Wi-Fi network.
   */
  export function connectToProtectedSSID(
    SSID: string,
    password: string | null,
    isWEP?: boolean
  ): Promise<void>;

  export enum GET_CURRENT_WIFI_SSID_ERRRORS {
    CouldNotDetectSSID = 'CouldNotDetectSSID',
  }

  /**
   * Returns the name of the currently connected WiFi. When not connected, the promise will be or null when not connected.
   */
  export function getCurrentWifiSSID(): Promise<string>;

  //#region iOS only

  export function connectToSSID(SSID: string): Promise<void>;
  export function connectToSSIDPrefix(SSIDPrefix: string): Promise<void>;
  export function disconnectFromSSID(SSIDPrefix: string): Promise<void>;
  /**
   * Connects to a WiFi network. Rejects with an error if it couldn't connect.
   *
   * @param SSID Wifi name.
   * @param password `null` for open networks.
   * @param isWep Used on iOS. If `true`, the network is WEP Wi-Fi; otherwise it is a WPA or WPA2 personal Wi-Fi network.
   * @param joinOnce Used on iOS. If `true`, restricts the lifetime of a configuration to the operating status of the app that created it.
   */
  export function connectToProtectedSSIDOnce(
    SSID: string,
    password: string | null,
    isWEP: boolean,
    joinOnce: boolean
  ): Promise<void>;
  export function connectToProtectedSSIDPrefix(
    SSIDPrefix: string,
    password: string,
    isWEP: boolean
  ): Promise<void>;

  //#endregion

  //#region Android only

  export interface WifiEntry {
    SSID: string;
    BSSID: string;
    capabilities: string;
    frequency: number;
    level: number;
    timestamp: number;
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

  /**
   * 跳转到某个页面
   */
  export function go(action: string);

  /**
   * 跳转到gps设置页面
   */
  export function goGPS();

  /**
   * 跳转到wifi设置页面
   */
  export function goWifi();

  /**
   * Returns a list of nearby WiFI networks.
   */
  export function loadWifiList(): Promise<Array<WifiEntry>>;

  /**
   * Method to check if wifi is enabled.
   */
  export function checkIsWifiEnable(): Promise<boolean>;

  /**
   * 检查GPS是否开启
   */
  export function checkIsGPSEnable(): Promise<boolean>;

  export function setEnabled(enabled: boolean): void;

  /**
   * Returns the RSSI (received signal strength indicator) of the currently connected WiFi network.
   */
  export function getCurrentSignalStrength(): Promise<number>;

  export enum IS_REMOVE_WIFI_NETWORK_ERRORS {
    /**
     * Starting android 6, location permission needs to be granted for wifi scanning.
     */
    locationPermissionMissing = 'locationPermissionMissing',
    couldNotGetWifiManager = 'couldNotGetWifiManager',
    couldNotGetConnectivityManager = 'couldNotGetConnectivityManager',
  }

  //#endregion
}
