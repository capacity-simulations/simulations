/**
 * Feedback endpoint for the simulation viewers across all four courses.
 *
 * ---------- ONE-TIME SETUP (~5 minutes) ----------
 *
 * 1. Create a new Google Sheet — any name (e.g. "Sims Feedback").
 *    You do NOT need to create tabs manually; initSheet builds them.
 * 2. Extensions → Apps Script. Delete any starter code, paste this whole file.
 * 3. Select the `initSheet` function in the toolbar dropdown → Run.
 *    - It will ask for permission to edit the sheet; grant it.
 *    - It creates (or ensures) five tabs — PP, QM, SR, CM, JEE — each with:
 *        Row 1 header:  Sim | v1 | v2 | … | v10   (MAX_VERSIONS columns)
 *        Rows 2..N:     one row per sim, column A pre-populated with the title.
 *    - Safe to re-run; never overwrites existing feedback.
 *    - Re-run after changing MAX_VERSIONS to widen the header row.
 * 4. Deploy → New deployment → gear icon → Web app.
 *    - Description: sims feedback v1
 *    - Execute as:  Me
 *    - Who has access:  Anyone
 *    - Click Deploy. Copy the Web app URL (ends in /exec).
 * 5. Paste that URL into the `FEEDBACK_URL` constant inside every course's
 *    viewer.html file (all four use the same endpoint):
 *      Fermi_Particle_physics_sims/Sims_v2_lecture_versions/viewer.html   (PP)
 *      Capacity_CM_simulations/viewer.html                                (CM)
 *      Capacity_Quantum_simulations/Sims_user_versions/viewer.html        (QM)
 *      Capacity_SR_sims_v2_engine/shell-versions/viewer.html              (SR)
 * 6. Commit + push. That's it.
 *
 * To rotate / redeploy later: Deploy → Manage deployments → edit → New version.
 * The /exec URL stays the same.
 *
 * ---------- HOW SUBMISSIONS ARE ROUTED ----------
 *
 * Each viewer.html (and each embedded pill) sends:
 *   course=<PP|QM|SR|CM|JEE>, sim=<title|filename-stem>, message=<text>.
 *   JEE sims embed the pill directly and send the filename stem as `sim`.
 * doPost finds the row for that sim title (col A) in the matching tab, then
 * writes the dated message into the first empty cell among v1..v10. Any
 * submission after all MAX_VERSIONS cells are filled returns an error.
 */

const MAX_VERSIONS = 10;
const MAX_MESSAGE_CHARS = 5000;

