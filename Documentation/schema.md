## 🧩 **1. Core Entity List**

We’ll divide it by function to keep things clean.

### 🧠 **A. User & Role Management**

| Table     | Purpose                                                             |
| --------- | ------------------------------------------------------------------- |
| **users** | Master account table for login/authentication                       |
| **roles** | Defines user roles (student, professor, registrar, admission, dean) |

---

### 🎓 **B. Student & Professor Info**

| Table          | Purpose                                     |
| -------------- | ------------------------------------------- |
| **students**   | Student-specific data (linked to `users`)   |
| **professors** | Professor-specific data (linked to `users`) |

---

### 📘 **C. Academic & Curriculum Data**

| Table              | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| **programs**       | Course or degree programs (e.g., BSCS, BSEd)               |
| **subjects**       | All subjects offered (with type, units, and prerequisites) |
| **sections**       | Section groups per subject, linked to professors           |
| **academic_terms** | Defines semester and school year info                      |

---

### 🧾 **D. Enrollment & Grades**

| Table                   | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| **enrollments**         | Tracks student enrollment per term              |
| **enrollment_subjects** | Subjects the student takes per enrollment       |
| **grades**              | Records grades per student per subject          |
| **inc_resolutions**     | For tracking incomplete (INC) grade completions |

---

### 📊 **E. Analytics & Logs**

| Table              | Purpose                                     |
| ------------------ | ------------------------------------------- |
| **analytics_logs** | For BI/tracking actions or summary data     |
| **activity_logs**  | System logs for auditing actions (optional) |

---

## 🧱 **2. Table Structure Overview**

### 🧩 `roles`

| Column      | Type     | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `role_id`   | INT (PK) | Unique ID                                           |
| `role_name` | VARCHAR  | e.g. student, professor, registrar, admission, dean |

---

### 🧩 `users`

| Column       | Type                      | Description |
| ------------ | ------------------------- | ----------- |
| `user_id`    | INT (PK)                  |             |
| `email`      | VARCHAR                   |             |
| `password`   | VARCHAR                   |             |
| `role_id`    | INT (FK → roles.role_id)  |             |
| `status`     | ENUM('active','inactive') |             |
| `created_at` | DATETIME                  |             |

---

### 🧩 `students`

| Column       | Type                                   | Description |
| ------------ | -------------------------------------- | ----------- |
| `student_id` | INT (PK)                               |             |
| `user_id`    | INT (FK → users.user_id)               |             |
| `student_no` | VARCHAR (unique)                       |             |
| `program_id` | INT (FK → programs.program_id)         |             |
| `year_level` | INT                                    |             |
| `gpa`        | DECIMAL(3,2)                           |             |
| `has_inc`    | BOOLEAN                                |             |
| `status`     | ENUM('regular','irregular','inactive') |             |

---

### 🧩 `professors`

| Column              | Type                          | Description |
| ------------------- | ----------------------------- | ----------- |
| `professor_id`      | INT (PK)                      |             |
| `user_id`           | INT (FK → users.user_id)      |             |
| `department`        | VARCHAR                       |             |
| `employment_status` | ENUM('full-time','part-time') |             |

---

### 🧩 `programs`

| Column         | Type     | Description |
| -------------- | -------- | ----------- |
| `program_id`   | INT (PK) |             |
| `program_name` | VARCHAR  |             |
| `program_code` | VARCHAR  |             |
| `description`  | TEXT     |             |

---

### 🧩 `subjects`

| Column                 | Type                                       | Description                                  |
| ---------------------- | ------------------------------------------ | -------------------------------------------- |
| `subject_id`           | INT (PK)                                   |                                              |
| `code`                 | VARCHAR(20)                                | e.g., “AOOP101”                              |
| `name`                 | VARCHAR(100)                               |                                              |
| `units`                | INT                                        |                                              |
| `subject_type`         | ENUM('major','minor')                      |                                              |
| `year_standing`        | ENUM('1st','2nd','3rd','4th') **NULLABLE** | If null → no year restriction                |
| `recommended_year`     | ENUM('1st','2nd','3rd','4th') **NULLABLE** | The year this subject is recommended for     |
| `recommended_semester` | ENUM('1st','2nd','summer') **NULLABLE**    | The semester this subject is recommended for |
| `program_id`           | INT (FK → programs.program_id)             |                                              |
| `prerequisite_id`      | INT NULL (FK → subjects.subject_id)        |                                              |

