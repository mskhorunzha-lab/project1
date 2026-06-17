import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createWorkSchema, formatZodError } from "@/lib/validation";
import { createWorkWithGeneratedNumber } from "@/lib/services/work-number";

export async function POST(req: NextRequest) {
  const auth = await authorize(req, ["DISPATCHER", "LEAD_SPECIALIST", "MANAGER"]);
  if (!auth.ok) return auth.response;

  const parsed = createWorkSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const data = parsed.data;
  const status = data.assigneeId ? "ASSIGNED" : "NEW";

  const work = await createWorkWithGeneratedNumber({
    title: data.title,
    type: data.type,
    category: data.category,
    system: data.system,
    priority: data.priority,
    equipmentId: data.equipmentId,
    serviceDeskTicket: data.serviceDeskTicket,
    leadSpecialistId: data.leadSpecialistId,
    assigneeId: data.assigneeId,
    plannedDate: new Date(data.plannedDate),
    description: data.description,
    status,
  });

  await writeAuditLog({
    userId: auth.user.id,
    action: "WORK_CREATED",
    entity: "Work",
    entityId: work.id,
    details: { number: work.number, status: work.status },
  });

  return NextResponse.json(work);
}
