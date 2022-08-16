package com.reactnativewificonnecthelper

import android.annotation.SuppressLint
import android.content.Context
import android.content.Context.LOCATION_SERVICE
import android.content.Context.WIFI_SERVICE
import android.content.Intent
import android.location.LocationManager
import android.net.ConnectivityManager
import android.net.ConnectivityManager.NetworkCallback
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.WifiConfiguration
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.net.wifi.WifiNetworkSpecifier
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.reactnativewificonnecthelper.errors.ConnectErrorCodes
import com.reactnativewificonnecthelper.errors.LoadWifiListErrorCodes
import com.reactnativewificonnecthelper.mappers.WifiScanResultsMapper.mapWifiScanResults
import com.reactnativewificonnecthelper.utils.LocationUtils
import com.reactnativewificonnecthelper.utils.LocationUtils.isLocationOn
import com.reactnativewificonnecthelper.utils.PermissionUtils.isLocationPermissionGranted


class WifiConnectHelperModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {


  private val applicationContext by lazy {
    reactApplicationContext.applicationContext
  }

  private val wifiManager by lazy {
    applicationContext.getSystemService(WIFI_SERVICE) as WifiManager
  }


  companion object {
    const val TAG = "WifiConnectHelper"
  }

  override fun getName(): String {
    return "WifiConnectHelper"
  }

  /**
   * 跳转到gps设置页面
   */
  @ReactMethod
  fun goGPS() {
    go(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
  }

  /**
   * 跳转到wifi设置页面
   */
  @ReactMethod
  fun goWifi() {
    go(Settings.ACTION_WIFI_SETTINGS)
  }

  /**
   * 跳转到一个activity
   */
  @ReactMethod
  fun go(action: String) {
    val intent = Intent(action)
    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
    reactApplicationContext.applicationContext.startActivity(intent)
  }

  /**
   * 检查wifi是否开启
   */
  @ReactMethod
  fun checkIsWifiEnable(promise: Promise) {
    try {
      promise.resolve(wifiManager.isWifiEnabled)
    } catch (e: Throwable) {
      promise.reject("Create Event Error", e)
    }
  }

  /**
   * 检查GPS是否开启
   */
  @ReactMethod
  fun checkIsGPSEnable(promise: Promise) {
    try {
      val locationManager =
        reactApplicationContext.applicationContext.getSystemService(LOCATION_SERVICE) as LocationManager
      Log.e(
        "TAG",
        "checkIsGPSEnable: " + locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
      )
      promise.resolve(locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER))
    } catch (e: Throwable) {
      promise.reject("Create Event Error", e)
    }
  }

  /**
   * 获取当前连接的wifi名称
   * 获取到wifi ssid的三个条件，开启GPS，开启WIFI，开启定位权限
   */
  @ReactMethod
  fun getCurrentWifiSSID(promise: Promise) {
    try {
      val wifiInfo = wifiManager.connectionInfo
      var ssid = wifiInfo.ssid?.trim()

      // 有些厂家会在wifi名称前后加双引号，去掉
      if (ssid?.isNotEmpty() == true) {
        if (ssid[0] == '"' && ssid[ssid.length - 1] == '"') {
          ssid = ssid.substring(1, ssid.length - 1)
        }
      }

      if (ssid == "<unknown ssid>") {
        throw Exception("获取wifi名称失败，请检查定位权限和wif是否开启")
      }

      promise.resolve(ssid)
    } catch (e: Throwable) {
      promise.reject("Create Event Error", e)
    }
  }

  /**
   * 设置wifi启动状态
   */
  @ReactMethod
  fun setEnabled(enabled: Boolean) {
    wifiManager.isWifiEnabled = enabled
  }

  /**
   * 获取当前连接wif的信号强度
   */
  @ReactMethod
  fun getCurrentSignalStrength(promise: Promise) {
    val linkSpeed: Int = wifiManager.connectionInfo.rssi
    promise.resolve(linkSpeed)
  }

  /**
   * 获取wifi列表
   */
  @ReactMethod
  fun loadWifiList(promise: Promise) {
    try {
      val locationPermissionGranted = isLocationPermissionGranted(applicationContext)
      if (!locationPermissionGranted) {
        promise.reject(
          LoadWifiListErrorCodes.locationPermissionMissing.toString(),
          "Location permission (ACCESS_FINE_LOCATION) is not granted"
        )
        return
      }
      val isLocationOn = isLocationOn(applicationContext)
      if (!isLocationOn) {
        promise.reject(
          LoadWifiListErrorCodes.locationServicesOff.toString(),
          "Location service is turned off"
        )
        return
      }

      val scanResults = wifiManager.scanResults
      val results: WritableArray = mapWifiScanResults(scanResults)
      promise.resolve(results)
    } catch (e: Throwable) {
      promise.reject(LoadWifiListErrorCodes.exception.toString(), e.message)
    }
  }

  /**
   * 连接wifi
   * @param SSID wifi名称
   * @param password wifi密码
   */
  @RequiresApi(Build.VERSION_CODES.Q)
  @ReactMethod
  fun connectToProtectedSSID(
    SSID: String,
    password: String,
    promise: Promise
  ) {
    val locationPermissionGranted = isLocationPermissionGranted(applicationContext)
    if (!locationPermissionGranted) {
      promise.reject(
        ConnectErrorCodes.locationPermissionMissing.toString(),
        "Location permission (ACCESS_FINE_LOCATION) is not granted"
      )
      return
    }
    val isLocationOn: Boolean = LocationUtils.isLocationOn(applicationContext)
    if (!isLocationOn) {
      promise.reject(
        ConnectErrorCodes.locationServicesOff.toString(),
        "Location service is turned off"
      )
      return
    }
    if (!wifiManager.isWifiEnabled && !wifiManager.setWifiEnabled(true)) {
      promise.reject(
        ConnectErrorCodes.couldNotEnableWifi.toString(),
        "On Android 10, the user has to enable wifi manually."
      )
      return
    }

    if (isAndroidTenOrLater()) {
      connectAndroidQ(SSID, password, promise);
    } else {
      connectPreAndroidQ(SSID, password, promise);
    }
  }

