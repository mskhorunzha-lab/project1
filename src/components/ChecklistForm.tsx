"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChecklistTemplate } from "@/lib/checklists";

type Existing = {
  items: unknown;
  summary: unknown;
  completed: boolean;
} | null;

export function ChecklistForm({
  workId,
  template,
  existing,
}: {
  workId: string;
  template: ChecklistTemplate;
  existing: Existing;
}) {
  const router = useRouter();
  const initialItems = (existing?.items as Record<string, string>) ?? {};
  const initialSummary = (existing?.summary as Record<string, string>) ?? {};

  const [items, setItems] = useState<Record<string, string>>(initialItems);
  const [summary, setSummary] = useState<Record<string, string>>(initialSummary);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/works/${workId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: template.type,
          items,
          summary,
          completed: true,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {template.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-3">
            <span className="flex-1 text-sm">{item.label}</span>
            {item.type === "yesno" && (
              <select
                value={items[item.id] ?? ""}
                onChange={(e) => setItems({ ...items, [item.id]: e.target.value })}
                className="input max-w-[120px]"
                required={item.required}
              >
                <option value="">—</option>
                <option value="Да">Да</option>
                <option value="Нет">Нет</option>
              </select>
            )}
            {item.type === "select" && (
              <select
                value={items[item.id] ?? ""}
                onChange={(e) => setItems({ ...items, [item.id]: e.target.value })}
                className="input max-w-[160px]"
                required={item.required}
              >
                <option value="">—</option>
                {item.options?.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
            {item.type === "number" && (
              <input
                type="number"
                value={items[item.id] ?? ""}
                onChange={(e) => setItems({ ...items, [item.id]: e.target.value })}
                className="input max-w-[120px]"
                required={item.required}
              />
            )}
            {item.type === "text" && (
              <input
                value={items[item.id] ?? ""}
                onChange={(e) => setItems({ ...items, [item.id]: e.target.value })}
                className="input max-w-[200px]"
                required={item.required}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-amber-900">Обязательные итоги</h3>
        <div className="space-y-2">
          {template.requiredOutcomes.map((outcome) => (
            <div key={outcome}>
              <label className="label text-amber-800">{outcome}</label>
              <input
                value={summary[outcome] ?? ""}
                onChange={(e) => setSummary({ ...summary, [outcome]: e.target.value })}
                className="input"
                required
              />
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Сохранение..." : existing?.completed ? "Обновить чек-лист" : "Завершить чек-лист"}
      </button>
      {existing?.completed && (
        <span className="ml-3 text-sm text-green-600">Чек-лист заполнен</span>
      )}
    </form>
  );
}
