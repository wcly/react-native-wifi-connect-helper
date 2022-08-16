package com.reactnativewificonnecthelper.mappers

import android.net.wifi.ScanResult
import android.os.Build
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

object WifiScanResultsMapper {
  fun mapWifiScanResults(scanResults: List<ScanResult>): WritableArray {
    val wifiArray: WritableArray = WritableNativeArray()
    for (result in scanResults) {
      val wifiObject: WritableMap = WritableNativeMap()
      if (result.SSID == "") {
        result.SSID = "(hidden SSID)"
      }
      wifiObject.putString("SSID", result.SSID)
      wifiObject.putString("BSSID", result.BSSID)
      wifiObject.putString("capabilities", result.capabilities)
      wifiObject.putInt("frequency", result.frequency)
      wifiObject.putInt("level", result.level)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
        wifiObject.putDouble("timestamp", result.timestamp.toDouble())
      }
      wifiArray.pushMap(wifiObject)
    }
    return wifiArray
  }
}
