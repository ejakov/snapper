# Snapper

A Chrome extension that captures full-page screenshots of websites, including content that requires scrolling.

## Features

- Captures entire webpage content, even below the fold
- Handles dynamic content and infinite scroll
- Preserves the original page layout and styling
- Easy to use with a simple interface

## Installation

1. Clone this repository:
```bash
git clone https://github.com/ejakov/snapper.git
cd snapper
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory from this project

## Development

- Start development mode with hot reloading:
```bash
npm start
```

- Build for production:
```bash
npm run build
```

- Format code:
```bash
npm run be-pretty
```

## Project Structure

```
src/
├── background/     # Background scripts
├── common/         # Shared utilities and types
├── content-scripts/# Content scripts for page interaction
├── ui/            # Extension UI components
└── manifest.json  # Extension manifest
```

## Technologies Used

- TypeScript
- Webpack
- Chrome Extension APIs

## License

MIT License - see the [LICENSE](LICENSE) file for details.
