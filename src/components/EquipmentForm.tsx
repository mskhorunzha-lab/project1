"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SYSTEM_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  CRITICALITY_LABELS,
} from "@/lib/constants";

type Regulation = { id: string; name: string };

export function EquipmentForm({ regulations }: { regulations: Regulation[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push(`/equipment/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Наименование</label>
        <input name="name" className="input" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Тип</label>
          <select name="type" className="input" required>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Система</label>
          <select name="system" className="input" required>
            {Object.entries(SYSTEM_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Место установки</label>
        <input name="location" className="input" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Производитель</label>
          <input name="manufacturer" className="input" />
        </div>
        <div>
          <label className="label">Модель</label>
          <input name="model" className="input" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Серийный номер</label>
          <input name="serialNumber" className="input" />
        </div>
        <div>
          <label className="label">Внешний ID</label>
          <input name="externalId" className="input" placeholder="UPS-003" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Состояние</label>
          <select name="status" className="input" defaultValue="OK">
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Критичность</label>
          <select name="criticality" className="input" defaultValue="MEDIUM">
            {Object.entries(CRITICALITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Регламент ТО</label>
        <select name="regulationId" className="input">
          <option value="">—</option>
          {regulations.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Сохранение..." : "Добавить"}
      </button>
    </form>
  );
}
