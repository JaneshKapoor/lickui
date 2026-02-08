# 🎨 LickUI - AI-Powered UI Manipulation

> A Chrome extension that lets you modify any website's UI using natural language. Simply describe what you want to change, and AI makes it happen.

![LickUI Demo](https://img.shields.io/badge/AI-OpenAI-brightgreen) ![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🗣️ Natural Language Commands** - Describe UI changes in plain English
- **📍 Element Selection** - Click to select any element on the page
- **🎯 Smart CSS Generation** - AI generates precise CSS modifications
- **🌙 Quick Actions** - One-click dark mode, hide nav, larger text
- **💾 Persistent Changes** - Modifications apply instantly
- **🔄 Multi-line Input** - Shift+Enter for complex instructions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome browser
- OpenAI API key
- Tambo AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lickui.git
   cd lickui
   ```

2. **Set up the Chrome Extension**
   ```bash
   cd src/extension
   npm install
   ```

3. **Configure API Key**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key and Tambo AI API key
   ```

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `src/extension/dist` folder

## 📖 Usage

1. **Open any website** and click the purple chat bubble (bottom-right)
2. **Select an element** using the "📍 Select element" button
3. **Describe your change** in natural language:
   - "Move this to the top right corner"
   - "Make the background gradient purple to blue"
   - "Hide this completely"
   - "Make this text larger and bold"
4. **Press Enter** to apply changes instantly

### Quick Actions

| Button | Action |
|--------|--------|
| 📍 Select element | Click any element to target it |
| 🌙 Dark mode | Apply dark theme to the page |
| 🙈 Hide nav | Hide the navigation bar |
| 🔤 Larger text | Increase text size site-wide |

## 🏗️ Project Structure

```
lickui/
├── src/
│   ├── extension/           # Chrome Extension
│   │   ├── content.ts       # Main content script (AI integration)
│   │   ├── background.ts    # Service worker
│   │   ├── manifest.json    # Extension manifest
│   │   ├── build.js         # Build script with env injection
│   │   ├── .env             # API keys (gitignored)
│   │   ├── .env.example     # Template for API keys
│   │   └── styles/
│   │       └── content.css  # Extension UI styles
│   ├── app/                 # Next.js landing page
│   └── components/          # React components
├── package.json
└── README.md
```

## 🔧 Development

### Extension Development

```bash
cd src/extension

# Watch mode (auto-rebuild on changes)
npm run dev

# Production build
npm run build
```

### Website Development

```bash
# From root directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.

## 🤖 How It Works

```
┌──────────────────────────────────────────────────────┐
│  User Input: "make this red and bigger"             │
└───────────────────────┬──────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  LickUI Content Script                               │
│  - Captures selected element context                 │
│  - Builds structured prompt with element info        │
└───────────────────────┬──────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  Tambo AI API (Along with gpt-4o-mini)               │
│  - Processes natural language                        │
│  - Returns JSON with CSS & DOM actions               │
└───────────────────────┬──────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  DOM Manipulation                                    │
│  - Applies CSS changes to elements                   │
│  - Executes actions (hide, show, move, etc.)        │
└──────────────────────────────────────────────────────┘
```

## 🔐 Environment Variables

### Extension (`src/extension/.env`)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `TAMBO AI API KEY` | Your TAMBO AI API key |

### Website (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_TAMBO_API_KEY` | Tambo AI API key (optional) |

## 📦 Tech Stack

- **Extension**: TypeScript, esbuild, Chrome Extensions API
- **AI**: OpenAI GPT-4o-mini
- **Website**: Next.js 14, React, Tailwind CSS
- **Build**: esbuild for extension, Next.js for website

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for the GPT API
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) documentation
- All contributors and testers

---

**Made with ❤️ by the Janesh Kapoor
