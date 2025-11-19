# 🧹 Cleanup Recommendations - Unnecessary Files

## 📋 Summary
Your workspace has **several unused files and folders** that can be safely removed. This cleanup will reduce confusion and make your project cleaner.

---

## ❌ SAFE TO DELETE - Confirmed Unused

### 1. **Entire `openbook-dex/` folder** ❗ LARGEST
**Size**: Potentially 100+ MB (includes Rust target/, .git/, compiled binaries)
```
openbook-dex/
├── Cargo.toml
├── target/         (compiled Rust artifacts - VERY LARGE)
├── dex/
├── scripts/
├── .git/          (full git history)
└── ... (entire Rust DEX program)
```
**Reason**: This is the entire Openbook DEX Rust program source code. Your app doesn't compile or use any of this code. You're just using `@solana/web3.js` to interact with the deployed DEX program on-chain.

**Impact**: Will free up significant disk space.

---

### 2. **Duplicate `src/` folder**
```
src/
├── App.jsx
└── WalletConnector.jsx
```
**Reason**: These are old files that are NOT used. Your Next.js app uses:
- `app/page.tsx` (not `src/App.jsx`)
- `components/wallet-connect.tsx` (not `src/WalletConnector.jsx`)

These look like leftover files from a previous non-Next.js setup.

---

### 3. **Browser Extension Files (if not using)**
```
browser-extension/
├── background.js
├── content-script.js
├── manifest.json
├── popup/
└── ... (7 files total)

notification/
├── background.js
├── content..js
└── manifest.json
```

**Question**: Are you actively using a browser extension? 
- If **NO** → Delete both folders
- If **YES** → Keep them

**Also in `app/` folder**:
```
app/content-script.js
app/website-integration.js
```
**Reason**: These aren't imported anywhere in your Next.js app.

---

### 4. **Empty/Unused Files**
```
app/page-sidebyside.tsx         (EMPTY FILE - 0 bytes)
styles/globals.css              (duplicate of app/globals.css)
```

---

### 5. **Duplicate Hook Files**
```
hooks/
├── use-mobile.tsx              (duplicate)
└── use-toast.ts                (duplicate)
```
**Reason**: These are duplicates of:
- `components/ui/use-mobile.tsx` ✅ (actually used)
- `components/ui/use-toast.ts` ✅ (actually used)

Your code imports from `@/hooks/...` but the actual files being used are in `components/ui/`.

---

### 6. **Unused UI Components** (Radix UI)
These shadcn/ui components are installed but **never imported**:

```
components/ui/
├── breadcrumb.tsx          ❌ Not used
├── carousel.tsx            ❌ Not used
├── collapsible.tsx         ❌ Not used
├── command.tsx             ❌ Not used
├── context-menu.tsx        ❌ Not used
├── drawer.tsx              ❌ Not used
├── form.tsx                ❌ Not used
├── hover-card.tsx          ❌ Not used
├── input-otp.tsx           ❌ Not used
├── menubar.tsx             ❌ Not used
├── navigation-menu.tsx     ❌ Not used
├── pagination.tsx          ❌ Not used
├── radio-group.tsx         ❌ Not used
├── resizable.tsx           ❌ Not used
```

**Used Components** (keep these):
- accordion, alert-dialog, alert, animated-*, avatar, badge, button
- calendar, card, chart, checkbox, dialog, dropdown-menu
- input, label, popover, progress, scroll-area, select
- separator, sheet, sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea, toast, toaster, toggle
- toggle-group, tooltip

---

### 7. **Unused Components**
```
components/
├── portfolio-panel.tsx     ❌ Not imported anywhere
└── toaster.tsx             ⚠️  Duplicate? Check vs ui/toaster.tsx
```

---

### 8. **Test Files in Production Code**
```
lib/nlu/
├── simple-test.ts          (testing only)
├── evaluate-models.ts      (testing only)
├── package.json            (testing only)
```
**Reason**: These are for development/testing. Your production app doesn't use them.

**Recommendation**: Move to a separate `tests/` folder or keep if you're actively developing/testing the NLU model.

---

## 📊 Estimated Space Savings

