import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { AppIcon } from '@/components/app-icon';
import type { AppInfo } from '@/hooks/use-installed-apps';

interface AppResultsProps {
  apps: AppInfo[];
  columns: number;
  iconSize: number;
  showLabels: boolean;
  onAppPress: (app: AppInfo) => void;
  onAppLongPress: (app: AppInfo) => void;
}

export function AppResults({
  apps,
  columns,
  iconSize,
  showLabels,
  onAppPress,
  onAppLongPress,
}: AppResultsProps) {
  const { colors } = useTheme();

  if (apps.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.textSecondary }]}>
        Apps ({apps.length})
      </Text>
      <View style={styles.grid}>
        {apps.map(app => (
          <View key={app.packageName} style={{ width: `${100 / columns}%` }}>
            <AppIcon
              app={app}
              size={iconSize}
              showLabel={showLabels}
              onPress={() => onAppPress(app)}
              onLongPress={() => onAppLongPress(app)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
