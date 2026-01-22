"use client";

import { BarChart3 } from "lucide-react";

declare global {
  interface Window {
    electron?: {
      windowControls: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
    };
  }
}

export default function TitleBar() {
  const handleMinimize = () => {
    window.electron?.windowControls.minimize();
  };

  const handleMaximize = () => {
    window.electron?.windowControls.maximize();
  };

  const handleClose = () => {
    window.electron?.windowControls.close();
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex h-8 w-full items-center justify-between bg-card text-card-foreground select-none border-b border-border/50">
      <div
        className="flex-1 px-4 text-sm font-medium flex items-center"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <BarChart3 className="w-4 h-4 mr-2 text-primary" />
        Deskly
      </div>
      <div
        className="flex"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="h-8 w-12 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-12 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Maximize"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
          >
            <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="h-8 w-12 hover:bg-destructive/90 flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Close"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
