import PropTypes from 'prop-types';
import clsx from 'classnames';

const variantClasses = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus-visible:ring-indigo-500',
  subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
  ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-400'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base'
};

function Button({ children, variant = 'primary', size = 'md', className, icon, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <button className={clsx(baseStyles, variantClasses[variant], sizeClasses[size], className)} {...props}>
      {icon && <span className="text-lg leading-none" aria-hidden>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'subtle', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  icon: PropTypes.node
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  className: undefined,
  icon: null
};

export default Button;
