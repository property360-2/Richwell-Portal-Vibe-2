import PropTypes from 'prop-types';
import clsx from 'classnames';

function Button({ children, variant = 'primary', className, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
    secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:ring-indigo-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500'
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  className: PropTypes.string
};

export default Button;
