import {
  STUDENT_ID,
  TEACHER_ID,
  CLASSES,
  SUBJECTS,
  DEMO_DATE,
} from "./store.js";
import {
  escapeHtml as e,
  money,
  initials,
  dateLabel,
  icon,
  badge,
  metric,
  panel,
  emptyState,
  actionButton,
} from "./ui.js";

import {
  roleNames,
  navigation,
  getWorkspaceIdentity,
} from "./workspace-config.js";
export { roleNames, navigation };

export function currentStudent(data) {
  return (
    data.students.find((person) => person.id === STUDENT_ID) || data.students[0]
  );
}
export function visibleAssignments(data, role) {
  return data.assignments.filter((task) =>
    role === "student"
      ? task.published && task.grade === currentStudent(data).grade
      : role === "teacher"
        ? task.teacher === TEACHER_ID
        : true,
  );
}
export function attendanceStats(data, grade = "VI A") {
  const students = data.students.filter(
    (person) => person.grade === grade && person.status === "Active",
  );
  const records = data.attendance[`${grade}|${DEMO_DATE}`]?.records || {};
  return {
    students,
    present: students.filter((person) => records[person.id] === "Present")
      .length,
    absent: students.filter((person) => records[person.id] === "Absent").length,
    late: students.filter((person) => records[person.id] === "Late").length,
    total: students.length,
  };
}
export function personCell(person, index = 0) {
  return `<div class="person"><span class="avatar ${index % 3 === 1 ? "peach" : index % 3 === 2 ? "blue" : ""}">${e(initials(person.name))}</span><div><strong>${e(person.name)}</strong><small>${e(person.admission || person.email || person.id)}</small></div></div>`;
}
export function heading(title, subtitle, actions = "") {
  return `<div class="page-heading"><div><span class="overline">YOUR DIGITAL CAMPUS</span><h1>${e(title)}</h1><p>${e(subtitle)}</p></div><div class="heading-actions">${actions || `<div class="date-chip">${icon("calendar")}30 Oct 2026</div>`}</div></div>`;
}
const link = (text, page) =>
  `<a class="text-button" href="#view=${page}">${e(text)} </a>`;
