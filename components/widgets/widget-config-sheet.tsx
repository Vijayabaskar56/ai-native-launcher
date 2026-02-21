import { Modal, StyleSheet, View, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Widget } from '@/db/schema/widgets';
import { useWidgets } from '@/hooks/use-widgets';
import { parseWidgetConfig } from '@/core/types/widget-types';
import type {
  ClockWidgetConfig,
  WeatherWidgetConfig,
  WidgetSizing,
} from '@/core/types/widget-types';

interface WidgetConfigSheetProps {
  widget: Widget | null;
  onClose: () => void;
}

export function WidgetConfigSheet({ widget, onClose }: WidgetConfigSheetProps) {
  const { colors } = useTheme();
  const { updateWidgetConfig, updateWidgetSizing } = useWidgets();

  if (!widget) return null;

  const toggleSizing = async () => {
    const next: WidgetSizing = widget.sizing === 'full' ? 'border' : 'full';
    await updateWidgetSizing(widget.id, next);
    onClose();
  };

  return (
    <Modal
      visible={!!widget}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Configure {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Sizing toggle */}
            <Pressable
              onPress={toggleSizing}
              style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons
                name={widget.sizing === 'full' ? 'arrow-collapse' : 'arrow-expand'}
                size={22}
                color={colors.accent}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  Display Style
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  {widget.sizing === 'full' ? 'Full width (edge-to-edge)' : 'Card (with border)'}
                </Text>
              </View>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Widget-specific config will be added per type */}
            {widget.type === 'clock' && (
              <ClockConfigSection widget={widget} onClose={onClose} />
            )}
            {widget.type === 'weather' && (
              <WeatherConfigSection widget={widget} onClose={onClose} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ClockConfigSection({ widget, onClose }: { widget: Widget; onClose: () => void }) {
  const { colors } = useTheme();
  const { updateWidgetConfig } = useWidgets();
  const config = parseWidgetConfig<ClockWidgetConfig>(widget.config);
  const faces = ['analog', 'binary', 'digital1', 'digital2', 'orbit', 'segment'] as const;

  const setFace = async (face: string) => {
    await updateWidgetConfig(widget.id, JSON.stringify({ ...config, clockFace: face }));
    onClose();
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Clock Face</Text>
      <View style={styles.faceGrid}>
        {faces.map((face) => (
          <Pressable
            key={face}
            onPress={() => setFace(face)}
            style={[
              styles.faceBtn,
              { backgroundColor: colors.surface, borderColor: config?.clockFace === face ? colors.accent : colors.border },
            ]}
          >
            <Text style={[styles.faceBtnText, { color: config?.clockFace === face ? colors.accent : colors.text }]}>
              {face.charAt(0).toUpperCase() + face.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function WeatherConfigSection({ widget, onClose }: { widget: Widget; onClose: () => void }) {
  const { colors } = useTheme();
  const { updateWidgetConfig } = useWidgets();
  const config = parseWidgetConfig<WeatherWidgetConfig>(widget.config);

  const toggleUnits = async () => {
    const next = config?.units === 'celsius' ? 'fahrenheit' : 'celsius';
    await updateWidgetConfig(widget.id, JSON.stringify({ ...config, units: next }));
    onClose();
  };

  const toggleForecast = async () => {
    await updateWidgetConfig(widget.id, JSON.stringify({ ...config, showForecast: !config?.showForecast }));
    onClose();
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Weather Settings</Text>
      <Pressable
        onPress={toggleUnits}
        style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <MaterialCommunityIcons name="thermometer" size={22} color={colors.accent} />
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, { color: colors.text }]}>Temperature Units</Text>
          <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
            {config?.units === 'fahrenheit' ? 'Fahrenheit' : 'Celsius'}
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={toggleForecast}
        style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <MaterialCommunityIcons name="calendar-week" size={22} color={colors.accent} />
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, { color: colors.text }]}>Show Forecast</Text>
          <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
            {config?.showForecast ? 'Showing 3-day forecast' : 'Current weather only'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionDesc: {
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  faceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  faceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  faceBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
