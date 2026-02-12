import * as cheerio from "cheerio";
import { CourseDetails } from "@/types/electron/Course.types";

/**
 * Parses the VTOP Timetable HTML string using Cheerio.
 * @param htmlString - The raw HTML content as a string.
 * @returns Array of CourseDetails objects.
 */
export function parseTimetableCourses(htmlString: string): CourseDetails[] {
  const $ = cheerio.load(htmlString);
  const courses: CourseDetails[] = [];

  const rows = $("#studentDetailsList table").first().find("tr");

  rows.each((index, element) => {
    const $row = $(element);
    const cols = $row.find("td");

    if (cols.length < 10) return;

    const getText = (i: number) =>
      $(cols[i]).text().replace(/\s+/g, " ").trim();

    // 1. Parse Course Info
    const courseRaw = getText(2);
    let code = "",
      title = "",
      courseType = "";

    const courseMatch = courseRaw.match(
      /^([A-Z0-9]+)\s*-\s*(.*?)\s*\(\s*(.*?)\s*\)$/,
    );
    if (courseMatch) {
      code = courseMatch[1];
      title = courseMatch[2];
      courseType = courseMatch[3];
    } else {
      const splitDash = courseRaw.split("-");
      code = splitDash[0]?.trim();
      title = splitDash.slice(1).join("-").trim();
    }

    // 2. Parse Credits
    const creditRaw = getText(3).split(" ");
    const credits = {
      lecture: parseFloat(creditRaw[0]) || 0,
      tutorial: parseFloat(creditRaw[1]) || 0,
      practical: parseFloat(creditRaw[2]) || 0,
      project: parseFloat(creditRaw[3]) || 0,
      total: parseFloat(creditRaw[4]) || 0,
    };

    // 3. Parse Slot and Venue [FIX APPLIED HERE]
    // Raw Example: "TG1 - AB3-507"
    const slotVenueRaw = getText(7);

    // Split text by hyphens
    const parts = slotVenueRaw.split("-");

    // The first part is always the slot (e.g., "TG1")
    const slot = parts[0].trim();

    // The rest is the venue. We join them back together in case the venue
    // itself has a hyphen (e.g., "AB3" + "507" becomes "AB3-507")
    const venue = parts.slice(1).join("-").trim();

    // 4. Parse Faculty
    const facultyRaw = getText(8);
    // Same logic applied here just in case faculty names have hyphens
    const facultyParts = facultyRaw.split("-");
    const facultyName = facultyParts[0].trim();
    const facultySchool = facultyParts.slice(1).join("-").trim();

    // 5. Construct Object
    courses.push({
      slNo: parseInt(getText(0), 10),
      classGroup: getText(1),
      code: code,
      title: title,
      courseType: courseType,
      credits: credits,
      category: getText(4),
      registrationOption: getText(5),
      classId: getText(6),
      slot: slot || slotVenueRaw,
      venue: venue || "",
      faculty: {
        name: facultyName || facultyRaw,
        school: facultySchool || "",
      },
      registrationDate: getText(9),
      status:
        getText(11).replace("Registered and Approved", "").trim() ||
        "Registered and Approved",
    });
  });

  return courses;
}
