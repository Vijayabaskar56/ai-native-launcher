import { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface PreferenceWithSwitchProps {
  title: string;
  summary?: string;
  icon?: ReactNode;
  switchValue: boolean;
  onSwitchChanged: (value: boolean) => void;
  onClick: () => void;
  enabled?: boolean;
}

export function PreferenceWithSwitch({
  title,
  summary,
  icon,
  switchValue,
  onSwitchChanged,
  onClick,
  enabled = true,
}: PreferenceWithSwitchProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, opacity: enabled ? 1 : 0.38 }]}>
      <Pressable
        style={styles.clickableArea}
        onPress={enabled ? onClick : undefined}
        disabled={!enabled}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={[styles.content, !icon && styles.contentNoIcon]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {summary && (
            <Text style={[styles.summary, { color: colors.textSecondary }]}>
              {summary}
            </Text>
          )}
        </View>
      </Pressable>
      <View style={styles.switchContainer}>
        <Switch
          value={switchValue}
          onValueChange={onSwitchChanged}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={switchValue ? colors.background : '#f4f3f4'}
        />
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
  clickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  contentNoIcon: {
    marginLeft: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  summary: {
    fontSize: 14,
    marginTop: 2,
  },
  switchContainer: {
    marginLeft: 16,
  },
});
