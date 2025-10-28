import PropTypes from 'prop-types';
import clsx from 'classnames';

const variantStyles = {
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200'
};

function Alert({ variant = 'info', title, children, className }) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-transparent p-4 text-sm ring-1 ring-inset shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      {title && <p className="font-medium">{title}</p>}
      {children && <p className="mt-1 leading-relaxed">{children}</p>}
    </div>
  );
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  title: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
};

export default Alert;
