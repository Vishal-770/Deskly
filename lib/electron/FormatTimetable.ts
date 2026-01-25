import { CourseDetails } from "@/types/electron/Course.types";
import { WeeklySchedule } from "@/types/electron/TimeTable.types";



/**
 * THEORY TIMINGS (User Defined Pattern)
 * Pattern: 50 mins class + 5 mins break.
 * Morning Starts: 08:00 AM
 * Evening Starts: 02:00 PM (14:00)
 */
const THEORY_TIMES = [
  // Morning Slots (Indices 0-4)
  { start: "08:00 AM", end: "08:50 AM" }, // Index 0
  { start: "08:55 AM", end: "09:45 AM" }, // Index 1
  { start: "09:50 AM", end: "10:40 AM" }, // Index 2
  { start: "10:45 AM", end: "11:35 AM" }, // Index 3
  { start: "11:40 AM", end: "12:30 PM" }, // Index 4

  // Afternoon/Evening Slots (Indices 5-10)
  { start: "02:00 PM", end: "02:50 PM" }, // Index 5
  { start: "02:55 PM", end: "03:45 PM" }, // Index 6
  { start: "03:50 PM", end: "04:40 PM" }, // Index 7
  { start: "04:45 PM", end: "05:35 PM" }, // Index 8
  { start: "05:40 PM", end: "06:30 PM" }, // Index 9
  { start: "06:35 PM", end: "07:25 PM" }, // Index 10 (Extra slot)
];

/**
 * LAB TIMINGS (Extracted from "Second Row" of provided images)
 * These include specific breaks (e.g., lunch/tea) visible in the FFCS grid.
 *
 */
const LAB_TIMES = [
  // Morning Labs (Indices 0-5)
  { start: "08:00 AM", end: "08:50 AM" }, // 0
  { start: "08:50 AM", end: "09:40 AM" }, // 1
  { start: "09:45 AM", end: "10:35 AM" }, // 2
  { start: "11:00 AM", end: "11:50 AM" }, // 3
  { start: "11:50 AM", end: "12:40 PM" }, // 4
  { start: "12:40 PM", end: "01:30 PM" }, // 5

  // Afternoon Labs (Indices 6-11)
  { start: "02:00 PM", end: "2:50 PM" }, // 6
  { start: "02:50 PM", end: "03:40 PM" }, // 7
  { start: "3:50 PM", end: "04:40 PM" }, // 8
  { start: "04:40 PM", end: "05:30 PM" }, // 9
  { start: "05:40 PM", end: "06:30 PM" }, // 10
  { start: "06:30 PM", end: "07:20 PM" }, // 11
];

