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

* Summary Cards:

  * 🧾 Total Applicants
  * ✅ Accepted Applicants
  * ❌ Rejected Applicants
  * ⏳ Pending Applications

* Graph: “Applicants Over Time” (line chart).

---

### **3.2 Student Account Creation / Enrollment Form**

* **Form Fields:**

  * Full Name
  * Email Address
  * Desired Program (Dropdown)
  * Uploaded Requirements (multiple file upload with validation)
* Buttons:

  * **Submit** – saves new applicant record
  * **Clear Form** – reset
* Confirmation modal after submission: “Student application successfully recorded!”

---

### **3.3 Students**

* Table of Applicants Pending Review:

  | Applicant Name | Program | Submitted Docs | Status  | Actions                                  |
  | -------------- | ------- | -------------- | ------- | ---------------------------------------- |
  | Juan Dela Cruz | BSIS    | 5/6 uploaded   | Pending | **View (👁)** / **Approve** / **Reject** |

* **View Modal:**

  * Displays applicant info + uploaded documents (viewable).
  * Button: **Confirm Create Student Account** (if accepted).
  * Queue note: “This student was processed by Admission 1.”

---

### **3.4 Manage Applicant Records**

* Table with search and pagination.
* Can update applicant info, reassign to another program, or archive.
* Status filter (Accepted, Rejected, Pending).

---

### **3.5 View Analytics (Business Intelligence)**

* Filters: Term / Program / Department
* **Widgets & Charts:**

  * Donut: Application Status (Pending, Accepted, Rejected)
  * Bar: Applications per Program
  * Line: Application Trends per Month
  * Table: Conversion Rate (Applicants → Students)
  * Card: Average Processing Time
  * Card: Total Missing Documents

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
