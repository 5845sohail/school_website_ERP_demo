import {
  readStore,
  updateStore,
  resetStore,
  createId,
  logActivity,
  persistentStorageAvailable,
  STUDENT_ID,
  TEACHER_ID,
  CLASSES,
  SUBJECTS,
  DEMO_DATE,
  STORAGE_KEY,
} from "./store.js";
import {
  escapeHtml as e,
  icon,
  initials,
  badge,
  field,
  money,
  dateLabel,
  actionButton,
  downloadFile,
  downloadCsv,
  emptyState,
} from "./ui.js";
import * as views from "./views.js";
import {
  resolveWorkspaceView,
  getWorkspaceIdentity,
} from "./workspace-config.js";

// The URL is the navigation state. It is intentionally not an authentication system.
const selectedRole = new URLSearchParams(location.search).get("role");
const role = selectedRole === "parent" ? "student" : selectedRole;
const app = document.querySelector("#app");
const dialog = document.querySelector("#campus-dialog");
const dialogBody = document.querySelector("#dialog-body");
let activeView = "overview";
let filters = freshFilters();
let toastTimer;
let paymentBusy = false;

function freshFilters() {
  return {
    search: "",
    class: "",
    subject: "",
    date: DEMO_DATE,
    tab: "all",
    status: "",
    category: "",
  };
}
function toast(message) {
  const target = document.querySelector("#toast");
  target.textContent = message;
  target.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => target.classList.remove("visible"), 4800);
}
function openDialog(title, content, options = {}) {
  document.querySelector("#dialog-title").textContent = title;
  dialogBody.innerHTML = content;
  dialog.classList.toggle("wide", Boolean(options.wide));
  if (!dialog.open) dialog.showModal();
}
function formDialog(title, fields, onSave, options = {}) {
  openDialog(
    title,
    `<form id="dialog-form"><div class="form-grid">${fields}</div>${options.note ? `<p class="form-note">${e(options.note)}</p>` : ""}<p class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="btn btn-secondary" data-action="close-dialog">Cancel</button><button type="submit" class="btn btn-primary">${icon("check")}${e(options.submit || "Save changes")}</button></div></form>`,
    options,
  );
  document.querySelector("#dialog-form").onsubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      onSave(values, form);
      dialog.close();
      renderWorkspace();
    } catch (error) {
      form.querySelector(".form-error").textContent =
        error.message || "Please check the form and try again.";
    }
  };
}
function commit(description, change) {
  updateStore((data) => {
    change(data);
    logActivity(data, description);
  });
}
function options(values, current = "") {
  return values
    .map((item) => {
      const [value, label] = Array.isArray(item) ? item : [item, item];
      return `<option value="${e(value)}" ${value === current ? "selected" : ""}>${e(label)}</option>`;
    })
    .join("");
}
function getStudent(data, id = STUDENT_ID) {
  return data.students.find((student) => student.id === id);
}
function totalInvoice(invoice) {
  return invoice.tuition + invoice.activity + invoice.fine;
}
function navigate(view) {
  dialog.close();
  if (location.hash === `#view=${view}`) renderWorkspace();
  else location.hash = `view=${view}`;
}
function pageFromUrl() {
  return resolveWorkspaceView(role, location.hash);
}

function renderShell() {
  const data = readStore();
  const learner = views.currentStudent(data);
  const identity = getWorkspaceIdentity(role, data);
  app.innerHTML = `<div class="demo-ribbon"><span><b>INTERACTIVE DEMO</b>Fictional records · Saved in this browser · No live payments or messages</span><a href="index.html">School website </a></div><div class="app-shell"><button class="sidebar-scrim" aria-label="Close navigation"></button><aside class="sidebar"><a class="sidebar-brand" href="index.html"><img src="assets/school-crest.svg" alt="Your School crest"><span><b>${e(data.settings.schoolName)}</b><small>DIGITAL CAMPUS</small></span></a><div class="workspace-label">${icon(role === "admin" ? "shield" : role === "teacher" ? "book" : "leaf")}<div><b>${views.roleNames[role]} workspace</b><span>School information, in one place.</span></div></div><p class="nav-label">YOUR WORKSPACE</p><nav aria-label="${views.roleNames[role]} navigation" id="workspace-nav"></nav><div class="sidebar-bottom"><div class="sidebar-help">${icon("help")}<h3>Need a hand?</h3><p>Follow the demo from an assignment to a student submission.</p><button data-action="demo-guide">Open demo guide </button></div><a class="sidebar-exit" href="portal.html">${icon("logout")}Switch workspace</a></div></aside><div class="app-main"><header class="app-header"><button class="icon-button mobile-menu-button" aria-label="Open workspace navigation" aria-expanded="false" aria-controls="workspace-nav">${icon("menu")}</button><div class="breadcrumb">${icon("dashboard")}<span>Digital campus</span><span>/</span><b id="breadcrumb-current">Overview</b></div><div class="top-actions"><form class="global-search" id="global-search">${icon("search")}<input type="search" name="query" aria-label="Search campus" placeholder="Search your campus…"><span class="search-shortcut">↵</span></form><span class="header-separator"></span><button class="icon-button notification-button" aria-label="Open notifications" data-action="notifications">${icon("bell")}</button><div class="profile-menu"><span class="avatar">${initials(identity)}</span><div><b>${e(identity)}</b><small>${views.roleNames[role]} · Demo session</small></div></div><a href="portal.html" class="switch-button">Switch </a></div></header><main id="workspace" class="workspace"></main><footer class="app-footer"><span>YOUR SCHOOL DIGITAL CAMPUS · MADE WITH CARE BY ZIGACODE</span><span id="storage-status">${persistentStorageAvailable ? "Demo changes saved in this browser" : "Session-only mode · Browser storage unavailable"}</span></footer></div></div>`;
  document.querySelector(".mobile-menu-button").onclick = () =>
    toggleSidebar(true);
  document.querySelector(".sidebar-scrim").onclick = () => toggleSidebar(false);
  toggleSidebar(false);
  document.querySelector("#global-search").onsubmit = (event) => {
    event.preventDefault();
    showSearch(new FormData(event.target).get("query"));
  };
}
function toggleSidebar(open) {
  const sidebar = document.querySelector(".sidebar");
  const trigger = document.querySelector(".mobile-menu-button");
  const isMobile = matchMedia("(max-width: 700px)").matches;
  const visible = isMobile && open;
  sidebar?.classList.toggle("open", visible);
  document.body.classList.toggle("workspace-menu-open", visible);
  document
    .querySelector(".sidebar-scrim")
    ?.classList.toggle("visible", visible);
  trigger?.setAttribute("aria-expanded", String(visible));
  if (sidebar) {
    const focusWasInMenu = sidebar.contains(document.activeElement);
    sidebar.inert = isMobile && !visible;
    if (visible) sidebar.querySelector("a")?.focus();
    else if (focusWasInMenu && isMobile) trigger?.focus();
  }
}
matchMedia("(max-width: 700px)").addEventListener("change", () =>
  toggleSidebar(false),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") toggleSidebar(false);
});