const table = (headers, rows) =>
  `<div class="table-container"><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
const tableEmpty = (columns) =>
  `<tr><td colspan="${columns}" style="text-align:center;padding:40px">No matching records. Try a different search.</td></tr>`;

export function renderGateway() {
  const cards = [
    [
      "student",
      "FOR STUDENTS",
      "Student panel",
      "Check your homework, timetable and results. Submit work and read your teacher’s feedback.",
      [
        "Submit work & see feedback",
        "Explore results & your timetable",
        "Try fee payments & borrow books",
      ],
    ],
    [
      "teacher",
      "FOR TEACHERS",
      "Teacher panel",
      "Manage your classes, take attendance, share assignments and review student work.",
      [
        "Mark & finalize attendance",
        "Publish homework & review work",
        "Enter marks & message students",
      ],
    ],
    [
      "admin",
      "FOR SCHOOL STAFF",
      "Admin panel",
      "Manage student records, admissions, fees and everyday school administration.",
      [
        "Manage students & school staff",
        "Move enquiries through admissions",
        "Track fees, library & transport",
      ],
    ],
  ];
  return `<main class="gateway"><div class="gateway-top"><a class="gateway-brand" href="index.html"><img src="assets/school-crest.svg" alt="Your School crest"><span><b>Your School</b><small>YOUR DIGITAL CAMPUS</small></span></a><a href="index.html">Back to school website </a></div><div class="gateway-intro"><span class="overline">YOUR SCHOOL DIGITAL CAMPUS</span><h1>Your school day.<br><span>School information, in one place.</span></h1><p>Choose a workspace and make yourself at home.<br>Every screen is interactive. All records are fictional.</p></div><div class="role-grid">${cards.map(([role, kicker, title, description, features]) => `<a href="portal.html?role=${role}" class="role-card ${role}"><span class="overline">${kicker}</span><div class="role-sculpture"><span class="art-orb"></span><span class="art-ring"></span></div><h2>${title}</h2><p>${description}</p><ul>${features.map((feature) => `<li>${feature}</li>`).join("")}</ul><span class="btn ${role === "admin" ? "btn-dark" : "btn-primary"}">Open ${role} panel </span></a>`).join("")}</div><p class="gateway-note">No login needed for the demo. Changes are saved in this browser and shared across these three workspaces. You can reset the sample campus anytime in Settings.</p></main>`;
}

function attendanceDonut(data) {
  const stats = attendanceStats(data);
  const percentage = stats.total
    ? Math.round((stats.present / stats.total) * 100)
    : 0;
  return `<div class="donut-layout"><div class="donut" style="--attendance:${percentage}%"><div><strong>${percentage}%</strong><small>CLASS VI A · TODAY</small></div></div><div class="attendance-key"><div><span>Present</span><b>${stats.present}</b></div><div><span>Absent</span><b>${stats.absent}</b></div><div><span>Late / other</span><b>${stats.total - stats.present - stats.absent}</b></div></div></div><p class="chart-note">Sample class roster · Includes draft attendance</p>`;
}
function noticePreview(data) {
  return data.notices
    .slice(0, 3)
    .map(
      (item) =>
        `<div class="activity-item"><span class="activity-dot">${icon("notice")}</span><div><h4>${e(item.title)}</h4><p>${e(item.body.slice(0, 90))}${item.body.length > 90 ? "…" : ""}</p><small>${dateLabel(item.date)} · ${e(item.category)}</small></div></div>`,
    )
    .join("");
}
function schedulePreview(data) {
  return data.timetable
    .filter((row) => row[1] !== "Break")
    .slice(0, 4)
    .map(
      (row, index) =>
        `<div class="activity-item"><span class="activity-dot">${icon(index % 2 ? "book" : "clock")}</span><div style="flex:1"><h4>${e(row[1])}</h4><p>${e(row[2])} · ${e(row[3])}</p></div><small style="font-size:8px;color:#a0ad90">${e(row[0])}</small></div>`,
    )
    .join("");
}
export function renderOverview(data, role) {
  const student = currentStudent(data);
  const stats = attendanceStats(data);
  const tasks = visibleAssignments(data, role);
  const outstanding = data.invoices
    .filter((invoice) => !invoice.paid)
    .reduce(
      (sum, invoice) => sum + invoice.tuition + invoice.activity + invoice.fine,
      0,
    );
  const collection = data.invoices
    .filter((invoice) => invoice.paid)
    .reduce(
      (sum, invoice) => sum + invoice.tuition + invoice.activity + invoice.fine,
      0,
    );
  const done = tasks.filter((task) => task.submissions[STUDENT_ID]).length;
  const metrics =
    role === "admin"
      ? [
          metric(
            "Active students",
            data.students.filter((s) => s.status === "Active").length,
            "Across 3 sample classes",
            "people",
            "green",
          ),
          metric(
            "Teaching team",
            data.staff.length,
            "Current sample staff",
            "book",
            "orange",
          ),
          metric(
            "Fees collected",
            money(collection),
            "November · simulated receipts",
            "fees",
            "purple",
          ),
          metric(
            "New enquiries",
            data.enquiries.filter((item) => item.stage === "New enquiry")
              .length,
            "Waiting for a follow-up",
            "inbox",
            "blue",
          ),
        ]
      : role === "teacher"
        ? [
            metric(
              "My learners",
              stats.total,
              "Class VI A · sample roster",
              "people",
              "green",
            ),
            metric(
              "Present today",
              stats.present,
              "Current classroom attendance",
              "check",
              "orange",
            ),
            metric(
              "Live assignments",
              tasks.filter((task) => task.published).length,
              "Available to students",
              "book",
              "purple",
            ),
            metric(
              "To review",
              tasks.reduce(
                (sum, t) =>
                  sum +
                  Object.values(t.submissions).filter((s) => !s.reviewed)
                    .length,
                0,
              ),
              "Submitted work to review",
              "file",
              "blue",
            ),
          ]
        : [
            metric(
              "Attendance",
              "96%",
              "Illustrative term baseline",
              "check",
              "green",
            ),
            metric(
              "Assignments",
              tasks.length - done,
              "Assignments still to submit",
              "book",
              "orange",
            ),
            metric("My progress", "A", "Sample term grade", "chart", "purple"),
            metric(
              "My class",
              student.grade,
              "Current class",
              "people",
              "blue",
            ),
          ];
  const banner = {
    admin: [
      "Here’s what’s happening at school.",
      "Check attendance, follow up on admissions and review outstanding fees from your dashboard.",
      "admissions",
      "Explore admissions",
    ],
    teacher: [
      "Your classes are ready for today.",
      "Start with attendance, check submitted work or prepare your next assignment.",
      "attendance",
      "Take attendance",
    ],
    student: [
      "Here’s your school day.",
      "Check what’s due, see your timetable and catch up on notices from school.",
      "assignments",
      "See my assignments",
    ],
  }[role];
  const quick =
    role === "admin"
      ? [
          ["students", "people", "Student directory", "Student records"],
          ["fees", "fees", "View collections", "Fees & receipts"],
          ["notices", "notice", "Share an update", "School notice board"],
          ["admissions", "inbox", "View enquiries", "Admission enquiries"],
        ]
      : role === "teacher"
        ? [
            [
              "attendance",
              "check",
              "Take attendance",
              "A good start to the day",
            ],
            [
              "assignments",
              "book",
              "Set an assignment",
              "Something to discover",
            ],
            ["results", "chart", "Enter marks", "See their progress"],
            ["messages", "inbox", "Send a message", "Stay connected"],
          ]
        : [
            ["assignments", "book", "My assignments", "Tasks and submissions"],
            ["results", "chart", "My results", "See marks by subject"],
            [
              "resources",
              "file",
              "Learning resources",
              "Notes and reading material",
            ],
            ["messages", "inbox", "Ask a question", "Your teacher is here"],
          ];
  const chart = `<div class="collection-summary"><div><strong>${money(collection)}</strong><small>Current simulated collections</small></div><div class="chart-key"><span>Collected</span><span>Scheduled</span></div></div><div class="chart">${[52, 78, 59, 87, 73, 96].map((height, index) => `<div class="chart-col"><div class="chart-bars"><i style="--bar-height:${height}%"></i><i style="--bar-height:${Math.min(100, height + 16)}%"></i></div><span>${["MAY", "JUN", "JUL", "AUG", "SEP", "OCT"][index]}</span></div>`).join("")}</div><p class="chart-note">Illustrative historical chart · Live demo balance outstanding: ${money(outstanding)}</p>`;
  const assignments = tasks
    .slice(0, 3)
    .map(
      (task) =>
        `<div class="activity-item"><span class="activity-dot">${icon("book")}</span><div style="flex:1"><h4>${e(task.title)}</h4><p>${e(task.subject)} · Due ${dateLabel(task.due)}</p></div>${badge(task.submissions[STUDENT_ID] ? "Submitted" : "To do", task.submissions[STUDENT_ID] ? "" : "orange")}</div>`,
    )
    .join("");
  return (
    heading(
      role === "admin"
        ? "Your school, at a glance."
        : role === "teacher"
          ? `Good morning, ${getWorkspaceIdentity("teacher", data).split(" ")[0]}.`
          : `Good morning, ${student.name.split(" ")[0]}.`,
      "Friday, 30 October · A fresh school day is here.",
    ) +
    `<section class="welcome-banner ${role}"><div><span class="overline">${role === "admin" ? "SCHOOL OVERVIEW" : role === "teacher" ? "TEACHER DASHBOARD" : "STUDENT DASHBOARD"}</span><h2>${banner[0]}</h2><p>${banner[1]}</p><a class="btn btn-dark" href="#view=${banner[2]}">${banner[3]} </a></div><div class="banner-art" aria-hidden="true"><span class="art-orb"></span><span class="art-ring"></span><span class="art-star">✧</span><span class="art-shadow"></span><span class="art-label">Your School · DIGITAL CAMPUS</span></div></section><div class="metric-grid">${metrics.join("")}</div><div class="dashboard-grid"><div>${panel(role === "admin" ? "Fee collections" : role === "teacher" ? "Today’s classroom" : "Assignments to check", role === "admin" ? chart : role === "teacher" ? schedulePreview(data) : assignments, link(role === "admin" ? "View fees" : role === "teacher" ? "Full timetable" : "All assignments", role === "admin" ? "fees" : role === "teacher" ? "timetable" : "assignments"))}${
      role === "admin"
        ? panel(
            "Our newest learners",
            table(
              ["LEARNER", "CLASS", "HOUSE", "STATUS"],
              data.students
                .slice(-4)
                .reverse()
                .map(
                  (person, i) =>
                    `<tr><td>${personCell(person, i)}</td><td>${e(person.grade)}</td><td>${e(person.house)}</td><td>${badge(person.status, person.status === "Active" ? "" : "neutral")}</td></tr>`,
                ),
            ),
            link("All students", "students"),
          )
        : panel(
            "School notices",
            noticePreview(data),
            link("All notices", "notices"),
          )
    }</div><div>${panel("Every learner counts", attendanceDonut(data), badge("TODAY"))}${panel("Quick links", `<div class="quick-actions">${quick.map(([target, symbol, title, subtitle]) => `<a class="quick-action" href="#view=${target}">${icon(symbol)}<b>${title}</b><small>${subtitle}</small></a>`).join("")}</div>`)}${
      role === "admin"
        ? panel(
            "Around your campus",
            data.activity
              .slice(0, 3)
              .map(
                (item) =>
                  `<div class="activity-item"><span class="activity-dot">${icon("check")}</span><div><h4>${e(item.text)}</h4><small>${dateLabel(item.date)}</small></div></div>`,
              )
              .join(""),
          )
        : ""
    }</div></div>`
  );
}

export function renderStudents(data, _role, filters) {
  const rows = data.students.filter(
    (person) =>
      (!filters.class || person.grade === filters.class) &&
      `${person.name} ${person.admission}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()),
  );
  return (
    heading(
      "The people at the heart of Your School.",
      "Meet the learners at the heart of your sample campus.",
      actionButton("Add student", "add-student"),
    ) +
    panel(
      "Student directory",
      `<div class="table-toolbar"><div class="filter-row"><div class="table-search">${icon("search")}<input data-filter="search" aria-label="Search students" placeholder="Find a name or admission number" value="${e(filters.search)}"></div><select data-filter="class" aria-label="Filter students by class"><option value="">All classes</option>${CLASSES.map((grade) => `<option ${filters.class === grade ? "selected" : ""}>${grade}</option>`).join("")}</select></div>${actionButton("Export CSV", "export-students", "download", "btn-secondary btn-small")}</div>${table(["LEARNER", "CLASS", "ROLL NO.", "GUARDIAN", "STATUS", "ACTIONS"], rows.length ? rows.map((person, i) => `<tr><td>${personCell(person, i)}</td><td>${e(person.grade)}</td><td>${e(person.roll)}</td><td>${e(person.guardian)}</td><td>${badge(person.status, person.status === "Active" ? "" : "neutral")}</td><td><div class="table-actions"><button class="text-button" data-action="student-profile" data-id="${e(person.id)}">View</button><button class="icon-button" data-action="edit-student" data-id="${e(person.id)}" aria-label="Edit ${e(person.name)}">${icon("edit")}</button></div></td></tr>`) : [tableEmpty(6)])}<div class="table-footer"><span>${rows.length} of ${data.students.length} sample learners</span><span>Academic session ${e(data.settings.academicYear)}</span></div>`,
    )
  );
}
export function renderStaff(data) {
  return (
    heading(
      "Your teaching team.",
      "Add staff, update teaching subjects and manage class assignments.",
      actionButton("Add teacher", "add-staff"),
    ) +
    panel(
      "Teaching team",
      table(
        ["TEACHER", "SUBJECT", "CLASS TEACHER", "STATUS", "ACTION"],
        data.staff.map(
          (person, i) =>
            `<tr><td>${personCell(person, i)}</td><td>${e(person.subject)}</td><td>${e(person.classTeacher)}</td><td>${badge(person.status)}</td><td><button class="text-button" data-action="edit-staff" data-id="${e(person.id)}">Edit profile</button></td></tr>`,
        ),
      ),
    )
  );
}
export function renderAdmissions(data, _role, filters) {
  const stages = ["New enquiry", "Contacted", "Visit scheduled", "Applied"];
  const entries = data.enquiries.filter((item) =>
    item.name.toLowerCase().includes(filters.search.toLowerCase()),
  );
  return (
    heading(
      "Admission enquiries",
      "See who needs a reply, schedule visits and keep track of applications.",
      actionButton("Add enquiry", "add-enquiry"),
    ) +
    `<div class="table-toolbar"><div class="table-search">${icon("search")}<input data-filter="search" value="${e(filters.search)}" aria-label="Search enquiries" placeholder="Find a family"></div>${badge(`${data.enquiries.length} sample enquiries`, "blue")}</div><div class="pipeline">${stages
      .map(
        (stage, index) =>
          `<section class="pipeline-column"><h2>${stage}<span>${entries.filter((item) => item.stage === stage).length}</span></h2>${
            entries
              .filter((item) => item.stage === stage)
              .map(
                (item) =>
                  `<article class="lead-card">${badge(item.grade, index % 2 ? "orange" : "blue")}<h3>${e(item.name)}</h3><p>${e(item.message.slice(0, 80))}</p><small>${dateLabel(item.date)}</small><button class="text-button" data-action="enquiry-details" data-id="${e(item.id)}">View details </button><div style="margin-top:14px">${index < 3 ? actionButton(["Mark contacted", "Schedule visit", "Mark applied"][index], "move-enquiry", "arrow", "btn-soft", `data-id="${e(item.id)}"`) : badge("Application received")}</div></article>`,
              )
              .join("") ||
            '<p style="font-size:9px;padding:10px;color:#adb79f">No enquiries at this stage.</p>'
          }</section>`,
      )
      .join("")}</div>`
  );
}
export function renderClasses(data) {
  return (
    heading(
      "My classes",
      "Class lists, assignments and attendance for the classes you teach.",
    ) +
    `<div class="card-grid">${CLASSES.map((grade, index) => {
      const students = data.students.filter((s) => s.grade === grade);
      return `<article class="class-card"><div class="card-top"><span class="subject-symbol ${index === 1 ? "blue" : index === 2 ? "orange" : ""}">${icon("people")}</span>${badge(index === 0 ? "Class teacher" : "Subject teacher", index === 0 ? "" : "blue")}</div><h3>Class ${grade}</h3><p>${students.length} sample learners · Science<br>${index === 0 ? "Your class teacher group." : "Science class"}</p><div class="card-meta"><span>${icon("book")}${data.assignments.filter((a) => a.grade === grade).length} assignments</span><span>${data.students.filter((s) => s.grade === grade).length} learners</span></div><button class="btn btn-soft" data-action="class-roster" data-id="${grade}">Meet the class </button></article>`;
    }).join("")}</div>`
  );
}

