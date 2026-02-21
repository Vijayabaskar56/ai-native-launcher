export type WidgetType = 'clock' | 'weather' | 'music' | 'calendar' | 'favorites' | 'notes' | 'appwidget';
export type WidgetSizing = 'border' | 'full';

export interface ClockWidgetConfig {
  clockFace: 'analog' | 'binary' | 'digital1' | 'digital2' | 'orbit' | 'segment';
}

export interface WeatherWidgetConfig {
  units: 'celsius' | 'fahrenheit';
  showForecast: boolean;
}

export interface MusicWidgetConfig {
  showAlbumArt: boolean;
}

export interface CalendarWidgetConfig {
  excludedCalendars: string[];
  maxEvents: number;
}

export interface FavoritesWidgetConfig {
  columns: number;
}

export interface NotesWidgetConfig {
  content: string;
}

export interface AppWidgetConfig {
  packageName: string;
  className: string;
  label: string;
  minWidth?: number;
  minHeight?: number;
}

export type WidgetConfig =
  | ClockWidgetConfig
  | WeatherWidgetConfig
  | MusicWidgetConfig
  | CalendarWidgetConfig
  | FavoritesWidgetConfig
  | NotesWidgetConfig
  | AppWidgetConfig;

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  icon: string;
  description: string;
  defaultConfig: string;
  defaultSizing: WidgetSizing;
}

export const BUILT_IN_WIDGETS: WidgetDefinition[] = [
  {
    type: 'clock',
    label: 'Clock',
    icon: 'clock-outline',
    description: 'Display time with multiple clock faces',
    defaultConfig: JSON.stringify({ clockFace: 'digital1' } satisfies ClockWidgetConfig),
    defaultSizing: 'full',
  },
  {
    type: 'weather',
    label: 'Weather',
    icon: 'weather-partly-cloudy',
    description: 'Current weather and forecast',
    defaultConfig: JSON.stringify({ units: 'celsius', showForecast: false } satisfies WeatherWidgetConfig),
    defaultSizing: 'border',
  },
  {
    type: 'music',
    label: 'Music',
    icon: 'music-note',
    description: 'Now playing controls and info',
    defaultConfig: JSON.stringify({ showAlbumArt: true } satisfies MusicWidgetConfig),
    defaultSizing: 'border',
  },
  {
    type: 'calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
    description: 'Upcoming events from device calendar',
    defaultConfig: JSON.stringify({ excludedCalendars: [], maxEvents: 5 } satisfies CalendarWidgetConfig),
    defaultSizing: 'border',
  },
  {
    type: 'favorites',
    label: 'Favorites',
    icon: 'star-outline',
    description: 'Quick access to pinned apps',
    defaultConfig: JSON.stringify({ columns: 4 } satisfies FavoritesWidgetConfig),
    defaultSizing: 'border',
  },
  {
    type: 'notes',
    label: 'Notes',
    icon: 'note-text-outline',
    description: 'Quick note on your home screen',
    defaultConfig: JSON.stringify({ content: '' } satisfies NotesWidgetConfig),
    defaultSizing: 'border',
  },
];

export function parseWidgetConfig<T>(configStr: string | null): T | null {
  if (!configStr) return null;
  try {
    return JSON.parse(configStr) as T;
  } catch {
    return null;
  }
}
