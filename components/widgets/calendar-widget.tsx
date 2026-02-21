import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { parseWidgetConfig } from '@/core/types/widget-types';

// Lazy-load expo-calendar to avoid crash if native module isn't built yet
let Calendar: typeof import('expo-calendar') | null = null;
try {
  Calendar = require('expo-calendar');
} catch {
  // Native module not available yet
}
import type { CalendarWidgetConfig } from '@/core/types/widget-types';
import type { Widget } from '@/db/schema/widgets';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  calendarColor?: string;
}

interface CalendarWidgetProps {
  widget: Widget;
}

export function CalendarWidget({ widget }: CalendarWidgetProps) {
  const { colors } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const config = parseWidgetConfig<CalendarWidgetConfig>(widget.config);
  const maxEvents = config?.maxEvents ?? 5;
  const excludedCalendars = config?.excludedCalendars ?? [];

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        if (!Calendar) {
          setHasPermission(false);
          setLoading(false);
          return;
        }

        // Permission is requested at app startup (_layout.tsx).
        // Here we just check the current status.
        const { status } = await Calendar.getCalendarPermissionsAsync();
        if (!mounted) return;

        if (status !== 'granted') {
          setHasPermission(false);
          setLoading(false);
          return;
        }

        setHasPermission(true);
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const filteredCalendarIds = calendars
          .filter((c) => !excludedCalendars.includes(c.id))
          .map((c) => c.id);

        if (filteredCalendarIds.length === 0) {
          if (mounted) {
            setEvents([]);
            setLoading(false);
          }
          return;
        }

        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 7);

        const rawEvents = await Calendar!.getEventsAsync(
          filteredCalendarIds,
          now,
          end
        );

        if (!mounted) return;

        const calendarColorMap = new Map(calendars.map((c) => [c.id, c.color]));

        const mapped: CalendarEvent[] = rawEvents
          .slice(0, maxEvents)
          .map((e) => ({
            id: e.id,
            title: e.title,
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
            allDay: e.allDay ?? false,
            calendarColor: calendarColorMap.get(e.calendarId) ?? undefined,
          }));

        setEvents(mapped);
      } catch (error) {
        console.error('Failed to load calendar events:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadEvents();
    return () => { mounted = false; };
  }, [maxEvents, excludedCalendars.join(',')]);

  if (!hasPermission && !loading) {
    return (
      <View>
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-outline" size={24} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
        </View>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          Calendar permission required
        </Text>
      </View>
    );
  }

  if (events.length === 0 && !loading) {
    return (
      <View>
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-outline" size={24} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
        </View>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          No upcoming events
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-outline" size={24} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
      </View>
      <View style={styles.eventList}>
        {events.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <View style={[styles.eventDot, { backgroundColor: event.calendarColor || colors.accent }]} />
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                {formatEventTime(event)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatEventTime(event: CalendarEvent): string {
  const now = new Date();
  const isToday = event.startDate.toDateString() === now.toDateString();
  const isTomorrow = event.startDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  if (event.allDay) {
    if (isToday) return 'All day today';
    if (isTomorrow) return 'All day tomorrow';
    return `All day, ${event.startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
  }

  const time = event.startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return `${event.startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}, ${time}`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 13,
  },
  eventList: {
    gap: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 12,
  },
});