export function renderAttendance(data, role, filters) {
  if (role === "student") {
    const student = currentStudent(data);
    const current =
      data.attendance[`${student.grade}|${DEMO_DATE}`]?.records[STUDENT_ID] ||
      "Not marked";
    const historicalPresent = 24;
    return (
      heading(
        "My attendance",
        "Aarav’s illustrative attendance history for October 2026.",
      ) +
      `<div class="metric-grid">${metric("Term attendance", "96%", "Historical sample baseline", "check", "green")}${metric("Present days", historicalPresent, "Historical sample days", "calendar", "blue")}${metric("Absent days", "1", "Historical sample days", "clock", "orange")}${metric("Today", current, "Current demo attendance", "people", "purple")}</div>${panel(
        "October 2026",
        `<div class="calendar-heading"><span>Your attendance record</span>${badge("ILLUSTRATIVE HISTORY", "neutral")}</div><div class="month-grid">${["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => `<div class="weekday">${day}</div>`).join("")}${'<div class="blank"></div>'.repeat(3)}${Array.from(
          { length: 31 },
          (_, i) => {
            const day = i + 1,
              holiday = day % 7 === 3 || day % 7 === 4;
            return `<div class="${day === 30 ? "today" : day === 14 ? "absent" : holiday ? "holiday" : ""} ${day > 30 ? "upcoming" : ""}">${day}<small>${day === 30 ? e(current) : day > 30 ? "Upcoming" : holiday ? "Off" : day === 14 ? "Absent" : "Present"}</small></div>`;
          },
        ).join(
          "",
        )}</div><div class="legend"><span>Present</span><span>Absent</span><span>Non-school day</span></div>`,
      )}`
    );
  }
  const key = `${filters.class || "VI A"}|${filters.date || DEMO_DATE}`;
  const session = data.attendance[key];
  const people = data.students.filter(
    (s) => s.grade === (filters.class || "VI A") && s.status === "Active",
  );
  return (
    heading(
      "Class attendance",
      "Mark each student’s status, then finalize the register when it is complete.",
      session?.finalized
        ? actionButton(
            "Reopen for correction",
            "reopen-attendance",
            "edit",
            "btn-secondary",
          )
        : actionButton("Finalize attendance", "finalize-attendance", "check"),
    ) +
    panel(
      "Class attendance",
      `<div class="table-toolbar"><div class="filter-row"><select data-filter="class" aria-label="Attendance class">${CLASSES.map((grade) => `<option ${(filters.class || "VI A") === grade ? "selected" : ""}>${grade}</option>`).join("")}</select><input data-filter="date" type="date" aria-label="Attendance date" value="${filters.date || DEMO_DATE}" max="${DEMO_DATE}" style="margin:0;padding:8px 10px"></div><div style="display:flex;gap:10px;align-items:center">${badge(session?.finalized ? "Finalized" : "Draft", session?.finalized ? "" : "orange")}${!session?.finalized ? actionButton("All present", "all-present", "check", "btn-secondary btn-small") : ""}</div></div>${table(
        ["ROLL NO.", "LEARNER", "CLASS", "ATTENDANCE"],
        people.map(
          (person, i) =>
            `<tr><td>${e(person.roll)}</td><td>${personCell(person, i)}</td><td>${e(person.grade)}</td><td><select data-attendance="${person.id}" aria-label="Attendance for ${e(person.name)}" ${session?.finalized ? "disabled" : ""}>${["Not marked", "Present", "Absent", "Late", "Excused"].map((status) => `<option ${(session?.records[person.id] || "Not marked") === status ? "selected" : ""}>${status}</option>`).join("")}</select></td></tr>`,
        ),
      )}<p class="invoice-note">${session?.finalized ? "This session is finalized. Reopen with a correction reason to change it." : "Changes save as a draft. Finalize when everyone is marked. Only Absent records are included in the simulated alert count; no messages are sent."}</p>`,
    )
  );
}

