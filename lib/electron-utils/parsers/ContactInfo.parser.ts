import * as cheerio from "cheerio";

// 1. Define the interface for the contact data
export interface ContactDetail {
  department: string;
  description: string;
  email: string;
}

/**
 * Parses the raw HTML string to extract VIT Chennai contact details.
 * @param html - The raw HTML string containing the contact cards
 * @returns An array of ContactDetail objects
 */
export const parseContactDetails = (html: string): ContactDetail[] => {
  const $ = cheerio.load(html);
  const contacts: ContactDetail[] = [];

  // Iterate through each contact card
  // We target the specific card classes used in the grid
  $(".col .card.rounded-3").each((_, element) => {
    const card = $(element);

    // 1. Extract Department Name
    // Located inside the card header's <strong> tag
    const department = card.find(".card-header strong").text().trim();

    // 2. Extract Description
    // It's the first paragraph in the card body.
    // We use .replace(/\s+/g, ' ') to squash newlines and extra spaces into a single space.
    const description = card
      .find(".card-body p")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // 3. Extract Email
    // It's the paragraph with the 'text-success' class
    const email = card.find(".card-body p.text-success").text().trim();

    // Only add if meaningful data exists
    if (department || email) {
      contacts.push({
        department,
        description,
        email,
      });
    }
  });

  return contacts;
};

/* --- Usage Example ---
   const rawHtml = `... your html string ...`;
   const result = parseContactDetails(rawHtml);
   // console.log(JSON.stringify(result, null, 2));
*/
