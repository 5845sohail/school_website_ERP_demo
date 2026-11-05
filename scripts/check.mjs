import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

// No dependencies or build step. Check module syntax and local asset references.
const root = resolve(import.meta.dirname, "..");
for (const file of readdirSync(resolve(root, "dist/js"))) {
  if (!file.endsWith(".js")) continue;
  const result = spawnSync(
    process.execPath,
    ["--check", resolve(root, "dist/js", file)],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
}
for (const file of ["index.html", "portal.html"]) {
  const html = readFileSync(resolve(root, "dist", file), "utf8");
  for (const [, path] of html.matchAll(
    /(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g,
  )) {
    if (/^(https?:|tel:)/.test(path)) continue;
    assert.ok(
      existsSync(resolve(root, "dist", path)),
      `Missing local asset: ${path}`,
    );
  }
}

// Exercise the shared demo state, including persistence, assignment handoff and reset.
const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
};
const store = await import("../dist/js/store.js");
const views = await import("../dist/js/views.js");
const data = store.readStore();
assert.equal(data.students.length, 12);
assert.equal(data.staff.length, 4);
store.updateStore((current) => {
  current.assignments.unshift({
    id: "TEST",
    title: "A teacher-published task",
    subject: "Science",
    grade: "VI A",
    due: "2026-11-05",
    instructions: "A small discovery.",
    teacher: "T001",
    published: true,
    submissions: {},
  });
});
assert.ok(
  views
    .visibleAssignments(store.readStore(), "student")
    .some((task) => task.id === "TEST"),
);
store.updateStore((current) => {
  current.assignments[0].submissions.S001 = {
    text: "A student response.",
    date: store.DEMO_DATE,
    reviewed: false,
  };
});
assert.equal(
  store.readStore().assignments[0].submissions.S001.text,
  "A student response.",
);
store.updateStore((current) => {
  current.assignments[0].submissions.S001.reviewed = true;
});
assert.equal(store.readStore().assignments[0].submissions.S001.reviewed, true);
for (const role of ["admin", "teacher", "student"]) {
  assert.ok(
    views.renderOverview(store.readStore(), role).includes("page-heading"),
  );
}
const filters = {
  search: "",
  class: "",
  subject: "",
  date: store.DEMO_DATE,
  status: "",
  tab: "all",
  category: "",
};
for (const [name, renderer] of Object.entries(views)) {
  if (
    !name.startsWith("render") ||
    name === "renderGateway" ||
    name === "renderOverview"
  )
    continue;
  for (const role of ["admin", "teacher", "student"]) {
    const html = renderer(store.readStore(), role, filters);
    assert.equal(typeof html, "string", `${name} failed to return HTML`);
    assert.ok(
      !html.includes("[object Object]"),
      `${name} contains invalid data`,
    );
  }
}
store.addEnquiry({
  name: "<script>test</script>",
  grade: "VI A",
  phone: "Demo",
  email: "demo@example.com",
  message: "<img src=x>",
});
assert.ok(
  !views
    .renderAdmissions(store.readStore(), "admin", filters)
    .includes("<script>test"),
);
store.resetStore();
assert.equal(store.readStore().assignments.length, 4);
assert.equal(store.readStore().enquiries.length, 4);
console.log(
  "Passed: module syntax, local assets, all view renderers, persistence, role handoff, HTML escaping, demo reset.",
);

// Routes and profile labels follow shared configuration, including edited names.
const config = await import("../dist/js/workspace-config.js");
assert.equal(
  config.resolveWorkspaceView("teacher", "#view=assignments"),
  "assignments",
);
assert.equal(
  config.resolveWorkspaceView("student", "#view=students"),
  "overview",
);
assert.equal(config.resolveWorkspaceView("admin", "#view=missing"), "overview");
const editedCampus = store.readStore();
editedCampus.staff[0].name = "Demo Teacher";
assert.equal(
  config.getWorkspaceIdentity("teacher", editedCampus),
  "Demo Teacher",
);
assert.ok(
  views.renderOverview(editedCampus, "teacher").includes("Good morning, Demo."),
);
console.log("Passed: role navigation and updated profile names.");
