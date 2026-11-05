/** Role labels and routes live here so every workspace uses the same navigation. */
import { STUDENT_ID, TEACHER_ID } from "./store.js";

export const roleNames = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};
export const navigation = {
  admin: [
    ["overview", "dashboard", "Overview"],
    ["students", "people", "Students"],
    ["staff", "people", "Teachers & staff"],
    ["admissions", "inbox", "Admissions"],
    ["attendance", "check", "Attendance"],
    ["fees", "fees", "Fees & collections"],
    ["results", "chart", "Exams & results"],
    ["timetable", "calendar", "Timetable"],
    ["notices", "notice", "Notice board"],
    ["library", "book", "Library"],
    ["transport", "bus", "Transport"],
    ["leave", "calendar", "Leave requests"],
    ["settings", "settings", "Settings"],
  ],
  teacher: [
    ["overview", "dashboard", "My classroom"],
    ["classes", "people", "My classes"],
    ["attendance", "check", "Mark attendance"],
    ["assignments", "book", "Assignments"],
    ["results", "chart", "Gradebook"],
    ["timetable", "calendar", "My timetable"],
    ["notices", "notice", "School notices"],
    ["messages", "inbox", "Messages"],
    ["leave", "calendar", "Leave requests"],
    ["settings", "settings", "Settings"],
  ],
  student: [
    ["overview", "dashboard", "My day"],
    ["assignments", "book", "Assignments"],
    ["timetable", "calendar", "My timetable"],
    ["attendance", "check", "My attendance"],
    ["results", "chart", "Results & progress"],
    ["resources", "file", "Learning resources"],
    ["fees", "fees", "Fees & receipts"],
    ["notices", "notice", "School notices"],
    ["library", "book", "My library"],
    ["transport", "bus", "My transport"],
    ["messages", "inbox", "Messages"],
    ["profile", "people", "My profile"],
    ["settings", "settings", "Settings"],
  ],
};

export function resolveWorkspaceView(role, hash = "") {
  const requested =
    new URLSearchParams(hash.replace(/^#/, "")).get("view") || "overview";
  return navigation[role]?.some(([id]) => id === requested)
    ? requested
    : "overview";
}

export function getWorkspaceIdentity(role, data) {
  if (role === "student")
    return (
      data.students.find((student) => student.id === STUDENT_ID)?.name ||
      "Student"
    );
  if (role === "teacher")
    return (
      data.staff.find((teacher) => teacher.id === TEACHER_ID)?.name || "Teacher"
    );
  return "School administrator";
}
