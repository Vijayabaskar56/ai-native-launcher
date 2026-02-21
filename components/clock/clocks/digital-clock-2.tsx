import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-app-theme';

interface DigitalClock2Props {
  use24Hour: boolean;
  showSeconds?: boolean;
}

export function DigitalClock2({ use24Hour, showSeconds }: DigitalClock2Props) {
  const { colors } = useTheme();
  const [time, setTime] = useState(new Date());
  const colonOpacity = useSharedValue(1);

  useEffect(() => {
    colonOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1
    );
  }, [colonOpacity]);

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

  const colonAnimStyle = useAnimatedStyle(() => ({
    opacity: colonOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.digit, { color: colors.text }]}>{hoursStr}</Text>
        <Animated.Text style={[styles.colon, { color: colors.text }, colonAnimStyle]}>
          :
        </Animated.Text>
        <Text style={[styles.digit, { color: colors.text }]}>{minutes}</Text>
        {showSeconds && (
          <>
            <Animated.Text style={[styles.colon, { color: colors.text }, colonAnimStyle]}>
              :
            </Animated.Text>
            <Text style={[styles.digit, { color: colors.text }]}>{seconds}</Text>
          </>
        )}
        {!use24Hour && (
          <Text style={[styles.ampm, { color: colors.textSecondary }]}>
            {isPM ? 'PM' : 'AM'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  digit: {
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: 1,
  },
  colon: {
    fontSize: 48,
    fontWeight: '200',
    marginHorizontal: 2,
  },
  ampm: {
    fontSize: 16,
    fontWeight: '300',
    marginLeft: 6,
  },
});
