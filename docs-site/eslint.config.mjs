import js from '@eslint/js';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'out/**']
  },
  js.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  {
    files: ['mdx-components.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly'
      }
    }
  }
];
