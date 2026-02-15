import { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Dimensions,
  Keyboard,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-app-theme';
import { AppIcon } from './app-icon';
import { AppInfo } from '@/hooks/use-installed-apps';
import LauncherKit, { ShortcutInfo } from '@/modules/launcher-kit';
import { AppLongPressMenu } from './app-long-press-menu';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.85;
const HANDLE_HEIGHT = 40;
const MAX_TRANSLATE_Y = -DRAWER_HEIGHT;
const DRAWER_THRESHOLD = -100;

interface AppDrawerProps {
  apps: AppInfo[];
  onAppPress: (app: AppInfo) => void;
  favorites: string[];
  isFavorite: (packageName: string) => boolean;
  toggleFavorite: (packageName: string) => Promise<void>;
}

export function AppDrawer({ apps, onAppPress, favorites, isFavorite, toggleFavorite }: AppDrawerProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutInfo[]>([]);

  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const query = searchQuery.toLowerCase();
    return apps.filter(
      app =>
        app.label.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query)
    );
  }, [apps, searchQuery]);

  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    translateY.value = withSpring(open ? MAX_TRANSLATE_Y : 0, { damping: 50 });
  };

  const handleAppPress = (app: AppInfo) => {
    onAppPress(app);
    toggleDrawer(false);
    Keyboard.dismiss();
  };

  const handleAppLongPress = async (app: AppInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedApp(app);
    setMenuVisible(true);

    try {
      const appShortcuts = await LauncherKit.getAppShortcuts(app.packageName);
      setShortcuts(appShortcuts);
    } catch (error) {
      console.error('Failed to fetch shortcuts:', error);
      setShortcuts([]);
    }
  };

  const handleMenuLaunch = () => {
    if (selectedApp) {
      onAppPress(selectedApp);
      toggleDrawer(false);
      Keyboard.dismiss();
    }
  };

  const handleMenuAppInfo = async () => {
    if (selectedApp) {
      await LauncherKit.openAppSettings(selectedApp.packageName);
    }
  };

  const handleMenuUninstall = async () => {
    if (selectedApp) {
      await LauncherKit.uninstallApp(selectedApp.packageName);
    }
  };

  const handleShortcutPress = async (shortcut: ShortcutInfo) => {
    try {
      await LauncherKit.launchShortcut(shortcut.packageName, shortcut.id);
      toggleDrawer(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to launch shortcut:', error);
    }
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = Math.max(MAX_TRANSLATE_Y, Math.min(0, event.translationY + context.value.y));
      translateY.value = newY;
    })
    .onEnd((event) => {
      if (event.translationY < DRAWER_THRESHOLD || translateY.value < MAX_TRANSLATE_Y / 2) {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
        runOnJS(setIsDrawerOpen)(true);
      } else {
        translateY.value = withSpring(0, { damping: 50 });
        runOnJS(setIsDrawerOpen)(false);
        runOnJS(setSearchQuery)('');
        runOnJS(Keyboard.dismiss)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      <Pressable 
        style={styles.swipeTrigger}
        onTouchStart={() => {
          if (!isDrawerOpen) {
            setIsDrawerOpen(true);
            translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
          }
        }}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, animatedStyle, { backgroundColor: colors.background }]}>
          <Pressable style={styles.handleContainer} onPress={() => toggleDrawer(!isDrawerOpen)}>
            <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />
          </Pressable>

          {isDrawerOpen && (
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Search apps..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
            </View>
          )}

          <FlashList
            data={filteredApps}
            keyExtractor={item => item.packageName}
            numColumns={4}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AppIcon
                app={item}
                onPress={() => handleAppPress(item)}
                onLongPress={() => handleAppLongPress(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No apps found
              </Text>
            }
          />
        </Animated.View>
      </GestureDetector>
      <AppLongPressMenu
        visible={menuVisible}
        app={selectedApp}
        onClose={() => {
          setMenuVisible(false);
          setShortcuts([]);
        }}
        onLaunch={handleMenuLaunch}
        onAppInfo={handleMenuAppInfo}
        onUninstall={handleMenuUninstall}
        isFavorite={isFavorite(selectedApp?.packageName || '')}
        onToggleFavorite={() => selectedApp && toggleFavorite(selectedApp.packageName)}
        shortcuts={shortcuts}
        onShortcutPress={handleShortcutPress}
      />
    </>
  );
}

const styles = StyleSheet.create({
  swipeTrigger: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HANDLE_HEIGHT,
    zIndex: 5,
  },
  container: {
    position: 'absolute',
    bottom: -DRAWER_HEIGHT,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT + HANDLE_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
