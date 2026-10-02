// COE224: Assembly Language Studio - Constant Expression Evaluator

import { SymbolEntry } from './types';

export class ExpressionEvaluator {
  /**
   * Evaluates a constant arithmetic expression with MASM operators (+, -, *, /, MOD, parentheses).
   * Also resolves symbols and operators: OFFSET var, TYPE var, LENGTHOF var, SIZEOF var.
   */
  static evaluate(
    tokens: string[],
    symbols: Map<string, SymbolEntry>
  ): { value: number; size?: 1 | 2 | 4 } {
    let index = 0;

    const parsePrimary = (): number => {
      if (index >= tokens.length) throw new Error('Unexpected end of expression');

      const token = tokens[index++];
      const lower = token.toLowerCase();

      // Parentheses
      if (token === '(') {
        const val = parseAddSub();
        if (tokens[index] === ')') {
          index++;
        }
        return val;
      }

      // Unary operators
      if (token === '+') return parsePrimary();
      if (token === '-') return -parsePrimary();

      // MASM operators: OFFSET, TYPE, LENGTHOF, SIZEOF
      if (lower === 'offset') {
        const symToken = tokens[index++];
        const sym = symbols.get(symToken.toLowerCase());
        if (!sym) throw new Error(`Undefined symbol '${symToken}' in OFFSET expression`);
        return sym.address;
      }

      if (lower === 'type') {
        const symToken = tokens[index++];
        const lowerSym = symToken.toLowerCase();
        if (lowerSym === 'byte' || lowerSym === 'sbyte') return 1;
        if (lowerSym === 'word' || lowerSym === 'sword') return 2;
        if (lowerSym === 'dword' || lowerSym === 'sdword' || lowerSym === 'real4') return 4;
        const sym = symbols.get(lowerSym);
        if (!sym || !sym.dataType) throw new Error(`Unknown type or symbol '${symToken}' in TYPE expression`);
        return sym.dataType;
      }

      if (lower === 'lengthof') {
        const symToken = tokens[index++];
        const sym = symbols.get(symToken.toLowerCase());
        if (!sym) throw new Error(`Undefined symbol '${symToken}' in LENGTHOF expression`);
        return sym.elementCount ?? 1;
      }

      if (lower === 'sizeof') {
        const symToken = tokens[index++];
        const sym = symbols.get(symToken.toLowerCase());
        if (!sym) throw new Error(`Undefined symbol '${symToken}' in SIZEOF expression`);
        return sym.totalBytes ?? (sym.dataType ?? 1);
      }

      // Constant or symbol value
      const sym = symbols.get(lower);
      if (sym && sym.value !== undefined) {
        return sym.value;
      }
      if (sym && sym.kind === 'variable') {
        return sym.address;
      }

      // Number literal
      const num = this.parseNumericLiteral(token);
      if (num !== null) return num;

      throw new Error(`Invalid token in expression: '${token}'`);
    };

    const parseMulDiv = (): number => {
      let val = parsePrimary();
      while (index < tokens.length) {
        const op = tokens[index];
        const lowerOp = op.toLowerCase();
        if (op === '*' || lowerOp === 'mul') {
          index++;
          val *= parsePrimary();
        } else if (op === '/' || lowerOp === 'div') {
          index++;
          const divisor = parsePrimary();
          if (divisor === 0) throw new Error('Division by zero in constant expression');
          val = Math.floor(val / divisor);
        } else if (lowerOp === 'mod') {
          index++;
          const divisor = parsePrimary();
          if (divisor === 0) throw new Error('Modulo by zero in constant expression');
          val = val % divisor;
        } else {
          break;
        }
      }
      return val;
    };

    const parseAddSub = (): number => {
      let val = parseMulDiv();
      while (index < tokens.length) {
        const op = tokens[index];
        if (op === '+') {
          index++;
          val += parseMulDiv();
        } else if (op === '-') {
          index++;
          val -= parseMulDiv();
        } else {
          break;
        }
      }
      return val;
    };

    return { value: parseAddSub() };
  }

  static parseNumericLiteral(text: string): number | null {
    const raw = text.toLowerCase();
    if (raw.startsWith('0x')) {
      const p = parseInt(raw.slice(2), 16);
      return isNaN(p) ? null : p;
    }
    if (raw.endsWith('h')) {
      const p = parseInt(raw.slice(0, -1), 16);
      return isNaN(p) ? null : p;
    }
    if (raw.endsWith('b')) {
      const p = parseInt(raw.slice(0, -1), 2);
      return isNaN(p) ? null : p;
    }
    if (raw.endsWith('o') || raw.endsWith('q')) {
      const p = parseInt(raw.slice(0, -1), 8);
      return isNaN(p) ? null : p;
    }
    if (raw.endsWith('d')) {
      const p = parseInt(raw.slice(0, -1), 10);
      return isNaN(p) ? null : p;
    }
    if (/^[0-9]+$/.test(raw)) {
      const p = parseInt(raw, 10);
      return isNaN(p) ? null : p;
    }
    return null;
  }
}
