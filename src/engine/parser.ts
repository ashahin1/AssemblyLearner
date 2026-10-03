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
        this.parseDataDeclaration();
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
          this.consumeToEndOfLine();
          continue;
        }

        // Procedure end: main ENDP
        if (this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.ENDP)) {
          this.advance(); // consume name
          this.advance(); // consume ENDP
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

    return {
      success: this.errors.length === 0,
      instructions: parsedInstructions,
      symbols: this.symbols,
      initialData: this.initialData,
      errors: this.errors,
      warnings: this.warnings,
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

      // DUP operator: count DUP(val)
      if (tok.type === TokenType.NUMBER && this.checkNextValue('dup')) {
        const count = tok.numericValue ?? 1;
        this.advance(); // consume number
        this.advance(); // consume DUP
        this.consume(TokenType.LPAREN, "Expected '(' after DUP");
        const valToken = this.peek();
        let fillVal = 0;
        if (valToken.type === TokenType.NUMBER) {
          fillVal = valToken.numericValue ?? 0;
          this.advance();
        } else if (valToken.value === '?') {
          fillVal = 0;
          this.advance();
        }
        this.consume(TokenType.RPAREN, "Expected ')' after DUP value");

        for (let i = 0; i < count; i++) {
          this.writeTypeBytes(fillVal, dType);
          totalBytes += dType;
          elementCount++;
        }
        if (this.match(TokenType.COMMA)) continue;
        break;
      }

      // Plain numeric or question mark initializers
      if (tok.type === TokenType.NUMBER || tok.value === '?') {
        const val = tok.value === '?' ? 0 : tok.numericValue ?? 0;
        this.advance();
        this.writeTypeBytes(val, dType);
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
    if (tokens.length === 1 && tokens[0].type === TokenType.STRING) {
      if (tokens[0].value.length === 1) {
        return { kind: 'immediate', immediate: tokens[0].value.charCodeAt(0), size: 1 };
      }
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
      return { kind: 'immediate', immediate: sym.address, size: 4 };
    }

    // 5. Memory with PTR: BYTE PTR [esi], DWORD PTR myVar
    let ptrSize: 1 | 2 | 4 | undefined;
    let remainingTokens = tokens;

    if (tokens.length >= 3 && tokens[1].value.toLowerCase() === 'ptr') {
      const sizeWord = tokens[0].value.toLowerCase();
      if (sizeWord === 'byte') ptrSize = 1;
      else if (sizeWord === 'word') ptrSize = 2;
      else if (sizeWord === 'dword') ptrSize = 4;
      remainingTokens = tokens.slice(2);
    }

    // 6. Bracketed memory: [esi], [esi + 4], [ebx + esi * 4]
    if (remainingTokens[0].type === TokenType.LBRACKET) {
      const memTokens = remainingTokens.slice(1, -1);
      return this.parseBracketedMemory(memTokens, ptrSize, line);
    }

    // 7. Direct Variable Access: myVar or myVar[esi] or myVar + 4
    const firstTok = remainingTokens[0];
    const sym = this.symbols.get(firstTok.value.toLowerCase());

    if (sym && sym.kind === 'variable') {
      let displacement = sym.address;
      let indexReg: string | undefined;

      // Variable with index: myVar[esi] or myVar + 4
      if (remainingTokens.length > 1) {
        if (remainingTokens[1].type === TokenType.LBRACKET) {
          const inner = remainingTokens.slice(2, -1);
          if (inner.length === 1 && inner[0].type === TokenType.REGISTER) {
            indexReg = inner[0].value.toLowerCase();
          }
        } else if (remainingTokens[1].type === TokenType.PLUS && remainingTokens[2]?.type === TokenType.NUMBER) {
          displacement += remainingTokens[2].numericValue ?? 0;
        }
      }

      return {
        kind: 'memory',
        displacement,
        indexReg,
        symbolRef: sym.name,
        size: ptrSize ?? (sym.dataType as 1 | 2 | 4) ?? 4,
        ptrSize,
      };
    }

    // 8. Label reference for JMP / CALL
    if (tokens.length === 1 && (tokens[0].type === TokenType.IDENTIFIER || tokens[0].type === TokenType.INSTRUCTION)) {
      const labelName = tokens[0].value.toLowerCase();
      return {
        kind: 'label',
        symbolRef: labelName,
      };
    }

    // Fallback: Constant expression evaluation
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

  private parseBracketedMemory(tokens: Token[], ptrSize: 1 | 2 | 4 | undefined, line: number): Operand {
    let baseReg: string | undefined;
    let indexReg: string | undefined;
    let scale: 1 | 2 | 4 | 8 = 1;
    let displacement = 0;
    let symbolRef: string | undefined;

    let currentSign = 1;
    let i = 0;

    while (i < tokens.length) {
      const t = tokens[i];

      if (t.type === TokenType.REGISTER) {
        if (!baseReg) {
          baseReg = t.value.toLowerCase();
        } else if (!indexReg) {
          indexReg = t.value.toLowerCase();
        }
        i++;
      } else if (t.type === TokenType.STAR) {
        i++;
        if (tokens[i]?.type === TokenType.NUMBER) {
          scale = (tokens[i].numericValue as any) ?? 1;
          i++;
        }
      } else if (t.type === TokenType.PLUS) {
        currentSign = 1;
        i++;
      } else if (t.type === TokenType.MINUS) {
        currentSign = -1;
        i++;
      } else if (t.type === TokenType.NUMBER) {
        displacement += currentSign * (t.numericValue ?? 0);
        currentSign = 1;
        i++;
      } else if (t.type === TokenType.IDENTIFIER) {
        const sym = this.symbols.get(t.value.toLowerCase());
        if (sym) {
          if (sym.kind === 'variable') {
            displacement += currentSign * sym.address;
            symbolRef = sym.name;
            if (!ptrSize && sym.dataType) {
              ptrSize = sym.dataType as 1 | 2 | 4;
            }
          } else if (sym.kind === 'constant') {
            displacement += currentSign * (sym.value ?? 0);
          }
        } else {
          throw new Error(`Line ${line}: Undefined symbol '${t.value}' inside memory brackets`);
        }
        currentSign = 1;
        i++;
      } else {
        i++;
      }
    }

    return {
      kind: 'memory',
      baseReg,
      indexReg,
      scale,
      displacement: displacement >>> 0,
      symbolRef,
      size: ptrSize ?? 4,
      ptrSize,
    };
  }

  private validateInstruction(mnemonic: string, operands: Operand[], line: number): void {
    const m = mnemonic.toLowerCase();

    // Memory to memory move check
    if (m === 'mov' || m === 'add' || m === 'sub' || m === 'cmp') {
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

    // Size mismatch check between register and memory or register and register
    if (operands.length === 2 && operands[0].kind === 'register' && operands[1].kind === 'register') {
      if (operands[0].size && operands[1].size && operands[0].size !== operands[1].size) {
        this.errors.push(
          ErrorEngine.create(
            line,
            `Operand size mismatch in '${m.toUpperCase()}': '${operands[0].register}' is ${operands[0].size * 8}-bit, but '${operands[1].register}' is ${operands[1].size * 8}-bit.`
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

  private consume(type: TokenType, errMsg: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(errMsg);
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
