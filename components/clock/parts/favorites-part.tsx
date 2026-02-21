import { StyleSheet, View } from 'react-native';
import { useFavorites } from '@/hooks/use-favorites';
import { useInstalledApps } from '@/hooks/use-installed-apps';
import { AppIcon } from '@/components/app-icon';

interface FavoritesPartProps {
  maxRows?: number;
  columns?: number;
}

export function FavoritesPart({ maxRows = 1, columns = 5 }: FavoritesPartProps) {
  const { favorites } = useFavorites();
  const { apps, launchApp } = useInstalledApps();

  const favoriteApps = favorites
    .map((pkg) => apps.find((a) => a.packageName === pkg))
    .filter(Boolean) as typeof apps;

  const maxItems = maxRows * columns;
  const displayApps = favoriteApps.slice(0, maxItems);

  if (displayApps.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {displayApps.map((app) => (
          <AppIcon
            key={app.packageName}
            app={app}
            size={44}
            showLabel={false}
            onPress={() => launchApp(app.packageName)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
});
