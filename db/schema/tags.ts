import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { searchables } from './searchables';

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tagItems = sqliteTable('tag_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  searchableKey: text('searchable_key')
    .notNull()
    .references(() => searchables.key, { onDelete: 'cascade' }),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TagItem = typeof tagItems.$inferSelect;
export type NewTagItem = typeof tagItems.$inferInsert;