export function renderAssignments(data, role, filters) {
  let tasks = visibleAssignments(data, role);
  if (filters.tab === "pending")
    tasks = tasks.filter((task) => !task.submissions[STUDENT_ID]);
  if (filters.tab === "submitted")
    tasks = tasks.filter((task) => task.submissions[STUDENT_ID]);
  return (
    heading(
      role === "teacher" ? "Class assignments" : "My assignments",
      role === "teacher"
        ? "Create tasks for your classes and review the work students submit."
        : "See what is due, submit your work and check teacher feedback.",
      role !== "student"
        ? actionButton("Create assignment", "add-assignment")
        : "",
    ) +
    (role === "student"
      ? `<div class="tabs">${[
          ["all", "All assignments"],
          ["pending", "To do"],
          ["submitted", "Submitted"],
        ]
          .map(
            ([id, label]) =>
              `<button class="tab ${(filters.tab || "all") === id ? "active" : ""}" data-tab="${id}">${label}</button>`,
          )
          .join("")}</div>`
      : "") +
    (tasks.length
      ? `<div class="card-grid">${tasks
          .map((task, index) => {
            const submission = task.submissions[STUDENT_ID];
            const count = Object.keys(task.submissions).length;
            return `<article class="assignment-card"><div class="card-top"><span class="subject-symbol ${index % 3 === 1 ? "blue" : index % 3 === 2 ? "orange" : ""}">${icon("book")}</span>${badge(role === "student" ? (submission ? (submission.reviewed ? "Reviewed" : "Submitted") : "To do") : task.published ? "Published" : "Draft", role === "student" && !submission ? "orange" : "")}</div><span class="overline" style="margin-bottom:10px">${e(task.subject)} · ${e(task.grade)}</span><h3>${e(task.title)}</h3><p>${e(task.instructions.slice(0, 125))}${task.instructions.length > 125 ? "…" : ""}</p><div class="card-meta"><span>${icon("calendar")}${dateLabel(task.due)}</span><span>${role === "student" ? (submission?.reviewed ? `${submission.score}/10` : "Not yet reviewed") : `${count} submissions`}</span></div><button class="btn btn-soft" data-action="assignment-detail" data-id="${task.id}">${role === "student" ? (submission ? "View my work" : "Open assignment") : "View submissions"} </button>${role !== "student" ? `<button class="text-button" style="margin-top:14px;align-self:flex-start" data-action="edit-assignment" data-id="${task.id}">Edit assignment</button>` : ""}</article>`;
          })
          .join("")}</div>`
      : emptyState(
          "No assignments here yet.",
          "No assignments in this view. Try another tab or create a new assignment.",
        ))
  );
}