---

### 🧩 `sections`

| Column            | Type                               | Description |
| ----------------- | ---------------------------------- | ----------- |
| `section_id`      | INT (PK)                           |             |
| `name`            | VARCHAR                            |             |
| `subject_id`      | INT (FK → subjects.subject_id)     |             |
| `professor_id`    | INT (FK → professors.professor_id) |             |
| `max_slots`       | INT                                |             |
| `available_slots` | INT                                |             |
| `semester`        | VARCHAR                            |             |
| `school_year`     | VARCHAR                            |             |
| `schedule`        | VARCHAR                            |             |
| `status`          | ENUM('open','closed')              |             |

---

### 🧩 `academic_terms`

| Column        | Type                       | Description |
| ------------- | -------------------------- | ----------- |
| `term_id`     | INT (PK)                   |             |
| `school_year` | VARCHAR (e.g. "2025-2026") |             |
| `semester`    | ENUM('1st','2nd','summer') |             |
| `is_active`   | BOOLEAN                    |             |

---

### 🧩 `enrollments`

| Column          | Type                                    | Description |
| --------------- | --------------------------------------- | ----------- |
| `enrollment_id` | INT (PK)                                |             |
| `student_id`    | INT (FK → students.student_id)          |             |
| `term_id`       | INT (FK → academic_terms.term_id)       |             |
| `date_enrolled` | DATETIME                                |             |
| `total_units`   | INT                                     |             |
| `status`        | ENUM('pending','confirmed','cancelled') |             |

---

### 🧩 `enrollment_subjects`

| Column          | Type                                 | Description |
| --------------- | ------------------------------------ | ----------- |
| `id`            | INT (PK)                             |             |
| `enrollment_id` | INT (FK → enrollments.enrollment_id) |             |
| `section_id`    | INT (FK → sections.section_id)       |             |
| `subject_id`    | INT (FK → subjects.subject_id)       |             |
| `units`         | INT                                  |             |

---

### 🧩 `grades`

| Column                  | Type                                                                                    | Description |
| ----------------------- | --------------------------------------------------------------------------------------- | ----------- |
| `grade_id`              | INT (PK)                                                                                |             |
| `enrollment_subject_id` | INT (FK → enrollment_subjects.id)                                                       |             |
| `grade_value`           | ENUM('1.0','1.25','1.5','1.75','2.0','2.25','2.5','2.75','3.0','4.0','5.0','INC','DRP') |             |
| `remarks`               | VARCHAR                                                                                 |             |
| `encoded_by`            | INT (FK → professors.professor_id)                                                      |             |
| `approved`              | BOOLEAN                                                                                 |             |
| `date_encoded`          | DATETIME                                                                                |             |
| `repeat_eligible_date`  | DATE (auto-calculated for failed/INC subjects)                                          |             |

---

### 🧩 `inc_resolutions`

| Column                  | Type                               | Description |
| ----------------------- | ---------------------------------- | ----------- |
| `resolution_id`         | INT (PK)                           |             |
| `student_id`            | INT (FK → students.student_id)     |             |
| `subject_id`            | INT (FK → subjects.subject_id)     |             |
| `old_grade`             | ENUM(‘INC’)                        |             |
| `new_grade`             | ENUM('1.0','1.25',...,'5.0')       |             |
| `professor_id`          | INT (FK → professors.professor_id) |             |
| `approved_by_registrar` | BOOLEAN                            |             |
| `date_submitted`        | DATETIME                           |             |

---

### 🧩 `analytics_logs`

| Column        | Type                     | Description |
| ------------- | ------------------------ | ----------- |
| `log_id`      | INT (PK)                 |             |
| `user_id`     | INT (FK → users.user_id) |             |
| `action`      | VARCHAR                  |             |
| `description` | TEXT                     |             |
| `timestamp`   | DATETIME                 |             |

---

## 🧮 **3. ERD Relationships (Summary View)**

```
roles ───< users ───< students
                 └───< professors

programs ───< subjects ───< sections
                     ↑         ↑
                     └───< grades ───< inc_resolutions

academic_terms ───< enrollments ───< enrollment_subjects ───< grades

students ───< enrollments
professors ───< sections
registrar/admission (via users.role)
```

-