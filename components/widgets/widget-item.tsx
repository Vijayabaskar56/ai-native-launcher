import { StyleSheet, View, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherWidget } from './weather-widget';
import { MusicWidget } from './music-widget';
import { ClockWidgetWrapper } from './clock-widget-wrapper';
import { FavoritesWidget } from './favorites-widget';
import { CalendarWidget } from './calendar-widget';
import { NotesWidget } from './notes-widget';
import { AppWidgetViewComponent } from './app-widget-view';
import type { Widget } from '@/db/schema/widgets';

interface WidgetItemProps {
  widget: Widget;
  isEditing: boolean;
  onDelete: () => void;
  onConfigure?: () => void;
  onDrag?: () => void;
}

const WIDGET_COMPONENTS: Record<string, React.ComponentType<{ widget: Widget }>> = {
  clock: ClockWidgetWrapper,
  weather: WeatherWidget,
  music: MusicWidget,
  favorites: FavoritesWidget,
  calendar: CalendarWidget,
  notes: NotesWidget,
  appwidget: AppWidgetViewComponent,
};

export function registerWidgetComponent(type: string, component: React.ComponentType<{ widget: Widget }>) {
  WIDGET_COMPONENTS[type] = component;
}

export function WidgetItem({ widget, isEditing, onDelete, onConfigure, onDrag }: WidgetItemProps) {
  const { colors } = useTheme();
  const isBorder = widget.sizing !== 'full';

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];

  return (
    <View style={styles.container}>
      {isEditing && onDrag && (
        <Pressable onLongPress={onDrag} style={styles.dragHandle}>
          <MaterialCommunityIcons name="drag" size={22} color={colors.textSecondary} />
        </Pressable>
      )}
      <View style={[
        styles.content,
        isBorder && [styles.borderCard, { backgroundColor: colors.surface, borderColor: colors.border }],
      ]}>
        {WidgetComponent ? <WidgetComponent widget={widget} /> : null}
      </View>
      {isEditing && (
        <View style={styles.editActions}>
          {onConfigure && (
            <Pressable onPress={onConfigure} style={styles.actionBtn}>
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
          <Pressable onPress={onDelete} style={styles.actionBtn}>
            <MaterialCommunityIcons name="close-circle" size={22} color="#FF3B30" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  borderCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  dragHandle: {
    justifyContent: 'center',
    paddingRight: 4,
  },
  editActions: {
    flexDirection: 'column',
    gap: 4,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  actionBtn: {
    padding: 4,
  },
});
