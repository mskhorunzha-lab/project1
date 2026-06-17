import type { Prisma, Work } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateWorkNumber } from "@/lib/utils";

const WORK_NUMBER_LOCK_ID = 2026061701;

export function nextWorkNumberFromLatest(
  latestNumber: string | null | undefined,
  year = new Date().getFullYear()
): string {
  const prefix = `WRK-${year}-`;
  const latestSeq =
    latestNumber?.startsWith(prefix) ? Number.parseInt(latestNumber.slice(prefix.length), 10) : 0;

  return generateWorkNumber(Number.isFinite(latestSeq) ? latestSeq + 1 : 1);
}

export async function createWorkWithGeneratedNumber(
  data: Omit<Prisma.WorkUncheckedCreateInput, "number">
): Promise<Work> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${WORK_NUMBER_LOCK_ID})`;

    const currentYear = new Date().getFullYear();
    const latest = await tx.work.findFirst({
      where: { number: { startsWith: `WRK-${currentYear}-` } },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    return tx.work.create({
      data: {
        ...data,
        number: nextWorkNumberFromLatest(latest?.number, currentYear),
      },
    });
  });
}
