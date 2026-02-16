import { text, integer, real, sqliteTable } from 'drizzle-orm/sqlite-core';

export const weatherForecasts = sqliteTable('weather_forecasts', {
  timestamp: integer('timestamp', { mode: 'timestamp' }).primaryKey(),
  temperature: real('temperature').notNull(),
  minTemp: real('min_temp').notNull(),
  maxTemp: real('max_temp').notNull(),
  pressure: real('pressure').notNull(),
  humidity: real('humidity').notNull(),
  icon: integer('icon').notNull(),
  condition: text('condition').notNull(),
  clouds: integer('clouds').notNull(),
  windSpeed: real('wind_speed').notNull(),
  windDirection: real('wind_direction').notNull(),
  precipitation: real('precipitation').notNull(),
  snow: real('snow').notNull(),
  night: integer('night', { mode: 'boolean' }).notNull(),
  location: text('location').notNull(),
  provider: text('provider').notNull(),
  providerUrl: text('provider_url').notNull(),
  precipProbability: integer('precip_probability').notNull(),
  snowProbability: integer('snow_probability').notNull(),
  updateTime: integer('update_time', { mode: 'timestamp' }).notNull(),
});

export type WeatherForecast = typeof weatherForecasts.$inferSelect;
export type NewWeatherForecast = typeof weatherForecasts.$inferInsert;
