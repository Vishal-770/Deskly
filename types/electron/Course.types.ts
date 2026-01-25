export interface CourseDetails {
  slNo: number;
  classGroup: string;
  code: string;
  title: string;
  courseType: string; // e.g., "Embedded Theory", "Lab Only"
  credits: {
    lecture: number;
    tutorial: number;
    practical: number;
    project: number;
    total: number;
  };
  category: string;
  registrationOption: string; // e.g., "Regular"
  classId: string;
  slot: string;
  venue: string;
  faculty: {
    name: string;
    school: string;
  };
  registrationDate: string;
  status: string;
}