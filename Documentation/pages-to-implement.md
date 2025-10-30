# 🎓 **RCI Academic Portal – Detailed Page Functions (UX/UI-Oriented)**

---

## **1. STUDENT** *(has sidebar to navigate between pages)*

### **1.1 Dashboard**

* **Header:** “Welcome, [Student Name]!”

* Shows current **Academic Year** and **Semester**.

* **Table: Enrolled Subjects**

  | Column       | Description                                                                                                                  |
  | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
  | Subject Code | e.g., IT101                                                                                                                  |
  | Title        | e.g., Introduction to Computing                                                                                              |
  | Units        | e.g., 3                                                                                                                      |
  | Schedule     | e.g., MWF 8–10 AM                                                                                                            |
  | Actions      | - **View Syllabus (📄)** → downloads syllabus PDF  <br> - **View Summary (ℹ️)** → opens modal with short subject description |

* **UX/UI Notes:**

  * Minimal clean design.
  * Each subject row has hover highlight.
  * Quick access buttons use icons.
  * Dashboard cards on top:

    * 🧑‍🎓 *Current Year Level*
    * 📅 *Active Semester*
    * 📚 *Total Enrolled Subjects*

---

### **1.2 Grades**

* **Dropdown:** Filter by term → (All, 1st Year, 2nd Year, 3rd Year, 4th Year, Summer)

* **If no records:** Show toast alert → “No grades found for this selection.”

* **Table: Subject Grades**

  | Column       | Description                                           |
  | ------------ | ----------------------------------------------------- |
  | Subject Code | e.g., IT102                                           |
  | Title        | Subject title                                         |
  | Grade        | e.g., 1.75                                            |
  | Status       | Passed / Failed / INC                                 |
  | Actions      | - **View Summary (ℹ️)** <br> - **View Syllabus (📄)** |

* **INC Behavior:**

  * If INC exists, term box border = 🔴 Red.
  * If no INC, border = ⚫ Black.
  * Clicking “View” shows modal:

    * Reason for INC (e.g., missing pre-finals).
    * Recommended action from professor.
    * Approval chain (Professor → Head → Registrar).

---

### **1.3 Announcements / Notifications**

*(Future update — placeholder section)*

* Will list notifications in card layout.
* Each card shows title, message, and date.

---

## **2. REGISTRAR** *(has sidebar to navigate between pages)*

### **2.1 Dashboard**

* **Header:** “Welcome, Registrar [Name]”
* **Top Section:** Random motivational quote (static array).
* **Summary Cards:**

  * 🧍‍♀️ *Total Enrolled Students*
  * 🧾 *Pending Documents*
  * 📄 *Certificates Issued*
  * 📊 *Enrollment Trend Chart (mini graph)*

---

### **2.2 Student Records**

* **Search Bar:** Search by student name or student number.

* **Dropdown Filters:** Program, Year Level, Status (Enrolled, LOA, etc.).

* **Paginated Table:**

  | Column       | Description                                                             |
  | ------------ | ----------------------------------------------------------------------- |
  | Student No.  | e.g., 2023-0012                                                         |
  | Name         | Full name                                                               |
  | Program      | e.g., BSIS                                                              |
  | Year Level   | 3                                                                       |
  | Status       | e.g., Enrolled / Dropped                                                |
  | Missing Docs | Yes / No                                                                |
  | Actions      | - **View More (👁)** - opens modal with complete info and attached docs |

* **Student View Modal:**

  * Shows all student info, program, status history.
  * List of uploaded docs with **view/download** buttons.
  * Option to mark student as **verified** or **archive record**.



### **2.4 View Analytics (Business Intelligence)**

* Layout: Dashboard grid with cards, charts, and filters.
* **Filters:** Term / Program / Year / Department
* **Charts/Widgets:**

  * Bar chart → *Enrollment by Program*
  * Line chart → *Enrollment Trend per Term*
  * Donut chart → *Status Breakdown (Enrolled, LOA, Dropped)*
  * Table → *Students with INC / Missing Documents*
* **Bottom Section:** Audit log snippet (recent registrar actions).

---

## **3. ADMISSION** *(has sidebar to navigate between pages)*

### **3.1 Dashboard**

* Header: “Welcome, Admission Officer [Name]!”
* Quote section (motivational).
* Summary Cards (auto-refresh when enrollment updates):

  * 🧍‍♀️ Total Enrolled Students this Term
  * 🆕 Newly Registered Students
  * 📚 Average Units per Student
  * 🚫 Sections at Full Capacity

* Quick filters: Program, Year Level, Semester.
* Chart: “Enrollment Trend by Program” (line + stacked bar toggle).
* Table widget: “Sections Reaching Slot Limit” (shows section, subject, remaining slots).

---

### **3.2 Enrollment Workspace**

**Single screen that powers all admission-side enrollment.**

* **Student Toggle:**

  * 🆕 **New Student** – reveals a registration panel.
  * 👩‍🎓 **Current Student** – enables search dropdown with autocomplete.

* **New Student Workflow:**

  1. Fill out **Student Registration Form** (name, birthdate, contact, address, guardian info, program, year level, semester).
  2. Upload optional supporting documents (ID, credentials).
  3. Click **Create Student** → system generates Student ID, user account, and password setup link.
  4. After save, form collapses and the Enrollment Form opens automatically for the newly created student.

