export default function StatCard({ icon, title, value, loading }) {
  return (
    <div className="rounded-xl shadow bg-gray-800 hover:bg-gray-700 transition p-5 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-300 text-sm">{title}</span>
        <div className="text-purple-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{loading ? "--" : value}</div>
    </div>
  );
}

