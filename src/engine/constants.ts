// COE224: Assembly Language Studio - Engine Constants

export const MEMORY_LAYOUT = {
  CODE_BASE: 0x00401000,
  DATA_BASE: 0x00404000,
  DATA_SIZE: 0x00010000, // 64 KB data segment
  STACK_TOP: 0x0012FFF0, // Initial ESP
  STACK_SIZE: 0x00001000, // 4096 bytes (.STACK 4096)
  STACK_BOTTOM: 0x0012EFF0, // STACK_TOP - STACK_SIZE (overflow limit)
};

export const MAX_INSTRUCTIONS_PER_RUN = 100000;
export const MAX_HISTORY_STEPS = 10000;

export const REGISTERS_32 = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'ebp', 'esp'] as const;
export const REGISTERS_16 = ['ax', 'bx', 'cx', 'dx', 'si', 'di', 'bp', 'sp'] as const;
export const REGISTERS_8_HIGH = ['ah', 'bh', 'ch', 'dh'] as const;
export const REGISTERS_8_LOW = ['al', 'bl', 'cl', 'dl'] as const;
export const REGISTERS_8 = [...REGISTERS_8_LOW, ...REGISTERS_8_HIGH] as const;

export const ALL_REGISTERS = [
  ...REGISTERS_32,
  ...REGISTERS_16,
  ...REGISTERS_8,
] as const;

export const INSTRUCTIONS = [
  // Ch 4: Data Transfer & Addressing
  'mov', 'movzx', 'movsx', 'xchg', 'lea', 'inc', 'dec', 'neg', 'add', 'sub',
  // Ch 5: Stack & Procedures
  'push', 'pop', 'pushad', 'popad', 'pushfd', 'popfd', 'call', 'ret',
  // Ch 6: Conditions & Loops
  'cmp', 'test', 'jmp',
  'jz', 'je', 'jnz', 'jne', 'jc', 'jnc', 'js', 'jns', 'jo', 'jno',
  'ja', 'jnbe', 'jae', 'jnb', 'jb', 'jnae', 'jbe', 'jna',
  'jg', 'jnle', 'jge', 'jnl', 'jl', 'jnge', 'jle', 'jng',
  'loop', 'loope', 'loopz', 'loopne', 'loopnz',
  // Ch 7: Logic & Shifts & Arithmetic
  'and', 'or', 'xor', 'not',
  'shl', 'shr', 'sal', 'sar', 'rol', 'ror', 'rcl', 'rcr',
  'mul', 'imul', 'div', 'idiv', 'cbw', 'cwd', 'cdq',
] as const;

export const DIRECTIVES = [
  '.data', '.data?', '.code', '.stack', '.model',
  'byte', 'sbyte', 'word', 'sword', 'dword', 'sdword', 'real4',
  'offset', 'ptr', 'type', 'lengthof', 'sizeof', 'dup',
  'proc', 'endp', 'uses', 'proto', 'invoke', 'include', 'end', 'equ', 'exit'
] as const;

export const IRVINE32_PROCEDURES = [
  'writestring', 'writeint', 'writedec', 'writehex', 'writebin', 'writechar',
  'crlf', 'clrscr', 'readint', 'readdec', 'readhex', 'readchar', 'readstring',
  'dumpregs', 'dumpmem', 'random32', 'randomrange', 'randomize', 'waitmsg',
  'delay', 'getmseconds', 'str_length'
] as const;
