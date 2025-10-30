# Richwell College Portal — Concept, Pages, Implementation Plan **+ Automated Testing**

> Tech: **Node.js (Express + Prisma + MySQL)**, **Vite + React + Tailwind + shadcn/ui + Zustand + Recharts**
> Tests: **Jest + Supertest (backend)**, **Vitest + React Testing Library (frontend)**, **Cypress (optional e2e)**

---

## 1) Concept (What the system must do)

### 1.1 Core Goals

* Seamless **Enrollment** for **New**, **Old**, **Transferee**, **Returning**.
* Accurate **Grade Management** (Professor encodes → Registrar approves).
* **Dean/Registrar analytics** (trends, pass rate, at-risk).
* **Great UX**: collapsible sidebar, clear toasts/modals, fast pages.

### 1.2 Roles & Capabilities

* **Admission**: Enrollment flows, accounts, COR.
* **Registrar**: Grade approvals, terms, records.
* **Professor**: Encode grades, manage sections, class analytics.
* **Student**: View grades, GPA, COR, enrollment status.
* **Dean**: Program analytics.
* **Admin**: Programs, curriculums, subjects, sections, roles.

### 1.3 Enrollment Logic (Precise)

| Student Type   | UX Behavior                                                                          | System Rules                                                                       |
| -------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **New**        | Full form (from `Documentation/enrollment_doc.md`), no sem pick.                     | Validate → create `User` + `Student` + `Enrollment(pending)` → Admission confirms. |
| **Old**        | Enter Student ID → show profile, Year/Sem, **Recommended Subjects**, **Manual Add**. | Enforce prereqs; total units ≤ **30**; COR preview; Admission confirms.            |
| **Transferee** | Shorter form + **Subject Equivalency** flow.                                         | Map equivalencies first (treated as **passed**) → then Old rules.                  |
| **Returning**  | Reactivation modal.                                                                  | Set `status=regular` before enrollment.                                            |

**Definition of Done (Enrollment):** full flows, COR preview, unit cap/prereq enforcement, saved records, clear toasts.

---

## 2) Pages to Implement (by role, UX-first)

### 2.1 Global Layout

* **`layouts/AppLayout.jsx`** (collapsible Sidebar; dark mode)
* **`components/ui/Sidebar.jsx`** (role-aware nav; lucide icons)
* **`components/PageHeader.jsx`**, **`components/DataTable.jsx`**, **`components/CorPreview.jsx`**, **`components/UnitCounter.jsx`**

### 2.2 Authentication

* **`pages/Login.jsx`**, **`pages/NotAuthorized.jsx`**, **`pages/NotFound.jsx`**

### 2.3 Admission

* **`pages/admission/EnrollmentHub.jsx`** (tabs: New, Old, Transferee, Returning)
* **`pages/admission/Enlistments.jsx`** (status table)
* **`pages/admission/Accounts.jsx`**

### 2.4 Registrar

* **`pages/registrar/Dashboard.jsx`**, **`GradeApprovals.jsx`**, **`Terms.jsx`**, **`Records.jsx`**

### 2.5 Professor

* **`pages/professor/Sections.jsx`**, **`Grades.jsx`**, **`Analytics.jsx`**

### 2.6 Student

* **`pages/student/Dashboard.jsx`**, **`Grades.jsx`**, **`COR.jsx`**

### 2.7 Dean

* **`pages/dean/Analytics.jsx`** (Recharts)

### 2.8 Admin

* **`pages/admin/Dashboard.jsx`**, **`Programs.jsx`**, **`Curriculums.jsx`**, **`Subjects.jsx`**, **`Sections.jsx`**, **`Settings.jsx`**

---

## 3) Implementation Plan (phased)

* **Phase 1 — Foundations:** env, Prisma migrate, layout, role routing, collapsible sidebar.
* **Phase 2 — Admission Enrollment Core:** New/Old/Transferee/Returning + COR preview + unit/prereq checks.
* **Phase 3 — Registrar & Professor:** encode → approve flow.
* **Phase 4 — Student & Dean:** views + analytics.
* **Phase 5 — Admin & Integrity:** CRUD + validation.
* **Phase 6 — Polish & Launch:** loading/empty/error states, print styles, docs.

Each phase ends with: backend+frontend `dev` runs clean; seeds OK; tests green.

---

## 4) Backend API (contract)

**Prefix `/api`** + JWT + role middlewares.

* **Auth:** `POST /auth/login`, `GET /auth/me`
* **Enrollment:**

  * `POST /enrollment/new`
  * `POST /enrollment/old/preview` → `{studentId}` → recommended, COR preview
  * `POST /enrollment/old/submit` → `{studentId, subjects[]}` (≤30 units, prereqs)
  * `POST /enrollment/transferee/equivalencies`
  * `POST /enrollment/confirm`
  * `GET /enrollment/:id/cor`
