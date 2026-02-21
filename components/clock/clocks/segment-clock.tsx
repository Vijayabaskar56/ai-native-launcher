import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';

interface SegmentClockProps {
  use24Hour: boolean;
  showSeconds?: boolean;
}

// 7-segment mapping: [top, topRight, bottomRight, bottom, bottomLeft, topLeft, middle]
const SEGMENT_MAP: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
};

const DIGIT_W = 32;
const DIGIT_H = 56;
const SEG_THICKNESS = 4;
const SEG_LEN = DIGIT_W - 4;
const SEG_VERT_LEN = (DIGIT_H - 6) / 2;

function SegmentDigit({ digit, activeColor, dimColor }: {
  digit: string;
  activeColor: string;
  dimColor: string;
}) {
  const segs = SEGMENT_MAP[digit] || SEGMENT_MAP['0'];
  // Positions: top, topRight, bottomRight, bottom, bottomLeft, topLeft, middle
  return (
    <View style={{ width: DIGIT_W, height: DIGIT_H, position: 'relative' }}>
      {/* Top horizontal */}
      <View
        style={[
          styles.hSeg,
          {
            top: 0,
            left: 2,
            width: SEG_LEN,
            height: SEG_THICKNESS,
            backgroundColor: segs[0] ? activeColor : dimColor,
          },
        ]}
      />
      {/* Top-right vertical */}
      <View
        style={[
          styles.vSeg,
          {
            top: 2,
            right: 0,
            width: SEG_THICKNESS,
            height: SEG_VERT_LEN,
            backgroundColor: segs[1] ? activeColor : dimColor,
          },
        ]}
      />
      {/* Bottom-right vertical */}
      <View
        style={[
          styles.vSeg,
          {
            top: SEG_VERT_LEN + 4,
            right: 0,
            width: SEG_THICKNESS,
            height: SEG_VERT_LEN,
            backgroundColor: segs[2] ? activeColor : dimColor,
          },
        ]}
      />
      {/* Bottom horizontal */}
      <View
        style={[
          styles.hSeg,
          {
            bottom: 0,
            left: 2,
            width: SEG_LEN,
            height: SEG_THICKNESS,
            backgroundColor: segs[3] ? activeColor : dimColor,
          },
        ]}
      />
      {/* Bottom-left vertical */}
      <View
        style={[
          styles.vSeg,
          {
            top: SEG_VERT_LEN + 4,
            left: 0,
            width: SEG_THICKNESS,
            height: SEG_VERT_LEN,
            backgroundColor: segs[4] ? activeColor : dimColor,
          },
        ]}
      />
      {/* Top-left vertical */}
      <View
        style={[
          styles.vSeg,
          {
            top: 2,
            left: 0,
            width: SEG_THICKNESS,
            height: SEG_VERT_LEN,
            backgroundColor: segs[5] ? activeColor : dimColor,
          },
        ]}
      />
      {/* Middle horizontal */}
      <View
        style={[
          styles.hSeg,
          {
            top: DIGIT_H / 2 - SEG_THICKNESS / 2,
            left: 2,
            width: SEG_LEN,
            height: SEG_THICKNESS,
            backgroundColor: segs[6] ? activeColor : dimColor,
          },
        ]}
      />
    </View>
  );
}

function ColonSeparator({ color }: { color: string }) {
  return (
    <View style={styles.colonContainer}>
      <View style={[styles.colonDot, { backgroundColor: color }]} />
      <View style={[styles.colonDot, { backgroundColor: color }]} />
    </View>
  );
}

export function SegmentClock({ use24Hour, showSeconds }: SegmentClockProps) {
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

  const h1 = Math.floor(hours / 10).toString();
  const h2 = (hours % 10).toString();
  const m1 = Math.floor(minutes / 10).toString();
  const m2 = (minutes % 10).toString();
  const s1 = Math.floor(seconds / 10).toString();
  const s2 = (seconds % 10).toString();

  const activeColor = colors.text;
  const dimColor = colors.border + '40';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SegmentDigit digit={h1} activeColor={activeColor} dimColor={dimColor} />
        <SegmentDigit digit={h2} activeColor={activeColor} dimColor={dimColor} />
        <ColonSeparator color={activeColor} />
        <SegmentDigit digit={m1} activeColor={activeColor} dimColor={dimColor} />
        <SegmentDigit digit={m2} activeColor={activeColor} dimColor={dimColor} />
        {showSeconds && (
          <>
            <ColonSeparator color={activeColor} />
            <SegmentDigit digit={s1} activeColor={activeColor} dimColor={dimColor} />
            <SegmentDigit digit={s2} activeColor={activeColor} dimColor={dimColor} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hSeg: {
    position: 'absolute',
    borderRadius: 2,
  },
  vSeg: {
    position: 'absolute',
    borderRadius: 2,
  },
  colonContainer: {
    height: DIGIT_H,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 10,
  },
  colonDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