const SIM_TITLES_BY_COURSE = {
  JEE: [
    "C021-equations-of-motion-for-uniform-acceleration",
    "C023-reading-x-t-v-t-and-a-t-graphs",
    "C024-relative-velocity-in-one-dimension",
    "C025-projectile-motion-ground-to-ground--with-air-drag",
    "C025-projectile-motion-ground-to-ground",
    "C028-relative-velocity-in-2d-river-boat-rain-man",
    "C030-newtons-first-law-and-inertia",
    "C031-newtons-second-law-f-ma",
    "C032-newtons-third-law-pairs",
    "C033-free-body-diagrams-the-master-skill",
    "C036-pseudo-forces-and-non-inertial-frames",
    "C037-static-and-kinetic-friction",
    "C039-motion-on-inclined-planes-with-friction",
    "C041-banking-of-roads",
    "C042-vertical-circular-motion",
    "C046-work-energy-theorem",
    "C051-conservation-of-mechanical-energy",
    "C053-potential-energy-curves-and-equilibrium-stable-unstable",
    "C054-elastic-and-inelastic-collisions-in-1d--momentum-and-energy",
    "C054-elastic-and-inelastic-collisions-in-1d",
    "C055-collisions-in-2d-and-coefficient-of-restitution",
    "C059-impulse-momentum-theorem",
    "C062-torque-moment-of-force",
    "C063-moment-of-inertia-and-radius-of-gyration",
    "C064-parallel-and-perpendicular-axis-theorems",
    "C067-conservation-of-angular-momentum",
    "C069-rolling-motion-without-slipping",
    "C070-rolling-on-an-inclined-plane",
    "C072-toppling-vs-sliding-combined-equilibrium",
    "C077-escape-velocity",
    "C078-orbital-velocity-and-satellite-time-period",
    "C079-geostationary-and-polar-satellites",
    "C080-keplers-three-laws--solar-system",
    "C080-keplers-three-laws",
    "C081-energy-of-a-satellite-and-binding-energy",
    "C088-buoyancy-and-archimedes-principle",
    "C090-equation-of-continuity",
    "C092-viscosity-stokes-law-and-terminal-velocity--raindrop-in-air",
    "C097-thermal-expansion-linear-areal-volumetric",
    "C099-latent-heat-and-change-of-state",
    "C100-heat-conduction-steady-state-thermal-resistance",
    "C103-black-body-radiation-stefan-boltzmann-and-wiens-law",
    "C104-ideal-gas-equation-and-the-gas-laws",
    "C106-rms-average-and-most-probable-speeds",
    "C108-degrees-of-freedom-and-equipartition-of-energy",
    "C113-thermodynamic-processes-isothermal-adiabatic-isobaric-isochoric",
    "C118-the-carnot-cycle",
    "C120-shm-defining-relation-and-phasor-picture",
    "C123-spring-block-systems-series-and-parallel-springs",
    "C124-the-simple-pendulum",
    "C126-damped-oscillations--three-regimes",
    "C127-forced-oscillations-and-resonance",
    "C132-principle-of-superposition",
    "C134-standing-waves-on-strings-and-harmonics",
    "C135-standing-waves-in-air-columns-open-and-closed-pipes",
    "C136-beats",
    "C137-the-doppler-effect-sound",
    "C139-electric-charge-quantisation-and-coulombs-law",
    "C140-electric-field-and-field-lines",
    "C142-electric-dipole-and-its-field",
    "C143-dipole-in-a-uniform-field-torque-and-energy",
    "C144-electric-flux-and-gausss-law",
    "C148-relation-between-field-and-potential-gradient",
    "C149-equipotential-surfaces",
    "C152-capacitors-in-series-and-parallel",
    "C154-dielectrics-polarisation-and-capacitance-change",
    "C156-electric-current-drift-velocity-and-mobility",
    "C157-ohms-law-and-resistance",
    "C159-resistors-in-series-and-parallel",
    "C160-emf-internal-resistance-and-terminal-voltage",
    "C161-kirchhoffs-laws",
    "C166-rc-circuits-charging-and-discharging",
    "C169-charged-particle-in-a-magnetic-field-circular-and-helical",
    "C170-the-cyclotron",
    "C171-force-on-a-current-carrying-conductor",
    "C173-torque-on-a-current-loop-magnetic-moment",
    "C175-field-due-to-a-straight-wire-and-a-circular-loop",
    "C183-magnetic-flux-and-faradays-law",
    "C185-motional-emf",
    "C190-growth-and-decay-of-current-in-an-lr-circuit",
    "C192-ac-through-r-l-and-c-separately",
    "C193-series-lcr-circuit-and-impedance",
    "C194-resonance-in-a-series-lcr-circuit",
    "C198-displacement-current",
    "C199-electromagnetic-waves-nature-and-properties",
    "C202-spherical-mirrors-and-the-mirror-formula",
    "C203-refraction-and-snells-law",
    "C204-total-internal-reflection-and-applications",
    "C206-thin-lens-formula-and-lensmakers-equation",
    "C208-prism-deviation-and-dispersion",
    "C210-the-astronomical-and-terrestrial-telescope",
    "C213-interference-and-youngs-double-slit-experiment",
    "C215-single-slit-diffraction",
    "C216-resolving-power-of-instruments",
    "C217-polarisation-and-maluss-law",
    "C219-the-photoelectric-effect-observations",
    "C222-de-broglie-waves-and-the-davisson-germer-experiment",
    "C223-rutherfords-model-and-alpha-particle-scattering",
    "C224-bohrs-model-of-the-hydrogen-atom",
    "C225-energy-levels-and-the-hydrogen-spectral-series--emission-and-absorption",
    "C225-energy-levels-and-the-hydrogen-spectral-series",
    "C230-radioactive-decay-law-and-half-life",
  ],
  PP: [
    "Exploring the Standard Model",
    "Scale of the Universe",
    "Geiger–Marsden Gold Foil Experiment",
    "Spin and Helicity",
    "Dirac's Sea of Electrons",
    "Virtual Cloud Chamber",
    "How To Make a Particle",
    "Feynman Diagram Sandbox",
    "Navigating the Eight-Fold Way",
    "Build-A-Baryon",
    "Wu Experiment and the Death of Parity",
    "The Wine Bottle Potential",
    "Virtual Particle Collider",
    "Particle Detector Headquarters",
  ],
  CM: [
    "Solar System Orbits",
    "Newton's Three Laws",
    "Forces on Objects Explorer",
    "Projectile Motion",
    "The Harmonic Oscillator",
    "Motion in a Potential",
    "The Pendulum",
    "Projectile Motion with Air Drag",
    "The Damped Harmonic Oscillator",
    "The Centrifugal Force",
    "The Coriolis Force",
    "Coriolis on a Rotating Sphere",
    "The Energy of the Orbit — V_eff",
    "The Energy of the Orbit — V(r)",
    "Rutherford Scattering",
    "Kepler's Laws",
    "Pi Digits from Collisions",
    "Collisions",
    "Free-Body Diagram Builder",
  ],
  QM: [
    "2d wavefunction collapse measurement",
    "A(k) vs k plot",
    "Bound states",
    "Classical vs schrodinger ANHARMONIC",
    "Classical vs schrodinger",
    "Double slit experiment",
    "Double slit exp Measurement",
    "Finite well probability plot",
    "Fourier series",
    "Harmonic oscillator",
    "Harmonic Oscillator High Energies",
    "Hydrogen atom energy spectrum",
    "Hydrogen atom wavefunctions",
    "Multi Stage Stern Gerlach New",
    "Particle on a circle",
    "Quantum Tunneling Gaussian Wave",
    "Quantum tunneling Plane Wave",
    "Single Gaussian plot",
    "Spherical harmonics Explorer",
    "Spin X measurement probability",
    "Spin Measurement",
    "Time evolution Gaussian Fourier comps",
    "Time evolution Gaussian wavepacket",
    "Time evolution QHO v2",
    "Transmission probability plot",
    "Two Gaussian superposition",
    "Vector Space Finite Vectors Updated",
    "infinite potential well",
    "stern gerlach NEW",
    "wavefunctions and probability",
  ],
  SR: [
    "L00-S1 · Ball on a Train — Motion is Relative",
    "L00-S2 · Fly on a Boat — Galilean Relativity",
    "L01-S1 · Polar vs Cartesian Motion",
    "L01-S2 · Different Coordinate Frames",
    "L02-S1 · Inner Product Invariance",
    "L02-S2 · Euclidean Space & the Metric",
    "L03-S1 · Shape Rotation & Symmetry",
    "L04-S1 · Scalars vs Vectors under Rotation",
    "L04-S2 · Distance under Translation & Rotation",
    "L05-S1 · Frame Clock & Event Time",
    "L05-S2 · Spacetime Diagram Explorer",
    "L05-S2 · Spacetime Diagram Explorer (New)",
    "L06-S1 · Dodgeball — Galilean Velocity Addition",
    "L06-S2 · Relative Velocity of a Plane",
    "L07-S1 · Michelson–Morley Experiment · 3D",
    "L07-S2 · Airplane in Wind — the Aether Analogy",
    "L08-S1 · Relativity of Simultaneity",
    "L08-S2 · Spacetime Diagram Explorer — Light Cones",
    "L08-S2 · Spacetime Diagram Explorer (New)",
    "L09-S1 · Worldline Length & Proper Time",
    "L10-S1 · Minkowski Space & the Metric",
    "L10-S2 · Lorentz Boost vs Euclidean Rotation",
    "L11-S1 · Time Dilation — Light Clock",
    "L11-S2 · Light Clock — Geometric Derivation of Time Dilation",
    "L11-S3 · Length Contraction & Simultaneity",
    "L12-S0 · Twin Paradox — The Run (Intro)",
    "L12-S1 · Twin Paradox · Worldline Comparison",
    "L12-S2 · Twin Paradox · One-Way Signal",
    "L13-S1 · Lorentz Transformation of a Four-Vector",
    "L14-S1 · Relativistic Momentum vs. Velocity",
    "L15-S1 · Relativistic Constant Acceleration",
    "L16-S1 · Energy–Momentum Conservation in Relativistic Collisions",
    "L17-S1 · Photon Worldline & Vanishing Proper Time",
    "L18-S0 · Tachyon Causality Violation — Primed Axes",
    "L18-S1 · Tachyon Causality Violation",
    "L18-S2 · Causal Ordering & the Spacetime Interval",
    "L18-S2 · Causality Misconceptions — Spacetime Explorer (New)",
    "L19-S2 · Electric & Magnetic Fields under a Boost",
  ],
};

