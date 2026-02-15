package expo.modules.launcherkit

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.content.pm.ShortcutInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

class LauncherKitModule : Module() {
  
  companion object {
    private const val PERMISSION_QUERY_ALL_PACKAGES = "android.permission.QUERY_ALL_PACKAGES"
  }

  override fun definition() = ModuleDefinition {
    Name("LauncherKit")

    AsyncFunction("getInstalledApps") { promise: Promise ->
      try {
        val apps = getLaunchableApps()
        val result = apps.map { app ->
          mapOf(
            "packageName" to app.packageName,
            "label" to app.loadLabel(appContext!!.reactContext!!.packageManager).toString(),
            "icon" to drawableToBase64(app.loadIcon(appContext!!.reactContext!!.packageManager))
          )
        }
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to get installed apps: ${e.message}", e))
      }
    }

    AsyncFunction("launchApp") { packageName: String, promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          context.startActivity(intent)
          promise.resolve(null)
        } else {
          promise.reject(LauncherKitException("App not found: $packageName"))
        }
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to launch app: ${e.message}", e))
      }
    }

    AsyncFunction("openAppSettings") { packageName: String, promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
          data = Uri.parse("package:$packageName")
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to open app settings: ${e.message}", e))
      }
    }

    AsyncFunction("uninstallApp") { packageName: String, promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val intent = Intent(Intent.ACTION_DELETE).apply {
          data = Uri.parse("package:$packageName")
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to uninstall app: ${e.message}", e))
      }
    }

    AsyncFunction("hasQueryAllPackagesPermission") { promise: Promise ->
      val context = appContext!!.reactContext!!
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val result = context.checkSelfPermission(PERMISSION_QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
        promise.resolve(result)
      } else {
        promise.resolve(true)
      }
    }

    AsyncFunction("requestQueryAllPackagesPermission") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val context = appContext!!.reactContext!!
        val hasPermission = context.checkSelfPermission(PERMISSION_QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
        if (hasPermission) {
          promise.resolve(true)
        } else {
          promise.reject(LauncherKitException("Permission must be requested from Activity"))
        }
      } else {
        promise.resolve(true)
      }
    }

    AsyncFunction("getAppShortcuts") { packageName: String, promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as LauncherApps

        if (!launcherApps.hasShortcutHostPermission()) {
          promise.resolve(emptyList<Map<String, String>>())
          return@AsyncFunction
        }

        val query = LauncherApps.ShortcutQuery().apply {
          setQueryFlags(
            LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST or
            LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC or
            LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED
          )
          setPackage(packageName)
        }

        val shortcuts: List<ShortcutInfo>? = try {
          launcherApps.getShortcuts(query, Process.myUserHandle())
        } catch (e: SecurityException) {
          null
        }

        val result: List<Map<String, String>> = if (shortcuts != null) {
          shortcuts.map { shortcut ->
            val iconDrawable = try {
              launcherApps.getShortcutIconDrawable(shortcut, context.resources.displayMetrics.densityDpi)
            } catch (e: Exception) {
              null
            }
            val iconBase64 = iconDrawable?.let { drawableToBase64(it) } ?: ""
            
            mapOf(
              "id" to shortcut.id,
              "packageName" to shortcut.`package`,
              "shortLabel" to (shortcut.shortLabel?.toString() ?: ""),
              "longLabel" to (shortcut.longLabel?.toString() ?: ""),
              "icon" to iconBase64
            )
          }
        } else {
          emptyList()
        }

        promise.resolve(result)
      } catch (e: Exception) {
        promise.resolve(emptyList<Map<String, String>>())
      }
    }

    AsyncFunction("launchShortcut") { packageName: String, shortcutId: String, promise: Promise ->
      try {
        val context = appContext!!.reactContext!!
        val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as LauncherApps

        if (!launcherApps.hasShortcutHostPermission()) {
          promise.reject(LauncherKitException("No shortcut permission - set as default launcher"))
          return@AsyncFunction
        }

        val query = LauncherApps.ShortcutQuery().apply {
          setQueryFlags(
            LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST or
            LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC or
            LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED
          )
          setPackage(packageName)
        }

        val shortcuts = try {
          launcherApps.getShortcuts(query, Process.myUserHandle())
        } catch (e: SecurityException) {
          null
        }
        val shortcut = shortcuts?.find { it.id == shortcutId }

        if (shortcut != null) {
          launcherApps.startShortcut(shortcut, null, null)
          promise.resolve(null)
        } else {
          promise.reject(LauncherKitException("Shortcut not found: $shortcutId"))
        }
      } catch (e: Exception) {
        promise.reject(LauncherKitException("Failed to launch shortcut: ${e.message}", e))
      }
    }
  }

  private fun getLaunchableApps(): List<android.content.pm.ApplicationInfo> {
    val context = appContext!!.reactContext!!
    val pm = context.packageManager
    val intent = Intent(Intent.ACTION_MAIN, null).apply {
      addCategory(Intent.CATEGORY_LAUNCHER)
    }

    val resolveInfoList = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      pm.queryIntentActivities(intent, PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL.toLong()))
    } else {
      @Suppress("DEPRECATION")
      pm.queryIntentActivities(intent, PackageManager.MATCH_ALL)
    }

    val packageNames = resolveInfoList.map { it.activityInfo.packageName }.toSet()

    return pm.getInstalledApplications(PackageManager.GET_META_DATA)
      .filter { it.packageName in packageNames }
      .sortedBy { it.loadLabel(pm).toString().lowercase() }
  }

  private fun drawableToBase64(drawable: android.graphics.drawable.Drawable): String {
    val context = appContext!!.reactContext!!
    val density = context.resources.displayMetrics.density
    val size = (48 * density).toInt()
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.width, canvas.height)
    drawable.draw(canvas)

    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
    return Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
  }
}

class LauncherKitException(message: String, cause: Throwable? = null) : CodedException(
  code = "ERR_LAUNCHER_KIT",
  message = message,
  cause = cause
)
