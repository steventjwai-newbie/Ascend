import evidence from "@/public/data/alpha-salmon-evidence.json";

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function SalmonEvidenceModel() {
  const observed = evidence.observedLatestBatch;
  const projected = evidence.historicalProjection;
  const demand = evidence.posTheoreticalDemand;

  return (
    <section className="salmon-model" aria-labelledby="salmon-model-heading">
      <div className="salmon-model-heading">
        <div>
          <p className="eyebrow">Evidence model · 25 Aug 2026</p>
          <h2 id="salmon-model-heading">One batch observed. History projected. Demand kept separate.</h2>
        </div>
        <span className="model-status">Open batch</span>
      </div>

      <div className="salmon-model-grid">
        <article className="model-card observed-card">
          <div className="model-card-title"><span>Observed</span><strong>Latest batch</strong></div>
          <p className="model-card-status">{observed.status}</p>
          <dl>
            <div><dt>Purchased</dt><dd>{observed.purchasedKg.toFixed(2)} kg</dd></div>
            <div><dt>Primary fillet</dt><dd>{observed.primaryFilletKg.toFixed(3)} kg · {percent(observed.primaryYieldRatio)}</dd></div>
            <div><dt>Retained coproduct</dt><dd>{observed.retainedCoproductKg.toFixed(3)} kg</dd></div>
            <div><dt>Total retained food</dt><dd>{observed.totalRetainedFoodKg.toFixed(3)} kg · {percent(observed.totalRetainedFoodRatio)}</dd></div>
          </dl>
          <p className="model-boundary">The {observed.unclassifiedDifferenceKg.toFixed(3)} kg difference has no measured cause and is not labelled as waste.</p>
        </article>

        <article className="model-card projected-card">
          <div className="model-card-title"><span>Projected</span><strong>Projected historical scenario</strong></div>
          <p className="projection-label">{projected.label}</p>
          <dl>
            <div><dt>Receipts modelled</dt><dd>{projected.receiptCount}</dd></div>
            <div><dt>Purchased</dt><dd>{projected.purchasedKg.toFixed(2)} kg</dd></div>
            <div><dt>Primary fillet</dt><dd>{projected.projectedPrimaryFilletKg.toFixed(3)} kg</dd></div>
            <div><dt>Retained coproduct</dt><dd>{projected.projectedRetainedCoproductKg.toFixed(3)} kg</dd></div>
          </dl>
          <p className="portion-equivalents">≈{projected.projectedSmall80gEquivalents.toFixed(1)} × 80 g <span>and</span> ≈{projected.projectedLarge125gEquivalents.toFixed(1)} × 125 g</p>
          <p className="model-boundary">Simultaneous mix projection—not recorded historical production.</p>
        </article>

        <article className="model-card demand-card">
          <div className="model-card-title"><span>Calculated</span><strong>POS theoretical demand</strong></div>
          <p className="model-card-status">{demand.period}</p>
          <strong className="demand-total">{demand.totalPrimaryFilletKg.toFixed(2)} kg</strong>
          <div className="demand-lines">
            {demand.primaryFilletLines.map((line) => (
              <div key={line.menuItem}>
                <span>{line.menuItem}</span>
                <b>{line.sales} × {line.portionGrams} g = {line.theoreticalKg.toFixed(2)} kg</b>
              </div>
            ))}
          </div>
          <p className="model-boundary">Multi-batch demand. It is not reconciled to the unfinished 8.80 kg receipt.</p>
        </article>

        <article className="model-card unresolved-card">
          <div className="model-card-title"><span>Review</span><strong>Unresolved measurements</strong></div>
          <ul>
            <li>Latest batch stock has not been exhausted.</li>
            <li>The 1.571 kg unclassified difference has no measured cause.</li>
            <li>Salmon Baked Croissant and Salmon Burger mix purchased cubes with retained fillet coproduct; the split is unmeasured.</li>
            <li>Coproduct cost allocation remains a management-policy decision.</li>
          </ul>
          <div className="cost-choice">
            {evidence.costViews.map((view) => (
              <div key={view.label}><span>{view.label}</span><strong>RM{view.costPerKgRm.toFixed(2)}/kg</strong></div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
