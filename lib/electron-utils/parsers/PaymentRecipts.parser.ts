import * as cheerio from "cheerio";

/**
 * Parses the Receipts HTML string and returns structured JSON data.
 */
export interface Receipt {
  receiptNumber: string;
  date: string;
  amount: number;
  campusCode: string;
  receiptId: string; // Extracted from the onclick action
  applNo: string; // Extracted from hidden inputs
  regNo: string; // Extracted from hidden inputs
}

export function parseReceipts(html: string): Receipt[] {
  const $ = cheerio.load(html);
  const receipts: Receipt[] = [];

  // Helper: Clean text and remove extra whitespace
  const clean = (text: string | undefined): string => {
    return text ? text.replace(/\s+/g, " ").trim() : "";
  };

  // Find the table - Target the one containing "RECEIPT NUMBER"
  const table = $('table:contains("RECEIPT NUMBER")');

  // Iterate over each row (tr)
  table.find("tr").each((index, row) => {
    const $row = $(row);
    const cells = $row.find("td");

    // Skip the header row (contains <b> tags or "RECEIPT NUMBER" text)
    if ($row.find("b").length > 1 || cells.length < 5) {
      return;
    }

    // Extract raw text data
    const receiptNumber = clean(cells.eq(0).text());
    const date = clean(cells.eq(1).text());
    const amountStr = clean(cells.eq(2).text());
    const campusCode = clean(cells.eq(3).text());

    // Extract values from hidden inputs within the 5th cell
    const applNo = cells.eq(4).find('input[name="applno"]').val() as string;
    const regNo = cells.eq(4).find('input[name="regno"]').val() as string;

    // Extract Receipt ID from the button's onclick attribute
    // Logic: captures '95810/9/CHN' from "javascript:doDuplicateReceipt('95810/9/CHN');"
    const onclickAttr = cells.eq(4).find("button").attr("onclick") || "";
    const idMatch = onclickAttr.match(/doDuplicateReceipt\(['"]([^'"]+)['"]\)/);
    const receiptId = idMatch ? idMatch[1] : "";

    // Validate that we actually have a data row
    if (receiptNumber && receiptId) {
      receipts.push({
        receiptNumber,
        date,
        amount: parseFloat(amountStr) || 0,
        campusCode,
        receiptId,
        applNo: clean(applNo),
        regNo: clean(regNo),
      });
    }
  });

  return receipts;
}
