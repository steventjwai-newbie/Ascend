"use client";

import { useMemo, useState } from "react";
import salmonSnapshot from "@/public/data/alpha-salmon-case.json";
import latestReceipt from "@/public/data/alpha-latest-receipt.json";
import { SalmonEvidenceModel } from "./SalmonEvidenceModel";
import { AskAlphaEvidence } from "./AskAlphaEvidence";

type CaseStatus = "Open" | "Verifying" | "Ready for decision" | "Resolved";
type EvidenceTone = "confirmed" | "linked" | "missing" | "review";

type MarginCase = {
  id: string;
  title: string;
  category: string;
  severity: "high" | "medium" | "low";
  evidenceState: string;
  impact: string;
  status: CaseStatus;
  observed: string;
  expected: string;
  context: { label: string; tone: EvidenceTone }[];
  hypotheses: { label: string; assessment: string; tone: EvidenceTone }[];
  evidence: { source: string; detail: string; locator: string; tone: EvidenceTone; date?: string }[];
  action: string;
};

const cases: MarginCase[] = [
  {
    id: "ALP-004",
    title: "Frozen salmon delivered 8.80 kg but yielded 6.15 kg primary fillet",
    category: "Receipt yield",
    severity: "high",
    evidenceState: "4 sources linked · batch open",
    impact: "RM65.82/kg usable",
    status: "Verifying",
    observed: "A redacted 17 August receipt records 8.80 kg at RM46/kg. The batch produced 6.15 kg of primary fillet: a 69.89% primary yield and an effective main-fillet cost of approximately RM65.82/kg.",
    expected: "Supplier comparison must use retained food output, not headline frozen kilograms. Primary fillet, retained coproduct and the remaining unclassified difference must stay separate until the batch closes.",
    context: [
      { label: "8.80 kg purchased", tone: "confirmed" },
      { label: "6.15 kg thawed", tone: "confirmed" },
      { label: "2.477 kg small portions", tone: "confirmed" },
      { label: "3.602 kg large portions", tone: "confirmed" },
      { label: "71 g primary residual", tone: "review" },
      { label: "1.079 kg retained coproduct", tone: "confirmed" },
      { label: "1.571 kg difference unclassified", tone: "review" },
      { label: "Batch stock not exhausted", tone: "review" },
    ],
    hypotheses: [
      { label: "Frozen-to-thawed loss is supplier-product specific", assessment: "Measured for this receipt batch", tone: "confirmed" },
      { label: "Most thawed weight entered portion outputs", assessment: "6.079 of 6.15 kg recorded", tone: "linked" },
      { label: "The 1.079 kg is retained fillet coproduct", assessment: "Operator confirmed for secondary dishes", tone: "confirmed" },
      { label: "The 1.571 kg difference has a measured cause", assessment: "No cause recorded; remains unclassified", tone: "review" },
    ],
    evidence: [
      { source: "Confirmed", date: "2026-08-21", detail: "6.15 kg thawed; 2.477 kg small plus 3.602 kg large portions", locator: "Cafe Q1 batch observation", tone: "confirmed" },
      { source: "Confirmed", date: "2026-08-25", detail: "1.079 kg retained as coproduct for secondary dishes", locator: "Cafe Q1 operator confirmation", tone: "confirmed" },
      { source: "Review", date: "2026-08-25", detail: "1.571 kg purchased-weight difference has no measured cause", locator: "Open batch reconciliation", tone: "review" },
      { source: "Linked", date: "2026-08-17", detail: "8.80 kg frozen salmon at RM46/kg = RM404.80", locator: "Redacted supplier receipt", tone: "linked" },
    ],
    action: "Record closing stock when this batch is exhausted and measure the purchased-cube versus retained-coproduct split in Salmon Baked Croissant and Salmon Burger. Until then, Alpha reports yield and demand separately—not confirmed waste or recovered savings.",
  },
  {
    id: "ALP-001",
    title: "A second salmon receipt landed with 4.11 kg theoretically on hand",
    category: "Inventory variance",
    severity: "high",
    evidenceState: "6 of 9 checks complete",
    impact: "4.11 kg unverified",
    status: "Verifying",
    observed: "After the 27 June receipt and recorded sales through 29 June, the recipe model still carried approximately 4.11 kg, or 35 portions, before another 4.72 kg arrived on 30 June.",
    expected: "With a one-day lead time, ordering should be explainable by projected days of cover, Sunday and public-holiday delivery constraints, and known group reservations.",
    context: [
      { label: "Cafe Q1 only", tone: "confirmed" },
      { label: "One-day supplier lead time", tone: "confirmed" },
      { label: "No delivery Sundays or public holidays", tone: "confirmed" },
      { label: "No off-POS use reported", tone: "confirmed" },
      { label: "No June physical stock count", tone: "missing" },
      { label: "Reservation calendar not connected", tone: "missing" },
      { label: "Public-holiday calendar not linked", tone: "missing" },
    ],
    hypotheses: [
      { label: "Physical stock was below the recipe model", assessment: "Needs a targeted count", tone: "missing" },
      { label: "A group reservation justified the buffer", assessment: "Calendar not connected", tone: "missing" },
      { label: "Receipt date differs from order decision time", assessment: "One-day lead known; order timestamp absent", tone: "review" },
      { label: "Prep yield or portioning differs from the master recipe", assessment: "Test against the next production batch", tone: "review" },
    ],
    evidence: [
      { source: "POS sales", detail: "57 fillet portions sold, 19-26 Jun", locator: "FeedMe item sales export", tone: "linked" },
      { source: "Recipe model", detail: "4.24 kg raw fillet makes 36 portions", locator: "Seatable: Salmon Marinate", tone: "linked" },
      { source: "Invoice", detail: "9.36 kg received at RM45/kg", locator: "Redacted receipt A · 19 Jun", tone: "linked" },
      { source: "Invoice", detail: "5.11 kg received at RM46/kg", locator: "Redacted receipt B · 27 Jun", tone: "linked" },
      { source: "Invoice", detail: "4.72 kg received at RM46/kg", locator: "Redacted receipt C · 30 Jun", tone: "linked" },
      { source: "Supplier master", detail: "Every day except Sunday; order one day before", locator: "Redacted supplier record", tone: "linked" },
    ],
    action: "Count salmon fillet immediately before the next receipt and capture the reservation or operating reason at the order decision. One observation will distinguish a real stock gap from justified buffer stock.",
  },
  {
    id: "ALP-002",
    title: "Smoked salmon cost and unit records disagree",
    category: "Master-data integrity",
    severity: "medium",
    evidenceState: "Source conflict",
    impact: "Margin unreliable",
    status: "Open",
    observed: "The ingredient master carries zero cost, while supplier records include an active 1 kg product at RM74 and an older supplier record expressed as 38 slices for RM102.",
    expected: "One current supplier product should map to a canonical gram cost, with the 38-slice-per-kilogram conversion retained only as an operational estimate.",
    context: [
      { label: "Supplier invoices calculate by grams", tone: "confirmed" },
      { label: "38 slices per kg is operator-estimated", tone: "review" },
      { label: "Ingredient master cost is zero", tone: "linked" },
      { label: "Seafood pizza uses salmon cubes", tone: "confirmed" },
    ],
    hypotheses: [
      { label: "Current product is not linked to the ingredient", assessment: "Likely mapping gap", tone: "review" },
      { label: "Slice conversion is stale", assessment: "Weigh and count one pack", tone: "review" },
      { label: "Fillet, cube and smoked salmon were conflated", assessment: "SKU separation confirmed for pizza", tone: "confirmed" },
    ],
    evidence: [
      { source: "Ingredient master", detail: "Smoked salmon base unit: g; current cost: RM0", locator: "Seatable ingredients", tone: "linked" },
      { source: "Supplier product", detail: "1 kg at RM74", locator: "Redacted supplier record", tone: "linked" },
      { source: "Supplier product", detail: "38 slices at RM102", locator: "Redacted historical supplier record", tone: "linked" },
      { source: "Operator context", detail: "Supplier calculates by grams", locator: "Q1 operating confirmation", tone: "confirmed" },
    ],
    action: "Choose the current supplier product, map it to grams, and count one unopened kilogram pack. Keep fillet, cube and smoked salmon as separate SKUs throughout the recipe graph.",
  },
  {
    id: "ALP-003",
    title: "Six parsed invoice dates failed plausibility checks",
    category: "Document quality",
    severity: "low",
    evidenceState: "6 records held",
    impact: "Timeline protected",
    status: "Open",
    observed: "Across 85 deduplicated parsed invoices, six records had an empty date or an implausible year, including a future August 2026 value in the July snapshot.",
    expected: "An invoice should enter the stock timeline only when its date is plausible or a reviewer confirms the source document date.",
    context: [
      { label: "85 deduplicated invoices", tone: "linked" },
      { label: "79 usable date records", tone: "linked" },
      { label: "Six dates quarantined", tone: "linked" },
      { label: "No automatic ledger write-back", tone: "confirmed" },
    ],
    hypotheses: [
      { label: "OCR selected a nearby non-invoice date", assessment: "Review source page", tone: "review" },
      { label: "Blank or weak print caused an empty date", assessment: "Review source page", tone: "review" },
      { label: "Duplicate parsing produced conflicting dates", assessment: "Deduplication already applied", tone: "linked" },
    ],
    evidence: [
      { source: "Invoice parser", detail: "85 unique invoice records", locator: "Alpha parsed-results snapshot", tone: "linked" },
      { source: "Date validator", detail: "Empty, 2019, 2020, 2023, 2024 or future date", locator: "Six held records", tone: "linked" },
      { source: "Control rule", detail: "Held records excluded from the stock corridor", locator: "Snapshot build", tone: "confirmed" },
    ],
    action: "Open only the six held source documents, correct their dates once, and retain both the extracted and reviewed values for auditability.",
  },
];

