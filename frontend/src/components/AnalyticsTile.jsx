import PropTypes from 'prop-types';
import clsx from 'classnames';
import { radii, shadows } from '../designSystem/tokens.js';

function AnalyticsTile({ title, description, children, footer, className }) {
  return (
    <section
      className={clsx(
        'flex flex-col justify-between bg-white p-6',
        radii.large,
        shadows.card,
        'border border-slate-200',
        className
      )}
    >
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </header>
      <div className="mt-4 flex-1">{children}</div>
      {footer && <p className="mt-4 text-xs text-slate-500">{footer}</p>}
    </section>
  );
}

AnalyticsTile.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string
};

AnalyticsTile.defaultProps = {
  description: undefined,
  children: null,
  footer: null,
  className: undefined
};

export default AnalyticsTile;
