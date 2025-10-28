import PropTypes from 'prop-types';

function Chart({ title, description, footer }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-dashed border-indigo-300 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-6 flex h-40 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
        <span className="text-sm font-medium">Chart placeholder</span>
      </div>
      {footer && <p className="mt-4 text-xs text-slate-500">{footer}</p>}
    </div>
  );
}

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  footer: PropTypes.string
};

Chart.defaultProps = {
  footer: null
};

export default Chart;
