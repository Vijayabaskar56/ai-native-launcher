import { Component, type ReactNode } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { AppWidgetHostView as AppWidgetHostViewBase } from '@/modules/launcher-kit/src';
import { parseWidgetConfig } from '@/core/types/widget-types';
import type { AppWidgetConfig } from '@/core/types/widget-types';
import type { Widget } from '@/db/schema/widgets';

const AppWidgetHostView = AppWidgetHostViewBase as React.ComponentType<{
  appWidgetId: number;
  widgetWidth: number;
  widgetHeight: number;
  style?: any;
}> | null;

const isViewAvailable = AppWidgetHostView != null;

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppWidgetErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface AppWidgetViewProps {
  widget: Widget;
}

export function AppWidgetViewComponent({ widget }: AppWidgetViewProps) {
  const { colors } = useTheme();
  const config = parseWidgetConfig<AppWidgetConfig>(widget.config);
  const widgetHeight = Math.max(config?.minHeight ?? 200, 120);

  const fallback = (
    <View style={styles.placeholder}>
      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
        Widget unavailable
      </Text>
    </View>
  );

  if (Platform.OS !== 'android' || !widget.appWidgetId || widget.appWidgetId < 0 || !isViewAvailable) {
    return fallback;
  }

  return (
    <AppWidgetErrorBoundary fallback={fallback}>
      <View style={styles.container}>
        {config?.label && (
          <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
            {config.label}
          </Text>
        )}
        <AppWidgetHostView
          appWidgetId={widget.appWidgetId}
          widgetWidth={-1}
          widgetHeight={widgetHeight}
          style={[styles.widgetView, { minHeight: widgetHeight }]}
        />
      </View>
    </AppWidgetErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  label: {
    fontSize: 11,
    marginBottom: 4,
  },
  widgetView: {
    width: '100%',
    minHeight: 100,
  },
  placeholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 13,
  },
});
