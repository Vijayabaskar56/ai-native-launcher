import { type SharedValue } from 'react-native-reanimated';
import { type ReactNode, type ComponentType } from 'react';

// Animation types for scaffold transitions
export enum ScaffoldAnimation {
  Rubberband = 'Rubberband',
  Push = 'Push',
  ZoomIn = 'ZoomIn',
}

// Gesture directions
export enum GestureDirection {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}

// What a gesture action resolves to
export type ScaffoldAction =
  | { type: 'none' }
  | { type: 'page'; componentId: string; animation: ScaffoldAnimation; direction: GestureDirection }
  | { type: 'system'; action: 'notifications' | 'quickSettings' | 'screenLock' | 'recents' | 'powerMenu' };

// Configuration for a scaffold component (pages that can be navigated to)
export interface ScaffoldComponentConfig {
  id: string;
  component: ComponentType<ScaffoldComponentProps>;
  label: string;
}

// Props passed to scaffold page components
export interface ScaffoldComponentProps {
  isActive: boolean;
  progress: SharedValue<number>;
  onRequestClose: () => void;
}

// Full scaffold configuration derived from settings
export interface ScaffoldConfiguration {
  swipeUp: ScaffoldAction;
  swipeDown: ScaffoldAction;
  swipeLeft: ScaffoldAction;
  swipeRight: ScaffoldAction;
  doubleTap: ScaffoldAction;
  longPress: ScaffoldAction;
}

// Scaffold state exposed to consumers
export interface ScaffoldState {
  currentOffset: SharedValue<{ x: number; y: number }>;
  currentProgress: SharedValue<number>;
  currentGesture: SharedValue<GestureDirection | null>;
  isSettledOnSecondaryPage: SharedValue<boolean>;
  activeComponentId: string | null;
}

// Spring config constants
export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 1,
} as const;

export const FLING_VELOCITY_THRESHOLD = 125; // dp/s
export const RUBBERBAND_MULTIPLIER = 1.5;
export const PUSH_SNAP_THRESHOLD = 0.5;
export const ZOOM_SCALE_FACTOR = 0.03;
