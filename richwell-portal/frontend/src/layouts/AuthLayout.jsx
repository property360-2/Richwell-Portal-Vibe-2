// src/layouts/AuthLayout.jsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-900/70 p-8 rounded-2xl shadow-2xl w-[400px] border border-gray-800 backdrop-blur">
        <h1 className="text-2xl font-bold text-center text-purple-500 mb-6">
          RCI Academic Portal
        </h1>
        {children}
      </div>
    </div>
  );
}