* **Current Student Workflow:**

  1. Search and select an existing student (search by name, Student ID, or email).
  2. System preloads profile summary (program, year level, status, remaining INC subjects).
  3. Enrollment Form loads with auto-recommended subjects.

* **Enrollment Form:**

  * Recommended subjects listed first (program + semester mapping). Regular students are locked to this list.
  * Retake tab shows eligible subjects tagged by repeat logic (auto-calculated availability).
  * Manual subject picker for irregular students with filters (subject code, units, schedule).
  * Each subject row shows section options with slot counts and schedule; full sections are hidden.
  * Prerequisite warnings appear inline with tooltip details.
  * Unit counter with progress ring (warns when exceeding recommended load).
  * Action buttons: **Review Summary**, **Save Enrollment**, **Cancel**.

* **Summary Modal:**

  * Displays student info, selected subjects + sections, total units, fees placeholder.
  * Includes confirmation checkbox (“I certify the above schedule was verified with the student”).
  * Upon confirmation, updates student enrollment record, section slot counts, and dashboard stats.

---

### **3.3 Repeat & Eligibility Monitor**

* Focused list of students with pending INC/failed subjects.
* Columns: Student, Subject, Grade, Date Encoded, Subject Type, Eligible On, Status.
* Auto-highlights items that become eligible this term (green badge).
* Quick actions:

  * **Open in Enrollment** – jumps to Enrollment Workspace with student pre-selected.
  * **View History** – modal showing previous attempts and completion notes.

---

### **3.4 Student Directory**

* Global search + filters (Program, Year Level, Status, Enrollment Term).
* Table columns: Student ID, Name, Program, Year, Enrollment Status, Last Updated, Actions.
* Action drawer: view profile, resend password setup link, print enrollment summary.

---

### **3.5 Analytics (Business Intelligence)**

* Filters: Term / Program / Year Level / Section.
* **Widgets & Charts:**

  * Donut: Enrollment by Status (New, Continuing, Returned).
  * Bar: Subjects with Highest Retake Counts.
  * Line: Enrollment Completion Rate per Week.
  * Table: Sections Near Capacity (sortable by remaining slots).
  * Card: Total Retake Approvals this Term.
  * Card: Average Processing Time per Enrollment Session.

---

## **4. HEAD (Dean / Department Head)** *(has sidebar to navigate between pages)*

### **4.1 Dashboard**

* Welcome user + motivational quote.
* Summary cards:

  * 🧑‍🏫 Total Professors
  * 📚 Total Subjects
  * 👥 Active Sections
  * 📈 Pass Rate % (department-level)
* Graph: Pass/Fail Ratio per Program (bar chart).

---

### **4.2 Professors**

* Table of professors with search, pagination, filters (active/inactive).
* Actions:

  * **Edit**, **Delete**, **Assign to Section**
* Modal: Assign professor to section → dropdown for available subjects.

---

### **4.3 Subjects**

* Table with subject details (code, title, units, prerequisites).
* CRUD buttons.
* Upload/Update Syllabus (PDF).
* Add or edit **Summary Description**.

---

### **4.4 Sections**

* CRUD table for sections (term, subject, schedule, room, professor).
* Filters for term and subject.
* Assign professor directly from dropdown.

---

## **5. PROFESSOR / TEACHER** *(has sidebar to navigate between pages)*

### **5.1 Dashboard**

* Welcome message.
* Summary cards:

  * 📚 Sections Assigned
  * 👨‍🎓 Total Students
  * 🧾 Pending Grades to Encode

---

### **5.2 My Classes**

* Table per section:

  | Section | Subject | Schedule   | Students | Actions           |
  | ------- | ------- | ---------- | -------- | ----------------- |
  | BSIS3A  | IT301   | TTh 9–11AM | 32       | **View Students** |

* Clicking “View Students” shows student list with ID, name, grade input field (if not encoded yet).

---

### **5.3 Grades**

* Form to encode or update grades.
* Validation alert if grade field empty.
* Button: **Submit Grades → Confirmation Modal**
* Displays status (Pending / Approved / INC).

---

### **5.4 Analytics**

* Shows grade distribution for each section (bar chart).
* Table: Top Performing Students.
* Pie chart: Pass vs. Fail ratio.

---

## **6. ADMIN** *(has sidebar to navigate between pages)*

### **6.1 Dashboard**

* Welcome message + system quote.
* System Overview Cards:

  * 🧑‍🎓 Total Users
  * 📘 Programs
  * 🧾 Curriculums
  * 🏫 Departments

---

### **6.2 Manage Curriculum**

* Table: curriculum list per sector and program.
* CRUD buttons.
* Modal for linking curriculum to programs (dropdown select).

---

### **6.3 Manage Programs**

* Table: programs list (code, name, department, sector).
* CRUD options.
* Search + filter by sector or department.

---

### **6.4 Manage System Settings**

* Manage roles and permissions.
* Toggle switches for account activation.
* Configure system defaults (academic year, term).

---

### **6.5 Analytics Dashboard (Full Access)**

* **Global Dashboard** with filters: Year / Term / Role / Program
* Tabs for:

  * Enrollment Analytics
  * Grade Analytics
  * Admission Analytics
  * Faculty Analytics
  * System Logs
* Download buttons for CSV / PDF export.
