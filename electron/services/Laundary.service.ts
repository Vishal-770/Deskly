import { LaundaryEntry } from "../../types/electron/Laundary.types";
const BASE_URL = "https://kanishka-developer.github.io/unmessify/json/en/";

const blockName = {
  A: "VITC-A-L.json",
  B: "VITC-B-L.json",
  CB: "VITC-CB-L.json",
  CG: "VITC-CG-L.json",
  D1: "VITC-D1-L.json",
  D2: "VITC-D2-L.json",
  E: "VITC-E-L.json",
};

export interface LaundaryResponse {
  list: LaundaryEntry[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
  stats: {
    dbQueryTime: string;
  };
}

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

  const jsonData: LaundaryResponse =
    (await response.json()) as LaundaryResponse;
  const entries: LaundaryEntry[] = jsonData.list;

  console.log(`Fetched laundry schedule for block ${block}:`, entries);
  return entries;
}
