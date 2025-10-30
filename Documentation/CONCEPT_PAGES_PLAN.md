# Richwell College Portal — Concept, Pages, and Implementation Plan

> Scope: End-to-end plan to complete the portal with great UX/UI.
> Tech: **Node.js (Express + Prisma + MySQL)**, **Vite + React + Tailwind + shadcn/ui + Zustand + Recharts**.

---
## 0) Prime Directives (READ ME)

1. **Follow** `Documentation/CONCEPT_PAGES_PLAN.md` exactly.
2. **Keep tests green** (backend Jest + Supertest; frontend Vitest + RTL).
3. **No broken seeds/migrations**.
4. **Great UX**: collapsible sidebar, clear toasts/errors, printables.
5. **Safe changes**: small commits, clear messages, run locally before commit.
6. **Never commit secrets** (`.env*`, tokens).
7. **Stop** when Definition of Done (below) is satisfied.

## 1) Concept (What the system must do)

### 1.1 Core Goals

* Seamless **Enrollment** for **New**, **Old**, and **Transferee** students.
* Accurate **Grade Management** (Professors encode → Registrar approves).
* Clear **Analytics** for Deans/Registrar (enrollment, pass rates, top/at-risk).
* **Great UX**: collapsible sidebar, fast, consistent components, toasts, modals.

### 1.2 Roles & High-Level Capabilities

* **Admission**: Manage enrollment flows, create accounts, handle transferees, print COR.
* **Registrar**: Approve grades, manage terms, audit trails, issue records.
* **Professor**: Encode/update grades, manage sections, view class analytics.
* **Student**: View grades, GPA, COR history, enrollment status.
* **Dean/Head**: Program analytics, trends, KPIs.
* **Admin**: Programs, curriculums, subjects, sections, roles & permissions.

### 1.3 Enrollment Logic (Precise)

| Student Type               | UX Behavior                                                                                                            | System Rules                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New Student (Freshman)** | Full form (from `Documentation/enrollment_doc.md`). No semester selection by user.                                     | Validate form → create `User` + `Student` + `Enrollment(pending)` → Admission verifies → mark `confirmed`.                                              |
| **Old Student**            | Input **Student ID** → auto-show profile, current **Year** & **Semester**, **Recommended Subjects**, summary like COR. | Recommend subjects via curriculum + prerequisites + not-yet-passed. Manual add allowed if **total units ≤ 30**. Save as `pending` → Admission confirms. |
| **Transferee**             | Shorter form + **Prior School & Subjects**.                                                                            | Admission maps **subject equivalencies** first → then same as Old Student rules.                                                                        |
| **Returning (Inactive)**   | Reactivation modal.                                                                                                    | Admission must set `status=regular` before enrollment.                                                                                                  |

> **Definition of Done (Enrollment):**
>
> * New/Old/Transferee flows complete with validations & toasts
> * COR-style summary view generated after subject selection
> * Unit cap enforced, prereq checks enforced, errors explained in-line
> * Records persisted; statuses visible to both Admission and Student

---

## 2) Pages to Implement (UX-first, by role)

