import { StyleSheet, View } from 'react-native';
import { useSettings } from '@/db/use-settings';
import { DigitalClock1 } from './clocks/digital-clock-1';
import { DigitalClock2 } from './clocks/digital-clock-2';
import { AnalogClock } from './clocks/analog-clock';
import { OrbitClock } from './clocks/orbit-clock';
import { BinaryClock } from './clocks/binary-clock';
import { SegmentClock } from './clocks/segment-clock';
import { ClockParts } from './parts/clock-parts';
import type { ClockWidgetStyle } from '@/db/use-settings';

function getUse24Hour(timeFormat: string): boolean {
  if (timeFormat === 'TwentyFourHour') return true;
  if (timeFormat === 'TwelveHour') return false;
  // System default - use 24h for most locales
  return false;
}

const CLOCK_COMPONENTS: Record<string, React.ComponentType<{ use24Hour: boolean; showSeconds?: boolean }>> = {
  Digital1: DigitalClock1,
  Digital2: DigitalClock2,
  Analog: AnalogClock,
  Orbit: OrbitClock,
  Binary: BinaryClock,
  Segment: SegmentClock,
};

export function ClockWidget() {
  const { settings } = useSettings();

  const style: ClockWidgetStyle = settings.clockWidgetStyle || 'Digital1';
  const showSeconds = settings.clockWidgetShowSeconds ?? false;
  const use24Hour = getUse24Hour(settings.localeTimeFormat);
  const showDate = settings.clockWidgetDatePart ?? true;
  const showBattery = settings.clockWidgetBatteryPart ?? true;
  const showFavorites = settings.homeScreenDock ?? false;
  const favoriteRows = settings.homeScreenDockRows ?? 1;

  const ClockFace = CLOCK_COMPONENTS[style] || DigitalClock1;

  if (style === 'Empty') {
    return (
      <View style={styles.container}>
        <ClockParts
          showDate={showDate}
          showBattery={showBattery}
          showFavorites={showFavorites}
          favoriteRows={favoriteRows}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ClockFace use24Hour={use24Hour} showSeconds={showSeconds} />
      <ClockParts
        showDate={showDate}
        showBattery={showBattery}
        showFavorites={showFavorites}
        favoriteRows={favoriteRows}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
