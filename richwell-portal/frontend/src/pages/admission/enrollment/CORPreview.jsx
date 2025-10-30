import { useEnrollmentStore } from "../../../store/enrollmentStore.js";

export default function CORPreview() {
  const { corHtml } = useEnrollmentStore();
  if (!corHtml) return null;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-sm text-slate-300 mb-2">Certificate of Registration</p>
      <div className="bg-white rounded-lg overflow-hidden">
        <iframe title="COR" srcDoc={corHtml} className="w-full h-[420px]" />
      </div>
    </div>
  );
}

