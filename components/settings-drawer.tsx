import { View, StyleSheet, Text, Switch, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { colors, theme, toggleTheme } = useTheme();

  if (!visible) return null;

  return (
    <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
      <Pressable style={[styles.container, { backgroundColor: colors.surface }]} onPress={() => {}}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Claw Launcher v1.0.0</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
});
