package expo.modules.launcherkit

import android.content.ComponentName
import android.content.Context
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Build
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.text.TextUtils
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediaSessionModule : Module() {

  companion object {
    private var activeController: MediaController? = null
    private var listener: MediaController.Callback? = null
    private var instance: MediaSessionModule? = null
  }

  override fun definition() = ModuleDefinition {
    Name("MediaSession")

    Events("onMediaSessionChanged")

    AsyncFunction("isNotificationAccessGranted") { promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val enabled = isNotificationListenerEnabled(context)
        promise.resolve(enabled)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to check notification access: ${e.message}", e))
      }
    }

    AsyncFunction("openNotificationAccessSettings") { promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val intent = android.content.Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to open settings: ${e.message}", e))
      }
    }

    AsyncFunction("getActiveMediaSession") { promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val mediaData = getActiveMediaData(context)
        promise.resolve(mediaData)
      } catch (e: Exception) {
        promise.resolve(null)
      }
    }

    AsyncFunction("playPause") { promise: Promise ->
      try {
        val controller = activeController
        if (controller != null) {
          val state = controller.playbackState?.state
          if (state == PlaybackState.STATE_PLAYING) {
            controller.transportControls.pause()
          } else {
            controller.transportControls.play()
          }
          promise.resolve(null)
        } else {
          promise.reject(LauncherKitException("No active media session"))
        }
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to toggle playback: ${e.message}", e))
      }
    }

    AsyncFunction("skipNext") { promise: Promise ->
      try {
        activeController?.transportControls?.skipToNext()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to skip: ${e.message}", e))
      }
    }

    AsyncFunction("skipPrevious") { promise: Promise ->
      try {
        activeController?.transportControls?.skipToPrevious()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to skip: ${e.message}", e))
      }
    }

    AsyncFunction("startListening") { promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        if (!isNotificationListenerEnabled(context)) {
          promise.reject(LauncherKitException("Notification access not granted"))
          return@AsyncFunction
        }

        instance = this@MediaSessionModule
        startMediaSessionListening(context)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to start listening: ${e.message}", e))
      }
    }

    OnDestroy {
      cleanupListener()
      instance = null
    }
  }

  private fun isNotificationListenerEnabled(context: Context): Boolean {
    val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
    if (TextUtils.isEmpty(flat)) return false
    val names = flat.split(":")
    val componentName = ComponentName(context, MediaNotificationListener::class.java).flattenToString()
    return names.any { it == componentName }
  }

  private fun startMediaSessionListening(context: Context) {
    try {
      val manager = context.getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
      val componentName = ComponentName(context, MediaNotificationListener::class.java)

      val controllers = manager.getActiveSessions(componentName)
      val controller = controllers.firstOrNull()

      if (controller != null) {
        setupController(controller)
        emitCurrentState(controller)
      }

      manager.addOnActiveSessionsChangedListener({ newControllers ->
        val newController = newControllers?.firstOrNull()
        if (newController != null) {
          setupController(newController)
          emitCurrentState(newController)
        } else {
          cleanupListener()
          sendEvent("onMediaSessionChanged", mapOf(
            "isPlaying" to false,
            "hasSession" to false,
          ))
        }
      }, componentName)
    } catch (e: SecurityException) {
      // Not granted
    }
  }

  private fun setupController(controller: MediaController) {
    cleanupListener()
    activeController = controller

    listener = object : MediaController.Callback() {
      override fun onPlaybackStateChanged(state: PlaybackState?) {
        emitCurrentState(controller)
      }

      override fun onMetadataChanged(metadata: MediaMetadata?) {
        emitCurrentState(controller)
      }
    }

    controller.registerCallback(listener!!)
  }

  private fun cleanupListener() {
    listener?.let { activeController?.unregisterCallback(it) }
    listener = null
    activeController = null
  }

  private fun emitCurrentState(controller: MediaController) {
    val data = extractMediaData(controller)
    sendEvent("onMediaSessionChanged", data)
  }

  private fun getActiveMediaData(context: Context): Map<String, Any?>? {
    val manager = context.getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager

    try {
      val componentName = ComponentName(context, MediaNotificationListener::class.java)
      val controllers = manager.getActiveSessions(componentName)
      val controller = controllers.firstOrNull() ?: return null
      return extractMediaData(controller)
    } catch (e: SecurityException) {
      return null
    }
  }

  private fun extractMediaData(controller: MediaController): Map<String, Any?> {
    val metadata = controller.metadata
    val state = controller.playbackState

    return mapOf(
      "hasSession" to true,
      "title" to (metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: ""),
      "artist" to (metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST) ?: ""),
      "album" to (metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM) ?: ""),
      "isPlaying" to (state?.state == PlaybackState.STATE_PLAYING),
      "duration" to (metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0),
      "position" to (state?.position ?: 0),
      "packageName" to (controller.packageName ?: ""),
    )
  }
}

class MediaNotificationListener : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification?) {}
  override fun onNotificationRemoved(sbn: StatusBarNotification?) {}
}