const renderers = {
  overview: views.renderOverview,
  students: views.renderStudents,
  staff: views.renderStaff,
  admissions: views.renderAdmissions,
  classes: views.renderClasses,
  attendance: views.renderAttendance,
  assignments: views.renderAssignments,
  fees: views.renderFees,
  results: views.renderResults,
  timetable: views.renderTimetable,
  notices: views.renderNotices,
  library: views.renderLibrary,
  transport: views.renderTransport,
  resources: views.renderResources,
  messages: views.renderMessages,
  leave: views.renderLeave,
  profile: views.renderProfile,
  settings: views.renderSettings,
};
function renderWorkspace() {
  if (!views.navigation[role]) return;
  const data = readStore();
  activeView = pageFromUrl();
  const navigation = views.navigation[role];
  const pageName = navigation.find(([id]) => id === activeView)[2];
  document.title = `${pageName} · ${views.roleNames[role]} · Your School`;
  document.querySelector("#breadcrumb-current").textContent = pageName;
  document.querySelector("#workspace-nav").innerHTML = navigation
    .map(
      ([id, symbol, title]) =>
        `<a href="#view=${id}" class="nav-link ${id === activeView ? "active" : ""}" ${id === activeView ? 'aria-current="page"' : ""}>${icon(symbol)}${title}${id === "admissions" ? `<span class="nav-count">${data.enquiries.length}</span>` : ""}</a>`,
    )
    .join("");
  const target = document.querySelector("#workspace");
  // Every screen receives the same three arguments.
  target.innerHTML = renderers[activeView](data, role, filters);
  bindWorkspaceForms();
  const fineInput = document.querySelector("#fine-days");
  if (fineInput)
    fineInput.oninput = () => {
      const days = Math.max(0, Math.min(365, Number(fineInput.value) || 0));
      document.querySelector("#fine-value").textContent = money(
        days * data.settings.fineRate,
      );
    };
  document.querySelector("#storage-status").textContent =
    persistentStorageAvailable
      ? "Demo changes saved in this browser"
      : "Session-only mode · Refresh clears changes";
}

function bindWorkspaceForms() {
  const marksForm = document.querySelector("#marks-form");
  if (marksForm)
    marksForm.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(marksForm));
      const subject = filters.subject || "Science";
      commit(`Marks updated for ${subject}`, (data) => {
        const result = data.results.find((row) => row.subject === subject);
        for (const [id, value] of Object.entries(values))
          result.scores[id] = Number(value);
      });
      renderWorkspace();
      toast("Marks saved. Published results are now updated for students.");
    };
  const settingsForm = document.querySelector("#settings-form");
  if (settingsForm)
    settingsForm.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(settingsForm));
      commit("Workspace preferences updated", (data) => {
        if (role === "admin") {
          data.settings.schoolName = values.schoolName.trim();
          data.settings.academicYear = values.academicYear.trim();
          data.settings.fineRate = Number(values.fineRate);
        }
        data.settings.emailUpdates = Boolean(values.emailUpdates);
      });
      renderShell();
      renderWorkspace();
      toast("Preferences saved in this browser.");
    };
}

// Keep search fields focused while the filtered list is redrawn.
function updateFilter(element) {
  const name = element.dataset.filter;
  filters[name] = element.value;
  const position = element.selectionStart;
  renderWorkspace();
  const replacement = document.querySelector(`[data-filter="${name}"]`);
  replacement?.focus();
  if (position !== null && replacement?.type === "text")
    replacement.setSelectionRange(position, position);
}
document.addEventListener("input", (event) => {
  if (event.target.matches('input[data-filter="search"]'))
    updateFilter(event.target);
});
document.addEventListener("change", (event) => {
  const element = event.target;
  if (element.dataset.filter) updateFilter(element);
  if (element.dataset.attendance) {
    const key = `${filters.class || "VI A"}|${filters.date || DEMO_DATE}`;
    updateStore((data) => {
      if (!data.attendance[key])
        data.attendance[key] = { finalized: false, records: {} };
      if (!data.attendance[key].finalized)
        data.attendance[key].records[element.dataset.attendance] =
          element.value;
    });
  }
});
document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    filters.tab = tab.dataset.tab;
    renderWorkspace();
  }
  const category = event.target.closest("[data-notice-category]");
  if (category) {
    filters.category = category.dataset.noticeCategory;
    renderWorkspace();
  }
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = actions[button.dataset.action];
  if (action) {
    try {
      action(button.dataset.id, button);
    } catch (error) {
      toast(error.message || "Please try that again.");
    }
  }
});
document.querySelector(".dialog-close").onclick = () => dialog.close();
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
window.addEventListener("hashchange", () => {
  dialog.close();
  filters = freshFilters();
  toggleSidebar(false);
  renderWorkspace();
  window.scrollTo({ top: 0, behavior: "instant" });
});
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && !dialog.open) renderWorkspace();
});

