import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { searchables } from './searchables';

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  searchableKey: text('searchable_key')
    .notNull()
    .references(() => searchables.key, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
