// COE224: Assembly Language Studio - Curated Lecture Code Examples

import { CodeExample } from '../engine/types';

export const CODE_EXAMPLES: CodeExample[] = [
  // --- Chapter 3: MASM Fundamentals & Irvine32 ---
  {
    id: 'ch3-hello-world',
    title: 'Hello World (WriteString & Crlf)',
    chapter: 3,
    description: 'Basic MASM template using the Irvine32 library to display a null-terminated string.',
    code: `INCLUDE Irvine32.inc

.data
    greeting BYTE "Hello, Computer Engineering Students at Buraydah Private Colleges!", 0

.code
main PROC
    mov  edx, OFFSET greeting
    call WriteString
    call Crlf
    exit
main ENDP
END main
`,
  },
  {
    id: 'ch3-dumpregs',
    title: 'Register Inspection (DumpRegs)',
    chapter: 3,
    description: 'Demonstrates loading values into 32-bit registers and calling DumpRegs to view CPU state.',
    code: `INCLUDE Irvine32.inc

.code
main PROC
    mov eax, 10000h
    mov ebx, 20000h
    mov ecx, 30000h
    mov edx, 40000h
    call DumpRegs
    exit
main ENDP
END main
`,
  },

  // --- Chapter 4: Data Transfers, Addressing & Arithmetic ---
  {
    id: 'ch4-little-endian',
    title: 'Little-Endian Memory Storage',
    chapter: 4,
    description: 'Demonstrates how a 32-bit DWORD is stored in reverse byte order (least significant byte first).',
    code: `INCLUDE Irvine32.inc

.data
    val1 DWORD 12345678h

.code
main PROC
    ; Read the lowest byte (78h)
    mov al, BYTE PTR val1
    
    ; Read the highest byte (12h)
    mov ah, BYTE PTR [val1 + 3]
    
    call DumpRegs
    exit
main ENDP
END main
`,
  },
  {
    id: 'ch4-array-sum',
    title: 'Array Sum with Indirect Addressing',
    chapter: 4,
    description: 'Using ESI as an indirect pointer with the OFFSET operator to compute the sum of an array.',
    code: `INCLUDE Irvine32.inc

.data
    array DWORD 10, 20, 30, 40, 50
    total DWORD 0

.code
main PROC
    mov esi, OFFSET array
    mov ecx, 5
    mov eax, 0

L1:
    add eax, [esi]
    add esi, TYPE array
    loop L1

    mov total, eax
    call WriteInt
    call Crlf
    exit
main ENDP
END main
`,
  },
  {
    id: 'ch4-flags-overflow',
    title: 'Arithmetic Flags (Carry vs Overflow)',
    chapter: 4,
    description: 'Demonstrates how ADD sets the Zero Flag (ZF), Carry Flag (CF), and Overflow Flag (OF).',
    code: `INCLUDE Irvine32.inc

.code
main PROC
    ; Unsigned carry: 0FFFFFFFFh + 1 -> CF=1, ZF=1
    mov eax, 0FFFFFFFFh
    add eax, 1

    ; Signed overflow: 7FFFFFFFh + 1 -> OF=1, SF=1
    mov ebx, 7FFFFFFFh
    add ebx, 1

    call DumpRegs
    exit
main ENDP
END main
`,
  },

  // --- Chapter 5: Procedures & Stack ---
  {
    id: 'ch5-stack-reverse',
    title: 'Reversing Values using PUSH and POP',
    chapter: 5,
    description: 'Demonstrates LIFO (Last-In First-Out) stack behavior to reverse a series of register values.',
    code: `INCLUDE Irvine32.inc

.code
main PROC
    mov eax, 1
    mov ebx, 2
    mov ecx, 3

    ; Push onto stack (ESP decreases)
    push eax
    push ebx
    push ecx

    ; Pop in reverse order
    pop eax   ; gets 3
    pop ebx   ; gets 2
    pop ecx   ; gets 1

    call DumpRegs
    exit
main ENDP
END main
`,
  },
  {
    id: 'ch5-call-ret',
    title: 'Procedure Call & Return (CALL / RET)',
    chapter: 5,
    description: 'Declares a custom procedure SumThree and calls it from main.',
    code: `INCLUDE Irvine32.inc

.code
main PROC
    mov eax, 5
    mov ebx, 10
    mov ecx, 15
    call SumThree
    call DumpRegs
    exit
main ENDP

SumThree PROC
    add eax, ebx
    add eax, ecx
    ret
SumThree ENDP

END main
`,
  },

  // --- Chapter 6: Conditional Processing & Loops ---
  {
    id: 'ch6-cmp-jump',
    title: 'Conditional Branching (CMP and Jcc)',
    chapter: 6,
    description: 'Simulates an if-else structure: finding the larger of two numbers.',
    code: `INCLUDE Irvine32.inc

.data
    v1 DWORD 45
    v2 DWORD 80
    larger DWORD ?

.code
main PROC
    mov eax, v1
    cmp eax, v2
    jge GreaterOrEqual

    ; Else: v2 is larger
    mov eax, v2
    jmp Done

GreaterOrEqual:
    ; v1 is larger
    mov eax, v1

Done:
    mov larger, eax
    call WriteInt
    call Crlf
    exit
main ENDP
END main
`,
  },

  // --- Chapter 7: Shifts, Rotations & Arithmetic ---
  {
    id: 'ch7-bitwise-shifts',
    title: 'Fast Multiplication via Bit Shifting (SHL)',
    chapter: 7,
    description: 'Multiplies an integer by 10 using shift addition: EAX * 10 = (EAX * 8) + (EAX * 2).',
    code: `INCLUDE Irvine32.inc

.code
main PROC
    mov eax, 12      ; 12 * 10 = 120

    mov ebx, eax
    shl eax, 3      ; eax = 12 * 8 = 96
    shl ebx, 1      ; ebx = 12 * 2 = 24
    add eax, ebx    ; eax = 96 + 24 = 120

    call WriteInt
    call Crlf
    exit
main ENDP
END main
`,
  },
  {
    id: 'ch7-mul-div',
    title: 'Integer Multiplication & Division (MUL / DIV)',
    chapter: 7,
    description: 'Demonstrates 32-bit multiplication (EDX:EAX) and division with quotient in EAX and remainder in EDX.',
    code: `INCLUDE Irvine32.inc

.code
main PROC
    ; Multiplication: 50 * 4
    mov eax, 50
    mov ebx, 4
    mul ebx         ; EAX = 200, EDX = 0

    ; Division: 200 / 6
    mov edx, 0      ; Clear high dividend
    mov ebx, 6
    div ebx         ; Quotient in EAX (33), Remainder in EDX (2)

    call DumpRegs
    exit
main ENDP
END main
`,
  },
];
