/**
 * Browser-only demo database.
 * All roles read the same data so a teacher → student → admin walkthrough is coherent.
 * No credentials, network requests, real payments or real notifications are involved.
 */
export const STORAGE_KEY = "school-campus-demo-v2";
export const DEMO_DATE = "2026-10-30";
export const CLASSES = ["VI A", "VII A", "IX A"];
export const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Social studies",
  "Hindi",
  "Computer science",
];
export const STUDENT_ID = "S001";
export const TEACHER_ID = "T001";

function createSeed() {
  const people = [
    ["Aarav Sharma", "VI A", "A"],
    ["Ananya Singh", "VI A", "A"],
    ["Ishaan Kumar", "VI A", "A"],
    ["Meera Das", "VI A", "B"],
    ["Rohan Verma", "VI A", "B"],
    ["Siya Gupta", "VI A", "A"],
    ["Kabir Sen", "VII A", "A"],
    ["Diya Roy", "VII A", "B"],
    ["Arjun Sinha", "VII A", "A"],
    ["Avni Patel", "IX A", "A"],
    ["Vivaan Rao", "IX A", "B"],
    ["Tara Mishra", "IX A", "A"],
  ];
  return {
    schemaVersion: 2,
    students: people.map(([name, grade, house], index) => ({
      id: `S${String(index + 1).padStart(3, "0")}`,
      admission: `SCH-${2026001 + index}`,
      name,
      grade,
      house: house === "A" ? "Ashoka" : "Tagore",
      roll: (index % 6) + 1,
      guardian: `Guardian of ${name.split(" ")[0]}`,
      status: "Active",
      gender: index % 2 ? "Female" : "Male",
      email: `student${index + 1}@example.com`,
      phone: "Demo contact",
      joined: "2026-04-06",
    })),
    staff: [
      {
        id: "T001",
        name: "Nandita Sen",
        subject: "Science",
        classTeacher: "VI A",
        status: "Active",
        email: "teacher1@example.com",
      },
      {
        id: "T002",
        name: "Aditya Roy",
        subject: "Mathematics",
        classTeacher: "VII A",
        status: "Active",
        email: "teacher2@example.com",
      },
      {
        id: "T003",
        name: "Riya Verma",
        subject: "English",
        classTeacher: "IX A",
        status: "Active",
        email: "teacher3@example.com",
      },
      {
        id: "T004",
        name: "Vikram Das",
        subject: "Social studies",
        classTeacher: "VI A",
        status: "Active",
        email: "teacher4@example.com",
      },
    ],
    enquiries: [
      {
        id: "E001",
        name: "Demo family A",
        grade: "VI A",
        stage: "New enquiry",
        date: "2026-10-29",
        message: "Would like to arrange a campus visit.",
        phone: "Demo contact",
        email: "family-a@example.com",
      },
      {
        id: "E002",
        name: "Demo family B",
        grade: "VII A",
        stage: "Contacted",
        date: "2026-10-28",
        message: "Interested in the next academic session.",
        phone: "Demo contact",
        email: "family-b@example.com",
      },
      {
        id: "E003",
        name: "Demo family C",
        grade: "VI A",
        stage: "Visit scheduled",
        date: "2026-10-26",
        message: "Campus visit requested.",
        phone: "Demo contact",
        email: "family-c@example.com",
      },
      {
        id: "E004",
        name: "Demo family D",
        grade: "IX A",
        stage: "Applied",
        date: "2026-10-23",
        message: "Application received in demo.",
        phone: "Demo contact",
        email: "family-d@example.com",
      },
    ],
    attendance: {
      "VI A|2026-10-30": {
        finalized: false,
        records: {
          S001: "Present",
          S002: "Present",
          S003: "Present",
          S004: "Absent",
          S005: "Late",
          S006: "Present",
        },
      },
      "VI A|2026-10-29": {
        finalized: true,
        records: {
          S001: "Present",
          S002: "Present",
          S003: "Present",
          S004: "Present",
          S005: "Present",
          S006: "Present",
        },
      },
    },
    assignments: [
      {
        id: "A001",
        title: "The world beneath a leaf",
        subject: "Science",
        grade: "VI A",
        due: "2026-11-02",
        instructions:
          "Find a leaf, draw what you see, and label its parts. Write three things the leaf helps the plant do.",
        teacher: "T001",
        published: true,
        submissions: {},
      },
      {
        id: "A002",
        title: "Fractions in everyday life",
        subject: "Mathematics",
        grade: "VI A",
        due: "2026-11-03",
        instructions:
          "Find five examples of fractions at home. Draw each example and write the equivalent fraction.",
        teacher: "T002",
        published: true,
        submissions: {},
      },
      {
        id: "A003",
        title: "A place that feels like home",
        subject: "English",
        grade: "VI A",
        due: "2026-10-29",
        instructions:
          "Write a paragraph of 100–150 words about a favourite place. Use at least three descriptive words.",
        teacher: "T003",
        published: true,
        submissions: {
          S001: {
            text: "My favourite place is the little garden at home. It is peaceful, green and full of birds.",
            date: "2026-10-28",
            score: 9,
            feedback: "Lovely imagery. Try adding a few sensory details.",
            reviewed: true,
          },
        },
      },
      {
        id: "A004",
        title: "Ecosystems around us",
        subject: "Science",
        grade: "VII A",
        due: "2026-11-04",
        instructions: "Create a food chain with at least five organisms.",
        teacher: "T001",
        published: true,
        submissions: {},
      },
    ],
    invoices: people.map((_, index) => ({
      id: `INV-${1001 + index}`,
      student: `S${String(index + 1).padStart(3, "0")}`,
      month: "November 2026",
      tuition: 2500,
      activity: 500,
      fine: 0,
      due: "2026-11-10",
      paid: index % 3 === 1,
      receipt: index % 3 === 1 ? `DEMO-${1001 + index}` : null,
    })),
    results: SUBJECTS.map((subject, index) => ({
      subject,
      max: 100,
      scores: Object.fromEntries(
        people.map((_, j) => [
          `S${String(j + 1).padStart(3, "0")}`,
          [88, 91, 85, 79, 92, 94][(index + j) % 6],
        ]),
      ),
    })),
    resultsPublished: true,
    notices: [
      {
        id: "N001",
        title: "A conversation about progress",
        body: "Our sample parent–teacher meeting is scheduled for 7 November, 10 am–12 pm. Use this notice to explore the digital notice board.",
        category: "Academic",
        audience: "Everyone",
        date: "2026-10-30",
        pinned: true,
      },
      {
        id: "N002",
        title: "Bring your curiosity to science week",
        body: "Our demo science activities celebrate simple questions and small discoveries. Come prepared with one question about the world around you.",
        category: "Activities",
        audience: "Everyone",
        date: "2026-10-29",
        pinned: false,
      },
      {
        id: "N003",
        title: "November fee reminder",
        body: "The fictional November invoice is available in the Fees section. You can simulate a payment without entering any financial details.",
        category: "Office",
        audience: "Students",
        date: "2026-10-28",
        pinned: false,
      },
    ],
    timetable: [
      ["08:15", "Mathematics", "Aditya Roy", "Room 06"],
      ["09:00", "English", "Riya Verma", "Room 06"],
      ["09:45", "Science", "Nandita Sen", "Science lab"],
      ["10:30", "Break", "—", "Courtyard"],
      ["10:50", "Social studies", "Vikram Das", "Room 06"],
      ["11:35", "Hindi", "Class teacher", "Room 06"],
      ["12:20", "Computer science", "Class teacher", "Computer lab"],
    ],
    books: [
      {
        id: "B001",
        title: "The Blue Umbrella",
        author: "Ruskin Bond",
        category: "Fiction",
        copies: 4,
        loans: [{ student: "S001", due: "2026-11-07" }],
      },
      {
        id: "B002",
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "Science",
        copies: 3,
        loans: [],
      },
      {
        id: "B003",
        title: "Malgudi Days",
        author: "R. K. Narayan",
        category: "Fiction",
        copies: 5,
        loans: [],
      },
      {
        id: "B004",
        title: "Wings of Fire",
        author: "A. P. J. Abdul Kalam",
        category: "Biography",
        copies: 3,
        loans: [],
      },
    ],
    routes: [
      {
        id: "R001",
        name: "North route",
        vehicle: "DEMO BUS 01",
        driver: "Demo driver A",
        stops: "School gate → Park stop → Community stop",
        capacity: 35,
        students: ["S001", "S002", "S003"],
      },
      {
        id: "R002",
        name: "South route",
        vehicle: "DEMO BUS 02",
        driver: "Demo driver B",
        stops: "School gate → Town centre stop → Market stop",
        capacity: 30,
        students: ["S004", "S005"],
      },
    ],
    messages: [
      {
        id: "M001",
        sender: "teacher",
        subject: "Welcome to your digital classroom",
        body: "Aarav, your science assignment is ready. Take your time, look closely, and tell me what you discover.",
        date: "2026-10-30",
        read: false,
      },
    ],
    leaveRequests: [
      {
        id: "L001",
        name: "Nandita Sen",
        from: "2026-11-12",
        to: "2026-11-12",
        reason: "Personal appointment",
        status: "Pending",
      },
    ],
    resources: [
      {
        id: "RES1",
        title: "A closer look at plants",
        subject: "Science",
        body: "Plants use sunlight, water and carbon dioxide to make food through photosynthesis. Leaves contain chlorophyll, which helps capture light.\n\nTry this: observe a leaf in daylight and sketch its veins, edges and colour. Compare it with a different leaf.",
      },
      {
        id: "RES2",
        title: "Fractions, one piece at a time",
        subject: "Mathematics",
        body: "A fraction describes part of a whole. The numerator counts the parts we have; the denominator tells us the number of equal parts.\n\nExample: 1/2 = 2/4 = 4/8. Multiply or divide the numerator and denominator by the same number to find equivalent fractions.",
      },
      {
        id: "RES3",
        title: "Words that make a picture",
        subject: "English",
        body: "Good descriptive writing helps a reader imagine a scene. Think about what you can see, hear, smell and feel.\n\nTry this: describe your classroom without using the words big, small, good or nice.",
      },
    ],
    settings: {
      schoolName: "Your School",
      academicYear: "2026–27",
      fineRate: 10,
      emailUpdates: true,
    },
    activity: [{ text: "Demo campus is ready to explore", date: "2026-10-30" }],
  };
}

let memory;
export let persistentStorageAvailable = true;
export function readStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      saved?.schemaVersion === 2 &&
      Array.isArray(saved.students) &&
      Array.isArray(saved.assignments)
    )
      return saved;
  } catch {
    persistentStorageAvailable = false;
  }
  if (!memory) memory = createSeed();
  return structuredClone(memory);
}
export function saveStore(data) {
  memory = structuredClone(data);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    persistentStorageAvailable = false;
  }
  return data;
}
export function updateStore(mutator) {
  const data = readStore();
  mutator(data);
  return saveStore(data);
}
export function resetStore() {
  return saveStore(createSeed());
}
export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
export function logActivity(data, text) {
  data.activity.unshift({ text, date: DEMO_DATE });
  data.activity = data.activity.slice(0, 25);
}
export function addEnquiry(values) {
  return updateStore((data) => {
    data.enquiries.unshift({
      ...values,
      id: createId("E"),
      stage: "New enquiry",
      date: DEMO_DATE,
    });
    logActivity(data, "A new admission enquiry was added");
  });
}
// Initialize once. A blocked localStorage still leaves a functional in-memory demo.
if (!memory) saveStore(readStore());
