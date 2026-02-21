import { StyleSheet, View } from 'react-native';
import { useSettings } from '@/db/use-settings';
import { DigitalClock1 } from '@/components/clock/clocks/digital-clock-1';
import { DigitalClock2 } from '@/components/clock/clocks/digital-clock-2';
import { AnalogClock } from '@/components/clock/clocks/analog-clock';
import { OrbitClock } from '@/components/clock/clocks/orbit-clock';
import { BinaryClock } from '@/components/clock/clocks/binary-clock';
import { SegmentClock } from '@/components/clock/clocks/segment-clock';
import { ClockParts } from '@/components/clock/parts/clock-parts';
import { parseWidgetConfig } from '@/core/types/widget-types';
import type { ClockWidgetConfig } from '@/core/types/widget-types';
import type { Widget } from '@/db/schema/widgets';

interface ClockWidgetWrapperProps {
  widget: Widget;
}

const CLOCK_FACE_MAP: Record<string, React.ComponentType<{ use24Hour: boolean; showSeconds?: boolean }>> = {
  analog: AnalogClock,
  binary: BinaryClock,
  digital1: DigitalClock1,
  digital2: DigitalClock2,
  orbit: OrbitClock,
  segment: SegmentClock,
};

export function ClockWidgetWrapper({ widget }: ClockWidgetWrapperProps) {
  const { settings } = useSettings();
  const config = parseWidgetConfig<ClockWidgetConfig>(widget.config);
  const clockFace = config?.clockFace ?? 'digital1';

  const use24Hour = settings.localeTimeFormat === 'TwentyFourHour'
    || (settings.localeTimeFormat === 'System' && false);
  const showSeconds = settings.clockWidgetShowSeconds ?? false;

  const ClockFace = CLOCK_FACE_MAP[clockFace] ?? DigitalClock1;

  return (
    <View style={styles.container}>
      <ClockFace use24Hour={use24Hour} showSeconds={showSeconds} />
      <ClockParts
        showDate={settings.clockWidgetDatePart ?? true}
        showBattery={settings.clockWidgetBatteryPart ?? true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
