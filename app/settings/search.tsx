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
  ListPreference,
} from '@/components/preferences';
import { SETTINGS_LABELS, SEARCH_RESULTS_ORDER_OPTIONS } from '@/constants/settings-labels';

export default function SearchSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { searchSources, searchBehavior, updateSettings } = useSettings();

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  const handlePermissionRequest = (type: 'contacts' | 'calendar' | 'locations' | 'files') => {
    Alert.alert(
      'Permission Required',
      `To enable ${type} search, please grant the required permission in the next dialog.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: SETTINGS_LABELS.preference_screen_search,
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
          <PreferenceCategory title="Primary Sources">
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_favorites}
              summary={SETTINGS_LABELS.preference_search_favorites_summary}
              icon={renderIcon('star')}
              value={searchSources.searchFavorites}
              onValueChanged={(value) => updateSettings('searchSources', { searchFavorites: value })}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_apps}
              summary={SETTINGS_LABELS.preference_search_apps_summary}
              icon={renderIcon('apps')}
              value={searchSources.searchApps}
              onValueChanged={(value) => updateSettings('searchSources', { searchApps: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Data Sources">
            <Preference
              title={SETTINGS_LABELS.preference_search_files}
              summary={SETTINGS_LABELS.preference_search_files_summary}
              icon={renderIcon('file')}
              onClick={() => {}}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_contacts}
              summary={SETTINGS_LABELS.preference_search_contacts_summary}
              icon={renderIcon('account')}
              value={searchSources.searchContacts}
              onValueChanged={(value) => {
                if (value) {
                  handlePermissionRequest('contacts');
                } else {
                  updateSettings('searchSources', { searchContacts: false });
                }
              }}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_calendar}
              summary={SETTINGS_LABELS.preference_search_calendar_summary}
              icon={renderIcon('calendar')}
              value={searchSources.searchCalendar}
              onValueChanged={(value) => {
                if (value) {
                  handlePermissionRequest('calendar');
                } else {
                  updateSettings('searchSources', { searchCalendar: false });
                }
              }}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_appshortcuts}
              summary={SETTINGS_LABELS.preference_search_appshortcuts_summary}
              icon={renderIcon('chevron-right')}
              value={searchSources.searchAppShortcuts}
              onValueChanged={(value) => updateSettings('searchSources', { searchAppShortcuts: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Tools">
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_calculator}
              summary={SETTINGS_LABELS.preference_search_calculator_summary}
              icon={renderIcon('calculator')}
              value={searchSources.searchCalculator}
              onValueChanged={(value) => updateSettings('searchSources', { searchCalculator: value })}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_unitconverter}
              summary={SETTINGS_LABELS.preference_search_unitconverter_summary}
              icon={renderIcon('swap-horizontal')}
              value={searchSources.searchUnitConverter}
              onValueChanged={(value) => updateSettings('searchSources', { searchUnitConverter: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Online Sources">
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_wikipedia}
              summary={SETTINGS_LABELS.preference_search_wikipedia_summary}
              icon={renderIcon('wikipedia')}
              value={searchSources.searchWikipedia}
              onValueChanged={(value) => updateSettings('searchSources', { searchWikipedia: value })}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_websites}
              summary={SETTINGS_LABELS.preference_search_websites_summary}
              icon={renderIcon('web')}
              value={searchSources.searchWebsites}
              onValueChanged={(value) => updateSettings('searchSources', { searchWebsites: value })}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_locations}
              summary={SETTINGS_LABELS.preference_search_locations_summary}
              icon={renderIcon('map-marker')}
              value={searchSources.searchLocations}
              onValueChanged={(value) => {
                if (value) {
                  handlePermissionRequest('locations');
                } else {
                  updateSettings('searchSources', { searchLocations: false });
                }
              }}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Quick Actions">
            <Preference
              title={SETTINGS_LABELS.preference_screen_search_actions}
              summary={SETTINGS_LABELS.preference_search_search_actions_summary}
              icon={renderIcon('lightning-bolt')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Item Management">
            <Preference
              title={SETTINGS_LABELS.preference_hidden_items}
              summary={SETTINGS_LABELS.preference_hidden_items_summary}
              icon={renderIcon('eye-off')}
              onClick={() => {}}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_tags}
              summary={SETTINGS_LABELS.preference_screen_tags_summary}
              icon={renderIcon('tag')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Filters">
            <Preference
              title={SETTINGS_LABELS.preference_default_filter}
              summary={SETTINGS_LABELS.preference_default_filter_summary}
              icon={renderIcon('filter-variant')}
              onClick={() => {}}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_filter_bar}
              summary={SETTINGS_LABELS.preference_filter_bar_summary}
              icon={renderIcon('view-grid')}
              value={searchBehavior.filterBar}
              onValueChanged={(value) => updateSettings('searchBehavior', { filterBar: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Keyboard">
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_bar_auto_focus}
              summary={SETTINGS_LABELS.preference_search_bar_auto_focus_summary}
              icon={renderIcon('keyboard')}
              value={searchBehavior.searchBarAutoFocus}
              onValueChanged={(value) => updateSettings('searchBehavior', { searchBarAutoFocus: value })}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_search_bar_launch_on_enter}
              summary={SETTINGS_LABELS.preference_search_bar_launch_on_enter_summary}
              icon={renderIcon('keyboard-return')}
              value={searchBehavior.searchBarLaunchOnEnter}
              onValueChanged={(value) => updateSettings('searchBehavior', { searchBarLaunchOnEnter: value })}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Layout">
            <ListPreference
              title={SETTINGS_LABELS.preference_layout_search_results}
              icon={renderIcon('sort')}
              items={SEARCH_RESULTS_ORDER_OPTIONS}
              value={searchBehavior.searchResultsBottomUp}
              onValueChanged={(value) => updateSettings('searchBehavior', { searchResultsBottomUp: value })}
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