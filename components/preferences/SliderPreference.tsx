import { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface SliderPreferenceProps {
  title: string;
  icon?: ReactNode;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChanged: (value: number) => void;
  enabled?: boolean;
  labelFormatter?: (value: number) => string;
}

export function SliderPreference({
  title,
  icon,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChanged,
  enabled = true,
  labelFormatter,
}: SliderPreferenceProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [localValue, setLocalValue] = useState(value);

  const formatValue = labelFormatter || ((v: number) => String(v));
  const sliderWidth = width - 120;
  const stepCount = Math.floor((max - min) / step);
  const stepWidth = sliderWidth / stepCount;
  const currentStep = Math.round((localValue - min) / step);

  const handlePress = (stepIndex: number) => {
    const newValue = min + stepIndex * step;
    setLocalValue(newValue);
    onValueChanged(newValue);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, opacity: enabled ? 1 : 0.38 }]}>
      {icon && <View style={styles.iconPadding}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.sliderRow}>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            {Array.from({ length: stepCount + 1 }).map((_, index) => {
              const stepVal = min + index * step;
              const isActive = index <= currentStep;
              return (
                <Pressable
                  key={`step-${stepVal}`}
                  style={[
                    styles.step,
                    { width: stepWidth },
                  ]}
                  onPress={() => enabled && handlePress(index)}
                >
                  <View
                    style={[
                      styles.stepFill,
                      {
                        backgroundColor: isActive ? colors.accent : 'transparent',
                        borderRadius: stepWidth / 2,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.valueLabel, { color: colors.text }]}>
            {formatValue(localValue)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  iconPadding: {
    width: 48,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
  },
  step: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepFill: {
    width: '100%',
    height: '100%',
  },
  valueLabel: {
    width: 56,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
