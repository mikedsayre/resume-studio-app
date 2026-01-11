import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App'; // Import the App component

// Function to mount the React application
const mountReactApp = () => {
  console.log('mountReactApp: Attempting to find root element.');
  let container: HTMLElement | null = null;
  try {
    container = document.getElementById('root');
  } catch (e) {
    console.error('mountReactApp: Error when trying to get element by ID "root":', e);
  }

  if (container) {
    console.log('mountReactApp: Root element found!', container);
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('mountReactApp: Failed to find the root element to mount the React application. Container:', container);
  }
};

console.log('index.tsx script loaded. Current document.readyState:', document.readyState);

// Robust mounting strategy: check document.readyState
if (document.readyState === 'loading') {
  // Loading still, wait for DOMContentLoaded
  console.log('index.tsx: document.readyState is "loading", adding DOMContentLoaded listener.');
  window.addEventListener('DOMContentLoaded', () => {
    console.log('index.tsx: DOMContentLoaded fired! Current readyState:', document.readyState);
    mountReactApp();
  });
} else {
  // DOM is already interactive or complete, mount immediately
  console.log('index.tsx: document.readyState is not "loading" (it is "' + document.readyState + '"), mounting app immediately.');
  mountReactApp();
}