import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/db';
import { widgets } from '@/db/schema/widgets';
import { eq, asc } from 'drizzle-orm';
import { getSqlite } from '@/db/connection';
import type { Widget, NewWidget } from '@/db/schema/widgets';
import type { WidgetType, WidgetSizing } from '@/core/types/widget-types';

interface AddWidgetOptions {
  type: WidgetType;
  config?: string;
  sizing?: WidgetSizing;
  appWidgetId?: number;
}

interface UseWidgetsReturn {
  widgets: Widget[];
  addWidget: (options: AddWidgetOptions) => Promise<void>;
  removeWidget: (id: string) => Promise<Widget | null>;
  reorderWidgets: (ids: string[]) => Promise<void>;
  updateWidgetConfig: (id: string, config: string) => Promise<void>;
  updateWidgetSizing: (id: string, sizing: WidgetSizing) => Promise<void>;
  restoreWidget: (widget: Widget) => Promise<void>;
  seedDefaultWidgets: () => Promise<void>;
  loading: boolean;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useWidgets(): UseWidgetsReturn {
  const { db, isLoading: dbLoading } = useDatabase();
  const [widgetList, setWidgetList] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWidgets = useCallback(async () => {
    if (!db || dbLoading) return;

    try {
      const rows = await db
        .select()
        .from(widgets)
        .orderBy(asc(widgets.position));
      setWidgetList(rows);
    } catch (error) {
      console.error('Failed to load widgets:', error);
    } finally {
      setLoading(false);
    }
  }, [db, dbLoading]);

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  const addWidget = useCallback(
    async ({ type, config, sizing, appWidgetId }: AddWidgetOptions) => {
      if (!db) return;

      const id = generateId();
      const position = widgetList.length;

      try {
        const newWidget: NewWidget = {
          id,
          type,
          config: config ?? null,
          position,
          parentId: null,
          appWidgetId: appWidgetId ?? null,
          sizing: sizing ?? 'border',
        };

        await db.insert(widgets).values(newWidget);
        setWidgetList((prev) => [
          ...prev,
          { ...newWidget, config: newWidget.config ?? null, parentId: null, appWidgetId: newWidget.appWidgetId ?? null, sizing: newWidget.sizing ?? 'border' },
        ]);
      } catch (error) {
        console.error('Failed to add widget:', error);
      }
    },
    [db, widgetList.length]
  );

  const removeWidget = useCallback(
    async (id: string): Promise<Widget | null> => {
      if (!db) return null;

      const removed = widgetList.find((w) => w.id === id) ?? null;
      try {
        await db.delete(widgets).where(eq(widgets.id, id));
        setWidgetList((prev) => prev.filter((w) => w.id !== id));
      } catch (error) {
        console.error('Failed to remove widget:', error);
        return null;
      }
      return removed;
    },
    [db, widgetList]
  );

  const restoreWidget = useCallback(
    async (widget: Widget) => {
      if (!db) return;

      try {
        await db.insert(widgets).values(widget);
        setWidgetList((prev) => {
          const updated = [...prev, widget];
          updated.sort((a, b) => a.position - b.position);
          return updated;
        });
      } catch (error) {
        console.error('Failed to restore widget:', error);
      }
    },
    [db]
  );

  const reorderWidgets = useCallback(
    async (ids: string[]) => {
      if (!db) return;

      try {
        // Batch reorder in a single SQL transaction
        const sqlite = await getSqlite();
        await sqlite.execAsync('BEGIN TRANSACTION');
        try {
          for (let i = 0; i < ids.length; i++) {
            await sqlite.runAsync(
              'UPDATE widgets SET position = ? WHERE id = ?',
              [i, ids[i]]
            );
          }
          await sqlite.execAsync('COMMIT');
        } catch (e) {
          await sqlite.execAsync('ROLLBACK');
          throw e;
        }

        setWidgetList((prev) => {
          const map = new Map(prev.map((w) => [w.id, w]));
          return ids
            .map((id, idx) => {
              const w = map.get(id);
              return w ? { ...w, position: idx } : null;
            })
            .filter(Boolean) as Widget[];
        });
      } catch (error) {
        console.error('Failed to reorder widgets:', error);
      }
    },
    [db]
  );

  const updateWidgetConfig = useCallback(
    async (id: string, config: string) => {
      if (!db) return;

      try {
        await db.update(widgets).set({ config }).where(eq(widgets.id, id));
        setWidgetList((prev) =>
          prev.map((w) => (w.id === id ? { ...w, config } : w))
        );
      } catch (error) {
        console.error('Failed to update widget config:', error);
      }
    },
    [db]
  );

  const updateWidgetSizing = useCallback(
    async (id: string, sizing: WidgetSizing) => {
      if (!db) return;

      try {
        await db.update(widgets).set({ sizing }).where(eq(widgets.id, id));
        setWidgetList((prev) =>
          prev.map((w) => (w.id === id ? { ...w, sizing } : w))
        );
      } catch (error) {
        console.error('Failed to update widget sizing:', error);
      }
    },
    [db]
  );

  const seedDefaultWidgets = useCallback(async () => {
    if (!db) return;

    const existing = await db.select().from(widgets).limit(1);
    if (existing.length > 0) return;

    const defaults: NewWidget[] = [
      {
        id: generateId(),
        type: 'clock',
        config: JSON.stringify({ clockFace: 'digital1' }),
        position: 0,
        parentId: null,
        appWidgetId: null,
        sizing: 'full',
      },
      {
        id: generateId(),
        type: 'weather',
        config: JSON.stringify({ units: 'celsius', showForecast: false }),
        position: 1,
        parentId: null,
        appWidgetId: null,
        sizing: 'border',
      },
      {
        id: generateId(),
        type: 'music',
        config: JSON.stringify({ showAlbumArt: true }),
        position: 2,
        parentId: null,
        appWidgetId: null,
        sizing: 'border',
      },
    ];

    for (const w of defaults) {
      await db.insert(widgets).values(w);
    }
    await loadWidgets();
  }, [db, loadWidgets]);

  return {
    widgets: widgetList,
    addWidget,
    removeWidget,
    reorderWidgets,
    updateWidgetConfig,
    updateWidgetSizing,
    restoreWidget,
    seedDefaultWidgets,
    loading: loading || dbLoading,
  };
}
