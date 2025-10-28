import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

function Sidebar({ role }) {
  const itemsByRole = {
    STUDENT: [
      { to: '/student/dashboard', label: 'Dashboard' },
      { to: '/student/grades', label: 'Grades' },
      { to: '/student/notifications', label: 'Announcements' }
    ],
    REGISTRAR: [
      { to: '/registrar/dashboard', label: 'Dashboard' },
      { to: '/registrar/students', label: 'Student Records' },
      { to: '/registrar/analytics', label: 'Analytics' }
    ],
    ADMISSION: [
      { to: '/admission/dashboard', label: 'Dashboard' },
      { to: '/admission/students', label: 'Students' }
    ],
    PROFESSOR: [
      { to: '/professor/dashboard', label: 'Dashboard' },
      { to: '/professor/classes', label: 'My Classes' },
      { to: '/professor/grades', label: 'Grades' }
    ],
    DEAN: [
      { to: '/dean/dashboard', label: 'Dashboard' },
      { to: '/dean/analytics', label: 'Analytics' }
    ],
    ADMIN: [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/settings', label: 'Settings' }
    ]
  };

  const items = itemsByRole[role] || [];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <nav className="p-4">
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`
                }
              >
                {it.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  role: PropTypes.string
};

export default Sidebar;

