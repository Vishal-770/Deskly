export interface LaundaryEntry {
  Id: number;
  ncRecordId: string;
  ncRecordHash: string;
  Date: string;
  RoomNumber: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface LaundaryResponse {
  success: boolean;
  data?: LaundaryEntry[];
  error?: string;
}
