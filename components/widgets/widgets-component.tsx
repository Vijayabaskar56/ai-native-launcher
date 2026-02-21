import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { WidgetColumn } from './widget-column';
import { WidgetPicker } from './widget-picker';
import { WidgetConfigSheet } from './widget-config-sheet';
import { registerScaffoldComponent } from '@/core/scaffold/component-registry';
import type { ScaffoldComponentProps } from '@/core/scaffold/types';
import type { Widget } from '@/db/schema/widgets';

function WidgetsComponent({ isActive, onRequestClose }: ScaffoldComponentProps) {
  const { colors } = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [configWidget, setConfigWidget] = useState<Widget | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WidgetColumn
        onOpenPicker={() => setPickerVisible(true)}
        onConfigureWidget={setConfigWidget}
      />
      <WidgetPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
      <WidgetConfigSheet
        widget={configWidget}
        onClose={() => setConfigWidget(null)}
      />
    </View>
  );
}

registerScaffoldComponent({
  id: 'widgets',
  component: WidgetsComponent,
  label: 'Widgets',
});

export { WidgetsComponent };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