function showSearch(query = "") {
  query = String(query).trim().toLowerCase();
  if (!query) {
    toast("Type a name, task or notice to search.");
    return;
  }
  const data = readStore();
  const students =
    role === "admin"
      ? data.students.filter((s) => s.name.toLowerCase().includes(query))
      : [];
  const tasks = views
    .visibleAssignments(data, role)
    .filter((task) =>
      `${task.title} ${task.subject}`.toLowerCase().includes(query),
    );
  const notices = data.notices.filter(
    (n) =>
      `${n.title} ${n.body}`.toLowerCase().includes(query) &&
      (role !== "student" || n.audience !== "Teachers"),
  );
  const items = [
    ...students.map(
      (s) =>
        `<button class="quick-action" data-action="student-profile" data-id="${s.id}">${icon("people")}<b>${e(s.name)}</b><small>${e(s.grade)} · Student</small></button>`,
    ),
    ...tasks.map(
      (task) =>
        `<button class="quick-action" data-action="assignment-detail" data-id="${task.id}">${icon("book")}<b>${e(task.title)}</b><small>${e(task.subject)} · Assignment</small></button>`,
    ),
    ...notices.map(
      (n) =>
        `<button class="quick-action" data-action="open-notice" data-id="${n.id}">${icon("notice")}<b>${e(n.title)}</b><small>School notice</small></button>`,
    ),
  ];
  openDialog(
    "Search results",
    items.length
      ? `<p class="form-note">${items.length} results for “${e(query)}”</p><div class="quick-actions">${items.join("")}</div>`
      : emptyState(
          "No results found.",
          "Try “Science”, “Aarav” or a word from a school notice.",
        ),
  );
}

