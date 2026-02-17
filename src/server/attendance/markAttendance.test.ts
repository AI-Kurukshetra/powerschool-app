import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateMarkAttendanceInput } from "./markAttendance";

describe("validateMarkAttendanceInput", () => {
  it("rejects empty input", () => {
    assert.equal(
      validateMarkAttendanceInput({ student_id: "", status: "" }),
      null,
    );
  });

  it("normalizes valid input", () => {
    const result = validateMarkAttendanceInput({
      student_id: " student-1 ",
      status: " Present ",
    });

    assert.deepEqual(result, {
      student_id: "student-1",
      status: "present",
    });
  });

  it("accepts case-insensitive status", () => {
    const result = validateMarkAttendanceInput({
      student_id: "student-1",
      status: "late",
    });

    assert.deepEqual(result, {
      student_id: "student-1",
      status: "late",
    });
  });

  it("rejects unknown status", () => {
    const result = validateMarkAttendanceInput({
      student_id: "student-1",
      status: "Excused",
    });

    assert.equal(result, null);
  });
});
