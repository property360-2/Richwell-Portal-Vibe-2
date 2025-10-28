import PropTypes from 'prop-types';

function DashboardCard({ title, description, footer, actions }) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      {actions && <div className="mt-4 flex gap-3">{actions}</div>}
      {footer && <p className="mt-6 text-xs text-slate-500">{footer}</p>}
    </article>
  );
}

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  footer: PropTypes.node,
  actions: PropTypes.node
};

DashboardCard.defaultProps = {
  footer: null,
  actions: null
};

export default DashboardCard;
