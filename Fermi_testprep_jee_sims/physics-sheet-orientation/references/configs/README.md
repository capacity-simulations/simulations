Working `orient.json` files for the three finished sims, as shipped.

`orient_test.mjs` reads one of these. Fields:

| field | meaning |
|---|---|
| `miniSliders` | `[[sheetSliderId, simSliderId, testValue], …]` — the test drags the sheet slider and asserts the sim slider followed |
| `spoilers` | strings that must NOT be visible anywhere in the modal in brief mode. Numbers and verdicts the inquiry cards ask for, plus any phrase that was ever in the kicker |
| `stagingHidden` | element ids that must still be `display:none` after close AND after Run — the proof that nothing got unlocked |
| `stagingLabels` | `[[elementId, forbiddenRegex], …]` for text that changes on reveal (e.g. a legend relabelled "conserved") |
| `ctlRows` | rows in the controls table; catches drift when a sim gains a control |
| `runPlays` | whether Run should leave the sim playing |
