import si from "systeminformation";
import type { SystemStats } from "../../types/electron/system.types";

export async function getSystemStats(): Promise<SystemStats> {
  const cpu = await si.currentLoad();
  const mem = await si.mem();

  return {
    cpu: cpu.currentLoad,
    memory: {
      used: mem.used,
      total: mem.total
    }
  };
}
