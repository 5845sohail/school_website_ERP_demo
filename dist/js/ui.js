/** Shared, deliberately small UI helpers. All dynamic text is escaped at the boundary. */
export function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}
export const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export function dateLabel(value) {
  return new Date(`${value}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
const paths = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  people:
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',
  book: '<path d="M12 6c-3-3-8-3-10-2v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-7-1-10 2Zm0 0v15"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 11h18M7 15h2M13 15h2"/>',
  check:
    '<path d="m5 12 4 4L20 5"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10"/>',
  fees: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 15h3M17 3v4"/>',
  chart: '<path d="M4 3v18h17M8 16v-4M13 16V7M18 16v-7"/>',
  notice: '<path d="m4 9 14-5v16L4 15V9ZM4 9H2v6h2M6 16l1 5h4l-2-4M21 8v8"/>',
  inbox:
    '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="m3 6 9 7 9-7"/>',
  settings:
    '<path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  bus: '<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 11h14M8 19v2M16 19v2M8 15h1M15 15h1M9 3v8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
  edit: '<path d="m15 4 5 5M4 15 16 3l5 5L9 20l-6 1 1-6Z"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5ZM14 2v6h5M8 12h8M8 16h6"/>',
  leaf: '<path d="M20 3C6 2 1 9 7 16s15-1 13-13ZM5 20 16 9"/>',
  logout: '<path d="M9 4H3v16h6M10 12h11m-5-5 5 5-5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pin: '<path d="m7 3 10 0-1 6 3 3v2H5v-2l3-3-1-6ZM12 14v7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01"/>',
  shield:
    '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
};
export function icon(name, className = "") {
  if (!name || name === "arrow" || name === "arrowUp") return "";
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
}
export function badge(text, tone = "") {
  return `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
}
export function emptyState(title, description, action = "") {
  return `<div class="empty-state">${icon("leaf")}<h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>${action}</div>`;
}
export function metric(label, value, description, symbol, tone = "blue") {
  return `<article class="metric"><div class="metric-label">${escapeHtml(label)}<span class="metric-symbol ${tone}">${icon(symbol)}</span></div><strong>${escapeHtml(value)}</strong><p>${escapeHtml(description)}</p></article>`;
}
export function panel(title, content, action = "", className = "") {
  return `<section class="panel ${className}"><div class="panel-heading"><h2>${escapeHtml(title)}</h2>${action}</div>${content}</section>`;
}
/** Render a labeled control. Values are escaped; numeric limits stay numeric. */
export function field(label, name, value = "", options = {}) {
  const attributes = [];
  if (options.required !== false) attributes.push("required");
  for (const key of ["min", "max", "step"]) {
    if (options[key] !== undefined)
      attributes.push(`${key}="${escapeHtml(options[key])}"`);
  }
  const requiredAndLimits = attributes.join(" ");
  const safeName = escapeHtml(name);
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);

  if (options.options) {
    const choices = options.options
      .map(
        (item) =>
          `<option value="${escapeHtml(item)}" ${item === value ? "selected" : ""}>${escapeHtml(item)}</option>`,
      )
      .join("");
    return `<label>${safeLabel}<select name="${safeName}" ${requiredAndLimits}>${choices}</select></label>`;
  }
  if (options.multiline) {
    return `<label class="full-width">${safeLabel}<textarea name="${safeName}" rows="4" maxlength="2000" ${requiredAndLimits}>${safeValue}</textarea></label>`;
  }
  const type = options.type || "text";
  const lengthLimit = ["text", "email", "tel"].includes(type)
    ? 'maxlength="200"'
    : "";
  return `<label>${safeLabel}<input name="${safeName}" type="${escapeHtml(type)}" value="${safeValue}" ${lengthLimit} ${requiredAndLimits}></label>`;
}
export function actionButton(
  text,
  action,
  symbol = "plus",
  className = "btn-primary",
  attrs = "",
) {
  return `<button class="btn ${className}" data-action="${action}" ${attrs}>${icon(symbol)}${escapeHtml(text)}</button>`;
}
export function downloadFile(name, content, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export function downloadCsv(name, rows) {
  // Prevent spreadsheet formula execution when users open an exported demo field.
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return `"${(/^[=+@\-]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
  downloadFile(name, "\ufeff" + csv, "text/csv;charset=utf-8");
}
