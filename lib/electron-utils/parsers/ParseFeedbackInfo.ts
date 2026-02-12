import * as cheerio from "cheerio";

// Interface for Feedback Status
export interface FeedbackStatus {
  type: string;        // e.g., "Curriculum FeedBack Status"
  midSemester: string; // e.g., "Curriculum Feed Back Given for MID Semester :)"
  teeSemester: string; // e.g., "Curriculum Feed Back Given for TEE Semester :)"
}

/**
 * Parses the VTOP Feedback Status HTML.
 * @param htmlString The raw HTML content containing the feedback table.
 * @returns Array of FeedbackStatus objects.
 */
export function parseFeedbackStatus(htmlString: string): FeedbackStatus[] {
  const $ = cheerio.load(htmlString);
  const feedbackData: FeedbackStatus[] = [];

  // Select rows from the table body
  const rows = $("#loadMyFragment table tbody tr");

  rows.each((_, element) => {
    const $row = $(element);
    const $cells = $row.find("td");

    if ($cells.length >= 3) {
      // 1st cell: Feedback Type (Bold text)
      const type = $cells.eq(0).text().trim();
      
      // 2nd cell: Mid Semester Status
      const midSemester = $cells.eq(1).text().trim();

      // 3rd cell: TEE Semester Status
      const teeSemester = $cells.eq(2).text().trim();

      feedbackData.push({
        type,
        midSemester,
        teeSemester,
      });
    }
  });

  return feedbackData;
}
