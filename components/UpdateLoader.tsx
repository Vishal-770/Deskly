"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function UpdateLoader() {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.update) {
      window.update.onCheckingForUpdate(() => {
        setIsChecking(true);
        setError(null);
      });

      window.update.onUpdateAvailable(() => {
        setIsChecking(false);
        setIsDownloading(true);
      });

      window.update.onUpdateNotAvailable(() => {
        setIsChecking(false);
        setIsDownloading(false);
      });

      window.update.onDownloadProgress((progressData) => {
        setProgress(progressData.percent);
      });

      window.update.onUpdateDownloaded(() => {
        setIsDownloading(false);
        // App will restart automatically
      });

      window.update.onError((err) => {
        setError(err.message);
        setIsChecking(false);
        setIsDownloading(false);
      });
    }
  }, []);

  if (!isChecking && !isDownloading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            {error
              ? "Update Error"
              : isChecking
                ? "Checking for Updates"
                : "Downloading Update"}
          </h2>

          {error ? (
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          ) : isChecking ? (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Checking for updates...</span>
            </div>
          ) : (
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Downloaded {progress.toFixed(1)}%
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error
              ? "Please try again later or contact support."
              : isChecking
                ? "Please wait while we check for updates."
                : "The app will restart automatically once the update is complete."}
          </p>
        </div>
      </div>
    </div>
  );
}
