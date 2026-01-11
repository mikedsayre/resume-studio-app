# Resume Studio Development Progress

## Current Version: 0.2.7

## Completed Tasks

*   Initial project setup with React (TypeScript) and `marked` for Markdown parsing.
*   Basic application layout: header, editor, and preview panes.
*   Mobile-first responsive design for editor and preview.
*   Tabbed interface for Markdown and CSS editors.
*   Live preview of resume content and custom CSS using an `iframe` for complete CSS isolation.
*   Markdown editor with initial placeholder content.
*   Custom CSS editor with initial placeholder styling.
*   Created `readme.md` and `resumestudioplan.md`.
*   Removed unnecessary permissions from `metadata.json`.
*   **Implemented Header Area**: Added logo image (`/public/images/resume-studio-mascot-256px.png`), "Resume Studio" title, "Style Your Future." tagline. The "by swan lake digital" byline has been removed to keep the header cleaner. Ensured mobile-first styling for the header elements.
*   **Added Favicon**: Included `/public/images/resume-studio-mascot-64px.png` in the HTML head.
*   **Implemented Action Buttons**: Added "Export PDF" and "Copy HTML" buttons.
*   **Fixed PDF Export**: Rewrote PDF generation logic to directly use `html2canvas` for rendering iframe content to a canvas and `jsPDF` for creating and saving the PDF document from that canvas, handling multi-page content. This bypasses potential compatibility issues with the `html2pdf.js` wrapper.
*   **Implemented Copy HTML**: Functionality to copy the full rendered HTML (including styles) from the preview to the clipboard.
*   **Styled Buttons & Tabs**: Applied consistent, modern, and accessible styling to all interactive buttons and editor tabs.
*   **Loading/Feedback States**: Implemented visual feedback for PDF generation and clipboard copy actions.
*   **Fixed React Root Mounting (Enhanced)**: Implemented a robust mounting strategy by checking `document.readyState`. The app now mounts immediately if the DOM is already ready, or waits for the `DOMContentLoaded` event otherwise. This has been further enhanced with:
    *   Detailed console logging throughout the mounting process to aid in debugging.
    *   Refactoring of `index.tsx` into `App.tsx` (main component) and a new `index.tsx` (entry point).
    *   Extraction of all application-level CSS from `index.html` into a new `index.css` file.
    *   Addition of an early `console.log` in `index.html` to verify basic script execution and DOM presence.
*   **Fixed Desktop Layout**: Corrected the CSS for the main `.app-container` within the desktop media query (`@media (min-width: 768px)`), setting `flex-direction: row;` and `align-items: stretch;` to ensure the editor and preview panels are displayed side-by-side.
*   **Persistence (Local Storage)**: Implemented automatic saving and loading of Markdown and CSS content to/from `localStorage`, ensuring user data is preserved across sessions.
*   **Template Management**: Implemented a "Templates" button that opens a modal. The modal allows users to:
    *   Browse and apply several predefined resume templates.
    *   Save their current Markdown and CSS as a new custom template.
    *   View, apply, and delete their saved custom templates (stored in `localStorage`).
    *   Added corresponding styles for the modal and its interactive elements.
*   **Implemented Help Modal**: Replaced the alert box for the "Help" button with a dedicated modal (`HelpModal.tsx`) that fetches and displays Markdown-formatted help content from `HelpContent.md`. Added corresponding styles to `index.css`.
*   **Centralized Image Paths**: Created `constants.ts` to store all image asset paths. Updated `App.tsx` and `index.html` to use these constants for the application logo, footer mascot, and favicon, referencing `/images/resume-studio-mascot-256px.png` and `/images/resume-studio-mascot-64px.png`.
*   **Labeled Resume Preview**: Added a visible "Resume Preview" title above the iframe in the preview panel for enhanced user clarity and navigation. The Help Content was also updated to reference this title.
*   **Implemented File Import/Export**: Added "Import" and "Export" buttons to the header action bar, which reveal sub-options for Markdown and CSS. This functionality allows users to load `.md` or `.css` files into the editors and download the current content as files.
*   **Implemented Copyright Footer**: Added a sticky footer to the application displaying a perpetual copyright, "Built by Swan Lake Digital" with a link, and the mascot logo.
*   **Mascot in Help Content**: Added the `resume-studio-mascot-256px.png` mascot image to the top of `HelpContent.md` for branding.
*   **Corrected `useState` Destructuring in `App.tsx`**: Fixed syntax errors in `useState` hook calls to ensure correct state initialization and updates.
*   **Updated `metadata.json`**: Changed the `name` to "Resume Studio" and `description` to "Resume Studio is a web application for creating and styling professional resumes using Markdown for content and custom CSS for design, with a live preview and PDF export." for better clarity and platform integration.

