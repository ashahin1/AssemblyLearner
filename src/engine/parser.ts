// COE224: Assembly Language Studio - Two-Pass MASM Assembler & Parser

import { Token, TokenType, DataType, SymbolEntry, ParsedInstruction, Operand, AssemblyError } from './types';
import { MEMORY_LAYOUT, ALL_REGISTERS, INSTRUCTIONS } from './constants';
import { ExpressionEvaluator } from './expressions';
import { ErrorEngine } from './errors';

export interface AssemblyResult {
  success: boolean;
  instructions: ParsedInstruction[];
  symbols: Map<string, SymbolEntry>;
  initialData: Map<number, number>; // address -> byte value
  errors: AssemblyError[];
  warnings: string[];
  entryInstructionIndex?: number;
}

export class Parser {
  private tokens: Token[];
  private pos: number = 0;
  private currentSegment: 'none' | 'data' | 'code' | 'stack' = 'none';
  private dataOffset: number = MEMORY_LAYOUT.DATA_BASE;
  private symbols: Map<string, SymbolEntry> = new Map();
  private initialData: Map<number, number> = new Map();
  private errors: AssemblyError[] = [];
  private warnings: string[] = [];
  private entrySymbol: string | null = null;
  private currentProcUses: string[] = [];
  private rawInstructions: Array<{
    mnemonic: string;
    operandTokens: Token[][];
    line: number;
    text: string;
    address: number;
  }> = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  assemble(): AssemblyResult {
    // -------------------------------------------------------------------------
    // PASS 1: Symbol collection, Data Allocation, Label Addresses
    // -------------------------------------------------------------------------
    let codeAddress = MEMORY_LAYOUT.CODE_BASE;

    while (!this.isAtEnd()) {
      // Skip empty newlines and comments
      if (this.match(TokenType.NEWLINE) || this.match(TokenType.COMMENT)) {
        continue;
      }

      const current = this.peek();

      // Check for Segment Directives
      if (current.type === TokenType.DIRECTIVE) {
        const dir = current.value.toLowerCase();
        if (dir === '.data' || dir === '.data?') {
          this.currentSegment = 'data';
          this.advance();
          this.consumeToEndOfLine();
          continue;
        }
        if (dir === '.code') {
          this.currentSegment = 'code';
          this.advance();
          this.consumeToEndOfLine();
          continue;
        }
        if (dir === '.stack') {
          this.currentSegment = 'stack';
          this.advance();
          this.consumeToEndOfLine();
          continue;
        }
        if (dir === '.model' || dir === 'include' || dir === 'proto') {
          // Accepted and ignored for Irvine compatibility
          this.advance();
          this.consumeToEndOfLine();
          continue;
        }
        if (dir === 'end') {
          this.advance();
          if (!this.isAtLineEnd()) {
            const symTok = this.peek();
            if (symTok.type === TokenType.IDENTIFIER) {
              this.entrySymbol = symTok.value.toLowerCase();
              this.advance();
            }
          }
          this.consumeToEndOfLine();
          break; // End of assembly
        }
      }

      // Check for constant definition: IDENTIFIER = value or IDENTIFIER EQU value
      if (this.check(TokenType.IDENTIFIER) && (this.checkNext(TokenType.EQUALS) || this.checkNextValue('equ'))) {
        const idToken = this.advance();
        this.advance(); // consume '=' or 'equ'
        const exprTokens = this.collectUntilNewline();
        try {
          const evalResult = ExpressionEvaluator.evaluate(
            exprTokens.map((t) => t.value),
            this.symbols
          );
          this.symbols.set(idToken.value.toLowerCase(), {
            name: idToken.value,
            kind: 'constant',
            address: 0,
            value: evalResult.value,
            sourceLine: idToken.line,
          });
        } catch (err: any) {
          this.errors.push(ErrorEngine.create(idToken.line, `Error evaluating constant '${idToken.value}': ${err.message}`));
        }
        continue;
      }

      // Handle Data Segment declarations
      if (this.currentSegment === 'data') {
        try {
          this.parseDataDeclaration();
        } catch (err: any) {
          this.errors.push(ErrorEngine.create(current.line, `Syntax error in .data: ${err.message}`));
          this.consumeToEndOfLine();
        }
        continue;
      }

      // Handle Code Segment: labels, procedures, instructions
      if (this.currentSegment === 'code' || this.currentSegment === 'none') {
        // Label with colon: myLabel:
        if (this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.COLON)) {
          const labelToken = this.advance();
          this.advance(); // consume ':'
          const name = labelToken.value.toLowerCase();
          if (this.symbols.has(name)) {
            this.errors.push(ErrorEngine.create(labelToken.line, `Duplicate label '${labelToken.value}'`));
          } else {
            this.symbols.set(name, {
              name: labelToken.value,
              kind: 'label',
              address: this.rawInstructions.length,
              sourceLine: labelToken.line,
            });
          }
          continue;
        }

        // Procedure definition: main PROC [USES reg1 reg2 ...]
        if (this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.PROC)) {
          const procToken = this.advance();
          this.advance(); // consume PROC
          const params: string[] = [];
          if (this.matchValue('uses')) {
            while (!this.isAtLineEnd()) {
              const regToken = this.peek();
              if (regToken.type === TokenType.REGISTER) {
                params.push(regToken.value.toLowerCase());
                this.advance();
              } else {
                break;
              }
            }
          }
          this.symbols.set(procToken.value.toLowerCase(), {
            name: procToken.value,
            kind: 'procedure',
            address: this.rawInstructions.length,
            sourceLine: procToken.line,
            params,
          });
          this.currentProcUses = params;
          for (const reg of params) {
            this.rawInstructions.push({
              mnemonic: 'push',
              operandTokens: [[{ type: TokenType.REGISTER, value: reg, line: procToken.line, column: 0 }]],
              line: procToken.line,
              text: `push ${reg}`,
              address: codeAddress++,
            });
          }
          this.consumeToEndOfLine();
          continue;
        }

        // Procedure end: main ENDP
        if (this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.ENDP)) {
          this.advance(); // consume name
          this.advance(); // consume ENDP
          this.currentProcUses = [];
          this.consumeToEndOfLine();
          continue;
        }

