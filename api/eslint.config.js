import js from '@eslint/js';
import globals from 'globals';
import pluginSecurity from 'eslint-plugin-security';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  pluginSecurity.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  eslintConfigPrettier,
];
