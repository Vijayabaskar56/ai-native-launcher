import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { AppIcon } from './app-icon';
import { AppInfo } from '@/hooks/use-installed-apps';

interface DockProps {
  apps: AppInfo[];
  favorites: string[];
  onAppPress: (app: AppInfo) => void;
}

export function Dock({ apps, favorites, onAppPress }: DockProps) {
  const { colors } = useTheme();
  const favoriteApps = apps.filter(app => favorites.includes(app.packageName));
  const nonFavoriteApps = apps.filter(app => !favorites.includes(app.packageName));
  const dockApps = [...favoriteApps, ...nonFavoriteApps].slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.dock }]}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        {dockApps.map(app => (
          <AppIcon
            key={app.packageName}
            app={app}
            size={52}
            showLabel={false}
            onPress={() => onAppPress(app)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
});
