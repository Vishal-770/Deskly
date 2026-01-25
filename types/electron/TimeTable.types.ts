export interface ClassSession {
  day: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  slot: string;
  venue: string;
  faculty: string;
}

export interface WeeklySchedule {
  Monday: ClassSession[];
  Tuesday: ClassSession[];
  Wednesday: ClassSession[];
  Thursday: ClassSession[];
  Friday: ClassSession[];
  Saturday: ClassSession[];
  Sunday: ClassSession[];
}