import { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Dimensions,
  Keyboard,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/use-app-theme';
import { AppIcon } from './app-icon';
import { AppInfo } from '@/hooks/use-installed-apps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.85;
const DRAWER_THRESHOLD = -100;

interface AppDrawerProps {
  apps: AppInfo[];
  onAppPress: (app: AppInfo) => void;
}

export function AppDrawer({ apps, onAppPress }: AppDrawerProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

        <FlatList
          data={filteredApps}
          keyExtractor={item => item.packageName}
          numColumns={4}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AppIcon app={item} onPress={() => handleAppPress(item)} />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No apps found
            </Text>
          }
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
