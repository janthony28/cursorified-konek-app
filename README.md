# React + Vite

**Supabase:** For multi-baby reporting, ensure the `maternal_records` table has a `baby_details` column (type `jsonb`, default `'[]'`). Each item is `{ weight, category, sex }`. For high-risk checklists, optional boolean columns: `has_hypertension`, `has_gestational_diabetes`, `has_advanced_maternal_age`, `has_multiple_gestation`, `has_multiple_miscarriages`, `has_obesity` (the app will send these on save; add them in the table if you want them persisted).

**New General Data & Birth Registration Columns:** Run this SQL migration in Supabase SQL Editor:
```sql
-- Add General Data columns
ALTER TABLE maternal_records
  ADD COLUMN IF NOT EXISTS civil_status TEXT,
  ADD COLUMN IF NOT EXISTS is_solo_parent BOOLEAN,
  ADD COLUMN IF NOT EXISTS solo_parent_type TEXT,
  ADD COLUMN IF NOT EXISTS solo_parent_other TEXT,
  ADD COLUMN IF NOT EXISTS philhealth_status TEXT,
  ADD COLUMN IF NOT EXISTS philhealth_type TEXT,
  ADD COLUMN IF NOT EXISTS sss_member BOOLEAN,
  ADD COLUMN IF NOT EXISTS gsis_member BOOLEAN,
  ADD COLUMN IF NOT EXISTS contact_no TEXT,
  ADD COLUMN IF NOT EXISTS email_address TEXT,
  ADD COLUMN IF NOT EXISTS birth_registered BOOLEAN,
  ADD COLUMN IF NOT EXISTS birth_registration_date DATE;
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
