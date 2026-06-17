import { describe, expect, it } from "vitest";
import { nextWorkNumberFromLatest } from "./work-number";

describe("nextWorkNumberFromLatest", () => {
  it("starts yearly sequence when there is no latest work", () => {
    expect(nextWorkNumberFromLatest(null, 2026)).toBe("WRK-2026-00001");
  });

  it("increments latest number for the current year", () => {
    expect(nextWorkNumberFromLatest("WRK-2026-00041", 2026)).toBe("WRK-2026-00042");
  });

  it("ignores numbers from other years", () => {
    expect(nextWorkNumberFromLatest("WRK-2025-99999", 2026)).toBe("WRK-2026-00001");
  });
});
