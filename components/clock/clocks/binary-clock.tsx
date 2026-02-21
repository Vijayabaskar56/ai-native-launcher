import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface BinaryClockProps {
  use24Hour: boolean;
  showSeconds?: boolean;
}

function digitToBits(digit: number): boolean[] {
  return [
    (digit & 8) !== 0,
    (digit & 4) !== 0,
    (digit & 2) !== 0,
    (digit & 1) !== 0,
  ];
}

export function BinaryClock({ use24Hour, showSeconds }: BinaryClockProps) {
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

  const h1 = Math.floor(hours / 10);
  const h2 = hours % 10;
  const m1 = Math.floor(minutes / 10);
  const m2 = minutes % 10;
  const s1 = Math.floor(seconds / 10);
  const s2 = seconds % 10;

  const columns = showSeconds
    ? [h1, h2, m1, m2, s1, s2]
    : [h1, h2, m1, m2];

  const labels = showSeconds
    ? ['H', 'H', 'M', 'M', 'S', 'S']
    : ['H', 'H', 'M', 'M'];

  const bitLabels = ['8', '4', '2', '1'];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Bit labels column */}
        <View style={styles.column}>
          <View style={styles.labelCell} />
          {bitLabels.map((label) => (
            <View key={label} style={styles.cell}>
              <Text style={[styles.bitLabel, { color: colors.textSecondary }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {columns.map((digit, colIndex) => {
          const bits = digitToBits(digit);
          return (
            <View key={colIndex} style={styles.column}>
              <View style={styles.labelCell}>
                <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>
                  {labels[colIndex]}
                </Text>
              </View>
              {bits.map((active, rowIndex) => (
                <View key={rowIndex} style={styles.cell}>
                  <View
                    style={[
                      styles.dot,
                      active
                        ? { backgroundColor: colors.accent }
                        : { borderWidth: 1.5, borderColor: colors.border },
                    ]}
                  />
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    alignItems: 'center',
    gap: 8,
  },
  labelCell: {
    height: 20,
    justifyContent: 'center',
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cell: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  bitLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
