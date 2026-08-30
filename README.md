# Ascend — Alpha

Alpha is an evidence-first operations system for food businesses. It connects receipts, supplier products, recipe usage, sales and operator observations to answer one practical question:

> Where did the food margin go, and what is the smallest piece of evidence needed to resolve it?

This repository is the redacted public artifact for **Team Ascend**, submitted to the **MAIC Nexus Challenge 2026 — T6 ESG & SDG** track by **Tan Jin Wei**.

**Live dashboard:** [Open the Alpha evidence dashboard](https://steventjwai-newbie.github.io/Ascend/)

## What the prototype demonstrates

- A daily owner-facing investigation queue instead of another generic inventory screen.
- Source-linked explanations with explicit `Confirmed`, `Linked`, `Review` and `Missing` states.
- Supplier-specific receipt yields separated from recipe/preparation yields.
- Deterministic validation of quantity, unit price, line amount and invoice totals.
- Human approval before any consequential operational write.
- Local-first document processing, with remote models reserved for genuinely ambiguous cases.
- Local voice-to-review from the private dashboard and Telegram, with transient audio deletion and no direct write authority.
- Read-only owner questions using local keyword + embedding retrieval, typed evidence links and explicit abstention.

The public dashboard includes anonymized evidence from a live café pilot. Supplier identities, invoice numbers, customer records, credentials and production endpoints are intentionally excluded.

## Latest verified example

One frozen-salmon receipt recorded 8.80 kg purchased at RM46/kg and 6.15 kg of primary fillet. That is a 69.89% primary-filleting yield. A further 1.079 kg was confirmed as retained fillet coproduct for secondary dishes, bringing total retained food to 7.229 kg or 82.15%. The remaining 1.571 kg purchased-weight difference has no measured cause and is not labelled as waste, ice, packaging or drip loss. The batch remains open because its stock has not been exhausted.

Using this latest observed production mix as a provisional template, ten earlier frozen-fillet receipts totalling 52.54 kg project to approximately 36.718 kg primary fillet and 6.442 kg retained coproduct. These are modelled historical equivalents, not actual recorded production. A separate 20–23 August POS view calculates 33.02 kg of theoretical primary-fillet demand across mixed inventory; it is not reconciled to the unfinished latest receipt.

This is the product principle in miniature: **show the calculation, expose uncertainty, and ask for the minimum resolving evidence.**

## Ask Alpha — local evidence packets

The public dashboard now includes a redacted interactive demonstration of the
first Ask Alpha prototype. A disposable local index was rebuilt from 4,291
private snapshot records into 11,068 typed relationship edges. SQLite FTS5 and
the local `nomic-embed-text` model retrieve a bounded evidence packet; supported
relationship and cost questions resolve deterministically, while an unconfirmed
identity question abstains because similarity is not proof of equivalence.

All four targeted evaluation questions retrieved their expected evidence and
passed their answer-or-abstention checks after the deterministic guardrails were
added. This is a small engineering evaluation, not a general accuracy claim.
The raw Gemma 3 4B CPU baseline did not pass the answer-safety gate, so it is not
presented as an autonomous reasoner or promoted to the default route. Ask Alpha
remains read-only and cannot change supplier, recipe, stock or accounting data.

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

Owner voice follows the same boundary. The private dashboard or Telegram queues a short recording to `faster-whisper` Small on the customer-controlled computer. Domain vocabulary helps with operational terms; the returned transcript is edited or discarded by a human before it can become a proposal. Audio is deleted from Alpha's transient queue after successful transcription. See [the redacted voice benchmark](docs/local-voice-benchmark.md).

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

The production voice worker is deliberately excluded from this redacted public artifact. Its disclosed Python runtime dependency is recorded in [`requirements-voice.txt`](requirements-voice.txt) for reproducibility; the public dashboard itself does not need it.

## Scope and roadmap

The implemented artifact is intentionally narrow: evidence review, a salmon receipt-yield case, an earlier theoretical-stock case, master-data conflicts and document-date quarantine. The private operational system additionally integrates approval and source-system workflows; those credentials and identifiers do not belong in this repository.

See [ROADMAP.md](ROADMAP.md) for the validation path. Commercial claims remain contingent on the café pilot—modelled variance is not labelled as confirmed waste or recovered savings.

## Privacy and use

This is a judging and technical-review artifact, not the production repository. See [SECURITY.md](SECURITY.md). The source is visible for evaluation, but no open-source licence is granted; see [LICENSE](LICENSE).

## Team

- **Team:** Ascend
- **Participant:** Tan Jin Wei
- **Track:** T6 — ESG & SDG
