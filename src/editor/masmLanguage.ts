// COE224: Assembly Language Studio - CodeMirror 6 MASM Syntax Highlighter

import { StreamLanguage, StringStream } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { ALL_REGISTERS, INSTRUCTIONS, DIRECTIVES } from '../engine/constants';

interface State {
  inComment: boolean;
}

export const masmLanguage = StreamLanguage.define<State>({
  name: 'masm',
  startState: () => ({ inComment: false }),
  tokenTable: {
    comment: tags.comment,
    string: tags.string,
    number: tags.number,
    keyword: tags.keyword,
    atom: tags.atom,
    typeName: tags.typeName,
    label: tags.labelName,
    variable: tags.variableName,
  },
  token: (stream: StringStream): string | null => {
    // Skip spaces
    if (stream.eatSpace()) return null;

    // Comments (; ...)
    if (stream.peek() === ';') {
      stream.skipToEnd();
      return 'comment';
    }

    // Strings ("..." or '...')
    if (stream.peek() === '"' || stream.peek() === "'") {
      const quote = stream.next()!;
      while (!stream.eol()) {
        const next = stream.next();
        if (next === quote) break;
      }
      return 'string';
    }

    // Directives starting with dot (.data, .code, .stack, .model)
    if (stream.peek() === '.') {
      if (stream.match(/^\.[a-zA-Z_?][a-zA-Z0-9_?]*/)) {
        return 'typeName';
      }
    }

    // Numbers: hex (0FFh, 1234h, 0x12), binary (1010b), decimal
    if (
      stream.match(/^0x[0-9a-fA-F]+/i) ||
      stream.match(/^[0-9][0-9a-fA-F]*[hH]/) ||
      stream.match(/^[01]+[bB]/) ||
      stream.match(/^[0-9]+[dD]?/)
    ) {
      return 'number';
    }

    // Identifiers, Registers, Instructions, Directives
    const match = stream.match(/^[a-zA-Z_?@][a-zA-Z0-9_?@]*/);
    if (match) {
      const word = (match as any)[0].toLowerCase();

      // Check if followed by colon -> Label definition (e.g. L1:)
      if (stream.peek() === ':') {
        stream.next(); // consume colon
        return 'label';
      }

      // 1. Registers (EAX, AX, AH, AL, ESP, etc.)
      if (ALL_REGISTERS.includes(word as any)) {
        return 'atom';
      }

      // 2. Instructions (MOV, ADD, SUB, CALL, etc.)
      if (INSTRUCTIONS.includes(word as any)) {
        return 'keyword';
      }

      // 3. Directives & Types (BYTE, WORD, DWORD, PROC, ENDP, OFFSET, PTR, DUP)
      if (DIRECTIVES.includes(word as any)) {
        return 'typeName';
      }

      // Fallback: hex starting with letter without 0 (rare fallback)
      if (/^[0-9a-f]+h$/i.test(word)) {
        return 'number';
      }

      return 'variable';
    }

    // Operators and punctuation
    stream.next();
    return null;
  },
});
