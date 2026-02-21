package expo.modules.launcherkit

import android.app.Activity
import android.appwidget.AppWidgetHost
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProviderInfo
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.content.pm.LauncherApps
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppWidgetHostModule : Module() {

  companion object {
    private const val HOST_ID = 1024
    private const val REQUEST_BIND_APPWIDGET = 2001
    private const val REQUEST_CONFIGURE_APPWIDGET = 2002

    private var widgetHost: AppWidgetHost? = null
    private var pendingBindPromise: Promise? = null
    private var pendingConfigurePromise: Promise? = null
    private var pendingBindWidgetId: Int = -1
    private var pendingConfigureWidgetId: Int = -1

    fun getSharedHost(context: Context): AppWidgetHost {
      if (widgetHost == null) {
        widgetHost = AppWidgetHost(context.applicationContext, HOST_ID)
      }
      return widgetHost!!
    }
  }

  private fun getHost(): AppWidgetHost {
    return getSharedHost(appContext!!.reactContext!!)
  }

  private fun getManager(): AppWidgetManager {
    return AppWidgetManager.getInstance(appContext!!.reactContext!!)
  }

  override fun definition() = ModuleDefinition {
    Name("AppWidgetHostModule")

    OnActivityEntersForeground {
      try {
        widgetHost?.startListening()
      } catch (e: Exception) {
        // TransactionTooLargeException — let widgets populate on bind instead
      }
    }

    OnActivityEntersBackground {
      try {
        widgetHost?.stopListening()
      } catch (_: Exception) {}
    }

    OnActivityResult { _, payload ->
      val requestCode = payload.requestCode
      val resultCode = payload.resultCode

      when (requestCode) {
        REQUEST_BIND_APPWIDGET -> {
          val promise = pendingBindPromise
          val widgetId = pendingBindWidgetId
          pendingBindPromise = null
          pendingBindWidgetId = -1

          if (promise == null || widgetId < 0) return@OnActivityResult

          if (resultCode == Activity.RESULT_OK) {
            try {
              launchConfigureIfNeeded(widgetId, promise)
            } catch (e: Exception) {
              getHost().deleteAppWidgetId(widgetId)
              promise.reject(LauncherKitException("Failed to configure widget: ${e.message}", e))
            }
          } else {
            getHost().deleteAppWidgetId(widgetId)
            promise.reject(LauncherKitException("User denied widget binding"))
          }
        }
        REQUEST_CONFIGURE_APPWIDGET -> {
          val promise = pendingConfigurePromise
          val widgetId = pendingConfigureWidgetId
          pendingConfigurePromise = null
          pendingConfigureWidgetId = -1

          if (promise == null || widgetId < 0) return@OnActivityResult

          if (resultCode == Activity.RESULT_OK) {
            promise.resolve(widgetId)
          } else {
            getHost().deleteAppWidgetId(widgetId)
            promise.reject(LauncherKitException("Widget configuration cancelled"))
          }
        }
      }
    }

    AsyncFunction("getInstalledWidgetProviders") { promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val manager = getManager()
        val launcherApps = context.getSystemService(LauncherApps::class.java)
        val providers = mutableListOf<AppWidgetProviderInfo>()

        if (launcherApps != null) {
          launcherApps.profiles.forEach { profile ->
            providers.addAll(manager.getInstalledProvidersForProfile(profile))
          }
        } else {
          providers.addAll(manager.installedProviders)
        }

        val visibleProviders = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          providers.filter {
            it.widgetFeatures and AppWidgetProviderInfo.WIDGET_FEATURE_HIDE_FROM_PICKER == 0
          }
        } else {
          providers
        }

        val result = visibleProviders
          .distinctBy { it.provider.flattenToString() }
          .map { info ->
          mapOf(
            "provider" to info.provider.flattenToString(),
            "packageName" to info.provider.packageName,
            "className" to info.provider.className,
            "label" to info.loadLabel(context.packageManager).toString(),
            "minWidth" to info.minWidth,
            "minHeight" to info.minHeight,
            "resizeMode" to info.resizeMode,
            "configure" to (info.configure?.flattenToString() ?: ""),
          )
          }

        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to get widget providers: ${e.message}", e))
      }
    }

    AsyncFunction("allocateAndBindWidget") { providerStr: String, promise: Promise ->
      try {
        val host = getHost()
        val manager = getManager()
        host.startListening()
        val widgetId = host.allocateAppWidgetId()
        val provider = ComponentName.unflattenFromString(providerStr)
          ?: throw LauncherKitException("Invalid provider: $providerStr")

        val bound = manager.bindAppWidgetIdIfAllowed(widgetId, provider)
        if (bound) {
          launchConfigureIfNeeded(widgetId, promise)
        } else {
          // Need to ask user permission
          pendingBindPromise = promise
          pendingBindWidgetId = widgetId
          val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_BIND).apply {
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_PROVIDER, provider)
          }
          appContext!!.currentActivity!!.startActivityForResult(intent, REQUEST_BIND_APPWIDGET)
        }
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to allocate widget: ${e.message}", e))
      }
    }

    AsyncFunction("deleteWidget") { widgetId: Int, promise: Promise ->
      try {
        getHost().deleteAppWidgetId(widgetId)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to delete widget: ${e.message}", e))
      }
    }

    AsyncFunction("startListening") { promise: Promise ->
      try {
        getHost().startListening()
        promise.resolve(null)
      } catch (e: Exception) {
        // TransactionTooLargeException
        promise.resolve(null)
      }
    }

    AsyncFunction("stopListening") { promise: Promise ->
      try {
        widgetHost?.stopListening()
        promise.resolve(null)
      } catch (_: Exception) {
        promise.resolve(null)
      }
    }

    OnDestroy {
      try {
        widgetHost?.stopListening()
      } catch (_: Exception) {}
      widgetHost = null
    }
  }

  private fun launchConfigureIfNeeded(widgetId: Int, promise: Promise) {
    val manager = getManager()
    val host = getHost()
    val providerInfo = manager.getAppWidgetInfo(widgetId)

    if (providerInfo?.configure != null) {
      val activity = appContext?.currentActivity
        ?: throw LauncherKitException("No active activity for widget configuration")
      pendingConfigurePromise = promise
      pendingConfigureWidgetId = widgetId
      host.startAppWidgetConfigureActivityForResult(
        activity,
        widgetId,
        0,
        REQUEST_CONFIGURE_APPWIDGET,
        null
      )
      return
    }

    promise.resolve(widgetId)
  }
}
