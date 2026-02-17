import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseUserProfile } from "./getDashboardOverview";

describe("parseUserProfile", () => {
  it("returns null when input is missing", () => {
    assert.equal(parseUserProfile(null), null);
  });

  it("returns null when required fields are missing", () => {
    assert.equal(parseUserProfile({ full_name: "Alex" }), null);
  });

  it("returns profile when all fields are valid", () => {
    const result = parseUserProfile({
      full_name: " Alex Morgan ",
      role: "admin",
      school_id: "school-123",
      schools: { name: "Green Valley School" },
    });

    assert.deepEqual(result, {
      fullName: "Alex Morgan",
      role: "admin",
      schoolName: "Green Valley School",
    });
  });
});
