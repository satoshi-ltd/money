# Project Context: Money

## Overview
**Môney** is a private finance ledger application built with **Expo** and **React Native**. It focuses on privacy ("running on your own blockchain" metaphor) and local data persistence using `AsyncStorage` and iCloud/Backup services.

## Tech Stack
- **Framework:** Expo SDK 53, React Native 0.79, React 19.
- **Language:** JavaScript (ES6+), JSX.
- **Navigation:** React Navigation v6 (Native Stack, Bottom Tabs, Material Top Tabs).
- **Styling:** `react-native-extended-stylesheet` (EStyleSheet).
- **State Management:** React Context API + `useReducer`.
- **Persistence:** `@react-native-async-storage/async-storage`.
- **Charts:** `react-native-gifted-charts`.
- **Monetization:** `react-native-purchases`.

## Project Structure
The source code is located in the `src/` directory:

- **`src/screens/`**: Application screens, organized by feature/route.
- **`src/components/`**: Feature-specific UI components.
  - Structure: `Component/Component.jsx`, `Component.styles.js`, `index.js`.
- **`src/design-system/`**: Low-level reusable UI primitives (View, Text, Button, Icon).
  - **Always prefer using these over raw React Native components.**
- **`src/services/`**: logic for external services (Storage, Backup, Notifications, Rates).
- **`src/contexts/`**: Global state management (App context, Store context).
- **`src/modules/`**: Helper functions, business logic, formatting utilities.
- **`src/theme/`**: Theme definitions (Light/Dark).
- **`src/assets/`**: Static assets (fonts, images).

## Development Guidelines

### 1. Component Architecture
- **Atomic Design:** Use `design-system` components for building blocks.
- **Styling:**
  - Use `react-native-extended-stylesheet`.
  - Define styles in a separate `*.styles.js` file alongside the component.
  - Use global theme variables (e.g., `$spaceS`, colors) defined in the theme.
- **Imports:** Prefer named imports or index imports where established.

### 2. State Management
- Use `src/contexts` for global state.
- Use local `useState`/`useReducer` for component-specific state.
- Persistent data handles via `StorageService`.

### 3. Naming Conventions
- **Files:** PascalCase for React components (`MyComponent.jsx`), camelCase for utilities (`myUtility.js`).
- **Folders:** PascalCase for Component folders.

### 4. Scripts
- `yarn start`: Run the Expo development server.
- `yarn lint`: Run ESLint.
- `yarn test`: Run Jest tests.

## Key Files
- `App.js`: Entry point.
- `src/App.Navigator.jsx`: Main navigation setup.
- `src/config/theme.js` & `src/theme/`: Theme configuration.

## "Do's and Don'ts"
- **DO** use the `design-system` components (`View`, `Text`, `Button`) instead of `react-native` primitives when possible.
- **DO** check `package.json` before installing new libraries.
- **DON'T** hardcode colors. Use theme variables or the `resolveColor` utility.