export function renderFees(data, role, filters) {
  const student = currentStudent(data);
  const invoices = data.invoices.filter(
    (invoice) => role !== "student" || invoice.student === STUDENT_ID,
  );
  const due = invoices
    .filter((i) => !i.paid)
    .reduce((sum, i) => sum + i.tuition + i.activity + i.fine, 0);
  const collected = invoices
    .filter((i) => i.paid)
    .reduce((sum, i) => sum + i.tuition + i.activity + i.fine, 0);
  return (
    heading(
      role === "admin" ? "Collections, with clarity." : "Fees and receipts",
      "All amounts are fictional. No bank, card or payment gateway is connected.",
      role === "admin"
        ? actionButton("Create invoice", "add-invoice", "plus")
        : "",
    ) +
    `<div class="metric-grid">${metric("Outstanding", money(due), "Current unpaid demo invoices", "fees", "orange")}${metric("Paid", money(collected), "Simulated collections only", "check", "green")}${metric("Invoices", invoices.length, "November 2026 · sample", "file", "blue")}${metric("Fine rate", money(data.settings.fineRate) + "/day", "Proposed policy · illustration", "clock", "purple")}</div>${panel(
      role === "admin" ? "Fee ledger" : "My invoices",
      `${role === "admin" ? `<div class="table-toolbar"><div class="filter-row"><select data-filter="status" aria-label="Filter fee status"><option value="">All invoices</option><option ${filters.status === "Paid" ? "selected" : ""}>Paid</option><option ${filters.status === "Due" ? "selected" : ""}>Due</option></select></div>${actionButton("Export ledger", "export-fees", "download", "btn-secondary btn-small")}</div>` : ""}${table(
        ["INVOICE", "LEARNER", "DUE DATE", "AMOUNT", "STATUS", "ACTION"],
        invoices
          .filter(
            (i) =>
              !filters.status || (i.paid ? "Paid" : "Due") === filters.status,
          )
          .map((invoice) => {
            const person = data.students.find((s) => s.id === invoice.student);
            return `<tr><td>${e(invoice.id)}<br><small style="font-size:7px;color:#abb69d">${e(invoice.month)}</small></td><td>${e(person?.name || student.name)}</td><td>${dateLabel(invoice.due)}</td><td>${money(invoice.tuition + invoice.activity + invoice.fine)}</td><td>${badge(invoice.paid ? "Paid · demo" : "Due", invoice.paid ? "" : "orange")}</td><td><button class="text-button" data-action="invoice-detail" data-id="${invoice.id}">${invoice.paid ? "View receipt" : "View & simulate payment"} </button></td></tr>`;
          }),
      )}`,
    )}${panel("A transparent fine, before you pay.", `<p class="panel-description">Try the proposed policy with a different number of days. The actual school policy needs approval.</p><div class="filter-row"><label>Days overdue<input type="number" id="fine-days" value="0" min="0" max="365" style="width:150px"></label><div style="padding:15px 25px"><span class="overline">ILLUSTRATIVE FINE</span><strong id="fine-value" style="font:600 25px Manrope">₹0</strong></div></div><p class="chart-note">${money(data.settings.fineRate)} × days overdue. No grace periods, waivers or partial-payment rules are applied in this illustration.</p>`)}`
  );
}

