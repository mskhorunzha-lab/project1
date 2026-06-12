"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  WORK_TYPE_LABELS,
  PRIORITY_LABELS,
  SYSTEM_LABELS,
} from "@/lib/constants";

type Equipment = {
  id: string;
  name: string;
  system: string;
};

type User = { id: string; name: string; role: string };

export function WorkForm({
  equipment,
  users,
  preselected,
}: {
  equipment: Equipment[];
  users: User[];
  preselected?: Equipment;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [system, setSystem] = useState(preselected?.system ?? "UPS");

  const leads = users.filter((u) => u.role === "LEAD_SPECIALIST");
  const specialists = users.filter((u) => u.role === "SPECIALIST");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      router.push(`/works/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Заголовок</label>
        <input name="title" className="input" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Тип работы</label>
          <select name="type" className="input" required>
            {Object.entries(WORK_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Приоритет</label>
          <select name="priority" className="input" required defaultValue="P3">
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Категория</label>
        <input name="category" className="input" placeholder="Плановое ТО — ИБП" required />
      </div>
      <div>
        <label className="label">Система</label>
        <select
          name="system"
          className="input"
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          required
        >
          {Object.entries(SYSTEM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Оборудование</label>
        <select name="equipmentId" className="input" defaultValue={preselected?.id ?? ""}>
          <option value="">—</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Номер Service Desk</label>
        <input name="serviceDeskTicket" className="input" placeholder="SD-10452" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Главный специалист</label>
          <select name="leadSpecialistId" className="input">
            <option value="">—</option>
            {leads.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Исполнитель</label>
          <select name="assigneeId" className="input">
            <option value="">—</option>
            {specialists.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Плановая дата</label>
        <input name="plannedDate" type="date" className="input" required />
      </div>
      <div>
        <label className="label">Описание</label>
        <textarea name="description" className="input min-h-[100px]" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Создание..." : "Создать работу"}
      </button>
    </form>
  );
}