        // Exit macro: exit
        if (this.checkValue('exit')) {
          const exitToken = this.advance();
          this.rawInstructions.push({
            mnemonic: 'invoke_exit',
            operandTokens: [],
            line: exitToken.line,
            text: 'exit',
            address: codeAddress,
          });
          codeAddress++;
          this.consumeToEndOfLine();
          continue;
        }

        // INVOKE directive: INVOKE ExitProcess, 0 or INVOKE SomeProc
        if (this.checkValue('invoke')) {
          const invokeToken = this.advance();
          if (!this.isAtLineEnd()) {
            const targetTok = this.advance();
            const targetLower = targetTok.value.toLowerCase();
            if (targetLower === 'exitprocess') {
              this.rawInstructions.push({
                mnemonic: 'invoke_exit',
                operandTokens: [],
                line: invokeToken.line,
                text: 'exit',
                address: codeAddress++,
              });
              this.consumeToEndOfLine();
              continue;
            } else {
              this.rawInstructions.push({
                mnemonic: 'call',
                operandTokens: [[targetTok]],
                line: invokeToken.line,
                text: `call ${targetTok.value}`,
                address: codeAddress++,
              });
              this.consumeToEndOfLine();
              continue;
            }
          }
          this.consumeToEndOfLine();
          continue;
        }

        // Standard Instruction
        if (this.check(TokenType.INSTRUCTION) || this.check(TokenType.DIRECTIVE)) {
          const instrToken = this.advance();
          const mnemonic = instrToken.value.toLowerCase();
          const operandTokens: Token[][] = [];
          let currentOp: Token[] = [];

          while (!this.isAtLineEnd()) {
            const tok = this.peek();
            if (tok.type === TokenType.COMMA) {
              if (currentOp.length > 0) {
                operandTokens.push(currentOp);
                currentOp = [];
              }
              this.advance();
            } else if (tok.type === TokenType.COMMENT) {
              this.advance();
              break;
            } else {
              currentOp.push(this.advance());
            }
          }
          if (currentOp.length > 0) {
            operandTokens.push(currentOp);
          }

          if (mnemonic === 'ret' && this.currentProcUses.length > 0) {
            for (let r = this.currentProcUses.length - 1; r >= 0; r--) {
              const reg = this.currentProcUses[r];
              this.rawInstructions.push({
                mnemonic: 'pop',
                operandTokens: [[{ type: TokenType.REGISTER, value: reg, line: instrToken.line, column: 0 }]],
                line: instrToken.line,
                text: `pop ${reg}`,
                address: codeAddress++,
              });
            }
          }

          this.rawInstructions.push({
            mnemonic,
            operandTokens,
            line: instrToken.line,
            text: `${mnemonic} ${operandTokens.map((op) => op.map((t) => t.value).join(' ')).join(', ')}`,
            address: codeAddress,
          });
          codeAddress++;
          this.consumeToEndOfLine();
          continue;
        }

