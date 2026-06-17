import type { MovementType } from "@prisma/client";

export const OUTBOUND_MOVEMENTS: MovementType[] = ["ISSUE", "WRITE_OFF", "DISPOSAL", "REMOVAL"];

export function movementRequiresBasis(type: MovementType): boolean {
  return type === "WRITE_OFF" || type === "ISSUE";
}

export function movementDelta(type: MovementType, quantity: number): number {
  if (type === "RECEIPT" || type === "RETURN" || type === "TO_GOOD") {
    return quantity;
  }

  if (OUTBOUND_MOVEMENTS.includes(type)) {
    return -quantity;
  }

  return 0;
}

export function isOutboundMovement(type: MovementType): boolean {
  return OUTBOUND_MOVEMENTS.includes(type);
}