function studentForm(id) {
  const data = readStore();
  const person = id ? getStudent(data, id) : {};
  formDialog(
    id ? "Edit student" : "Add a student",
    field("Full name", "name", person.name || "") +
      field("Class", "grade", person.grade || "VI A", { options: CLASSES }) +
      field(
        "Roll number",
        "roll",
        person.roll ||
          data.students.filter((s) => s.grade === "VI A").length + 1,
        { type: "number", min: 1, max: 100 },
      ) +
      field("House", "house", person.house || "Ashoka", {
        options: ["Ashoka", "Tagore"],
      }) +
      field("Guardian name", "guardian", person.guardian || "") +
      field("Demo email", "email", person.email || "", { type: "email" }) +
      field("Status", "status", person.status || "Active", {
        options: ["Active", "Inactive"],
      }) +
      field("Gender", "gender", person.gender || "Female", {
        options: ["Female", "Male", "Prefer not to say"],
      }),
    (values) => {
      if (!values.name.trim() || !values.guardian.trim())
        throw Error("Please add a name and guardian.");
      const roster = readStore().students;
      if (
        roster.some(
          (student) =>
            student.id !== id &&
            student.grade === values.grade &&
            student.roll === Number(values.roll),
        )
      )
        throw Error(
          "That roll number is already used in this class. Choose a different one.",
        );
      commit(
        id
          ? "A student profile was updated"
          : "A new learner joined the sample campus",
        (current) => {
          const clean = {
            ...values,
            name: values.name.trim(),
            roll: Number(values.roll),
          };
          if (id) Object.assign(getStudent(current, id), clean);
          else
            current.students.push({
              ...clean,
              id: createId("S"),
              admission: `SCH-DEMO-${current.students.length + 1}`,
              phone: "Demo contact",
              joined: DEMO_DATE,
            });
        },
      );
      toast(
        id
          ? "Student profile updated."
          : "A new learner is ready in the student directory.",
      );
    },
    {
      note: "Use fictional details only. This is a browser-based demonstration.",
      submit: id ? "Save profile" : "Add student",
    },
  );
}
function studentProfile(id) {
  const data = readStore(),
    person = getStudent(data, id);
  if (!person) throw Error("That sample student could not be found.");
  openDialog(
    "Student details",
    `<div class="profile-hero"><span class="avatar">${initials(person.name)}</span><div><h3>${e(person.name)}</h3><p>${e(person.grade)} · ${e(person.admission)}</p></div></div><div class="detail-list">${[
      ["Roll number", person.roll],
      ["House", person.house],
      ["Guardian", person.guardian],
      ["Demo email", person.email],
      ["Enrollment", person.status],
    ]
      .map(
        ([label, value]) =>
          `<div><span>${label}</span><b>${e(value)}</b></div>`,
      )
      .join(
        "",
      )}</div><div class="form-actions">${actionButton("Edit profile", "edit-student", "edit", "btn-primary", `data-id="${person.id}"`)}</div>`,
  );
}
function staffForm(id) {
  const person = readStore().staff.find((item) => item.id === id) || {};
  formDialog(
    id ? "Update a teacher’s profile." : "Add a teacher",
    field("Full name", "name", person.name || "") +
      field("Subject", "subject", person.subject || "Science", {
        options: SUBJECTS,
      }) +
      field("Class teacher", "classTeacher", person.classTeacher || "VI A", {
        options: CLASSES,
      }) +
      field("Demo email", "email", person.email || "", { type: "email" }),
    (values) => {
      if (!values.name.trim()) throw Error("Please add a teacher name.");
      commit(
        id ? "Teacher profile updated" : "A teacher joined the sample team",
        (data) => {
          if (id)
            Object.assign(
              data.staff.find((p) => p.id === id),
              values,
            );
          else
            data.staff.push({ ...values, id: createId("T"), status: "Active" });
        },
      );
      toast("Teaching team updated.");
    },
    { note: "Fictional staff records only." },
  );
}
function enquiryForm() {
  formDialog(
    "New enquiry",
    field("Family / guardian name", "name") +
      field("Interested class", "grade", "VI A", { options: CLASSES }) +
      field("Demo email", "email", "family@example.com", { type: "email" }) +
      field("Demo contact", "phone", "Demo contact") +
      field("What would they like to know?", "message", "", {
        multiline: true,
      }),
    (values) => {
      commit("A new admission enquiry was added", (data) =>
        data.enquiries.unshift({
          ...values,
          id: createId("E"),
          stage: "New enquiry",
          date: DEMO_DATE,
        }),
      );
      toast("Sample enquiry added to the admissions board.");
    },
    { submit: "Add enquiry" },
  );
}
function assignmentForm(id) {
  const task = readStore().assignments.find((item) => item.id === id) || {};
  formDialog(
    id ? "Edit assignment" : "Create an assignment",
    field("Assignment title", "title", task.title || "") +
      field("Subject", "subject", task.subject || "Science", {
        options: SUBJECTS,
      }) +
      field("Class", "grade", task.grade || "VI A", { options: CLASSES }) +
      field("Due date", "due", task.due || "2026-11-05", { type: "date" }) +
      field("Instructions", "instructions", task.instructions || "", {
        multiline: true,
      }) +
      field(
        "Visibility",
        "visibility",
        task.published === false ? "Draft" : "Published",
        { options: ["Published", "Draft"] },
      ),
    (values) => {
      if (!values.title.trim() || !values.instructions.trim())
        throw Error("Enter an assignment title and instructions.");
      commit(
        id ? "An assignment was updated" : "A new assignment was shared",
        (data) => {
          const clean = {
            title: values.title.trim(),
            subject: values.subject,
            grade: values.grade,
            due: values.due,
            instructions: values.instructions,
            published: values.visibility === "Published",
          };
          if (id)
            Object.assign(
              data.assignments.find((a) => a.id === id),
              clean,
            );
          else
            data.assignments.unshift({
              ...clean,
              id: createId("A"),
              teacher: TEACHER_ID,
              submissions: {},
            });
        },
      );
      toast(
        values.visibility === "Published"
          ? "Assignment published. Students in this class can open it."
          : "Assignment saved as a draft.",
      );
    },
    { submit: id ? "Save assignment" : "Create assignment" },
  );
}
function assignmentDetail(id) {
  const data = readStore(),
    task = data.assignments.find((item) => item.id === id);
  if (!task) throw Error("That assignment could not be found.");
  const submission = task.submissions[STUDENT_ID];
  const description = `<div style="display:flex;gap:10px;margin-bottom:20px">${badge(task.subject, "blue")}${badge(task.grade, "neutral")}${badge("Due " + dateLabel(task.due), "orange")}</div><p class="resource-body">${e(task.instructions)}</p>`;
  if (role === "student") {
    openDialog(
      task.title,
      description +
        (submission
          ? `<div class="panel" style="background:#f7f9f1"><span class="overline">YOUR WORK · ${dateLabel(submission.date)}</span><p style="white-space:pre-wrap;font-size:12px;margin-top:15px;color:#7c8e6c">${e(submission.text)}</p>${submission.fileName ? `<p class="form-note">Attachment label: ${e(submission.fileName)} · Filename only, no file uploaded</p>` : ""}</div>${submission.reviewed ? `<div class="invoice-note"><b>Teacher feedback · ${submission.score}/10</b><p style="margin-top:8px">${e(submission.feedback)}</p></div>` : '<p class="invoice-note">Your sample work is submitted and waiting for teacher feedback.</p>'}`
          : `<form id="submission-form"><label>Your response<textarea name="text" rows="6" required maxlength="3000" placeholder="Share what you discovered…"></textarea></label><label style="margin-top:18px">Optional attachment filename<input name="fileName" placeholder="e.g. leaf-observation.pdf (label only)" maxlength="100"></label><p class="form-note">Write a sample answer. No files leave your device; only the text and optional filename label are saved in this demo.</p><div class="form-actions"><button class="btn btn-primary" type="submit">${icon("check")}Submit my work</button></div><p class="form-error" role="alert"></p></form>`),
    );
    const form = document.querySelector("#submission-form");
    if (form)
      form.onsubmit = (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        if (!values.text.trim()) {
          form.querySelector(".form-error").textContent =
            "Enter your response before submitting.";
          return;
        }
        commit(
          "Aarav submitted an assignment",
          (current) =>
            (current.assignments.find((a) => a.id === id).submissions[
              STUDENT_ID
            ] = {
              text: values.text,
              fileName: values.fileName,
              date: DEMO_DATE,
              reviewed: false,
            }),
        );
        dialog.close();
        renderWorkspace();
        toast("Work submitted. The teacher can now review it.");
      };
  } else {
    const submissions = Object.entries(task.submissions);
    openDialog(
      task.title,
      description +
        (submissions.length
          ? `<h3 style="font-size:14px;margin-bottom:18px">Student submissions</h3>${submissions.map(([studentId, work]) => `<article class="notice-card"><div class="person"><span class="avatar">${initials(getStudent(data, studentId)?.name || "Student")}</span><div><strong>${e(getStudent(data, studentId)?.name || "Sample student")}</strong><small>${dateLabel(work.date)}</small></div></div><p style="margin-top:15px">${e(work.text)}</p>${work.fileName ? `<p class="form-note">Attachment label: ${e(work.fileName)}</p>` : ""}<div class="notice-meta">${badge(work.reviewed ? `Reviewed · ${work.score}/10` : "Waiting for review", work.reviewed ? "" : "orange")}<button class="text-button" data-action="review-submission" data-id="${task.id}|${studentId}">${work.reviewed ? "Update feedback" : "Review work"} </button></div></article>`).join("")}`
          : emptyState(
              "No work submitted yet.",
              "To try the review flow, open this assignment in the Student panel and submit a response.",
            )),
    );
  }
}
function reviewSubmission(compositeId) {
  const [taskId, studentId] = compositeId.split("|");
  const data = readStore(),
    work = data.assignments.find((a) => a.id === taskId).submissions[studentId];
  formDialog(
    "Review student work",
    field("Score out of 10", "score", work.score ?? 8, {
      type: "number",
      min: 0,
      max: 10,
      step: 1,
    }) +
      field("Feedback for the learner", "feedback", work.feedback || "", {
        multiline: true,
      }),
    (values) => {
      commit("Assignment feedback was shared", (current) =>
        Object.assign(
          current.assignments.find((a) => a.id === taskId).submissions[
            studentId
          ],
          {
            score: Number(values.score),
            feedback: values.feedback,
            reviewed: true,
          },
        ),
      );
      toast("Feedback saved. The student can see it on their assignment.");
    },
    { submit: "Share feedback" },
  );
}

