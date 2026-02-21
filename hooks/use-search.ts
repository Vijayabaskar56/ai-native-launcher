import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Share } from 'react-native';
import * as Linking from 'expo-linking';
import { eq } from 'drizzle-orm';

import { useDatabase } from '@/db';
import { searchables, tagItems, tags } from '@/db/schema';
import type { SearchFiltersState } from '@/core/types/settings';
import LauncherKit, { type ShortcutInfo } from '@/modules/launcher-kit';

import { useCalculator } from './use-calculator';
import { useFavorites } from './use-favorites';
import { type AppInfo, useInstalledApps } from './use-installed-apps';
import { useSettings } from './use-settings';

export type SearchFilterCategory =
  | 'apps'
  | 'shortcuts'
  | 'contacts'
  | 'events'
  | 'files'
  | 'tools'
  | 'websites'
  | 'articles'
  | 'places';

export type SearchFilterKey = SearchFilterCategory | 'allowNetwork' | 'hiddenItems';

export type SearchActionType =
  | 'call'
  | 'message'
  | 'createContact'
  | 'email'
  | 'scheduleEvent'
  | 'setAlarm'
  | 'timer'
  | 'openUrl'
  | 'webSearch'
  | 'share'
  | 'searchFiles'
  | 'searchWikipedia'
  | 'searchPlaces';

export interface ShortcutSearchResult {
  key: string;
  shortcut: ShortcutInfo;
  appLabel: string;
  totalScore: number;
}

export interface ActionSearchResult {
  id: string;
  source: 'contacts' | 'calendar' | 'files' | 'tools' | 'websites' | 'articles' | 'places' | 'actions';
  actionType: SearchActionType;
  title: string;
  subtitle?: string;
  value: string;
  totalScore: number;
}

export interface SearchResults {
  apps: AppInfo[];
  shortcuts: ShortcutSearchResult[];
  contacts: ActionSearchResult[];
  calendar: ActionSearchResult[];
  files: ActionSearchResult[];
  tools: ActionSearchResult[];
  websites: ActionSearchResult[];
  articles: ActionSearchResult[];
  places: ActionSearchResult[];
  actions: ActionSearchResult[];
}

interface FavoriteTag {
  id: number;
  name: string;
  packageNames: Set<string>;
}

type BestMatch =
  | { kind: 'app'; app: AppInfo }
  | { kind: 'shortcut'; shortcut: ShortcutSearchResult }
  | { kind: 'action'; action: ActionSearchResult }
  | null;

