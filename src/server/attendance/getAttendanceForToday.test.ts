import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAttendanceRows } from "./getAttendanceForToday";

describe("parseAttendanceRows", () => {
  it("returns null for invalid rows", () => {
    assert.equal(parseAttendanceRows([{ status: "present" }]), null);
  });

  it("keeps latest status per student", () => {
    const result = parseAttendanceRows([
      {
        student_id: "student-1",
        status: "late",
        recorded_at: "2026-02-17T08:00:00Z",
      },
      {
        student_id: "student-1",
        status: "present",
        recorded_at: "2026-02-17T08:05:00Z",
      },
    ]);

    assert.deepEqual(result, {
      "student-1": { status: "present", recordedAt: "2026-02-17T08:05:00Z" },
    });
  });
});
