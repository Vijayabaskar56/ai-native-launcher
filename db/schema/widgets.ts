import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['weather', 'music', 'calendar', 'clock', 'favorites', 'notes', 'appwidget'],
  }).notNull(),
  config: text('config'),
  position: integer('position').notNull(),
  parentId: text('parent_id'),
  appWidgetId: integer('app_widget_id'),
  sizing: text('sizing', {
    enum: ['border', 'full'],
  }).default('border'),
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
