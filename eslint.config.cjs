const reactPlugin = require('eslint-plugin-react')
const tailwindPlugin = require('eslint-plugin-tailwindcss')
const typescriptPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require("@typescript-eslint/parser")
const cypressPlugin = require("eslint-plugin-cypress/flat")
const globals = require("globals")

module.exports = [
    // Global
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
        
    // Client Typescript src
    {
        files: ['client/src/**/*.{ts,tsx}'],
        languageOptions: {
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
            ...tailwindPlugin.configs.recommended.rules,
            'tailwindcss/no-custom-classname': 'off',
            'react/react-in-jsx-scope': 'off'
        },
        settings: {
            react: {
              version: 'detect'
            },
          }
    },

    // Server Typescript src
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
    },

    // Cypress
    {
        files: ['client/cypress/**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                tsconfigRootDir: __dirname, 
                sourceType: "module",
                ecmaVersion: 2020,
                project: './client/cypress/tsconfig.json',
            },
        },
        plugins: {
            cypress: cypressPlugin
        },
        rules: {
            ...cypressPlugin.configs.recommended.rules
        }
    },
];
