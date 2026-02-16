import { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PreferenceScreenProps {
  title: string;
  helpUrl?: string;
  onBack?: () => void;
  children: ReactNode;
}

export function PreferenceScreen({
  title,
  helpUrl,
  onBack,
  children,
}: PreferenceScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {helpUrl && (
          <Pressable
            style={({ pressed }) => [styles.helpButton, pressed && { opacity: 0.7 }]}
          >
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={24}
              color={colors.text}
            />
          </Pressable>
        )}
        {!helpUrl && <View style={styles.helpButtonPlaceholder} />}
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 12,
    borderRadius: 24,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  helpButton: {
    padding: 12,
    borderRadius: 24,
  },
  helpButtonPlaceholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