export function renderResults(data, role, filters) {
  const student = currentStudent(data);
  if (role === "student") {
    if (!data.resultsPublished)
      return (
        heading(
          "Results are not available yet.",
          "Your results will appear here when your teacher publishes them.",
        ) +
        emptyState(
          "Results aren’t published yet.",
          "Your teacher will publish the results when they are ready.",
        )
      );
    const total = data.results.reduce(
      (sum, result) => sum + Number(result.scores[STUDENT_ID] || 0),
      0,
    );
    return (
      heading(
        "See how far you’ve come.",
        "Your subject marks and term summary, together.",
        actionButton(
          "Download report",
          "download-report",
          "download",
          "btn-secondary",
        ),
      ) +
      `<div class="metric-grid">${metric("Overall score", `${Math.round(total / 6)}%`, "Sample term performance", "chart", "green")}${metric("Total marks", `${total} / 600`, "Six sample subjects", "file", "blue")}${metric("Overall grade", total / 6 >= 90 ? "A+" : total / 6 >= 80 ? "A" : "B", "Term I summary", "check", "orange")}${metric("Academic year", data.settings.academicYear, "Term I · illustrative report", "calendar", "purple")}</div>${panel(
        "Subject results",
        table(
          ["SUBJECT", "MARKS", "PROGRESS", "GRADE"],
          data.results.map((result) => {
            const score = result.scores[STUDENT_ID] || 0;
            return `<tr><td>${e(result.subject)}</td><td>${score} / ${result.max}</td><td><div class="score-cell"><span class="score-bar" style="--score:${score}%"><i></i></span><span>${score}%</span></div></td><td>${badge(score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : "B")}</td></tr>`;
          }),
        ),
      )}${panel("Something to keep in mind.", '<p class="panel-description" style="margin:0">These marks are fictional. Your progress is about more than a number: keep asking questions, trying new things and showing up.</p>')}`
    );
  }
  const grade = filters.class || "VI A";
  const subject = filters.subject || "Science";
  const result = data.results.find((row) => row.subject === subject);
  const students = data.students.filter((s) => s.grade === grade);
  return (
    heading(
      "Gradebook",
      "Enter sample marks and publish a report that students can see.",
      actionButton(
        data.resultsPublished ? "Unpublish results" : "Publish results",
        "toggle-results",
        "check",
        data.resultsPublished ? "btn-secondary" : "btn-primary",
      ),
    ) +
    panel(
      "Gradebook",
      `<div class="table-toolbar"><div class="filter-row"><select data-filter="class" aria-label="Gradebook class">${CLASSES.map((c) => `<option ${c === grade ? "selected" : ""}>${c}</option>`).join("")}</select><select data-filter="subject" aria-label="Gradebook subject">${SUBJECTS.map((s) => `<option ${s === subject ? "selected" : ""}>${s}</option>`).join("")}</select></div>${badge(data.resultsPublished ? "Published to students" : "Draft", data.resultsPublished ? "" : "orange")}</div><form id="marks-form">${table(
        ["LEARNER", "CLASS", "MARKS / 100", "GRADE"],
        students.map((person, index) => {
          const score = result?.scores[person.id] || 0;
          return `<tr><td>${personCell(person, index)}</td><td>${e(person.grade)}</td><td><input class="student-mark" type="number" min="0" max="100" step="1" name="${person.id}" value="${score}" required aria-label="Marks for ${e(person.name)}"></td><td>${badge(score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : "B")}</td></tr>`;
        }),
      )}<div class="form-actions"><button class="btn btn-primary" type="submit">${icon("check")}Save marks</button></div></form>`,
    )
  );
}

