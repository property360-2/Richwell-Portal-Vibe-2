# **School Portal Development Phases (Full, Local Hosting Version)**

---

## **Phase 0: Planning & Requirements Gathering** Done

**Goal:** Define system scope and rules before coding.

1. Meet with stakeholders: Registrar, Dean, Admission, Professors, Students.
2. Create **user stories per role**:

   * **Students:** enroll, view grades, GPA, INC tracking.
   * **Professors:** encode grades, view sections, manage INCs.
   * **Registrar:** create sections, approve grades, enrollment analytics.
   * **Admission:** handle enrollment workflow.
   * **Dean:** assign professors, monitor academic performance.
3. Define **system rules**:

   * Max 30 units per semester
   * INC restrictions and year standing rules
   * Repeat logic (major/minor)
   * Prerequisite checks
4. Draft **ERD & database schema** (core + optional tables).
5. Identify **pre-built reusable components**:

   * Buttons, modals, tables, dropdowns, alerts, cards, charts.

---

## **Phase 1: Local Development Setup** 

**Goal:** Prepare dev environment and project structure.

1. Initialize **Node.js + Express** backend project.
2. Initialize **React + Tailwind** frontend project.
3. Install **ORM** (Prisma or TypeORM) for DB connection.
4. Install **Postman** for API testing.
5. Set up **local MySQL/MariaDB** database.
6. Create **reusable component folder** in React:

   ```
   /components
     Button.jsx
     Modal.jsx
     Table.jsx
     InputField.jsx
     Dropdown.jsx
     Chart.jsx
     DashboardCard.jsx
   ```
7. Configure **environment variables** (`.env`) for DB connection and auth.

---

## **Phase 2: Authentication & Role Management**

**Goal:** Secure login with role-based access.

1. Backend: implement **login/logout, session management**, JWT optional.
2. Frontend: use reusable **LoginForm**, **InputField**, **Alert** components.
3. Role-based middleware:

   * Students → dashboard & enrollment
   * Professors → grade entry + sections
   * Registrar → enrollment approvals
   * Admission → enrollment workflow
   * Dean → assignments & analytics
4. Password hashing & reset flows.
5. Test login for all roles locally.

---

## **Phase 3: Academic Data Management**

**Goal:** Manage programs, subjects, sections, and terms.

1. **Programs CRUD** → use Table, Modal, Button components.
2. **Subjects CRUD** → manage `year_standing` (nullable), prerequisites.
3. **Sections CRUD** → assign professors, max slots, schedule.
4. **Academic Terms CRUD** → create active semester/year.
5. Test all CRUD operations on local server.
6. Prepare baseline catalog rows as outlined in the [data seeding reference](./seeding.md).

---

## **Phase 4: Enrollment System**

**Goal:** Build full student enrollment workflow.

1. Registrar creates sections.
2. Admission opens enrollment form.
3. Student enrollment workflow:

   * Recommended subjects per semester
   * Add/drop subjects (≤30 units)
   * Validate prerequisites, year standing, INCs
   * Validate section slot availability
   * Summary modal → oath modal → confirm
   * Auto-generate student ID & password for new students
4. Save enrollment data to `enrollments` and `enrollment_subjects`.
5. Update **admission dashboard analytics**.
6. Test workflows locally:

   * Regular vs irregular students
   * INC blocking
   * Max units enforcement
   * Section slot limits

---

## **Phase 5: Grades Management**

**Goal:** Enter, approve, and view grades with INC & repeat logic.

1. Professors enter grades using **GradeTable** (dropdown only).
2. Students view grades (current & past) + GPA summary.
3. INC resolution workflow:

   * Students see INCs
   * Professors enter resolved grade
   * Registrar approves after completion form
4. Repeat logic:

   * Major → repeat after 6 months
   * Minor → repeat after 1 year
5. Validate all grades → only valid dropdown values.
6. Test complete workflow locally.

---

## **Phase 6: Analytics & Dashboard**

**Goal:** Role-based data visualization.

