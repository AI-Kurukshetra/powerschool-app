import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseStudent } from "./getStudents";

describe("parseStudent", () => {
  it("returns null for invalid input", () => {
    assert.equal(parseStudent(null), null);
    assert.equal(parseStudent({ full_name: "Alex" }), null);
  });

  it("returns a student for valid input", () => {
    const result = parseStudent({
      id: "student-1",
      full_name: " Alex Morgan ",
      student_code: "A-100",
      grade_level: "7",
      status: "Active",
      school_id: "school-1",
    });

    assert.deepEqual(result, {
      id: "student-1",
      fullName: "Alex Morgan",
      studentCode: "A-100",
      gradeLevel: "7",
      status: "Active",
      schoolId: "school-1",
    });
  });
});
