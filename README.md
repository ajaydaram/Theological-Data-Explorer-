# Theological Topography

A high-performance React application designed to visually map the integration of historic Christian doctrine.

## Project Vision & Integration of Doctrine

*Theological Topography* moves beyond linear text reading by treating historic confessions as interconnected nodes within a massive, living theological graph. 
*   **Chain of Custody (Doctrinal Lineage):** Visualizes the historical evolution of doctrine, tracing back from Reformation-era confessions (like the Westminster Confession) all the way back to their foundational roots in the Early Church councils (like the Nicene Creed).
*   **Root System (Normalized Proofs):** Displays the Scriptural underpinnings of each doctrinal paragraph, mapping them to a global inverted index to reveal shared theological DNA across different historical eras.
*   **Cross-Reference Engine:** Connects disparate doctrinal statements together based on shared scripture and theological concepts, exposing hidden architectural alignments.

## Technical Architecture

At its core, this project leverages a high-performance **Inverted Index Pattern** for real-time relational querying.

*   **VERSE_INDEX:** Instead of executing O(n) array lookups across thousands of document nodes to find shared verses, the engine pre-computes an inverted graph. E.g. `{'Romans 3:23': ['wcf-1-1', 'hc-1-1']}`. This enables sub-millisecond bidirectional Deep Search across raw text and biblical references.
*   **JSON Transformation:** The raw data (sourced from historic GitHub repositories) is programmatically cleaned and standardized. Verses are normalized (e.g., stripping formatting and variations like "Rom.3.23" to "Romans 3:23") ensuring perfect referential integrity.
*   **Theme Engine:** Strict typings map visual layouts to configurable modes. The "Museum Archive" theme utilizes heavy double borders, drop caps, and dynamic year watermarks to mimic early modern printing presses.

## Features (Portfolio Context)

*   **Parallel View Engine:** Select any interconnected cross-reference or Deep Search result to split the UI into perfectly mirrored reading panes, projecting two historical documents side-by-side with independent state and styling for deep comparative study.
*   **Deep Search:** A custom multi-stage query algorithmic tool that scans document titles, body text, IDs, and the foundational inverted Verse Index simultaneously. It groups results by occurrences and underlying scriptural support.
*   **Doctrinal Lineage & Heatmaps:** Visual indicators map the density of scriptural proofs per document in the sidebar, while a dynamic breadcrumb header generates a visual path back to the Root Node of any given confession.

## Local Setup

### 1. Requirements
*   Node.js (v18+ recommended)
*   npm or pnpm

### 2. Installation
Clone the repository, then install packages:

```bash
npm install
```

### 3. Tailwind CSS & Environment
The project relies on Vite and Tailwind v4. The `index.css` acts as the root injector:
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: "Playfair Display", ui-serif, Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}
```

### 4. Running the Development Server
Start the local Vite server:

```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the application.

### Data Verification
The central nervous system of this project is localized within `public/data.json` and the TypeScript-driven `/src/data/` directory. All 172 paragraphs of the Westminster Confession, mapped alongside the Nicene and Apostles' Creeds, are bundled within this local dataset, ensuring immediate loading with zero external database latency.
