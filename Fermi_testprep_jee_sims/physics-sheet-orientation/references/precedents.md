# Precedents

Three sims are done. Their exact configs live in `configs/*.orient.json` — copy the
closest one rather than writing from scratch.

| sim | file | reveal function sets | DOM proxies | Run | ctlRows |
|---|---|---|---|---|---|
| conical | `Module-04/cm-conical-pendulum.html` | `revealVc, showL, showInset, conserved` | `#row-lz`, `#leg-Lz-lab` | plays | 7 |
| topple | `Module-04/cm-slide-or-topple.html` | `showSlide, showTopple, showWh` (+resets sliders) | `#panel-readout` | **paused** | 8 |
| wheel | `Module-04/cm-wheel-step.html` | `revealLvl = 99` | `#panel-ledger`, `#row-vmin`, `#row-lostFrac` | plays | 6 |

## conical

```json
{
  "miniSliders": [
    [
      "phys-theta",
      "sld-theta",
      "45"
    ],
    [
      "phys-speed",
      "sld-speed",
      "2.000"
    ]
  ],
  "spoilers": [
    "1.6820",
    "swings IN",
    "swings OUT",
    "0.4205",
    "17.73",
    "45.08",
    "2.6945",
    "conserved"
  ],
  "stagingHidden": [
    "row-lz"
  ],
  "stagingLabels": [
    [
      "leg-Lz-lab",
      "conserved"
    ]
  ],
  "ctlRows": 7,
  "runPlays": true
}
```

## topple

```json
{
  "miniSliders": [
    [
      "phys-mu",
      "mu",
      "0.70"
    ],
    [
      "phys-theta",
      "theta",
      "25"
    ]
  ],
  "spoilers": [
    "21.80",
    "26.57",
    "33.69",
    "45.00",
    "TOPPLES",
    "SLIDES",
    "0.4000",
    "0.6667",
    "w/h",
    "one comparison decides it"
  ],
  "stagingHidden": [
    "panel-readout"
  ],
  "stagingLabels": [],
  "ctlRows": 6,
  "runPlays": false
}
```

## wheel

```json
{
  "miniSliders": [
    [
      "phys-speed",
      "speed",
      "1.80"
    ],
    [
      "phys-height",
      "height",
      "0.140"
    ]
  ],
  "spoilers": [
    "1.4697",
    "0.3951",
    "39.51",
    "1.1431",
    "2.1000",
    "0.7778",
    "surviving",
    "FALLS BACK",
    "CLIMBS",
    "what the strike keeps"
  ],
  "stagingHidden": [
    "panel-ledger",
    "row-vmin",
    "row-lostFrac"
  ],
  "stagingLabels": [],
  "ctlRows": 6,
  "runPlays": true
}
```
## The three Run bodies, verbatim

```js
// conical — plays; live-panel vars: mainTheta / mainSpeed, curTheta() / curSpeed()
pushToSim(mainTheta, curTheta());
pushToSim(mainSpeed, curSpeed());
closePhys(true);

// topple — lands PAUSED; there is nothing to launch, the student is dialling in a
// configuration. Vars: mainMu / mainTheta, curMu() / curTheta()
pushToSim(mainMu, curMu());
pushToSim(mainTheta, curTheta());
closePhys(false);

// wheel — plays; vars: mainSpeed / mainHeight, curV() / curH()
pushToSim(mainSpeed, curV());
pushToSim(mainHeight, curH());
closePhys(true);
```

The `main*` and `cur*` names are whatever that sim's live-panel block already declared.
Reuse them; do not redeclare.

## Results

| sim | syntax | orient | runtime | verify_build |
|---|---|---|---|---|
| cm-conical-pendulum | 6/6 | 54/54 | 32/32 | ALL PASSED |
| cm-slide-or-topple  | 6/6 | 54/54 | 30/30 | ALL PASSED |
| cm-wheel-step       | 6/6 | 58/58 | 30/30 | ALL PASSED |

All three were patched **before** the ORIENT sentinels were added to the patcher, so
`unpatch_orientation.py` will refuse them by design. Roll those three back with git.
Everything patched from now on unpatches cleanly.

## Not yet done

The rest of `Fermi_testprep_jee_sims/`. Most of those sims are C0xx builds without a
Physics sheet at all — preflight will say so, and installing the sheet is a separate
(much larger) job before this skill applies.

## ctlRows drifts — that is the point

`ctlRows` is not cosmetic; it is the tripwire for hazard H5. Observed inside one day:
conical 6 → 7 (a `Forces` control added by another session), topple 6 → 8 (`Blocks` and
`Forces`). Each time the other session also updated the orientation table, so the fix is
to re-count and update the config — **not** to loosen the check. Re-count with:

```sh
python3 - <<'EOF'
import io, re
s = io.open('<sim.html>', encoding='utf-8').read()
i = s.index('orient-ctl'); j = s.index('</table>', i)
print(len(re.findall(r'<tr>', s[i:j])) - 1, 'body rows')
EOF
```
