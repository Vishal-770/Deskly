import * as cheerio from "cheerio";

// Define the interface exactly as requested
export interface Category {
  code: string;
  name: string;
  credits: number;
  maxCredits: number;
}

export const extractCategories = (html: string): Category[] => {
  const $ = cheerio.load(html);
  const categories: Category[] = [];

  // Iterate over every card with the class 'categoty-card'
  $(".categoty-card").each((_, element) => {
    const card = $(element);
    const symbolLabel = card.find(".symbol-label");

    // 1. Extract Code (e.g., "FCBSM")
    // The code is strictly in the first immediate div child of the symbol-label
    const code = symbolLabel.children("div").first().text().trim();

    // 2. Extract Name
    // Located in the sibling column, specifically: <div class="col-6"><span ...>Name</span></div>
    const name = card.find(".col-6 span").text().trim();

    // 3. Extract Credits and Max Credits
    // We iterate through all <small> tags to find the exact labels "Credit:" and "Max. Credit:"
    let credits = 0;
    let maxCredits = 0;

    symbolLabel.find("small").each((_, smallTag) => {
      const labelText = $(smallTag).text().trim();

      // The value is always in the immediate next sibling <span>
      const valueText = $(smallTag).next("span").text().trim();
      const value = parseInt(valueText, 10) || 0;

      if (labelText === "Credit:") {
        credits = value;
      } else if (labelText === "Max. Credit:") {
        maxCredits = value;
      }
    });

    // Only push if we successfully found a code (filters out empty/malformed cards)
    if (code) {
      categories.push({
        code,
        name,
        credits,
        maxCredits,
      });
    }
  });

  return categories;
};

// --- Example Usage ---
// const htmlString = `... your raw html string ...`;
// const result = extractCategories(htmlString);
// console.log(result);

// 1. Define the interface for the extracted course data
export interface CourseEntry {
  serialNo: number;
  code: string;
  title: string;
  courseType: string; // e.g., 'TH', 'LO', 'PJT', 'ETL'
  credits: number;
  lectureHours: number; // L
  tutorialHours: number; // T
  practicalHours: number; // P
  projectHours: number; // J
}

/**
 * Parses the raw HTML table string to extract course details.
 * @param html - The raw HTML string containing the table class 'example'
 * @returns An array of CourseEntry objects
 */
export const parseCourseTable = (html: string): CourseEntry[] => {
  const $ = cheerio.load(html);
  const courses: CourseEntry[] = [];

  // Select the specific table body rows
  $("table.example tbody tr").each((_, element) => {
    const row = $(element);
    const cells = row.find("td");

    // Ensure the row has enough cells before processing
    if (cells.length > 0) {
      // Extract Code: The code is inside a <span> to separate it from the <button>
      const code = $(cells[1]).find("span").text().trim();

      // Helper to safely parse numbers
      const getInt = (index: number) =>
        parseInt($(cells[index]).text().trim(), 10) || 0;
      const getFloat = (index: number) =>
        parseFloat($(cells[index]).text().trim()) || 0;

      courses.push({
        serialNo: getInt(0),
        code: code,
        title: $(cells[2]).text().trim(),
        courseType: $(cells[3]).text().trim(),
        credits: getFloat(4),
        lectureHours: getInt(5),
        tutorialHours: getInt(6),
        practicalHours: getInt(7),
        projectHours: getInt(8),
      });
    }
  });

  return courses;
};

/* --- Usage Example ---
   const rawHtml = `... your html string ...`;
   const data = parseCourseTable(rawHtml);
   // console.log(data);
*/
