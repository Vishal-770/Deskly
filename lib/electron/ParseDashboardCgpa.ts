import { CGPAData } from "@/electron/services/other/Content.service";
import * as cheerio from "cheerio";

export async function extractCGPAFromHTML(html: string): Promise<CGPAData> {
  const $ = cheerio.load(html);

  const data: CGPAData = {
    totalCreditsRequired: 0,
    earnedCredits: 0,
    currentCGPA: 0,
    nonGradedCore: 0,
  };

  // Find the list items
  $(".list-group-item").each((_, item) => {
    const spans = $(item).find("span");
    if (spans.length >= 2) {
      const label = $(spans[0]).text().trim();
      const valueText = $(spans[1]).find("span").text().trim();
      const value = parseFloat(valueText);

      if (label.includes("Total Credits Required")) {
        data.totalCreditsRequired = value;
      } else if (label.includes("Earned Credits")) {
        data.earnedCredits = value;
      } else if (label.includes("Current CGPA")) {
        data.currentCGPA = value;
      } else if (label.includes("Non-graded Core Requirement")) {
        data.nonGradedCore = value;
      }
    }
  });

  return data;
}
