import * as cheerio from "cheerio";

// Interface for the simplified output
export interface SemesterMonth {
  label: string; // e.g., "DEC-2025"
  dateValue: string; // e.g., "01-DEC-2025"
}

/**
 * Parses the HTML to extract only the month labels and their corresponding date values.
 * @param htmlString The raw HTML content.
 * @returns Array of SemesterMonth objects.
 */
export function parseSemesterMonths(htmlString: string): SemesterMonth[] {
  const $ = cheerio.load(htmlString);
  const months: SemesterMonth[] = [];

  // Target all links with onclick containing processViewCalendar
  $('a[onclick*="processViewCalendar"]').each((_, element) => {
    const $btn = $(element);

    // 1. Get the Label (Text content)
    const label = $btn.text().trim();

    // 2. Get the Date Value from the onclick attribute
    // Format: javascript:processViewCalendar('01-DEC-2025');
    const onclick = $btn.attr("onclick") || "";
    const dateMatch = onclick.match(/'([^']+)'/);
    const dateValue = dateMatch ? dateMatch[1] : "";

    if (label && dateValue) {
      months.push({ label, dateValue });
    }
  });

  return months;
}
