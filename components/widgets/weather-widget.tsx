import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeather } from '@/hooks/use-weather';
import { getWeatherIcon, getWeatherCondition } from '@/services/weather-service';
import { parseWidgetConfig } from '@/core/types/widget-types';
import type { WeatherWidgetConfig } from '@/core/types/widget-types';
import type { Widget } from '@/db/schema/widgets';

interface WeatherWidgetProps {
  widget: Widget;
}

export function WeatherWidget({ widget }: WeatherWidgetProps) {
  const { colors } = useTheme();
  const config = parseWidgetConfig<WeatherWidgetConfig>(widget.config);
  const units = config?.units ?? 'celsius';
  const showForecast = config?.showForecast ?? false;
  const { weather, loading, error, refresh } = useWeather(units);
  const unitSymbol = units === 'fahrenheit' ? '°F' : '°C';

  if (loading && !weather) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading weather...
        </Text>
      </View>
    );
  }

  if (error && !weather) {
    return (
      <View>
        <View style={styles.header}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Weather</Text>
        </View>
        <Pressable onPress={refresh}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error}. Tap to retry.
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!weather) return null;

  const iconName = getWeatherIcon(weather.weatherCode);
  const condition = getWeatherCondition(weather.weatherCode);

  return (
    <View>
      {/* Main weather info */}
      <View style={styles.mainRow}>
        <MaterialCommunityIcons name={iconName as any} size={40} color={colors.accent} />
        <View style={styles.tempSection}>
          <Text style={[styles.temperature, { color: colors.text }]}>
            {weather.temperature}{unitSymbol}
          </Text>
          <Text style={[styles.condition, { color: colors.textSecondary }]}>
            {condition}
          </Text>
        </View>
        <View style={styles.hiLo}>
          <Text style={[styles.hiLoText, { color: colors.textSecondary }]}>
            H:{weather.maxTemp}° L:{weather.minTemp}°
          </Text>
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            {weather.location}
          </Text>
        </View>
      </View>

      {/* 3-day forecast */}
      {showForecast && weather.forecast.length > 0 && (
        <View style={[styles.forecastRow, { borderTopColor: colors.border }]}>
          {weather.forecast.map((day) => {
            const dayName = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });
            return (
              <View key={day.date} style={styles.forecastDay}>
                <Text style={[styles.forecastDayName, { color: colors.textSecondary }]}>
                  {dayName}
                </Text>
                <MaterialCommunityIcons
                  name={getWeatherIcon(day.weatherCode) as any}
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.forecastTemp, { color: colors.text }]}>
                  {day.maxTemp}° / {day.minTemp}°
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempSection: {
    flex: 1,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '700',
  },
  condition: {
    fontSize: 13,
  },
  hiLo: {
    alignItems: 'flex-end',
  },
  hiLoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 11,
    marginTop: 2,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  forecastDay: {
    alignItems: 'center',
    gap: 4,
  },
  forecastDayName: {
    fontSize: 12,
    fontWeight: '500',
  },
  forecastTemp: {
    fontSize: 12,
  },
});
