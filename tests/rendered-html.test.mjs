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
  assert.match(html, /Frozen salmon delivered 8\.80 kg but yielded 6\.15 kg primary fillet/);
  assert.match(html, /69\.89/);
  assert.match(html, /65\.82/);
  assert.match(html, /82\.15/);
  assert.match(html, /1\.079 kg retained coproduct/);
  assert.match(html, /1\.571 kg.*unclassified/i);
  assert.match(html, /Projected historical scenario/);
  assert.match(html, /33\.02 kg/);
  assert.match(html, /not actual historical output/i);
  assert.match(html, /A second salmon receipt landed with 4\.11 kg theoretically on hand/);
  assert.doesNotMatch(html, /all values are simulated|74% confidence|RM184 at risk/i);
  assert.doesNotMatch(html, /CINV-|IV26-|supabase\.co|service[_-]?role/i);
});

test("keeps the latest receipt calculation auditable and conservative", async () => {
  const snapshot = JSON.parse(await readFile(new URL("public/data/alpha-latest-receipt.json", root), "utf8"));
  assert.equal(snapshot.receipt.purchasedKg, 8.8);
  assert.equal(snapshot.receipt.thawedKg, 6.15);
  assert.equal(snapshot.receipt.lineAmountRm, 404.8);
  assert.equal(snapshot.receipt.receiptYieldPct.toFixed(2), "69.89");
  assert.equal(snapshot.receipt.effectiveThawedCostPerKgRm.toFixed(2), "65.82");
  assert.equal(snapshot.reconciliation.allocatedKg, 6.079);
  assert.equal(snapshot.reconciliation.primaryResidualKg, 0.071);
  assert.equal(snapshot.reconciliation.retainedCoproductKg, 1.079);
  assert.equal(snapshot.reconciliation.totalRetainedFoodKg, 7.229);
  assert.equal(snapshot.reconciliation.unclassifiedDifferenceKg, 1.571);
  assert.match(snapshot.reconciliation.batchStatus, /stock not exhausted/i);
});

test("recalculates the observed batch, historical projection and POS demand", async () => {
  const model = JSON.parse(await readFile(new URL("public/data/alpha-salmon-evidence.json", root), "utf8"));
  const observed = model.observedLatestBatch;
  const projected = model.historicalProjection;

  assert.ok(Math.abs(observed.primaryYieldRatio - observed.primaryFilletKg / observed.purchasedKg) < 1e-9);
  assert.ok(Math.abs(observed.totalRetainedFoodKg - (observed.primaryFilletKg + observed.retainedCoproductKg)) < 1e-9);
  assert.ok(Math.abs(observed.unclassifiedDifferenceKg - (observed.purchasedKg - observed.totalRetainedFoodKg)) < 1e-9);
  assert.ok(Math.abs(projected.projectedPrimaryFilletKg - projected.purchasedKg * observed.primaryYieldRatio) < 1e-8);
  assert.ok(Math.abs(projected.projectedRetainedCoproductKg - projected.purchasedKg * observed.retainedCoproductRatio) < 1e-8);
  assert.ok(Math.abs(model.posTheoreticalDemand.primaryFilletLines.reduce((sum, line) => sum + line.sales * line.portionGrams / 1000, 0) - 33.02) < 1e-9);
  assert.deepEqual(model.posTheoreticalDemand.excludedProducts.map((item) => item.menuItem), ["Crispy Salmon Finger", "Salmon Quiche", "Salmon Benedict"]);
  assert.deepEqual(model.posTheoreticalDemand.mixedInputProducts.map((item) => item.menuItem), ["Salmon Baked Croissant", "Salmon Burger"]);
});

test("does not publish production identifiers or credentials", async () => {
  const files = [
    "README.md",
    "app/page.tsx",
    "public/data/alpha-salmon-case.json",
    "public/data/alpha-latest-receipt.json",
    "public/data/alpha-salmon-evidence.json",
  ];
  const corpus = (await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")))).join("\n");
  assert.doesNotMatch(corpus, /CINV-|IV26-|supabase\.co|api[_-]?key|service[_-]?role|\.codex-remote-attachments|AppData[\\/]Local[\\/]Temp/i);
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
