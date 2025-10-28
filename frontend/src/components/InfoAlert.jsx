import PropTypes from 'prop-types';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

function InfoAlert({ children }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
      <InformationCircleIcon className="mt-0.5 h-5 w-5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

InfoAlert.propTypes = {
  children: PropTypes.node.isRequired
};

export default InfoAlert;