function initSheet() {
  const ss = SpreadsheetApp.getActive();
  const header = ["Sim"];
  for (let v = 1; v <= MAX_VERSIONS; v++) header.push("v" + v);

  Object.keys(SIM_TITLES_BY_COURSE).forEach(function (course) {
    let sheet = ss.getSheetByName(course);
    if (!sheet) sheet = ss.insertSheet(course);

    sheet.getRange(1, 1, 1, header.length).setValues([header])
         .setFontWeight("bold").setBackground("#eef2ff");
    sheet.setFrozenRows(1);

    const lastRow = sheet.getLastRow();
    const existing = lastRow >= 2
      ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(function(v){return String(v).trim();})
      : [];
    const titles = SIM_TITLES_BY_COURSE[course];
    const missing = titles.filter(function(t){ return existing.indexOf(t) === -1; });
    if (missing.length) {
      const startRow = Math.max(2, sheet.getLastRow() + 1);
      sheet.getRange(startRow, 1, missing.length, 1)
           .setValues(missing.map(function(t){ return [t]; }));
    }

    sheet.setColumnWidth(1, 260);
    for (let c = 2; c <= 1 + MAX_VERSIONS; c++) sheet.setColumnWidth(c, 320);
    sheet.getRange(1, 2, sheet.getMaxRows(), MAX_VERSIONS).setWrap(true).setVerticalAlignment("top");
  });
}

