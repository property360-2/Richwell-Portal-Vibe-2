import PropTypes from 'prop-types';
import clsx from 'classnames';

function InputField({ id, label, helperText, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60',
          error ? 'border-rose-400 text-rose-600 placeholder:text-rose-400 focus:ring-rose-500/60' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

InputField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string
};

export default InputField;
