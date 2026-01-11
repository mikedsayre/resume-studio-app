# Resume Studio Build Plan

This document outlines the architectural and implementation strategy for rebuilding the Resume Studio application.

## 1. Core Objectives

*   **Mobile-First Design**: The application UI must prioritize responsiveness for mobile devices and scale gracefully to larger screens.
*   **Content & Style Separation**: Users should be able to define resume content using Markdown and style it independently using custom CSS.
*   **Live Preview**: Real-time rendering of the resume based on Markdown and CSS input.
*   **CSS Isolation**: Crucially, the custom CSS applied to the resume preview must *not* interfere with the main application's UI. The old app's CSS overriding the preview window is a known issue to be avoided.
*   **Tabbed Editor Experience**: The Markdown and CSS editors should be easily switchable, ideally within the same editor pane.
*   **Vercel Deployment Ready**: The application should be easily deployable to Vercel.

## 2. Architectural Overview

The application will follow a standard React single-page application (SPA) architecture.

*   **Frontend**: React (TypeScript) for UI components and state management.
*   **Styling**: A combination of basic CSS for application layout and components, managed in `index.css`. Custom resume styling will be handled by user-provided CSS within the iframe.
*   **Content Rendering**: Markdown content will be parsed and converted to HTML client-side.
*   **CSS Isolation**: An `iframe` will be used for the resume preview to completely isolate its CSS from the parent application.

## 3. Component Breakdown (Initial Phase)

*   **`App.tsx`**:
    *   Main application component.
    *   Manages top-level state: `markdownContent` (string), `cssContent` (string), `activeEditorTab` ('markdown' | 'css'), `showTemplateModal`, `showHelpModal`, `showImportOptions`, `showExportOptions`.
    *   Renders the main layout: editor pane and preview pane, `Header`, action buttons, and `Footer`.
    *   Manages template state and interactions via `TemplateModal`.
*   **`index.tsx`**:
    *   The application's entry point.
    *   Responsible for importing `App` and mounting it to the DOM (the `#root` element). Contains robust DOM readiness checks.
*   **`EditorPanel` (part of `App.tsx` implicitly)**:
    *   Contains the tab navigation (`Markdown` / `CSS`).
    *   Conditionally renders `Editor` components based on `activeEditorTab`.
*   **`Editor` (part of `App.tsx`)**:
    *   A `textarea` element for users to input Markdown or CSS content.
    *   Updates `markdownContent` or `cssContent` state on user input.
*   **`ResumePreview` (part of `App.tsx`)**:
    *   An `iframe` element used to render the final resume.
    *   Dynamically injects the rendered HTML (from `markdownContent`) and `cssContent` into the `iframe`'s `document`.
*   **`Header` (part of `App.tsx`)**:
    *   Displays the application logo, title, tagline, and help button. The "by swan lake digital" byline has been removed from the header.
*   **`TemplateModal` (part of `App.tsx`)**:
    *   A modal component to manage templates. Displays predefined templates, user-saved templates, and provides functionality to save new custom templates and delete existing ones.
*   **`HelpModal.tsx`**:
    *   A modal component to display the application's help guide, loaded from `HelpContent.md`.
*   **`Footer` (part of `App.tsx`)**:
    *   A new footer component displaying copyright information with a perpetual current year and the application mascot logo.

## 4. Technical Implementation Details

### 4.1. `index.html`
*   Standard HTML5 boilerplate.
*   `div` with `id="root"` for React application.
*   `script` tag importing `index.tsx` as a module (`type="module"`).
*   `viewport` meta tag for mobile responsiveness.
*   Links to `index.css` for application styling.
*   Includes `font-awesome` for icons.
*   **Favicon Path**: The `href` for the favicon will be explicitly set to `images/resume-studio-mascot-64px.png` to ensure correct resolution when the `public` directory serves as the root.

### 4.2. `index.css`
*   Contains all global and application-specific CSS rules for the main UI, including modal styles, specific styles for help content, and new styles for button groups (dropdown containers, sub-buttons), and the new footer. Includes responsive design for all elements.

### 4.3. `index.tsx` (React Entry Point)
*   **Robust Mounting**: Implements a check for `document.readyState` to ensure the `#root` element is available before `createRoot` is called. It will either mount immediately if the DOM is ready or wait for the `DOMContentLoaded` event.
*   **Logging**: Includes verbose console logging to aid in diagnosing any potential mounting issues.