// Mapping Theory Slots to [DayIndex, TimeIndex]
// DayIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
const THEORY_SLOT_MAP: Record<string, number[][]> = {
  // Morning Slots (A1 series) -> Maps to Indices 0-4
  A1: [
    [0, 0],
    [2, 1],
  ], // Mon 1st slot, Wed 2nd slot
  F1: [
    [0, 1],
    [2, 2],
  ], // Mon 2nd slot, Wed 3rd slot
  D1: [
    [0, 2],
    [3, 0],
  ], // Mon 3rd slot, Thu 1st slot
  TB1: [[0, 3]], // Mon 4th slot
  TG1: [[0, 4]], // Mon 5th slot

  B1: [
    [1, 0],
    [3, 1],
  ], // Tue 1st slot, Thu 2nd slot
  G1: [
    [1, 1],
    [3, 2],
  ], // Tue 2nd slot, Thu 3rd slot
  E1: [
    [1, 2],
    [4, 0],
  ], // Tue 3rd slot, Fri 1st slot
  TC1: [[1, 3]], // Tue 4th slot
  TAA1: [[1, 4]], // Tue 5th slot

  C1: [
    [2, 0],
    [4, 1],
  ], // Wed 1st slot, Fri 2nd slot
  V1: [[2, 3]], // Wed 4th slot
  V2: [[2, 4]], // Wed 5th slot

  TE1: [[3, 3]], // Thu 4th slot
  TCC1: [[3, 4]], // Thu 5th slot

  TA1: [[4, 2]], // Fri 3rd slot
  TF1: [[4, 3]], // Fri 4th slot
  TD1: [[4, 4]], // Fri 5th slot

  // Afternoon/Evening Slots (A2 series) -> Maps to Indices 5-9
  A2: [
    [0, 5],
    [2, 6],
  ], // Mon 6th slot, Wed 7th slot
  F2: [
    [0, 6],
    [2, 7],
  ], // Mon 7th slot, Wed 8th slot
  D2: [
    [0, 7],
    [3, 5],
  ], // Mon 8th slot, Thu 6th slot
  TB2: [[0, 8]], // Mon 9th slot
  TG2: [[0, 9]], // Mon 10th slot

  B2: [
    [1, 5],
    [3, 6],
  ], // Tue 6th slot, Thu 7th slot
  G2: [
    [1, 6],
    [3, 7],
  ], // Tue 7th slot, Thu 8th slot
  E2: [
    [1, 7],
    [4, 5],
  ], // Tue 8th slot, Fri 6th slot
  TC2: [[1, 8]], // Tue 9th slot
  TAA2: [[1, 9]], // Tue 10th slot

  C2: [
    [2, 5],
    [4, 6],
  ], // Wed 6th slot, Fri 7th slot
  TD2: [[2, 8]], // Wed 9th slot
  TBB2: [[2, 9]], // Wed 10th slot

  TE2: [[3, 8]], // Thu 9th slot
  TCC2: [[3, 9]], // Thu 10th slot

  TA2: [[4, 7]], // Fri 8th slot
  TF2: [[4, 8]], // Fri 9th slot
  TDD2: [[4, 9]], // Fri 10th slot
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Generates a weekly schedule from parsed course details.
 */
export function generateWeeklySchedule(
  courses: CourseDetails[],
): WeeklySchedule {
  const schedule: WeeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  courses.forEach((course) => {
    // Skip empty or NIL slots
    if (!course.slot || course.slot === "NIL") return;

    // Split slots like "L31+L32" into ["L31", "L32"]
    const subSlots = course.slot.split("+");

    subSlots.forEach((slot) => {
      slot = slot.trim();

      // Determine if it is a Lab Slot
      const isLab = slot.startsWith("L") && !isNaN(Number(slot.substring(1)));

      if (isLab) {
        // --- HANDLE LAB SLOT ---
        const labNum = parseInt(slot.substring(1), 10);
        let dayIndex = -1;
        let timeIndex = -1;

        if (labNum >= 1 && labNum <= 30) {
          // Morning Labs (L1-L30)
          // L1-L6 = Mon, L7-L12 = Tue, etc.
          dayIndex = Math.floor((labNum - 1) / 6);
          timeIndex = (labNum - 1) % 6; // Indices 0-5
        } else if (labNum >= 31 && labNum <= 60) {
          // Afternoon Labs (L31-L60)
          // L31-L36 = Mon, L37-L42 = Tue, etc.
          dayIndex = Math.floor((labNum - 31) / 6);
          timeIndex = 6 + ((labNum - 31) % 6); // Indices 6-11
        }

        if (
          dayIndex >= 0 &&
          dayIndex < 5 &&
          timeIndex >= 0 &&
          LAB_TIMES[timeIndex]
        ) {
          const dayName = DAYS[dayIndex] as keyof WeeklySchedule;
          schedule[dayName].push({
            day: dayName,
            startTime: LAB_TIMES[timeIndex].start,
            endTime: LAB_TIMES[timeIndex].end,
            courseCode: course.code,
            courseTitle: course.title,
            courseType: "Lab",
            slot: slot,
            venue: course.venue,
            faculty: course.faculty.name,
          });
        }
      } else {
        // --- HANDLE THEORY SLOT ---
        const mappings = THEORY_SLOT_MAP[slot];

        if (mappings) {
          mappings.forEach(([dayIdx, timeIdx]) => {
            const dayName = DAYS[dayIdx] as keyof WeeklySchedule;
            if (THEORY_TIMES[timeIdx]) {
              schedule[dayName].push({
                day: dayName,
                startTime: THEORY_TIMES[timeIdx].start,
                endTime: THEORY_TIMES[timeIdx].end,
                courseCode: course.code,
                courseTitle: course.title,
                courseType: "Theory",
                slot: slot,
                venue: course.venue,
                faculty: course.faculty.name,
              });
            }
          });
        }
      }
    });
  });

  // Sort each day's schedule by start time
  (Object.keys(schedule) as Array<keyof WeeklySchedule>).forEach((day) => {
    schedule[day].sort((a, b) => {
      // Helper to convert time string to minutes
      const getMinutes = (t: string) => {
        const [time, period] = t.split(" ");
        let [h, m] = time.split(":").map(Number);
        m = m;
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };
      return getMinutes(a.startTime) - getMinutes(b.startTime);
    });
  });

  return schedule;
}
