package com.ambulancedriverapp

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DriverLocationModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "DriverLocationService"

  @ReactMethod
  fun start(driverDocId: String, promise: Promise) {
    try {
      val intent = Intent(reactContext, DriverLocationService::class.java).apply {
        action = DriverLocationService.ACTION_START
        putExtra(DriverLocationService.EXTRA_DRIVER_DOC_ID, driverDocId)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(intent)
      } else {
        reactContext.startService(intent)
      }

      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("TRACKING_START_FAILED", e)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      val intent = Intent(reactContext, DriverLocationService::class.java).apply {
        action = DriverLocationService.ACTION_STOP
      }
      reactContext.startService(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("TRACKING_STOP_FAILED", e)
    }
  }
}
