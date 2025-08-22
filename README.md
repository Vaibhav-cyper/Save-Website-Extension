# Save Website with Tags — Chrome Extension 

Save any website with custom tags and revisit them later through a quick popup. 

## Features

- Save the current tab with custom tags from the popup
- Keyboard shortcut to save instantly (default: Ctrl+Shift+S)
- Context menu item to save the current page
- View and manage saved items (title, URL, tags, time)
- Uses Chrome storage (local) — data stays in your browser

## Tech Stack

- React + Vite
- Chrome Extension Manifest V3 (module service worker)
- Chrome APIs: storage, activeTab, contextMenus, commands

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- Google Chrome 109+

### Install dependencies

```bash
npm install
```

### Build

Build the extension for loading into Chrome:

```bash
npm run build
```

By default Vite outputs to `dist/`. Load that folder as the unpacked extension (see below).

If your build is configured differently, adjust the path accordingly (e.g., `outDir`).

### Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the build output folder (typically `dist/`)

The extension icon should appear in the Chrome toolbar (pin it if needed).

### Development workflow

- Popup/UI changes: run a watch build to rebuild on save and then click the refresh icon on the extension card in `chrome://extensions`.
- Background service worker changes: Chrome requires reloading the extension to pick up changes.

Example watch command you can add to your scripts:

```json
{
  "scripts": {
    "dev:watch": "vite build --watch"
  }
}
```

Run it with:

```bash
npm run dev:watch
```

Then refresh the extension in `chrome://extensions` after changes.

## Project Structure (suggested)

```
.
├─ manifest.json
├─ icons/
│  ├─ icon16.png
│  ├─ icon32.png
│  ├─ icon48.png
│  └─ icon128.png
├─ src/
│  ├─ popup/
│  │  ├─ index.html      # Popup HTML (entry)
│  │  ├─ main.tsx        # Popup React entry
│  │  └─ App.tsx         # Popup UI
│  ├─ options/
│  │  ├─ options.html    # Options page (optional)
│  │  └─ main.tsx
│  ├─ background.ts      # Service worker (module)
│  └─ types.ts
├─ vite.config.ts
├─ package.json
└─ README.md
```

Notes:
- `manifest.json` is at the project root for convenience and should be copied to `dist/` on build.
- Ensure Vite builds your background script to `dist/background.js` and your popup entry to `dist/index.html` (or adjust manifest paths accordingly).

## Manifest Overview

This project uses Manifest V3 with a module service worker.

Key entries (already configured in `manifest.json`):
- `action.default_popup`: `index.html` (popup UI)
- `background.service_worker`: `background.js` with `type: module`
- `options_page`: `options.html` (optional)
- `permissions`: `storage`, `activeTab`, `contextMenus`
- `commands.save-current-tab`: Keyboard shortcut (default: `Ctrl+Shift+S`)

If your build outputs to subpaths (e.g., `assets/`), update `manifest.json` to match or use a plugin/script to transform/copy manifest for production.

## Storage Schema (example)

Data is stored in `chrome.storage.local` under a key like `savedItems`:

```ts
interface SavedItem {
  id: string;       // uuid
  url: string;
  title: string;
  tags: string[];
  createdAt: number; // epoch ms
}

type SavedItems = SavedItem[];
```

This is an example schema; adapt as needed.

## Background Service Worker (expected behavior)

- Listens for the `save-current-tab` command to capture the active tab and send it to the popup or store directly.
- Registers a context menu item (e.g., "Save this page with tags") and handles clicks.
- Performs data persistence via `chrome.storage`.

## Permissions Rationale

- `storage`: Save and retrieve items locally.
- `activeTab`: Access current tab URL/title to save.
- `contextMenus`: Add right-click menu for quick saves.

## Keyboard Shortcuts

- Default: `Ctrl+Shift+S` to trigger a save flow.
- Users can customize shortcuts at `chrome://extensions/shortcuts`.

## Icons

Place PNG icons in `icons/` at sizes 16, 32, 48, 128. Update `manifest.json` if paths or sizes differ.

## Testing

- Manual: Load unpacked and exercise popup, context menu, and shortcut.
- Storage verification: Inspect via `chrome://extensions` -> "Service Worker" Inspect -> Application tab -> Storage -> `chrome.storage`.

## Publishing

1. Create a production build (`npm run build`).
2. Zip the contents of `dist/` (root files only, not the folder itself).
3. Submit to the Chrome Web Store Developer Dashboard with a clear description and screenshots.

## Troubleshooting

- Popup is blank: Ensure `index.html` and bundle are in `dist/` and paths match `manifest.json`.
- Background not running: Check the service worker in the Extensions page (View service worker) and console errors.
- Shortcut not working: Verify at `chrome://extensions/shortcuts` and ensure the extension is focused/active.
- Storage not saving: Check for `chrome.storage` errors; ensure permissions include `storage`.

## Roadmap

- Tag suggestions/autocomplete
- Import/export saved items
- Sync across devices (chrome.storage.sync)
- Search and filter saved items
- UI polish and theming

## License

MIT

