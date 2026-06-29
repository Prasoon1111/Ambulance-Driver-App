package com.ambulancedriverapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class TrackingRestartReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val incomingAction = intent?.action
    val shouldRestart =
      incomingAction == DriverLocationService.ACTION_RESTART ||
        incomingAction == Intent.ACTION_BOOT_COMPLETED ||
        incomingAction == Intent.ACTION_MY_PACKAGE_REPLACED ||
        incomingAction == Intent.ACTION_LOCKED_BOOT_COMPLETED

    if (!shouldRestart) return

    val driverDocId = intent?.getStringExtra(DriverLocationService.EXTRA_DRIVER_DOC_ID)
      ?: context.getSharedPreferences(DriverLocationService.PREFS_NAME, Context.MODE_PRIVATE)
        .getString(DriverLocationService.EXTRA_DRIVER_DOC_ID, null)
      ?: return

    val serviceIntent = Intent(context, DriverLocationService::class.java).apply {
      setAction(DriverLocationService.ACTION_START)
      putExtra(DriverLocationService.EXTRA_DRIVER_DOC_ID, driverDocId)
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent)
    } else {
      context.startService(serviceIntent)
    }
  }
}
