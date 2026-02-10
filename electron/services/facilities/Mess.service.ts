const BASE_URL = "https://kanishka-developer.github.io/unmessify/json/en/";

const messData = {
  "Veg-mens": "VITC-M-V.json",
  "Non-Veg-mens": "VITC-M-N.json",
  "Special-mens": "VITC-M-S.json",
  "Veg-womens": "VITC-W-V.json",
  "Non-Veg-womens": "VITC-W-N.json",
  "Special-womens": "VITC-W-S.json",
};

export type MessType = keyof typeof messData;

export interface MessMenuItem {
  Id: number;
  ncRecordId: string;
  ncRecordHash: string;
  Day: string;
  Breakfast: string;
  Lunch: string;
  Snacks: string;
  Dinner: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface MessMenuResponse {
  list: MessMenuItem[];
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

export async function getMessMenu(
  mess: MessType,
): Promise<{ success: boolean; data?: MessMenuItem[]; error?: string }> {
  try {
    const url = BASE_URL + messData[mess];

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `[Mess Service] Failed to fetch mess menu: ${response.statusText}`,
      );
      throw new Error(`Failed to fetch mess menu: ${response.statusText}`);
    }

    const jsonData = (await response.json()) as MessMenuResponse;

    return {
      success: true,
      data: jsonData.list,
    };
  } catch (error) {
    console.error(`[Mess Service] Error occurred:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
