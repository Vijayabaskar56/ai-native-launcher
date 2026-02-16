import { text, integer, real, sqliteTable } from 'drizzle-orm/sqlite-core';

export const searchables = sqliteTable('searchables', {
  key: text('key').primaryKey(),
  type: text('type', {
    enum: ['app', 'shortcut', 'contact', 'calendar', 'file', 'website', 'wikipedia', 'location', 'tag'],
  }).notNull(),
  data: text('data').notNull(),
  launchCount: integer('launch_count').default(0),
  pinPosition: integer('pin_position').default(0),
  hidden: integer('hidden', { mode: 'boolean' }).default(false),
  weight: real('weight').default(0),
});

export type Searchable = typeof searchables.$inferSelect;
export type NewSearchable = typeof searchables.$inferInsert;
