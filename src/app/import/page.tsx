import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { ImportForm } from "@/components/ImportForm";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  let logs: Awaited<ReturnType<typeof prisma.importLog.findMany>> = [];
  try {
    logs = await prisma.importLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch {
    // DB not ready
  }

  return (
    <div>
      <PageHeader
        title="Импорт данных"
        description="Загрузка из CSV, XLSX. Синхронизация с PostgreSQL — через настройки администратора."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ImportForm dataType="equipment" title="Импорт оборудования" />
        <ImportForm dataType="warehouse" title="Импорт склада" />
      </div>

      <section className="card">
        <h2 className="mb-4 font-semibold">Шаблоны файлов</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/templates/equipment.csv" download className="btn-secondary">
            Скачать шаблон оборудования (CSV)
          </a>
          <a href="/templates/warehouse.csv" download className="btn-secondary">
            Скачать шаблон склада (CSV)
          </a>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Поддерживаются кодировки UTF-8 и Windows-1251, разделители «;» и «,».
        </p>
      </section>

      <section className="card mt-6">
        <h2 className="mb-4 font-semibold">Журнал импорта</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Файл</th>
                <th>Успешно</th>
                <th>Ошибки</th>
                <th>Пользователь</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.dataType}</td>
                  <td>{log.fileName}</td>
                  <td className="text-green-600">{log.successRows}</td>
                  <td className={log.errorRows > 0 ? "text-red-600" : ""}>{log.errorRows}</td>
                  <td>{log.user?.name ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="text-center text-slate-500">Импортов пока не было</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
