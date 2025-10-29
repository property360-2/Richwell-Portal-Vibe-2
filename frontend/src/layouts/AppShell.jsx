import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { typography, layout, spacing } from '../designSystem/tokens.js';

function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="space-y-3">
      {breadcrumbs?.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={item.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {item.to ? (
                <Link className="hover:text-indigo-600" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className={typography.heading}>{title}</h2>
          {description && <p className={typography.subheading}>{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string
    })
  )
};

PageHeader.defaultProps = {
  description: undefined,
  actions: null,
  breadcrumbs: []
};

function Header({ user, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className={`mx-auto flex items-center justify-between ${layout.maxWidth} px-6 py-4`}>
        <div>
          <Link to={`/${(user?.role || 'student').toLowerCase()}/dashboard`} className="text-lg font-semibold text-slate-900">
            Richwell College Portal
          </Link>
          <p className="text-xs text-slate-500">{user ? `Welcome, ${user.firstName} ${user.lastName}` : 'Portal access'}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

Header.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired
};

Header.defaultProps = {
  user: null
};

function AppShell({ user, onLogout, children, header }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={onLogout} />
      <div className={`mx-auto flex ${layout.maxWidth} gap-6 ${spacing.gutter}`}>
        <Sidebar role={user?.role} />
        <main className="min-h-[60vh] flex-1 space-y-8">
          {header}
          {children}
        </main>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  user: Header.propTypes.user,
  onLogout: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  header: PropTypes.node
};

AppShell.defaultProps = {
  header: null
};

AppShell.PageHeader = PageHeader;

export default AppShell;
