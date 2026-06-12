"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOVEMENT_LABELS } from "@/lib/constants";

type Item = { id: string; name: string; quantity: number; unit: string };
type Work = { id: string; number: string; title: string };
type Equipment = { id: string; name: string };
type User = { id: string; name: string };

const TYPES = Object.keys(MOVEMENT_LABELS);

export function MovementForm({
  items,
  works,
  equipment,
  users,
}: {
  items: Item[];
  works: Work[];
  equipment: Equipment[];
  users: User[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/warehouse/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      router.push("/warehouse");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">ТМЦ</label>
        <select name="itemId" className="input" required>
          <option value="">Выберите позицию</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} (остаток: {i.quantity} {i.unit})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Тип операции</label>
        <select name="type" className="input" required>
          {TYPES.map((t) => (
            <option key={t} value={t}>{MOVEMENT_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Количество</label>
        <input name="quantity" type="number" step="0.01" min="0.01" className="input" required />
      </div>
      <div>
        <label className="label">Основание (номер работы / комментарий)</label>
        <input name="basis" className="input" placeholder="WRK-2025-00001" />
      </div>
      <div>
        <label className="label">Связанная работа</label>
        <select name="workId" className="input">
          <option value="">—</option>
          {works.map((w) => (
            <option key={w.id} value={w.id}>{w.number} — {w.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Оборудование</label>
        <select name="equipmentId" className="input">
          <option value="">—</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Получил</label>
        <select name="takenById" className="input">
          <option value="">—</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Комментарий</label>
        <textarea name="comment" className="input min-h-[80px]" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Сохранение..." : "Зарегистрировать движение"}
      </button>
    </form>
  );
}