**Status:** Primary analytics services delivered; backlog captured below.

### ✅ Completed in the latest milestone

1. **Role-driven analytics APIs** finalized for all user types with authorization guards and Prisma aggregations. Registrar, dean, and admission dashboards are now cached per active term to reduce repeated load on enrollment/grade tables.【F:richwell-portal/backend/src/routes/analyticsRoutes.js†L4-L22】【F:richwell-portal/backend/src/controllers/analyticsController.js†L239-L330】【F:richwell-portal/backend/src/controllers/analyticsController.js†L332-L465】
2. **Admissions intelligence** exposes day-level trends, confirmation metrics, program distribution, and the latest enrollment activity, refreshed automatically after each status transition.【F:richwell-portal/backend/src/controllers/analyticsController.js†L467-L640】【F:richwell-portal/backend/src/controllers/enrollmentController.js†L409-L559】
3. **Professor and student dashboards** compute GPA, INC/fail counts, section rosters, and grade distributions with shared helpers so key academic markers render consistently in the UI.【F:richwell-portal/backend/src/controllers/analyticsController.js†L9-L238】【F:richwell-portal/frontend/src/pages/dashboards/ProfessorDashboard.jsx†L1-L200】
4. **Regression coverage** expanded via analytics smoke tests (backend) and Playwright dashboard fixtures (frontend) to keep chart payloads in sync during CI.【F:richwell-portal/backend/package.json†L10-L18】【F:richwell-portal/backend/scripts/analyticsSmoke.js†L30-L222】【F:richwell-portal/frontend/tests/e2e/dashboard.spec.ts†L1-L332】
5. **Cache invalidation hooks** fire after enrollment confirmations/cancellations so admission widgets immediately reflect pipeline changes.【F:richwell-portal/backend/src/controllers/enrollmentController.js†L403-L559】

### ⏳ Outstanding follow-ups

- Extend caching helpers to student and professor analytics to reduce repeated GPA calculations during heavy usage.【F:richwell-portal/backend/src/controllers/analyticsController.js†L9-L238】
- Implement automated smoke probes for each analytics endpoint post-deploy (currently manual run via `npm run analytics:smoke`).【F:richwell-portal/backend/package.json†L10-L18】
- Broaden analytics logging/monitoring to capture chart query performance in production-like environments.【F:Documentation/todo.md†L33-L34】

---

## **Phase 7: Frontend UI/UX**

**Goal:** Create consistent, reusable, user-friendly interface.

1. Use pre-built **Button, Modal, Table, InputField, Dropdown, Card** components.
2. Ensure **consistent color scheme, spacing, typography** (Tailwind).
3. Implement **form validation**, warnings for rules (INC, max units).
4. Test UI on multiple devices over local Wi-Fi.

---

## **Phase 8: Validation & Testing**

**Goal:** Ensure system correctness.

1. Unit tests → backend functions (enrollment, grades, repeat rules).
2. Integration tests → full workflow: enrollment → grades → INC → repeat.
3. Frontend tests → reusable components (forms, tables, modals).
4. Edge case tests:

   * INC blocking for year-standing subjects
   * Max 30 units per semester
   * Section slot limits
   * Repeat eligibility dates

---

## **Phase 9: Local Deployment**

**Goal:** Make portal accessible over school Wi-Fi.

1. Deploy Node.js + MySQL on **local school server/computer**.
2. Serve React frontend via Node.js or static files.
3. Configure **local IP** (e.g., `http://192.168.1.xxx:3000`) for Wi-Fi access.
4. Set **static IP** to prevent IP changes.
5. Test full system on multiple devices in the local network.
6. Regular **database backup** on local storage.

---

## **Phase 10: Maintenance & Updates**

**Goal:** Keep the system stable and extendable.

1. Monitor server logs for errors.
2. Fix bugs and improve features.
3. Update reusable components consistently.
4. Daily/weekly database backups.
5. Collect feedback for UI/UX improvements.
6. Add optional modules later:

   * Notifications
   * Advanced BI dashboards
   * Scheduling system

---
