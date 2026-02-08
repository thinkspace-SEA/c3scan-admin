# C3Scan Setup Guide

## 📦 What You Need to Install

### 1. Node.js (Required)
Download and install from: https://nodejs.org/
- Get the **LTS** version (currently v20.x)
- This installs `node` and `npm`

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. VS Code (Recommended Editor)
Download from: https://code.visualstudio.com/

**Required Extensions** (install from VS Code Extensions panel):
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Autocomplete Tailwind classes
- **Prettier - Code: formatter** - Auto-format code
- **ESLint** - Linting

**Optional but helpful:**
- **Supabase** - Browse database
- **GitLens** - Git history
- **VS Code: Icons** - Better file icons

### 3. Git (Usually pre-installed on Mac)
Verify:
```bash
git --version
```

If not installed: https://git-scm.com/download/mac

---

## 🚀 Project Setup

### 1. Clone the repo (when ready)
```bash
cd ~/Desktop
git clone https://github.com/yourusername/c3scan-admin.git
cd c3scan-admin
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create `.env.local` file in project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://foejoqgvkflujdtkzzec.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_cehzrPj-M5shbZELiXGjew_NFZ_hAoG
```

### 4. Run the dev server
```bash
npm run dev
```

Open: http://localhost:3000

---

## 📁 Project Structure

```
c3scan-admin/
├── app/
│   ├── (admin)/           # Admin route group
│   │   ├── admin/         # /admin - Dashboard
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── alias-submissions/
│   │   │       └── page.tsx
│   │   └── layout.tsx     # Admin layout (nav, etc)
│   ├── (customer)/        # Customer route group  
│   │   └── app/
│   │       └── page.tsx   # Customer dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # Reusable UI components
│       ├── CommandPalette.tsx
│       ├── StatusPill.tsx
│       └── DataTable.tsx
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utilities
├── types/
│   └── index.ts           # TypeScript types
└── public/                # Static assets
```

---

## 🎨 Design Tokens (From UI/UX Spec)

```css
/* Colors */
--brand-primary: #FFCC00;
--surface-0: #F7F9FC;
--surface-1: #FFFFFF;
--text-primary: #1A202C;
--action-black: #0F172A;
--semantic-green: #10B981;
--semantic-red: #EF4444;

/* Typography */
Font: Inter (or SF Pro on Mac)
Base size: 14px

/* Spacing */
Unit: 4px (multiples of 4)
```

---

## ✅ Quick Checklist

- [ ] Install Node.js
- [ ] Install VS Code
- [ ] Install VS Code: extensions
- [ ] Clone repo
- [ ] Run `npm install`
- [ ] Create `.env.local`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000

---

## 🆘 Troubleshooting

**Port 3000 in use:**
```bash
npm run dev -- --port 3001
```

**Node version issues:**
Use nvm: https://github.com/nvm-sh/nvm
```bash
nvm install 20
nvm use 20
```

**Permission errors:**
```bash
sudo chown -R $(whoami) ~/.npm
```

---

## 📚 Resources

- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs
- Supabase Docs: https://supabase.com/docs
- UI/UX Spec: `C3scan_UI_UX_Design_Spec_v1.1.docx.md`