const roadmap = [
  { phase: "01", title: "Build the first evidence snapshot", period: "Completed", state: "Done", tasks: ["Link Q1 FeedMe sales, Seatable recipes and seafood invoices", "Keep salmon fillet, cubes and smoked salmon as distinct SKUs", "Calculate an auditable theoretical stock corridor", "Quarantine implausible invoice dates instead of silently using them"] },
  { phase: "02", title: "Close the two missing contexts", period: "Next service week", state: "Next", tasks: ["Capture one targeted salmon count before a receipt", "Connect group reservations to expected demand", "Link the public-holiday delivery calendar", "Record the operator reason when an order is placed"] },
  { phase: "03", title: "Run a 14-day Q1 pilot", period: "After registration", state: "Pilot", tasks: ["Generate a daily evidence-first exception list", "Ask for verification only when the decision can change", "Measure useful alerts, false alerts and operator time", "Report verified RM only after a physical or documentary check"] },
  { phase: "04", title: "Test repeatability", period: "After Q1 proof", state: "Gate", tasks: ["Repeat with another outlet and POS export", "Package standard mappings before accepting custom work", "Keep CSV fallback when an API breaks or changes price", "Decide whether the evidence supports a commercial product"] },
];

const successMetrics = [
  { label: "Alert usefulness", target: "≥ 70%", detail: "Useful finding or useful verification" },
  { label: "Operator burden", target: "< 5 min/day", detail: "Outside normal receiving work" },
  { label: "Evidence links", target: "100%", detail: "Every claim names its source record" },
  { label: "Commercial claim", target: "Verified RM", detail: "No projected savings presented as recovered" },
];

