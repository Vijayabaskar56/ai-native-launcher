import { useState, ReactNode } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { Preference } from './Preference';

export interface ListPreferenceItem<T> {
  label: string;
  value: T;
}

interface ListPreferenceProps<T> {
  title: string;
  summary?: string;
  icon?: ReactNode;
  items: ListPreferenceItem<T>[];
  value: T | null;
  onValueChanged: (value: T) => void;
  enabled?: boolean;
}

export function ListPreference<T extends string | number | boolean>({
  title,
  summary,
  icon,
  items,
  value,
  onValueChanged,
  enabled = true,
}: ListPreferenceProps<T>) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);
  const displaySummary = summary || selectedItem?.label;

  return (
    <>
      <Preference
        title={title}
        summary={displaySummary}
        icon={icon}
        enabled={enabled}
        onClick={() => setVisible(true)}
      />

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>{title}</Text>
            <ScrollView style={styles.list} nestedScrollEnabled>
              {items.map((item) => (
                <Pressable
                  key={String(item.value)}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    onValueChanged(item.value);
                    setVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      { borderColor: colors.border },
                      item.value === value && { borderColor: colors.accent },
                    ]}
                  >
                    {item.value === value && (
                      <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                    )}
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    borderRadius: 28,
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: '500',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemLabel: {
    fontSize: 16,
    flex: 1,
  },
});
