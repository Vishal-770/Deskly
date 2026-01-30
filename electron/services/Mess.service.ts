import { parse } from "papaparse";
const BASE_URL = "https://kanishka-developer.github.io/unmessify/csv/";

const messData = {
  "Veg-mens": "VITC-M-V.csv",
  "Non-Veg-mens": "VITC-M-N.csv",
  "Special-mens": "VITC-M-S.csv",
  "Veg-womens": "VITC-W-V.csv",
  "Non-Veg-womens": "VITC-W-N.csv",
  "Special-womens": "VITC-W-S.csv",
};

export type MessType = keyof typeof messData;

export async function getMessMenu(mess: MessType) {
  try {
    const url = BASE_URL + messData[mess];
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch mess menu: ${response.statusText}`);
    }
    const csvText = await response.text();

    const parsed = parse(csvText, { header: true, skipEmptyLines: true });
    return {
      success: true,
      data: parsed.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
