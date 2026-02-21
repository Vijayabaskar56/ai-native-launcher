import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DatePart() {
  const { colors } = useTheme();
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Update every minute to catch date changes
    const interval = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatted = `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{formatted}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '400',
  },
});
