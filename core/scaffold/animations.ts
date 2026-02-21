import { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { ScaffoldAnimation, GestureDirection, ZOOM_SCALE_FACTOR } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function useHomePageAnimatedStyle(
  progress: SharedValue<number>,
  gesture: SharedValue<GestureDirection | null>,
  animation: SharedValue<ScaffoldAnimation | null>,
) {
  return useAnimatedStyle(() => {
    const anim = animation.value;
    const p = progress.value;
    const dir = gesture.value;

    if (!anim || p === 0) {
      return { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }], opacity: 1 };
    }

    if (anim === ScaffoldAnimation.Rubberband) {
      return {
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 - p * ZOOM_SCALE_FACTOR }],
        opacity: 1 - p,
      };
    }

    if (anim === ScaffoldAnimation.Push) {
      let tx = 0;
      let ty = 0;
      if (dir === GestureDirection.Up) ty = -p * SCREEN_HEIGHT;
      else if (dir === GestureDirection.Down) ty = p * SCREEN_HEIGHT;
      else if (dir === GestureDirection.Left) tx = -p * SCREEN_WIDTH;
      else if (dir === GestureDirection.Right) tx = p * SCREEN_WIDTH;

      return {
        transform: [{ translateX: tx }, { translateY: ty }, { scale: 1 }],
        opacity: 1,
      };
    }

    // ZoomIn
    return {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 - p * ZOOM_SCALE_FACTOR }],
      opacity: 1 - p,
    };
  });
}

export function useSecondaryPageAnimatedStyle(
  progress: SharedValue<number>,
  gesture: SharedValue<GestureDirection | null>,
  animation: SharedValue<ScaffoldAnimation | null>,
) {
  return useAnimatedStyle(() => {
    const anim = animation.value;
    const p = progress.value;
    const dir = gesture.value;

    if (!anim || p === 0) {
      return {
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
        opacity: 0,
      };
    }

    if (anim === ScaffoldAnimation.Rubberband) {
      let tx = 0;
      let ty = 0;
      const travel = 24 * (1 - p);
      if (dir === GestureDirection.Up) ty = travel;
      else if (dir === GestureDirection.Down) ty = -travel;
      else if (dir === GestureDirection.Left) tx = travel;
      else if (dir === GestureDirection.Right) tx = -travel;

      return {
        transform: [{ translateX: tx }, { translateY: ty }, { scale: 1 }],
        opacity: p,
      };
    }

    if (anim === ScaffoldAnimation.Push) {
      let tx = 0;
      let ty = 0;
      if (dir === GestureDirection.Up) ty = (1 - p) * SCREEN_HEIGHT;
      else if (dir === GestureDirection.Down) ty = -(1 - p) * SCREEN_HEIGHT;
      else if (dir === GestureDirection.Left) tx = (1 - p) * SCREEN_WIDTH;
      else if (dir === GestureDirection.Right) tx = -(1 - p) * SCREEN_WIDTH;

      return {
        transform: [{ translateX: tx }, { translateY: ty }, { scale: 1 }],
        opacity: 1,
      };
    }

    // ZoomIn
    return {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.97 + p * ZOOM_SCALE_FACTOR }],
      opacity: p,
    };
  });
}

// Derived value for whether secondary page should receive touches
export function useSecondaryPageInteractive(
  progress: SharedValue<number>,
) {
  return useDerivedValue(() => progress.value > 0.5);
}
