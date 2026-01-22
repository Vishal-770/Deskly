import { SystemStats } from "@/types/electron/system.types";

declare global {
  interface Window {
    system: {
      getStats: () => Promise<SystemStats>;
      onCpuUpdate: (cb: (cpu: number) => void) => void;
    };
  }
}

export {};
