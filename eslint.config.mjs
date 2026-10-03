import js from '@eslint/js';
import ts from 'typescript-eslint';
import i18next from 'eslint-plugin-i18next';
import { fixupPluginRules } from '@eslint/compat';
export default ts.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'next-env.d.ts',
      'src/**/generated/**',
      'src/lib/api/schema.d.ts',
    ],
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: import.meta.dirname },
    },
    plugins: { i18next: fixupPluginRules(i18next) },
    rules: {
      'no-console': 'error',
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1],
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          ignoreArrayIndexes: true,
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Fetch belongs in API adapters.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'BinaryExpression[operator=/^(===|!==|==|!=)$/][left.type!="UnaryExpression"] > Literal[raw=/^[\\\'"]/]',
          message: 'Use a named constant for string comparisons.',
        },
        { selector: 'SwitchCase > Literal', message: 'Use a named constant in switch cases.' },
        {
          selector: 'NewExpression[callee.name=/Error$/] > Literal',
          message: 'Use an error code/catalog.',
        },
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message: 'Unsafe HTML is forbidden.',
        },
      ],
      'i18next/no-literal-string': ['error', { mode: 'jsx-only' }],
    },
  },
  {
    files: ['src/lib/api/**/*.ts', 'src/features/*/api/**/*.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['**/*.constants.ts', 'src/config/**/*.ts', '**/*.test.{ts,tsx}', 'tools/**/*.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'no-restricted-syntax': 'off',
      'i18next/no-literal-string': 'off',
    },
  },
);
