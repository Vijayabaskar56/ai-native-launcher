import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const searchActions = sqliteTable('search_actions', {
  position: integer('position').primaryKey(),
  type: text('type', {
    enum: ['call', 'message', 'email', 'contact', 'alarm', 'timer', 'calendar', 'website', 'websearch', 'url', 'launch'],
  }).notNull(),
  data: text('data'),
  label: text('label'),
  icon: integer('icon'),
  color: integer('color'),
  customIcon: text('custom_icon'),
  options: text('options'),
});

export type SearchAction = typeof searchActions.$inferSelect;
export type NewSearchAction = typeof searchActions.$inferInsert;
