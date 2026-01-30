export interface MessMenuItem {
  Day: string;
  Breakfast: string;
  Lunch: string;
  Snacks: string;
  Dinner: string;
}

export interface MessMenuResponse {
  success: boolean;
  data?: MessMenuItem[];
  error?: string;
}

export type MessType =
  | "Veg-mens"
  | "Non-Veg-mens"
  | "Special-mens"
  | "Veg-womens"
  | "Non-Veg-womens"
  | "Special-womens";
