import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const plugins = sqliteTable('plugins', {
  authority: text('authority').primaryKey(),
  label: text('label').notNull(),
  description: text('description'),
  packageName: text('package_name').notNull(),
  className: text('class_name').notNull(),
  type: text('type').notNull(),
  settingsActivity: text('settings_activity'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
});

export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;
