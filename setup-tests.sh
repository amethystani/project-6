#!/bin/bash

# Script to install Jest and Testing Library dependencies

echo "Installing Jest and React Testing Library dependencies..."

# Install Jest and related packages
npm install --save-dev jest ts-jest @types/jest jest-environment-jsdom

# Install React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install other testing utilities
npm install --save-dev identity-obj-proxy

echo "Setting up Jest configuration..."

# Create test setup file if it doesn't already exist
if [ ! -f "src/__tests__/setup.ts" ]; then
  mkdir -p src/__tests__
  touch src/__tests__/setup.ts
  echo "// Import React Testing Library's utilities
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});" > src/__tests__/setup.ts
fi

echo "Creating test directories..."

# Create test directory structure if it doesn't exist
mkdir -p src/__tests__/components
mkdir -p src/__tests__/utils
mkdir -p src/__tests__/hooks

echo "Setup complete! You can now run tests with: npm test"
echo "To run tests in watch mode: npm run test:watch"
echo "To generate coverage reports: npm run test:coverage" 