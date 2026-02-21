import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface OrbitClockProps {
  use24Hour: boolean;
  showSeconds?: boolean;
}

const SIZE = 220;
const CENTER = SIZE / 2;
const HOUR_ORBIT = 40;
const MINUTE_ORBIT = 65;
const SECOND_ORBIT = 88;

export function OrbitClock({ use24Hour, showSeconds }: OrbitClockProps) {
  const { colors } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  let hours = time.getHours();
  if (!use24Hour) {
    hours = hours % 12 || 12;
  }
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');

  const hourAngle = ((hours % 12) * 30 + minutes * 0.5) * (Math.PI / 180);
  const minuteAngle = (minutes * 6) * (Math.PI / 180);
  const secondAngle = (seconds * 6) * (Math.PI / 180);

  const hourX = CENTER + HOUR_ORBIT * Math.sin(hourAngle) - 8;
  const hourY = CENTER - HOUR_ORBIT * Math.cos(hourAngle) - 8;

  const minuteX = CENTER + MINUTE_ORBIT * Math.sin(minuteAngle) - 6;
  const minuteY = CENTER - MINUTE_ORBIT * Math.cos(minuteAngle) - 6;

  const secondX = CENTER + SECOND_ORBIT * Math.sin(secondAngle) - 4;
  const secondY = CENTER - SECOND_ORBIT * Math.cos(secondAngle) - 4;

  return (
    <View style={styles.container}>
      <View style={[styles.field, { width: SIZE, height: SIZE }]}>
        {/* Orbit paths */}
        <View
          style={[
            styles.orbit,
            {
              width: HOUR_ORBIT * 2,
              height: HOUR_ORBIT * 2,
              borderRadius: HOUR_ORBIT,
              borderColor: colors.border,
              left: CENTER - HOUR_ORBIT,
              top: CENTER - HOUR_ORBIT,
            },
          ]}
        />
        <View
          style={[
            styles.orbit,
            {
              width: MINUTE_ORBIT * 2,
              height: MINUTE_ORBIT * 2,
              borderRadius: MINUTE_ORBIT,
              borderColor: colors.border,
              left: CENTER - MINUTE_ORBIT,
              top: CENTER - MINUTE_ORBIT,
            },
          ]}
        />
        {showSeconds && (
          <View
            style={[
              styles.orbit,
              {
                width: SECOND_ORBIT * 2,
                height: SECOND_ORBIT * 2,
                borderRadius: SECOND_ORBIT,
                borderColor: colors.border,
                left: CENTER - SECOND_ORBIT,
                top: CENTER - SECOND_ORBIT,
              },
            ]}
          />
        )}

        {/* Indicators */}
        <View
          style={[
            styles.indicator,
            {
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: colors.text,
              left: hourX,
              top: hourY,
            },
          ]}
        />
        <View
          style={[
            styles.indicator,
            {
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.textSecondary,
              left: minuteX,
              top: minuteY,
            },
          ]}
        />
        {showSeconds && (
          <View
            style={[
              styles.indicator,
              {
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.accent,
                left: secondX,
                top: secondY,
              },
            ]}
          />
        )}

        {/* Center time text */}
        <View style={[styles.centerText, { left: CENTER - 30, top: CENTER - 12 }]}>
          <Text style={[styles.timeText, { color: colors.text }]}>
            {hoursStr}:{minutesStr}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  field: {
    position: 'relative',
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
  },
  indicator: {
    position: 'absolute',
  },
  centerText: {
    position: 'absolute',
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
