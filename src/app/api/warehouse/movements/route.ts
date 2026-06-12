import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MovementType } from "@prisma/client";

const OUTBOUND: MovementType[] = ["ISSUE", "WRITE_OFF", "DISPOSAL", "REMOVAL"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    itemId,
    type,
    quantity: qtyStr,
    basis,
    workId,
    equipmentId,
    takenById,
    comment,
  } = body;

  const quantity = parseFloat(qtyStr);
  if (!itemId || !type || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
  }

  if (["WRITE_OFF", "ISSUE"].includes(type) && !workId && !basis) {
    return NextResponse.json(
      { error: "Списание требует основания — работа или номер задачи" },
      { status: 400 }
    );
  }

  const item = await prisma.warehouseItem.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: "Позиция не найдена" }, { status: 404 });
  }

  if (OUTBOUND.includes(type as MovementType) && item.quantity < quantity) {
    return NextResponse.json(
      { error: `Недостаточно остатка (доступно: ${item.quantity})` },
      { status: 400 }
    );
  }

  const delta = type === "RECEIPT" || type === "RETURN" || type === "TO_GOOD"
    ? quantity
    : OUTBOUND.includes(type as MovementType)
      ? -quantity
      : 0;

  const [movement] = await prisma.$transaction([
    prisma.warehouseMovement.create({
      data: {
        itemId,
        quantity,
        type: type as MovementType,
        basis: basis || undefined,
        workId: workId || undefined,
        equipmentId: equipmentId || undefined,
        takenById: takenById || undefined,
        comment: comment || undefined,
      },
    }),
    prisma.warehouseItem.update({
      where: { id: itemId },
      data: { quantity: { increment: delta } },
    }),
  ]);

  return NextResponse.json(movement);
}
