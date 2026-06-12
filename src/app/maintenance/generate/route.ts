import { redirect } from "next/navigation";
import { generateMaintenanceWorks } from "@/lib/services/maintenance";

export async function GET() {
  try {
    await generateMaintenanceWorks();
  } catch {
    // DB may not be ready
  }
  redirect("/maintenance");
}
