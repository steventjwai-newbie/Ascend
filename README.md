# Ascend — Alpha

Alpha is an evidence-first operations system for food businesses. It connects receipts, supplier products, recipe usage, sales and operator observations to answer one practical question:

> Where did the food margin go, and what is the smallest piece of evidence needed to resolve it?

This repository is the redacted public artifact for **Team Ascend**, submitted to the **MAIC Nexus Challenge 2026 — T6 ESG & SDG** track by **Tan Jin Wei**.

## What the prototype demonstrates

- A daily owner-facing investigation queue instead of another generic inventory screen.
- Source-linked explanations with explicit `Confirmed`, `Linked`, `Review` and `Missing` states.
- Supplier-specific receipt yields separated from recipe/preparation yields.
- Deterministic validation of quantity, unit price, line amount and invoice totals.
- Human approval before any consequential operational write.
- Local-first document processing, with remote models reserved for genuinely ambiguous cases.

The public dashboard includes anonymized evidence from a live café pilot. Supplier identities, invoice numbers, customer records, credentials and production endpoints are intentionally excluded.

## Latest verified example

One frozen-salmon receipt recorded 8.80 kg purchased at RM46/kg and 6.15 kg after thawing. That is a 69.89% receipt yield and an effective thawed cost of approximately RM65.82/kg. Recorded output allocations totalled 6.079 kg, leaving 71 g still to reconcile. A separate handwritten 1.079 kg note remains under review because its scope is unclear and is excluded from the calculation.

This is the product principle in miniature: **show the calculation, expose uncertainty, and ask for the minimum resolving evidence.**

## Pipeline

```text
Document / POS / recipe / operator observation
                    |
         local OCR + deterministic checks
                    |
          canonical operational objects
                    |
        evidence-linked investigation
                    |
       owner review and governed action
```

Rapid local extraction handles common document fields. More accurate local OCR and structured reconstruction run asynchronously where needed. Schema, arithmetic and cross-record checks catch many errors without an AI call. Remote model escalation is optional and never grants write authority.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
```

## Scope and roadmap

The implemented artifact is intentionally narrow: evidence review, a salmon receipt-yield case, an earlier theoretical-stock case, master-data conflicts and document-date quarantine. The private operational system additionally integrates approval and source-system workflows; those credentials and identifiers do not belong in this repository.

See [ROADMAP.md](ROADMAP.md) for the validation path. Commercial claims remain contingent on the café pilot—modelled variance is not labelled as confirmed waste or recovered savings.

## Privacy and use

This is a judging and technical-review artifact, not the production repository. See [SECURITY.md](SECURITY.md). The source is visible for evaluation, but no open-source licence is granted; see [LICENSE](LICENSE).

## Team

- **Team:** Ascend
- **Participant:** Tan Jin Wei
- **Track:** T6 — ESG & SDG
