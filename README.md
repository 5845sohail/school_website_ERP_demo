# Your School Digital Campus — interactive frontend demo

A presentation website with a handmade WebGL school scene and three connected demo workspaces. Built with HTML, CSS and JavaScript modules. There is no build step and no package installation.

## Run

```sh
npm run dev
```

Open http://localhost:4319. Use an HTTP server: ES modules do not work by double-clicking an HTML file.

```sh
npm run check
```

The checks cover module syntax, asset references, every view renderer, shared-state persistence, teacher/student assignment handoff, escaping and reset.

## Start a walkthrough

- Website: `/`
- Role chooser: `/portal.html`
- Admin: `/portal.html?role=admin`
- Teacher: `/portal.html?role=teacher`
- Student: `/portal.html?role=student`

1. In Teacher → Assignments, publish a new task for VI A.
2. In Student → Assignments, submit a sample response.
3. Back in Teacher, review the response and leave a score and feedback.
4. In Student, open the task to see the feedback.
5. Simulate an invoice payment or borrow a library book. Admin sees the updated ledger and loans.
6. Admin can also add learners, update staff, schedule an admission visit, publish notices, edit marks/timetable, assign transport and approve staff leave.

The same fictional campus is shared by all roles on the same browser origin. Changes survive refresh. Settings → Reset demo restores the seed data. Cross-tab changes refresh open workspaces when no dialog is being edited.

## Code map

- `dist/index.html`, `dist/styles.css`: school website and responsive visual system.
- `dist/js/website.js`: menus, galleries, enquiry form and optional pointer tilt.
- `dist/js/scroll-story.js`: ghost-style scroll reveals, layout-preserving typewriter text and accessible static text copies.
- `dist/js/campus-scene.js`: original Three.js school geometry, lights, shadows, drag interaction and motion control. The school photo is the fallback on devices without WebGL.
- `dist/portal.html`, `dist/portal.css`: workspace shell and responsive interface styles.
- `dist/js/portal.js`: URL navigation, forms and user actions.
- `dist/js/views.js`: role-specific screens; rendering is separate from state changes.
- `dist/js/workspace-config.js`: role labels, permitted demo routes and displayed profile names.
- `dist/js/store.js`: versioned sample data and browser storage. Falls back to session memory if storage is unavailable.
- `dist/js/ui.js`: escaping, icons, form controls, downloads and shared components.
- `scripts/check.mjs`: dependency-free verification.

CSS media queries support small screens and a collapsible mobile sidebar. Tables scroll inside their own containers. Motion always plays for the pitch, including on devices with a reduced-motion preference. Photo movement, card lift and dialog popup entrances are styled in `dist/pitch-motion.css`. Album cards and the gallery popup crossfade through the five sample illustrations every three seconds using `dist/js/album-slideshow.js`. Gallery buttons restart the three-second interval, and closing the popup clears its timer. Each text animation runs once as it enters view; text retains its full layout space and a complete screen-reader copy.

## Deliberate demo boundaries

This is a frontend pitch, not a deployed school ERP. Role links are demonstration entry points, not authentication or access controls. All seeded people, marks, invoices, routes and operational figures are fictional. Do not enter actual student information.

Payment states, messages, attendance alerts, admissions and leave approvals change browser-local sample records only. No payment gateway, WhatsApp, email, actual uploads or backend is connected. An optional assignment attachment is a filename label only. Downloaded receipts and reports are marked as demo records.

Historical attendance, term percentages and dashboard chart history are illustrative baselines. Current attendance, invoices, submissions, published marks, notices and other actions reflect browser-local state. Fine calculation is a simple school-approval-pending illustration, not a production finance engine.

The crest and school-life artwork are neutral SVG illustrations included with this demo. Replace them with a school’s approved logo and photography when tailoring a pitch. The 3D school is a conceptual illustration. Three.js is vendored with its license under `dist/assets/vendor`. Typefaces are requested from Google Fonts with system fallbacks.

The supplied campus blueprint informs UI scope. Production discovery, approvals, policies, security, migration, integration, payments and operational infrastructure remain separate work.

For content, design and code conventions, see [DEVELOPMENT.md](DEVELOPMENT.md).

Typewriter animation is opt-in: add `data-typewriter` only to a selected heading phrase. Keep paragraphs, buttons, card titles and workspace screens static. Buttons use notebook-tab edges and pressed states; avoid adding decorative arrow icons.


## Tailoring this demo to another school

This is an independent copy of the original school demo. The source project is unchanged. The website uses “Your School” and location placeholders; it contains no real school phone numbers, external school links, affiliation claims or original school photos.

- Website name, description, location and admissions copy: `dist/index.html`.
- Workspace labels, downloads and headings: `dist/js/portal.js` and `dist/js/views.js`.
- Sample campus name, admission IDs and transport routes: `dist/js/store.js`. Admin → Settings can also change the workspace name in the current browser.
- 3D building sign: `dist/js/campus-scene.js`.
- Logo and gallery illustrations: `dist/assets/`; gallery captions: `dist/js/website.js`.
- The storage key is `school-campus-demo-v2`, separate from the original demo.

Add the actual school’s approved contact details, curriculum, policies and gallery before using this as its live website. The enquiry form and contact shortcuts currently lead to local demo interactions.
