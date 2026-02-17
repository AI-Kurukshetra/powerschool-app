import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseFee } from "./getFees";

describe("parseFee", () => {
  it("returns null for invalid input", () => {
    assert.equal(parseFee(null), null);
    assert.equal(parseFee({ id: "fee-1" }), null);
  });

  it("returns a fee for valid input", () => {
    const result = parseFee({
      id: "fee-1",
      student_id: "student-1",
      fee_type: "Tuition",
      amount: 250,
      due_date: "2026-02-17",
      status: "Open",
      school_id: "school-1",
      students: { full_name: " Alex Morgan " },
    });

    assert.deepEqual(result, {
      id: "fee-1",
      studentId: "student-1",
      studentName: "Alex Morgan",
      feeType: "Tuition",
      amount: 250,
      dueDate: "2026-02-17",
      status: "Open",
      schoolId: "school-1",
    });
  });
});
