import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text, Platform } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWidgets } from '@/hooks/use-widgets';
import { WidgetItem } from './widget-item';
import LauncherKit from '@/modules/launcher-kit/src';
import type { Widget } from '@/db/schema/widgets';

interface WidgetColumnProps {
  onOpenPicker?: () => void;
  onConfigureWidget?: (widget: Widget) => void;
}

export function WidgetColumn({ onOpenPicker, onConfigureWidget }: WidgetColumnProps) {
  const { colors } = useTheme();
  const { widgets, removeWidget, reorderWidgets, restoreWidget, seedDefaultWidgets, loading } = useWidgets();
  const [isEditing, setIsEditing] = useState(false);
  const [undoWidget, setUndoWidget] = useState<Widget | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-seed default widgets if none exist
  useEffect(() => {
    if (!loading && widgets.length === 0) {
      seedDefaultWidgets();
    }
  }, [loading, widgets.length, seedDefaultWidgets]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    LauncherKit.startWidgetHostListening().catch(() => {});

    return () => {
      LauncherKit.stopWidgetHostListening().catch(() => {});
    };
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const removed = await removeWidget(id);
    if (removed) {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      setUndoWidget(removed);
      undoTimerRef.current = setTimeout(() => {
        setUndoWidget(null);
        undoTimerRef.current = null;
      }, 5000);
    }
  }, [removeWidget]);

  const handleUndo = useCallback(async () => {
    if (undoWidget) {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
      await restoreWidget(undoWidget);
      setUndoWidget(null);
    }
  }, [undoWidget, restoreWidget]);

  const handleDragEnd = useCallback(
    ({ data }: { data: Widget[] }) => {
      reorderWidgets(data.map((w) => w.id));
    },
    [reorderWidgets]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Widget>) => (
      <ScaleDecorator>
        <WidgetItem
          widget={item}
          isEditing={isEditing}
          onDelete={() => handleDelete(item.id)}
          onConfigure={onConfigureWidget ? () => onConfigureWidget(item) : undefined}
          onDrag={isEditing ? drag : undefined}
        />
      </ScaleDecorator>
    ),
    [isEditing, handleDelete, onConfigureWidget]
  );

  const keyExtractor = useCallback((item: Widget) => item.id, []);

  const ListFooterComponent = useCallback(
    () => (
      <View style={styles.footer}>
        {isEditing && onOpenPicker && (
          <Pressable
            onPress={onOpenPicker}
            style={[styles.footerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.accent} />
            <Text style={[styles.footerBtnText, { color: colors.accent }]}>Add widget</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setIsEditing((prev) => !prev)}
          style={[styles.footerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons
            name={isEditing ? 'check' : 'pencil'}
            size={18}
            color={isEditing ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.footerBtnText, { color: isEditing ? colors.accent : colors.textSecondary }]}>
            {isEditing ? 'Done' : 'Edit widgets'}
          </Text>
        </Pressable>

        {/* Undo snackbar */}
        {undoWidget && (
          <View style={[styles.snackbar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.snackbarText, { color: colors.text }]}>
              Widget removed
            </Text>
            <Pressable onPress={handleUndo}>
              <Text style={[styles.undoText, { color: colors.accent }]}>UNDO</Text>
            </Pressable>
          </View>
        )}
      </View>
    ),
    [isEditing, onOpenPicker, colors, undoWidget, handleUndo]
  );

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  return (
    <DraggableFlatList
      data={widgets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onDragEnd={handleDragEnd}
      containerStyle={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListFooterComponent={ListFooterComponent}
      activationDistance={isEditing ? 0 : 999}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingBottom: 16,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    width: '100%',
  },
  snackbarText: {
    fontSize: 14,
  },
  undoText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