export function EvidenceReviewLegacy() {
  const [activeView, setActiveView] = useState<"operations" | "roadmap">("operations");
  const [caseStates, setCaseStates] = useState(cases);
  const [selectedId, setSelectedId] = useState(cases[0].id);
  const [notice, setNotice] = useState("The latest batch remains open. Observed yield, historical projections and multi-batch POS demand are shown as separate evidence states.");
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});
  const [resolutionDraft, setResolutionDraft] = useState("");
  const selected = useMemo(() => caseStates.find((item) => item.id === selectedId) ?? caseStates[0], [caseStates, selectedId]);
  const setStatus = (status: CaseStatus) => {
    setCaseStates((items) => items.map((item) => (item.id === selected.id ? { ...item, status } : item)));
    setNotice(`${selected.id} marked ${status.toLowerCase()} in this review session. No source system was changed.`);
  };
  const requestVerification = () => {
    setStatus("Verifying");
    setActionFeedback((items) => ({
      ...items,
      [selected.id]: "Demo task queued: closing stock, batch uniformity and photo/notes. In the private system, Telegram sends one concise problem summary plus a signed form button.",
    }));
  };
  const simulateEvidence = () => {
    setStatus("Ready for decision");
    setActionFeedback((items) => ({
      ...items,
      [selected.id]: "Demo evidence submitted. The investigation is ready for owner review; no operational record changed.",
    }));
  };
  const recordResolution = () => {
    if (selected.status !== "Ready for decision") {
      setActionFeedback((items) => ({
        ...items,
        [selected.id]: "Evidence is required before resolution. Request verification and submit the demo evidence first.",
      }));
      return;
    }
    if (!resolutionDraft.trim()) {
      setActionFeedback((items) => ({
        ...items,
        [selected.id]: "Add a short resolution note so the decision has an audit reason.",
      }));
      return;
    }
    setStatus("Resolved");
    setActionFeedback((items) => ({
      ...items,
      [selected.id]: `Demo resolution recorded: ${resolutionDraft.trim()} No POS, stock, accounting or supplier record was changed.`,
    }));
    setResolutionDraft("");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><div className="alpha-mark" aria-hidden="true">A</div><div><strong>ALPHA</strong><span>Margin integrity</span></div></div>
        <nav className="view-switcher" aria-label="Dashboard views"><button className={activeView === "operations" ? "active" : ""} onClick={() => setActiveView("operations")}>Evidence review</button><button className={activeView === "roadmap" ? "active" : ""} onClick={() => setActiveView("roadmap")}>Pilot roadmap</button></nav>
        <div className="sync-state"><span className="live-dot" /> Cafe Q1<small>Evidence through 25 Aug 2026</small></div>
      </header>

      {activeView === "operations" ? <>
        <section className="hero-band"><div><p className="eyebrow">Expected margin vs operational reality</p><h1>Find where the<br /><em>food margin went.</em></h1><p className="hero-copy">Alpha reconstructs what should have happened from receipts, sales, recipes and operating context—then keeps observed facts, projections and unresolved evidence visibly separate.</p></div><div className="hero-metrics" aria-label="Q1 evidence summary"><div><span>Primary yield</span><strong>69.89%</strong><small>8.80 kg purchased → 6.15 kg primary fillet</small></div><div><span>Total retained food</span><strong>82.15%</strong><small>Includes 1.079 kg retained coproduct</small></div><div><span>POS demand</span><strong>33.02 kg</strong><small>20–23 Aug · mixed inventory, not one receipt</small></div></div></section>
        <div className="notice" role="status"><span>REDACTED REAL DATA</span>{notice}</div>
        <SalmonEvidenceModel />
        <AskAlphaEvidence />
        <section className="workspace-grid">
          <aside className="case-rail"><div className="section-heading"><div><p className="eyebrow">Investigation queue</p><h2>What needs attention</h2></div><span>{caseStates.length}</span></div><div className="case-list">{caseStates.map((item) => <button key={item.id} className={`case-card ${selected.id === item.id ? "selected" : ""}`} onClick={() => setSelectedId(item.id)}><div className="case-meta"><span className={`severity ${item.severity}`}>{item.category}</span><small>{item.id}</small></div><h3>{item.title}</h3><div className="case-footer"><strong>{item.impact}</strong><span>{item.evidenceState}</span></div></button>)}</div></aside>
          <article className="case-detail">
            <div className="detail-header"><div><div className="detail-kicker"><span className={`severity ${selected.severity}`}>{selected.category}</span><span>{selected.id}</span></div><h2>{selected.title}</h2></div><div className={`status-pill ${selected.status.toLowerCase()}`}>{selected.status}</div></div>
            <div className="fact-grid"><div className="fact observed"><span>Observed in the model</span><p>{selected.observed}</p></div><div className="fact expected"><span>Operational expectation</span><p>{selected.expected}</p></div></div>
            <section className="context-panel"><div className="section-heading compact"><div><p className="eyebrow">Context ledger</p><h3>Known facts and explicit gaps</h3></div></div><div className="context-tags">{selected.context.map((item) => <span className={item.tone} key={item.label}>{item.label}</span>)}</div></section>
            {selected.id === "ALP-001" && <section className="corridor-panel"><div className="section-heading compact"><div><p className="eyebrow">Theoretical stock corridor</p><h3>Receipts minus recipe-derived POS demand</h3></div></div><div className="corridor-table" role="table" aria-label="Salmon theoretical stock corridor"><div className="corridor-row corridor-head" role="row"><span>Date</span><span>Evidence event</span><span>Change</span><span>Balance</span></div>{salmonSnapshot.timeline.map((row) => <div className="corridor-row" role="row" key={`${row.date}-${row.event}`}><span>{row.date}</span><strong>{row.event}</strong><span className={row.changeKg >= 0 ? "positive" : "negative"}>{row.changeKg >= 0 ? "+" : ""}{row.changeKg.toFixed(2)} kg</span><b>{row.balanceKg.toFixed(2)} kg</b></div>)}</div><p className="model-boundary">This is not a physical stock ledger. It assumes invoice dates are receipt dates, uses the master recipe, and starts at zero before the 19 June receipt. Any earlier stock would increase the theoretical balance; unrecorded loss, yield variance or portion variance could reduce the physical balance.</p></section>}
            {selected.id === "ALP-004" && <section className="corridor-panel"><div className="section-heading compact"><div><p className="eyebrow">Receipt-to-output bridge</p><h3>Purchased weight → primary fillet → retained food</h3></div></div><div className="corridor-table" role="table" aria-label="Latest salmon receipt reconciliation"><div className="corridor-row corridor-head" role="row"><span>Date</span><span>Evidence event</span><span>Weight</span><span>State</span></div><div className="corridor-row" role="row"><span>17 Aug</span><strong>Frozen weight purchased</strong><span>8.800 kg</span><b>Linked</b></div><div className="corridor-row" role="row"><span>21 Aug</span><strong>Primary fillet measured</strong><span>6.150 kg</span><b>Confirmed</b></div>{latestReceipt.allocations.map((row) => <div className="corridor-row" role="row" key={row.label}><span>21 Aug</span><strong>{row.label} · {row.use}</strong><span>{row.kg.toFixed(3)} kg</span><b>Confirmed</b></div>)}<div className="corridor-row" role="row"><span>25 Aug</span><strong>Retained fillet coproduct</strong><span>{latestReceipt.reconciliation.retainedCoproductKg.toFixed(3)} kg</span><b>Confirmed</b></div><div className="corridor-row" role="row"><span>25 Aug</span><strong>Purchased-weight difference</strong><span>{latestReceipt.reconciliation.unclassifiedDifferenceKg.toFixed(3)} kg</span><b>Review</b></div></div><p className="model-boundary">Two costing views remain visible: approximately RM{latestReceipt.receipt.effectiveThawedCostPerKgRm.toFixed(2)}/kg when all cost is assigned to primary fillet, or RM56.00/kg when cost is spread uniformly across 7.229 kg retained food. The batch is still open.</p></section>}
            <div className="analysis-grid"><section><div className="section-heading compact"><div><p className="eyebrow">Diagnosis</p><h3>Explanations still in play</h3></div></div><div className="hypothesis-list">{selected.hypotheses.map((item) => <div className="hypothesis" key={item.label}><span className={`evidence-dot ${item.tone}`} /><div><strong>{item.label}</strong><small>{item.assessment}</small></div></div>)}</div></section><section><div className="section-heading compact"><div><p className="eyebrow">Evidence chain</p><h3>Latest evidence first</h3></div></div><div className="evidence-list">{selected.evidence.map((item) => <div className={`evidence-item ${item.tone}`} key={`${item.source}-${item.locator}`}><span>{item.source}{item.date && <small>{item.date}</small>}</span><strong>{item.detail}</strong><small>{item.locator}</small></div>)}</div></section></div>
            <section className="recommended-action"><div><p className="eyebrow">Minimum next evidence</p><h3>{selected.action}</h3><small>Public demonstration only. The private system persists tasks, evidence and owner decisions; neither route silently writes to POS, stock or accounting systems.</small>{selected.status === "Ready for decision" && <label className="resolution-field"><span>Resolution note</span><input value={resolutionDraft} onChange={(event) => setResolutionDraft(event.target.value)} placeholder="What the evidence established" /></label>}{actionFeedback[selected.id] && <p className="action-feedback" role="status">{actionFeedback[selected.id]}</p>}</div><div className="action-buttons"><button className="secondary" onClick={requestVerification}>{actionFeedback[selected.id] && selected.status === "Verifying" ? "Verification queued" : "Request verification"}</button>{actionFeedback[selected.id] && selected.status === "Verifying" && <button className="secondary" onClick={simulateEvidence}>Simulate evidence</button>}<button className="primary" onClick={recordResolution}>Record resolution</button></div></section>
          </article>
          <aside className="health-rail"><div className="section-heading"><div><p className="eyebrow">Evidence reliability</p><h2>Snapshot coverage</h2></div></div><div className="health-list"><div><span className="health-dot healthy" /><p><strong>Receipt line</strong><small>8.80 kg · RM46/kg</small></p><b>LINKED</b></div><div><span className="health-dot healthy" /><p><strong>Primary fillet</strong><small>6.15 kg observed</small></p><b>CONFIRMED</b></div><div><span className="health-dot healthy" /><p><strong>Retained coproduct</strong><small>1.079 kg confirmed</small></p><b>CONFIRMED</b></div><div><span className="health-dot warning" /><p><strong>Purchased-weight difference</strong><small>1.571 kg cause unclassified</small></p><b>REVIEW</b></div><div><span className="health-dot warning" /><p><strong>Latest batch stock</strong><small>Not exhausted</small></p><b>OPEN</b></div><div><span className="health-dot neutral" /><p><strong>Cube/coproduct split</strong><small>Secondary dishes unmeasured</small></p><b>MISSING</b></div></div><div className="freshness-card"><span>Total retained-food yield</span><strong>82.15%</strong><small>Primary fillet plus retained coproduct; not an estimate of food waste.</small></div><div className="source-note"><strong>Inference boundary</strong><p>Alpha separates observed yield, historical projection and multi-batch POS demand. It does not force an unfinished receipt to reconcile to sales.</p></div></aside>
        </section>
      </> : <section className="roadmap-view"><div className="roadmap-intro"><p className="eyebrow">Validation before platform</p><h1>Prove one leak.<br /><em>Then earn the roadmap.</em></h1><p>The first real Q1 snapshot is complete. The next step is deliberately small: close the physical-stock and reservation gaps, then test whether the signal changes a real operating decision.</p></div><div className="metric-strip">{successMetrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.target}</strong><small>{metric.detail}</small></div>)}</div><div className="roadmap-list">{roadmap.map((item) => <article key={item.phase}><div className="phase-number">{item.phase}</div><div className="phase-copy"><div className="phase-title"><div><p>{item.period}</p><h2>{item.title}</h2></div><span>{item.state}</span></div><ul>{item.tasks.map((task) => <li key={task}>{task}</li>)}</ul></div></article>)}</div><section className="decision-gate"><div><p className="eyebrow">Go / no-go decision</p><h2>Judge Alpha by resolved uncertainty.</h2></div><p>Continue only if Q1 repeatedly confirms that the evidence chain finds material problems earlier, explains them at the source, and avoids creating another daily data-entry burden.</p></section></section>}
    </main>
  );
}