* **Professor:** `GET /professor/sections`, `GET /professor/sections/:id/students`, `POST /professor/grades/submit`
* **Registrar:** `GET /registrar/grade-queue`, `POST /registrar/grades/:id/approve`, `POST /registrar/grades/:id/reject`, `POST /registrar/terms`
* **Admin CRUD:** `/programs`, `/curriculums`, `/subjects`, `/sections`
* Utilities: `GET /health`, `GET /`

---

## 5) Frontend State (Zustand)

* `useAuthStore`: token/user/role, `login`, `logout`
* `useEnrollmentStore`: recommended, selected, totalUnits, drafts
* `useUIStore`: sidebar, theme, toasts

---

## 6) Data Rules

* **Prereqs:** Subject eligible if all `prereq_subject_ids` are passed (or credited for transferee).
* **Unit cap:** Σ units ≤ **30** (show remaining).
* **Recommended:** curriculum (current Y/S) minus passed; add eligible back-subjects as optional.
* **Equivalencies:** treat mapped as passed for eligibility.

---

## 7) Seeds (minimum)

Programs, Curriculum (BSIS Y1–Y4 with prereqs), Subjects (with units/types), Sections (with professors), Users per role, Current Term.

---

## 8) UX Standards

Collapsible sidebar (desktop open, mobile collapsed), keyboard accessible; toasts for success/error; inline validation; print CSS for COR; paginated tables; debounced search.

---

## 9) Run Commands

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

## 10) **Automated Testing**

### 10.1 Folder Layout

```
richwell-portal/
  backend/
    tests/            # Jest (+ Supertest)
      helpers/
      auth.test.js
      enrollment.preview.test.js
      enrollment.submit.test.js
      grades.flow.test.js
    jest.config.js
    jest.globalSetup.js
    jest.globalTeardown.js
    jest.env.setup.js
  frontend/
    src/__tests__/    # Vitest + RTL
      UnitCounter.test.jsx
      CorPreview.test.jsx
      EnrollmentHub.old.flow.test.jsx
    vitest.config.ts
    setupTests.ts
  e2e/ (optional)
    cypress/
      e2e/
        enrollment.cy.ts
```

### 10.2 Backend (Jest + Supertest)

**Install**

```bash
cd richwell-portal/backend
npm i -D jest supertest @types/jest cross-env
```

**Scripts (backend/package.json)**

```json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test jest --runInBand",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "test:cov": "cross-env NODE_ENV=test jest --coverage",
    "db:test:reset": "prisma migrate reset --force --skip-generate --skip-seed --schema prisma/schema.prisma && node tests/helpers/seed.test.js"
  }
}
```

**Jest config (backend/jest.config.js)**

```js
module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.env.setup.js"],
  globalSetup: "<rootDir>/jest.globalSetup.js",
  globalTeardown: "<rootDir>/jest.globalTeardown.js",
  testMatch: ["**/tests/**/*.test.js"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/**/__mocks__/**"],
  coverageThreshold: { global: { statements: 75, branches: 70, functions: 75, lines: 75 } }
};
```

**Env for tests (backend/jest.env.setup.js)**

```js
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mysql://user:password@localhost:3306/richwell_portal_test";
process.env.JWT_SECRET = "testsecret";
```

**Global setup/teardown (reset DB and seed minimal)**

```js
// backend/jest.globalSetup.js
const { execSync } = require("node:child_process");
module.exports = async () => {
  execSync("npm run db:test:reset", { stdio: "inherit" });
};

// backend/jest.globalTeardown.js
module.exports = async () => {
  // optional: drop test DB or leave it
};
```

**Example Supertest (backend/tests/enrollment.preview.test.js)**

```js
const request = require("supertest");
const app = require("../src/app"); // your Express app

describe("Enrollment Old Student Preview", () => {
  it("returns recommended subjects and COR preview for valid student", async () => {
    const res = await request(app)
      .post("/api/enrollment/old/preview")
      .send({ studentId: "S-0001" })
      .expect(200);

    expect(res.body).toHaveProperty("profile");
    expect(res.body).toHaveProperty("recommended");
    expect(Array.isArray(res.body.recommended)).toBe(true);
    expect(res.body.totalUnits).toBeGreaterThanOrEqual(0);
    expect(res.body.totalUnits).toBeLessThanOrEqual(30);
  });

  it("enforces prereq rules in recommended set", async () => {
    const res = await request(app)
      .post("/api/enrollment/old/preview")
      .send({ studentId: "S-0002" })
      .expect(200);

    const needsPrereq = res.body.recommended.find(s => s.code === "CS202");
    if (needsPrereq) {
      expect(needsPrereq.eligible).toBe(false);
      expect(needsPrereq.reasons).toContain("missing_prerequisite");
    }
  });
});
```

