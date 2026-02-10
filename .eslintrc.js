/* eslint-env node */

// ESLint config intentionally focused on correctness + architectural drift prevention for a local-first
// Expo + React Native app (no web target).
//
// Goals:
// - Catch real runtime bugs early (hooks rules, undefined vars, bad imports).
// - Keep the UI layer consistent (prefer src/primitives over raw react-native primitives).
// - Avoid style churn (leave formatting to Prettier, if used).

module.exports = {
  root: true,

  env: {
    es2021: true,
    node: true, // tooling files and metro/expo configs
  },

  globals: {
    __DEV__: 'readonly',
    requestAnimationFrame: 'readonly',
    cancelAnimationFrame: 'readonly',
  },

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },

  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: { extensions: ['.js', '.jsx'] },
    },
  },

  plugins: ['react', 'react-hooks', 'import'],

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
  ],

  rules: {
    // --- Correctness
    'no-undef': 'error',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(React|_)',
        ignoreRestSiblings: true,
      },
    ],

    // --- React / RN realities
    // We don't want lint failures for JSX runtime changes or mixed PropTypes usage.
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off',

    // --- Imports
    // Metro/expo deep exports can trigger false positives. Keep "import/*" for hygiene, not resolution.
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-duplicates': 'error',
    'import/export': 'off',

    // --- Architecture: prefer our primitives over raw react-native primitives
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native',
            importNames: ['View', 'Text', 'Pressable', 'ScrollView', 'TextInput'],
            message: 'Use wrappers from src/primitives (or re-exports from src/components) instead of raw react-native.',
          },
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['src/primitives/**/*.{js,jsx}'],
      rules: {
        // Primitives are allowed to wrap react-native primitives.
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
      env: { jest: true },
    },
  ],
};
