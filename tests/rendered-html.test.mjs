import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the redacted Q1 evidence dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Ascend Alpha — Evidence-First Operations/);
  assert.match(html, /Frozen salmon delivered 8\.80 kg but yielded 6\.15 kg thawed/);
  assert.match(html, /69\.89/);
  assert.match(html, /65\.82/);
  assert.match(html, /71/);
  assert.match(html, /1\.079 kg note scope unclear/);
  assert.match(html, /A second salmon receipt landed with 4\.11 kg theoretically on hand/);
  assert.doesNotMatch(html, /all values are simulated|74% confidence|RM184 at risk/i);
  assert.doesNotMatch(html, /CINV-|IV26-|KLO OCEAN|SENG KONG/i);
});

test("keeps the latest receipt calculation auditable and conservative", async () => {
  const snapshot = JSON.parse(await readFile(new URL("public/data/alpha-latest-receipt.json", root), "utf8"));
  assert.equal(snapshot.receipt.purchasedKg, 8.8);
  assert.equal(snapshot.receipt.thawedKg, 6.15);
  assert.equal(snapshot.receipt.lineAmountRm, 404.8);
  assert.equal(snapshot.receipt.receiptYieldPct.toFixed(2), "69.89");
  assert.equal(snapshot.receipt.effectiveThawedCostPerKgRm.toFixed(2), "65.82");
  assert.equal(snapshot.reconciliation.allocatedKg, 6.079);
  assert.equal(snapshot.reconciliation.unreconciledKg, 0.071);
  assert.match(snapshot.reconciliation.reviewNoteStatus, /excluded/i);
});

test("does not publish production identifiers or credentials", async () => {
  const files = [
    "README.md",
    "app/page.tsx",
    "public/data/alpha-salmon-case.json",
    "public/data/alpha-latest-receipt.json",
  ];
  const corpus = (await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")))).join("\n");
  assert.doesNotMatch(corpus, /CINV-|IV26-|KLO OCEAN|SENG KONG|supabase\.co|api[_-]?key|service[_-]?role/i);
});

test("keeps the salmon calculation in an auditable data snapshot", async () => {
  const snapshot = JSON.parse(await readFile(new URL("public/data/alpha-salmon-case.json", root), "utf8"));
  assert.equal(snapshot.outlet, "Cafe Q1");
  assert.equal(snapshot.model.rawKgPerBatch, 4.24);
  assert.equal(snapshot.model.portionsPerBatch, 36);
  assert.equal(snapshot.timeline[3].balanceKg.toFixed(2), "4.11");
  assert.equal(snapshot.timeline.at(-1).balanceKg.toFixed(2), "3.05");
  assert.ok(snapshot.model.limitations.includes("No June physical stock count"));
});
