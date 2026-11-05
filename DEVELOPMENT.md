# Working on the general school demo

The project is plain HTML, CSS and JavaScript. You do not need a framework or build step to make changes.

## Start here

Run `npm run dev` and open http://localhost:4319. Run `npm run check` before publishing.

- Change school website wording in `dist/index.html`.
- Change website colours, type sizes and spacing in `dist/styles.css`.
- Change panel labels and routes in `dist/js/workspace-config.js`.
- Change panel headings and screen layouts in `dist/js/views.js`.
- Change form behaviour and action handlers in `dist/js/portal.js`.
- Change shared controls, escaping and downloads in `dist/js/ui.js`.
- Change fictional seed records in `dist/js/store.js`.

All panel renderers accept `(data, role, filters)`. They return HTML and do not save changes. Actions in `portal.js` update the shared store and then redraw the current screen. Keep that separation when adding a feature.

## Copy and interface conventions

Use the name of the task: “Create assignment”, “Invoice details”, “Correct attendance”. Tell the user what happened after saving, and what they need to do if a form cannot be submitted. Avoid slogans in dialogs, errors and empty states.

School-facing text should sound like a helpful school office. Use the school's full name and location where it matters. Do not add invented admissions dates, achievements, staff biographies or policies.

Use existing buttons, badges, panels and form helpers before adding a new style. Keep supporting text readable and leave space for longer names. Tables may scroll inside their containers; the page itself should not overflow sideways.

## Animations

`scroll-story.js` handles scroll reveals and typewriter text. It keeps the full text layout and a screen-reader copy. `campus-scene.js` builds the 3D school illustration. Motion is always enabled for this pitch, as requested. `album-slideshow.js` crossfades album cards and the open gallery every three seconds; keep its image preloading, stable layers and popup timer cleanup working.

## Sample data

The demo uses browser storage, not a server. Student, teacher and admin views read the same fictional records. Existing browser edits are preserved when the code changes; use Settings → Reset sample campus to load revised seed records.

Role selection is for trying the screens. It is not authentication or a permission boundary. Payments, attendance alerts and messages are simulations.

## Before handing over

Run the checks, open each affected screen, and try the full flow across roles when changing a shared record. Check that dynamic text is escaped, a submit button cannot process the same payment twice, and navigating away closes a dialog.

Typewriter animation is opt-in: add `data-typewriter` only to a selected heading phrase. Keep paragraphs, buttons, card titles and workspace screens static. Buttons use notebook-tab edges and pressed states; avoid adding decorative arrow icons.

## Mobile layouts

`dist/mobile.css` is loaded last on both the website and portal. It contains the phone/tablet corrections: narrow headings, compact navigation, single-column forms, 16px form controls, touch targets, contained dashboard charts and contact-button placement. Keep wide tables scrollable inside `.table-container`; do not hide page overflow to mask layout problems. The portal drawer becomes inert when closed and closes on Escape or navigation.
