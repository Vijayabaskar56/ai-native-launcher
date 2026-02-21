import { getSqlite } from '@/db/connection';

// Lazy-load expo-location to avoid crash if native module isn't built yet
let Location: typeof import('expo-location') | null = null;
try {
  Location = require('expo-location');
} catch {
  // Native module not available yet — will fail gracefully in fetchWeather
}

export interface WeatherData {
  temperature: number;
  minTemp: number;
  maxTemp: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  location: string;
  updatedAt: number;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  minTemp: number;
  maxTemp: number;
  weatherCode: number;
}

// WMO Weather interpretation codes → icon name
const WMO_ICONS: Record<number, string> = {
  0: 'weather-sunny',
  1: 'weather-partly-cloudy',
  2: 'weather-partly-cloudy',
  3: 'weather-cloudy',
  45: 'weather-fog',
  48: 'weather-fog',
  51: 'weather-rainy',
  53: 'weather-rainy',
  55: 'weather-rainy',
  56: 'weather-snowy-rainy',
  57: 'weather-snowy-rainy',
  61: 'weather-rainy',
  63: 'weather-pouring',
  65: 'weather-pouring',
  66: 'weather-snowy-rainy',
  67: 'weather-snowy-rainy',
  71: 'weather-snowy',
  73: 'weather-snowy',
  75: 'weather-snowy-heavy',
  77: 'weather-snowy',
  80: 'weather-rainy',
  81: 'weather-pouring',
  82: 'weather-pouring',
  85: 'weather-snowy',
  86: 'weather-snowy-heavy',
  95: 'weather-lightning',
  96: 'weather-lightning-rainy',
  99: 'weather-lightning-rainy',
};

const WMO_CONDITIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Heavy thunderstorm',
};

export function getWeatherIcon(code: number): string {
  return WMO_ICONS[code] ?? 'weather-partly-cloudy';
}

export function getWeatherCondition(code: number): string {
  return WMO_CONDITIONS[code] ?? 'Unknown';
}

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

let cachedWeather: WeatherData | null = null;
let lastFetchTime = 0;

export async function fetchWeather(units: 'celsius' | 'fahrenheit' = 'celsius'): Promise<WeatherData> {
  const now = Date.now();
  if (cachedWeather && now - lastFetchTime < CACHE_DURATION_MS) {
    return cachedWeather;
  }

  // Get location
  if (!Location) {
    throw new Error('Location module not available — native rebuild required');
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission not granted');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low,
  });

  const { latitude, longitude } = location.coords;
  const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=${tempUnit}&wind_speed_unit=kmh&forecast_days=4&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  // Reverse geocode for location name
  let locationName = `${latitude.toFixed(1)}, ${longitude.toFixed(1)}`;
  try {
    if (Location) {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        locationName = place.city || place.subregion || place.region || locationName;
      }
    }
  } catch {
    // Use coordinates as fallback
  }

  const forecast: ForecastDay[] = data.daily.time.slice(1, 4).map((date: string, i: number) => ({
    date,
    minTemp: Math.round(data.daily.temperature_2m_min[i + 1]),
    maxTemp: Math.round(data.daily.temperature_2m_max[i + 1]),
    weatherCode: data.daily.weather_code[i + 1],
  }));

  cachedWeather = {
    temperature: Math.round(data.current.temperature_2m),
    minTemp: Math.round(data.daily.temperature_2m_min[0]),
    maxTemp: Math.round(data.daily.temperature_2m_max[0]),
    weatherCode: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    location: locationName,
    updatedAt: now,
    forecast,
  };

  lastFetchTime = now;

  // Cache to SQLite
  try {
    const sqlite = await getSqlite();
    await sqlite.runAsync(
      `INSERT OR REPLACE INTO weather_forecasts
       (timestamp, temperature, min_temp, max_temp, pressure, humidity, icon, condition,
        clouds, wind_speed, wind_direction, precipitation, snow, night, location,
        provider, provider_url, precip_probability, snow_probability, update_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Math.floor(now / 1000), cachedWeather.temperature, cachedWeather.minTemp,
        cachedWeather.maxTemp, 0, cachedWeather.humidity, cachedWeather.weatherCode,
        getWeatherCondition(cachedWeather.weatherCode), 0, cachedWeather.windSpeed,
        0, 0, 0, 0, cachedWeather.location, 'open-meteo',
        'https://open-meteo.com', 0, 0, Math.floor(now / 1000),
      ]
    );
  } catch {
    // Cache failure is non-critical
  }

  return cachedWeather;
}
