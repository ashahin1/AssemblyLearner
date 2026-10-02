// COE224: Assembly Language Studio - Engine Types

export enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  REGISTER = 'REGISTER',
  INSTRUCTION = 'INSTRUCTION',
  DIRECTIVE = 'DIRECTIVE',
  DATA_TYPE = 'DATA_TYPE',
  OPERATOR = 'OPERATOR',
  KEYWORD = 'KEYWORD',
  COMMA = 'COMMA',
  COLON = 'COLON',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  EQUALS = 'EQUALS',
  COMMENT = 'COMMENT',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  numericValue?: number;
}

export enum DataType {
  BYTE = 1,
  SBYTE = 1,
  WORD = 2,
  SWORD = 2,
  DWORD = 4,
  SDWORD = 4,
  REAL4 = 4,
}

export interface SymbolEntry {
  name: string;
  kind: 'variable' | 'label' | 'constant' | 'procedure';
  address: number;
  dataType?: DataType;
  elementCount?: number;
  totalBytes?: number;
  value?: number;
  sourceLine: number;
  params?: string[];
}

export type OperandKind = 'register' | 'immediate' | 'memory' | 'label';

export interface Operand {
  kind: OperandKind;
  register?: string;
  immediate?: number;
  size?: 1 | 2 | 4;
  baseReg?: string;
  indexReg?: string;
  scale?: 1 | 2 | 4 | 8;
  displacement?: number;
  symbolRef?: string;
  ptrSize?: 1 | 2 | 4;
}

export interface ParsedInstruction {
  mnemonic: string;
  operands: Operand[];
  sourceLine: number;
  sourceText: string;
  address: number;
}

export interface Flags {
  CF: 0 | 1;
  PF: 0 | 1;
  AF: 0 | 1;
  ZF: 0 | 1;
  SF: 0 | 1;
  OF: 0 | 1;
  DF: 0 | 1;
}

export interface Registers {
  eax: number;
  ebx: number;
  ecx: number;
  edx: number;
  esi: number;
  edi: number;
  ebp: number;
  esp: number;
  eip: number;
}

export interface CPUState {
  registers: Registers;
  flags: Flags;
}

export interface FlagDiagnostic {
  flag: 'ZF' | 'SF' | 'CF' | 'OF' | 'PF' | 'AF';
  oldValue: 0 | 1;
  newValue: 0 | 1;
  reason: string;
}

export interface ExecutionSnapshot {
  eip: number;
  registers: Registers;
  flags: Flags;
  modifiedMemory: Array<{ address: number; oldValue: number }>;
  consoleOutputLength: number;
  sourceLine: number;
  instructionText: string;
  flagDiagnostics: FlagDiagnostic[];
}

export type ExecutionEvent =
  | { type: 'STEP_COMPLETE'; line: number; flagDiagnostics: FlagDiagnostic[] }
  | { type: 'WAITING_FOR_INPUT'; prompt: string; inputType: 'int' | 'dec' | 'hex' | 'char' | 'string'; maxChars?: number; targetAddr?: number }
  | { type: 'HALTED'; exitCode?: number }
  | { type: 'ERROR'; message: string; line?: number; suggestion?: string };

export interface AssemblyError {
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
}

export interface InstructionTooltip {
  name: string;
  description: string;
  syntax: string[];
  flagsAffected: string;
  tip: string;
  chapter: number;
}

export interface CodeExample {
  id: string;
  title: string;
  chapter: number;
  description: string;
  code: string;
  highlightLines?: number[];
}