        // If unknown token in code, log error and skip
        const errToken = this.advance();
        if (errToken.type !== TokenType.COMMENT && errToken.type !== TokenType.NEWLINE) {
          const knownCandidate = ErrorEngine.findClosestMatch(
            errToken.value,
            [...INSTRUCTIONS, ...ALL_REGISTERS]
          );
          const suggestion = knownCandidate ? `Did you mean '${knownCandidate}'?` : undefined;
          this.errors.push(ErrorEngine.create(errToken.line, `Unexpected token '${errToken.value}' in code`, suggestion));
        }
      }
    }

    // -------------------------------------------------------------------------
    // PASS 2: Instruction Operand Resolution & Type Validation
    // -------------------------------------------------------------------------
    const parsedInstructions: ParsedInstruction[] = [];

    for (const raw of this.rawInstructions) {
      if (raw.mnemonic === 'invoke_exit') {
        parsedInstructions.push({
          mnemonic: 'exit',
          operands: [],
          sourceLine: raw.line,
          sourceText: 'exit',
          address: raw.address,
        });
        continue;
      }

      const operands: Operand[] = [];
      let hasError = false;

      for (const opTokens of raw.operandTokens) {
        try {
          const operand = this.parseOperand(opTokens, raw.line);
          operands.push(operand);
        } catch (err: any) {
          this.errors.push(ErrorEngine.create(raw.line, err.message));
          hasError = true;
        }
      }

      if (!hasError) {
        // Validate instruction operands (e.g. memory to memory MOV)
        this.validateInstruction(raw.mnemonic, operands, raw.line);

        parsedInstructions.push({
          mnemonic: raw.mnemonic,
          operands,
          sourceLine: raw.line,
          sourceText: raw.text,
          address: raw.address,
        });
      }
    }

    let entryInstructionIndex = 0;
    if (this.entrySymbol) {
      const sym = this.symbols.get(this.entrySymbol);
      if (sym && (sym.kind === 'procedure' || sym.kind === 'label')) {
        entryInstructionIndex = sym.address;
      }
    } else if (this.symbols.has('main')) {
      const mainSym = this.symbols.get('main');
      if (mainSym && mainSym.kind === 'procedure') {
        entryInstructionIndex = mainSym.address;
      }
    }

    return {
      success: this.errors.length === 0,
      instructions: parsedInstructions,
      symbols: this.symbols,
      initialData: this.initialData,
      errors: this.errors,
      warnings: this.warnings,
      entryInstructionIndex,
    };
  }

  // ---------------------------------------------------------------------------
  // Helper methods for Pass 1 & Pass 2
  // ---------------------------------------------------------------------------

  private parseDataDeclaration(): void {
    const varNameToken = this.peek();
    if (varNameToken.type !== TokenType.IDENTIFIER) {
      this.advance();
      this.consumeToEndOfLine();
      return;
    }

    const varName = this.advance().value;
    const typeToken = this.peek();

    if (typeToken.type !== TokenType.DATA_TYPE) {
      this.errors.push(
        ErrorEngine.create(
          varNameToken.line,
          `Expected data type (BYTE, WORD, DWORD) for variable '${varName}', found '${typeToken.value}'`
        )
      );
      this.consumeToEndOfLine();
      return;
    }

    this.advance(); // consume data type
    const dType = this.getDataType(typeToken.value);
    const startAddress = this.dataOffset;
    let elementCount = 0;
    let totalBytes = 0;

    // Collect values (comma separated, DUP, strings)
    while (!this.isAtLineEnd()) {
      const tok = this.peek();

      // String literal: msg BYTE "Hello", 0
      if (tok.type === TokenType.STRING) {
        this.advance();
        for (let i = 0; i < tok.value.length; i++) {
          this.initialData.set(this.dataOffset++, tok.value.charCodeAt(i));
          totalBytes++;
          elementCount++;
        }
        if (this.match(TokenType.COMMA)) continue;
        break;
      }

      // DUP operator: <count> DUP(val) where count can be number or constant identifier
      const isCountToken =
        tok.type === TokenType.NUMBER ||
        (tok.type === TokenType.IDENTIFIER && this.symbols.has(tok.value.toLowerCase()));

      if (isCountToken && this.checkNextValue('dup')) {
        let count = 1;
        if (tok.type === TokenType.NUMBER) {
          count = tok.numericValue ?? 1;
        } else {
          count = this.symbols.get(tok.value.toLowerCase())?.value ?? 1;
        }
        this.advance(); // consume count
        this.advance(); // consume DUP

        if (!this.match(TokenType.LPAREN)) {
          this.errors.push(ErrorEngine.create(varNameToken.line, "Expected '(' after DUP"));
          this.consumeToEndOfLine();
          return;
        }

        let fillVal = 0;
        if (this.checkValue('?')) {
          this.advance();
          fillVal = 0;
        } else {
          const innerTokens: Token[] = [];
          while (!this.isAtLineEnd() && !this.check(TokenType.RPAREN)) {
            innerTokens.push(this.advance());
          }
          if (innerTokens.length > 0) {
            try {
              fillVal = ExpressionEvaluator.evaluate(
                innerTokens.map((t) => t.value),
                this.symbols
              ).value;
            } catch (err: any) {
              this.errors.push(
                ErrorEngine.create(varNameToken.line, `Error evaluating DUP expression: ${err.message}`)
              );
              fillVal = 0;
            }
          }
        }

        if (!this.match(TokenType.RPAREN)) {
          this.errors.push(ErrorEngine.create(varNameToken.line, "Expected ')' after DUP value"));
          this.consumeToEndOfLine();
          return;
        }

        count = Math.max(0, Math.min(65536, count));
        for (let i = 0; i < count; i++) {
          this.writeTypeBytes(fillVal, dType);
          totalBytes += dType;
          elementCount++;
        }
        if (this.match(TokenType.COMMA)) continue;
        break;
      }

      // Uninitialized value: val DWORD ?
      if (tok.value === '?') {
        this.advance();
        this.writeTypeBytes(0, dType);
        totalBytes += dType;
        elementCount++;
        if (this.match(TokenType.COMMA)) continue;
        break;
      }

      // Check for comment
      if (tok.type === TokenType.COMMENT) {
        this.advance();
        break;
      }

      // Expressions, negative numbers, constants: e.g. -15, 100, CONST + 4
      const exprTokens: Token[] = [];
      while (!this.isAtLineEnd() && !this.check(TokenType.COMMA) && !this.check(TokenType.COMMENT)) {
        exprTokens.push(this.advance());
      }

      if (exprTokens.length > 0) {
        try {
          const evalRes = ExpressionEvaluator.evaluate(
            exprTokens.map((t) => t.value),
            this.symbols
          );
          this.writeTypeBytes(evalRes.value, dType);
          totalBytes += dType;
          elementCount++;
        } catch (err: any) {
          this.errors.push(
            ErrorEngine.create(
              varNameToken.line,
              `Error evaluating initializer '${exprTokens.map((t) => t.value).join(' ')}': ${err.message}`
            )
          );
        }
        if (this.match(TokenType.COMMA)) continue;
        break;
      }

      this.advance();
    }

    this.symbols.set(varName.toLowerCase(), {
      name: varName,
      kind: 'variable',
      address: startAddress,
      dataType: dType,
      elementCount,
      totalBytes,
      sourceLine: varNameToken.line,
    });

    this.consumeToEndOfLine();
  }

  private writeTypeBytes(val: number, size: DataType): void {
    let unsignedVal = val >>> 0;
    for (let i = 0; i < size; i++) {
      this.initialData.set(this.dataOffset++, unsignedVal & 0xff);
      unsignedVal >>= 8;
    }
  }

  private parseOperand(tokens: Token[], line: number): Operand {
    if (tokens.length === 0) {
      throw new Error(`Line ${line}: Empty operand`);
    }

    // 1. Single Register: eax, al, esi...
    if (tokens.length === 1 && tokens[0].type === TokenType.REGISTER) {
      const reg = tokens[0].value.toLowerCase();
      const size = this.getRegisterSize(reg);
      return { kind: 'register', register: reg, size };
    }

    // 2. Immediate number: 42, 0FFh
    if (tokens.length === 1 && tokens[0].type === TokenType.NUMBER) {
      return { kind: 'immediate', immediate: tokens[0].numericValue ?? 0 };
    }

    // 3. String literal operand: 'A'
    if (tokens.length === 1 && tokens[0].type === TokenType.STRING && tokens[0].value.length === 1) {
      return { kind: 'immediate', immediate: tokens[0].value.charCodeAt(0) };
    }

    // 4. OFFSET varName
    if (tokens.length === 2 && tokens[0].value.toLowerCase() === 'offset') {
      const symName = tokens[1].value.toLowerCase();
      const sym = this.symbols.get(symName);
      if (!sym) {
        const closest = ErrorEngine.findClosestMatch(symName, Array.from(this.symbols.keys()));
        const suggestion = closest ? `Did you mean '${closest}'?` : undefined;
        throw new Error(`Undefined variable '${tokens[1].value}' in OFFSET. ${suggestion ?? ''}`);
      }
      return { kind: 'immediate', immediate: sym.address };
    }

    // 5. PTR Prefix Extraction: e.g. BYTE PTR [esi], WORD PTR var1, or [BYTE PTR esi]
    let ptrSize: 1 | 2 | 4 | undefined;
    let remainingTokens = tokens;

    if (tokens.length >= 3 && tokens[1].value.toLowerCase() === 'ptr') {
      ptrSize = this.resolvePtrSize(tokens[0], line);
      remainingTokens = tokens.slice(2);
    }

    if (
      remainingTokens[0]?.type === TokenType.LBRACKET &&
      remainingTokens.length >= 4 &&
      remainingTokens[2].value.toLowerCase() === 'ptr'
    ) {
      if (ptrSize !== undefined) {
        throw new Error(`Line ${line}: Duplicate PTR size specifier in memory operand`);
      }
      ptrSize = this.resolvePtrSize(remainingTokens[1], line);
      remainingTokens = [remainingTokens[0], ...remainingTokens.slice(3)];
    }

    // 6. Memory Operand Detection
    const isMemoryOperand =
      ptrSize !== undefined ||
      remainingTokens.some((t) => t.type === TokenType.LBRACKET || t.type === TokenType.RBRACKET) ||
      remainingTokens.some((t, idx) => {
        if (t.type !== TokenType.IDENTIFIER) return false;
        const sym = this.symbols.get(t.value.toLowerCase());
        if (!sym || sym.kind !== 'variable') return false;
        const prev = idx > 0 ? remainingTokens[idx - 1].value.toLowerCase() : '';
        return !['offset', 'type', 'lengthof', 'sizeof'].includes(prev);
      });

    if (isMemoryOperand) {
      return this.parseMemoryOperand(remainingTokens, ptrSize, line);
    }

    // 7. Label reference for JMP / CALL (excluding constants)
    if (tokens.length === 1 && (tokens[0].type === TokenType.IDENTIFIER || tokens[0].type === TokenType.INSTRUCTION)) {
      const labelName = tokens[0].value.toLowerCase();
      const sym = this.symbols.get(labelName);
      if (!sym || sym.kind !== 'constant') {
        return {
          kind: 'label',
          symbolRef: labelName,
        };
      }
    }

    // 8. Fallback: Constant expression evaluation
    try {
      const evalRes = ExpressionEvaluator.evaluate(
        tokens.map((t) => t.value),
        this.symbols
      );
      return { kind: 'immediate', immediate: evalRes.value };
    } catch {
      throw new Error(`Line ${line}: Invalid operand syntax: '${tokens.map((t) => t.value).join(' ')}'`);
    }
  }

  private resolvePtrSize(tok: Token, line: number): 1 | 2 | 4 {
    const sizeWord = tok.value.toLowerCase();
    if (sizeWord === 'byte' || sizeWord === 'sbyte') return 1;
    if (sizeWord === 'word' || sizeWord === 'sword') return 2;
    if (sizeWord === 'dword' || sizeWord === 'sdword' || sizeWord === 'real4') return 4;
    throw new Error(
      `Line ${line}: Invalid size specifier '${tok.value}' before PTR (expected BYTE, WORD, or DWORD)`
    );
  }

  private normalizeMemoryBrackets(tokens: Token[], line: number): Token[] {
    let bracketDepth = 0;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === TokenType.LBRACKET) {
        if (tokens[i + 1]?.type === TokenType.RBRACKET) {
          throw new Error(`Line ${line}: Empty memory brackets '[]'`);
        }
        bracketDepth++;
      } else if (t.type === TokenType.RBRACKET) {
        bracketDepth--;
        if (bracketDepth < 0) {
          throw new Error(`Line ${line}: Unmatched ']' in memory operand`);
        }
      }
    }
    if (bracketDepth !== 0) {
      throw new Error(`Line ${line}: Unclosed '[' in memory operand`);
    }

    const normalized: Token[] = [];
    const lbracketPrevTypes = new Set([
      TokenType.IDENTIFIER,
      TokenType.NUMBER,
      TokenType.REGISTER,
      TokenType.RBRACKET,
      TokenType.RPAREN,
    ]);
    const rbracketNextTypes = new Set([
      TokenType.IDENTIFIER,
      TokenType.NUMBER,
      TokenType.REGISTER,
      TokenType.OPERATOR,
      TokenType.LPAREN,
    ]);

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === TokenType.LBRACKET) {
        const prev = i > 0 ? tokens[i - 1] : undefined;
        if (prev && lbracketPrevTypes.has(prev.type)) {
          normalized.push({ type: TokenType.PLUS, value: '+', line: tok.line, column: tok.column });
        }
        continue;
      }
      if (tok.type === TokenType.RBRACKET) {
        const next = i + 1 < tokens.length ? tokens[i + 1] : undefined;
        if (next && rbracketNextTypes.has(next.type)) {
          normalized.push({ type: TokenType.PLUS, value: '+', line: tok.line, column: tok.column });
        }
        continue;
      }
      normalized.push(tok);
    }

    return normalized;
  }

  private splitAdditiveTerms(tokens: Token[], line: number): Array<{ sign: 1 | -1; tokens: Token[] }> {
    const terms: Array<{ sign: 1 | -1; tokens: Token[] }> = [];
    let currentSign: 1 | -1 = 1;
    let currentTokens: Token[] = [];
    let parenDepth = 0;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === TokenType.LPAREN) {
        parenDepth++;
        currentTokens.push(tok);
        continue;
      }
      if (tok.type === TokenType.RPAREN) {
        parenDepth--;
        if (parenDepth < 0) {
          throw new Error(`Line ${line}: Unmatched ')' in memory operand`);
        }
        currentTokens.push(tok);
        continue;
      }

      if (parenDepth === 0 && (tok.type === TokenType.PLUS || tok.type === TokenType.MINUS)) {
        const lastTok = currentTokens.length > 0 ? currentTokens[currentTokens.length - 1] : undefined;
        const isUnary =
          !lastTok ||
          lastTok.type === TokenType.STAR ||
          lastTok.type === TokenType.SLASH ||
          lastTok.type === TokenType.OPERATOR ||
          lastTok.type === TokenType.PLUS ||
          lastTok.type === TokenType.MINUS;

        if (!isUnary) {
          terms.push({ sign: currentSign, tokens: currentTokens });
          currentTokens = [];
          currentSign = tok.type === TokenType.PLUS ? 1 : -1;
          continue;
        }
      }

      currentTokens.push(tok);
    }

    if (parenDepth !== 0) {
      throw new Error(`Line ${line}: Unclosed '(' in memory operand`);
    }
    if (currentTokens.length === 0) {
      throw new Error(`Line ${line}: Incomplete expression in memory operand`);
    }
    terms.push({ sign: currentSign, tokens: currentTokens });
    return terms;
  }

  private evaluateMemoryConstantTokens(tokens: Token[], line: number): {
    value: number;
    symbolRef?: string;
    varSize?: 1 | 2 | 4;
  } {
    let symbolRef: string | undefined;
    let varSize: 1 | 2 | 4 | undefined;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === TokenType.IDENTIFIER) {
        const sym = this.symbols.get(tok.value.toLowerCase());
        if (!sym) {
          throw new Error(`Line ${line}: Undefined symbol '${tok.value}' in memory operand`);
        }
        if (sym.kind === 'variable') {
          const prevLower = i > 0 ? tokens[i - 1].value.toLowerCase() : '';
          if (!['type', 'lengthof', 'sizeof', 'offset'].includes(prevLower)) {
            symbolRef = sym.name;
            varSize = sym.dataType as 1 | 2 | 4 | undefined;
          }
        }
      }
    }

    try {
      const evalRes = ExpressionEvaluator.evaluate(
        tokens.map((t) => t.value),
        this.symbols
      );
      return { value: evalRes.value, symbolRef, varSize };
    } catch (err: any) {
      throw new Error(`Line ${line}: Invalid expression in memory operand: ${err.message}`);
    }
  }

  private parseMemoryOperand(tokens: Token[], ptrSize: 1 | 2 | 4 | undefined, line: number): Operand {
    const normalized = this.normalizeMemoryBrackets(tokens, line);
    const terms = this.splitAdditiveTerms(normalized, line);

    const unscaledRegs: string[] = [];
    const scaledRegs: Array<{ reg: string; scale: 2 | 4 | 8 }> = [];
    let displacement = 0;
    let symbolRef: string | undefined;
    let varSize: 1 | 2 | 4 | undefined;

    for (const term of terms) {
      const regTokens = term.tokens.filter((t) => t.type === TokenType.REGISTER);

      if (regTokens.length > 0) {
        if (regTokens.length > 1) {
          throw new Error(`Line ${line}: Cannot multiply multiple registers in memory operand`);
        }
        const regName = regTokens[0].value.toLowerCase();
        if (term.sign === -1 || term.tokens[0]?.type === TokenType.MINUS) {
          throw new Error(`Line ${line}: Cannot subtract register '${regName}' in memory address`);
        }

        const trimmedTokens =
          term.tokens[0]?.type === TokenType.PLUS ? term.tokens.slice(1) : term.tokens;

        if (trimmedTokens.length === 1 && trimmedTokens[0].type === TokenType.REGISTER) {
          unscaledRegs.push(regName);
          continue;
        }

        let starIdx = -1;
        let depth = 0;
        for (let k = 0; k < trimmedTokens.length; k++) {
          if (trimmedTokens[k].type === TokenType.LPAREN) depth++;
          else if (trimmedTokens[k].type === TokenType.RPAREN) depth--;
          else if (depth === 0 && trimmedTokens[k].type === TokenType.STAR) {
            if (starIdx !== -1) {
              throw new Error(`Line ${line}: Invalid register scaling expression in memory operand`);
            }
            starIdx = k;
          }
        }

        if (starIdx === -1) {
          throw new Error(`Line ${line}: Invalid register expression in memory operand`);
        }

        const left = trimmedTokens.slice(0, starIdx);
        const right = trimmedTokens.slice(starIdx + 1);
        let scaleTokens: Token[];

        if (left.length === 1 && left[0].type === TokenType.REGISTER && right.length > 0) {
          scaleTokens = right;
        } else if (right.length === 1 && right[0].type === TokenType.REGISTER && left.length > 0) {
          scaleTokens = left;
        } else {
          throw new Error(`Line ${line}: Invalid register scaling syntax for '${regName}' in memory operand`);
        }

        const { value: scaleVal } = this.evaluateMemoryConstantTokens(scaleTokens, line);
        if (scaleVal !== 1 && scaleVal !== 2 && scaleVal !== 4 && scaleVal !== 8) {
          throw new Error(
            `Line ${line}: Invalid index scale factor '${scaleVal}' for register '${regName}' (must be 1, 2, 4, or 8)`
          );
        }

        if (scaleVal === 1) {
          unscaledRegs.push(regName);
        } else {
          scaledRegs.push({ reg: regName, scale: scaleVal });
        }
        continue;
      }

      // Displacement term
      const evaluated = this.evaluateMemoryConstantTokens(term.tokens, line);
      displacement += term.sign * evaluated.value;
      if (evaluated.symbolRef !== undefined) {
        symbolRef = evaluated.symbolRef;
      }
      if (evaluated.varSize !== undefined) {
        varSize = evaluated.varSize;
      }
    }

    if (scaledRegs.length > 1) {
      throw new Error(`Line ${line}: Only one register can have a scale multiplier in a memory operand`);
    }
    if (unscaledRegs.length + scaledRegs.length > 2) {
      throw new Error(
        `Line ${line}: Too many registers in memory operand (maximum 1 base + 1 index register)`
      );
    }

    let baseReg: string | undefined;
    let indexReg: string | undefined;
    let scale: 1 | 2 | 4 | 8 = 1;

    if (scaledRegs.length === 1) {
      indexReg = scaledRegs[0].reg;
      scale = scaledRegs[0].scale;
      baseReg = unscaledRegs[0];
    } else {
      baseReg = unscaledRegs[0];
      indexReg = unscaledRegs[1];
      scale = 1;
    }

    return {
      kind: 'memory',
      baseReg,
      indexReg,
      scale,
      displacement: displacement >>> 0,
      symbolRef,
      size: ptrSize ?? varSize,
      ptrSize,
    };
  }

  private validateInstruction(mnemonic: string, operands: Operand[], line: number): void {
    const m = mnemonic.toLowerCase();

    // 0-operand instructions
    const noOpInstrs = ['ret', 'pushad', 'popad', 'pushfd', 'popfd', 'cbw', 'cwd', 'cdq', 'exit', 'crlf', 'clrscr', 'dumpregs', 'waitmsg'];
    if (noOpInstrs.includes(m)) {
      if (operands.length > 0) {
        this.errors.push(ErrorEngine.create(line, `'${m.toUpperCase()}' does not take any operands.`));
      }
      return;
    }

    // 1-operand instructions
    const oneOpInstrs = [
      'inc', 'dec', 'neg', 'not', 'push', 'pop', 'mul', 'div', 'idiv',
      'call', 'jmp',
      'jz', 'je', 'jnz', 'jne', 'jc', 'jnc', 'js', 'jns', 'jo', 'jno',
      'ja', 'jnbe', 'jae', 'jnb', 'jb', 'jnae', 'jbe', 'jna',
      'jg', 'jnle', 'jge', 'jnl', 'jl', 'jnge', 'jle', 'jng',
      'loop', 'loope', 'loopz', 'loopne', 'loopnz',
    ];
    if (oneOpInstrs.includes(m)) {
      if (operands.length !== 1) {
        this.errors.push(ErrorEngine.create(line, `Expected 1 operand for '${m.toUpperCase()}', found ${operands.length}.`));
        return;
      }
    }

    // 2-operand instructions
    const twoOpInstrs = [
      'mov', 'movzx', 'movsx', 'xchg', 'lea', 'add', 'sub', 'cmp',
      'and', 'or', 'xor', 'test', 'shl', 'shr', 'sal', 'sar', 'rol', 'ror', 'rcl', 'rcr'
    ];
    if (twoOpInstrs.includes(m)) {
      if (operands.length !== 2) {
        this.errors.push(ErrorEngine.create(line, `Expected 2 operands for '${m.toUpperCase()}', found ${operands.length}.`));
        return;
      }
    }

    // IMUL can be 1, 2, or 3 operands
    if (m === 'imul') {
      if (operands.length < 1 || operands.length > 3) {
        this.errors.push(ErrorEngine.create(line, `Expected 1, 2, or 3 operands for 'IMUL', found ${operands.length}.`));
        return;
      }
    }

    // Disallow immediate destinations
    const writeDestInstrs = [
      'mov', 'movzx', 'movsx', 'add', 'sub', 'inc', 'dec', 'neg', 'not',
      'pop', 'shl', 'shr', 'sal', 'sar', 'rol', 'ror', 'rcl', 'rcr', 'and', 'or', 'xor'
    ];
    if (writeDestInstrs.includes(m) && operands.length >= 1 && operands[0].kind === 'immediate') {
      this.errors.push(ErrorEngine.create(line, `Cannot use immediate constant as destination in '${m.toUpperCase()}'.`));
    }

    // XCHG cannot use immediate operands
    if (m === 'xchg') {
      if (operands.some((op) => op.kind === 'immediate')) {
        this.errors.push(ErrorEngine.create(line, "XCHG instruction cannot accept an immediate constant."));
      }
      if (operands[0]?.kind === 'memory' && operands[1]?.kind === 'memory') {
        this.errors.push(ErrorEngine.create(line, "XCHG cannot exchange two memory operands directly."));
      }
    }

    // LEA: destination must be register, source must be memory
    if (m === 'lea') {
      if (operands[0]?.kind !== 'register') {
        this.errors.push(ErrorEngine.create(line, "LEA destination must be a general-purpose register."));
      }
      if (operands[1]?.kind !== 'memory') {
        this.errors.push(ErrorEngine.create(line, "LEA source operand must be a memory reference."));
      }
    }

    // Memory to memory check
    if (['mov', 'add', 'sub', 'cmp', 'and', 'or', 'xor', 'test'].includes(m)) {
      if (operands.length === 2 && operands[0].kind === 'memory' && operands[1].kind === 'memory') {
        this.errors.push(
          ErrorEngine.create(
            line,
            `x86 architecture cannot perform memory-to-memory '${m.toUpperCase()}'.`,
            `Load the source into a register first: e.g. 'mov eax, source' then '${m} dest, eax'.`
          )
        );
      }
    }

    // Operand size inference for untyped memory operands
    if (['mov', 'xchg', 'add', 'sub', 'cmp', 'and', 'or', 'xor', 'test'].includes(m)) {
      if (operands[0]?.kind === 'memory' && operands[0].size === undefined && operands[1]?.kind === 'register' && operands[1].size !== undefined) {
        operands[0].size = operands[1].size;
      }
      if (operands[1]?.kind === 'memory' && operands[1].size === undefined && operands[0]?.kind === 'register' && operands[0].size !== undefined) {
        operands[1].size = operands[0].size;
      }
    } else if (m === 'imul' && (operands.length === 2 || operands.length === 3)) {
      if (operands[1]?.kind === 'memory' && operands[1].size === undefined && operands[0]?.kind === 'register' && operands[0].size !== undefined) {
        operands[1].size = operands[0].size;
      }
    } else if (m === 'movzx' || m === 'movsx') {
      if (operands[1]?.kind === 'immediate') {
        this.errors.push(ErrorEngine.create(line, `${m.toUpperCase()} source operand cannot be an immediate constant.`));
      } else if (operands[1]?.kind === 'memory' && operands[1].size === undefined) {
        if (operands[0]?.size === 2) {
          operands[1].size = 1;
        } else {
          this.errors.push(
            ErrorEngine.create(
              line,
              `Ambiguous memory operand size in '${m.toUpperCase()}': specify 'BYTE PTR' or 'WORD PTR'.`
            )
          );
          return;
        }
      }
    } else if (m === 'lea') {
      if (operands[1]?.kind === 'memory' && operands[1].size === undefined) {
        operands[1].size = 4;
      }
    } else if (m === 'push' || m === 'pop') {
      if (operands[0]?.kind === 'memory' && operands[0].size === undefined) {
        operands[0].size = 4;
      }
    } else if (['mul', 'div', 'idiv'].includes(m)) {
      if (operands[0]?.kind === 'immediate') {
        this.errors.push(
          ErrorEngine.create(
            line,
            `'${m.toUpperCase()}' cannot take an immediate constant directly; use a register or memory operand.`
          )
        );
      }
    }

    // Reject any remaining unresolved memory operand sizes
    for (const op of operands) {
      if (op.kind === 'memory' && op.size === undefined) {
        this.errors.push(
          ErrorEngine.create(
            line,
            `Instruction operand must have size in '${m.toUpperCase()}' (memory operand has no inferred size).`,
            `Specify 'BYTE PTR', 'WORD PTR', or 'DWORD PTR' before the memory operand.`
          )
        );
      }
    }

    // MOVZX / MOVSX validation
    if (m === 'movzx' || m === 'movsx') {
      if (operands[0]?.kind !== 'register') {
        this.errors.push(ErrorEngine.create(line, `${m.toUpperCase()} destination must be a register.`));
      }
      if (operands[0]?.size && operands[1]?.size && operands[0].size <= operands[1].size) {
        this.errors.push(
          ErrorEngine.create(
            line,
            `${m.toUpperCase()} destination (${operands[0].size * 8}-bit) must be larger than source (${operands[1].size * 8}-bit).`
          )
        );
      }
    }

    // Size mismatch check between register and memory or register and register
    if (
      operands.length === 2 &&
      operands[0].size &&
      operands[1].size &&
      operands[1].kind !== 'immediate' &&
      !['movzx', 'movsx', 'lea', 'shl', 'shr', 'sal', 'sar', 'rol', 'ror', 'rcl', 'rcr'].includes(m)
    ) {
      if (operands[0].size !== operands[1].size) {
        this.errors.push(
          ErrorEngine.create(
            line,
            `Operand size mismatch in '${m.toUpperCase()}': destination is ${operands[0].size * 8}-bit, but source is ${operands[1].size * 8}-bit.`
          )
        );
      }
    }
  }

  private getRegisterSize(reg: string): 1 | 2 | 4 {
    const r = reg.toLowerCase();
    if (['al', 'ah', 'bl', 'bh', 'cl', 'ch', 'dl', 'dh'].includes(r)) return 1;
    if (['ax', 'bx', 'cx', 'dx', 'si', 'di', 'bp', 'sp'].includes(r)) return 2;
    return 4;
  }

  private getDataType(name: string): DataType {
    const n = name.toLowerCase();
    if (n === 'byte' || n === 'sbyte') return DataType.BYTE;
    if (n === 'word' || n === 'sword') return DataType.WORD;
    return DataType.DWORD;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.tokens.length || this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.tokens[this.pos - 1];
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkNext(type: TokenType): boolean {
    if (this.pos + 1 >= this.tokens.length) return false;
    return this.tokens[this.pos + 1].type === type;
  }

  private checkValue(val: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().value.toLowerCase() === val.toLowerCase();
  }

  private checkNextValue(val: string): boolean {
    if (this.pos + 1 >= this.tokens.length) return false;
    return this.tokens[this.pos + 1].value.toLowerCase() === val.toLowerCase();
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchValue(val: string): boolean {
    if (this.checkValue(val)) {
      this.advance();
      return true;
    }
    return false;
  }

  private isAtLineEnd(): boolean {
    return this.isAtEnd() || this.check(TokenType.NEWLINE) || this.check(TokenType.COMMENT);
  }

  private consumeToEndOfLine(): void {
    while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
      this.advance();
    }
    if (this.check(TokenType.NEWLINE)) {
      this.advance();
    }
  }

  private collectUntilNewline(): Token[] {
    const list: Token[] = [];
    while (!this.isAtLineEnd()) {
      list.push(this.advance());
    }
    this.consumeToEndOfLine();
    return list;
  }
}
