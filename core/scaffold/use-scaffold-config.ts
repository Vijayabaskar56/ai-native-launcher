import { useMemo } from 'react';
import { useSettings } from '@/hooks/use-settings';
import type { GestureAction } from '@/core/types/settings';
import {
  type ScaffoldAction,
  type ScaffoldConfiguration,
  ScaffoldAnimation,
  GestureDirection,
} from './types';

function mapGestureAction(action: GestureAction, direction: GestureDirection): ScaffoldAction {
  switch (action) {
    case 'Search':
      return { type: 'page', componentId: 'search', animation: ScaffoldAnimation.Rubberband, direction };
    case 'Widgets':
      return { type: 'page', componentId: 'widgets', animation: ScaffoldAnimation.Push, direction };
    case 'Feed':
      return { type: 'page', componentId: 'feed', animation: ScaffoldAnimation.Push, direction };
    case 'Notifications':
      return { type: 'system', action: 'notifications' };
    case 'QuickSettings':
      return { type: 'system', action: 'quickSettings' };
    case 'ScreenLock':
      return { type: 'system', action: 'screenLock' };
    case 'Recents':
      return { type: 'system', action: 'recents' };
    case 'PowerMenu':
      return { type: 'system', action: 'powerMenu' };
    case 'NoAction':
    default:
      return { type: 'none' };
  }
}

export function useScaffoldConfig(): ScaffoldConfiguration {
  const { gestures } = useSettings();

  return useMemo<ScaffoldConfiguration>(() => ({
    swipeUp: mapGestureAction(gestures.gesturesSwipeUp, GestureDirection.Up),
    swipeDown: mapGestureAction(gestures.gesturesSwipeDown, GestureDirection.Down),
    swipeLeft: mapGestureAction(gestures.gesturesSwipeLeft, GestureDirection.Left),
    swipeRight: mapGestureAction(gestures.gesturesSwipeRight, GestureDirection.Right),
    doubleTap: mapGestureAction(gestures.gesturesDoubleTap, GestureDirection.Up),
    longPress: mapGestureAction(gestures.gesturesLongPress, GestureDirection.Up),
  }), [gestures]);
}
