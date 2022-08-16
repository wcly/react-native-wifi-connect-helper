package com.reactnativewificonnecthelper.utils

import android.Manifest
import android.os.Build
import android.annotation.TargetApi
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import java.security.InvalidParameterException

/**
 * PermissionUtils to help determine if a particular permission is granted.
 */
object PermissionUtils {
    /**
     * Determine whether  the location permission has been granted (ACCESS_COARSE_LOCATION or
     * ACCESS_FINE_LOCATION). Below Android M, will always return true.
     *
     * @param context to determine with if the permission is granted
     * @return true if you have any location permission or the sdk is below Android M.
     * @throws InvalidParameterException if `context` is null
     */
    @Throws(InvalidParameterException::class)
    fun isLocationPermissionGranted(context: Context): Boolean {
        return (!isMarshmallowOrLater
                || isPermissionGranted(context, Manifest.permission.ACCESS_FINE_LOCATION))
    }

    /**
     * @return true if the current sdk is above or equal to Android M
     */
    private val isMarshmallowOrLater: Boolean
        get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M

    /**
     * Determine whether the provided context has been granted a particular permission.
     *
     * @param context    where from you determine if a permission is granted
     * @param permission you want to determinie if it is granted
     * @return true if you have the permission, or false if not
     */
    @TargetApi(Build.VERSION_CODES.M)
    private fun isPermissionGranted(context: Context, permission: String): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            permission
        ) == PackageManager.PERMISSION_GRANTED
    }
}
