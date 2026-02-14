import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

export function ClockWidget() {
  const { colors } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[time.getDay()]}, ${months[time.getMonth()]} ${time.getDate()}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: colors.text }]}>
        {hours}:{minutes}
      </Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {formatDate()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: 2,
  },
  date: {
    fontSize: 18,
    marginTop: 4,
    fontWeight: '400',
  },
});