export function renderTimetable(data, role, filters) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return (
    heading(
      "Weekly timetable",
      "Class VI A · Sample weekly timetable",
      role === "admin"
        ? actionButton("Edit a period", "edit-period", "edit", "btn-secondary")
        : "",
    ) +
    panel(
      role === "teacher" ? "My teaching week" : "My week at a glance",
      `<div class="table-container"><table class="timetable"><thead><tr><th>TIME</th>${days.map((day) => `<th>${day.toUpperCase()}</th>`).join("")}</tr></thead><tbody>${data.timetable
        .map((row, index) =>
          row[1] === "Break"
            ? `<tr><td>${e(row[0])}</td><td colspan="5" class="break-row">BREAK</td></tr>`
            : `<tr><td>${e(row[0])}</td>${days
                .map((_, day) => {
                  const shifted =
                    day === 0 || day === 4
                      ? row
                      : data.timetable.filter((r) => r[1] !== "Break")[
                          (index + day) % 6
                        ];
                  return `<td><div class="lesson-cell ${index % 3 === 1 ? "blue" : index % 3 === 2 ? "orange" : ""}"><strong>${e(shifted[1])}</strong><small>${e(shifted[3])}</small></div></td>`;
                })
                .join("")}</tr>`,
        )
        .join(
          "",
        )}</tbody></table></div><p class="chart-note">Fictional periods for demonstration. Monday and Friday use the editable period list; other days illustrate rotation.</p>`,
    )
  );
}

export function renderNotices(data, role, filters) {
  const notices = data.notices
    .filter((n) => (role === "student" ? n.audience !== "Teachers" : true))
    .filter((n) => !filters.category || n.category === filters.category)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return (
    heading(
      "School notice board",
      "Keep up with what’s happening around your school.",
      role === "admin" ? actionButton("Write a notice", "add-notice") : "",
    ) +
    `<div class="tabs">${["", "Academic", "Activities", "Office"].map((category) => `<button class="tab" data-notice-category="${category}" ${filters.category === category ? 'style="border-bottom-color:#8da478;color:#6b8258"' : ""}>${category || "All updates"}</button>`).join("")}</div>${notices.map((n) => `<article class="notice-card"><div class="notice-top">${badge(n.category, n.category === "Activities" ? "orange" : n.category === "Office" ? "blue" : "")}${n.pinned ? icon("pin") : ""}</div><h3>${e(n.title)}</h3><p>${e(n.body)}</p><div class="notice-meta"><span>${dateLabel(n.date)} · ${e(n.audience)} · Demo update</span>${role === "admin" ? `<div class="table-actions"><button class="text-button" data-action="pin-notice" data-id="${n.id}">${n.pinned ? "Unpin" : "Pin"}</button><button class="text-button" data-action="edit-notice" data-id="${n.id}">Edit</button></div>` : badge("School office", "neutral")}</div></article>`).join("") || emptyState("No notices in this category.", "There aren’t any updates in this category yet.")}`
  );
}

