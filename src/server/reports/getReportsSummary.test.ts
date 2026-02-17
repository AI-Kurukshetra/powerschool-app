import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeAttendanceRate, computeFeeMetrics } from "./getReportsSummary";

describe("computeAttendanceRate", () => {
  it("returns 0 when total is 0", () => {
    assert.equal(computeAttendanceRate(0, 0), 0);
  });

  it("returns ratio when total is positive", () => {
    assert.equal(computeAttendanceRate(10, 7), 0.7);
  });
});

describe("computeFeeMetrics", () => {
  it("computes fee totals and rates", () => {
    const result = computeFeeMetrics([
      { amount: 100, status: "pending" },
      { amount: 50, status: "paid" },
      { amount: 75, status: "pending" },
    ]);

    assert.deepEqual(result, {
      pendingFeeTotal: 175,
      pendingFeeCount: 2,
      paidFeeCount: 1,
      totalFeeCount: 3,
      feeCollectionRate: 1 / 3,
    });
  });
});
