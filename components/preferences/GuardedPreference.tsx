import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface GuardedPreferenceProps {
  locked: boolean;
  description: string;
  onUnlock: () => void;
  children: ReactNode;
}

export function GuardedPreference({
  locked,
  description,
  onUnlock,
  children,
}: GuardedPreferenceProps) {
  const { colors } = useTheme();

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.accent },
          pressed && { opacity: 0.8 },
        ]}
        onPress={onUnlock}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Grant Permission
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
