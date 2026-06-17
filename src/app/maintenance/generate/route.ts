import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { generateMaintenanceWorks } from "@/lib/services/maintenance";

export async function POST(req: NextRequest) {
  try {
    const auth = await authorize(req, ["LEAD_SPECIALIST", "MANAGER"]);
    if (!auth.ok) return auth.response;

    const created = await generateMaintenanceWorks();
    await writeAuditLog({
      userId: auth.user.id,
      action: "MAINTENANCE_GENERATED",
      entity: "Work",
      details: { created },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка генерации ТО" },
      { status: 500 }
    );
  }
  redirect("/maintenance");
}