function invoiceDetail(id) {
  const data = readStore(),
    invoice = data.invoices.find((item) => item.id === id);
  if (!invoice) throw Error("That invoice could not be found.");
  if (invoice.paid) {
    showReceipt(invoice, data);
    return;
  }
  const person = getStudent(data, invoice.student);
  openDialog(
    "Invoice details",
    `<div style="display:flex;justify-content:space-between">${badge(invoice.id, "neutral")}${badge("Sample invoice", "orange")}</div><div class="fee-number">${money(totalInvoice(invoice))}</div><p style="font-size:11px">${e(person?.name)} · ${e(person?.grade)} · ${e(invoice.month)}</p><div class="detail-list" style="margin-top:20px"><div><span>Tuition fee</span><b>${money(invoice.tuition)}</b></div><div><span>Activity fee</span><b>${money(invoice.activity)}</b></div><div><span>Illustrative fine</span><b>${money(invoice.fine)}</b></div><div><span>Due date</span><b>${dateLabel(invoice.due)}</b></div><div class="invoice-total"><span>Total</span><b>${money(totalInvoice(invoice))}</b></div></div><p class="invoice-note">This is a simulation. No money will move, no gateway will open, and no card or bank details are requested.</p><div class="form-actions">${actionButton("Simulate payment", "simulate-payment", "check", "btn-primary", `data-id="${invoice.id}"`)}</div>`,
  );
}
function showReceipt(invoice, data = readStore()) {
  const person = getStudent(data, invoice.student);
  openDialog(
    "Payment receipt",
    `<div class="success-receipt"><div class="payment-check">${icon("check")}</div><h3>Payment simulated.</h3><p>The invoice has been marked paid in this demo. No money was collected.</p><div class="detail-list"><div><span>Sample student</span><b>${e(person?.name)}</b></div><div><span>Invoice</span><b>${e(invoice.id)}</b></div><div><span>Demo receipt</span><b>${e(invoice.receipt)}</b></div><div><span>Simulated amount</span><b>${money(totalInvoice(invoice))}</b></div></div><p class="invoice-note">DEMO RECEIPT · NOT AN OFFICIAL RECEIPT. No payment was processed.</p><div class="form-actions">${actionButton("Download demo receipt", "download-receipt", "download", "btn-secondary", `data-id="${invoice.id}"`)}<button class="btn btn-primary" data-action="close-dialog">Done</button></div></div>`,
  );
}
function noticeForm(id) {
  const notice = readStore().notices.find((n) => n.id === id) || {};
  formDialog(
    id ? "Edit notice" : "Write a school notice",
    field("Notice title", "title", notice.title || "") +
      field("Category", "category", notice.category || "Academic", {
        options: ["Academic", "Activities", "Office"],
      }) +
      field("Audience", "audience", notice.audience || "Everyone", {
        options: ["Everyone", "Students", "Teachers"],
      }) +
      field("Message", "body", notice.body || "", { multiline: true }),
    (values) => {
      if (!values.title.trim() || !values.body.trim())
        throw Error("Please add a title and message.");
      commit(
        id
          ? "A school notice was updated"
          : "A new school notice was published",
        (data) => {
          if (id)
            Object.assign(
              data.notices.find((n) => n.id === id),
              values,
            );
          else
            data.notices.unshift({
              ...values,
              id: createId("N"),
              date: DEMO_DATE,
              pinned: false,
            });
        },
      );
      toast("Notice saved. It appears for the selected audience.");
    },
    { submit: "Publish notice" },
  );
}
function routeForm(id) {
  const data = readStore(),
    route = data.routes.find((r) => r.id === id);
  if (route) {
    formDialog(
      "Edit transport route",
      field("Route name", "name", route.name) +
        field("Vehicle label", "vehicle", route.vehicle) +
        field("Driver label", "driver", route.driver) +
        field("Capacity", "capacity", route.capacity, {
          type: "number",
          min: 1,
          max: 80,
        }) +
        field("Stops", "stops", route.stops, { multiline: true }) +
        `<div class="full-width"><span class="overline" style="margin-bottom:15px">ASSIGN SAMPLE LEARNERS</span>${data.students.map((student) => `<label class="checkbox-field" style="padding:7px 0"><input type="checkbox" name="students" value="${student.id}" ${route.students.includes(student.id) ? "checked" : ""}>${e(student.name)} · ${e(student.grade)}</label>`).join("")}</div>`,
      (values, form) => {
        const ids = new FormData(form).getAll("students");
        if (ids.length > Number(values.capacity))
          throw Error("The selected learners exceed the route capacity.");
        commit("Transport route updated", (current) => {
          current.routes.forEach((r) => {
            if (r.id !== id)
              r.students = r.students.filter(
                (studentId) => !ids.includes(studentId),
              );
          });
          Object.assign(
            current.routes.find((r) => r.id === id),
            {
              name: values.name,
              vehicle: values.vehicle,
              driver: values.driver,
              capacity: Number(values.capacity),
              stops: values.stops,
              students: ids,
            },
          );
        });
        toast("Route saved. Student transport views are now updated.");
      },
      {
        wide: true,
        note: "Assigning a learner here moves them from any other sample route.",
      },
    );
  } else {
    formDialog(
      "Add a transport route",
      field("Route name", "name") +
        field("Vehicle label", "vehicle", "DEMO BUS 03") +
        field("Driver label", "driver", "Demo driver") +
        field("Capacity", "capacity", 30, { type: "number", min: 1, max: 80 }) +
        field("Stops", "stops", "School gate  Sample stop", {
          multiline: true,
        }),
      (values) => {
        commit("A sample transport route was added", (current) =>
          current.routes.push({
            ...values,
            id: createId("R"),
            capacity: Number(values.capacity),
            students: [],
          }),
        );
        toast("Route created. Open Manage route to assign learners.");
      },
      { submit: "Create route" },
    );
  }
}
function bookLoans(id) {
  const data = readStore(),
    book = data.books.find((b) => b.id === id);
  openDialog(
    `Manage book loans`,
    `${badge(book.category, "blue")}<h3 style="font-size:20px;margin:15px 0">${e(book.title)}</h3><p class="form-note">${book.copies - book.loans.length} of ${book.copies} copies available.</p>${book.loans.map((loan) => `<div class="detail-list"><div><span>${e(getStudent(data, loan.student)?.name)}</span><button class="text-button" data-action="admin-return-book" data-id="${book.id}|${loan.student}">Return in demo</button></div></div>`).join("") || '<p class="form-note">No sample loans yet.</p>'}<form id="loan-form" style="margin-top:25px"><label>Issue to a learner<select name="student">${options(data.students.filter((s) => !book.loans.some((l) => l.student === s.id)).map((s) => [s.id, `${s.name} · ${s.grade}`]))}</select></label><div class="form-actions"><button class="btn btn-primary" ${book.loans.length >= book.copies ? "disabled" : ""}>${icon("book")}Issue book</button></div></form>`,
  );
  document.querySelector("#loan-form").onsubmit = (event) => {
    event.preventDefault();
    const idStudent = new FormData(event.target).get("student");
    if (!idStudent) {
      toast("No eligible learner selected.");
      return;
    }
    commit("A library book was issued", (current) =>
      current.books
        .find((b) => b.id === id)
        .loans.push({ student: idStudent, due: "2026-11-07" }),
    );
    dialog.close();
    renderWorkspace();
    toast("Book issued in demo.");
  };
}

