import { ReactNode } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { Preference } from './Preference';

interface SwitchPreferenceProps {
  title: string;
  summary?: string;
  icon?: ReactNode;
  value: boolean;
  onValueChanged: (value: boolean) => void;
  enabled?: boolean;
}

export function SwitchPreference({
  title,
  summary,
  icon,
  value,
  onValueChanged,
  enabled = true,
}: SwitchPreferenceProps) {
  const { colors } = useTheme();

  return (
    <Preference
      title={title}
      summary={summary}
      icon={icon}
      enabled={enabled}
      onClick={() => onValueChanged(!value)}
      controls={
        <View style={styles.switchContainer}>
          <Switch
            value={value}
            onValueChange={onValueChanged}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={value ? colors.background : '#f4f3f4'}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    marginLeft: 8,
  },
});
