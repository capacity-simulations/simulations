# Index.html simulation listing update
_Exported on 4/13/2026 at 22:22:40 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/index.html update so all sims in the folder are listed

---

**Cursor**

I’m updating `Sims-QM-lectures/index.html` so it lists every simulation HTML file currently in that folder. First I’m checking the folder contents and the existing index structure so I can add any missing entries cleanly.

I found that `index.html` is already driven by a hand-maintained `sims` array, and it’s just missing a few newer top-level HTML sims. I’m updating that list now so the index matches the folder contents without touching the archived `old/` copies.

The missing L06, L09, and L16 entries are in place. I’m doing a quick sanity check on the edited section and checking for any diagnostics in `index.html`.

`Sims-QM-lectures/index.html` now lists all current top-level simulation HTML files in that folder. I added the missing entries for `L06_Time_evolution_Gaussian_wavepacket.html`, both `L09` tunneling sims, and `L16_Spin-X-measurement-probability.html`, while leaving the archived files under `old/` out of the index.

I also checked `index.html` for diagnostics and found no linter errors.

