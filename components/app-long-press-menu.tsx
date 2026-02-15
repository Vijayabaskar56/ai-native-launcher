import { Modal, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { AppInfo } from '@/hooks/use-installed-apps';
import { ShortcutInfo } from '@/modules/launcher-kit';

interface AppLongPressMenuProps {
  visible: boolean;
  app: AppInfo | null;
  onClose: () => void;
  onLaunch: () => void;
  onAppInfo: () => void;
  onUninstall: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  shortcuts?: ShortcutInfo[];
  onShortcutPress?: (shortcut: ShortcutInfo) => void;
}

export function AppLongPressMenu({
  visible,
  app,
  onClose,
  onLaunch,
  onAppInfo,
  onUninstall,
  isFavorite,
  onToggleFavorite,
  shortcuts,
  onShortcutPress,
}: AppLongPressMenuProps) {
  const { colors } = useTheme();

  if (!app) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={[styles.scrim, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Image
              source={{ uri: `data:image/png;base64,${app.icon}` }}
              style={styles.headerIcon}
            />
            <View style={styles.headerText}>
              <Text style={[styles.headerLabel, { color: colors.text }]} numberOfLines={1}>
                {app.label}
              </Text>
              <Text style={[styles.headerPackage, { color: colors.textSecondary }]} numberOfLines={1}>
                {app.packageName}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <MenuItem
            icon="open-in-new"
            label="Launch"
            color={colors.text}
            onPress={() => {
              onLaunch();
              onClose();
            }}
          />

          <MenuItem
            icon="info-outline"
            label="App Info"
            color={colors.text}
            onPress={() => {
              onAppInfo();
              onClose();
            }}
          />

          {shortcuts && shortcuts.length > 0 && onShortcutPress && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                Shortcuts
              </Text>
              {shortcuts.map((shortcut) => (
                <Pressable
                  key={shortcut.id}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                  onPress={() => {
                    onShortcutPress(shortcut);
                    onClose();
                  }}
                  android_ripple={{ color: colors.border }}
                >
                  {shortcut.icon ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${shortcut.icon}` }}
                      style={styles.shortcutIcon}
                    />
                  ) : (
                    <View style={[styles.shortcutIconPlaceholder, { backgroundColor: colors.border }]} />
                  )}
                  <Text style={[styles.menuItemLabel, { color: colors.text }]} numberOfLines={1}>
                    {shortcut.shortLabel || shortcut.longLabel}
                  </Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </Pressable>
              ))}
            </>
          )}

          {onToggleFavorite && (
            <MenuItem
              icon={isFavorite ? 'star' : 'star-outline'}
              label={isFavorite ? 'Unpin Favorite' : 'Pin to Favorites'}
              color={colors.accent}
              onPress={() => {
                onToggleFavorite();
                onClose();
              }}
            />
          )}

          <MenuItem
            icon="delete-outline"
            label="Uninstall"
            color="#FF3B30"
            onPress={() => {
              onUninstall();
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

function MenuItem({ icon, label, color, onPress }: MenuItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
      android_ripple={{ color: colors.border }}
    >
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>
      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerPackage: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shortcutIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  shortcutIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
});