> Use **collapsible sidebar** (default open on desktop, collapsed on mobile), **PageHeader** with title/breadcrumbs, and **Card**/**DataTable** patterns. Use **shadcn/ui**, **lucide-react** icons, and Tailwind.

### 2.1 Global Layout

* **`layouts/AppLayout.jsx`**

  * Collapsible **Sidebar** (`isSidebarOpen` with toggle)
  * Topbar with page title, user menu
  * Dark mode support
* **`components/ui/Sidebar.jsx`** (shared)

  * Menu items filtered by role
  * Icons: `Home`, `User`, `GraduationCap`, `BookOpen`, `Settings`, etc.

### 2.2 Authentication

* **`pages/Login.jsx`**

  * Email/ID + Password, role-redirect after login
  * Error toast + loading state
* **`pages/NotAuthorized.jsx`** / **`pages/NotFound.jsx`**

### 2.3 Admission

* **`pages/admission/EnrollmentHub.jsx`**

  * Tabs: **New**, **Old**, **Transferee**, **Returning**
  * **New**: renders form from `enrollment_doc.md` (grouped sections, progressive)
  * **Old**: input Student ID → show **Recommended Subjects** + **Manual Add** + **Units Counter (<=30)** + **Preview COR**
  * **Transferee**: form + **Subject Equivalency** modal/table
  * **Returning**: reactivation flow
  * Actions: **Save Draft**, **Submit**, **Confirm**, **Print COR**
* **`pages/admission/Enlistments.jsx`**

  * Table of current term enrollments: status filters, search, per-row actions
* **`pages/admission/Accounts.jsx`**

  * Create accounts, reset passwords, view activation states

### 2.4 Registrar

* **`pages/registrar/Dashboard.jsx`** (cards + small charts)
* **`pages/registrar/GradeApprovals.jsx`**

  * Queue of grade submissions from Professors (Approve/Reject + remarks)
* **`pages/registrar/Terms.jsx`**

  * Create/open/close academic terms; set current term/semester
* **`pages/registrar/Records.jsx`**

  * Search students, view audit trail, printables

### 2.5 Professor

* **`pages/professor/Sections.jsx`**

  * Assigned sections; open **Encode Grades** modal per subject
* **`pages/professor/Grades.jsx`**

  * Class list, per-student grade input, save partials, submit final
* **`pages/professor/Analytics.jsx`**

  * Pass rates, distribution, outliers

### 2.6 Student

* **`pages/student/Dashboard.jsx`**

  * Current status (enrolled/not), term card, quick links
* **`pages/student/Grades.jsx`**

  * Term-by-term grades, GPA, INC summary
* **`pages/student/COR.jsx`**

  * Latest COR, print/download; history list

### 2.7 Dean/Head

* **`pages/dean/Analytics.jsx`**

  * Enrollment trends, pass rates by program, at-risk detection
  * Filters: term, year level, program

### 2.8 Admin

* **`pages/admin/Dashboard.jsx`**
* **`pages/admin/Programs.jsx`**, **`Curriculums.jsx`**, **`Subjects.jsx`**, **`Sections.jsx`**

  * CRUD with modals, search, filters
* **`pages/admin/Settings.jsx`**

  * Roles & permissions, toggles

---

## 3) Implementation Plan (phased, executable)

> Each phase ends with a running system (`npm run dev` both sides), clean lint, and minimal seed data.

### Phase 1 — Foundations (Day 0)

* Ensure repo structure matches guidelines (backend/frontend).
* Backend: env (`DATABASE_URL`, `JWT_SECRET`, etc.), Prisma generate & migrate.
* Frontend: global layout, theme, sidebar, route guards by role.
* ✅ **Output:** Login works → redirects to role dashboards; sidebar collapses.

### Phase 2 — Admission Enrollment Core

* Build **EnrollmentHub** tabs + forms: New, Old (ID → recommendations), Transferee (equivalency), Returning (reactivation).
* Backend endpoints (sketch below).
* COR preview component (table: code, title, units, total units).
* ✅ **Output:** Full enrollment flows persist as `pending`; unit cap/prereq enforced; toasts.

### Phase 3 — Registrar & Professor

* Professor: Sections, Encode Grades, submit to Registrar.
* Registrar: Grade approvals, Terms management, Records search.
* ✅ **Output:** End-to-end grade lifecycle (encode → approve → Student sees).

### Phase 4 — Student & Dean

* Student: Dashboard, Grades, COR pages.
* Dean: Analytics (Recharts): enrollment trend, pass rate, top/at-risk.
* ✅ **Output:** Read-only views stable, charts render from computed queries.

### Phase 5 — Admin & Data Integrity

* Admin CRUD for Programs, Curriculums, Subjects, Sections.
* Validation: subject prerequisites, unit limits, curriculum mapping integrity.
* ✅ **Output:** Admin flows maintain academic data without breaking enrollments.

### Phase 6 — Polish & Launch

* Loading states, empty states, error boundaries, accessibility pass.
* Print styles for COR & grade slips.
* Docs: `README` run steps, `CHANGELOG`, screenshots.
* ✅ **Output:** Demo-ready build.

---

## 4) Backend API (minimal contract to implement)

> Prefix all routes with `/api`. Protect with JWT, role middleware.

### 4.1 Auth

* `POST /auth/login` → `{ token, role, user }`
* `GET /auth/me` → current user profile

### 4.2 Enrollment

* `POST /enrollment/new` → create new student + enrollment (validates full form)
* `POST /enrollment/old/preview` → `{ studentId }` → returns profile, curriculum map, **recommended subjects**, current units, COR preview
* `POST /enrollment/old/submit` → `{ studentId, subjects[] }` → create enrollment (unit cap & prereq check)
* `POST /enrollment/transferee/equivalencies` → save mapped subjects
* `POST /enrollment/confirm` → admission confirms pending enrollment
* `GET /enrollment/:id/cor` → COR details for print

### 4.3 Grades

* **Professor**

  * `GET /professor/sections`
  * `GET /professor/sections/:id/students`
  * `POST /professor/grades/submit`
* **Registrar**

  * `GET /registrar/grade-queue`
  * `POST /registrar/grades/:id/approve` | `POST /registrar/grades/:id/reject`
  * `POST /registrar/terms` (open/close; set current)

### 4.4 Catalog/Admin

* CRUD: `/programs`, `/curriculums`, `/subjects`, `/sections`
* Utilities: `GET /health`, `GET /`

---

## 5) Frontend State & Components

### 5.1 State (Zustand)

* `useAuthStore`: token, user, role, `login`, `logout`
* `useEnrollmentStore`: selected subjects, total units, recommended list, draft state
* `useUIStore`: sidebar open/closed, theme, toasts

### 5.2 Reusable Components

* `PageHeader` (title, breadcrumb, actions)
* `DataTable` (search, filters, pagination)
* `FormSection` (with description/help)
* `UnitCounter` (displays total units & cap)
* `CorPreview` (table + print button)
* `ConfirmModal`, `DrawerForm`, `Toast` helpers

---

## 6) Data & Rules (brief)

* **Prerequisite check**: Subject is eligible if all `prereq_subject_ids` are **passed**.
* **Unit cap**: sum of selected subjects’ `units` ≤ **30** (hard limit, show remaining).
* **Recommended subjects**: curriculum subjects for current year/semester **minus** already passed/credited; plus eligible back-subjects as optional.
* **Equivalencies (Transferee)**: store mapping table (e.g., `equivalencies(student_id, external_subject, mapped_subject_id, units, remarks)`), treat mapped as **passed**.

---

## 7) Seeds (minimum to operate)

* **Programs** (e.g., BSIS)
* **Curriculum** entries (BSIS 1st–4th year, per sem)
* **Subjects** with `units`, `type`, and `prerequisites`
* **Sections** with assigned professors
* **Users**: 1 per role for testing
* **Academic Term**: current term set

> Later we can auto-seed **“Research Subjects in BSIS by year with prerequisites”** for more realism.

---

## 8) UX Standards (keep it crisp)

* **Collapsible Sidebar**: keyboard accessible; icons with labels; active state.
* **Feedback**: success/error toasts; inline form errors; loading skeletons.
* **No dead ends**: after actions, always show success view or next step.
* **Printables**: COR/Records have clean print CSS.
* **Performance**: paginate tables; debounce searches; cache lookups.

---

## 9) Acceptance Criteria (quick checklist)

* [ ] Login → role redirect works
* [ ] Sidebar collapses, persists preference
* [ ] New/Old/Transferee flows save, validate, and show COR preview
* [ ] Unit cap + prereq checks enforced with clear messaging
* [ ] Professor encode → Registrar approve → Student sees final grades
* [ ] Dean analytics render core charts from real data
* [ ] Admin CRUD stable, cannot break curriculum integrity
* [ ] Print styles OK for COR and grade slips
* [ ] README/CHANGELOG updated with screenshots

---

## 10) Run Commands (reference)

**Backend**

```bash
cd richwell-portal/backend
npm install
npx prisma generate && npx prisma migrate dev
npm run dev
```

**Frontend**

```bash
cd richwell-portal/frontend
npm install
npm run dev
```

---

