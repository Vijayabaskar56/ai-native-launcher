import { useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  type ScaffoldAction,
  type ScaffoldConfiguration,
  ScaffoldAnimation,
  GestureDirection,
  SPRING_CONFIG,
  FLING_VELOCITY_THRESHOLD,
  RUBBERBAND_MULTIPLIER,
  PUSH_SNAP_THRESHOLD,
} from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const RUBBERBAND_THRESHOLD = 150;

function getActionForDirection(
  direction: GestureDirection,
  config: ScaffoldConfiguration,
): ScaffoldAction {
  switch (direction) {
    case GestureDirection.Up:
      return config.swipeUp;
    case GestureDirection.Down:
      return config.swipeDown;
    case GestureDirection.Left:
      return config.swipeLeft;
    case GestureDirection.Right:
      return config.swipeRight;
  }
}

function getScreenDimension(direction: GestureDirection): number {
  if (direction === GestureDirection.Left || direction === GestureDirection.Right) {
    return SCREEN_WIDTH;
  }
  return SCREEN_HEIGHT;
}

export interface UseScaffoldStateReturn {
  currentOffset: SharedValue<{ x: number; y: number }>;
  currentProgress: SharedValue<number>;
  currentGesture: SharedValue<GestureDirection | null>;
  currentAnimation: SharedValue<ScaffoldAnimation | null>;
  isSettledOnSecondaryPage: SharedValue<boolean>;
  activeComponentId: string | null;
  onDrag: (translationX: number, translationY: number, lockedDirection: GestureDirection | null) => GestureDirection | null;
  onDragStopped: (velocityX: number, velocityY: number) => void;
  onDoubleTap: () => void;
  onLongPress: () => void;
  closeSecondaryPage: () => void;
}

