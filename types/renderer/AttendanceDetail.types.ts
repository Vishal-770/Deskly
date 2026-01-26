export interface AttendanceRecord {
  serialNo: number;
  date: string;
  slot: string;
  dayAndTime: string;
  status: string; // 'Present', 'Absent', or 'On Duty'
}

export type AttendanceDetailResponse = {
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
};