export function renderLibrary(data, role, filters) {
  const books = data.books.filter((book) =>
    `${book.title} ${book.author}`
      .toLowerCase()
      .includes(filters.search.toLowerCase()),
  );
  return (
    heading(
      role === "admin" ? "School library" : "My library",
      "Find a book, check availability and manage your demo loans.",
      role === "admin" ? actionButton("Add a book", "add-book") : "",
    ) +
    `<div class="table-toolbar"><div class="table-search">${icon("search")}<input data-filter="search" value="${e(filters.search)}" aria-label="Search books" placeholder="Find a title or author"></div>${badge(`${data.books.reduce((sum, b) => sum + b.loans.length, 0)} demo loans`, "blue")}</div><div class="card-grid">${books
      .map((book) => {
        const mine = book.loans.some((loan) => loan.student === STUDENT_ID);
        const available = book.copies - book.loans.length;
        return `<article class="book-card"><div class="book-cover-mini"><b>${e(book.title)}</b><small>${e(book.author)}</small></div><h3>${e(book.title)}</h3><p>${e(book.author)} · ${e(book.category)}</p><div class="card-meta"><span>${available} of ${book.copies} available</span>${badge(mine ? "On my shelf" : available ? "Available" : "All borrowed", mine ? "blue" : available ? "" : "orange")}</div><button class="btn btn-soft" data-action="${role === "admin" ? "book-loans" : mine ? "return-book" : "borrow-book"}" data-id="${book.id}" ${!available && !mine && role !== "admin" ? "disabled" : ""}>${role === "admin" ? "Manage loans" : mine ? "Return in demo" : "Borrow in demo"} </button></article>`;
      })
      .join("")}</div>`
  );
}
export function renderTransport(data, role) {
  const routes =
    role === "admin"
      ? data.routes
      : data.routes.filter((route) => route.students.includes(STUDENT_ID));
  return (
    heading(
      "School transport",
      "Sample routes and stops. No live GPS or driver contact details.",
      role === "admin" ? actionButton("Add route", "add-route") : "",
    ) +
    (routes.length
      ? `<div class="card-grid">${routes.map((route) => `<article class="route-card"><div class="route-map" aria-hidden="true">${icon("bus")}</div><span class="overline" style="margin-bottom:10px">${e(route.vehicle)}</span><h3>${e(route.name)}</h3><p>${e(route.stops)}</p><div class="card-meta"><span>${route.students.length} / ${route.capacity} seats assigned</span>${badge("Demo route")}</div><p style="font-size:9px">${e(route.driver)} · No real contact information</p><button class="btn btn-soft" data-action="${role === "admin" ? "manage-route" : "route-details"}" data-id="${route.id}">${role === "admin" ? "Manage route" : "See my route"} </button></article>`).join("")}</div>`
      : emptyState(
          "No route assigned yet.",
          "The admin can assign this sample student to a route in the transport panel.",
        ))
  );
}
export function renderResources(data) {
  return (
    heading(
      "Learning resources",
      "Read short subject notes or download them for later.",
    ) +
    `<div class="card-grid">${data.resources.map((resource, index) => `<article class="resource-card"><div class="card-top"><span class="subject-symbol ${index % 2 ? "orange" : "blue"}">${icon("file")}</span>${badge(resource.subject, "neutral")}</div><h3>${e(resource.title)}</h3><p>${e(resource.body.slice(0, 100))}…</p><button class="btn btn-soft" data-action="read-resource" data-id="${resource.id}">Read & discover </button></article>`).join("")}</div>`
  );
}
export function renderMessages(data, role) {
  return (
    heading(
      "Class messages",
      role === "student"
        ? "Send a question to your teacher and read their replies."
        : "Keep the classroom conversation going.",
      actionButton("Write a message", "new-message", "inbox"),
    ) +
    panel(
      "Class VI A · Aarav & Nandita",
      data.messages.length
        ? data.messages
            .map(
              (message) =>
                `<article class="message-row ${message.sender}"><span class="avatar">${message.sender === "student" ? "AS" : "NS"}</span><div><small>${message.sender === "student" ? "Aarav Sharma · Student" : "Nandita Sen · Teacher"} · ${dateLabel(message.date)}</small><h3>${e(message.subject)}</h3><p>${e(message.body)}</p></div></article>`,
            )
            .join("")
        : emptyState("New enquiry", "Write your first sample message."),
    )
  );
}
export function renderLeave(data, role) {
  const requests = data.leaveRequests;
  return (
    heading(
      "Staff leave requests",
      "Sample staff leave requests. No actual HR records.",
      role === "teacher"
        ? actionButton("Request leave", "request-leave", "calendar")
        : "",
    ) +
    panel(
      "Leave requests",
      table(
        ["STAFF MEMBER", "FROM", "TO", "REASON", "STATUS", "ACTION"],
        requests.map(
          (request) =>
            `<tr><td>${e(request.name)}</td><td>${dateLabel(request.from)}</td><td>${dateLabel(request.to)}</td><td>${e(request.reason)}</td><td>${badge(request.status, request.status === "Pending" ? "orange" : request.status === "Declined" ? "red" : "")}</td><td>${role === "admin" && request.status === "Pending" ? `<div class="table-actions"><button class="text-button" data-action="approve-leave" data-id="${request.id}">Approve</button><button class="text-button" data-action="decline-leave" data-id="${request.id}">Decline</button></div>` : '<span style="font-size:8px;color:#adb79f">' + (request.status === "Pending" ? "Awaiting admin review" : "Decision recorded") + "</span>"}</td></tr>`,
        ),
      ),
    )
  );
}
export function renderProfile(data) {
  const student = currentStudent(data);
  return (
    heading(
      "Your school identity.",
      "Your sample school profile, all in one place.",
      actionButton(
        "Edit demo profile",
        "edit-profile",
        "edit",
        "btn-secondary",
      ),
    ) +
    `<div class="two-columns">${panel(
      "My school identity",
      `<div class="profile-hero"><span class="avatar">${initials(student.name)}</span><div><h3>${e(student.name)}</h3><p>${e(student.grade)} · ${e(student.admission)}</p></div></div><div class="detail-list">${[
        ["Class", student.grade],
        ["Roll number", student.roll],
        ["House", student.house],
        ["Academic year", data.settings.academicYear],
        ["Enrollment", student.status],
      ]
        .map(
          ([key, value]) => `<div><span>${key}</span><b>${e(value)}</b></div>`,
        )
        .join("")}</div>`,
    )}${panel(
      "A few useful details",
      `<div class="detail-list">${[
        ["Guardian", student.guardian],
        ["Demo email", student.email],
        ["Contact", student.phone],
        ["Joined", dateLabel(student.joined)],
      ]
        .map(
          ([key, value]) => `<div><span>${key}</span><b>${e(value)}</b></div>`,
        )
        .join(
          "",
        )}</div><p class="invoice-note">This is a fictional profile. Please don’t enter private information into a pitch demo.</p>`,
    )}</div>`
  );
}
export function renderSettings(data, role) {
  return (
    heading(
      "Settings",
      "Manage preferences, export your demo data or start again.",
    ) +
    `<div class="settings-list">${panel(role === "admin" ? "Campus preferences" : "Workspace preferences", `<form id="settings-form"><div class="form-grid">${role === "admin" ? `<label>Campus name<input name="schoolName" value="${e(data.settings.schoolName)}" required maxlength="80"></label><label>Academic session<input name="academicYear" value="${e(data.settings.academicYear)}" required maxlength="20"></label><label>Illustrative daily fine (₹)<input name="fineRate" type="number" min="0" max="100" value="${data.settings.fineRate}" required></label>` : ""}<label class="checkbox-field full-width"><input type="checkbox" name="emailUpdates" ${data.settings.emailUpdates ? "checked" : ""}> Show school updates in my demo preferences</label></div><p class="form-note">These preferences apply to this browser only. This toggle does not subscribe you to email or messaging services.</p><button type="submit" class="btn btn-primary">${icon("check")}Save preferences</button></form>`)}<div>${panel("Reset sample records", `<p class="panel-description">Want to try the pitch again? Reset the sample records to their original state. This only affects fictional data in this browser.</p>${actionButton("Reset demo campus", "reset-demo", "settings", "btn-secondary")}`)}${panel("Export your demo data", `<p class="panel-description">Export your current fictional campus records, or switch to another workspace to continue the story.</p>${actionButton("Export demo data", "export-data", "download", "btn-secondary")}<a class="btn btn-soft" style="margin-top:15px" href="portal.html">Choose another workspace </a>`)}</div></div>`
  );
}
