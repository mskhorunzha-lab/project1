import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createWarehouseMovementSchema, formatZodError } from "@/lib/validation";
import {
  isOutboundMovement,
  movementDelta,
  movementRequiresBasis,
} from "@/lib/services/warehouse";

export async function POST(req: NextRequest) {
  const auth = await authorize(req, ["WAREHOUSE", "LEAD_SPECIALIST", "MANAGER"]);
  if (!auth.ok) return auth.response;

  const parsed = createWarehouseMovementSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const data = parsed.data;
  if (movementRequiresBasis(data.type) && !data.workId && !data.basis) {
    return NextResponse.json(
      { error: "Списание требует основания — работа или номер задачи" },
      { status: 400 }
    );
  }

  try {
    const movement = await prisma.$transaction(async (tx) => {
      const item = await tx.warehouseItem.findUnique({ where: { id: data.itemId } });
      if (!item) {
        throw new Error("Позиция не найдена");
      }

      if (isOutboundMovement(data.type) && item.quantity < data.quantity) {
        throw new Error(`Недостаточно остатка (доступно: ${item.quantity})`);
      }

      const created = await tx.warehouseMovement.create({
        data: {
          itemId: data.itemId,
          quantity: data.quantity,
          type: data.type,
          basis: data.basis,
          workId: data.workId,
          equipmentId: data.equipmentId,
          takenById: data.takenById,
          givenById: auth.user.id,
          comment: data.comment,
        },
      });

      await tx.warehouseItem.update({
        where: { id: data.itemId },
        data: { quantity: { increment: movementDelta(data.type, data.quantity) } },
      });

      await writeAuditLog(
        {
          userId: auth.user.id,
          action: "WAREHOUSE_MOVEMENT_CREATED",
          entity: "WarehouseMovement",
          entityId: created.id,
          details: {
            itemId: data.itemId,
            type: data.type,
            quantity: data.quantity,
          },
        },
        tx
      );

      return created;
    });

    return NextResponse.json(movement);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка складской операции" },
      { status: 400 }
    );
  }
}
