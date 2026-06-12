import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { type, items, summary, completed } = body;

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

  return NextResponse.json(checklist);
}
