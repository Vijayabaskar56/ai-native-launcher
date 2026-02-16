import { text, integer, real, sqliteTable } from 'drizzle-orm/sqlite-core';

export const iconPacks = sqliteTable('icon_packs', {
  packageName: text('package_name').primaryKey(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  scale: real('scale').notNull().default(1),
  themed: integer('themed', { mode: 'boolean' }).notNull().default(false),
});

export type IconPack = typeof iconPacks.$inferSelect;
export type NewIconPack = typeof iconPacks.$inferInsert;

export const icons = sqliteTable('icons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  packageName: text('package_name'),
  activityName: text('activity_name'),
  drawable: text('drawable'),
  extras: text('extras'),
  iconPack: text('icon_pack').notNull(),
  name: text('name'),
  themed: integer('themed', { mode: 'boolean' }).notNull().default(false),
});

export type Icon = typeof icons.$inferSelect;
export type NewIcon = typeof icons.$inferInsert;
