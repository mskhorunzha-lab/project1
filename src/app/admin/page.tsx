import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { ROLE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  let regulations: Awaited<ReturnType<typeof prisma.maintenanceRegulation.findMany>> = [];

  try {
    [users, regulations] = await Promise.all([
      prisma.user.findMany({ orderBy: { name: "asc" } }),
      prisma.maintenanceRegulation.findMany(),
    ]);
  } catch {
    // DB not ready
  }

  return (
    <div>
      <PageHeader
        title="Администрирование"
        description="Пользователи, роли, справочники, настройки импорта"
      />

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">Пользователи и роли</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td>{u.active ? "Активен" : "Отключён"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">Регламенты ТО</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Система</th>
                <th>Интервал (дней)</th>
                <th>Чек-лист</th>
              </tr>
            </thead>
            <tbody>
              {regulations.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.system}</td>
                  <td>{r.intervalDays}</td>
                  <td>{r.checklistType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 font-semibold">Синхронизация PostgreSQL</h2>
        <p className="text-sm text-slate-600">
          На первом этапе рекомендуется односторонний импорт из существующей складской БД.
          Настройте строку подключения в <code>.env</code> и используйте раздел «Импорт»
          для загрузки CSV/XLSX или API синхронизации.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-700">
          DATABASE_URL=postgresql://infra:infra@localhost:5432/infra_portal
        </div>
      </section>
    </div>
  );
}
