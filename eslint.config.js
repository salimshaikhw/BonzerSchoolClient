import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Architecture rules: see docs/ARCHITECTURE.md. A layer may only import from layers below it.
const forbid = (group, message) => ({
  'no-restricted-imports': ['error', { patterns: [{ group, message }] }],
});

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  // api layer: pure data access. No React, no features, no UI.
  {
    files: ['src/api/**/*.ts'],
    rules: forbid(['@/features/*', '@/shared/ui/*', '@/app/*', 'react', 'react-dom'], 'api/ must not depend on UI or features.'),
  },
  // queries layer: shared server-state hooks. No features, no app shell.
  {
    files: ['src/queries/**/*.ts'],
    rules: forbid(['@/features/*', '@/app/*'], 'queries/ must not depend on features or the app shell.'),
  },
  // shared layer: generic building blocks. Must not know about features or the app shell.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: forbid(['@/features/*', '@/app/*', '@/api/*'], 'shared/ must stay generic.'),
  },
  // features: no feature may import another feature (talk through api/, auth/ or shared/).
  ...['login', 'dashboard', 'school-groups', 'branches', 'academic-years', 'classes', 'students'].map((name) => ({
    files: [`src/features/${name}/**/*.{ts,tsx}`],
    rules: forbid(
      ['@/features/*', '@/app/*'],
      'Features must not import other features or the app shell.',
    ),
  })),
);
