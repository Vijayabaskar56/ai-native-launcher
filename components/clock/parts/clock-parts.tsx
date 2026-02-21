import { StyleSheet, View } from 'react-native';
import { DatePart } from './date-part';
import { BatteryPart } from './battery-part';
import { FavoritesPart } from './favorites-part';

interface ClockPartsProps {
  showDate?: boolean;
  showBattery?: boolean;
  showFavorites?: boolean;
  favoriteRows?: number;
}

export function ClockParts({
  showDate = true,
  showBattery = true,
  showFavorites = false,
  favoriteRows = 1,
}: ClockPartsProps) {
  return (
    <View style={styles.container}>
      {showDate && <DatePart />}
      {showBattery && <BatteryPart />}
      {showFavorites && <FavoritesPart maxRows={favoriteRows} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
