# 🧠 **1. System Overview**

**System Name:** Richwell College Portal
**Goal:** Unified web-based portal for enrollment management, grade viewing, and academic analytics.

---

### 🎯 **Primary Roles**

| Role          | Core Function                                           |
| ------------- | ------------------------------------------------------- |
| **Student**   | View grades, GPA, and INC summary only                  |
| **Professor** | Encode grades, manage sections, view class analytics    |
| **Registrar** | Approve grades, manage records, and academic term setup |
| **Admission** | Handle all enrollment workflows and create accounts     |
| **Dean**      | Monitor analytics and oversee academic performance      |

---

# 🧩 **2. System Modules (Functional Breakdown)**

---

### 🏫 **A. Authentication & Roles**

* Login system (Email/ID + Password)
* Role-based access control (RBAC)
* Password setup for new students (during enrollment)
* Password reset (email or OTP-based)

---

### 📝 **B. Enrollment Management (Inside Admission UI)**

**Handled entirely by the Admission Office**

Students **do not log in** to enroll.
Admission staff handle both **new** and **current** students from one dashboard.

---

#### 💡 **Flow**

1. **Registrar** creates sections linked to professors, subjects, and available slots.
2. **Admission** logs in and opens the enrollment dashboard.
3. Inside the **Admission UI**:

   * 🆕 **New Student (Toggle ON)**

     * Shows **Student Registration Form** for data entry.
     * System creates a `user` + `student` record.
     * Generates Student ID and default password setup link.
     * Moves directly to **Enrollment Form**.
   * 👩‍🎓 **Current Student (Toggle OFF)**

     * Admission selects existing student (via search).
     * Enrollment Form loads automatically.
4. **System Auto-Recommends Subjects:**

   * Based on student’s **program**, **year level**, and **semester**.
   * Filters out passed subjects.
   * Includes **re-take subjects** if eligible.
   * Checks prerequisites and slot availability.
5. Admission confirms subjects → summary modal appears.
6. Once saved, data updates **Admission Dashboard** and **Section Slot counts**.

---

#### ⚙️ **Validation Rules**

| Rule                      | Description                                   |
| ------------------------- | --------------------------------------------- |
| INC / failed prerequisite | Subject hidden or locked until resolved       |
| Slot limit                | Section hidden when full                      |
| Regular students          | Auto-recommended subjects only                |
| Irregular students        | Manual subject selection                      |
| Repeat eligibility        | Auto-checks re-enroll period                  |
| No applicant process      | Admission handles all registration/enrollment |

---

### 🔁 **C. Automatic Repeat & Eligibility Logic**

#### ⚙️ Rules

| Subject Type | Re-enroll After | Condition                                        |
| ------------ | --------------- | ------------------------------------------------ |
| **Major**    | 6 months        | If INC or failed and not resolved after 6 months |
| **Minor**    | 1 year          | If INC or failed and not resolved after 1 year   |

#### 💡 Behavior

1. When a professor encodes **INC** or **5.0**, system logs `date_encoded`.
2. The system checks the subject type and calculates eligibility duration.
3. When the period passes (6 or 12 months), subject becomes **available for re-enrollment** automatically.
4. During enrollment, the subject appears under **Recommended (Re-take)** list.

#### 🧠 Pseudocode

```js
if (subject.grade === 'INC' || subject.grade === '5.0') {
  const monthsPassed = monthsBetween(subject.date_encoded, currentDate);

  if (subject.type === 'major' && monthsPassed >= 6) {
    subject.eligible_for_reenroll = true;
  } 
  else if (subject.type === 'minor' && monthsPassed >= 12) {
    subject.eligible_for_reenroll = true;
  } 
}
```

✅ The system auto-updates eligibility status at each new term.

---

### 📘 **D. Subjects & Sections Management**

**Managed by Registrar**

* Add/edit subjects (code, name, units, type, semester, prerequisite).
* Assign subjects to programs and year levels for automatic recommendation.
* Create sections linked to professors and set maximum slots.
* Manage subject activation per term.

---

### 🧾 **E. Grades Management**

#### Professor Side:

* View assigned sections.
* Encode grades via dropdown:

  ```
  [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0, INC, DRP]
  ```
* View class analytics: grade distribution, average, INC count.

#### Registrar Side:

* Approve or override grades (with audit trail).
* Generate grade summaries and transcripts.

#### Student Side:

* View grades per semester.
* See computed GPA and INC summary only.

---

### 🧾 **F. INC Resolution**

1. Student sees INC status on dashboard.
2. Professor updates grade after completion.
3. Registrar reviews and approves.
4. System logs the change and updates GPA automatically.

✅ Works for both online and manual completion forms.

---

### 📊 **G. Analytics & BI Dashboards**

| Role          | Analytics Type                                         |
| ------------- | ------------------------------------------------------ |
| **Dean**      | Subject performance, course pass rate, grade stats     |
| **Registrar** | Enrollment trends, grade summaries, completion reports |
| **Admission** | Enrollment stats (new vs returning, per program)       |
| **Professor** | Class performance, grade analytics                     |
| **Student**   | GPA and INC summary only                               |

✅ Built using **Chart.js / Recharts**

---

### ⚙️ **H. System Settings (Registrar/Admin)**

* Manage academic year and semester.
* Add/edit programs, subjects, professors, and courses.
* Set enrollment open/close dates.
* View and export system activity logs.

---

# 🧩 **3. Database Design (Final Core Tables)**

| Table             | Key Columns                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `users`           | user_id, name, email, password, role                                                          |
| `students`        | student_id, user_id (FK), program_id, year_level, status                                      |
| `professors`      | professor_id, user_id (FK), department                                                        |
| `programs`        | program_id, code, name, department                                                            |
| `subjects`        | subject_id, code, name, units, type (major/minor), semester, prerequisite_id (FK), program_id |
| `sections`        | section_id, name, professor_id, subject_id, max_slots, semester, academic_year                |
| `enrollments`     | enrollment_id, student_id, section_id, status, date_enrolled                                  |
| `grades`          | grade_id, enrollment_id, value, remarks, date_encoded, approved (bool)                        |
| `inc_resolutions` | resolution_id, student_id, subject_id, old_grade, new_grade, approved_by_registrar            |
| `academic_terms`  | term_id, school_year, semester, active (bool)                                                 |
| `activity_logs`   | log_id, user_id, action, timestamp                                                            |

---

# 💻 **4. Tech Stack Suggestion**

| Layer        | Tech                                   |
| ------------ | -------------------------------------- |
| **Frontend** | React + Tailwind + Recharts            |
| **Backend**  | Node.js (Express)                      |
| **Database** | MySQL / PostgreSQL                     |
| **Auth**     | JWT or Session-based                   |
| **Hosting**  | Vercel, Render, or Local School Server |

---

# 📆 **5. Development Roadmap**

| Phase | Module             | Description                            |
| ----- | ------------------ | -------------------------------------- |
| **1** | Auth & Roles       | Staff login and RBAC setup             |
| **2** | Enrollment         | Admission UI + Recommended Subjects    |
| **3** | Subjects/Sections  | CRUD + linkage to professors and terms |
| **4** | Grades             | Encoding + approval workflow           |
| **5** | INC & Repeat Logic | Auto repeat + eligibility tracking     |
| **6** | Analytics & Logs   | Dashboards + activity logs             |

---

✅ **Summary of Key Features**

* Enrollment handled only by Admission
* “New Student” toggle creates student account instantly
* Auto-load recommended subjects during enrollment
* Re-take logic: 6 months for majors, 1 year for minors
* No schedule or timetable management (for now)
* Simple, analytics-ready design

---
