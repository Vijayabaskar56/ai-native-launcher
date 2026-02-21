import { type ScaffoldComponentConfig } from './types';

// Registry of scaffold components that can be navigated to via gestures
const registry = new Map<string, ScaffoldComponentConfig>();

export function registerScaffoldComponent(config: ScaffoldComponentConfig): void {
  registry.set(config.id, config);
}

export function getScaffoldComponent(id: string): ScaffoldComponentConfig | undefined {
  return registry.get(id);
}

export function getAllScaffoldComponents(): ScaffoldComponentConfig[] {
  return Array.from(registry.values());
}

export function unregisterScaffoldComponent(id: string): void {
  registry.delete(id);
}
