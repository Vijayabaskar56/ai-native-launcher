import { screen, userEvent, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/test/test-utils';
import { SwitchPreference } from '@/components/preferences/SwitchPreference';

jest.useFakeTimers();

describe('SwitchPreference', () => {
  test('renders title text', async () => {
    await renderWithProviders(
      <SwitchPreference
        title="Dark Mode"
        value={false}
        onValueChanged={jest.fn()}
      />,
    );

    expect(screen.getByText('Dark Mode')).toBeOnTheScreen();
  });

  test('renders summary when provided', async () => {
    await renderWithProviders(
      <SwitchPreference
        title="Dark Mode"
        summary="Use dark theme"
        value={false}
        onValueChanged={jest.fn()}
      />,
    );

    expect(screen.getByText('Use dark theme')).toBeOnTheScreen();
  });

  test('renders switch with correct initial value', async () => {
    await renderWithProviders(
      <SwitchPreference
        title="Dark Mode"
        value={true}
        onValueChanged={jest.fn()}
      />,
    );

    expect(screen.getByRole('switch')).toBeOnTheScreen();
    expect(screen.getByRole('switch')).toHaveProp('value', true);
  });

  test('calls onValueChanged when switch is toggled', async () => {
    const onValueChangedMock = jest.fn();

    await renderWithProviders(
      <SwitchPreference
        title="Dark Mode"
        value={false}
        onValueChanged={onValueChangedMock}
      />,
    );

    const switchElement = screen.getByRole('switch');
    fireEvent(switchElement, 'valueChange', true);

    expect(onValueChangedMock).toHaveBeenCalledWith(true);
  });

  test('calls onValueChanged with toggled value when row is pressed', async () => {
    const user = userEvent.setup();
    const onValueChangedMock = jest.fn();

    await renderWithProviders(
      <SwitchPreference
        title="Dark Mode"
        value={false}
        onValueChanged={onValueChangedMock}
      />,
    );

    // Pressing the row should toggle the value (false -> true)
    await user.press(screen.getByText('Dark Mode'));

    expect(onValueChangedMock).toHaveBeenCalledWith(true);
  });
});
