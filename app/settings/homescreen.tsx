import { View, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSettings } from '@/db';
import {
  PreferenceScreen,
  PreferenceCategory,
  SwitchPreference,
  ListPreference,
  SliderPreference,
  Preference,
} from '@/components/preferences';
import { SETTINGS_LABELS, SYSTEM_BAR_COLOR_OPTIONS, SEARCH_BAR_POSITION_OPTIONS } from '@/constants/settings-labels';
import type { SystemBarColors } from '@/db/use-settings';

export default function HomescreenSettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PreferenceScreen
        title={SETTINGS_LABELS.preference_screen_homescreen}
        onBack={() => router.back()}
      >
        <View style={styles.content}>
          <PreferenceCategory>
            <SwitchPreference
              title={SETTINGS_LABELS.preference_layout_fixed_rotation}
              summary={SETTINGS_LABELS.preference_layout_fixed_rotation_summary}
              value={settings.uiOrientation === 'Portrait'}
              onValueChanged={(value) => updateSetting('uiOrientation', value ? 'Portrait' : 'Auto')}
            />
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_widgets}>
            <Preference
              title={SETTINGS_LABELS.preference_screen_clockwidget}
              summary={SETTINGS_LABELS.preference_screen_clockwidget_summary}
              onClick={() => {}}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_clockwidget_favorites_part}
              summary={SETTINGS_LABELS.preference_clockwidget_favorites_part_summary}
              value={settings.homeScreenDock}
              onValueChanged={(value) => updateSetting('homeScreenDock', value)}
            />
            {settings.homeScreenDock && (
              <SliderPreference
                title={SETTINGS_LABELS.preference_clockwidget_dock_rows}
                value={settings.homeScreenDockRows}
                min={1}
                max={4}
                step={1}
                onValueChanged={(value) => updateSetting('homeScreenDockRows', value)}
              />
            )}
            <SwitchPreference
              title={SETTINGS_LABELS.preference_widgets_on_home_screen}
              summary={SETTINGS_LABELS.preference_widgets_on_home_screen_summary}
              value={settings.homeScreenWidgets}
              onValueChanged={(value) => updateSetting('homeScreenWidgets', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_edit_button}
              summary={SETTINGS_LABELS.preference_widgets_edit_button_summary}
              value={settings.favoritesEditButton}
              onValueChanged={(value) => updateSetting('favoritesEditButton', value)}
            />
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_searchbar}>
            <Preference
              title={SETTINGS_LABELS.preference_search_bar_style}
              summary={SETTINGS_LABELS.preference_search_bar_style_summary}
              onClick={() => {}}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_layout_search_bar_position}
              items={SEARCH_BAR_POSITION_OPTIONS}
              value={settings.searchBarBottom}
              onValueChanged={(value) => updateSetting('searchBarBottom', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_layout_fixed_search_bar}
              summary={SETTINGS_LABELS.preference_layout_fixed_search_bar_summary}
              value={settings.searchBarFixed}
              onValueChanged={(value) => updateSetting('searchBarFixed', value)}
            />
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_wallpaper}>
            <Preference
              title={SETTINGS_LABELS.wallpaper}
              summary={SETTINGS_LABELS.preference_wallpaper_summary}
              onClick={() => {}}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_dim_wallpaper}
              summary={SETTINGS_LABELS.preference_dim_wallpaper_summary}
              value={settings.wallpaperDim}
              onValueChanged={(value) => updateSetting('wallpaperDim', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_blur_wallpaper}
              summary={SETTINGS_LABELS.preference_blur_wallpaper_summary}
              value={settings.wallpaperBlur}
              onValueChanged={(value) => updateSetting('wallpaperBlur', value)}
            />
            {settings.wallpaperBlur && (
              <SliderPreference
                title={SETTINGS_LABELS.preference_blur_wallpaper_radius}
                value={settings.wallpaperBlurRadius}
                min={4}
                max={64}
                step={4}
                onValueChanged={(value) => updateSetting('wallpaperBlurRadius', value)}
              />
            )}
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_animations}>
            <SwitchPreference
              title={SETTINGS_LABELS.preference_charging_animation}
              summary={SETTINGS_LABELS.preference_charging_animation_summary}
              value={settings.animationsCharging}
              onValueChanged={(value) => updateSetting('animationsCharging', value)}
            />
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_system_bars}>
            <ListPreference
              title={SETTINGS_LABELS.preference_status_bar_icons}
              items={SYSTEM_BAR_COLOR_OPTIONS}
              value={settings.systemBarsStatusColors}
              onValueChanged={(value) => updateSetting('systemBarsStatusColors', value as SystemBarColors)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_nav_bar_icons}
              items={SYSTEM_BAR_COLOR_OPTIONS}
              value={settings.systemBarsNavColors}
              onValueChanged={(value) => updateSetting('systemBarsNavColors', value as SystemBarColors)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_hide_status_bar}
              value={settings.systemBarsHideStatus}
              onValueChanged={(value) => updateSetting('systemBarsHideStatus', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_hide_nav_bar}
              value={settings.systemBarsHideNav}
              onValueChanged={(value) => updateSetting('systemBarsHideNav', value)}
            />
          </PreferenceCategory>
        </View>
      </PreferenceScreen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});
