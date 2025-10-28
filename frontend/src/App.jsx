import { useState } from 'react';
import Button from './components/Button.jsx';
import DashboardCard from './components/DashboardCard.jsx';
import InfoAlert from './components/InfoAlert.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">Richwell College Portal</h1>
          <p className="mt-2 text-sm text-slate-600">
            Phase 1 scaffold – shared components ready for upcoming dashboards and workflows.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <section className="grid gap-6 md:grid-cols-2">
          <DashboardCard
            title="Reusable Components"
            description="Foundational UI elements to accelerate future feature screens."
            footer={<span className="text-xs text-slate-500">Customize styles via Tailwind utility classes.</span>}
          />
          <DashboardCard
            title="React + Tailwind"
            description="Vite-powered development environment with Tailwind CSS configured."
            footer={<span className="text-xs text-slate-500">Run npm run dev to start the local server.</span>}
          />
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Interactive State</h2>
          <p className="mt-2 text-sm text-slate-600">
            This simple counter proves the React/Tailwind stack is wired for interactive UIs.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Button onClick={() => setCount((current) => current + 1)}>Increment</Button>
            <span className="text-base font-medium text-slate-700">Count: {count}</span>
          </div>
        </section>

        <InfoAlert>
          Postman collections and database credentials should live outside version control. Use the provided .env.example
          template to keep local secrets organized.
        </InfoAlert>
      </main>
    </div>
  );
}

export default App;
