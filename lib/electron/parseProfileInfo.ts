import * as cheerio from "cheerio";

// --- Interfaces for the Extracted Data ---

export interface StudentDetails {
  name: string;
  registerNumber: string;
  applicationNumber: string;
  program: string;
  dob: string;
  gender: string;
  mobile: string;
  vitEmail: string;
  personalEmail: string;
  photoUrl: string; // Base64 string or URL
}

export interface ProctorDetails {
  facultyId: string;
  name: string;
  designation: string;
  school: string;
  cabin: string;
  mobile: string;
  email: string;
  photoUrl: string; // Base64 string or URL
}

export interface HostelDetails {
  blockName: string;
  roomNumber: string;
  bedType: string;
  messType: string;
}

export interface ImportantProfileData {
  student: StudentDetails;
  proctor: ProctorDetails;
  hostel: HostelDetails;
}

// --- Parsing Function ---

/**
 * Extracts important student, proctor, and hostel information (including images)
 * from the VIT Student Profile HTML string.
 * @param htmlString The raw HTML content.
 * @returns ImportantProfileData object.
 */
export function parseStudentProfile(htmlString: string): ImportantProfileData {
  const $ = cheerio.load(htmlString);

  // Helper to clean whitespace
  const clean = (text: string) => text.replace(/\s+/g, " ").trim();

  // Helper to find value in tables based on the Label text
  // It looks for a <td> containing the label, then grabs the next <td>'s text.
  const getTableValue = (contextSelector: string, label: string): string => {
    // Escape special regex characters in label just in case
    return clean(
      $(contextSelector)
        .find(`td:contains("${label}")`)
        .first() // Ensure we get the first match in case of duplicates
        .next("td")
        .text(),
    );
  };

  // --- 1. Extract Student Details ---

  // Student basic info is often in the top card or #collapseOne
  const studentName = clean($(".card .col-4 p").text());
  const studentImage = $(".card .col-4 img").attr("src") || "";

  // Use hidden inputs if available (more reliable), otherwise parse table
  const regNoInput = $("#regno").val() as string;
  const appNoInput = $("#applno").val() as string;

  const student: StudentDetails = {
    name: studentName,
    photoUrl: studentImage,
    registerNumber:
      regNoInput || getTableValue("#collapseOne", "REGISTER NUMBER"),
    applicationNumber:
      appNoInput || getTableValue("#collapseOne", "APPLICATION NUMBER"),
    // Some fields might be in top labels or the table
    program: clean(
      $("label:contains('PROGRAM & BRANCH')").next("label").text(),
    ),
    dob: getTableValue("#collapseOne", "DATE OF BIRTH"),
    gender: getTableValue("#collapseOne", "GENDER"),
    mobile: getTableValue("#collapseOne", "MOBILE NUMBER"),
    vitEmail: clean($("label:contains('VIT EMAIL')").next("label").text()),
    personalEmail: getTableValue("#collapseOne", "EMAIL"),
  };

  // --- 2. Extract Proctor Details ---
  // Located in #collapseFour

  const proctorImage = $("#collapseFour table img").attr("src") || "";

  const proctor: ProctorDetails = {
    facultyId: getTableValue("#collapseFour", "FACULTY ID"),
    name: getTableValue("#collapseFour", "FACULTY NAME"),
    designation: getTableValue("#collapseFour", "DESIGNATION"), // or FACULTY DESIGNATION
    school: getTableValue("#collapseFour", "SCHOOL"),
    cabin: getTableValue("#collapseFour", "CABIN"),
    email:
      getTableValue("#collapseFour", "FACULTY EMAIL") ||
      getTableValue("#collapseFour", "EMAIL"),
    mobile:
      getTableValue("#collapseFour", "FACULTY MOBILE NUMBER") ||
      getTableValue("#collapseFour", "MOBILE"),
    photoUrl: proctorImage,
  };

  // --- 3. Extract Hostel Details ---
  // Located in #collapseFive

  const hostel: HostelDetails = {
    blockName: getTableValue("#collapseFive", "Block Name"),
    roomNumber: getTableValue("#collapseFive", "Room No"),
    bedType: getTableValue("#collapseFive", "Bed Type"),
    messType: getTableValue("#collapseFive", "Mess Information"),
  };

  return {
    student,
    proctor,
    hostel,
  };
}
