export interface AssessmentMark {
  slNo: number;
  markTitle: string;
  maxMark: number;
  weightagePercent: number;
  status: string;
  scoredMark: number;
  weightageMark: number;
  classAverage: string;
  remark: string;
}

// Interface for the Course container
export interface StudentMarkEntry {
  slNo: number;
  classNumber: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  courseSystem: string;
  faculty: string;
  slot: string;
  courseMode: string;
  assessments: AssessmentMark[];
}
