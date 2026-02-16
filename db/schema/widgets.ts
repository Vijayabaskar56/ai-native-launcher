import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['weather', 'music', 'calendar', 'clock', 'custom'],
  }).notNull(),
  config: text('config'),
  position: integer('position').notNull(),
  parentId: text('parent_id'),
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
