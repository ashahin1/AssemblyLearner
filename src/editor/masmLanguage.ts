// COE224: Assembly Language Studio - CodeMirror 6 MASM Syntax Highlighter

import { StreamLanguage, StringStream } from '@codemirror/language';
import { ALL_REGISTERS, INSTRUCTIONS, DIRECTIVES } from '../engine/constants';

interface State {
  inComment: boolean;
}

export const masmLanguage = StreamLanguage.define<State>({
  name: 'masm',
  startState: () => ({ inComment: false }),
  token: (stream: StringStream): string | null => {
    // Skip spaces
    if (stream.eatSpace()) return null;

    // Comments
    if (stream.peek() === ';') {
      stream.skipToEnd();
      return 'comment';
    }

    // Strings
    if (stream.peek() === '"' || stream.peek() === "'") {
      const quote = stream.next()!;
      while (!stream.eol()) {
        const next = stream.next();
        if (next === quote) break;
      }
      return 'string';
    }

    // Numbers: hex (0FFh, 1234h, 0x12), binary (1010b), octal, decimal
    if (stream.match(/^0x[0-9a-fA-F]+/i) || stream.match(/^[0-9][0-9a-fA-F]*[hH]/) || stream.match(/^[01]+[bB]/) || stream.match(/^[0-9]+/)) {
      return 'number';
    }

    // Directives starting with dot (.data, .code, .stack, .model)
    if (stream.peek() === '.') {
      stream.match(/^\.[a-zA-Z_?][a-zA-Z0-9_?]*/);
      return 'keyword';
    }

    // Words / Identifiers
    const match = stream.match(/^[a-zA-Z_?@][a-zA-Z0-9_?@]*/);
    if (match) {
      const word = (match as any)[0].toLowerCase();

      // Check if followed by colon -> Label
      if (stream.peek() === ':') {
        stream.next(); // consume colon
        return 'variable-2';
      }

      if (ALL_REGISTERS.includes(word as any)) {
        return 'atom'; // Registers highlighted prominently
      }

      if (INSTRUCTIONS.includes(word as any)) {
        return 'keyword'; // Instructions
      }

      if (DIRECTIVES.includes(word as any)) {
        return 'typeName'; // Data types & directives (BYTE, WORD, DWORD, PROC, ENDP)
      }

      return 'variable';
    }

    // Operators and punctuation
    stream.next();
    return null;
  },
});
