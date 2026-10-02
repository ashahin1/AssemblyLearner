# COE224: Assembly Language Studio

**Interactive Learning Environment & IA-32 Simulator**  
*Buraydah College, Faculty of Engineering and Information Technology*  
*Curriculum Text:* **Assembly Language for x86 Processors (7th Edition)** by Kip R. Irvine (Chapters 1–7)

---

## 🌟 Overview

**COE224 Assembly Studio** is a 100% client-side, browser-based x86 educational IDE and interactive learning platform built for Computer Engineering students. It requires **zero software installation**, runs on Windows, Mac, Linux, iPad, and **Classroom Android Smart TVs**, and operates completely offline.

### Key Capabilities:
- **Playground IDE & Simulator:**
  - Real-time MASM syntax highlighting (CodeMirror 6).
  - Synchronized nested registers: `EAX` $\to$ `AX` $\to$ `AH` / `AL`.
  - Dynamic IA-32 Status Flags (`ZF`, `CF`, `SF`, `OF`, `PF`, `AF`) with pedagogical diagnostic explanations.
  - Little-endian memory grid for the `.data` segment.
  - Downward-growing call stack panel tracking `ESP` and `EBP`.
  - Step-forward & **Step-backward** timeline scrubber with undo-log snapshots.
  - Interactive virtual Irvine32 CRT terminal console supporting non-blocking asynchronous user input (`ReadInt`, `ReadDec`, `ReadHex`, `ReadChar`, `ReadString`).
  - **Share-by-URL:** Compresses student code into a shareable link via LZ-String so students can send broken code directly to their professor.
  - **LocalStorage Autosave:** Automatically preserves student work across browser refreshes.

- **7 Interactive Lecture Modules:**
  - **Chapter 1:** Interactive 8-bit Bitboard, Two's Complement Negation Animator, and Base Converter.
  - **Chapter 2:** IA-32 Architecture Hierarchy, Nested Register Explorer, and Register Taxonomy.
  - **Chapter 3:** MASM Program Anatomy Dissector (`.data`, `.code`, `PROC`/`ENDP`, `exit`), and Data Types (`BYTE`, `WORD`, `DWORD`, `DUP`).
  - **Chapter 4:** Little-Endian Byte Order Animator, Indirect Memory Addressing `[ESI]`, and MOV Restriction Checker.
  - **Chapter 5:** Dynamic Call Stack Simulator (`PUSH`/`POP`), and Procedure Frame Walkthrough (`CALL`/`RET`).
  - **Chapter 6:** CMP Internal Subtraction Calculator, Jump Decision Matrix (`JA`, `JB`, `JG`, `JL`, `JE`, `JNE`), and Signed vs. Unsigned comparisons.
  - **Chapter 7:** Bitwise Shift & Rotate Barrel (`SHL`, `SHR`, `ROL`, `ROR`) with Carry Flag, and 32-bit `MUL` / `DIV` register pairs (`EDX:EAX`).

---

## 🚀 Quick Start (Development)

```bash
# Install dependencies
npm install

# Run Vite dev server with Hot Module Replacement
npm run dev

# Run Vitest test suite (EFLAGS, sub-registers, programs)
npm test

# Build production bundle (< 200 KB gzipped)
npm run build

# Build portable offline ZIP package for TVs & Labs
npm run build:zip
```

---

## 📺 Classroom Android Smart TV Deployment (Offline)

The build output is completely portable and uses relative paths (`base: './'`) with `HashRouter` (`index.html#/playground`). It can be copied directly to classroom TVs:

### Method 1: Lightweight Local Server App (Recommended for TVs)
1. Install a free HTTP server app on the TV from Google Play (e.g., **Simple HTTP Server** or **Tiny Web Server**).
2. Copy `COE224-Assembly-Studio.zip` via USB flash drive to the TV and extract it into internal storage (e.g. `/sdcard/ASMStudio/`).
3. Set the server app root folder to `/sdcard/ASMStudio/` (it will serve at `http://localhost:8080`).
4. Open the TV's browser and navigate to `http://localhost:8080`.
5. Bookmark the page or lecture chapters for one-tap classroom demonstrations!

### Method 2: Direct File Open
1. Extract `COE224-Assembly-Studio.zip` to a USB drive or the TV's internal storage.
2. In the TV file manager, tap `index.html` to open directly in the browser.

---

## 💻 Computer Lab PC Deployment (Windows / Linux / Mac)

For campus lab PCs without reliable internet:
1. Extract `COE224-Assembly-Studio.zip` into `C:\COE224-Studio\`.
2. Create a desktop shortcut with target:
   ```cmd
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="C:\COE224-Studio\index.html"
   ```
   *The `--app=` parameter opens Chrome in a clean, chromeless standalone window that looks and feels like a native desktop app.*

---

## 🌐 GitHub Pages Deployment (Zero-Click CI/CD)

The repository includes `.github/workflows/deploy.yml`. When pushed to GitHub:
1. GitHub Actions automatically installs, runs all 20 tests, and compiles the bundle.
2. Deploys live to `https://<username>.github.io/AssemblyLearner/`.
3. Students can access the application from home on any device.

---

## ⌨ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `F5` | Run continuously |
| `F6` | Pause execution |
| `F10` | Step Forward (one instruction) |
| `F9` | Step Backward (Undo) |
| `Ctrl+Shift+R` | Reset CPU & Memory |
| `Ctrl+Shift+S` | Copy Share-by-URL link to clipboard |

---

## 🏛 Course Syllabus Alignment

| Chapter | Topic in Kip Irvine (7th Ed.) | Studio Component |
| :--- | :--- | :--- |
| **Ch 1** | Basic Concepts & Number Systems | Module 1 (Bitboard, Two's Complement) |
| **Ch 2** | x86 Processor Architecture | Module 2 (Register Nesting & Categories) |
| **Ch 3** | Assembly Language Fundamentals | Module 3 (Code Dissector, Data Definitions) |
| **Ch 4** | Data Transfers, Addressing & Arithmetic | Module 4 (Little-Endian, MOV, ADD/SUB/CMP) |
| **Ch 5** | Procedures & The Stack | Module 5 (Stack Animator, PUSH/POP, CALL/RET) |
| **Ch 6** | Conditional Processing | Module 6 (CMP & Jcc Decision Matrix, Loops) |
| **Ch 7** | Integer Arithmetic & Shifts | Module 7 (Shift Barrel, MUL/DIV EDX:EAX) |

---

*Faculty of Engineering and Information Technology, Buraydah College*
