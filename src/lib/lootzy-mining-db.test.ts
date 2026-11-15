import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
const sql = readFileSync("drizzle/migrations/0001_migration.sql", "utf8");
describe("Trusted Mining contracts", () => {
  it("credits each matured run once under a row lock", () => {
    expect(sql).toMatch(/paid_at IS NULL AND ends_at<=now\(\)/);
    expect(sql).toMatch(/FOR UPDATE SKIP LOCKED/);
    expect(sql).toMatch(/SET paid_at=now\(\) WHERE id=m.id/);
  });
  it("fixes both allowed plans and triple converted payout", () => {
    expect(sql).toContain("p_principal NOT IN (50000,100000)");
    expect(sql).toContain("round(p_principal::numeric*3*100/p_rate)");
    expect(sql).toContain("interval '48 hours'");
  });
  it("requires persisted admin roles for activation", () => expect(sql).toContain("WHERE telegram_id=p_actor AND role='admin'"));
  it("backfills old open requests and queues new inserts for seven days", () => {
    expect(sql).toContain("WHERE status IN ('pending','approved')");
    expect(sql).toContain("BEFORE INSERT ON public.lootzy_withdrawals");
    expect(sql).toContain("NEW.due_at:=now()+interval '7 days'");
  });
});