**Example unit of cap check (pure function)**

```js
// backend/src/utils/units.js
exports.computeUnits = (subjects) => subjects.reduce((sum, s) => sum + (s.units || 0), 0);
exports.withinCap = (total, cap = 30) => total <= cap;

// backend/tests/units.test.js
const { computeUnits, withinCap } = require("../src/utils/units");
test("unit cap", () => {
  expect(withinCap(computeUnits([{units:3},{units:6}]), 30)).toBe(true);
  expect(withinCap(31, 30)).toBe(false);
});
```

> **Tip:** Use a dedicated MySQL database `richwell_portal_test`. The `db:test:reset` script runs `prisma migrate reset` + a tiny seed to create 1 program, a few subjects with prereqs, 1 student per case.

---

### 10.3 Frontend (Vitest + React Testing Library)

**Install**

```bash
cd richwell-portal/frontend
npm i -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Scripts (frontend/package.json)**

```json
{
  "scripts": {
    "test": "vitest --environment jsdom",
    "test:watch": "vitest --watch",
    "test:cov": "vitest run --coverage"
  }
}
```

**Vitest config (frontend/vitest.config.ts)**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    coverage: { reporter: ["text", "lcov"], lines: 75, functions: 75, branches: 70, statements: 75 }
  }
});
```

**Setup (frontend/setupTests.ts)**

```ts
import "@testing-library/jest-dom/vitest";
```

**Example test (frontend/src/**tests**/UnitCounter.test.jsx)**

```jsx
import { render, screen } from "@testing-library/react";
import UnitCounter from "../components/UnitCounter"; // shows total and remaining
test("shows remaining units", () => {
  render(<UnitCounter totalUnits={21} cap={30} />);
  expect(screen.getByText(/remaining/i)).toHaveTextContent("9");
});
```

**Example UI flow (Old Enrollment snippet)**

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import EnrollmentOld from "../pages/admission/EnrollmentOld"; // the Old tab component

test("fetches preview after inputting Student ID", async () => {
  render(<EnrollmentOld />);
  fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: "S-0001" }});
  fireEvent.click(screen.getByRole("button", { name: /Preview/i }));
  expect(await screen.findByText(/Recommended Subjects/)).toBeInTheDocument();
});
```

---

### 10.4 Optional E2E (Cypress)

**Install**

```bash
cd richwell-portal
npm i -D cypress
```

**Basic spec (e2e/cypress/e2e/enrollment.cy.ts)**

```ts
describe("Old Student Enrollment", () => {
  it("shows COR preview and respects unit cap", () => {
    cy.visit("http://localhost:5173/admission/enrollment");
    cy.findByLabelText(/Student ID/i).type("S-0001");
    cy.findByRole("button", { name: /Preview/i }).click();
    cy.findByText(/COR Preview/).should("exist");
    cy.findByText(/Total Units: /).invoke("text").then(t => {
      const units = parseInt(t.replace(/\D/g, ""), 10);
      expect(units).to.be.at.most(30);
    });
  });
});
```

---

### 10.5 CI (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: richwell_portal_test
        ports: ["3306:3306"]
        options: >-
          --health-cmd="mysqladmin ping -h 127.0.0.1 -proot"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=10
    env:
      DATABASE_URL: mysql://root:root@127.0.0.1:3306/richwell_portal_test
      JWT_SECRET: testsecret
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd richwell-portal/backend && npm ci
      - run: cd richwell-portal/backend && npx prisma generate
      - run: cd richwell-portal/backend && npx prisma migrate deploy
      - run: cd richwell-portal/backend && node tests/helpers/seed.test.js
      - run: cd richwell-portal/backend && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd richwell-portal/frontend && npm ci
      - run: cd richwell-portal/frontend && npm run test -- --run
```

> If you add Cypress later, create a separate `e2e` job and start both servers (backend/frontend) before running `cypress run`.

---

## 11) Definition of Done (incl. tests)

* [ ] Backend unit/integration tests (Jest) pass with coverage ≥ set thresholds.
* [ ] Frontend component/flow tests (Vitest+RTL) pass with coverage ≥ set thresholds.
* [ ] CI workflow green on PR.
* [ ] Enrollment flows (New/Old/Transferee/Returning) have test coverage for:

  * prereq enforcement
  * unit cap enforcement
  * COR preview composition
* [ ] Grade lifecycle (encode → approve) tested.
* [ ] Print styles sanity-check (manual).

---
