import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface AnalogClockProps {
  use24Hour: boolean;
  showSeconds?: boolean;
}

const CLOCK_SIZE = 200;
const CENTER = CLOCK_SIZE / 2;
const HOUR_HAND_LENGTH = 55;
const MINUTE_HAND_LENGTH = 75;
const SECOND_HAND_LENGTH = 80;

export function AnalogClock({ showSeconds }: AnalogClockProps) {
  const { colors } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = hours * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  const markers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const markerRadius = CLOCK_SIZE / 2 - 12;
    const x = CENTER + markerRadius * Math.sin(angle);
    const y = CENTER - markerRadius * Math.cos(angle);
    const isMain = i % 3 === 0;
    return (
      <View
        key={i}
        style={[
          styles.marker,
          {
            left: x - (isMain ? 3 : 2),
            top: y - (isMain ? 3 : 2),
            width: isMain ? 6 : 4,
            height: isMain ? 6 : 4,
            borderRadius: isMain ? 3 : 2,
            backgroundColor: colors.text,
            opacity: isMain ? 1 : 0.5,
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.face,
          {
            width: CLOCK_SIZE,
            height: CLOCK_SIZE,
            borderRadius: CLOCK_SIZE / 2,
            borderColor: colors.border,
          },
        ]}
      >
        {markers}
        <View
          style={[
            styles.hand,
            {
              width: 4,
              height: HOUR_HAND_LENGTH,
              backgroundColor: colors.text,
              top: CENTER - HOUR_HAND_LENGTH,
              left: CENTER - 2,
              borderRadius: 2,
              transform: [{ rotate: `${hourDeg}deg` }],
              transformOrigin: 'bottom',
            },
          ]}
        />
        <View
          style={[
            styles.hand,
            {
              width: 2.5,
              height: MINUTE_HAND_LENGTH,
              backgroundColor: colors.text,
              top: CENTER - MINUTE_HAND_LENGTH,
              left: CENTER - 1.25,
              borderRadius: 1.5,
              transform: [{ rotate: `${minuteDeg}deg` }],
              transformOrigin: 'bottom',
            },
          ]}
        />
        {showSeconds && (
          <View
            style={[
              styles.hand,
              {
                width: 1.5,
                height: SECOND_HAND_LENGTH,
                backgroundColor: colors.accent,
                top: CENTER - SECOND_HAND_LENGTH,
                left: CENTER - 0.75,
                borderRadius: 1,
                transform: [{ rotate: `${secondDeg}deg` }],
                transformOrigin: 'bottom',
              },
            ]}
          />
        )}
        <View
          style={[
            styles.centerDot,
            { backgroundColor: colors.text },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  face: {
    borderWidth: 2,
    position: 'relative',
  },
  marker: {
    position: 'absolute',
  },
  hand: {
    position: 'absolute',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: CENTER - 4,
    left: CENTER - 4,
  },
});