const EMAIL_RE = /^\S+@\S+$/;
const PHONE_RE = /^\+?[0-9\- /.]{4,18}$/;
const URL_RE = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,63}(\b([-a-zA-Z0-9@:%_+.~#?&/=]*))?$/i;
const DURATION_RE = /^([0-9]+)\s?(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hour|hours|d|day|days)$/i;

const FILTER_CATEGORIES: SearchFilterCategory[] = [
  'apps',
  'shortcuts',
  'contacts',
  'events',
  'files',
  'tools',
  'websites',
  'articles',
  'places',
];

const EMPTY_RESULTS: SearchResults = {
  apps: [],
  shortcuts: [],
  contacts: [],
  calendar: [],
  files: [],
  tools: [],
  websites: [],
  articles: [],
  places: [],
  actions: [],
};

const DEFAULT_FILTERS: SearchFiltersState = {
  allowNetwork: false,
  hiddenItems: false,
  apps: true,
  shortcuts: true,
  contacts: true,
  events: true,
  files: true,
  tools: true,
  websites: true,
  articles: true,
  places: true,
};

function normalizeFilters(filters?: Partial<SearchFiltersState> | null): SearchFiltersState {
  return {
    ...DEFAULT_FILTERS,
    ...filters,
  };
}

function allCategoriesEnabled(filters: SearchFiltersState): boolean {
  return FILTER_CATEGORIES.every((key) => filters[key]);
}

function enabledCategoriesCount(filters: SearchFiltersState): number {
  return FILTER_CATEGORIES.filter((key) => filters[key]).length;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function computeSearchScore(query: string, fields: string[]): number {
  const q = normalizeQuery(query);
  if (!q) return 0;

  let best = 0;
  for (const field of fields) {
    const value = field.toLowerCase();
    if (value === q) best = Math.max(best, 1);
    else if (value.startsWith(q)) best = Math.max(best, 0.92);
    else if (value.includes(q)) best = Math.max(best, 0.74);
  }

  return best;
}

function clampWeight(weight: number | null | undefined): number {
  if (!weight) return 0;
  return Math.max(0, Math.min(1, weight));
}

function toTotalScore(searchScore: number, weight: number): number {
  return searchScore * 0.6 + clampWeight(weight) * 0.4;
}

function looksLikeUrl(input: string): boolean {
  return URL_RE.test(input.trim());
}

function toUrl(input: string): string {
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

function parseDurationMinutes(query: string): number | null {
  const match = query.trim().match(DURATION_RE);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  const unit = match[2].toLowerCase();
  if (['s', 'sec', 'secs', 'second', 'seconds'].includes(unit)) return amount / 60;
  if (['m', 'min', 'mins', 'minute', 'minutes'].includes(unit)) return amount;
  if (['h', 'hr', 'hour', 'hours'].includes(unit)) return amount * 60;
  if (['d', 'day', 'days'].includes(unit)) return amount * 24 * 60;

  return null;
}

function buildAction(
  source: ActionSearchResult['source'],
  actionType: SearchActionType,
  title: string,
  value: string,
  subtitle?: string,
  totalScore = 1,
): ActionSearchResult {
  return {
    id: `${source}:${actionType}:${value}`,
    source,
    actionType,
    title,
    subtitle,
    value,
    totalScore,
  };
}

function uniqueActions(actions: ActionSearchResult[]): ActionSearchResult[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.id)) return false;
    seen.add(action.id);
    return true;
  });
}

function maybeReverse<T>(items: T[], reverse: boolean): T[] {
  if (!reverse) return items;
  return [...items].reverse();
}

export function useSearch() {
  const { db, isLoading: dbLoading } = useDatabase();
  const { apps, loading: appsLoading, launchApp } = useInstalledApps();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { searchSources, searchBehavior } = useSettings();

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loadingSources, setLoadingSources] = useState<Set<keyof SearchResults>>(new Set());
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Map<string, number>>(new Map());
  const [filters, setFilters] = useState<SearchFiltersState>(
    normalizeFilters(searchBehavior.searchFilter),
  );
  const [favoriteTags, setFavoriteTags] = useState<FavoriteTag[]>([]);
  const [selectedFavoriteTag, setSelectedFavoriteTag] = useState<number | 'all'>('all');
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);

  const calculatorResult = useCalculator(query);
  const searchGenerationRef = useRef(0);

  const defaultFilters = useMemo(
    () => normalizeFilters(searchBehavior.searchFilter),
    [searchBehavior.searchFilter],
  );

  useEffect(() => {
    if (!db || dbLoading) return;

    let isMounted = true;

    const loadSearchablesMeta = async () => {
      try {
        const rows = await db
          .select({
            key: searchables.key,
            hidden: searchables.hidden,
            weight: searchables.weight,
          })
          .from(searchables);

        if (!isMounted) return;

        const nextHidden = new Set<string>();
        const nextWeights = new Map<string, number>();

        for (const row of rows) {
          if (row.hidden) {
            nextHidden.add(row.key);
          }
          nextWeights.set(row.key, clampWeight(row.weight));
        }

        setHiddenKeys(nextHidden);
        setWeights(nextWeights);
      } catch (error) {
        console.error('Failed to load searchable metadata:', error);
      }
    };

    void loadSearchablesMeta();

    return () => {
      isMounted = false;
    };
  }, [db, dbLoading]);

  useEffect(() => {
    if (!db || dbLoading) return;

    let isMounted = true;

    const loadFavoriteTags = async () => {
      try {
        const rows = await db
          .select({
            id: tags.id,
            name: tags.name,
            searchableKey: tagItems.searchableKey,
          })
          .from(tags)
          .leftJoin(tagItems, eq(tags.id, tagItems.tagId));

        if (!isMounted) return;

        const favoriteSet = new Set(favorites);
        const grouped = new Map<number, FavoriteTag>();

        for (const row of rows) {
          let tag = grouped.get(row.id);
          if (!tag) {
            tag = { id: row.id, name: row.name, packageNames: new Set<string>() };
            grouped.set(row.id, tag);
          }

          if (row.searchableKey && favoriteSet.has(row.searchableKey)) {
            tag.packageNames.add(row.searchableKey);
          }
        }

        const nextTags = Array.from(grouped.values())
          .filter((tag) => tag.packageNames.size > 0)
          .sort((a, b) => a.name.localeCompare(b.name));

        setFavoriteTags(nextTags);
      } catch (error) {
        console.error('Failed to load favorite tags:', error);
      }
    };

    void loadFavoriteTags();

    return () => {
      isMounted = false;
    };
  }, [db, dbLoading, favorites]);

  useEffect(() => {
    if (selectedFavoriteTag === 'all') return;
    if (!favoriteTags.some((tag) => tag.id === selectedFavoriteTag)) {
      setSelectedFavoriteTag('all');
    }
  }, [favoriteTags, selectedFavoriteTag]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setFilters(defaultFilters);
    }
  }, [defaultFilters, query]);

  const setQuery = useCallback(
    (nextQuery: string) => {
      setQueryState((previousQuery) => {
        if (previousQuery.trim().length > 0 && nextQuery.trim().length === 0) {
          setFilters(defaultFilters);
        }
        return nextQuery;
      });
    },
    [defaultFilters],
  );

  const toggleFilter = useCallback((key: SearchFilterKey) => {
    setFilters((previous) => {
      if (key === 'allowNetwork' || key === 'hiddenItems') {
        return {
          ...previous,
          [key]: !previous[key],
        };
      }

      if (allCategoriesEnabled(previous)) {
        return {
          ...previous,
          apps: false,
          shortcuts: false,
          contacts: false,
          events: false,
          files: false,
          tools: false,
          websites: false,
          articles: false,
          places: false,
          [key]: true,
        };
      }

      if (previous[key] && enabledCategoriesCount(previous) === 1) {
        return {
          ...previous,
          apps: true,
          shortcuts: true,
          contacts: true,
          events: true,
          files: true,
          tools: true,
          websites: true,
          articles: true,
          places: true,
        };
      }

      return {
        ...previous,
        [key]: !previous[key],
      };
    });
  }, []);

  const reportLaunch = useCallback(
    async (key: string, type: 'app' | 'shortcut', data: Record<string, unknown>) => {
      if (!db) return;

      try {
        const existing = await db
          .select({
            key: searchables.key,
            launchCount: searchables.launchCount,
            weight: searchables.weight,
          })
          .from(searchables)
          .where(eq(searchables.key, key))
          .limit(1);

        if (existing.length > 0) {
          const current = existing[0];
          const nextLaunchCount = (current.launchCount ?? 0) + 1;
          const nextWeight = Math.min(1, clampWeight(current.weight) * 0.85 + 0.15);

          await db
            .update(searchables)
            .set({
              launchCount: nextLaunchCount,
              weight: nextWeight,
            })
            .where(eq(searchables.key, key));

          setWeights((previous) => {
            const next = new Map(previous);
            next.set(key, nextWeight);
            return next;
          });
          return;
        }

        await db.insert(searchables).values({
          key,
          type,
          data: JSON.stringify(data),
          launchCount: 1,
          weight: 0.15,
        });

        setWeights((previous) => {
          const next = new Map(previous);
          next.set(key, 0.15);
          return next;
        });
      } catch (error) {
        console.error('Failed to report launch weight:', error);
      }
    },
    [db],
  );

  const launchTargetApp = useCallback(
    async (predicates: string[]) => {
      const lowerPredicates = predicates.map((value) => value.toLowerCase());
      const target = apps.find((app) =>
        lowerPredicates.some((predicate) => app.packageName.toLowerCase().includes(predicate)),
      );

      if (target) {
        await launchApp(target.packageName);
      }
    },
    [apps, launchApp],
  );

  const executeAction = useCallback(
    async (action: ActionSearchResult) => {
      try {
        switch (action.actionType) {
          case 'call':
            await Linking.openURL(`tel:${encodeURIComponent(action.value)}`);
            break;
          case 'message':
            await Linking.openURL(`sms:${encodeURIComponent(action.value)}`);
            break;
          case 'email':
            await Linking.openURL(`mailto:${encodeURIComponent(action.value)}`);
            break;
          case 'openUrl':
            await Linking.openURL(toUrl(action.value));
            break;
          case 'webSearch':
            await Linking.openURL(
              `https://www.google.com/search?q=${encodeURIComponent(action.value)}`,
            );
            break;
          case 'searchWikipedia':
            await Linking.openURL(
              `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(action.value)}`,
            );
            break;
          case 'searchPlaces':
            await Linking.openURL(`geo:0,0?q=${encodeURIComponent(action.value)}`);
            break;
          case 'share':
            await Share.share({ message: action.value });
            break;
          case 'searchFiles':
            await launchTargetApp(['files', 'filemanager', 'myfiles']);
            break;
          case 'createContact':
            await launchTargetApp(['contacts', 'dialer']);
            break;
          case 'scheduleEvent':
            await launchTargetApp(['calendar']);
            break;
          case 'setAlarm':
          case 'timer':
            await launchTargetApp(['deskclock', 'clock']);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to execute search action:', error);
      }
    },
    [launchTargetApp],
  );

  const launchShortcut = useCallback(
    async (result: ShortcutSearchResult) => {
      try {
        await LauncherKit.launchShortcut(result.shortcut.packageName, result.shortcut.id);
        await reportLaunch(result.key, 'shortcut', {
          packageName: result.shortcut.packageName,
          shortcutId: result.shortcut.id,
        });
      } catch (error) {
        console.error('Failed to launch shortcut:', error);
      }
    },
    [reportLaunch],
  );

  const launchAppFromSearch = useCallback(
    async (app: AppInfo) => {
      await launchApp(app.packageName);
      await reportLaunch(app.packageName, 'app', {
        packageName: app.packageName,
      });
    },
    [launchApp, reportLaunch],
  );

  const favoriteApps = useMemo(() => {
    const visibleFavorites = favorites
      .map((packageName) => apps.find((app) => app.packageName === packageName))
      .filter((app): app is AppInfo => app !== undefined)
      .filter((app) => filters.hiddenItems || !hiddenKeys.has(app.packageName));

    if (selectedFavoriteTag === 'all') {
      return visibleFavorites;
    }

    const activeTag = favoriteTags.find((tag) => tag.id === selectedFavoriteTag);
    if (!activeTag) {
      return visibleFavorites;
    }

    return visibleFavorites.filter((app) => activeTag.packageNames.has(app.packageName));
  }, [apps, favoriteTags, favorites, filters.hiddenItems, hiddenKeys, selectedFavoriteTag]);

  const allApps = useMemo(() => {
    const visibleApps = apps.filter(
      (app) => filters.hiddenItems || !hiddenKeys.has(app.packageName),
    );

    return maybeReverse(
      [...visibleApps].sort((a, b) => a.label.localeCompare(b.label)),
      searchBehavior.searchResultsBottomUp,
    );
  }, [apps, filters.hiddenItems, hiddenKeys, searchBehavior.searchResultsBottomUp]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    searchGenerationRef.current += 1;
    const searchGeneration = searchGenerationRef.current;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    if (trimmedQuery.length === 0) {
      setResults(EMPTY_RESULTS);
      setLoadingSources(new Set());
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }

    const setSourceLoading = (source: keyof SearchResults, isLoading: boolean) => {
      if (searchGenerationRef.current !== searchGeneration) return;
      setLoadingSources((previous) => {
        const next = new Set(previous);
        if (isLoading) {
          next.add(source);
        } else {
          next.delete(source);
        }
        return next;
      });
    };

    const setSourceResults = <K extends keyof SearchResults>(source: K, value: SearchResults[K]) => {
      if (searchGenerationRef.current !== searchGeneration) return;
      setResults((previous) => ({
        ...previous,
        [source]: value,
      }));
      setSourceLoading(source, false);
    };

    setResults(EMPTY_RESULTS);
    setLoadingSources(new Set());

    const queryScore = (fields: string[]) => computeSearchScore(trimmedQuery, fields);
    const canShowHidden = filters.hiddenItems;

    const rankedApps = (() => {
      if (!searchSources.searchApps || !filters.apps) return [];

      const matches = apps
        .map((app) => {
          const score = queryScore([app.label, app.packageName]);
          if (score <= 0) return null;

          if (!canShowHidden && hiddenKeys.has(app.packageName)) {
            return null;
          }

          return {
            app,
            totalScore: toTotalScore(score, weights.get(app.packageName) ?? 0),
          };
        })
        .filter((result): result is { app: AppInfo; totalScore: number } => result !== null)
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((result) => result.app);

      return maybeReverse(matches, searchBehavior.searchResultsBottomUp);
    })();

    setSourceResults('apps', rankedApps);

    const actionAccumulator: ActionSearchResult[] = [];
    const contactsAccumulator: ActionSearchResult[] = [];
    const calendarAccumulator: ActionSearchResult[] = [];
    const filesAccumulator: ActionSearchResult[] = [];
    const toolsAccumulator: ActionSearchResult[] = [];
    const websitesAccumulator: ActionSearchResult[] = [];

    const normalized = trimmedQuery.trim();
    const parsedDurationMins = parseDurationMinutes(normalized);
    const hasDateOrTimeHint =
      parsedDurationMins !== null ||
      /\d/.test(normalized) ||
      /\b(today|tomorrow|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm)\b/i.test(
        normalized,
      );

    if (searchSources.searchCalculator && searchSources.searchUnitConverter && filters.tools) {
      if (calculatorResult.result !== null) {
        toolsAccumulator.push(
          buildAction(
            'tools',
            'share',
            `Copy result ${calculatorResult.result}`,
            `${calculatorResult.result}`,
            calculatorResult.expression,
            1,
          ),
        );
      }

      if (parsedDurationMins !== null) {
        toolsAccumulator.push(
          buildAction(
            'tools',
            'timer',
            `Start timer for ${normalized}`,
            normalized,
            undefined,
            0.9,
          ),
        );
      }
    }

    const isEmail = EMAIL_RE.test(normalized);
    const isPhone = PHONE_RE.test(normalized);
    const isUrl = looksLikeUrl(normalized);

    if (isPhone) {
      if (searchSources.searchContacts && filters.contacts && normalized.length >= 2) {
        contactsAccumulator.push(
          buildAction('contacts', 'call', `Call ${normalized}`, normalized, undefined, 1),
          buildAction('contacts', 'message', `Message ${normalized}`, normalized, undefined, 0.95),
          buildAction(
            'contacts',
            'createContact',
            `Create contact for ${normalized}`,
            normalized,
            undefined,
            0.9,
          ),
        );
      }

      actionAccumulator.push(
        buildAction('actions', 'call', `Call ${normalized}`, normalized, undefined, 1),
        buildAction('actions', 'message', `Message ${normalized}`, normalized, undefined, 0.95),
        buildAction(
          'actions',
          'createContact',
          `Create contact for ${normalized}`,
          normalized,
          undefined,
          0.9,
        ),
      );
    }

    if (isEmail) {
      if (searchSources.searchContacts && filters.contacts && normalized.length >= 2) {
        contactsAccumulator.push(
          buildAction('contacts', 'email', `Email ${normalized}`, normalized, undefined, 1),
          buildAction(
            'contacts',
            'createContact',
            `Create contact for ${normalized}`,
            normalized,
            undefined,
            0.9,
          ),
        );
      }

      actionAccumulator.push(
        buildAction('actions', 'email', `Email ${normalized}`, normalized, undefined, 1),
        buildAction(
          'actions',
          'createContact',
          `Create contact for ${normalized}`,
          normalized,
          undefined,
          0.9,
        ),
      );
    }

    if (
      searchSources.searchCalendar &&
      filters.events &&
      normalized.length >= 2 &&
      hasDateOrTimeHint
    ) {
      calendarAccumulator.push(
        buildAction(
          'calendar',
          'scheduleEvent',
          `Schedule event: ${normalized}`,
          normalized,
          undefined,
          0.85,
        ),
      );
    }

    if (hasDateOrTimeHint) {
      actionAccumulator.push(
        buildAction(
          'actions',
          'scheduleEvent',
          `Schedule event: ${normalized}`,
          normalized,
          undefined,
          0.8,
        ),
      );
    }

    if (searchSources.searchFiles && filters.files && normalized.length >= 2) {
      filesAccumulator.push(
        buildAction(
          'files',
          'searchFiles',
          `Search files for “${normalized}”`,
          normalized,
          undefined,
          0.8,
        ),
      );
    }

    if (searchSources.searchWebsites && filters.websites && normalized.length > 0 && filters.allowNetwork) {
      if (isUrl) {
        websitesAccumulator.push(
          buildAction('websites', 'openUrl', `Open ${toUrl(normalized)}`, normalized, undefined, 0.9),
        );
      } else {
        websitesAccumulator.push(
          buildAction(
            'websites',
            'webSearch',
            `Search websites for “${normalized}”`,
            normalized,
            undefined,
            0.7,
          ),
        );
      }
    }

    actionAccumulator.push(
      buildAction('actions', 'webSearch', `Search web for “${normalized}”`, normalized, undefined, 0.65),
      buildAction('actions', 'share', `Share “${normalized}”`, normalized, undefined, 0.5),
    );

    if (isUrl) {
      actionAccumulator.unshift(
        buildAction('actions', 'openUrl', `Open ${toUrl(normalized)}`, normalized, undefined, 0.95),
      );
    }

    if (parsedDurationMins !== null) {
      actionAccumulator.push(
        buildAction('actions', 'timer', `Set timer for ${normalized}`, normalized, undefined, 0.85),
        buildAction('actions', 'setAlarm', `Set alarm using ${normalized}`, normalized, undefined, 0.8),
      );
    }

    setSourceResults('contacts', uniqueActions(contactsAccumulator));
    setSourceResults('calendar', uniqueActions(calendarAccumulator));
    setSourceResults('files', uniqueActions(filesAccumulator));
    setSourceResults('tools', uniqueActions(toolsAccumulator));
    setSourceResults('websites', uniqueActions(websitesAccumulator));
    setSourceResults('actions', uniqueActions(actionAccumulator));

    if (
      searchSources.searchAppShortcuts &&
      filters.shortcuts &&
      normalized.length >= 3 &&
      rankedApps.length > 0
    ) {
      setSourceLoading('shortcuts', true);
      void (async () => {
        try {
          const candidates = rankedApps.slice(0, 12);
          const shortcutRows = await Promise.allSettled(
            candidates.map(async (app) => {
              const shortcuts = await LauncherKit.getAppShortcuts(app.packageName);
              return { app, shortcuts };
            }),
          );

          const matches: ShortcutSearchResult[] = [];

          for (const result of shortcutRows) {
            if (result.status !== 'fulfilled') continue;

            for (const shortcut of result.value.shortcuts) {
              const key = `shortcut:${shortcut.packageName}:${shortcut.id}`;
              if (!canShowHidden && hiddenKeys.has(key)) {
                continue;
              }

              const score = queryScore([
                shortcut.shortLabel,
                shortcut.longLabel,
                result.value.app.label,
              ]);

              if (score <= 0) {
                continue;
              }

              const totalScore = toTotalScore(
                score,
                weights.get(key) ?? weights.get(shortcut.packageName) ?? 0,
              );

              matches.push({
                key,
                shortcut,
                appLabel: result.value.app.label,
                totalScore,
              });
            }
          }

          matches.sort((a, b) => b.totalScore - a.totalScore);
          setSourceResults('shortcuts', maybeReverse(matches, searchBehavior.searchResultsBottomUp));
        } catch (error) {
          console.error('Failed to search shortcuts:', error);
          setSourceResults('shortcuts', []);
        }
      })();
    } else {
      setSourceResults('shortcuts', []);
    }

    if (
      searchSources.searchWikipedia &&
      filters.articles &&
      filters.allowNetwork &&
      normalized.length >= 4
    ) {
      setSourceLoading('articles', true);
      timeouts.push(
        setTimeout(() => {
          setSourceResults('articles', [
            buildAction(
              'articles',
              'searchWikipedia',
              `Search Wikipedia for “${normalized}”`,
              normalized,
              undefined,
              0.7,
            ),
          ]);
        }, 750),
      );
    } else {
      setSourceResults('articles', []);
    }

    if (
      searchSources.searchLocations &&
      filters.places &&
      filters.allowNetwork &&
      normalized.length >= 2
    ) {
      setSourceLoading('places', true);
      timeouts.push(
        setTimeout(() => {
          setSourceResults('places', [
            buildAction(
              'places',
              'searchPlaces',
              `Search places for “${normalized}”`,
              normalized,
              undefined,
              0.75,
            ),
          ]);
        }, 250),
      );
    } else {
      setSourceResults('places', []);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [
    apps,
    calculatorResult.expression,
    calculatorResult.result,
    filters,
    hiddenKeys,
    query,
    searchBehavior.searchResultsBottomUp,
    searchSources.searchAppShortcuts,
    searchSources.searchApps,
    searchSources.searchCalculator,
    searchSources.searchCalendar,
    searchSources.searchContacts,
    searchSources.searchFiles,
    searchSources.searchLocations,
    searchSources.searchUnitConverter,
    searchSources.searchWebsites,
    searchSources.searchWikipedia,
    weights,
  ]);

  const bestMatch = useMemo<BestMatch>(() => {
    if (!searchBehavior.searchBarLaunchOnEnter || query.trim().length === 0) {
      return null;
    }

    if (results.apps.length > 0) {
      return { kind: 'app', app: results.apps[0] };
    }
    if (results.shortcuts.length > 0) {
      return { kind: 'shortcut', shortcut: results.shortcuts[0] };
    }
    if (results.calendar.length > 0) {
      return { kind: 'action', action: results.calendar[0] };
    }
    if (results.places.length > 0) {
      return { kind: 'action', action: results.places[0] };
    }
    if (results.contacts.length > 0) {
      return { kind: 'action', action: results.contacts[0] };
    }
    if (results.articles.length > 0) {
      return { kind: 'action', action: results.articles[0] };
    }
    if (results.websites.length > 0) {
      return { kind: 'action', action: results.websites[0] };
    }
    if (results.files.length > 0) {
      return { kind: 'action', action: results.files[0] };
    }
    if (results.actions.length > 0) {
      return { kind: 'action', action: results.actions[0] };
    }

    return null;
  }, [query, results, searchBehavior.searchBarLaunchOnEnter]);

  const launchBestMatchOrAction = useCallback(async () => {
    if (!bestMatch) {
      return;
    }

    if (bestMatch.kind === 'app') {
      await launchAppFromSearch(bestMatch.app);
      return;
    }

    if (bestMatch.kind === 'shortcut') {
      await launchShortcut(bestMatch.shortcut);
      return;
    }

    await executeAction(bestMatch.action);
  }, [bestMatch, executeAction, launchAppFromSearch, launchShortcut]);

  const launchSearchResultApp = useCallback(
    async (app: AppInfo) => {
      await launchAppFromSearch(app);
      Keyboard.dismiss();
    },
    [launchAppFromSearch],
  );

  const launchSearchShortcut = useCallback(
    async (shortcut: ShortcutSearchResult) => {
      await launchShortcut(shortcut);
      Keyboard.dismiss();
    },
    [launchShortcut],
  );

  const runSearchAction = useCallback(
    async (action: ActionSearchResult) => {
      await executeAction(action);
      Keyboard.dismiss();
    },
    [executeAction],
  );

  return {
    query,
    setQuery,
    filters,
    toggleFilter,
    allCategoriesEnabled: allCategoriesEnabled(filters),
    enabledCategories: enabledCategoriesCount(filters),
    allApps,
    favoriteApps,
    favoriteTags,
    selectedFavoriteTag,
    setSelectedFavoriteTag,
    favoritesExpanded,
    setFavoritesExpanded,
    results,
    loadingSources,
    launchApp: launchSearchResultApp,
    launchShortcut: launchSearchShortcut,
    launchAction: runSearchAction,
    launchBestMatchOrAction,
    bestMatch,
    isFavorite,
    toggleFavorite,
    loading: appsLoading || dbLoading,
    searchBehavior,
    searchSources,
  };
}