## Next Steps (Version 0.3.0 - Accessibility & Offline Support)

*   **Accessibility Enhancements**: Further refine ARIA attributes and focus management across the application.
*   **Offline Support**: Explore implementing Service Workers for PWA capabilities.
*   **GenAI Integration**: Explore using `@google/genai` for features like:
    *   Content suggestions based on job descriptions.
    *   Grammar and spell checking.
    *   Summarization of experience.
    *   Tone adjustment.

## Discussion/Decisions

*   **HelpContent.md Location**: For the `fetch('/HelpContent.md')` call to work correctly on Vercel and similar hosting environments, `HelpContent.md` **must be moved into the `public/` directory**. This ensures it's served as a static asset from the root path.
*   **PDF Page Breaks**: For the current `html2canvas` and `jsPDF` client-side stack, implementing reliable, CSS-driven page breaks for the PDF export is highly complex and not reliably achievable. `html2canvas` captures a continuous image, and `jsPDF` then slices this image into pages without understanding print-specific CSS rules. Users should be aware that the PDF will simply divide content into A4-sized pages.
*   **"Copy MD" Button**: Decided to **omit** this button for now. The Markdown content is directly accessible in the editor, making a separate "Copy MD" button redundant for the current functionality. This simplifies the UI.
*   **"Generate Google Doc Format"**: Decided to **defer** this feature. While valuable, directly generating Google Doc (`.docx`) format is complex and would significantly increase development scope at this early stage. The "Copy HTML" feature serves as a practical alternative, as HTML can often be pasted into Google Docs.
*   **Permissions in `metadata.json`**: Removed `camera`, `microphone`, `geolocation` as they are not currently used or planned for immediate integration in this resume builder application. This adheres to the principle of least privilege and keeps the app lean.
*   **PDF Export Reliability**: The shift to directly using `html2canvas` and `jsPDF` instead of the `html2pdf.js` wrapper is a more robust approach, often resolving issues related to module bundling, environmental compatibility, or internal library errors that can manifest as "x is not a function." This provides fine-grained control over the canvas rendering and PDF creation, which should prevent freezing and ensure successful exports in diverse environments like the Google App Studio preview.
*   **React Root Element Not Found (Persistent Issue)**: The structural refactor into `App.tsx` and `index.tsx`, along with the CSS extraction and extremely verbose logging, provides the most robust possible JavaScript-side solution. If the error continues, it definitively points to environmental factors (build process, server configuration, caching, incorrect file paths in deployment, or an unexpected browser/extension behavior) rather than a flaw in the provided code logic.
*   **`public/images` Directory**: It is crucial that the `public/images` directory exists at the root level of your served application and contains `resume-studio-mascot-256px.png` and `resume-studio-mascot-64px.png`. If these assets are not found, the browser will log 404 errors. Please ensure this directory structure is correct on your host (e.g., Vercel) and during local development.
*   **`iframe` Sandbox Warning**: The `allow-scripts` attribute was removed from the iframe sandbox. This enhances security by preventing any scripts within the user-provided Markdown from executing, which is generally not needed for a resume preview. The `allow-same-origin` attribute is retained to allow the parent window to correctly write content to the iframe.