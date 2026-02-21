import { StyleSheet, View } from 'react-native';
import { ClockWidget } from './clock-widget';
import { registerScaffoldComponent } from '@/core/scaffold/component-registry';
import type { ScaffoldComponentProps } from '@/core/scaffold/types';

function ClockHomeComponent({ isActive }: ScaffoldComponentProps) {
  return (
    <View style={styles.container}>
      <ClockWidget />
    </View>
  );
}

registerScaffoldComponent({
  id: 'clock-home',
  component: ClockHomeComponent,
  label: 'Home',
});

export { ClockHomeComponent };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
});
