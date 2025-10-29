export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg p-3">
      {message}
    </div>
  );
}

