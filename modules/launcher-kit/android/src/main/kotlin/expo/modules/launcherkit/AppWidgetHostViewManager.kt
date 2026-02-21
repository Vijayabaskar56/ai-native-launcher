package expo.modules.launcherkit

import android.appwidget.AppWidgetHostView
import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.util.SizeF
import android.view.View
import android.view.ViewGroup
import android.widget.ListView
import android.widget.ScrollView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.views.ExpoView

class AppWidgetHostViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppWidgetHostView")

    View(AppWidgetHostContainer::class) {
      Prop("appWidgetId") { view: AppWidgetHostContainer, id: Int ->
        view.setWidgetId(id)
      }

      Prop("widgetWidth") { view: AppWidgetHostContainer, width: Int ->
        view.setRequestedWidth(width)
      }

      Prop("widgetHeight") { view: AppWidgetHostContainer, height: Int ->
        view.setRequestedHeight(height)
      }
    }
  }
}

class AppWidgetHostContainer(
  context: Context,
  appContext: AppContext
) : ExpoView(context, appContext) {

  override val shouldUseAndroidLayout: Boolean = true

  private var currentWidgetId: Int = -1
  private var hostView: AppWidgetHostView? = null
  private var requestedWidth: Int = ViewGroup.LayoutParams.MATCH_PARENT
  private var requestedHeight: Int = ViewGroup.LayoutParams.WRAP_CONTENT
  private var lastWidthDp: Int = -1
  private var lastHeightDp: Int = -1

  fun setRequestedWidth(width: Int) {
    requestedWidth = toLayoutPixels(width)
    hostView?.layoutParams = LayoutParams(requestedWidth, requestedHeight)
    hostView?.requestLayout()
    updateWidgetSize()
  }

  fun setRequestedHeight(height: Int) {
    requestedHeight = toLayoutPixels(height)
    hostView?.layoutParams = LayoutParams(requestedWidth, requestedHeight)
    hostView?.requestLayout()
    updateWidgetSize()
  }

  fun setWidgetId(widgetId: Int) {
    if (widgetId == currentWidgetId) return
    currentWidgetId = widgetId
    lastWidthDp = -1
    lastHeightDp = -1

    hostView?.let { removeView(it) }
    hostView = null

    if (widgetId < 0) return

    try {
      val host = AppWidgetHostModule.getSharedHost(context)
      host.startListening()
      val manager = AppWidgetManager.getInstance(context)
      val providerInfo = manager.getAppWidgetInfo(widgetId) ?: return

      val view = host.createView(context, widgetId, providerInfo)
      view.setAppWidget(widgetId, providerInfo)
      enableNestedScroll(view)

      view.setOnTouchListener { v, _ ->
        v.parent?.requestDisallowInterceptTouchEvent(true)
        false
      }

      val params = LayoutParams(requestedWidth, requestedHeight)
      addView(view, params)
      hostView = view
      post { updateWidgetSize() }
    } catch (_: Exception) {
      // Widget may have been deleted or provider crashed
    }
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    if (changed) {
      updateWidgetSize()
    }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    hostView?.let { removeView(it) }
    hostView = null
  }

  private fun updateWidgetSize() {
    val view = hostView ?: return
    val widthPx = when {
      width > 0 -> width
      requestedWidth > 0 -> requestedWidth
      else -> 0
    }
    val heightPx = when {
      height > 0 -> height
      view.height > 0 -> view.height
      requestedHeight > 0 -> requestedHeight
      else -> 0
    }
    if (widthPx <= 0 || heightPx <= 0) return

    val density = resources.displayMetrics.density
    val widthDp = (widthPx / density).toInt().coerceAtLeast(1)
    val heightDp = (heightPx / density).toInt().coerceAtLeast(1)

    if (widthDp == lastWidthDp && heightDp == lastHeightDp) return

    lastWidthDp = widthDp
    lastHeightDp = heightDp

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        view.updateAppWidgetSize(
          Bundle(),
          arrayListOf(SizeF(widthDp.toFloat(), heightDp.toFloat()))
        )
      } else {
        view.updateAppWidgetSize(null, widthDp, heightDp, widthDp, heightDp)
        // Force refresh on legacy APIs where size callbacks are less reliable.
        view.updateAppWidgetOptions(Bundle())
      }
    } catch (_: Exception) {
      // Some providers throw on rapid size updates.
    }
  }

  private fun toLayoutPixels(size: Int): Int {
    if (size <= 0) return size
    return (size * resources.displayMetrics.density).toInt()
  }

  private fun enableNestedScroll(view: View) {
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        enableNestedScroll(view.getChildAt(i))
      }
    }
    if (view is ListView || view is ScrollView) {
      view.isNestedScrollingEnabled = true
    }
  }
}
