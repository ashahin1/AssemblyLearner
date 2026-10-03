# COE224: Assembly Language Studio

**Interactive Learning Environment & IA-32 Simulator**  
*Buraydah Private Colleges, Faculty of Engineering and Information Technology*  
*Curriculum Text:* **Assembly Language for x86 Processors (7th Edition)** by Kip R. Irvine (Chapters 1–7)

---

## 🌟 Overview

**COE224 Assembly Studio** is a 100% client-side, browser-based x86 educational IDE and interactive learning platform built for Computer Engineering students. It requires **zero software installation**, runs on Windows, Mac, Linux, iPad, and **Classroom Android Smart TVs**, and operates completely offline.

### Key Capabilities:
- **Playground IDE & Simulator:**
  - **Syntax Highlighting (CodeMirror 6):** Rich syntax colorization for MASM instructions, registers, directives, numeric literals, and comments across both Dark and Light themes.
  - **Classroom TV Mode & Global UI Zoom (80%–200%):** One-click `📺 TV Mode` (140% zoom) and granular `[-] / [+]` scale controls designed specifically so students in the back rows of large lecture rooms can read all panels clearly.
  - **Presentation Fullscreen Toggle (⛶):** Hides browser toolbars and OS taskbars on classroom TVs and projectors.
  - **Synchronized Nested Registers:** Real-time visual cascading for `EAX` $\to$ `AX` $\to$ `AH` / `AL`, `EBX`, `ECX`, `EDX`, `ESI`, `EDI`, `EBP`, `ESP`, and `EIP`.
  - **Multi-Format Register Display:** Instant switching between Hex, Unsigned Decimal, Signed Decimal (Two's Complement), and Binary.
  - **Multi-Format Stack Panel:** Downward-growing call stack tracking `ESP`/`EBP` with format toggles (`HEX`, `U-DEC`, `S-DEC`, `BIN`).
  - **Advanced Memory Hex Grid:** Little-endian data segment inspector supporting configurable granularity (`1B Byte`, `2B Word`, `4B DWord`) and multi-format display (`HEX`, `U-DEC`, `S-DEC`, `BIN`) with ASCII preview.
  - **Dynamic IA-32 Status Flags:** Live flag indicators (`ZF`, `CF`, `SF`, `OF`, `PF`, `AF`) with pedagogical diagnostic explanations.
  - **Undo / Time-Travel Scrubber:** Step-forward and **Step-backward** timeline scrubber with undo-log snapshots.
  - **Virtual Irvine32 CRT Console:** Supports standard I/O library procedures (`WriteString`, `WriteInt`, `WriteDec`, `WriteHex`, `WriteBin`, `WriteChar`, `Crlf`, `DumpRegs`, `DumpMem`) and non-blocking asynchronous user input (`ReadInt`, `ReadDec`, `ReadHex`, `ReadChar`, `ReadString`).
  - **Direct Font Size Controls:** Instant `[A-]` and `[A+]` buttons in the editor header (12px to 32px).
  - **Share-by-URL:** Compresses student code into a shareable link via LZ-String so students can send code directly to their instructor.
  - **LocalStorage Autosave:** Automatically preserves student work and preferences across browser sessions.
  - **Global Error Boundary:** Safeguards against unhandled exceptions with self-healing reload and reset options.

- **7 Interactive Lecture Modules:**
  - **Chapter 1:** Interactive 8-bit Bitboard, Two's Complement Negation Animator, and Base Converter.
  - **Chapter 2:** IA-32 Architecture Hierarchy, Nested Register Explorer, and Register Taxonomy.
  - **Chapter 3:** MASM Program Anatomy Dissector (`.data`, `.code`, `PROC`/`ENDP`, `exit`), and Data Types (`BYTE`, `WORD`, `DWORD`, `DUP`).
  - **Chapter 4:** Little-Endian Byte Order Animator, Indirect Memory Addressing `[ESI]`, and MOV Restriction Checker.
  - **Chapter 5:** Dynamic Call Stack Simulator (`PUSH`/`POP`), and Procedure Frame Walkthrough (`CALL`/`RET`).
  - **Chapter 6:** CMP Internal Subtraction Calculator, Jump Decision Matrix (`JA`, `JB`, `JG`, `JL`, `JE`, `JNE`), and Signed vs. Unsigned comparisons.
  - **Chapter 7:** Bitwise Shift & Rotate Barrel (`SHL`, `SHR`, `ROL`, `ROR`) with Carry Flag, and 32-bit `MUL` / `DIV` register pairs (`EDX:EAX`).

---

## 🚀 Distribution & Quick Start

The project produces a **100% standalone, single-file distribution** (`COE224-Assembly-Studio.html`) with all scripts, styles, SVGs, and modules inlined. It has zero external server dependencies and zero CORS restrictions when opened directly via `file:///`.

### 1. Direct Offline Use (Fastest)
Simply double-click [`COE224-Assembly-Studio.html`](./COE224-Assembly-Studio.html) on any PC, Mac, Linux machine, or Android TV. It launches immediately in Google Chrome, Microsoft Edge, Firefox, or Safari.

### 2. Local Development
```bash
# Install dependencies
npm install

# Run Vite dev server with Hot Module Replacement
npm run dev

# Run Vitest test suite (all 22 automated tests)
npm test

# Build single-file bundle and distribution package
npm run build:zip
```

---

## 📺 Classroom Android Smart TV Deployment

Smart educational TVs in classrooms can run the studio completely offline without requiring internet access or a web server:

### Direct File Open (Recommended)
1. Copy [`COE224-Assembly-Studio.html`](./COE224-Assembly-Studio.html) onto a USB drive.
2. Plug the USB drive into the classroom TV or copy the file into the TV's internal storage (e.g. `/sdcard/Download/`).
3. Open the TV's web browser (Chrome, TV Browser, or File Manager) and tap `COE224-Assembly-Studio.html`.
4. Click the **`📺 TV Mode`** button in the top navigation bar to zoom the interface to 140% for back-row visibility.
5. Click the **`⛶ Fullscreen`** button to hide browser toolbars for a distraction-free presentation!

---

## 🎓 Blackboard LMS Integration

Instructors can distribute the studio directly to students via Blackboard Learn or Blackboard Ultra:

1. Navigate to your course Content Area (e.g., **Course Documents** or **Lab Resources**).
2. Click **Build Content** $\to$ **File** (or in Blackboard Ultra: **$+$** $\to$ **Upload Local File**).
3. Select and upload [`COE224-Assembly-Studio.html`](./COE224-Assembly-Studio.html).
4. Set **Open in New Window** to **Yes**.
5. Add student instructions:
   > *"Click to open or download. This studio runs 100% in your browser (Chrome/Edge/Firefox) with zero installation required. You can also save the file to your laptop or USB drive to practice offline."*
6. When students click the link, their browser either launches the studio directly or downloads the single-file app to their computer for permanent offline access.

---

## 🌐 GitHub Pages Deployment (Zero-Click CI/CD)

The repository is pre-configured for free instant hosting on GitHub Pages:

### Method A: Automated GitHub Actions (Recommended)
The repository includes [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml):
1. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository, go to **Settings** $\to$ **Pages**.
3. Under **Build and deployment $\to$ Source**, choose **GitHub Actions**.
4. GitHub Actions will automatically run all 22 tests, compile the bundle, and publish the live URL:
   $$\text{https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/}$$

### Method B: Deploy from `/docs` Folder
The repository also includes a pre-built [`docs/index.html`](./docs/index.html):
1. In your GitHub repository, go to **Settings** $\to$ **Pages**.
2. Under **Build and deployment $\to$ Source**, choose **Deploy from a branch**.
3. Select branch **`main`** and folder **`/docs`**, then click **Save**.

---

## 💻 Computer Lab PC Deployment (Windows / Linux / Mac)

For campus lab PCs:
1. Copy `COE224-Assembly-Studio.html` into `C:\COE224-Studio\COE224-Assembly-Studio.html`.
2. Create a desktop shortcut with the target:
   ```cmd
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="C:\COE224-Studio\COE224-Assembly-Studio.html"
   ```
   *The `--app=` flag opens Chrome in a clean, chromeless standalone window that looks and feels like a native desktop application.*

---

## ⌨ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `F5` | Run continuously |
| `F6` | Pause execution |
| `F10` | Step Forward (one instruction) |
| `F9` | Step Backward (Undo / Time travel) |
| `Ctrl + +` / `Ctrl + -` | Zoom In / Zoom Out |
| `Ctrl + Shift + R` | Reset CPU & Memory |
| `Ctrl + Shift + S` | Copy Share-by-URL link to clipboard |

---

## 🏛 Course Syllabus Alignment

| Chapter | Topic in Kip Irvine (7th Ed.) | Studio Component |
| :--- | :--- | :--- |
| **Ch 1** | Basic Concepts & Number Systems | Module 1 (Bitboard, Two's Complement, Radix Converter) |
| **Ch 2** | x86 Processor Architecture | Module 2 (Register Nesting, EFLAGS, Architecture Hierarchy) |
| **Ch 3** | Assembly Language Fundamentals | Module 3 (Code Dissector, Data Definitions, Directives) |
| **Ch 4** | Data Transfers, Addressing & Arithmetic | Module 4 (Little-Endian, MOV/XCHG, PTR/OFFSET, ADD/SUB/CMP) |
| **Ch 5** | Procedures & The Stack | Module 5 (Stack Animator, PUSH/POP, CALL/RET, Local Frames) |
| **Ch 6** | Conditional Processing | Module 6 (CMP & Jcc Decision Matrix, Signed vs Unsigned, LOOP) |
| **Ch 7** | Integer Arithmetic & Shifts | Module 7 (Shift & Rotate Barrel, MUL/DIV EDX:EAX, CBW/CWD/CDQ) |

---

*Faculty of Engineering and Information Technology, Buraydah Private Colleges*
