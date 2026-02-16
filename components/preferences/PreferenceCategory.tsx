import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface PreferenceCategoryProps {
  title?: string;
  children: ReactNode;
}

export function PreferenceCategory({ title, children }: PreferenceCategoryProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.accent }]}>
          {title}
        </Text>
      )}
      <View style={[styles.content, { backgroundColor: colors.surface, borderRadius: 16 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    overflow: 'hidden',
  },
});
