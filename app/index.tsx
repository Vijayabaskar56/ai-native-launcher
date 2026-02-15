import { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClockWidget } from '@/components/clock-widget';
import { Dock } from '@/components/dock';
import { AppDrawer } from '@/components/app-drawer';
import { SettingsDrawer } from '@/components/settings-drawer';
import { useInstalledApps } from '@/hooks/use-installed-apps';
import { useTheme } from '@/hooks/use-app-theme';
import { useFavorites } from '@/hooks/use-favorites';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { apps, loading, launchApp } = useInstalledApps();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const handleAppPress = async (app: { packageName: string }) => {
    await launchApp(app.packageName);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      
      <Pressable
        style={styles.settingsButton}
        onLongPress={() => setSettingsVisible(true)}
      >
        <View style={styles.settingsIndicator} />
      </Pressable>

      <View style={styles.content}>
        <ClockWidget />
      </View>

      <View style={styles.bottomArea}>
        <Dock apps={apps} favorites={favorites} onAppPress={handleAppPress} />
      </View>

      <AppDrawer
        apps={apps}
        onAppPress={handleAppPress}
        favorites={favorites}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
      />

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
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  settingsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomArea: {
    justifyContent: 'flex-end',
  },
});
