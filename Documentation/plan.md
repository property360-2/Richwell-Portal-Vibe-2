## 🧠 **1. System Overview**

**System Name (placeholder):** Richwell College Portal
**Goal:** Unified web-based portal for enrollment, grades, and analytics.

### 🎯 **Primary Roles**

| Role          | Core Function                                                      |
| ------------- | ------------------------------------------------------------------ |
| **Student**   | Enrollment, grades, INC/resolution, GPA summary                    |
| **Professor** | Encode grades, manage sections, analytics for classes              |
| **Registrar** | Manage sections, approve grades, official records, analytics       |
| **Admission** | Manage enrollment workflow, applicant tracking, analytics          |
| **Dean**      | Assign professors, manage schedules, academic oversight, analytics |

---

## 🧩 **2. System Modules (Functional Breakdown)**

### 🏫 **A. Authentication & Roles**

* Login system (Email/ID + Password)
* Role-based access control (RBAC)
* Password setup for new students after enrollment
* Reset password (email or OTP-based)

---

### 📝 **B. Enrollment Management**

#### Flow:

1. **Registrar** creates sections (linked to professors, subjects, slots)
2. **Admission** opens enrollment UI
3. **Applicant/Student**:

   * Fills form
   * Auto-recommended subjects per sem
   * Can add subjects (≤30 units)
   * System validates prerequisites + INCs
   * Shows available sections with slots
   * Modal summary → oath modal → confirm
   * If new student → generates Student ID + password setup
4. **Admission Dashboard** updates summary analytics automatically

#### Rules:

* INC or failed prerequisite → cannot enroll related subject
* INC last sem (core subject) → blocks related subject
* Slot limit per section (updates dynamically)
* Regular = choose section; Irregular = choose subject per section

---

### 🧾 **C. Grades Management**

#### Professor Side:

* View assigned sections
* CRUD grades per student
* Dropdown-only input for grades:

  ```
  [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0, INC, DRP]
  ```
* Analytics: grade distribution, class average, INC count

#### Registrar Side:

* Approve updated grades after completion form
* Override if correction requested (with log tracking)
* Generate transcript/report summary

#### Student Side:

* View grades (per sem + all time)
* See GPA summary and INC subjects

---

### 🧾 **D. INC Resolution**

1. Student sees INCs on dashboard.
2. Student + Professor meet.
3. Professor encodes updated grade.
4. Registrar verifies via physical form → approves update.
5. System updates official grade record.

✅ Digital workflow + real-world paper validation supported.

---

### 📚 **E. Subject & Repeat Logic**

* Each subject tagged as **major** or **minor**
* Repeat rules:

  | Type      | Repeat After | Example                                     |
  | --------- | ------------ | ------------------------------------------- |
  | **Major** | 6 months     | Failed in 1st sem → can retake 2nd sem      |
  | **Minor** | 1 year       | Failed in 1st sem → retake next school year |
* System auto-computes `repeat_eligible_date` when a student fails a subject.
* Enrollment form checks eligibility date before allowing re-enroll.

---

### 📊 **F. Analytics & BI Dashboards**

**Accessible to:** Dean, Registrar, Admission, Professors (basic), Students (summary)

| Role          | Analytics Type                                            |
| ------------- | --------------------------------------------------------- |
| **Dean**      | Prof/Section load, subject performance, course pass rate  |
| **Registrar** | Enrollment stats, completion reports, grade distributions |
| **Admission** | Applicant/enrollee trends, per-course totals              |
| **Professor** | Grade distribution, class averages, INC tracking          |
| **Student**   | GPA + INC summary only (no charts)                        |

✅ Implement using **Chart.js / Recharts** for interactive charts.

---

### ⚙️ **G. System Settings (Admin or Registrar only)**

* Manage academic year/semester
* Add/edit programs, subjects, professors, and courses
* Set enrollment period (open/close dates)
* System logs (activity tracking)

---

## 🧩 **3. Database Design (Preview of Core Tables)**

| Table             | Key Columns                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `users`           | user_id, name, email, password, role                                               |
| `students`        | student_id, user_id (FK), program_id, year_level, status                           |
| `professors`      | professor_id, user_id (FK), department                                             |
| `subjects`        | subject_id, code, name, units, subject_type (major/minor), prerequisite_id         |
| `sections`        | section_id, name, professor_id, subject_id, max_slots, semester                    |
| `enrollments`     | enrollment_id, student_id, section_id, status, date_enrolled                       |
| `grades`          | grade_id, enrollment_id, value, remarks, date_encoded, approved (bool)             |
| `inc_resolutions` | resolution_id, student_id, subject_id, old_grade, new_grade, approved_by_registrar |
| `analytics_logs`  | id, user_id, action, timestamp                                                     |
| `academic_terms`  | term_id, school_year, semester, active (bool)                                      |

---

## 💻 **4. Tech Stack Suggestion**

| Layer          | Tech                                        |
| -------------- | ------------------------------------------- |
| **Frontend**   | React (with Tailwind UI + Recharts)         |
| **Backend**    | Node.js (Express) or Laravel (PHP)          |
| **Database**   | MySQL / PostgreSQL                          |
| **Auth**       | JWT or Session-based                        |
| **Hosting**    | Render, Vercel, or school’s local server    |
| **BI/Reports** | Chart.js, Recharts, or Power BI integration |

---

## 📆 **5. Development Roadmap**

| Phase | Module       | Description                                |
| ----- | ------------ | ------------------------------------------ |
| **1** | Auth & Roles | Basic login + access levels                |
| **2** | Enrollment   | Section creation → student enrollment flow |
| **3** | Grades       | Professor CRUD + registrar approval        |
| **4** | INC & Repeat | Resolution and repeat rules                |
| **5** | Analytics    | Dashboards per role                        |
| **6** | Polish       | UI design, modals, logs, testing           |

