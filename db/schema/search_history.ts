import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const searchHistory = sqliteTable('search_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;
