import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { useSettings } from '@/hooks/use-settings';
import {
  Preference,
  PreferenceCategory,
  SwitchPreference,
} from '@/components/preferences';
import { SETTINGS_LABELS } from '@/constants/settings-labels';

const INTEGRATION_LABELS = {
  weather_provider: 'Weather provider',
  weather_provider_summary: 'Configure weather data source',
  media_player: 'Media player',
  media_player_summary: 'Show media playback controls',
  feed_integration: 'Feed',
  feed_summary: 'Connect Nextcloud or Owncloud for file and feed access',
  tasks_integration: 'Tasks',
  tasks_summary: 'Connect task management service',
  smartspacer: 'Smartspacer',
  smartspacer_summary: 'Integrate with Smartspacer widgets',
  no_accounts: 'No accounts connected',
  connect_account: 'Connect account',
};

export default function IntegrationsSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { integrations, updateSettings } = useSettings();

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  const handleConnectAccount = (type: 'nextcloud' | 'owncloud') => {
    Alert.alert(
      'Connect Account',
      `This will open a browser to authenticate with your ${type} account.`,
      [{ text: 'Cancel' }, { text: 'Continue', style: 'default' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: SETTINGS_LABELS.preference_screen_integrations,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <PreferenceCategory title="Weather">
            <Preference
              title={INTEGRATION_LABELS.weather_provider}
              summary={INTEGRATION_LABELS.weather_provider_summary}
              icon={renderIcon('weather-partly-cloudy')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Media">
            <SwitchPreference
              title={INTEGRATION_LABELS.media_player}
              summary={INTEGRATION_LABELS.media_player_summary}
              icon={renderIcon('music')}
              value={integrations.mediaPlayer}
              onValueChanged={(value) => updateSettings('integrations', { mediaPlayer: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Cloud Services">
            <Preference
              title={INTEGRATION_LABELS.feed_integration}
              summary={INTEGRATION_LABELS.feed_summary}
              icon={renderIcon('cloud')}
              onClick={() => handleConnectAccount('nextcloud')}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Productivity">
            <SwitchPreference
              title={INTEGRATION_LABELS.tasks_integration}
              summary={INTEGRATION_LABELS.tasks_summary}
              icon={renderIcon('checkbox-marked-outline')}
              value={integrations.tasksEnabled}
              onValueChanged={(value) => updateSettings('integrations', { tasksEnabled: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Advanced">
            <SwitchPreference
              title={INTEGRATION_LABELS.smartspacer}
              summary={INTEGRATION_LABELS.smartspacer_summary}
              icon={renderIcon('widgets')}
              value={integrations.smartspacer}
              onValueChanged={(value) => updateSettings('integrations', { smartspacer: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Connected Accounts">
            <Preference
              title={INTEGRATION_LABELS.connect_account}
              summary={INTEGRATION_LABELS.no_accounts}
              icon={renderIcon('account-plus')}
              onClick={() => {}}
            />
          </PreferenceCategory>
        </ScrollView>
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
});