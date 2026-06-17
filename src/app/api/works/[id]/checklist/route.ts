import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { checklistSchema, formatZodError } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(req, ["SPECIALIST", "LEAD_SPECIALIST", "MANAGER"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const parsed = checklistSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { type, items, summary, completed } = parsed.data;
  const checklist = await prisma.checklistResponse.upsert({
    where: { workId: id },
    create: {
      workId: id,
      type,
      items,
      summary,
      completed: completed ?? true,
    },
    update: {
      items,
      summary,
      completed: completed ?? true,
    },
  });

  if (completed) {
    await prisma.work.update({
      where: { id },
      data: { status: "ON_REVIEW" },
    });
  }

  await writeAuditLog({
    userId: auth.user.id,
    action: "CHECKLIST_SAVED",
    entity: "ChecklistResponse",
    entityId: checklist.id,
    details: { workId: id, type, completed: checklist.completed },
  });

  return NextResponse.json(checklist);
}
