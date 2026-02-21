import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/use-app-theme';
import { settingsService } from '@/services/settings-service';
import { PreferenceCategory } from '@/components/preferences';
import { SETTINGS_LABELS } from '@/constants/settings-labels';

const BACKUP_LABELS = {
  create_backup: 'Create backup',
  create_backup_summary: 'Export settings to clipboard',
  restore_backup: 'Restore backup',
  restore_backup_summary: 'Import settings from clipboard',
  backup_includes: 'Backup includes:',
  backup_settings: 'Settings',
  backup_favorites: 'Favorites',
  backup_hidden: 'Hidden items',
  backup_tags: 'Tags',
  creating: 'Creating backup...',
  restoring: 'Restoring backup...',
  backup_success: 'Backup data copied to clipboard',
  backup_error: 'Failed to create backup',
  restore_success: 'Backup restored successfully',
  restore_error: 'Failed to restore backup',
  restore_invalid: 'Invalid backup data',
  restore_confirm_title: 'Restore Backup?',
  restore_confirm_message: 'This will replace your current settings. Paste the backup data and confirm.',
  last_backup: 'Last backup',
  no_backup: 'No backup created yet',
  paste_prompt: 'Paste your backup JSON below',
};

export default function BackupSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const createBackup = async () => {
    setLoading(true);
    try {
      const backupData = await settingsService.exportSettings();
      await AsyncStorage.setItem('@claw_backup', backupData);
      await AsyncStorage.setItem('@claw_backup_date', new Date().toISOString());
      setLastBackup(new Date().toLocaleString());
      Alert.alert(
        BACKUP_LABELS.backup_success,
        'Your settings have been saved locally. Use the restore option to load them later.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert(BACKUP_LABELS.backup_error);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async () => {
    Alert.alert(
      BACKUP_LABELS.restore_confirm_title,
      BACKUP_LABELS.restore_confirm_message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const backupData = await AsyncStorage.getItem('@claw_backup');
              if (!backupData) {
                Alert.alert(BACKUP_LABELS.restore_error, 'No backup found');
                return;
              }

              const success = await settingsService.importSettings(backupData);
              if (success) {
                Alert.alert(BACKUP_LABELS.restore_success);
              } else {
                Alert.alert(BACKUP_LABELS.restore_error);
              }
            } catch (error) {
              console.error('Restore error:', error);
              Alert.alert(BACKUP_LABELS.restore_error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap, color?: string) => (
    <MaterialCommunityIcons name={name} size={24} color={color || colors.accent} />
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: SETTINGS_LABELS.preference_screen_backup,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {loading ? BACKUP_LABELS.creating : BACKUP_LABELS.restoring}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <PreferenceCategory>
              <Pressable
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: colors.surface },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={createBackup}
              >
                <View style={styles.actionIcon}>
                  {renderIcon('export', colors.accent)}
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    {BACKUP_LABELS.create_backup}
                  </Text>
                  <Text style={[styles.actionSummary, { color: colors.textSecondary }]}>
                    {BACKUP_LABELS.create_backup_summary}
                  </Text>
                </View>
                {renderIcon('chevron-right', colors.textSecondary)}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: colors.surface },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={restoreBackup}
              >
                <View style={styles.actionIcon}>
                  {renderIcon('import', colors.accent)}
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    {BACKUP_LABELS.restore_backup}
                  </Text>
                  <Text style={[styles.actionSummary, { color: colors.textSecondary }]}>
                    {BACKUP_LABELS.restore_backup_summary}
                  </Text>
                </View>
                {renderIcon('chevron-right', colors.textSecondary)}
              </Pressable>
            </PreferenceCategory>

            <PreferenceCategory title="Backup Contents">
              <View style={[styles.contentsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.contentsTitle, { color: colors.textSecondary }]}>
                  {BACKUP_LABELS.backup_includes}
                </Text>
                <View style={styles.contentsList}>
                  <View style={styles.contentItem}>
                    {renderIcon('cog', colors.textSecondary)}
                    <Text style={[styles.contentItemText, { color: colors.text }]}>
                      {BACKUP_LABELS.backup_settings}
                    </Text>
                  </View>
                  <View style={styles.contentItem}>
                    {renderIcon('star', colors.textSecondary)}
                    <Text style={[styles.contentItemText, { color: colors.text }]}>
                      {BACKUP_LABELS.backup_favorites}
                    </Text>
                  </View>
                  <View style={styles.contentItem}>
                    {renderIcon('eye-off', colors.textSecondary)}
                    <Text style={[styles.contentItemText, { color: colors.text }]}>
                      {BACKUP_LABELS.backup_hidden}
                    </Text>
                  </View>
                  <View style={styles.contentItem}>
                    {renderIcon('tag', colors.textSecondary)}
                    <Text style={[styles.contentItemText, { color: colors.text }]}>
                      {BACKUP_LABELS.backup_tags}
                    </Text>
                  </View>
                </View>
              </View>
            </PreferenceCategory>

            <PreferenceCategory title="Backup Status">
              <View style={[styles.lastBackupCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.lastBackupLabel, { color: colors.textSecondary }]}>
                  {BACKUP_LABELS.last_backup}
                </Text>
                <Text style={[styles.lastBackupDate, { color: colors.text }]}>
                  {lastBackup || BACKUP_LABELS.no_backup}
                </Text>
              </View>
            </PreferenceCategory>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSummary: {
    fontSize: 14,
    marginTop: 2,
  },
  contentsCard: {
    padding: 16,
    borderRadius: 12,
  },
  contentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  contentsList: {
    gap: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentItemText: {
    fontSize: 14,
    marginLeft: 12,
  },
  lastBackupCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  lastBackupLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  lastBackupDate: {
    fontSize: 14,
    fontWeight: '600',
  },
});