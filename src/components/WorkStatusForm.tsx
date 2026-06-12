"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORK_STATUS_LABELS } from "@/lib/constants";

const STATUSES = Object.keys(WORK_STATUS_LABELS);
const WAITING = ["WAITING_ACCESS", "WAITING_MATERIALS", "WAITING_CONTRACTOR", "WAITING_APPROVAL"];

export function WorkStatusForm({
  workId,
  currentStatus,
}: {
  workId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [waitReason, setWaitReason] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/works/${workId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          waitReason: WAITING.includes(status) ? waitReason : undefined,
          result: ["DONE", "CLOSED", "ON_REVIEW"].includes(status) ? result : undefined,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="input"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{WORK_STATUS_LABELS[s]}</option>
        ))}
      </select>
      {WAITING.includes(status) && (
        <input
          value={waitReason}
          onChange={(e) => setWaitReason(e.target.value)}
          placeholder="Причина ожидания"
          className="input"
          required
        />
      )}
      {["DONE", "CLOSED", "ON_REVIEW"].includes(status) && (
        <textarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Результат выполнения"
          className="input min-h-[80px]"
        />
      )}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Сохранение..." : "Обновить"}
      </button>
    </form>
  );
}