  @SuppressLint("AnnotateVersionCheck")
  private fun isAndroidTenOrLater(): Boolean {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
  }

  @RequiresApi(api = Build.VERSION_CODES.Q)
  private fun connectAndroidQ(SSID: String, password: String, promise: Promise) {
    val wifiNetworkSpecifier = WifiNetworkSpecifier.Builder()
      .setSsid(SSID)
    if (password.isNotEmpty()) {
      wifiNetworkSpecifier.setWpa2Passphrase(password)
    }
    val request = NetworkRequest.Builder()
      .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
      .setNetworkSpecifier(wifiNetworkSpecifier.build())
      .addCapability(NetworkCapabilities.NET_CAPABILITY_NOT_RESTRICTED)
      .build()
    val connectivityManager =
      applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    val networkCallback: NetworkCallback = object : NetworkCallback() {
      override fun onAvailable(network: Network) {
        super.onAvailable(network)
        connectivityManager.networkPreference = ConnectivityManager.DEFAULT_NETWORK_PREFERENCE
        if (!pollForValidSSID(3, SSID)) {
          promise.reject(
            ConnectErrorCodes.android10ImmediatelyDroppedConnection.toString(),
            "Firmware bugs on OnePlus prevent it from connecting on some firmware versions."
          )
          return
        }
        promise.resolve("connected")
      }

      override fun onUnavailable() {
        super.onUnavailable()
        promise.reject(
          ConnectErrorCodes.userDenied.toString(),
          "On Android 10, the user cancelled connecting (via System UI)."
        )
      }

      override fun onLost(network: Network) {
        super.onLost(network)
        connectivityManager.unregisterNetworkCallback(this)
      }
    }
    connectivityManager.requestNetwork(request, networkCallback)
  }

  private fun connectPreAndroidQ(
    SSID: String,
    password: String,
    promise: Promise
  ) {
    val wifiConfig = WifiConfiguration()
    wifiConfig.SSID = formatWithBackslashes(SSID)
    if (password.isNotEmpty()) {
      stuffWifiConfigurationWithWPA2(wifiConfig, password)
    } else {
      stuffWifiConfigurationWithoutEncryption(wifiConfig)
    }
    val netId: Int = wifiManager.addNetwork(wifiConfig)
    if (netId == -1) {
      promise.reject(
        String.format(
          ConnectErrorCodes.unableToConnect.toString(),
          "Could not add or update network configuration with SSID $SSID"
        )
      )
      return
    }
    if (!wifiManager.enableNetwork(netId, true)) {
      promise.reject(
        ConnectErrorCodes.unableToConnect.toString(),
        "Failed to enable network with $SSID"
      )
      return
    }
    if (!wifiManager.reconnect()) {
      promise.reject(
        ConnectErrorCodes.unableToConnect.toString(),
        "Failed to reconnect with $SSID"
      )
      return
    }
    if (!pollForValidSSID(10, SSID)) {
      promise.reject(
        ConnectErrorCodes.unableToConnect.toString(),
        "Failed to connect with $SSID"
      )
      return
    }
    promise.resolve("connected")
  }

  private fun stuffWifiConfigurationWithWPA2(
    wifiConfiguration: WifiConfiguration,
    password: String
  ) {
    if (password.matches(Regex("[0-9A-Fa-f]{64}"))) {
      wifiConfiguration.preSharedKey = password
    } else {
      wifiConfiguration.preSharedKey = formatWithBackslashes(password)
    }
    wifiConfiguration.allowedProtocols.set(WifiConfiguration.Protocol.RSN)
    wifiConfiguration.allowedProtocols.set(WifiConfiguration.Protocol.WPA)
    wifiConfiguration.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK)
    wifiConfiguration.status = WifiConfiguration.Status.ENABLED
    wifiConfiguration.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP)
    wifiConfiguration.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP)
    wifiConfiguration.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP)
    wifiConfiguration.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP)
  }

  private fun stuffWifiConfigurationWithoutEncryption(wifiConfiguration: WifiConfiguration) {
    wifiConfiguration.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.NONE)
  }

  private fun pollForValidSSID(maxSeconds: Int, expectedSSID: String): Boolean {
    try {
      for (i in 0 until maxSeconds) {
        val ssid = getWifiSSID()
        if (ssid?.equals(expectedSSID, ignoreCase = true) == true) {
          return true
        }
        Thread.sleep(1000)
      }
    } catch (e: InterruptedException) {
      return false
    }
    return false
  }

  private fun getWifiSSID(): String? {
    val info: WifiInfo = wifiManager.connectionInfo

    // This value should be wrapped in double quotes, so we need to unwrap it.
    var ssid = info.ssid
    if (ssid!!.startsWith("\"") && ssid.endsWith("\"")) {
      ssid = ssid.substring(1, ssid.length - 1)
    }

    // Android returns `<unknown ssid>` when it is not connected or still connecting
    if (ssid == "<unknown ssid>") {
      ssid = null
    }
    return ssid
  }

  private fun formatWithBackslashes(value: String): String {
    return String.format("\"%s\"", value)
  }
}
