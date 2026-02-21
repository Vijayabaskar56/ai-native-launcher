import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/test/test-utils';
import { Preference } from '@/components/preferences/Preference';

jest.useFakeTimers();

describe('Preference', () => {
  test('renders title text', async () => {
    await renderWithProviders(<Preference title="Wi-Fi" />);

    expect(screen.getByText('Wi-Fi')).toBeOnTheScreen();
  });

  test('renders summary when provided', async () => {
    await renderWithProviders(
      <Preference title="Wi-Fi" summary="Connected to HomeNetwork" />,
    );

    expect(screen.getByText('Wi-Fi')).toBeOnTheScreen();
    expect(screen.getByText('Connected to HomeNetwork')).toBeOnTheScreen();
  });

  test('does not render summary when not provided', async () => {
    await renderWithProviders(<Preference title="Wi-Fi" />);

    expect(screen.queryByText('Connected to HomeNetwork')).not.toBeOnTheScreen();
  });

  test('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClickMock = jest.fn();

    await renderWithProviders(
      <Preference title="Wi-Fi" onClick={onClickMock} />,
    );

    await user.press(screen.getByText('Wi-Fi'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClickMock = jest.fn();

    await renderWithProviders(
      <Preference title="Wi-Fi" onClick={onClickMock} enabled={false} />,
    );

    await user.press(screen.getByText('Wi-Fi'));

    expect(onClickMock).not.toHaveBeenCalled();
  });
});
