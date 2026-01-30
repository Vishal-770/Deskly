import { LaundaryEntry } from "../../types/electron/Laundary.types";

const BASE_URL = "https://kanishka-developer.github.io/unmessify/csv";

const blockName = {
  A: "VITC-A-L.csv",
  B: "VITC-B-L.csv",
  CB: "VITC-CB-L.csv",
  CG: "VITC-CG-L.csv",
  D1: "VITC-D1-L.csv",
  D2: "VITC-D2-L.csv",
  E: "VITC-E-L.csv",
};

export async function fetchLaundarySchedule(
  block: string,
): Promise<LaundaryEntry[]> {
  const fileName = blockName[block as keyof typeof blockName];
  if (!fileName) {
    throw new Error(`Invalid block: ${block}`);
  }

  const url = `${BASE_URL}/${fileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch laundry schedule: ${response.statusText}`);
  }

  const csvText = await response.text();
  const lines = csvText.trim().split("\n");

  // Skip header
  const dataLines = lines.slice(1);

  const entries: LaundaryEntry[] = dataLines.map((line) => {
    const [dateStr, roomNumber] = line.split(",");
    return {
      date: parseInt(dateStr, 10),
      roomNumber: roomNumber || "",
    };
  });

  console.log(`Fetched laundry schedule for block ${block}:`, entries);
  return entries;
}
