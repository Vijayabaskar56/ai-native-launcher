package expo.modules.launcherkit

import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Coded
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

class LauncherKitException(message: String, cause: Throwable? = null) : Coded {
  override val code: String = "ERR_LAUNCHER_KIT"
  override val message: String = message
  override val cause: Throwable? = cause
}
