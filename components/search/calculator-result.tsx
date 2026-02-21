import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-app-theme';

interface CalculatorResultProps {
  expression: string;
  result: number;
}

export function CalculatorResult({ expression, result }: CalculatorResultProps) {
  const { colors } = useTheme();

  const formattedResult = Number.isInteger(result)
    ? result.toString()
    : result.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');

  const handleCopy = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Clipboard = require('expo-clipboard');
      Clipboard.setStringAsync(formattedResult);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Fallback: no-op if expo-clipboard is not installed
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.expression, { color: colors.textSecondary }]}>
          {expression} =
        </Text>
        <Text style={[styles.result, { color: colors.text }]}>
          {formattedResult}
        </Text>
      </View>
      <Pressable onPress={handleCopy} hitSlop={8} style={styles.copyButton}>
        <MaterialIcons name="content-copy" size={20} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  expression: {
    fontSize: 14,
  },
  result: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 4,
  },
  copyButton: {
    padding: 8,
  },
});
