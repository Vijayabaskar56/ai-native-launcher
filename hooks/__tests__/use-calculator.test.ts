import { renderHook } from '@testing-library/react-native';
import { useCalculator } from '@/hooks/use-calculator';

describe('useCalculator', () => {
  test('evaluates basic addition', () => {
    const { result } = renderHook(() => useCalculator('2+3'));
    expect(result.current.result).toBe(5);
    expect(result.current.expression).toBe('2+3');
  });

  test('evaluates subtraction', () => {
    const { result } = renderHook(() => useCalculator('10-4'));
    expect(result.current.result).toBe(6);
  });

  test('evaluates multiplication', () => {
    const { result } = renderHook(() => useCalculator('6*7'));
    expect(result.current.result).toBe(42);
  });

  test('evaluates division', () => {
    const { result } = renderHook(() => useCalculator('20/4'));
    expect(result.current.result).toBe(5);
  });

  test('evaluates exponentiation', () => {
    const { result } = renderHook(() => useCalculator('2^10'));
    expect(result.current.result).toBe(1024);
  });

  test('respects operator precedence', () => {
    const { result } = renderHook(() => useCalculator('2+3*4'));
    expect(result.current.result).toBe(14);
  });

  test('handles parentheses', () => {
    const { result } = renderHook(() => useCalculator('(2+3)*4'));
    expect(result.current.result).toBe(20);
  });

  test('handles nested parentheses', () => {
    const { result } = renderHook(() => useCalculator('((2+3)*4)+1'));
    expect(result.current.result).toBe(21);
  });

  test('handles negative numbers', () => {
    const { result } = renderHook(() => useCalculator('-5+3'));
    expect(result.current.result).toBe(-2);
  });

  test('handles decimal numbers', () => {
    const { result } = renderHook(() => useCalculator('1.5+2.5'));
    expect(result.current.result).toBe(4);
  });

  test('returns null for non-math strings', () => {
    const { result } = renderHook(() => useCalculator('hello'));
    expect(result.current.result).toBeNull();
  });

  test('returns null for empty string', () => {
    const { result } = renderHook(() => useCalculator(''));
    expect(result.current.result).toBeNull();
  });

  test('returns null for plain numbers without operators', () => {
    const { result } = renderHook(() => useCalculator('42'));
    expect(result.current.result).toBeNull();
  });

  test('returns null for division by zero', () => {
    const { result } = renderHook(() => useCalculator('1/0'));
    expect(result.current.result).toBeNull();
  });

  test('handles whitespace in expressions', () => {
    const { result } = renderHook(() => useCalculator('2 + 3'));
    expect(result.current.result).toBe(5);
  });

  test('handles complex expressions', () => {
    const { result } = renderHook(() => useCalculator('2^3+4*5-10/2'));
    // 8 + 20 - 5 = 23
    expect(result.current.result).toBe(23);
  });
});
