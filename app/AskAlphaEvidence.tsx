"use client";

import { useState } from "react";

const demonstrations = [
  {
    id: "yield",
    question: "How do supplier receipt yields change salmon cost per gram?",
    route: "Deterministic cost bridge",
    answer: "Seafood Supplier A: 69.9% receipt yield, RM0.0460/g purchased → RM0.0658/g after receipt yield. Seafood Supplier B: 66.7% provisional yield, RM0.0450/g purchased → RM0.0675/g after receipt yield.",
    evidence: "4 source-linked cost/yield objects",
    state: "Answered",
  },
  {
    id: "recipes",
    question: "Which salmon recipe portions are confirmed, and which links remain under review?",
    route: "Typed relationship resolver",
    answer: "Nominal standards in the evidence packet include 80 g for salmon spaghetti and grilled salmon, 160 g for salmon fish and chips, and 125 g for brown rice salmon. Review-state recipe links remain visibly unresolved.",
    evidence: "Recipe-impact objects + one-hop links",
    state: "Answered",
  },
  {
    id: "identity",
    question: "Are two similarly named lettuce records confirmed as the same ingredient?",
    route: "Deterministic identity guard",
    answer: "Alpha cannot confirm identity from retrieval similarity. No explicit approved alias relationship is present, so the packet abstains and asks for one canonical mapping decision.",
    evidence: "Separate records; no same-as edge",
    state: "Abstained",
  },
];

export function AskAlphaEvidence() {
  const [selectedId, setSelectedId] = useState(demonstrations[0].id);
  const selected = demonstrations.find((item) => item.id === selectedId) ?? demonstrations[0];

  return (
    <section className="ask-alpha" aria-labelledby="ask-alpha-title">
      <div className="ask-alpha-heading">
        <div>
          <p className="eyebrow">Ask Alpha · read-only shadow prototype</p>
          <h2 id="ask-alpha-title">Owner questions become bounded evidence packets.</h2>
          <p>Keyword and local embedding retrieval find candidate records. Typed links and deterministic resolvers answer supported questions; retrieval similarity is not proof of equivalence, so missing identity evidence produces an explicit abstention.</p>
        </div>
        <div className="ask-alpha-metrics" aria-label="Ask Alpha prototype scale">
          <span><strong>4,291</strong> private records indexed</span>
          <span><strong>11,068</strong> typed relationship edges</span>
          <span><strong>4 / 4</strong> small evaluation packets passed</span>
        </div>
      </div>
      <div className="ask-alpha-body">
        <div className="ask-alpha-questions" aria-label="Redacted Ask Alpha examples">
          {demonstrations.map((item) => (
            <button key={item.id} className={item.id === selected.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>
              <span>{item.route}</span>
              <strong>{item.question}</strong>
            </button>
          ))}
        </div>
        <article className="ask-alpha-answer" aria-live="polite">
          <div className="answer-meta"><span>{selected.route}</span><b className={selected.state === "Abstained" ? "abstained" : "answered"}>{selected.state}</b></div>
          <h3>{selected.question}</h3>
          <p>{selected.answer}</p>
          <small>Evidence packet: {selected.evidence}. Every material claim retains a source pointer. This public example has no production identifiers and no write authority.</small>
        </article>
      </div>
      <p className="ask-alpha-boundary">Measured on four targeted prototype questions, not a general accuracy claim. A raw Gemma 3 4B CPU baseline did not pass the answer-safety gate, so supported graph and cost questions remain deterministic; the model is only a validated fallback.</p>
    </section>
  );
}