export function useScaffoldState(config: ScaffoldConfiguration): UseScaffoldStateReturn {
  const currentOffset = useSharedValue({ x: 0, y: 0 });
  const currentProgress = useSharedValue(0);
  const currentGesture = useSharedValue<GestureDirection | null>(null);
  const currentAnimation = useSharedValue<ScaffoldAnimation | null>(null);
  const isSettledOnSecondaryPage = useSharedValue(false);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  const snapToSecondary = useCallback((action: ScaffoldAction) => {
    if (action.type === 'page') {
      currentProgress.value = withSpring(1, SPRING_CONFIG);
      isSettledOnSecondaryPage.value = true;
      setActiveComponentId(action.componentId);
      Haptics.selectionAsync();
    } else if (action.type === 'system') {
      currentProgress.value = withSpring(0, SPRING_CONFIG);
      currentOffset.value = { x: 0, y: 0 };
      currentGesture.value = null;
      currentAnimation.value = null;
      isSettledOnSecondaryPage.value = false;
      Haptics.selectionAsync();
    }
  }, [currentProgress, currentOffset, currentGesture, currentAnimation, isSettledOnSecondaryPage]);

  const snapToHome = useCallback(() => {
    currentProgress.value = withSpring(0, SPRING_CONFIG);
    currentOffset.value = { x: 0, y: 0 };
    isSettledOnSecondaryPage.value = false;
    currentGesture.value = null;
    currentAnimation.value = null;
    setActiveComponentId(null);
  }, [currentProgress, currentOffset, currentGesture, currentAnimation, isSettledOnSecondaryPage]);

  const onDrag = useCallback((
    translationX: number,
    translationY: number,
    lockedDirection: GestureDirection | null,
  ): GestureDirection | null => {
    if (isSettledOnSecondaryPage.value) return lockedDirection;

    // Determine direction (first axis wins)
    let direction = lockedDirection;
    if (!direction) {
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      if (absX < 10 && absY < 10) return null; // dead zone
      if (absX > absY) {
        direction = translationX < 0 ? GestureDirection.Left : GestureDirection.Right;
      } else {
        direction = translationY < 0 ? GestureDirection.Up : GestureDirection.Down;
      }
    }

    const action = getActionForDirection(direction, config);
    if (action.type === 'none') return direction;

    currentGesture.value = direction;

    const animation = action.type === 'page' ? action.animation : ScaffoldAnimation.Rubberband;
    currentAnimation.value = animation;

    // Calculate offset in the primary axis
    let primaryOffset: number;
    if (direction === GestureDirection.Left || direction === GestureDirection.Right) {
      primaryOffset = Math.abs(translationX);
    } else {
      primaryOffset = Math.abs(translationY);
    }

    if (animation === ScaffoldAnimation.Rubberband) {
      const maxOffset = RUBBERBAND_THRESHOLD * RUBBERBAND_MULTIPLIER;
      const clampedOffset = Math.min(primaryOffset, maxOffset);
      currentOffset.value = { x: translationX, y: translationY };
      currentProgress.value = Math.min(1, clampedOffset / RUBBERBAND_THRESHOLD);
    } else {
      // Push: full-screen slide
      const screenDim = getScreenDimension(direction);
      currentOffset.value = { x: translationX, y: translationY };
      currentProgress.value = Math.min(1, primaryOffset / screenDim);
    }

    return direction;
  }, [config, currentGesture, currentAnimation, currentOffset, currentProgress, isSettledOnSecondaryPage]);

  const onDragStopped = useCallback((velocityX: number, velocityY: number) => {
    if (isSettledOnSecondaryPage.value) return;

    const direction = currentGesture.value;
    if (!direction) {
      snapToHome();
      return;
    }

    const action = getActionForDirection(direction, config);
    if (action.type === 'none') {
      snapToHome();
      return;
    }

    // Check velocity in gesture direction
    let velocityInDirection: number;
    switch (direction) {
      case GestureDirection.Up:
        velocityInDirection = -velocityY;
        break;
      case GestureDirection.Down:
        velocityInDirection = velocityY;
        break;
      case GestureDirection.Left:
        velocityInDirection = -velocityX;
        break;
      case GestureDirection.Right:
        velocityInDirection = velocityX;
        break;
    }

    const progress = currentProgress.value;

    if (velocityInDirection > FLING_VELOCITY_THRESHOLD) {
      snapToSecondary(action);
    } else if (progress > PUSH_SNAP_THRESHOLD) {
      snapToSecondary(action);
    } else {
      snapToHome();
    }
  }, [config, currentGesture, currentProgress, isSettledOnSecondaryPage, snapToSecondary, snapToHome]);

  const onDoubleTap = useCallback(() => {
    const action = config.doubleTap;
    if (action.type === 'page') {
      currentGesture.value = action.direction;
      currentAnimation.value = ScaffoldAnimation.ZoomIn;
      currentProgress.value = withSpring(1, SPRING_CONFIG);
      isSettledOnSecondaryPage.value = true;
      setActiveComponentId(action.componentId);
      Haptics.selectionAsync();
    } else if (action.type === 'system') {
      Haptics.selectionAsync();
    }
  }, [config, currentGesture, currentAnimation, currentProgress, isSettledOnSecondaryPage]);

  const onLongPress = useCallback(() => {
    const action = config.longPress;
    if (action.type === 'page') {
      currentGesture.value = action.direction;
      currentAnimation.value = ScaffoldAnimation.ZoomIn;
      currentProgress.value = withSpring(1, SPRING_CONFIG);
      isSettledOnSecondaryPage.value = true;
      setActiveComponentId(action.componentId);
      Haptics.selectionAsync();
    } else if (action.type === 'system') {
      Haptics.selectionAsync();
    }
  }, [config, currentGesture, currentAnimation, currentProgress, isSettledOnSecondaryPage]);

  const closeSecondaryPage = useCallback(() => {
    currentProgress.value = withSpring(0, SPRING_CONFIG);
    currentOffset.value = { x: 0, y: 0 };
    isSettledOnSecondaryPage.value = false;
    currentGesture.value = null;
    currentAnimation.value = null;
    setActiveComponentId(null);
  }, [currentProgress, currentOffset, currentGesture, currentAnimation, isSettledOnSecondaryPage]);

  return {
    currentOffset,
    currentProgress,
    currentGesture,
    currentAnimation,
    isSettledOnSecondaryPage,
    activeComponentId,
    onDrag,
    onDragStopped,
    onDoubleTap,
    onLongPress,
    closeSecondaryPage,
  };
}
