export interface SystemStats {
  cpu: number;
  memory: {
    used: number;
    total: number;
  };
}

export interface CourseAttendance {
  index: number;
  code: string;
  name: string;
  type: string;
  attendance: number;
  remark: string;
}

export interface CGPAData {
  totalCreditsRequired: number;
  earnedCredits: number;
  currentCGPA: number;
  nonGradedCore: number;
}
