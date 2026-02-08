# Deskly - Your Desktop Companion

A desktop application built with Electron and Next.js for VIT student management.

**Disclaimer:** This application and its development are not officially associated with VIT Chennai. It is an independent project created by students for students.

## Installation

```bash
npm install
```

## Available Scripts

- `npm run dev` - Start development mode (runs Next.js and Electron concurrently)
- `npm run dev:next` - Start Next.js development server only
- `npm run dev:electron` - Start Electron in development mode (waits for Next.js server)
- `npm run build` - Build Next.js for production
- `npm run build:electron` - Compile Electron TypeScript files
- `npm run build:app` - Build complete application for current platform
- `npm run build:win` - Build Windows executable (.exe)
- `npm run build:mac` - Build macOS application (.dmg)
- `npm run build:linux` - Build Linux application (.AppImage and .deb)
- `npm run build:all` - Build for Windows, macOS, and Linux
- `npm run start` - Start Next.js production server
- `npm run lint` - Run ESLint for code linting 
## Development

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. The app will open automatically

## Building

For production builds:
- `npm run build:app` - Build for current platform
- `npm run build:win` - Build Windows executable
- `npm run build:mac` - Build macOS application
- `npm run build:linux` - Build Linux application
- `npm run build:all` - Build for all platforms (Windows, macOS, Linux)
