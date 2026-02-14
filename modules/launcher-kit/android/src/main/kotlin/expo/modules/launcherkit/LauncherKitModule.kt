import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import android.content.pm.PackageManager
import android.content.pm.ApplicationInfo
import android.content.pm.ResolveInfo
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Base64
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.content.ActivityNotFoundException
import java.io.ByteArrayOutputStream

@ReactModule(name = LauncherKitModule.NAME)
class LauncherKitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "LauncherKit"
        const val PERMISSION_QUERY_ALL_PACKAGES = "android.permission.QUERY_ALL_PACKAGES"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val apps = getLaunchableApps()
            val result = WritableNativeArray()
            
            for (app in apps) {
                val map = WritableNativeMap()
                map.putString("packageName", app.packageName)
                map.putString("label", app.loadLabel(reactApplicationContext.packageManager).toString())
                map.putString("icon", drawableToBase64(app.loadIcon(reactApplicationContext.packageManager)))
                result.pushMap(map)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCHER_KIT", "Failed to get installed apps: ${e.message}", e)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(null)
            } else {
                promise.reject("ERR_LAUNCHER_KIT", "App not found: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCHER_KIT", "Failed to launch app: ${e.message}", e)
        }
    }

    @ReactMethod
    fun openAppSettings(packageName: String, promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCHER_KIT", "Failed to open app settings: ${e.message}", e)
        }
    }

    @ReactMethod
    fun uninstallApp(packageName: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_DELETE).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCHER_KIT", "Failed to uninstall app: ${e.message}", e)
        }
    }

    @ReactMethod
    fun hasQueryAllPackagesPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val result = reactApplicationContext.checkSelfPermission(PERMISSION_QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
            promise.resolve(result)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestQueryAllPackagesPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val hasPermission = reactApplicationContext.checkSelfPermission(PERMISSION_QUERY_ALL_PACKAGES) == PackageManager.PERMISSION_GRANTED
            if (hasPermission) {
                promise.resolve(true)
            } else {
                promise.reject("ERR_LAUNCHER_KIT", "Permission must be requested from Activity")
            }
        } else {
            promise.resolve(true)
        }
    }

    private fun getLaunchableApps(): List<ApplicationInfo> {
        val pm = reactApplicationContext.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        
        val resolveInfoList: List<ResolveInfo> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
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

    private fun drawableToBase64(drawable: Drawable): String {
        val density = reactApplicationContext.resources.displayMetrics.density
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