| Item | Estimated Size |
|------|----------------|
| `openbook-dex/` | **100-500 MB** |
| `browser-extension/` + `notification/` | 1-2 MB |
| `src/` folder | <100 KB |
| Unused UI components | 500 KB |
| Other files | <1 MB |
| **TOTAL** | **~100-500 MB+** |

---

## 🚀 Action Plan

### Phase 1: Obvious Deletions (SAFE)
```powershell
# 1. Delete openbook-dex (BIGGEST)
Remove-Item -Recurse -Force "d:\HACKATHON\SimplYield\SimplYield\openbook-dex"

# 2. Delete old src/ folder
Remove-Item -Recurse -Force "d:\HACKATHON\SimplYield\SimplYield\src"

# 3. Delete empty file
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\app\page-sidebyside.tsx"

# 4. Delete duplicate styles
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\styles\globals.css"

# 5. Delete extension files in app/
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\app\content-script.js"
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\app\website-integration.js"
```

### Phase 2: Decision Required

**Browser Extension** (if not using):
```powershell
Remove-Item -Recurse -Force "d:\HACKATHON\SimplYield\SimplYield\browser-extension"
Remove-Item -Recurse -Force "d:\HACKATHON\SimplYield\SimplYield\notification"
```

**Unused UI Components** (safe to delete, can regenerate with shadcn):
```powershell
cd "d:\HACKATHON\SimplYield\SimplYield\components\ui"
Remove-Item breadcrumb.tsx
Remove-Item carousel.tsx
Remove-Item collapsible.tsx
Remove-Item command.tsx
Remove-Item context-menu.tsx
Remove-Item drawer.tsx
Remove-Item form.tsx
Remove-Item hover-card.tsx
Remove-Item input-otp.tsx
Remove-Item menubar.tsx
Remove-Item navigation-menu.tsx
Remove-Item pagination.tsx
Remove-Item radio-group.tsx
Remove-Item resizable.tsx
```

### Phase 3: Optional Cleanup

**Duplicate hooks** (if using @/hooks/... imports):
```powershell
# Check which imports you're using first!
# If everything imports from @/hooks/use-toast, then keep hooks/ folder
# If everything imports from @/components/ui/use-toast, then delete hooks/ folder
```

**NLU Test Files** (keep if actively testing):
```powershell
# Only delete if you're done testing the NLU model
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\lib\nlu\simple-test.ts"
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\lib\nlu\evaluate-models.ts"
Remove-Item "d:\HACKATHON\SimplYield\SimplYield\lib\nlu\package.json"
```

---

## ✅ What to Keep

**Core App**:
- `app/` (except files listed above)
- `components/` (except unused UI components)
- `lib/`
- `stake-unstake/`
- `public/`

**Config Files**:
- `package.json`
- `next.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`
- `components.json`
- `.env.local`

**Documentation**:
- `README.md`
- `lib/nlu/*.md` (NLU documentation)

---

## 🔍 How I Determined This

1. **Searched all imports** across your codebase
2. **Found no references** to these files/folders
3. **Checked package.json** for actual dependencies
4. **Analyzed folder structure** for duplicates

---

## ⚠️ Before Deleting

1. **Commit your current code** to git first!
   ```bash
   git add .
   git commit -m "Before cleanup"
   ```

2. **Test after deletion**:
   ```bash
   npm run dev
   ```

3. **Check for any errors** in the browser console

---

## 🎯 Priority Order

1. **DELETE FIRST** (100% safe, big impact):
   - `openbook-dex/` folder

2. **DELETE SECOND** (100% safe):
   - `src/` folder
   - `app/page-sidebyside.tsx`
   - `app/content-script.js`
   - `app/website-integration.js`

3. **DECIDE THEN DELETE**:
   - Browser extension folders (if not using)
   - Unused UI components (can regenerate)
   - NLU test files (if done testing)

---

## 📝 Notes

- **shadcn/ui components** can be re-added anytime with:
  ```bash
  npx shadcn@latest add [component-name]
  ```

- **Openbook DEX**: You're using the deployed program via RPC, not compiling the source.

- **Duplicates**: Always check which version is actually imported before deleting.
