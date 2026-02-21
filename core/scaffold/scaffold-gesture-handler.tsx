import { type ReactNode } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { type GestureDirection } from './types';

interface ScaffoldGestureHandlerProps {
  children: ReactNode;
  onDrag: (
    translationX: number,
    translationY: number,
    lockedDirection: GestureDirection | null,
  ) => GestureDirection | null;
  onDragStopped: (velocityX: number, velocityY: number) => void;
  onDoubleTap: () => void;
  onLongPress: () => void;
  enabled?: boolean;
}

export function ScaffoldGestureHandler({
  children,
  onDrag,
  onDragStopped,
  onDoubleTap,
  onLongPress,
  enabled = true,
}: ScaffoldGestureHandlerProps) {
  const lockedDirection = useSharedValue<GestureDirection | null>(null);

  const handleDrag = (translationX: number, translationY: number) => {
    const result = onDrag(translationX, translationY, lockedDirection.value);
    if (result !== null) {
      lockedDirection.value = result;
    }
  };

  const handleDragEnd = (velocityX: number, velocityY: number) => {
    onDragStopped(velocityX, velocityY);
    lockedDirection.value = null;
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    .minDistance(10)
    .onStart(() => {
      'worklet';
      lockedDirection.value = null;
    })
    .onUpdate((event) => {
      'worklet';
      runOnJS(handleDrag)(event.translationX, event.translationY);
    })
    .onEnd((event) => {
      'worklet';
      runOnJS(handleDragEnd)(event.velocityX, event.velocityY);
    });

  const doubleTap = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      runOnJS(onDoubleTap)();
    });

  const longPress = Gesture.LongPress()
    .enabled(enabled)
    .minDuration(500)
    .onEnd((_event, success) => {
      'worklet';
      if (success) {
        runOnJS(onLongPress)();
      }
    });

  const composed = Gesture.Race(pan, doubleTap, longPress);

  return <GestureDetector gesture={composed}>{children}</GestureDetector>;
}
