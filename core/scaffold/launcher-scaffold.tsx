import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { ClockWidget } from '@/components/clock/clock-widget';
import { Dock } from '@/components/dock';
import { SettingsDrawer } from '@/components/settings-drawer';
import { useInstalledApps } from '@/hooks/use-installed-apps';
import { useTheme } from '@/hooks/use-app-theme';
import { useFavorites } from '@/hooks/use-favorites';
import { getScaffoldComponent } from './component-registry';
import { useScaffoldConfig } from './use-scaffold-config';
import { useScaffoldState } from './use-scaffold-state';
import { useHomePageAnimatedStyle, useSecondaryPageAnimatedStyle } from './animations';
import { ScaffoldGestureHandler } from './scaffold-gesture-handler';

// Side-effect imports: register scaffold components
import '@/components/search/search-component';
import '@/components/widgets/widgets-component';
import '@/components/clock/clock-home-component';

export function LauncherScaffold() {
  const { colors } = useTheme();
  const { apps, loading, launchApp } = useInstalledApps();
  const { favorites } = useFavorites();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const config = useScaffoldConfig();
  const scaffoldState = useScaffoldState(config);

  const {
    currentProgress,
    currentGesture,
    currentAnimation,
    activeComponentId,
    onDrag,
    onDragStopped,
    onDoubleTap,
    onLongPress,
    closeSecondaryPage,
  } = scaffoldState;

  // Intercept back button when secondary page is active
  useEffect(() => {
    if (!activeComponentId) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSecondaryPage();
      return true;
    });

    return () => subscription.remove();
  }, [activeComponentId, closeSecondaryPage]);

  const homeAnimatedStyle = useHomePageAnimatedStyle(
    currentProgress,
    currentGesture,
    currentAnimation,
  );

  const secondaryAnimatedStyle = useSecondaryPageAnimatedStyle(
    currentProgress,
    currentGesture,
    currentAnimation,
  );

  const handleAppPress = useCallback(
    async (app: { packageName: string }) => {
      await launchApp(app.packageName);
    },
    [launchApp],
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Resolve the active secondary page component
  const activeConfig = activeComponentId ? getScaffoldComponent(activeComponentId) : null;
  const SecondaryComponent = activeConfig?.component ?? null;
  const gesturesEnabled = !settingsVisible && !activeComponentId;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />

      <ScaffoldGestureHandler
        onDrag={onDrag}
        onDragStopped={onDragStopped}
        onDoubleTap={onDoubleTap}
        onLongPress={onLongPress}
        enabled={gesturesEnabled}
      >
        <View style={styles.gestureArea}>
          {/* Home page */}
          <Animated.View style={[styles.homePage, homeAnimatedStyle]}>
            <Pressable
              style={[styles.settingsButton, { backgroundColor: colors.surface }]}
              onPress={() => setSettingsVisible(true)}
            >
              <MaterialCommunityIcons name="cog" size={24} color={colors.text} />
            </Pressable>

            <View style={styles.content}>
              <ClockWidget />
            </View>

            <View style={styles.bottomArea}>
              <Dock apps={apps} favorites={favorites} onAppPress={handleAppPress} />
            </View>
          </Animated.View>

          {/* Secondary page overlay */}
          {SecondaryComponent && (
            <Animated.View
              style={[styles.secondaryPage, secondaryAnimatedStyle]}
              pointerEvents={activeComponentId ? 'auto' : 'none'}
            >
              <SecondaryComponent
                isActive={!!activeComponentId}
                progress={currentProgress}
                onRequestClose={closeSecondaryPage}
              />
            </Animated.View>
          )}
        </View>
      </ScaffoldGestureHandler>

      {/* Settings overlay */}
      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureArea: {
    flex: 1,
  },
  homePage: {
    ...StyleSheet.absoluteFillObject,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomArea: {
    justifyContent: 'flex-end',
  },
  secondaryPage: {
    ...StyleSheet.absoluteFillObject,
  },
});
