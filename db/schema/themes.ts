import { text, integer, real, sqliteTable } from 'drizzle-orm/sqlite-core';

export const shapes = sqliteTable('shapes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),

  baseShape: text('base_shape', {
    enum: ['rounded', 'cut'],
  }).notNull(),

  extraSmall: text('extra_small'),
  small: text('small'),
  medium: text('medium'),
  large: text('large'),
  largeIncreased: text('large_increased'),
  extraLarge: text('extra_large'),
  extraLargeIncreased: text('extra_large_increased'),
  extraExtraLarge: text('extra_extra_large'),
});

export type Shape = typeof shapes.$inferSelect;
export type NewShape = typeof shapes.$inferInsert;

export const typography = sqliteTable('typography', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),

  fonts: text('fonts'),

  displayLarge: text('display_large'),
  displayMedium: text('display_medium'),
  displaySmall: text('display_small'),
  headlineLarge: text('headline_large'),
  headlineMedium: text('headline_medium'),
  headlineSmall: text('headline_small'),
  titleLarge: text('title_large'),
  titleMedium: text('title_medium'),
  titleSmall: text('title_small'),
  bodyLarge: text('body_large'),
  bodyMedium: text('body_medium'),
  bodySmall: text('body_small'),
  labelLarge: text('label_large'),
  labelMedium: text('label_medium'),
  labelSmall: text('label_small'),

  emphasizedDisplayLarge: text('emphasized_display_large'),
  emphasizedDisplayMedium: text('emphasized_display_medium'),
  emphasizedDisplaySmall: text('emphasized_display_small'),
  emphasizedHeadlineLarge: text('emphasized_headline_large'),
  emphasizedHeadlineMedium: text('emphasized_headline_medium'),
  emphasizedHeadlineSmall: text('emphasized_headline_small'),
  emphasizedTitleLarge: text('emphasized_title_large'),
  emphasizedTitleMedium: text('emphasized_title_medium'),
  emphasizedTitleSmall: text('emphasized_title_small'),
  emphasizedBodyLarge: text('emphasized_body_large'),
  emphasizedBodyMedium: text('emphasized_body_medium'),
  emphasizedBodySmall: text('emphasized_body_small'),
  emphasizedLabelLarge: text('emphasized_label_large'),
  emphasizedLabelMedium: text('emphasized_label_medium'),
  emphasizedLabelSmall: text('emphasized_label_small'),
});

export type Typography = typeof typography.$inferSelect;
export type NewTypography = typeof typography.$inferInsert;

export const transparencies = sqliteTable('transparencies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),

  background: real('background'),
  surface: real('surface'),
  elevatedSurface: real('elevated_surface'),
});

export type Transparency = typeof transparencies.$inferSelect;
export type NewTransparency = typeof transparencies.$inferInsert;
