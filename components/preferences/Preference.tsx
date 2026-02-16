import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface PreferenceProps {
  title: string;
  summary?: string;
  icon?: ReactNode;
  onClick?: () => void;
  controls?: ReactNode;
  enabled?: boolean;
}

export function Preference({
  title,
  summary,
  icon,
  onClick,
  controls,
  enabled = true,
}: PreferenceProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={enabled ? onClick : undefined}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && { opacity: 0.7 },
        !enabled && styles.disabled,
      ]}
      disabled={!enabled || !onClick}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={[styles.content, !icon && styles.contentNoIcon]}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {summary && (
          <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
            {summary}
          </Text>
        )}
      </View>
      {controls && <View style={styles.controls}>{controls}</View>}
    </Pressable>
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
  iconContainer: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
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
  controls: {
    marginLeft: 24,
  },
  disabled: {
    opacity: 0.38,
  },
});
