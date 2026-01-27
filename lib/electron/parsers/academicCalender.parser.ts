import * as cheerio from "cheerio";

export interface DayContent {
  date: number;
  content: string[]; // List of text lines found for this day
}

export interface MonthlySchedule {
  month: string;
  days: DayContent[];
}

/**
 * Parses the Attendance Calendar HTML to extract raw text content for each day.
 * Returns a simple mapping of Date -> Content.
 * @param htmlString The raw HTML content of the calendar.
 * @returns MonthlySchedule object.
 */
export function parseSimpleAttendance(htmlString: string): MonthlySchedule {
  const $ = cheerio.load(htmlString);
  const days: DayContent[] = [];

  // 1. Get Month Name
  const month = $("h4").first().text().trim();

  // 2. Iterate over every table cell
  $("table.calendar-table tr td").each((_, element) => {
    const $cell = $(element);

    // The first span usually contains the date number
    const $dateSpan = $cell.find("span").first();
    const dateStr = $dateSpan.text().trim();

    // If no date is found (empty spacer cell), skip it
    if (!dateStr) return;

    const date = parseInt(dateStr, 10);
    const content: string[] = [];

    // 3. Collect all subsequent text in the cell
    // We skip the first span (the date) and grab the text from the rest
    $cell
      .find("span")
      .slice(1)
      .each((_, span) => {
        const text = $(span).text().trim();
        // Only add non-empty strings
        if (text) {
          // Optional: Remove parentheses if desired, or keep as is.
          // Currently keeping as is based on "i dont care what text is inside"
          content.push(text);
        }
      });

    days.push({ date, content });
  });

  return { month, days };
}
