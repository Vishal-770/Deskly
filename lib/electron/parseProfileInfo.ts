import * as cheerio from "cheerio";

// 1. Define Interfaces for the output structure
interface HeaderInfo {
  studentName: string;
  studentImage: string | undefined;
  registerNumber: string;
  vitEmail: string;
  programBranch: string;
  schoolName: string;
}

interface PersonalInfo {
  applicationNumber: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  mobileNumber: string;
  nationality: string;
  // Dynamic key-value map for addresses to handle complexity
  details: Record<string, string>;
}

interface EducationalInfo {
  appliedDegree: string;
  schoolName: string;
  yearOfPassing: string;
  board: string;
  details: Record<string, string>;
}

interface FamilyInfo {
  fatherName: string;
  motherName: string;
  fatherMobile: string;
  motherMobile: string;
  details: Record<string, string>;
}

interface ProctorInfo {
  facultyId: string;
  facultyName: string;
  facultyEmail: string;
  facultyMobile: string;
  facultyImage: string | undefined;
  cabin: string;
}

interface HostelInfo {
  blockName: string;
  roomNo: string;
  messInfo: string;
}

export interface ParsedStudentData {
  header: HeaderInfo;
  personal: PersonalInfo;
  education: EducationalInfo;
  family: FamilyInfo;
  proctor: ProctorInfo;
  hostel: HostelInfo;
}

// 2. Helper to clean string inputs
const cleanText = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
};

// 3. Helper to convert table rows into a key-value object
// Handles section headers (blue rows) to prefix keys (e.g., "FATHER_mobile")
const parseTableToMap = (
  $: cheerio.CheerioAPI,
  containerId: string,
): Record<string, string> => {
  const data: Record<string, string> = {};
  let currentPrefix = "";

  $(`#${containerId} table tr`).each((_, elem) => {
    const tds = $(elem).find("td");

    // Check for Section Header (Blue background)
    if (tds.length === 1 || tds.attr("colspan") === "3") {
      const headerText = $(elem).text().trim();
      if (headerText) {
        currentPrefix = headerText.replace(/\s/g, "_").toUpperCase() + "_";
      }
      return; // Skip to next row
    }

    // Standard Key-Value Row
    if (tds.length >= 2) {
      let key = $(tds[0])
        .text()
        .trim()
        .replace(/[:]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
      const value = $(tds[1]).text().trim();

      if (key && value) {
        // If we are under a section header, prefix the key
        if (currentPrefix) {
          key = currentPrefix.toLowerCase() + key;
        }
        data[key] = value;
      }
    }
  });

  return data;
};

// 4. Main Parsing Function
export function parseStudentHtml(htmlContent: string): ParsedStudentData {
  const $ = cheerio.load(htmlContent);

  // --- A. Parse Header Section ---
  const headerCard = $(".card .row").first();

  // Helper to find label sibling values
  const getLabelValue = (labelTextStart: string): string => {
    const label = headerCard.find(`label:contains("${labelTextStart}")`);
    // The value is usually in the immediate next label or sibling
    return cleanText(label.next("label").text());
  };

  const header: HeaderInfo = {
    studentName: cleanText(headerCard.find("p").text()),
    studentImage: headerCard.find("img").attr("src"),
    registerNumber: getLabelValue("REGISTER NUMBER"),
    vitEmail: getLabelValue("VIT EMAIL"),
    programBranch: getLabelValue("PROGRAM & BRANCH"),
    schoolName: getLabelValue("SCHOOL NAME"),
  };

  // --- B. Parse Accordion Sections ---

  // 1. Personal Information (collapseOne)
  const personalMap = parseTableToMap($, "collapseOne");
  const personal: PersonalInfo = {
    applicationNumber: personalMap["application_number"] || "",
    dob: personalMap["date_of_birth"] || "",
    gender: personalMap["gender"] || "",
    bloodGroup: personalMap["blood_group"] || "",
    mobileNumber: personalMap["mobile_number"] || "",
    nationality: personalMap["nationality"] || "",
    details: personalMap, // Store rest of data (addresses) here
  };

  // 2. Educational Information (collapseTwo)
  const eduMap = parseTableToMap($, "collapseTwo");

  // Find the correct year of passing key
  let yearOfPassingKey = "year_of_passing/_passed";
  if (!eduMap[yearOfPassingKey]) {
    // Try alternative keys
    const possibleKeys = Object.keys(eduMap).filter(
      (key) =>
        key.includes("year") &&
        (key.includes("passing") || key.includes("passed")),
    );
    if (possibleKeys.length > 0) {
      yearOfPassingKey = possibleKeys[0];
    }
  }

  const education: EducationalInfo = {
    appliedDegree: eduMap["applied_degree"] || "",
    schoolName: eduMap["school_name"] || "",
    board: eduMap["board_/_university"] || "",
    yearOfPassing: eduMap[yearOfPassingKey] || "",
    details: eduMap,
  };

  // 3. Family Information (collapseThree)
  // Note: The logic in parseTableToMap handles "FATHER DETAILS" prefixing
  const famMap = parseTableToMap($, "collapseThree");
  const family: FamilyInfo = {
    fatherName: famMap["father_details_father_name"] || "",
    motherName: famMap["mother_details_name"] || "",
    fatherMobile: famMap["father_details_mobile_number"] || "",
    motherMobile: famMap["mother_details_mobile_number"] || "",
    details: famMap,
  };

  // 4. Proctor Information (collapseFour)
  // Special case: Contains an image in the table
  const proctorMap = parseTableToMap($, "collapseFour");
  const proctorImage = $("#collapseFour table img").attr("src");

  const proctor: ProctorInfo = {
    facultyId: proctorMap["faculty_id"] || "",
    facultyName: proctorMap["faculty_name"] || "",
    facultyEmail: proctorMap["faculty_email"] || "",
    facultyMobile: proctorMap["faculty_mobile_number"] || "",
    cabin: proctorMap["cabin"] || "",
    facultyImage: proctorImage,
  };

  // 5. Hostel Information (collapseFive)
  const hostelMap = parseTableToMap($, "collapseFive");
  const hostel: HostelInfo = {
    blockName: hostelMap["block_name"] || "",
    roomNo: hostelMap["room_no"] || "",
    messInfo: hostelMap["mess_information"] || "",
  };

  return {
    header,
    personal,
    education,
    family,
    proctor,
    hostel,
  };
}

// --- Usage Example ---
// const htmlInput = `... paste your html string here ...`;
// const result = parseStudentHtml(htmlInput);
// console.log(JSON.stringify(result, null, 2));
