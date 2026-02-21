import { ReactElement } from 'react';
import { renderAsync, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@/hooks/use-app-theme';

/**
 * Wraps components with all providers needed for testing.
 * Uses renderAsync for React 19 compatibility (RNTL v13.3+).
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return renderAsync(ui, {
    ...options,
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
  });
}

export { screen, userEvent, fireEventAsync, within, waitFor } from '@testing-library/react-native';
