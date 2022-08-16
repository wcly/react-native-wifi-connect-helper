package com.reactnativewificonnecthelper.utils

import android.os.Build
import android.annotation.TargetApi
import android.content.Context
import android.provider.Settings

object LocationUtils {
  /**
   * Determine whether Location is turned on. Below Android M, will always return true.
   *
   * @param context to determine with if location is on
   * @return true if location is turned on or the sdk is below Android M.
   */
  fun isLocationOn(context: Context): Boolean {
    return !isMarshmallowOrLater || isLocationTurnedOn(context)
  }

  /**
   * @return true if the current sdk is above or equal to Android M
   */
  private val isMarshmallowOrLater: Boolean
    get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M

  /**
   * Determine if location is turned on.
   *
   * @param context where from you determine if location is turned on
   * @return true if location is turned on
   */
  @TargetApi(Build.VERSION_CODES.M)
  private fun isLocationTurnedOn(context: Context): Boolean {
    val contentResolver = context.contentResolver
    val mode = Settings.Secure.getInt(
      contentResolver,
      Settings.Secure.LOCATION_MODE,
      Settings.Secure.LOCATION_MODE_OFF
    )
    return mode != Settings.Secure.LOCATION_MODE_OFF
  }
}