function doGet() {
  return jsonOut({ ok: true, msg: "feedback endpoint alive" });
}

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.hp) return jsonOut({ ok: false, err: "rejected" });

    const course = String(p.course || "").trim();
    const sim = String(p.sim || "").trim();
    const message = String(p.message || "").trim();

    if (!course) return jsonOut({ ok: false, err: "missing course" });
    if (!sim) return jsonOut({ ok: false, err: "missing sim" });
    if (!message) return jsonOut({ ok: false, err: "empty message" });
    if (message.length > MAX_MESSAGE_CHARS)
      return jsonOut({ ok: false, err: "message too long" });

    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(course);
    if (!sheet) return jsonOut({ ok: false, err: "no tab: " + course });

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return jsonOut({ ok: false, err: "sheet not initialized — run initSheet" });

    const data = sheet.getRange(2, 1, lastRow - 1, 1 + MAX_VERSIONS).getValues();
    const rowIdx = data.findIndex(function(row){ return String(row[0]).trim() === sim; });
    if (rowIdx === -1) return jsonOut({ ok: false, err: "sim not found: " + sim });

    const row = data[rowIdx];
    let versionCol = -1;
    for (let c = 1; c <= MAX_VERSIONS; c++) {
      if (!String(row[c] || "").trim()) { versionCol = c; break; }
    }
    if (versionCol === -1)
      return jsonOut({ ok: false, err: "all " + MAX_VERSIONS + " versions used for: " + sim });

    const tz = ss.getSpreadsheetTimeZone() || "UTC";
    const stamp = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm");
    const cellValue = "[" + stamp + "] " + message;
    sheet.getRange(rowIdx + 2, versionCol + 1).setValue(cellValue);

    return jsonOut({ ok: true, sim: sim, version: "v" + versionCol });
  } catch (err) {
    return jsonOut({ ok: false, err: String(err && err.message || err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