const actions = {
  "close-dialog": () => dialog.close(),
  "demo-guide": () =>
    openDialog(
      "How to try the demo",
      `<div class="notice-card"><span class="overline">01 · TRY TEACHER</span><h3>Create an assignment.</h3><p>Open Assignments, create a published Science task for VI A, then switch to Student.</p></div><div class="notice-card"><span class="overline">02 · TRY STUDENT</span><h3>Submit the assignment.</h3><p>Open the new task and submit a sample response. Simulate a fee payment or borrow a library book.</p></div><div class="notice-card"><span class="overline">03 · TRY ADMIN</span><h3>Check the shared records.</h3><p>The fee ledger and library loans now reflect those actions. Add a student, move an enquiry, or approve a leave request.</p></div><p class="form-note">Switch roles using “Switch” in the header. Changes stay in this browser. Settings  Reset demo gives you a fresh start.</p><a class="btn btn-primary" href="portal.html">Choose a workspace </a>`,
    ),
  notifications: () => {
    const data = readStore();
    openDialog(
      "School notifications",
      data.notices
        .filter((n) => role !== "student" || n.audience !== "Teachers")
        .slice(0, 4)
        .map(
          (n) =>
            `<article class="notice-card"><span class="overline">${e(n.category)} · ${dateLabel(n.date)}</span><h3>${e(n.title)}</h3><p>${e(n.body)}</p></article>`,
        )
        .join(""),
    );
  },
  "add-student": () => studentForm(),
  "edit-student": studentForm,
  "student-profile": studentProfile,
  "export-students": () => {
    const data = readStore();
    downloadCsv("school-demo-students.csv", [
      ["DEMO RECORDS ONLY"],
      ["Admission", "Name", "Class", "Roll", "House", "Status"],
      ...data.students.map((s) => [
        s.admission,
        s.name,
        s.grade,
        s.roll,
        s.house,
        s.status,
      ]),
    ]);
    toast("Sample student directory exported.");
  },
  "add-staff": () => staffForm(),
  "edit-staff": staffForm,
  "add-enquiry": enquiryForm,
  "enquiry-details": (id) => {
    const enquiry = readStore().enquiries.find((item) => item.id === id);
    openDialog(
      "Enquiry details",
      `<div class="profile-hero"><span class="avatar">${initials(enquiry.name)}</span><div><h3>${e(enquiry.name)}</h3><p>${e(enquiry.grade)} · ${e(enquiry.stage)}</p></div></div><p class="resource-body">${e(enquiry.message)}</p><div class="detail-list"><div><span>Demo email</span><b>${e(enquiry.email)}</b></div><div><span>Demo contact</span><b>${e(enquiry.phone)}</b></div><div><span>Enquiry date</span><b>${dateLabel(enquiry.date)}</b></div>${enquiry.visit ? `<div><span>Sample visit</span><b>${e(enquiry.visit.replace("T", " · "))}</b></div>` : ""}</div>`,
    );
  },
  "move-enquiry": (id) => {
    const enquiry = readStore().enquiries.find((item) => item.id === id);
    if (enquiry.stage === "Contacted") {
      formDialog(
        "Schedule a campus visit",
        field("Sample visit date & time", "visit", "2026-11-05T10:00", {
          type: "datetime-local",
        }),
        (values) => {
          commit("A sample campus visit was scheduled", (data) =>
            Object.assign(
              data.enquiries.find((item) => item.id === id),
              { stage: "Visit scheduled", visit: values.visit },
            ),
          );
          toast("Visit scheduled in demo. No invitation was sent.");
        },
        { submit: "Schedule demo visit" },
      );
      return;
    }
    const next = { "New enquiry": "Contacted", "Visit scheduled": "Applied" }[
      enquiry.stage
    ];
    if (next) {
      commit(
        `Admission enquiry moved to ${next}`,
        (data) => (data.enquiries.find((item) => item.id === id).stage = next),
      );
      renderWorkspace();
      toast(`Enquiry moved to ${next}.`);
    }
  },
  "class-roster": (grade) => {
    const data = readStore();
    openDialog(
      `Class roster · ${grade}`,
      data.students
        .filter((s) => s.grade === grade)
        .map(
          (student, index) =>
            `<div class="activity-item">${views.personCell(student, index)}</div>`,
        )
        .join("") +
        `<div class="form-actions"><button class="btn btn-primary" data-action="go-attendance" data-id="${e(grade)}">${icon("check")}Take attendance</button></div>`,
    );
  },
  "go-attendance": (grade) => {
    navigate("attendance");
    setTimeout(() => {
      filters.class = grade;
      renderWorkspace();
    }, 0);
  },
  "all-present": () => {
    const grade = filters.class || "VI A",
      key = `${grade}|${filters.date || DEMO_DATE}`;
    updateStore((data) => {
      if (data.attendance[key]?.finalized) return;
      data.attendance[key] = {
        finalized: false,
        records: Object.fromEntries(
          data.students
            .filter((s) => s.grade === grade && s.status === "Active")
            .map((s) => [s.id, "Present"]),
        ),
      };
    });
    renderWorkspace();
    toast("Everyone marked present in this draft.");
  },
  "finalize-attendance": () => {
    const data = readStore(),
      grade = filters.class || "VI A",
      key = `${grade}|${filters.date || DEMO_DATE}`;
    const session = data.attendance[key] || { records: {} };
    const learners = data.students.filter(
      (s) => s.grade === grade && s.status === "Active",
    );
    if (!learners.length)
      throw Error("There are no active learners in this class.");
    if (
      learners.some(
        (s) => !session.records[s.id] || session.records[s.id] === "Not marked",
      )
    )
      throw Error("Please mark every learner before finalizing.");
    const absent = learners.filter(
      (s) => session.records[s.id] === "Absent",
    ).length;
    commit(`Attendance finalized for ${grade}`, (current) => {
      current.attendance[key].finalized = true;
      current.attendance[key].alertCount = absent;
    });
    renderWorkspace();
    toast(
      `Attendance finalized. ${absent} absence alert${absent === 1 ? "" : "s"} simulated. No messages sent.`,
    );
  },
  "reopen-attendance": () => {
    const key = `${filters.class || "VI A"}|${filters.date || DEMO_DATE}`;
    formDialog(
      "Correct attendance",
      field("Reason for correction", "reason", "", { multiline: true }),
      (values) => {
        if (!values.reason.trim())
          throw Error("Please explain the correction.");
        commit(
          "A finalized attendance session was reopened with a reason",
          (data) => {
            data.attendance[key].finalized = false;
            data.attendance[key].correctionReason = values.reason;
          },
        );
        toast("Attendance reopened. Make your correction and finalize again.");
      },
      { submit: "Reopen session" },
    );
  },
  "add-assignment": () => assignmentForm(),
  "edit-assignment": assignmentForm,
  "assignment-detail": assignmentDetail,
  "review-submission": reviewSubmission,
  "invoice-detail": invoiceDetail,
  "simulate-payment": (id, button) => {
    if (paymentBusy || readStore().invoices.find((i) => i.id === id)?.paid)
      return;
    paymentBusy = true;
    button.disabled = true;
    button.textContent = "Simulating payment…";
    setTimeout(() => {
      commit("A sample fee payment was completed", (data) => {
        const invoice = data.invoices.find((i) => i.id === id);
        if (!invoice.paid) {
          invoice.paid = true;
          invoice.receipt = `DEMO-${createId("R")}`;
          invoice.paidOn = DEMO_DATE;
        }
      });
      paymentBusy = false;
      renderWorkspace();
      showReceipt(readStore().invoices.find((i) => i.id === id));
      toast("Payment simulated. No money moved.");
    }, 700);
  },
  "download-receipt": (id) => {
    const data = readStore(),
      invoice = data.invoices.find((i) => i.id === id),
      person = getStudent(data, invoice.student);
    downloadFile(
      `${invoice.id}-DEMO-receipt.txt`,
      `Your School — DEMO RECEIPT\nNOT VALID AS A FINANCIAL RECEIPT\n\nStudent: ${person.name}\nClass: ${person.grade}\nInvoice: ${invoice.id}\nReceipt: ${invoice.receipt}\nSimulated amount: ${money(totalInvoice(invoice))}\n\nNo money was collected. Fictional data for a frontend demonstration.`,
    );
    toast("Demo receipt downloaded.");
  },
  "add-invoice": () => {
    const data = readStore();
    formDialog(
      "Create an invoice",
      `<label>Student<select name="student">${options(data.students.map((s) => [s.id, `${s.name} · ${s.grade}`]))}</select></label>` +
        field("Invoice period", "month", "December 2026") +
        field("Tuition fee (₹)", "tuition", 2500, {
          type: "number",
          min: 0,
          max: 100000,
        }) +
        field("Activity fee (₹)", "activity", 500, {
          type: "number",
          min: 0,
          max: 100000,
        }) +
        field("Due date", "due", "2026-12-10", { type: "date" }),
      (values) => {
        commit("A sample invoice was created", (current) =>
          current.invoices.unshift({
            ...values,
            id: createId("INV"),
            tuition: Number(values.tuition),
            activity: Number(values.activity),
            fine: 0,
            paid: false,
            receipt: null,
          }),
        );
        toast("Sample invoice created.");
      },
      { submit: "Create demo invoice" },
    );
  },
  "export-fees": () => {
    const data = readStore();
    downloadCsv("school-demo-fee-ledger.csv", [
      ["DEMO LEDGER — NO ACTUAL PAYMENTS"],
      ["Invoice", "Student", "Due date", "Total INR", "Status", "Receipt"],
      ...data.invoices.map((i) => [
        i.id,
        getStudent(data, i.student)?.name,
        i.due,
        totalInvoice(i),
        i.paid ? "Simulated paid" : "Due",
        i.receipt || "",
      ]),
    ]);
    toast("Sample fee ledger exported.");
  },
  "toggle-results": () => {
    commit(
      "Result visibility was changed",
      (data) => (data.resultsPublished = !data.resultsPublished),
    );
    renderWorkspace();
    toast(
      readStore().resultsPublished
        ? "Results published to student workspace."
        : "Results are now hidden from students.",
    );
  },
  "download-report": () => {
    const data = readStore(),
      student = getStudent(data);
    downloadFile(
      "school-demo-report.txt",
      `Your School — ILLUSTRATIVE TERM REPORT\nNOT AN OFFICIAL SCHOOL REPORT\n\n${student.name} · ${student.grade}\nSession: ${data.settings.academicYear}\n\n${data.results.map((r) => `${r.subject}: ${r.scores[STUDENT_ID]}/100`).join("\n")}\n\nAll marks are fictional.`,
    );
    toast("Sample report downloaded.");
  },
  "edit-period": () => {
    const data = readStore();
    formDialog(
      "Edit a timetable period",
      `<label>Period<select name="period">${options(data.timetable.map((row, index) => [String(index), `${row[0]} · ${row[1]}`]))}</select></label>` +
        field("Subject", "subject", "Science", { options: SUBJECTS }) +
        field("Room", "room", "Science lab") +
        field("Teacher label", "teacher", "Nandita Sen"),
      (values) => {
        commit("Sample timetable updated", (current) => {
          const row = current.timetable[Number(values.period)];
          row[1] = values.subject;
          row[2] = values.teacher;
          row[3] = values.room;
        });
        toast("Period updated in the sample timetable.");
      },
      { submit: "Update period" },
    );
  },
  "add-notice": () => noticeForm(),
  "edit-notice": noticeForm,
  "pin-notice": (id) => {
    updateStore((data) => {
      const n = data.notices.find((n) => n.id === id);
      n.pinned = !n.pinned;
    });
    renderWorkspace();
    toast("Notice position updated.");
  },
  "open-notice": (id) => {
    const n = readStore().notices.find((n) => n.id === id);
    openDialog(
      n.title,
      `${badge(n.category, "blue")}<p class="resource-body" style="margin-top:20px">${e(n.body)}</p>`,
    );
  },
  "add-book": () =>
    formDialog(
      "Add a library book",
      field("Title", "title") +
        field("Author", "author") +
        field("Category", "category", "Fiction", {
          options: ["Fiction", "Science", "Biography", "Reference"],
        }) +
        field("Copies", "copies", 3, { type: "number", min: 1, max: 100 }),
      (values) => {
        commit("A book was added to the sample library", (data) =>
          data.books.push({
            ...values,
            id: createId("B"),
            copies: Number(values.copies),
            loans: [],
          }),
        );
        toast("New book added to the library.");
      },
      { submit: "Add book" },
    ),
  "borrow-book": (id) => {
    const book = readStore().books.find((b) => b.id === id);
    if (book.loans.some((l) => l.student === STUDENT_ID))
      throw Error("This book is already on your sample shelf.");
    if (book.loans.length >= book.copies)
      throw Error("All copies are currently borrowed.");
    commit("Aarav borrowed a library book", (data) =>
      data.books
        .find((b) => b.id === id)
        .loans.push({ student: STUDENT_ID, due: "2026-11-07" }),
    );
    renderWorkspace();
    toast("Book borrowed in the demo. Return it by 7 November.");
  },
  "return-book": (id) => {
    commit("A library book was returned", (data) => {
      const book = data.books.find((b) => b.id === id);
      book.loans = book.loans.filter((l) => l.student !== STUDENT_ID);
    });
    renderWorkspace();
    toast("Book returned in the demo.");
  },
  "book-loans": bookLoans,
  "admin-return-book": (compositeId) => {
    const [id, studentId] = compositeId.split("|");
    commit("A sample library loan was returned", (data) => {
      const book = data.books.find((b) => b.id === id);
      book.loans = book.loans.filter((l) => l.student !== studentId);
    });
    renderWorkspace();
    bookLoans(id);
    toast("Book returned to the sample library.");
  },
  "add-route": () => routeForm(),
  "manage-route": routeForm,
  "route-details": (id) => {
    const route = readStore().routes.find((r) => r.id === id);
    openDialog(
      "Your transport route",
      `${badge(route.vehicle, "blue")}<h3 style="margin:20px 0;font-size:22px">${e(route.name)}</h3><p class="resource-body">${e(route.stops)}</p><div class="invoice-note">Route illustration only. There is no live tracking or real driver contact information in this demo.</div>`,
    );
  },
  "read-resource": (id) => {
    const resource = readStore().resources.find((r) => r.id === id);
    openDialog(
      resource.title,
      `${badge(resource.subject, "blue")}<p class="resource-body" style="margin-top:20px">${e(resource.body)}</p>${actionButton("Download learning note", "download-resource", "download", "btn-secondary", `data-id="${resource.id}"`)}`,
    );
  },
  "download-resource": (id) => {
    const resource = readStore().resources.find((r) => r.id === id);
    downloadFile(
      "school-learning-note.txt",
      `${resource.title}\n${resource.subject}\n\n${resource.body}`,
    );
    toast("Learning note downloaded.");
  },
  "new-message": () =>
    formDialog(
      "Write a message",
      field("Subject", "subject") +
        field("Message", "body", "", { multiline: true }),
      (values) => {
        if (!values.body.trim()) throw Error("Enter a message before sending.");
        commit("A classroom message was added", (data) =>
          data.messages.push({
            ...values,
            id: createId("M"),
            sender: role === "student" ? "student" : "teacher",
            date: DEMO_DATE,
            read: false,
          }),
        );
        toast(
          "Message saved in the demo conversation. Nothing sent outside this browser.",
        );
      },
      { submit: "Send in demo" },
    ),
  "request-leave": () =>
    formDialog(
      "Request leave",
      field("From", "from", "2026-11-12", { type: "date" }) +
        field("To", "to", "2026-11-12", { type: "date" }) +
        field("Reason", "reason", "", { multiline: true }),
      (values) => {
        if (values.to < values.from)
          throw Error("The end date must be on or after the start date.");
        commit("A sample leave request was added", (data) =>
          data.leaveRequests.unshift({
            ...values,
            id: createId("L"),
            name: "Nandita Sen",
            status: "Pending",
          }),
        );
        toast("Leave request ready for admin review.");
      },
      { submit: "Request leave in demo" },
    ),
  "approve-leave": (id) => {
    commit(
      "A sample leave request was approved",
      (data) =>
        (data.leaveRequests.find((r) => r.id === id).status = "Approved"),
    );
    renderWorkspace();
    toast("Leave request approved in demo.");
  },
  "decline-leave": (id) => {
    commit(
      "A sample leave request was declined",
      (data) =>
        (data.leaveRequests.find((r) => r.id === id).status = "Declined"),
    );
    renderWorkspace();
    toast("Leave request declined in demo.");
  },
  "edit-profile": () => {
    const person = getStudent(readStore());
    formDialog(
      "Edit my profile",
      field("Demo guardian name", "guardian", person.guardian) +
        field("Demo email", "email", person.email, { type: "email" }),
      (values) => {
        commit("Aarav updated the sample profile", (data) =>
          Object.assign(getStudent(data), values),
        );
        toast("Demo profile updated.");
      },
      { note: "Only use fictional information in this pitch demo." },
    );
  },
  "reset-demo": () =>
    openDialog(
      "Reset the demo?",
      `<p>This restores the original fictional campus records in this browser. Your demo students, tasks, payments and other local changes will be replaced.</p><p class="form-note">No real school records are involved.</p><div class="form-actions"><button class="btn btn-secondary" data-action="close-dialog">Keep exploring</button>${actionButton("Reset sample campus", "confirm-reset", "settings", "btn-dark")}</div>`,
    ),
  "confirm-reset": () => {
    resetStore();
    filters = freshFilters();
    dialog.close();
    renderShell();
    renderWorkspace();
    toast("A fresh sample campus is ready to explore.");
  },
  "export-data": () => {
    downloadFile(
      "school-fictional-campus.json",
      JSON.stringify(readStore(), null, 2),
      "application/json",
    );
    toast("Fictional demo data exported.");
  },
};

if (views.navigation[role]) {
  renderShell();
  renderWorkspace();
} else {
  app.innerHTML = views.renderGateway();
  document.title = "Choose your workspace · Your School Digital Campus";
}
