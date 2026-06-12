"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";

export function ImportForm({
  dataType,
  title,
}: {
  dataType: "equipment" | "warehouse";
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("file", fileInput.files[0]);
    fd.append("dataType", dataType);

    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data);
      if (data.success > 0) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Upload size={18} />
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="file"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Импорт..." : "Загрузить и импортировать"}
        </button>
      </form>
      {result && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-green-700">Загружено: {result.success} строк</p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-700">Ошибки ({result.errors.length}):</p>
              <ul className="mt-1 max-h-32 overflow-y-auto text-red-600">
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>Строка {err.row}: {err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
