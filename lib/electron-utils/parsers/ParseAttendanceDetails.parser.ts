import * as cheerio from "cheerio";

// 1. Define the interface for an attendance record
export interface AttendanceRecord {
  serialNo: number;
  date: string;
  slot: string;
  dayAndTime: string;
  status: string; // 'Present', 'Absent', or 'On Duty'
}

/**
 * Parses the raw HTML string to extract attendance records.
 * @param html - The raw HTML string containing the attendance table
 * @returns An array of AttendanceRecord objects
 */
export const parseAttendanceDetails = (html: string): AttendanceRecord[] => {
  const $ = cheerio.load(html);
  const records: AttendanceRecord[] = [];

  // Select all table rows.
  // We skip the first row (index 0) because it is the header inside <thead>
  $("table tr")
    .slice(1)
    .each((_, element) => {
      const row = $(element);
      const cells = row.find("td");

      // Ensure the row has enough cells (structure check)
      if (cells.length >= 5) {
        // Helper to clean up text (remove excessive newlines/tabs)
        const getText = (index: number) =>
          $(cells[index]).text().replace(/\s+/g, " ").trim();

        // Extract Status specifically
        // Status might be inside a <span> (e.g., <span style="color:red;">Absent</span>)
        // or plain text. .text() gets the combined text of the element and its descendants.
        const rawStatus = getText(4);

        records.push({
          serialNo: parseInt(getText(0), 10) || 0,
          date: getText(1),
          slot: getText(2),
          dayAndTime: getText(3),
          status: rawStatus,
        });
      }
    });

  return records;
};

/* --- Usage Example ---
   const rawHtml = `... your html string ...`;
   const data = parseAttendanceDetails(rawHtml);
   // console.log(JSON.stringify(data, null, 2));
*/