### 4.4. `App.tsx` (Main React Component)

*   **State Management**: `useState` hooks for `markdownContent`, `cssContent`, `activeEditorTab`, `showTemplateModal`, `showHelpModal`, `showImportOptions`, and `showExportOptions`.
*   **Markdown Parsing**: Uses `marked` library to convert `markdownContent` to HTML before injecting into the iframe.
*   **CSS Isolation with `iframe`**:
    *   The `ResumePreview` component renders an `<iframe>`.
    *   A `useEffect` hook within `ResumePreview` manipulates the iframe's `document`.
    *   When `markdownContent` or `cssContent` changes:
        1.  Gets a reference to the `iframe`'s `document`.
        2.  Clears existing content.
        3.  Injects the parsed HTML into the `body`.
        4.  Injects the `cssContent` within a `<style>` tag in the `head`.
*   **Persistence**: Uses `localStorage` to automatically save the user's `markdownContent`, `cssContent`, and `customTemplates` as they type, and loads them on component mount.
*   **Template Management**:
    *   Defines a `Template` interface and an array of `PREDEFINED_TEMPLATES`.
    *   `TemplateModal` component handles displaying templates, applying selected templates, saving the current work as a new custom template, and deleting custom templates.
    *   `customTemplates` are stored and retrieved from `localStorage`.
*   **Help Modal**:
    *   The `HelpModal` component is used to display help content loaded from `HelpContent.md`.
*   **Visible Preview Title**: A clear, visible title "Resume Preview" is added above the iframe for better user orientation.
*   **Mobile-First Layout**:
    *   Uses CSS Flexbox or Grid, defined in `index.css`.
    *   On small screens, the editor and preview stack vertically.
    *   On larger screens, they display side-by-side.
    *   The dynamic height calculation for `app-container` has been removed, relying on `flex-grow: 1` and `flex-shrink: 0` for proper layout.
*   **Action Buttons**: Includes "Export PDF", "Copy HTML", "Templates", and new "Import" and "Export" functionalities.
    *   **PDF Export**: Utilizes `html2canvas` and `jsPDF` to convert the iframe content to a PDF, handling multi-page content for improved reliability.
    *   **Copy HTML**: Copies the full HTML (including styles) of the rendered resume from the iframe to the clipboard.
    *   **File Import**: Uses hidden `input type="file"` elements and `FileReader` to allow users to select and load `.md` or `.css` files into the respective editors.
    *   **File Export**: Creates `Blob` objects from the current Markdown and CSS content and triggers a download of `.md` or `.css` files.
    *   The "Import" and "Export" buttons will reveal sub-options for Markdown and CSS to maintain a cleaner main action bar.
*   **Asset Paths**: Image paths will be managed by `constants.ts` and referenced by components. **It is crucial that the `public/images` directory (containing `resume-studio-mascot-256px.png`, `resume-studio-mascot-64px.png`) is created and these image files are placed there. Your web server must be configured to serve static assets from this `public` directory, making `images/` the effective root for these assets.**

### 4.5. `HelpContent.md`
*   Contains the Markdown-formatted help documentation, updated with a new section for Import/Export and the application mascot image. **This file MUST be moved into the `public/` directory for the `fetch` call in `HelpModal.tsx` to succeed in a production environment like Vercel.**

### 4.6. `constants.ts`
*   Centralizes image paths and other potential constants for easy management and consistency across the application, with updated constant names and image filenames.

## 5. Excluded Features (for current phase, based on user input)

*   **Any "unused buttons/features" from the screenshot**: These will be omitted from the initial build to focus on core functionality (e.g., download, print, advanced settings, account features).
*   **Cloud Storage / Persistence**: No backend integration in this initial phase. Content will be ephemeral (browser session only).

## 6. Future Considerations / Roadmap

*   **Accessibility Enhancements**: Further refine ARIA attributes and focus management across the application.
*   **Offline Support**: Explore implementing Service Workers for PWA capabilities.
*   **GenAI Integration**: Explore using `@google/genai` for features like:
    *   Content suggestions based on job descriptions.
    *   Grammar and spell checking.
    *   Summarization of experience.
    *   Tone adjustment.

This plan aims to deliver a robust, user-friendly, and maintainable Resume Studio application, addressing the critical CSS isolation requirement and setting a strong foundation for future enhancements.