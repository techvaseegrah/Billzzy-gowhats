module.exports = {
    extends: [
      'next/core-web-vitals',
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      // Prevent "defined but never used" errors
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true,
        "react/react-in-jsx-scope": "off"

      }],
      
      // Allow "any" type if needed
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Allow empty interfaces
      '@typescript-eslint/no-empty-interface': 'off',
      
      // Force const when variable is never reassigned
      'prefer-const': 'warn',
  
      // React specific rules
      'react/react-in-jsx-scope': 'off',  // Not needed in Next.js
      'react/prop-types': 'off',          // We're using TypeScript
      
      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'off'
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    env: {
      node: true,
      browser: true,
      es6: true
    }
  }