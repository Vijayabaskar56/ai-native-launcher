import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';
import { searchActions } from './schema';

let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: SQLite.SQLiteDatabase | null = null;

export const DATABASE_NAME = 'launcher.db';

export async function getDatabase() {
  if (_db) return _db;

  _sqlite = await SQLite.openDatabaseAsync(DATABASE_NAME);
  _db = drizzle(_sqlite, { schema });
  
  return _db;
}

export async function getSqlite() {
  if (!_sqlite) {
    await getDatabase();
  }
  return _sqlite!;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  const sqlite = await getSqlite();

  await runMigrations(sqlite);
  await seedDefaultData(db);

  return db;
}

async function runMigrations(sqlite: SQLite.SQLiteDatabase) {
  const migrationsTableExists = await sqlite.getFirstAsync<{ count: number }>(
    "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='drizzle_migrations'"
  );

  if (!migrationsTableExists?.count) {
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  const appliedMigrations = await sqlite.getAllAsync<{ hash: string }>(
    'SELECT hash FROM drizzle_migrations'
  );
  const appliedHashes = new Set(appliedMigrations.map(m => m.hash));

  const migrationFiles = [
    {
      hash: '0000_initial',
      sql: `
        CREATE TABLE IF NOT EXISTS "searchables" (
          "key" text PRIMARY KEY NOT NULL,
          "type" text NOT NULL,
          "data" text NOT NULL,
          "launch_count" integer DEFAULT 0,
          "pin_position" integer DEFAULT 0,
          "hidden" integer DEFAULT 0,
          "weight" real DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "favorites" (
          "id" integer PRIMARY KEY AUTOINCREMENT,
          "searchable_key" text NOT NULL,
          "position" integer NOT NULL,
          "created_at" integer NOT NULL,
          FOREIGN KEY ("searchable_key") REFERENCES "searchables"("key") ON UPDATE no action ON DELETE cascade
        );

        CREATE TABLE IF NOT EXISTS "widgets" (
          "id" text PRIMARY KEY NOT NULL,
          "type" text NOT NULL,
          "config" text,
          "position" integer NOT NULL,
          "parent_id" text
        );

        CREATE TABLE IF NOT EXISTS "search_actions" (
          "position" integer PRIMARY KEY NOT NULL,
          "type" text NOT NULL,
          "data" text,
          "label" text,
          "icon" integer,
          "color" integer,
          "custom_icon" text,
          "options" text
        );

        CREATE TABLE IF NOT EXISTS "search_history" (
          "id" integer PRIMARY KEY AUTOINCREMENT,
          "query" text NOT NULL,
          "timestamp" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "tags" (
          "id" integer PRIMARY KEY AUTOINCREMENT,
          "name" text NOT NULL UNIQUE,
          "created_at" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "tag_items" (
          "id" integer PRIMARY KEY AUTOINCREMENT,
          "tag_id" integer NOT NULL,
          "searchable_key" text NOT NULL,
          FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("searchable_key") REFERENCES "searchables"("key") ON UPDATE no action ON DELETE cascade
        );

        CREATE TABLE IF NOT EXISTS "colors" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "core_palette_a1" integer,
          "core_palette_a2" integer,
          "core_palette_a3" integer,
          "core_palette_n1" integer,
          "core_palette_n2" integer,
          "core_palette_e" integer,
          "light_primary" text,
          "light_on_primary" text,
          "light_primary_container" text,
          "light_on_primary_container" text,
          "light_secondary" text,
          "light_on_secondary" text,
          "light_secondary_container" text,
          "light_on_secondary_container" text,
          "light_tertiary" text,
          "light_on_tertiary" text,
          "light_tertiary_container" text,
          "light_on_tertiary_container" text,
          "light_error" text,
          "light_on_error" text,
          "light_error_container" text,
          "light_on_error_container" text,
          "light_surface" text,
          "light_on_surface" text,
          "light_on_surface_variant" text,
          "light_outline" text,
          "light_outline_variant" text,
          "light_inverse_surface" text,
          "light_inverse_on_surface" text,
          "light_inverse_primary" text,
          "light_surface_dim" text,
          "light_surface_bright" text,
          "light_surface_container_lowest" text,
          "light_surface_container_low" text,
          "light_surface_container" text,
          "light_surface_container_high" text,
          "light_surface_container_highest" text,
          "light_background" text,
          "light_on_background" text,
          "light_surface_tint" text,
          "light_scrim" text,
          "light_surface_variant" text,
          "dark_primary" text,
          "dark_on_primary" text,
          "dark_primary_container" text,
          "dark_on_primary_container" text,
          "dark_secondary" text,
          "dark_on_secondary" text,
          "dark_secondary_container" text,
          "dark_on_secondary_container" text,
          "dark_tertiary" text,
          "dark_on_tertiary" text,
          "dark_tertiary_container" text,
          "dark_on_tertiary_container" text,
          "dark_error" text,
          "dark_on_error" text,
          "dark_error_container" text,
          "dark_on_error_container" text,
          "dark_surface" text,
          "dark_on_surface" text,
          "dark_on_surface_variant" text,
          "dark_outline" text,
          "dark_outline_variant" text,
          "dark_inverse_surface" text,
          "dark_inverse_on_surface" text,
          "dark_inverse_primary" text,
          "dark_surface_dim" text,
          "dark_surface_bright" text,
          "dark_surface_container_lowest" text,
          "dark_surface_container_low" text,
          "dark_surface_container" text,
          "dark_surface_container_high" text,
          "dark_surface_container_highest" text,
          "dark_background" text,
          "dark_on_background" text,
          "dark_surface_tint" text,
          "dark_scrim" text,
          "dark_surface_variant" text
        );

        CREATE TABLE IF NOT EXISTS "shapes" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "base_shape" text NOT NULL,
          "extra_small" text,
          "small" text,
          "medium" text,
          "large" text,
          "large_increased" text,
          "extra_large" text,
          "extra_large_increased" text,
          "extra_extra_large" text
        );

        CREATE TABLE IF NOT EXISTS "typography" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "fonts" text,
          "display_large" text,
          "display_medium" text,
          "display_small" text,
          "headline_large" text,
          "headline_medium" text,
          "headline_small" text,
          "title_large" text,
          "title_medium" text,
          "title_small" text,
          "body_large" text,
          "body_medium" text,
          "body_small" text,
          "label_large" text,
          "label_medium" text,
          "label_small" text,
          "emphasized_display_large" text,
          "emphasized_display_medium" text,
          "emphasized_display_small" text,
          "emphasized_headline_large" text,
          "emphasized_headline_medium" text,
          "emphasized_headline_small" text,
          "emphasized_title_large" text,
          "emphasized_title_medium" text,
          "emphasized_title_small" text,
          "emphasized_body_large" text,
          "emphasized_body_medium" text,
          "emphasized_body_small" text,
          "emphasized_label_large" text,
          "emphasized_label_medium" text,
          "emphasized_label_small" text
        );

        CREATE TABLE IF NOT EXISTS "transparencies" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "background" real,
          "surface" real,
          "elevated_surface" real
        );

        CREATE TABLE IF NOT EXISTS "weather_forecasts" (
          "timestamp" integer PRIMARY KEY NOT NULL,
          "temperature" real NOT NULL,
          "min_temp" real NOT NULL,
          "max_temp" real NOT NULL,
          "pressure" real NOT NULL,
          "humidity" real NOT NULL,
          "icon" integer NOT NULL,
          "condition" text NOT NULL,
          "clouds" integer NOT NULL,
          "wind_speed" real NOT NULL,
          "wind_direction" real NOT NULL,
          "precipitation" real NOT NULL,
          "snow" real NOT NULL,
          "night" integer NOT NULL,
          "location" text NOT NULL,
          "provider" text NOT NULL,
          "provider_url" text NOT NULL,
          "precip_probability" integer NOT NULL,
          "snow_probability" integer NOT NULL,
          "update_time" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "currencies" (
          "symbol" text PRIMARY KEY NOT NULL,
          "value" real NOT NULL,
          "last_update" integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "icon_packs" (
          "package_name" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "version" text NOT NULL,
          "scale" real NOT NULL DEFAULT 1,
          "themed" integer NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "icons" (
          "id" integer PRIMARY KEY AUTOINCREMENT,
          "type" text NOT NULL,
          "package_name" text,
          "activity_name" text,
          "drawable" text,
          "extras" text,
          "icon_pack" text NOT NULL,
          "name" text,
          "themed" integer NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "plugins" (
          "authority" text PRIMARY KEY NOT NULL,
          "label" text NOT NULL,
          "description" text,
          "package_name" text NOT NULL,
          "class_name" text NOT NULL,
          "type" text NOT NULL,
          "settings_activity" text,
          "enabled" integer NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS "settings" (
          "key" text PRIMARY KEY NOT NULL,
          "value" text NOT NULL,
          "updated_at" integer NOT NULL
        );
      `
    },
    {
      hash: '0001_widgets_v2',
      sql: `
        ALTER TABLE "widgets" ADD COLUMN "app_widget_id" integer;
        ALTER TABLE "widgets" ADD COLUMN "sizing" text DEFAULT 'border';
      `
    }
  ];

  for (const migration of migrationFiles) {
    if (!appliedHashes.has(migration.hash)) {
      await sqlite.execAsync(migration.sql);
      await sqlite.runAsync(
        'INSERT INTO drizzle_migrations (hash, created_at) VALUES (?, ?)',
        [migration.hash, Date.now()]
      );
    }
  }
}

async function seedDefaultData(db: ReturnType<typeof drizzle>) {
  const existingActions = await db.select().from(searchActions).limit(1);

  if (existingActions.length === 0) {
    const defaultActions = [
      { position: 0, type: 'call' as const },
      { position: 1, type: 'message' as const },
      { position: 2, type: 'email' as const },
      { position: 3, type: 'contact' as const },
      { position: 4, type: 'alarm' as const },
      { position: 5, type: 'timer' as const },
      { position: 6, type: 'calendar' as const },
      { position: 7, type: 'website' as const },
      { position: 8, type: 'websearch' as const },
    ];

    await db.insert(searchActions).values(defaultActions);
  }

  // Seed default widgets on first launch
  const existingWidgets = await db.select().from(schema.widgets).limit(1);
  if (existingWidgets.length === 0) {
    const now = Date.now();
    const defaultWidgets = [
      {
        id: now.toString(36) + 'clk',
        type: 'clock' as const,
        config: JSON.stringify({ clockFace: 'digital1' }),
        position: 0,
        parentId: null,
        appWidgetId: null,
        sizing: 'full' as const,
      },
      {
        id: (now + 1).toString(36) + 'wth',
        type: 'weather' as const,
        config: JSON.stringify({ units: 'celsius', showForecast: false }),
        position: 1,
        parentId: null,
        appWidgetId: null,
        sizing: 'border' as const,
      },
      {
        id: (now + 2).toString(36) + 'msc',
        type: 'music' as const,
        config: JSON.stringify({ showAlbumArt: true }),
        position: 2,
        parentId: null,
        appWidgetId: null,
        sizing: 'border' as const,
      },
    ];

    for (const w of defaultWidgets) {
      await db.insert(schema.widgets).values(w);
    }
  }
}

export type Database = ReturnType<typeof drizzle>;
