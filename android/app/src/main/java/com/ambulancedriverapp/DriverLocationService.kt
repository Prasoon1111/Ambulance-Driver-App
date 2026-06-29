package com.ambulancedriverapp

import android.Manifest
import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore

class DriverLocationService : Service() {
  private lateinit var fusedClient: FusedLocationProviderClient
  private var driverDocId: String? = null

  private val locationCallback =
    object : LocationCallback() {
      override fun onLocationResult(result: LocationResult) {
        val id = driverDocId ?: return
        val location = result.lastLocation ?: return

        FirebaseFirestore.getInstance()
          .collection("drivers")
          .document(id)
          .update(
            mapOf(
              "location" to mapOf(
                "latitude" to location.latitude,
                "longitude" to location.longitude,
                "accuracy" to location.accuracy,
                "updatedAt" to Timestamp.now(),
                "source" to "android_foreground_service"
              )
            )
          )
      }
    }

  override fun onCreate() {
    super.onCreate()
    fusedClient = LocationServices.getFusedLocationProviderClient(this)
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopTracking()
      stopSelf()
      return START_NOT_STICKY
    }

    driverDocId = intent?.getStringExtra(EXTRA_DRIVER_DOC_ID)
      ?: getSharedPreferences(PREFS_NAME, MODE_PRIVATE).getString(EXTRA_DRIVER_DOC_ID, null)

    driverDocId?.let {
      getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        .edit()
        .putString(EXTRA_DRIVER_DOC_ID, it)
        .apply()
    }

    startForeground(NOTIFICATION_ID, buildNotification())
    startTracking()
    return START_STICKY
  }

  override fun onTaskRemoved(rootIntent: Intent?) {
    scheduleRestart()
    super.onTaskRemoved(rootIntent)
  }

  override fun onDestroy() {
    stopLocationUpdatesOnly()
    if (driverDocId != null) {
      scheduleRestart()
    }
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun startTracking() {
    val fineGranted = ActivityCompat.checkSelfPermission(
      this,
      Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED
    val coarseGranted = ActivityCompat.checkSelfPermission(
      this,
      Manifest.permission.ACCESS_COARSE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED

    if (!fineGranted && !coarseGranted) {
      stopSelf()
      return
    }

    val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
      .setMinUpdateIntervalMillis(3000L)
      .setMinUpdateDistanceMeters(5f)
      .build()

    fusedClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
  }

  private fun stopTracking() {
    stopLocationUpdatesOnly()
    getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
      .edit()
      .remove(EXTRA_DRIVER_DOC_ID)
      .apply()
  }

  private fun stopLocationUpdatesOnly() {
    fusedClient.removeLocationUpdates(locationCallback)
  }

  private fun scheduleRestart() {
    val id = driverDocId
      ?: getSharedPreferences(PREFS_NAME, MODE_PRIVATE).getString(EXTRA_DRIVER_DOC_ID, null)
      ?: return

    val restartIntent = Intent(applicationContext, TrackingRestartReceiver::class.java).apply {
      action = ACTION_RESTART
      putExtra(EXTRA_DRIVER_DOC_ID, id)
    }
    val pendingIntent = PendingIntent.getBroadcast(
      applicationContext,
      RESTART_REQUEST_CODE,
      restartIntent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )
    val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val triggerAt = System.currentTimeMillis() + 1000L

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent)
    } else {
      alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent)
    }
  }

  private fun buildNotification(): Notification {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = PendingIntent.getActivity(
      this,
      0,
      launchIntent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("AmbulanceDriver is tracking your trip")
      .setContentText("Live location is active while you are on duty.")
      .setSmallIcon(android.R.drawable.ic_menu_mylocation)
      .setOngoing(true)
      .setContentIntent(pendingIntent)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      getString(R.string.tracking_channel_name),
      NotificationManager.IMPORTANCE_HIGH
    )
    getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }

  companion object {
    const val ACTION_START = "com.ambulancedriverapp.START_DRIVER_TRACKING"
    const val ACTION_STOP = "com.ambulancedriverapp.STOP_DRIVER_TRACKING"
    const val ACTION_RESTART = "com.ambulancedriverapp.RESTART_DRIVER_TRACKING"
    const val EXTRA_DRIVER_DOC_ID = "driverDocId"
    const val PREFS_NAME = "driver_location_service"
    private const val CHANNEL_ID = "driver_location_tracking"
    private const val NOTIFICATION_ID = 911
    private const val RESTART_REQUEST_CODE = 912
  }
}
