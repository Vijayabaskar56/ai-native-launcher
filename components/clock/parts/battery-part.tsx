import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

let Battery: typeof import('expo-battery') | null = null;
try {
  Battery = require('expo-battery');
} catch {
  // expo-battery not available
}

function getBatteryIcon(level: number, isCharging: boolean): string {
  if (isCharging) return 'battery-charging';
  if (level >= 0.9) return 'battery';
  if (level >= 0.7) return 'battery-70';
  if (level >= 0.5) return 'battery-50';
  if (level >= 0.3) return 'battery-30';
  if (level >= 0.1) return 'battery-20';
  return 'battery-10';
}

export function BatteryPart() {
  const { colors } = useTheme();
  const [level, setLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!Battery || Platform.OS === 'web') return;

    let mounted = true;
    let levelSub: { remove: () => void } | null = null;
    let stateSub: { remove: () => void } | null = null;

    async function loadBattery() {
      try {
        const isAvailable = await Battery!.isAvailableAsync();
        if (!mounted || !isAvailable) return;
        setAvailable(true);

        const batteryLevel = await Battery!.getBatteryLevelAsync();
        const batteryState = await Battery!.getBatteryStateAsync();

        if (!mounted) return;
        setLevel(batteryLevel);
        setIsCharging(batteryState === Battery!.BatteryState.CHARGING);

        // Only subscribe to updates after confirming availability
        levelSub = Battery!.addBatteryLevelListener(({ batteryLevel: bl }) => {
          if (mounted) setLevel(bl);
        });
        stateSub = Battery!.addBatteryStateListener(({ batteryState: bs }) => {
          if (mounted) setIsCharging(bs === Battery!.BatteryState.CHARGING);
        });
      } catch {
        // Battery API unavailable
      }
    }

    loadBattery();

    return () => {
      mounted = false;
      levelSub?.remove();
      stateSub?.remove();
    };
  }, []);

  if (!available || level === null) return null;

  const percentage = Math.round(level * 100);
  const iconName = getBatteryIcon(level, isCharging);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={iconName as any}
        size={18}
        color={percentage <= 15 ? '#FF3B30' : colors.textSecondary}
      />
      <Text
        style={[
          styles.text,
          { color: percentage <= 15 ? '#FF3B30' : colors.textSecondary },
        ]}
      >
        {percentage}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
  },
});
