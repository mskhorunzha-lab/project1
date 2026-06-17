import { describe, expect, it } from "vitest";
import { movementDelta, movementRequiresBasis } from "./warehouse";

describe("warehouse movement rules", () => {
  it("adds stock for receipt-like movements", () => {
    expect(movementDelta("RECEIPT", 5)).toBe(5);
    expect(movementDelta("RETURN", 2)).toBe(2);
    expect(movementDelta("TO_GOOD", 1)).toBe(1);
  });

  it("subtracts stock for outbound movements", () => {
    expect(movementDelta("ISSUE", 5)).toBe(-5);
    expect(movementDelta("WRITE_OFF", 2)).toBe(-2);
    expect(movementDelta("DISPOSAL", 1)).toBe(-1);
    expect(movementDelta("REMOVAL", 3)).toBe(-3);
  });

  it("requires basis for issue and write-off", () => {
    expect(movementRequiresBasis("ISSUE")).toBe(true);
    expect(movementRequiresBasis("WRITE_OFF")).toBe(true);
    expect(movementRequiresBasis("RECEIPT")).toBe(false);
  });
});
