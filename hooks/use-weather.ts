import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, type WeatherData } from '@/services/weather-service';

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(units: 'celsius' | 'fahrenheit' = 'celsius'): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeather(units);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [units]);

  useEffect(() => {
    refresh();

    // Refresh every 30 minutes
    const interval = setInterval(refresh, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { weather, loading, error, refresh };
}