type PublicView = "control-tower" | "investigations" | "cost-explorer";

const publicViewLabels: Record<PublicView, string> = {
  "control-tower": "Daily Control Tower",
  investigations: "Investigation Cockpit",
  "cost-explorer": "Cost Explorer",
};

function NavIcon({ name }: { name: PublicView }) {
  if (name === "control-tower") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" /></svg>;
  }
  if (name === "investigations") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 5 5" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /></svg>;
}

const publicMarginItems = [
  { name: "Truffle Mushroom Soup", quantity: 41, margin: 21.99, category: "Star" },
  { name: "Yin's Big Breakfast", quantity: 25, margin: 18.01, category: "Star" },
  { name: "Fish and Chips", quantity: 14, margin: 25.68, category: "Star" },
  { name: "Hot Café Latte", quantity: 46, margin: 7.75, category: "Opportunity" },
  { name: "Hot Americano / Long Black", quantity: 54, margin: 6.57, category: "Opportunity" },
];

function PublicMenuMargin() {
  const [pinned, setPinned] = useState<string[]>([]);
  const toggle = (name: string) => setPinned((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  return (
    <section className="alpha-menu-margin" aria-labelledby="menu-margin-heading">
      <div className="alpha-menu-margin-heading">
        <div><h2 id="menu-margin-heading">Menu margin quadrant</h2><p>Representative matched items from the current redacted POS-and-recipe snapshot.</p></div>
        <div className="alpha-coverage"><strong>51.93%</strong><span>sales coverage</span><button type="button" aria-label="Explain margin quadrant">?<span>Popularity is quantity sold. Unit margin is selling price minus configured recipe cost. Category thresholds use the matched-item averages; incomplete recipe coverage remains visible.</span></button></div>
      </div>
      <div className="alpha-menu-margin-body">
        <div className="alpha-quadrant" role="img" aria-label="Popularity by unit margin for five representative matched menu items">
          <div className="alpha-quadrant-label high-margin">Higher unit margin</div><div className="alpha-quadrant-label popular">More popular</div>
          {publicMarginItems.map((item) => {
            const left = 8 + item.quantity / 54 * 82;
            const top = 88 - item.margin / 25.68 * 78;
            const isPinned = pinned.includes(item.name);
            return <button key={item.name} type="button" className={`alpha-menu-dot ${item.category.toLowerCase()} ${isPinned ? "pinned" : ""}`} style={{ left: `${left}%`, top: `${top}%` }} aria-label={`${item.name}: ${item.quantity} sold, RM${item.margin.toFixed(2)} unit margin`} aria-pressed={isPinned} onClick={() => toggle(item.name)}><span>{item.name}</span></button>;
          })}
        </div>
        <div className="alpha-menu-summary"><div><span>Exact recipe matches</span><strong>93</strong></div><div><span>Covered sales</span><strong>RM14,506.30</strong></div><div><span>Theoretical food cost</span><strong>24.71%</strong></div><p>Hover a dot to identify it. Click to keep multiple labels visible. This is theoretical recipe cost on matched sales—not complete actual outlet margin.</p></div>
      </div>
    </section>
  );
}

function PublicControlTower({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <section className="alpha-brief" aria-labelledby="public-daily-brief">
        <div className="alpha-brief-copy">
          <span className="alpha-eyebrow">Daily brief</span>
          <h2 id="public-daily-brief">Primary salmon yield is measured. One open batch and its unclassified difference still need a closing physical checkpoint.</h2>
        </div>
        <div className="alpha-brief-meta"><strong>31 Aug 2026</strong><span>Redacted owner snapshot</span></div>
      </section>

      <section className="alpha-metrics" aria-label="Daily operating measures">
        <article className="alpha-metric"><span className="alpha-metric-label">Primary yield</span><strong className="alpha-metric-value">69.89%</strong><span className="alpha-metric-change alpha-tone-attention">Batch remains open</span></article>
        <article className="alpha-metric"><span className="alpha-metric-label">Total retained food</span><strong className="alpha-metric-value">82.15%</strong><span className="alpha-metric-change alpha-tone-positive">Includes retained coproduct</span></article>
        <article className="alpha-metric"><span className="alpha-metric-label">POS theoretical demand</span><strong className="alpha-metric-value">33.02 kg</strong><span className="alpha-metric-change">Mixed receipts · 20–23 Aug</span></article>
        <article className="alpha-metric"><span className="alpha-metric-label">Open investigations</span><strong className="alpha-metric-value">4</strong><span className="alpha-metric-change alpha-tone-attention">2 need operator evidence</span></article>
      </section>

      <PublicMenuMargin />

      <div className="alpha-dashboard-grid">
        <section className="alpha-panel" aria-labelledby="priority-heading">
          <div className="alpha-panel-header"><h2 id="priority-heading">Priority exceptions</h2><span>Ranked by materiality and resolvability</span></div>
          {cases.map((item, index) => (
            <button className="alpha-priority" type="button" key={item.id} onClick={() => onOpen(item.id)}>
              <span className="alpha-priority-rank">{index + 1}</span>
              <span><strong>{item.title}</strong><p>{item.evidenceState}</p></span>
              <span className="alpha-priority-meta"><strong>{item.impact}</strong>{item.status}</span>
              <svg className="alpha-row-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
            </button>
          ))}
        </section>

        <div className="alpha-dashboard-stack">
          <section className="alpha-panel" aria-labelledby="tasks-heading">
            <div className="alpha-panel-header"><h2 id="tasks-heading">Pending verification</h2><span>2 tasks</span></div>
            <div className="alpha-task"><span><strong>Close the latest salmon batch</strong><span>Record physical closing stock and explain any remaining difference.</span></span><b>OPEN</b></div>
            <div className="alpha-task"><span><strong>Measure the secondary-dish split</strong><span>Separate purchased cubes from retained fillet coproduct.</span></span><b>MISSING</b></div>
          </section>
          <section className="alpha-panel" aria-labelledby="health-heading">
            <div className="alpha-panel-header"><h2 id="health-heading">Data-source health</h2><span>Public coverage</span></div>
            <div className="alpha-health"><span><strong>POS export</strong><span>Item-level sales snapshot</span></span><b className="alpha-health-state healthy">Current</b></div>
            <div className="alpha-health"><span><strong>Receipt evidence</strong><span>Supplier identities redacted</span></span><b className="alpha-health-state healthy">Linked</b></div>
            <div className="alpha-health"><span><strong>Physical stock</strong><span>Latest batch not exhausted</span></span><b className="alpha-health-state warning">Review</b></div>
            <div className="alpha-health"><span><strong>Reservation context</strong><span>Not connected in this artifact</span></span><b className="alpha-health-state neutral">Missing</b></div>
          </section>
        </div>
      </div>

      <SalmonEvidenceModel />
      <AskAlphaEvidence />
    </>
  );
}

function PublicInvestigationWorkspace({
  caseStates,
  selected,
  selectedId,
  setSelectedId,
  actionFeedback,
  resolutionDraft,
  setResolutionDraft,
  requestVerification,
  simulateEvidence,
  recordResolution,
}: {
  caseStates: MarginCase[];
  selected: MarginCase;
  selectedId: string;
  setSelectedId: (id: string) => void;
  actionFeedback: Record<string, string>;
  resolutionDraft: string;
  setResolutionDraft: (value: string) => void;
  requestVerification: () => void;
  simulateEvidence: () => void;
  recordResolution: () => void;
}) {
  return (
    <section className="workspace-grid public-investigation-grid">
      <aside className="case-rail">
        <div className="section-heading"><div><p className="eyebrow">Investigation queue</p><h2>What needs attention</h2></div><span>{caseStates.length}</span></div>
        <div className="case-list">{caseStates.map((item) => <button key={item.id} className={`case-card ${selectedId === item.id ? "selected" : ""}`} onClick={() => setSelectedId(item.id)}><div className="case-meta"><span className={`severity ${item.severity}`}>{item.category}</span><small>{item.id}</small></div><h3>{item.title}</h3><div className="case-footer"><strong>{item.impact}</strong><span>{item.evidenceState}</span></div></button>)}</div>
      </aside>

      <article className="case-detail">
        <div className="detail-header"><div><div className="detail-kicker"><span className={`severity ${selected.severity}`}>{selected.category}</span><span>{selected.id}</span></div><h2>{selected.title}</h2></div><div className={`status-pill ${selected.status.toLowerCase()}`}>{selected.status}</div></div>
        <div className="fact-grid"><div className="fact observed"><span>Observed in the model</span><p>{selected.observed}</p></div><div className="fact expected"><span>Operational expectation</span><p>{selected.expected}</p></div></div>
        <section className="context-panel"><div className="section-heading compact"><div><p className="eyebrow">Context ledger</p><h3>Known facts and explicit gaps</h3></div></div><div className="context-tags">{selected.context.map((item) => <span className={item.tone} key={item.label}>{item.label}</span>)}</div></section>

        {selected.id === "ALP-004" && <section className="corridor-panel"><div className="section-heading compact"><div><p className="eyebrow">Receipt-to-output bridge</p><h3>Purchased weight → primary fillet → retained food</h3></div></div><div className="corridor-table" role="table" aria-label="Latest salmon receipt reconciliation"><div className="corridor-row corridor-head" role="row"><span>Date</span><span>Evidence event</span><span>Weight</span><span>State</span></div><div className="corridor-row" role="row"><span>17 Aug</span><strong>Frozen weight purchased</strong><span>8.800 kg</span><b>Linked</b></div><div className="corridor-row" role="row"><span>21 Aug</span><strong>Primary fillet measured</strong><span>6.150 kg</span><b>Confirmed</b></div>{latestReceipt.allocations.map((row) => <div className="corridor-row" role="row" key={row.label}><span>21 Aug</span><strong>{row.label} · {row.use}</strong><span>{row.kg.toFixed(3)} kg</span><b>Confirmed</b></div>)}<div className="corridor-row" role="row"><span>25 Aug</span><strong>Retained fillet coproduct</strong><span>{latestReceipt.reconciliation.retainedCoproductKg.toFixed(3)} kg</span><b>Confirmed</b></div><div className="corridor-row" role="row"><span>25 Aug</span><strong>Purchased-weight difference</strong><span>{latestReceipt.reconciliation.unclassifiedDifferenceKg.toFixed(3)} kg</span><b>Review</b></div></div><p className="model-boundary">The batch is still open. The public artifact does not assign a cause to the 1.571 kg difference.</p></section>}

        <div className="analysis-grid"><section><div className="section-heading compact"><div><p className="eyebrow">Diagnosis</p><h3>Explanations still in play</h3></div></div><div className="hypothesis-list">{selected.hypotheses.map((item) => <div className="hypothesis" key={item.label}><span className={`evidence-dot ${item.tone}`} /><div><strong>{item.label}</strong><small>{item.assessment}</small></div></div>)}</div></section><section><div className="section-heading compact"><div><p className="eyebrow">Evidence chain</p><h3>Latest evidence first</h3></div></div><div className="evidence-list">{selected.evidence.map((item) => <div className={`evidence-item ${item.tone}`} key={`${item.source}-${item.locator}`}><span>{item.source}{item.date && <small>{item.date}</small>}</span><strong>{item.detail}</strong><small>{item.locator}</small></div>)}</div></section></div>

        <section className="recommended-action"><div><p className="eyebrow">Minimum next evidence</p><h3>{selected.action}</h3><small>Public demonstration only. No POS, stock, accounting or supplier record is changed.</small>{selected.status === "Ready for decision" && <label className="resolution-field"><span>Resolution note</span><input value={resolutionDraft} onChange={(event) => setResolutionDraft(event.target.value)} placeholder="What the evidence established" /></label>}{actionFeedback[selected.id] && <p className="action-feedback" role="status">{actionFeedback[selected.id]}</p>}</div><div className="action-buttons"><button className="secondary" onClick={requestVerification}>{actionFeedback[selected.id] && selected.status === "Verifying" ? "Verification queued" : "Request verification"}</button>{actionFeedback[selected.id] && selected.status === "Verifying" && <button className="secondary" onClick={simulateEvidence}>Simulate evidence</button>}<button className="primary" onClick={recordResolution}>Record resolution</button></div></section>
      </article>

      <aside className="health-rail"><div className="section-heading"><div><p className="eyebrow">Evidence reliability</p><h2>Snapshot coverage</h2></div></div><div className="health-list"><div><span className="health-dot healthy" /><p><strong>Receipt line</strong><small>8.80 kg · RM46/kg</small></p><b>LINKED</b></div><div><span className="health-dot healthy" /><p><strong>Primary fillet</strong><small>6.15 kg observed</small></p><b>CONFIRMED</b></div><div><span className="health-dot warning" /><p><strong>Purchased-weight difference</strong><small>1.571 kg cause unclassified</small></p><b>REVIEW</b></div><div><span className="health-dot neutral" /><p><strong>Latest batch stock</strong><small>Not exhausted</small></p><b>OPEN</b></div></div><div className="freshness-card"><span>Total retained-food yield</span><strong>82.15%</strong><small>Primary fillet plus retained coproduct; not an estimate of food waste.</small></div></aside>
    </section>
  );
}

function PublicCostExplorer() {
  const [basis, setBasis] = useState<"primary" | "retained">("primary");
  const costPerKg = basis === "primary" ? latestReceipt.receipt.effectiveThawedCostPerKgRm : latestReceipt.receipt.lineAmountRm / latestReceipt.reconciliation.totalRetainedFoodKg;
  const yieldPct = basis === "primary" ? latestReceipt.receipt.receiptYieldPct : latestReceipt.reconciliation.totalRetainedFoodKg / latestReceipt.receipt.purchasedKg * 100;
  return (
    <>
      <section className="alpha-panel alpha-cost-surface">
        <div className="alpha-cost-toolbar">
          <label><span>Ingredient</span><select defaultValue="salmon"><option value="salmon">Frozen salmon fillet</option></select></label>
          <label><span>Cost basis</span><select value={basis} onChange={(event) => setBasis(event.target.value as "primary" | "retained")}><option value="primary">Main fillet basis</option><option value="retained">Uniform retained-food basis</option></select></label>
          <p><strong>Comparison only.</strong> Changing this selector does not change production costing or any source record.</p>
        </div>
        <div className="alpha-cost-bridge" aria-label="Salmon cost bridge">
          <div><span>1. Purchase price</span><strong>RM46.00/kg</strong><small>8.80 kg · RM404.80</small></div>
          <div><span>2. Selected yield</span><strong>{yieldPct.toFixed(2)}%</strong><small>{basis === "primary" ? "Primary fillet" : "Primary plus retained coproduct"}</small></div>
          <div><span>3. Effective cost</span><strong>RM{costPerKg.toFixed(2)}/kg</strong><small>Selected management view</small></div>
          <div><span>4. Recipe contribution</span><strong>RM{(costPerKg * 0.08).toFixed(2)}</strong><small>Per 80 g serving</small></div>
        </div>
      </section>
      <div className="alpha-dashboard-grid alpha-cost-grid">
        <section className="alpha-panel"><div className="alpha-panel-header"><h2>Calculation and source evidence</h2><span>Redacted public view</span></div><div className="alpha-cost-evidence"><p><b>Linked</b><span>Purchased weight and line amount</span><strong>8.80 kg · RM404.80</strong></p><p><b>Confirmed</b><span>Primary fillet measurement</span><strong>6.150 kg</strong></p><p><b>Confirmed</b><span>Retained coproduct</span><strong>1.079 kg</strong></p><p><b>Review</b><span>Unclassified difference</span><strong>1.571 kg</strong></p></div></section>
        <section className="alpha-panel"><div className="alpha-panel-header"><h2>Affected recipe examples</h2><span>Selected basis</span></div><div className="alpha-task"><span><strong>Salmon Spaghetti / Grilled Salmon</strong><span>80 g serving</span></span><b>RM{(costPerKg * .08).toFixed(2)}</b></div><div className="alpha-task"><span><strong>Pan-seared Salmon With Brown Rice</strong><span>125 g serving</span></span><b>RM{(costPerKg * .125).toFixed(2)}</b></div><div className="alpha-task"><span><strong>Salmon Fish and Chips</strong><span>160 g serving</span></span><b>RM{(costPerKg * .16).toFixed(2)}</b></div></section>
      </div>
    </>
  );
}

export default function Home() {
  const [view, setView] = useState<PublicView>("control-tower");
  const [caseStates, setCaseStates] = useState(cases);
  const [selectedId, setSelectedId] = useState(cases[0].id);
  const [notice, setNotice] = useState("Redacted demonstration. No public action can write to an operational system.");
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});
  const [resolutionDraft, setResolutionDraft] = useState("");
  const selected = useMemo(() => caseStates.find((item) => item.id === selectedId) ?? caseStates[0], [caseStates, selectedId]);

  const changeView = (next: PublicView) => {
    setView(next);
    const params = new URLSearchParams(window.location.search);
    params.set("view", next);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };
  const openInvestigation = (id: string) => { setSelectedId(id); changeView("investigations"); };
  const setStatus = (status: CaseStatus) => {
    setCaseStates((items) => items.map((item) => item.id === selected.id ? { ...item, status } : item));
    setNotice(`${selected.id} marked ${status.toLowerCase()} in this public session. No source system changed.`);
  };
  const requestVerification = () => { setStatus("Verifying"); setActionFeedback((items) => ({ ...items, [selected.id]: "Demo task queued. The private system sends a concise Telegram summary with a signed form button." })); };
  const simulateEvidence = () => { setStatus("Ready for decision"); setActionFeedback((items) => ({ ...items, [selected.id]: "Demo evidence submitted for owner review. No operational record changed." })); };
  const recordResolution = () => {
    if (selected.status !== "Ready for decision") { setActionFeedback((items) => ({ ...items, [selected.id]: "Evidence is required before resolution. Request verification and submit the demo evidence first." })); return; }
    if (!resolutionDraft.trim()) { setActionFeedback((items) => ({ ...items, [selected.id]: "Add a short resolution note so the decision has an audit reason." })); return; }
    setStatus("Resolved");
    setActionFeedback((items) => ({ ...items, [selected.id]: `Demo resolution recorded: ${resolutionDraft.trim()} No source record changed.` }));
    setResolutionDraft("");
  };

  return (
    <div className="alpha-shell">
      <header className="alpha-topbar"><div className="alpha-brand"><span className="alpha-mark" aria-hidden="true">A</span><span className="alpha-product">Alpha Owner Control Tower</span></div><span className="alpha-public-label">Public redacted artifact</span></header>
      <aside className="alpha-sidebar" aria-label="Primary navigation">
        <div className="alpha-outlet"><span className="alpha-eyebrow">Outlet</span><strong>Cafe Q1</strong><span>Redacted owner view</span></div>
        <nav className="alpha-nav">{(Object.keys(publicViewLabels) as PublicView[]).map((item) => <button type="button" key={item} aria-current={view === item ? "page" : undefined} onClick={() => changeView(item)}><NavIcon name={item} />{item === "control-tower" ? "Control Tower" : item === "investigations" ? "Investigations" : "Cost Explorer"}</button>)}</nav>
        <div className="alpha-sidebar-note">Public actions change only this browser session. The private product uses governed tasks and Telegram approval for protected writes.</div>
      </aside>
      <main className="alpha-main">
        <div className="alpha-toolbar"><div className="alpha-filter-row"><select className="alpha-filter" aria-label="Outlet" defaultValue="Cafe Q1"><option>Cafe Q1</option></select><select className="alpha-filter" aria-label="Date range" defaultValue="last-7-days"><option value="today">Today</option><option value="last-7-days">Last 7 days</option><option value="last-30-days">Last 30 days</option></select></div><span className="alpha-freshness"><span className="live-dot" /> Redacted snapshot · 31 Aug 2026</span></div>
        <div className="alpha-content">
          <div className="alpha-page-heading"><div><span className="alpha-eyebrow">Owner operations</span><h1>{publicViewLabels[view]}</h1><p>Evidence first. Every conclusion retains its calculation, source state and unresolved gaps.</p></div><span className="alpha-view-tag">Cafe Q1</span></div>
          <div className="notice alpha-session-notice" role="status"><span>PUBLIC DEMO</span>{notice}</div>
          {view === "control-tower" && <PublicControlTower onOpen={openInvestigation} />}
          {view === "investigations" && <PublicInvestigationWorkspace caseStates={caseStates} selected={selected} selectedId={selectedId} setSelectedId={setSelectedId} actionFeedback={actionFeedback} resolutionDraft={resolutionDraft} setResolutionDraft={setResolutionDraft} requestVerification={requestVerification} simulateEvidence={simulateEvidence} recordResolution={recordResolution} />}
          {view === "cost-explorer" && <PublicCostExplorer />}
        </div>
      </main>
    </div>
  );
}
