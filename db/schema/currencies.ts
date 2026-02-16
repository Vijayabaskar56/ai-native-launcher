import { text, real, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const currencies = sqliteTable('currencies', {
  symbol: text('symbol').primaryKey(),
  value: real('value').notNull(),
  lastUpdate: integer('last_update', { mode: 'timestamp' }).notNull(),
});

export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
