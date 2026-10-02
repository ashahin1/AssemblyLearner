// COE224: Assembly Language Studio - MASM Lexer & Tokenizer

import { Token, TokenType } from './types';
import { ALL_REGISTERS, INSTRUCTIONS, DIRECTIVES } from './constants';

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];

      // Whitespace (except newline)
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Newline
      if (ch === '\n') {
        tokens.push({
          type: TokenType.NEWLINE,
          value: '\n',
          line: this.line,
          column: this.col,
        });
        this.advance();
        this.line++;
        this.col = 1;
        continue;
      }

      // Comment (; to end of line)
      if (ch === ';') {
        const startCol = this.col;
        let commentText = '';
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
          commentText += this.source[this.pos];
          this.advance();
        }
        tokens.push({
          type: TokenType.COMMENT,
          value: commentText,
          line: this.line,
          column: startCol,
        });
        continue;
      }

      // Comma
      if (ch === ',') {
        tokens.push({ type: TokenType.COMMA, value: ',', line: this.line, column: this.col });
        this.advance();
        continue;
      }

      // Colon
      if (ch === ':') {
        tokens.push({ type: TokenType.COLON, value: ':', line: this.line, column: this.col });
        this.advance();
        continue;
      }

      // Brackets & Parentheses
      if (ch === '[') {
        tokens.push({ type: TokenType.LBRACKET, value: '[', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === ']') {
        tokens.push({ type: TokenType.RBRACKET, value: ']', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === '(') {
        tokens.push({ type: TokenType.LPAREN, value: '(', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === ')') {
        tokens.push({ type: TokenType.RPAREN, value: ')', line: this.line, column: this.col });
        this.advance();
        continue;
      }

      // Operators
      if (ch === '+') {
        tokens.push({ type: TokenType.PLUS, value: '+', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === '-') {
        tokens.push({ type: TokenType.MINUS, value: '-', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === '*') {
        tokens.push({ type: TokenType.STAR, value: '*', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === '/') {
        tokens.push({ type: TokenType.SLASH, value: '/', line: this.line, column: this.col });
        this.advance();
        continue;
      }
      if (ch === '=') {
        tokens.push({ type: TokenType.EQUALS, value: '=', line: this.line, column: this.col });
        this.advance();
        continue;
      }

      // Strings ('...' or "...")
      if (ch === '"' || ch === "'") {
        tokens.push(this.readString(ch));
        continue;
      }

      // Numbers or Identifiers/Directives
      if (this.isDigit(ch)) {
        tokens.push(this.readNumberOrIdentifier());
        continue;
      }

      if (this.isAlphaOrSpecial(ch)) {
        tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      // Unknown character - skip with warning
      this.advance();
    }

    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.col,
    });

    return tokens;
  }

  private advance(): void {
    this.pos++;
    this.col++;
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isHexDigit(ch: string): boolean {
    return (
      (ch >= '0' && ch <= '9') ||
      (ch >= 'a' && ch <= 'f') ||
      (ch >= 'A' && ch <= 'F')
    );
  }

  private isAlphaOrSpecial(ch: string): boolean {
    return (
      (ch >= 'a' && ch <= 'z') ||
      (ch >= 'A' && ch <= 'Z') ||
      ch === '_' ||
      ch === '@' ||
      ch === '?' ||
      ch === '.' ||
      ch === '$'
    );
  }

  private isAlphaNumOrSpecial(ch: string): boolean {
    return this.isAlphaOrSpecial(ch) || this.isDigit(ch);
  }

  private readString(quote: string): Token {
    const startLine = this.line;
    const startCol = this.col;
    this.advance(); // consume opening quote

    let str = '';
    while (this.pos < this.source.length && this.source[this.pos] !== quote && this.source[this.pos] !== '\n') {
      str += this.source[this.pos];
      this.advance();
    }

    if (this.pos < this.source.length && this.source[this.pos] === quote) {
      this.advance(); // consume closing quote
    }

    return {
      type: TokenType.STRING,
      value: str,
      line: startLine,
      column: startCol,
    };
  }

  private readNumberOrIdentifier(): Token {
    const startLine = this.line;
    const startCol = this.col;
    let text = '';

    while (this.pos < this.source.length && this.isAlphaNumOrSpecial(this.source[this.pos])) {
      text += this.source[this.pos];
      this.advance();
    }

    // Try parsing as number with MASM radices
    const num = this.parseMASMNumber(text);
    if (num !== null) {
      return {
        type: TokenType.NUMBER,
        value: text,
        numericValue: num,
        line: startLine,
        column: startCol,
      };
    }

    // Otherwise it's an identifier starting with digits (rare but handle as identifier)
    return {
      type: TokenType.IDENTIFIER,
      value: text,
      line: startLine,
      column: startCol,
    };
  }

  private readIdentifierOrKeyword(): Token {
    const startLine = this.line;
    const startCol = this.col;
    let text = '';

    while (this.pos < this.source.length && this.isAlphaNumOrSpecial(this.source[this.pos])) {
      text += this.source[this.pos];
      this.advance();
    }

    const lower = text.toLowerCase();

    // Check if it's a hex number like 0FFh or ABCh (though MASM requires 0ABCh, let's gracefully support hex with 'h' suffix)
    if (/^[0-9a-f]+h$/i.test(text)) {
      const num = this.parseMASMNumber(text);
      if (num !== null) {
        return {
          type: TokenType.NUMBER,
          value: text,
          numericValue: num,
          line: startLine,
          column: startCol,
        };
      }
    }

    // Register?
    if (ALL_REGISTERS.includes(lower as any)) {
      return {
        type: TokenType.REGISTER,
        value: lower,
        line: startLine,
        column: startCol,
      };
    }

    // Instruction?
    if (INSTRUCTIONS.includes(lower as any)) {
      return {
        type: TokenType.INSTRUCTION,
        value: lower,
        line: startLine,
        column: startCol,
      };
    }

    // Directive / Keyword?
    if (DIRECTIVES.includes(lower as any)) {
      if (lower === 'proc') {
        return { type: TokenType.PROC, value: lower, line: startLine, column: startCol };
      }
      if (lower === 'endp') {
        return { type: TokenType.ENDP, value: lower, line: startLine, column: startCol };
      }
      if (lower === 'byte' || lower === 'sbyte' || lower === 'word' || lower === 'sword' || lower === 'dword' || lower === 'sdword' || lower === 'real4') {
        return { type: TokenType.DATA_TYPE, value: lower, line: startLine, column: startCol };
      }
      if (lower === 'offset' || lower === 'ptr' || lower === 'type' || lower === 'lengthof' || lower === 'sizeof' || lower === 'dup') {
        return { type: TokenType.OPERATOR, value: lower, line: startLine, column: startCol };
      }
      return {
        type: TokenType.DIRECTIVE,
        value: lower,
        line: startLine,
        column: startCol,
      };
    }

    return {
      type: TokenType.IDENTIFIER,
      value: text,
      line: startLine,
      column: startCol,
    };
  }

  private parseMASMNumber(text: string): number | null {
    const raw = text.toLowerCase();

    // 0x... hex prefix
    if (raw.startsWith('0x')) {
      const parsed = parseInt(raw.slice(2), 16);
      return isNaN(parsed) ? null : (parsed >>> 0);
    }

    // ...h hex suffix
    if (raw.endsWith('h')) {
      const hexStr = raw.slice(0, -1);
      if (/^[0-9a-f]+$/i.test(hexStr)) {
        const parsed = parseInt(hexStr, 16);
        return isNaN(parsed) ? null : (parsed >>> 0);
      }
      return null;
    }

    // ...b binary suffix
    if (raw.endsWith('b')) {
      const binStr = raw.slice(0, -1);
      if (/^[01]+$/.test(binStr)) {
        const parsed = parseInt(binStr, 2);
        return isNaN(parsed) ? null : (parsed >>> 0);
      }
      return null;
    }

    // ...o or ...q octal suffix
    if (raw.endsWith('o') || raw.endsWith('q')) {
      const octStr = raw.slice(0, -1);
      if (/^[0-7]+$/.test(octStr)) {
        const parsed = parseInt(octStr, 8);
        return isNaN(parsed) ? null : (parsed >>> 0);
      }
      return null;
    }

    // ...d decimal suffix or plain decimal digits
    if (raw.endsWith('d')) {
      const decStr = raw.slice(0, -1);
      if (/^[0-9]+$/.test(decStr)) {
        const parsed = parseInt(decStr, 10);
        return isNaN(parsed) ? null : (parsed >>> 0);
      }
      return null;
    }

    if (/^[0-9]+$/.test(raw)) {
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? null : (parsed >>> 0);
    }

    return null;
  }
}
