"use client";

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
    <div className="fixed top-0 left-0 z-50 flex h-8 w-full items-center justify-between bg-zinc-900 text-white select-none">
      <div
        className="flex-1 px-3 text-sm"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        Deskly
      </div>
      <div
        className="flex"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="h-8 w-12 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-12 hover:bg-zinc-700 flex items-center justify-center transition-colors"
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
          className="h-8 w-12 hover:bg-red-600 flex items-center justify-center transition-colors"
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
