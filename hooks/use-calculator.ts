import { useMemo } from 'react';

interface CalculatorResult {
  result: number | null;
  expression: string;
}

// Recursive descent parser for math expressions
// Supports: +, -, *, /, ^, ()
function evaluate(expr: string): number | null {
  let pos = 0;
  const str = expr.replace(/\s/g, '');

  if (str.length === 0) return null;

  // Check if the string looks like a math expression (must contain an operator or parens)
  if (!/[+\-*/^()]/.test(str) || !/\d/.test(str)) return null;

  function parseExpression(): number {
    let left = parseTerm();
    while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
      const op = str[pos++];
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (pos < str.length && (str[pos] === '*' || str[pos] === '/')) {
      const op = str[pos++];
      const right = parsePower();
      if (op === '/' && right === 0) throw new Error('Division by zero');
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parsePower(): number {
    let base = parseUnary();
    if (pos < str.length && str[pos] === '^') {
      pos++;
      const exp = parsePower(); // right-associative
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    if (str[pos] === '-') {
      pos++;
      return -parseAtom();
    }
    if (str[pos] === '+') {
      pos++;
    }
    return parseAtom();
  }

  function parseAtom(): number {
    if (str[pos] === '(') {
      pos++; // skip (
      const val = parseExpression();
      if (str[pos] !== ')') throw new Error('Missing closing parenthesis');
      pos++; // skip )
      return val;
    }

    const start = pos;
    while (pos < str.length && (str[pos] >= '0' && str[pos] <= '9' || str[pos] === '.')) {
      pos++;
    }
    if (pos === start) throw new Error('Unexpected character');
    const num = parseFloat(str.slice(start, pos));
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
  }

  try {
    const result = parseExpression();
    if (pos !== str.length) return null; // Didn't consume entire input
    if (!isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

export function useCalculator(query: string): CalculatorResult {
  return useMemo(() => {
    const result = evaluate(query);
    return { result, expression: query };
  }, [query]);
}
