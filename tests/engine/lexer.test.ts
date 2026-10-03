// Unit tests for MASM Lexer & Tokenizer

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/engine/lexer';
import { TokenType } from '../../src/engine/types';

describe('MASM Lexer', () => {
  it('tokenizes instructions, registers, and numbers', () => {
    const code = 'mov eax, 10000h';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.INSTRUCTION);
    expect(tokens[0].value).toBe('mov');
    expect(tokens[1].type).toBe(TokenType.REGISTER);
    expect(tokens[1].value).toBe('eax');
    expect(tokens[2].type).toBe(TokenType.COMMA);
    expect(tokens[3].type).toBe(TokenType.NUMBER);
    expect(tokens[3].numericValue).toBe(0x10000);
  });

  it('handles case-insensitivity seamlessly', () => {
    const code = 'MoV EAX, 0FFH';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.INSTRUCTION);
    expect(tokens[0].value).toBe('mov');
    expect(tokens[1].type).toBe(TokenType.REGISTER);
    expect(tokens[1].value).toBe('eax');
    expect(tokens[3].numericValue).toBe(255);
  });

  it('correctly parses binary and hex radices', () => {
    const code = 'val1 BYTE 1010b\nval2 DWORD 0A5h';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const num1 = tokens.find(t => t.value === '1010b');
    const num2 = tokens.find(t => t.value === '0A5h');

    expect(num1?.numericValue).toBe(10);
    expect(num2?.numericValue).toBe(165);
  });

  it('extracts comments without breaking tokens', () => {
    const code = 'add eax, 5 ; increment by 5\nsub ebx, 2';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const comments = tokens.filter(t => t.type === TokenType.COMMENT);
    expect(comments.length).toBe(1);
    expect(comments[0].value).toBe('; increment by 5');
  });

  it('correctly tokenizes high 8-bit registers ah, bh, ch, dh as registers and not hex numbers', () => {
    const code = 'mov ah, 10h\nmov bh, 20h\nmov ch, 30h\nmov dh, 40h';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const regTokens = tokens.filter(t => t.type === TokenType.REGISTER);
    expect(regTokens.map(t => t.value)).toEqual(['ah', 'bh', 'ch', 'dh']);
  });
});
