import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface DigitalClock1Props {
  use24Hour: boolean;
  showSeconds?: boolean;
}

export function DigitalClock1({ use24Hour, showSeconds }: DigitalClock1Props) {
  const { colors } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  let hours = time.getHours();
  const isPM = hours >= 12;
  if (!use24Hour) {
    hours = hours % 12 || 12;
  }

  const hoursStr = hours.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const timeStr = showSeconds
    ? `${hoursStr}:${minutes}:${seconds}`
    : `${hoursStr}:${minutes}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: colors.text }]}>{timeStr}</Text>
      {!use24Hour && (
        <Text style={[styles.ampm, { color: colors.textSecondary }]}>
          {isPM ? 'PM' : 'AM'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  ampm: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: -4,
  },
});
