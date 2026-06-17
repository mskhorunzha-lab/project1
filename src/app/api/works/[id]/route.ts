import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { completeMaintenance } from "@/lib/services/maintenance";
import { formatZodError, updateWorkStatusSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(req, ["SPECIALIST", "LEAD_SPECIALIST", "MANAGER"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const parsed = updateWorkStatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { status, waitReason, result } = parsed.data;
  const previous = await prisma.work.findUnique({
    where: { id },
    include: { checklist: true },
  });

  if (!previous) {
    return NextResponse.json({ error: "Работа не найдена" }, { status: 404 });
  }

  if (
    status === "CLOSED" &&
    previous.type === "MAINTENANCE" &&
    ["UPS", "ACS"].includes(previous.system) &&
    !previous.checklist?.completed
  ) {
    return NextResponse.json(
      { error: "ТО ИБП/СКУД нельзя закрыть без завершенного чек-листа" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = { status };
  if (waitReason !== undefined) update.waitReason = waitReason;
  if (result !== undefined) update.result = result;

  if (["DONE", "CLOSED", "ON_REVIEW"].includes(status)) {
    update.actualDate = new Date();
  }

  const work = await prisma.work.update({
    where: { id },
    data: update,
    include: { equipment: { include: { regulation: true } } },
  });

  if (status === "CLOSED" && work.type === "MAINTENANCE" && work.equipment) {
    const interval = work.equipment.regulation?.intervalDays ?? 180;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    await completeMaintenance(id, nextDate);
  }

  await writeAuditLog({
    userId: auth.user.id,
    action: "WORK_STATUS_UPDATED",
    entity: "Work",
    entityId: work.id,
    details: { from: previous.status, to: work.status },
  });

  return NextResponse.json(work);
}
