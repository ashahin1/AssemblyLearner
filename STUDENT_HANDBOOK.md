# COE224: Assembly Language Studio — Student Handbook & IDE Guide
**Buraydah Private Colleges — Department of Computer Engineering**  
*Course: COE224 Computer Organization & Assembly Language*  
*Textbook Reference: Kip R. Irvine, "Assembly Language for x86 Processors" (7th/8th Edition)*

---

## Table of Contents
1. [Introduction & Quick Start](#1-introduction--quick-start)
2. [Tour of the Studio (Every Panel & Button Explained)](#2-tour-of-the-studio)
3. [The 2-Step Restart & Debugging Flow](#3-the-2-step-restart--debugging-flow)
4. [CPU Architecture & Register System](#4-cpu-architecture--register-system)
5. [Status Flags & Real-Time Diagnostics](#5-status-flags--real-time-diagnostics)
6. [Memory Segment & Little-Endian Representation](#6-memory-segment--little-endian-representation)
7. [The Runtime Stack & Procedure Calls](#7-the-runtime-stack--procedure-calls)
8. [MASM Directives & Supported Instructions](#8-masm-directives--supported-instructions)
9. [Irvine32 Library Procedures](#9-irvine32-library-procedures)
10. [Classroom Presentation, TV Mode & Mobile Tips](#10-classroom-presentation-tv-mode--mobile-tips)
11. [Interactive Lecture Modules, Quizzes & Debugging Challenges](#11-interactive-lecture-modules-quizzes--debugging-challenges)

---

## 1. Introduction & Quick Start

Welcome to **COE224 Assembly Language Studio**! This web-based IDE and architectural simulator is engineered specifically for students learning x86 assembly language. Unlike traditional command-line assemblers (MASM 6.11 or Visual Studio command tools) that execute assembly code opaquely, Assembly Studio allows you to inspect every register, status flag, stack byte, and memory address dynamically as each instruction executes.

### Quick Start: Running Your First Program

```assembly
INCLUDE Irvine32.inc

.data
    val1 DWORD 25
    val2 DWORD 15

.code
main PROC
    mov  eax, val1      ; EAX = 25
    add  eax, val2      ; EAX = 25 + 15 = 40
    call DumpRegs       ; Print registers and flags to console
    exit                ; Terminate execution cleanly
main ENDP
END main
```

1. **Step Execution (`Step`):** Click **Step** to advance instruction by instruction. The yellow pointer (`▶`) indicates which line will execute next.
2. **Continuous Execution (`Run`):** Click **Run** to execute automatically with an animated delay. Click **Pause** at any time.
3. **Step Backward (`Back`):** Over-stepped or missed a flag change? Click **Back** to reverse execution and restore the previous state!
4. **Inspect Results:** Watch register rows glow yellow when their values change, check the status flags box for plain-English explanations, and view your output in the interactive console.

---

## 2. Tour of the Studio

The IDE layout provides a comprehensive view of the underlying computer architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Controls Toolbar                            │
│  [Run] [Step/Restart] [Back] [Reset] | [Examples] [Modules] [Share]    │
├───────────────────┬────────────────────────────────┬───────────────────┤
│    Code Editor    │     CPU Registers & Flags      │    Memory Dump    │
│                   ├────────────────────────────────┼───────────────────┤
│  • MASM syntax    │ • EAX, EBX, ECX, EDX           │ • Hex/ASCII grid  │
│  • Hover Tooltips │ • Sub-registers (AX, AH, AL)   │ • Little-Endian   │
│  • Execution Line │ • Flags: ZF, CF, SF, OF, PF, AF├───────────────────┤
│  • Breakpoints    │ • Live Flag Diagnostics Box    │   Runtime Stack   │
│  • Font Controls  ├────────────────────────────────┼───────────────────┤
│                   │      Interactive Console       │ • ESP & EBP       │
│                   │ • WriteString, ReadInt, Crlf   │ • PUSH / POP      │
└───────────────────┴────────────────────────────────┴───────────────────┘
```

### Code Editor Features
* **Interactive Breakpoints:** Click any line number in the gutter to toggle a red breakpoint dot (`●`). When running your program, execution automatically pauses whenever a breakpoint is reached, allowing you to inspect registers mid-loop!
* **Instruction Tooltips:** Hover over any instruction or register to view a quick popup showing its syntax, affected flags, textbook chapter, and programming tips.
* **Execution Line Tracking:** A clear yellow marker (`▶`) and line highlight always indicate which instruction will execute next.
* **Multi-Error Diagnostics Drawer:** If your program has syntax or operand errors, a scrollable footer drawer lists all errors simultaneously, detailing the exact line number, error description, and recommended fix.
* **Classroom Font Controls:** Quick `[A-]` and `[A+]` buttons in the editor header let you adjust text size (from 12px up to 32px) for clear reading across large lecture rooms.

### Toolbar Controls
* **Run / Pause:** Toggles continuous animated execution.
* **Step / Restart:** Advances one instruction. When the program finishes (`exit`) or code is edited, this button automatically changes to **Restart**.
* **Step Backward (Back):** Time-travel undo that reverses the last executed instruction.
* **Reset:** Resets the CPU, registers, stack, and memory back to clean state.
* **Lecture Examples:** Pre-loaded, fully working programs matching Irvine Chapters 1 to 7.
* **Share Link:** Encodes your code into a shareable URL. Great for sending code to your professor or study group!
* **Speed Slider:** Adjusts execution speed from fast (50ms) to slow (1500ms for classroom demos).
* **Handbook:** Opens the in-app interactive documentation.
* **Settings:** Access preferences and the **"Restore Clean Slate"** factory reset.

---

## 3. The 2-Step Restart & Debugging Flow

Assembly Studio implements a **predictable 2-step restart flow** designed for pedagogical clarity:

```mermaid
flowchart LR
    A["Program Halted (Finished)"] -->|Click Restart| B["Parked at Line 1\n(Registers = 0, Arrow on Line 1)"]
    B -->|Click Step| C["Executes Line 1\n(Registers Update, Arrow on Line 2)"]
```

1. **Press 1 ("Restart"):**
   * Resets all registers back to `0`, clears memory, and points the yellow pointer (`▶`) at **Line 1**.
   * **Line 1 is NOT executed yet.** This ensures you have 100% visibility into the initial register state before any instruction touches them.
   * The button label changes to **"Step"**.
2. **Press 2 ("Step"):**
   * Executes Line 1, updates registers, and advances the pointer to Line 2.

### Stale Code Awareness
If you edit code while paused mid-program or after the program has finished:
* **Registers remain frozen on screen:** You can reference the previous run's values while writing your fix.
* **Header shows `⚠ Modified • Click Restart`:** Warns you that on-screen numbers belong to the previous compilation.
* **Execution line dims with a dashed border:** Shows frozen state.
* **Clicking "Restart" re-compiles the fix** and parks at Line 1 of your new code.

---

## 4. CPU Architecture & Register System

The simulator models the 32-bit x86 Intel IA-32 architecture:

### 32-bit General-Purpose Registers
* **`EAX` (Extended Accumulator):** Primary register for arithmetic calculations and return values.
* **`EBX` (Extended Base):** Base pointer for memory addressing.
* **`ECX` (Extended Counter):** Loop counter used automatically by `LOOP`, `LOOPE`, and string operations.
* **`EDX` (Extended Data):** I/O pointer and high-order product/dividend in multiplication and division.

### Sub-Register Hierarchy
Each 32-bit general-purpose register contains smaller 16-bit and 8-bit partitions:

```
┌───────────────────────────────── EAX (32 bits) ─────────────────────────────────┐
│              High 16 bits              │               AX (16 bits)             │
│                                        │       AH (8 bits)   │    AL (8 bits)   │
└────────────────────────────────────────┴─────────────────────┴──────────────────┘
```

* **Example:** Writing `mov ax, 1234h` into `EAX = 00000000h` produces `EAX = 00001234h`.
* **Example:** Writing `mov ah, 56h` updates only bits 8–15, leaving `AL` untouched!
* *Tip:* Click the arrow next to any register in the Registers panel to view its `AX`, `AH`, and `AL` breakdown!

### Pointer & Index Registers
* **`ESP` (Extended Stack Pointer):** Points to the top of the runtime stack (lowest address).
* **`EBP` (Extended Base Pointer):** Points to the base of the current stack frame.
* **`ESI` (Source Index):** Memory source pointer for block copy and string procedures.
* **`EDI` (Destination Index):** Memory destination pointer.
* **`EIP` (Instruction Pointer):** Contains the address of the next instruction to execute.

---

## 5. Status Flags & Real-Time Diagnostics

Status flags in the `EFLAGS` register record the outcome of arithmetic and logical operations:

| Flag | Name | When is it set to 1? | Example |
| :---: | :--- | :--- | :--- |
| **ZF** | Zero Flag | When the result of an operation is **zero**. | `mov eax, 5` followed by `sub eax, 5` ➔ `ZF = 1` |
| **CF** | Carry Flag | When an **unsigned** operation carries out of MSB or borrows. | `mov al, 255` followed by `add al, 1` ➔ `CF = 1` |
| **SF** | Sign Flag | When the highest bit is 1 (negative signed value). | `mov eax, 2` followed by `sub eax, 5` ➔ `SF = 1` |
| **OF** | Overflow Flag | When a **signed** operation exceeds the register capacity. | `mov al, 127` followed by `add al, 1` ➔ `OF = 1` |
| **PF** | Parity Flag | When the lowest byte of the result has an **even** number of 1-bits. | `mov al, 3` (binary `00000011b`) ➔ `PF = 1` |
| **AF** | Auxiliary Flag | When there is a carry out of bit 3 into bit 4 (BCD arithmetic). | `mov al, 0Fh` followed by `add al, 1` ➔ `AF = 1` |

> [!NOTE]
> Beneath the status flags, the **Live Diagnostics Box** explains in plain English *why* each flag changed (e.g., *"ADD resulted in unsigned carry: CF=1; result non-zero: ZF=0"*).

---

## 6. Memory Segment & Little-Endian Representation

Variables declared in the `.data` segment are placed contiguously in virtual RAM:

### Data Directives
```assembly
.data
    bVal   BYTE  12h, 34h, 56h
    wVal   WORD  1000h
    dVal   DWORD 12345678h
    msg    BYTE  "Hello, COE224!", 0
    arr    DWORD 5 DUP(0)
```

### Little-Endian Byte Ordering
x86 processors store multi-byte integers in memory with the **least significant byte at the lowest memory address**:

* A 32-bit `DWORD` with value `12345678h`:
  * Byte 0 (`offset + 0`): `78h`
  * Byte 1 (`offset + 1`): `56h`
  * Byte 2 (`offset + 2`): `34h`
  * Byte 3 (`offset + 3`): `12h`
* The Memory Dump panel displays the raw bytes in order and provides an ASCII translation column on the right.

---

## 7. The Runtime Stack & Procedure Calls

The runtime stack is an inverted memory structure that grows **downward** (from high memory to low memory):

* **Initial State:** `ESP = 00010000h`.
* **`PUSH operand`:**
  1. Decrements `ESP` by 4 (`ESP = ESP - 4`).
  2. Writes the 32-bit operand to memory at address `[ESP]`.
* **`POP operand`:**
  1. Reads the 32-bit value from memory at address `[ESP]`.
  2. Increments `ESP` by 4 (`ESP = ESP + 4`).
* **`CALL procedure`:** Pushes the return address (the next instruction's address) onto the stack and jumps to the procedure.
* **`RET`:** Pops the return address off the stack and jumps back to the caller.

---

## 8. MASM Directives & Supported Instructions

### Basic Syntax Rules
1. Instructions are not case-sensitive: `MOV eax, 1` is identical to `mov EAX, 1`.
2. Comments begin with a semicolon `;`.
3. String literals must end with a null terminator `, 0` when used with `WriteString`.

### Core Instruction Set & Directives
* **Data Definition:** `BYTE`, `SBYTE`, `WORD`, `SWORD`, `DWORD`, `SDWORD`, `DUP` (supports negative numbers, constant expressions, and symbolic counts e.g., `5 DUP(-2)`).
* **Data Movement:** `MOV`, `MOVZX`, `MOVSX`, `XCHG`, `PUSH`, `POP`, `PUSHAD`, `POPAD`, `PUSHFD`, `POPFD`, `LEA`, `OFFSET`, `PTR`.
* **Arithmetic:** `ADD`, `SUB`, `INC`, `DEC`, `NEG`, `MUL`, `IMUL` (1, 2, and 3-operand forms with signed `OF`/`CF` flag tracking), `DIV`, `IDIV`, `CBW`, `CWD`, `CDQ`.
* **Bitwise Logic:** `AND`, `OR`, `XOR`, `NOT`, `TEST`.
* **Shifts & Rotates:** `SHL`, `SHR`, `SAL`, `SAR`, `ROL`, `ROR` (with full `CF`, `OF`, `ZF`, `SF` diagnostic tracking).
* **Comparisons & Conditional Jumps:**
  * `CMP op1, op2`: Subtracts `op2` from `op1`, sets flags, and discards the result.
  * `JE` / `JZ`: Jump if Equal (Zero).
  * `JNE` / `JNZ`: Jump if Not Equal.
  * Signed: `JG` (Greater), `JL` (Less), `JGE`, `JLE`.
  * Unsigned: `JA` (Above), `JB` (Below), `JAE`, `JBE`.
* **Loops:** `LOOP target`: Decrements `ECX`; if `ECX != 0`, jumps to target (`LOOPE`, `LOOPZ`, `LOOPNE`, `LOOPNZ` also supported).
* **Procedures & Directives:**
  * `PROC` and `ENDP`: Defines a procedure.
  * `PROC USES reg1 reg2 ...`: Automatically emits `PUSH` instructions in the prologue and corresponding reverse `POP` instructions before `RET` to preserve caller registers safely!
  * `CALL target`, `RET`: Invokes a subroutine and returns.
  * `INVOKE`: Invokes procedures or handles program exit (`INVOKE ExitProcess, 0`).
  * `END [label]`: Directs the assembler where program execution begins (e.g. `END main`).

---

## 9. Irvine32 Library Procedures

The Irvine32 library (included automatically via `INCLUDE Irvine32.inc`) simplifies console input and output:

| Procedure | Parameters / Register Usage | Description |
| :--- | :--- | :--- |
| **`WriteString`** | `EDX = OFFSET string` | Displays a null-terminated string to the console (safely bounded). |
| **`WriteInt`** | `EAX = integer` | Displays a 32-bit signed integer with leading sign (`+` or `-`). |
| **`WriteDec`** | `EAX = integer` | Displays a 32-bit unsigned decimal integer. |
| **`WriteHex`** | `EAX = integer` | Displays a 32-bit hexadecimal number. |
| **`WriteBin`** | `EAX = integer` | Displays a 32-bit binary number in 4-bit groups. |
| **`WriteChar`** | `AL = ASCII character` | Displays a single ASCII character. |
| **`Crlf`** | *(None)* | Outputs a carriage return / line feed (new line). |
| **`Clrscr`** | *(None)* | Clears the virtual console screen. |
| **`ReadInt`** | Returns integer in `EAX` | Prompts user for a 32-bit signed integer via keyboard. |
| **`ReadDec`** | Returns integer in `EAX` | Prompts user for an unsigned decimal integer. |
| **`ReadHex`** | Returns integer in `EAX` | Prompts user for a hexadecimal integer. |
| **`ReadChar`** | Returns character in `AL` | Reads a single character from keyboard. |
| **`ReadString`** | `EDX = OFFSET buffer`, `ECX = max size` | Prompts user for string input. |
| **`DumpRegs`** | *(None)* | Prints a complete snapshot of all registers and status flags. |
| **`DumpMem`** | `ESI = address`, `ECX = count`, `EBX = size` | Dumps a formatted memory block to the console (clamped to 1/2/4 bytes, 256 units). |
| **`GetMseconds`** | Returns milliseconds in `EAX` | Returns the number of milliseconds elapsed since midnight. |
| **`Random32`** | Returns random 32-bit integer in `EAX` | Generates a 32-bit pseudorandom integer. |
| **`RandomRange`** | `EAX = range limit` | Generates a random integer from `0` to `EAX - 1`. |
| **`WaitMsg`** | *(None)* | Displays "Press any key to continue..." and waits for keyboard input. |

---

## 10. Classroom Presentation, TV Mode & Mobile Tips

* **Classroom TV Mode (140% – 200% Zoom):** Click **TV Mode** in the header or use the zoom buttons to scale the entire interface up for classroom projectors and lecture hall displays.
* **Mobile & Tablet Bottom Tabs:** On mobile devices, bottom tabs let you easily switch between **Code**, **Registers**, **Memory**, and **Console**. The console tab displays a notification badge when new output is printed.
* **Restore Clean Slate (Factory Reset):** If you ever want to wipe saved browser code and restore default settings, open **Settings** (gear icon) and click **Reset All to Clean Slate** in the danger zone.

---

## 11. Interactive Lecture Modules, Quizzes & Debugging Challenges

Beyond the Playground IDE, Assembly Studio provides dedicated lecture exploration modules accessible via the **Modules** menu, covering Chapters 1 through 7 of Kip Irvine's curriculum:

### 11.1 Dedicated Chapter Exploration Modules
* **Chapter 1: Number Systems & Data Representation**
  * *8-Bit Interactive Bitboard:* Toggle bits to see instant live decimal, two's complement, hex, and binary conversions.
  * *Two's Complement Negation Animator:* Step-by-step visual walk-through of the "invert bits and add 1" rule.
  * *8-Bit Ripple-Carry Adder (`CF` vs. `OF`):* Full carry-chain bit grid demonstrating how Carry Out of MSB governs unsigned Carry Flag (`CF`), while `CarryIntoMSB ⊕ CarryOutOfMSB` sets signed Overflow Flag (`OF`). Includes classroom presets (`127 + 1`, `255 + 1`, `150 + 150`, `10 + 20`).
* **Chapter 2: IA-32 Processor Architecture**
  * *Nested Register Hierarchy:* Interactive visualization of `EAX` $\to$ `AX` $\to$ `AH` / `AL`.
  * *6-Step Fetch–Decode–Execute Bus Animator:* Animated walk-through across RAM / L1 Cache, 32-bit Address/Data/Control Buses, Control Unit / EIP, and the ALU writeback stage.
* **Chapter 3: MASM Directives & Identifiers**
  * *MASM Program Anatomy Dissector:* Interactive code anatomy highlighting `.data`, `.code`, `PROC`/`ENDP`, and `exit`.
  * *MASM Identifier & Literal Validator:* Real-time syntax validator catching the classic exam trap where hexadecimal literals starting with a letter (`FFh`, `A5h`) fail to assemble without a leading zero (`0FFh`, `0A5h`), plus checking reserved keywords.
* **Chapter 4: Data Transfers & Addressing**
  * *Little-Endian Byte Order Animator:* Visualizes how multi-byte numbers (`12345678h`) are stored in memory with the least significant byte first.
  * *MOVZX vs. MOVSX Extension Visualizer:* Side-by-side comparison illustrating zero-extension (for unsigned values) versus sign-extension copying Bit 7 (preserving negative signed values).
  * *Array Operator Lab (`TYPE`, `LENGTHOF`, `SIZEOF`):* Live memory layout strip illustrating byte offsets and why indexing a `DWORD` array requires `[array + 4]`, not `[array + 1]`.
* **Chapter 5: Procedures & The Stack**
  * *Runtime Stack Frame Visualizer:* LIFO stack column tracking `ESP` decrements and increments during `PUSH` and `POP`.
  * *String Reversal Animator:* Step-by-step push/pop demonstration showing how characters stacked in LIFO order naturally reverse.
  * *The Corrupted `ECX` Loop Trap (`PROC USES`):* Side-by-side execution trace demonstrating how a procedure modifying `ECX` causes an infinite loop in the caller, and how `PROC USES ecx` restores safety.
* **Chapter 6: Conditional Processing & Jumps**
  * *CMP Decision Matrix:* Interactive flag computation (`ZF`, `CF`, `SF`, `OF`) and conditional jump evaluations.
  * *Bit-Masking Workbench:* Live 8-bit demonstrations of case conversion (`AND`), integer-to-ASCII conversion (`OR`), non-destructive even/odd testing (`TEST`), and symmetric XOR ciphering (`XOR`).
  * *Finite-State Machine (FSM) Validator:* Interactive state machine (`State A`, `State B`, `State C`) verifying signed integer inputs character by character.
* **Chapter 7: Shifts, Rotations & Integer Arithmetic**
  * *Bit Shift Barrel:* Interactive `SHL`, `SHR`, `SAR`, `ROL`, and `ROR` operations with Carry Flag tracking and sign-preserving arithmetic right shifts (`SAR`).
  * *32-Bit Arithmetic (MUL / IMUL & DIV / IDIV):* Unsigned and Signed toggle demonstrating the 64-bit product in `EDX:EAX` and the mandatory `CDQ` prerequisite for signed division.
  * *16-Bit MS-DOS Date Bitfield Extractor:* Interactive extraction of Year (Bits 15–9), Month (Bits 8–5), and Day (Bits 4–0) using bit shifts and masks.

### 11.2 Self-Check Review Quizzes
Each chapter module concludes with a 4-question interactive self-check quiz (28 questions total across Chapters 1–7) featuring:
* Instant answer verification with emerald (correct) and rose (incorrect) feedback.
* Clear pedagogical explanations detailing why the correct answer holds according to Kip Irvine's textbook.
* Live score tracker and reset button.

### 11.3 "Fix the Bug" Interactive Debugging Challenges
In the Playground under **Examples $\to$ 🔧 "Fix the Bug" Challenges**, students can load 5 curated buggy programs designed to simulate real exam traps:
1. **Bug 1: Illegal Mem-to-Mem & Hex Trap (Ch 4):** Diagnose and resolve `mov val2, val1` and `FFh` missing leading zero.
2. **Bug 2: Stepping a DWORD Array by +1 (Ch 4):** Fix an array summing loop advancing `ESI` by 1 byte instead of 4 (`TYPE array`).
3. **Bug 3: Corrupted ECX Loop Counter (Ch 5):** Resolve a hanging infinite loop caused by an inner procedure modifying `ECX` without `PROC USES ecx`.
4. **Bug 4: Using JA Instead of JG on Signed Numbers (Ch 6):** Fix an unsigned jump `ja` that treats negative numbers as billions, replacing it with `jg`.
5. **Bug 5: Missing CDQ Before Signed IDIV (Ch 7):** Fix a division crash caused by clearing `EDX` with `mov edx, 0` instead of sign-extending with `cdq`.
