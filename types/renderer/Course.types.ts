import { CourseDetails } from "@/types/electron/Course.types";
import { WeeklySchedule } from "@/types/electron/TimeTable.types";

export interface Course {
  index: number;
  code: string;
  name: string;
  type: string;
  attendance: number;
  remark: string;
}

export interface TimetableResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CoursesResponse {
  success: boolean;
  data?: CourseDetails[];
  error?: string;
}

export interface WeeklyScheduleResponse {
  success: boolean;
  data?: WeeklySchedule;
  error?: string;
}

export interface AttendanceResponse {
  success: boolean;
  data?: string;
  error?: string;
}
