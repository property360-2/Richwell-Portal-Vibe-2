import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { navConfig } from '../navigation/routes.js';

function Sidebar({ role }) {
  const items = navConfig[role] || [];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <nav className="p-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.icon && <span aria-hidden>{item.icon}</span>}
                <span>{item.label}</span>
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

Sidebar.defaultProps = {
  role: 'STUDENT'
};

export default Sidebar;

