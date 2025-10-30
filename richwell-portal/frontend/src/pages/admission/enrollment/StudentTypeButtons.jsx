export default function StudentTypeButtons({ mode, onChange }) {
  const options = [
    { value: "new", label: "New Student" },
    { value: "old", label: "Old Student" },
    { value: "transferee", label: "Transferee" },
  ];
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
            mode === opt.value
              ? "border-purple-500 bg-purple-500/10 text-purple-300"
              : "border-slate-800 hover:border-purple-500/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

