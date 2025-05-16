import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', '**/.ts-build/**', '**/*.css'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-x': reactX,
      'react-dom': reactDom,
      // "react-refresh": reactRefresh,
    },
    rules: {
      ...reactX.configs['recommended-typescript'].rules,
      ...reactDom.configs.recommended.rules,
    },
    // rules: {
    //   ...reactHooks.configs.recommended.rules,
    //   "react-refresh/only-export-components": [
    //     "warn",
    //     { allowConstantExport: true },
    //   ],
    // },
  },
);
