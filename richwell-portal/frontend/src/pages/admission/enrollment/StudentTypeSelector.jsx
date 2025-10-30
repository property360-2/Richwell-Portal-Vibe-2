export default function StudentTypeSelector({ value, onChange }) {
  const options = [
    { value: "new", label: "New Student" },
    { value: "old", label: "Old Student" },
    { value: "transferee", label: "Transferee" },
  ];
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <label key={o.value} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${value === o.value ? "border-purple-500 bg-purple-500/10 text-purple-200" : "border-slate-700 hover:border-purple-500/40"}`}>
          <input type="radio" className="accent-purple-500" checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

