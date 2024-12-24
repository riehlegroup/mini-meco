const reactPlugin = require('eslint-plugin-react')
const tailwindPlugin = require('eslint-plugin-tailwindcss')
const typescriptPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require("@typescript-eslint/parser")
const globals = require("globals")

module.exports = [
    // Global
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
    // Client
    {
        files: ['client/**/*.{ts,tsx}'],
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            parser: typescriptParser,
            parserOptions: {
                tsconfigRootDir: __dirname, 
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                },
                ecmaVersion: 2020,
                project: './client/tsconfig.json',
            },
            globals: {
                ...globals.browser,
            }
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
            react: reactPlugin,
            tailwindcss: tailwindPlugin
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...typescriptPlugin.configs.recommended.rules,
            'tailwindcss/no-custom-classname': 'off',
            'react/react-in-jsx-scope': 'off'
        },
        settings: {
            react: {
              version: 'detect'
            },
          }
    },

    // Server
    {
        files: ['server/**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                tsconfigRootDir: __dirname, 
                sourceType: "module",
                ecmaVersion: 2020,
                project: './server/tsconfig.json',
            },
            globals: {
                ...globals.node,
            }
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
        },
        rules: {
            ...typescriptPlugin.configs.recommended.rules,
        },
    }
];
