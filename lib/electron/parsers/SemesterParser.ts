import { Semester } from "@/types/electron/Semster.types";
import * as cheerio from "cheerio";



export function extractSemesters(html: string): Semester[] {
  const $ = cheerio.load(html);
  const semesters: Semester[] = [];

  $("#semesterSubId option").each((_, element) => {
    const id = $(element).attr("value")?.trim();
    const name = $(element).text().trim();

    // Skip placeholder option
    if (id && id !== "") {
      semesters.push({ id, name });
    }
  });

  return semesters;
}
