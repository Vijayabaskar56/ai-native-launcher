import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { AppInfo } from '@/hooks/use-installed-apps';

interface AppIconProps {
  app: AppInfo;
  size?: number;
  showLabel?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export function AppIcon({ app, size = 56, showLabel = true, onPress, onLongPress }: AppIconProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      android_ripple={{ color: colors.border, radius: size / 2 }}
    >
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Image
          source={{ uri: `data:image/png;base64,${app.icon}` }}
          style={styles.icon}
          resizeMode="cover"
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {app.label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    maxWidth: 80,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
