import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWidgets } from '@/hooks/use-widgets';
import { parseWidgetConfig } from '@/core/types/widget-types';
import type { NotesWidgetConfig } from '@/core/types/widget-types';
import type { Widget } from '@/db/schema/widgets';

interface NotesWidgetProps {
  widget: Widget;
}

export function NotesWidget({ widget }: NotesWidgetProps) {
  const { colors } = useTheme();
  const { updateWidgetConfig } = useWidgets();
  const config = parseWidgetConfig<NotesWidgetConfig>(widget.config);
  const [text, setText] = useState(config?.content ?? '');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  const handleTextChange = (newText: string) => {
    setText(newText);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      updateWidgetConfig(widget.id, JSON.stringify({ content: newText }));
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Sync if config changes externally
  useEffect(() => {
    const newContent = parseWidgetConfig<NotesWidgetConfig>(widget.config)?.content ?? '';
    if (newContent !== text) {
      setText(newContent);
    }
  }, [widget.config]);

  return (
    <View>
      <View style={styles.header}>
        <MaterialCommunityIcons name="note-text-outline" size={20} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
      </View>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={text}
        onChangeText={handleTextChange}
        placeholder="Type a note..."
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 80,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
  },
});
