# Local voice-to-review benchmark

Alpha's private owner workflow accepts a short recording from either the owner dashboard or Telegram. The recording is transcribed on the customer-controlled computer with `faster-whisper` Small in CPU `int8` mode. A bounded vocabulary supplies operational terms, but the transcript is still treated as provisional.

## Targeted test

The same mixed English/Malay operational request was recorded under three conditions: quiet, normal speech and café background noise. All three runs preserved the intended actions—linking two ingredient aliases and recording a frozen-salmon carton price. The observed CPU transcription time was approximately 5.1–5.5 seconds for recordings of approximately 16–18 seconds.

The test also exposed why review is required. One quiet recording rendered “ringgit” incorrectly, and the café recording misspelled one Malay ingredient. Alpha therefore returns editable text and diagnostics instead of treating speech as approved business data.

This is a three-recording engineering check, not a general word-error-rate or production-accuracy claim.

## Governance boundary

```text
private dashboard or Telegram voice note
                  |
       private transient audio queue
                  |
     local faster-whisper transcription
                  |
        owner edits / submits / discards
                  |
         governed proposal or no action
```

- No voice job imports or calls the operational database writer.
- The transcript does not directly alter supplier, recipe, stock or accounting records.
- Alpha deletes its transient audio copy after successful local transcription.
- Consequential changes still use the protected approval lane.
