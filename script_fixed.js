// ========================================
// 🌶️ SCHILISCHOTEN-AGENTEN
// FIXED.JS
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // HILFSFUNKTION
  // ========================================

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }


  // ========================================
  // NAVIGATION
  // ========================================

  const navButtons = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  const pageInfo = {
    dashboard: [
      "Ermittlungszentrale",
      "Willkommen zurück, Agent."
    ],
    cases: [
      "Fälle",
      "Verwalte alle laufenden Missionen."
    ],
    compare: [
      "Beweise vergleichen",
      "Vergleiche zwei Beweisstücke miteinander."
    ],
    phantom: [
      "Phantombild-Generator",
      "Stelle ein Phantombild aus einzelnen Merkmalen zusammen."
    ],
    evidence: [
      "Beweisarchiv",
      "Alle gesammelten Hinweise."
    ],
    suspects: [
      "Verdächtige",
      "Personen aus laufenden Ermittlungen."
    ],
    chat: [
      "Agenten-Chat",
      "Nur für Mitglieder der Ermittlungszentrale."
    ],
    team: [
      "Ermittler-Team",
      "Die Agenten der Schilischoten-Zentrale."
    ],
    stats: [
      "Statistiken",
      "Die Leistung der Ermittlungszentrale."
    ],
    settings: [
      "Einstellungen",
      "Verwalte deine Ermittlungszentrale."
    ]
  };


  function showPage(pageName) {

    let targetPage = document.getElementById(pageName);

    if (!targetPage) {
      const info = pageInfo[pageName] || [pageName, "Bereich der Ermittlungszentrale."];
      targetPage = document.createElement("section");
      targetPage.id = pageName;
      targetPage.className = "page generated-page";
      targetPage.innerHTML = `
        <div class="page-card">
          <div class="section-heading">
            <div>
              <span class="eyebrow">ERMITTLUNGSZENTRALE</span>
              <h1>${escapeHTML(info[0])}</h1>
              <p>${escapeHTML(info[1])}</p>
            </div>
          </div>
          <div class="empty-state">Dieser Bereich ist bereit für deine nächste Spur.</div>
        </div>
      `;
      document.querySelector(".main")?.appendChild(targetPage);
    }

    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle(
        "active",
        page.id === pageName
      );
    });

    navButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });


    const info = pageInfo[pageName];

    const title =
      document.getElementById("pageTitle");

    const subtitle =
      document.getElementById("pageSubtitle");


    if (info) {

      if (title) {
        title.textContent = info[0];
      }

      if (subtitle) {
        subtitle.textContent = info[1];
      }

    }


    if (pageName === "phantom") {
      renderPhantom();
    }

    if (pageName === "evidence") {
      renderEvidence();
    }

    if (pageName === "suspects") {
      renderSuspects();
    }

    if (pageName === "team") {
      renderTeam();
    }

  }


  navButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {
        showPage(button.dataset.page);
      }
    );

  });


  document
    .querySelectorAll("[data-goto]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {
          showPage(button.dataset.goto);
        }
      );

    });


  // ========================================
  // DATENSPEICHERUNG
  // ========================================

  const STORAGE = {
    cases: "schilischoten_cases",
    evidence: "schilischoten_evidence",
    suspects: "schilischoten_suspects",
    messages: "schilischoten_messages"
  };


  function readArray(key) {

    try {

      const value =
        JSON.parse(
          localStorage.getItem(key) || "[]"
        );

      return Array.isArray(value)
        ? value
        : [];

    } catch {

      return [];

    }

  }


  let cases =
    readArray(STORAGE.cases);

  const userCases = cases.filter(item => {
    if (!item || typeof item !== "object") return false;
    if (!item.createdAt || Number.isNaN(Date.parse(String(item.createdAt)))) return false;
    const source = String(item.source || item.createdBy || item.origin || "")
      .trim()
      .toLowerCase();
    const caseLabel = String(item.name || item.title || "")
      .trim()
      .toLowerCase();
    const aiFlag = item.aiGenerated === true || item.aiGenerated === "true" || item.generatedByAI === true;
    const generatedSource = ["ai", "ki", "demo", "ai-agent", "ki-agent"].includes(source);
    const generatedLabel = /^(ki|ai|demo)[ -]?(fall|case|mission)|^(ki|ai)[ -]?generiert/.test(caseLabel);
    return !aiFlag && !generatedSource && !generatedLabel;
  });
  if (userCases.length !== cases.length) {
    cases = userCases;
    localStorage.setItem(STORAGE.cases, JSON.stringify(cases));
  }

  let evidence =
    readArray(STORAGE.evidence);

  let suspects =
    readArray(STORAGE.suspects);

  let messages =
    readArray(STORAGE.messages);


  function saveData() {

    localStorage.setItem(
      STORAGE.cases,
      JSON.stringify(cases)
    );

    localStorage.setItem(
      STORAGE.evidence,
      JSON.stringify(evidence)
    );

    localStorage.setItem(
      STORAGE.suspects,
      JSON.stringify(suspects)
    );

    localStorage.setItem(
      STORAGE.messages,
      JSON.stringify(messages)
    );

  }


  // ========================================
  // DASHBOARD
  // ========================================

  function renderDashboard() {

    const active =
      cases.filter(item =>
        item.status === "open" ||
        item.status === "progress"
      ).length;


    const solved =
      cases.filter(item =>
        item.status === "done"
      ).length;


    const values = {

      activeCasesCount:
        active,

      dashboardEvidenceCount:
        evidence.length,

      dashboardSuspectCount:
        suspects.length,

      solvedCasesCount:
        solved

    };


    Object.entries(values).forEach(
      ([id, value]) => {

        const element =
          document.getElementById(id);

        if (element) {
          element.textContent =
            String(value);
        }

      }
    );


    const list =
      document.getElementById(
        "dashboardCasesList"
      ) ||
      document.getElementById(
        "dashboardCases"
      );


    if (!list) return;


    if (!cases.length) {

      list.innerHTML =
        `<p class="empty-text">
          Keine aktuellen Fälle vorhanden.
        </p>`;

      return;

    }


    list.innerHTML =
      cases
        .slice(0, 5)
        .map(item => `

          <div class="case-card">

            <div class="case-meta">

              <div>

                <h3>
                  ${escapeHTML(
                    item.name ||
                    "Unbenannter Fall"
                  )}
                </h3>

                <p>
                  ${escapeHTML(
                    item.description ||
                    "Keine Beschreibung"
                  )}
                </p>

              </div>

              <span class="status ${
                escapeHTML(
                  item.status ||
                  "open"
                )
              }">
                ${escapeHTML(
                  item.status ||
                  "open"
                )}
              </span>

            </div>

          </div>

        `)
        .join("");

  }


  // ========================================
  // FÄLLE
  // ========================================

  function renderCases() {

    const list =
      document.getElementById(
        "casesList"
      );


    if (!list) return;


    const search =
      (
        document.getElementById(
          "caseSearch"
        )?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const filter =
      document.getElementById(
        "caseFilter"
      )?.value ||
      "all";


    const filtered =
      cases.filter(item => {

        const text =
          `${item.name || ""} ${
            item.description || ""
          }`.toLowerCase();


        const matchesText =
          !search ||
          text.includes(search);


        const matchesFilter =
          filter === "all" ||
          item.status === filter;


        return (
          matchesText &&
          matchesFilter
        );

      });


    if (!filtered.length) {

      list.innerHTML =
        `<div class="empty-state">
          Keine Fälle gefunden.
        </div>`;

      return;

    }


    list.innerHTML =
      filtered
        .map(item => `

          <article class="case-card">

            <div class="case-meta">

              <div>

                <h3>
                  ${escapeHTML(
                    item.name ||
                    "Unbenannter Fall"
                  )}
                </h3>

                <small>
                  Priorität:
                  ${escapeHTML(
                    item.priority ||
                    "medium"
                  )}
                </small>

              </div>

              <span class="status ${
                escapeHTML(
                  item.status ||
                  "open"
                )
              }">
                ${escapeHTML(
                  item.status ||
                  "open"
                )}
              </span>

            </div>

            <p>
              ${escapeHTML(
                item.description ||
                "Keine Beschreibung"
              )}
            </p>

          </article>

        `)
        .join("");

  }


  document
    .getElementById("caseSearch")
    ?.addEventListener(
      "input",
      renderCases
    );


  document
    .getElementById("caseFilter")
    ?.addEventListener(
      "change",
      renderCases
    );


  // ========================================
  // FALL-MODAL
  // ========================================

  const caseModal =
    document.getElementById(
      "caseModal"
    );


  function openCaseModal() {

    caseModal?.classList.add(
      "show"
    );

  }


  document
    .getElementById("newCaseButton")
    ?.addEventListener(
      "click",
      openCaseModal
    );


  document
    .getElementById("dashboardNewCase")
    ?.addEventListener(
      "click",
      openCaseModal
    );


  document
    .getElementById("caseForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const name =
          document
            .getElementById("caseName")
            ?.value
            .trim();


        if (!name) return;


        cases.unshift({

          id:
            Date.now(),

          name,

          description:
            document
              .getElementById(
                "caseDescription"
              )
              ?.value
              .trim() || "",

          priority:
            document
              .getElementById(
                "casePriority"
              )
              ?.value ||
            "medium",

          status:
            document
              .getElementById(
                "caseStatus"
              )
              ?.value ||
            "open",

          createdAt:
            new Date()
              .toISOString(),

          source: "user"

        });


        saveData();

        renderAll();

        caseModal?.classList.remove(
          "show"
        );

        event.target.reset();

      }
    );


  // ========================================
  // MODALS
  // ========================================

  document
    .querySelectorAll("[data-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .getElementById(
              button.dataset.close
            )
            ?.classList.remove(
              "show"
            );

        }
      );

    });


  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            modal.classList.remove(
              "show"
            );

          }

        }
      );

    });


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        document
          .querySelectorAll(
            ".modal"
          )
          .forEach(modal => {

            modal.classList.remove(
              "show"
            );

          });

      }

    }
  );


  // ========================================
  // PHANTOMBILD
  // ========================================

  const phantomOptions = {

    face: [
      "Oval",
      "Rund",
      "Kantig",
      "Schmal",
      "Herz",
      "Länglich",
      "Breit"
    ],

    skin: [
      "Hell",
      "Mittel",
      "Dunkel",
      "Sehr hell"
    ],

    skinMarks: [
      "Keine",
      "Sommersprossen",
      "Muttermal",
      "Leberflecken"
    ],

    hair: [
      "Kurz",
      "Locken",
      "Irokese",
      "Glatze",
      "Lang",
      "Mittellang",
      "Seitenscheitel",
      "Wellig",
      "Undercut",
      "Buzz Cut",
      "Pompadour",
      "Zopf",
      "Afro",
      "Dreadlocks",
      "Pferdeschwanz",
      "Slick Back"
    ],

    hairColor: [
      "Schwarz",
      "Braun",
      "Blond",
      "Rot",
      "Grau"
    ],

    eyes: [
      "Rund",
      "Schmal",
      "Mandelförmig",
      "Tief liegend"
    ],

    eyeColor: [
      "Braun",
      "Grün",
      "Blau",
      "Grau"
    ],

    eyeDetail: [
      "Natürlich",
      "Augenringe",
      "Helle Reflexe",
      "Lange Wimpern"
    ],

    brows: [
      "Gerade",
      "Geschwungen",
      "Dicht",
      "Dünn"
    ],

    nose: [
      "Gerade",
      "Gebogen",
      "Breit",
      "Klein"
    ],

    mouth: [
      "Neutral",
      "Lächeln",
      "Bart",
      "Voll",
      "Offen"
    ],

    beard: [
      "Keine",
      "Dreitagebart",
      "Vollbart",
      "Schnurrbart",
      "Kinnbart",
      "Ziegenbart",
      "Stoppelbart",
      "Backenbart",
      "Ankerbart",
      "Vollbart kurz"
    ],

    age: [
      "Jung",
      "Erwachsen",
      "Reif",
      "Älter"
    ],

    expression: [
      "Neutral",
      "Ernst",
      "Freundlich",
      "Überrascht"
    ],

    ears: [
      "Normal",
      "Groß",
      "Abstehend"
    ],

    scars: [
      "Keine",
      "Stirn",
      "Wange",
      "Kinn"
    ],

    tattoos: [
      "Keine",
      "Stern",
      "Wange",
      "Hals",
      "Tribal",
      "Schriftzug",
      "Kleines Symbol",
      "Nackentattoo"
    ],

    accessories: [
      "Keine",
      "Mütze",
      "Ohrring",
      "Brille rund",
      "Brille eckig",
      "Brille randlos",
      "Sonnenbrille",
      "Sonnenbrille Aviator",
      "Sonnenbrille rechteckig"
    ],

    backgroundTone: [
      "Grau",
      "Neutral",
      "Blau"
    ],

    renderMode: [
      "Schwarzweiß",
      "Farbe",
      "Kontrast"
    ]

  };


  const phantomState =
    Object.fromEntries(
      Object.entries(
        phantomOptions
      ).map(
        ([key, values]) => [
          key,
          values[0]
        ]
      )
    );


  const phantomFineState = {
    eyeSpacing: 50,
    eyeHeight: 50,
    noseDefinition: 50,
    skinDetail: 24,
    eyeSize: 50,
    cheekbones: 35,
    beardDensity: 80,
    faceSymmetry: 50,
    jawWidth: 50,
    foreheadHeight: 50,
    mouthWidth: 50,
    earHeight: 50,
    eyeTilt: 50,
    noseWidth: 50,
    lipFullness: 50,
    cheekFullness: 50,
    chinLength: 50,
    skinTexture: 24,
    browHeight: 50,
    noseLength: 50,
    nostrilWidth: 50,
    earSize: 50,
    hairVolume: 50,
    faceLight: 50,
    eyeContrast: 50,
    featureSoftness: 24,
    neckWidth: 50,
    phantomGrid: false
  };


  const phantomControls =
    document.getElementById(
      "phantomControls"
    );


  const phantomCanvas =
    document.getElementById(
      "phantomCanvas"
    );


  const phantomName =
    document.getElementById(
      "phantomName"
    );

  const phantomCaseNumber = document.getElementById("phantomCaseNumber");
  const phantomDate = document.getElementById("phantomDate");


  function getSkinColor() {

    if (
      phantomState.skin ===
      "Hell"
    ) {

      return "#efc7ab";

    }

    if (
      phantomState.skin ===
      "Dunkel"
    ) {

      return "#7e503e";

    }

    if (phantomState.skin === "Sehr hell") {
      return "#f4d9c1";
    }

    return "#c98f70";

  }


  function faceShape() {

    switch (
      phantomState.face
    ) {

      case "Rund":

        return `
          <ellipse
            cx="300"
            cy="355"
            rx="157"
            ry="165"
          />
        `;


      case "Kantig":

        return `
          <path
            d="
              M198 258
              Q210 192 300 176
              Q390 192 402 258
              Q410 350 394 428
              Q370 510 300 544
              Q230 510 206 428
              Q190 350 198 258
            "
          />
        `;


      case "Schmal":

        return `
          <path
            d="
              M225 238
              Q300 175 375 238
              Q405 350 379 455
              Q347 528 300 548
              Q253 528 221 455
              Q195 350 225 238
              Z
            "
          />
        `;

      case "Herz":
        return `
          <path d="M190 270 Q205 186 300 212 Q395 186 410 270 Q402 458 300 550 Q198 458 190 270 Z" />
        `;

      case "Länglich":
        return `
          <path d="M218 242 Q300 168 382 242 Q404 350 374 478 Q344 552 300 570 Q256 552 226 478 Q196 350 218 242 Z" />
        `;

      case "Breit":
        return `
          <path d="M178 278 Q198 188 300 176 Q402 188 422 278 L410 430 Q380 520 300 544 Q220 520 190 430 Z" />
        `;


      default:

        return `
          <ellipse
            cx="300"
            cy="355"
            rx="138"
            ry="180"
          />
        `;

    }

  }


  function earsSVG(
    skin
  ) {

    let rx = 27 * (0.84 + phantomFineState.earSize / 420);

    let leftX = 150;
    let rightX = 450;
    const earY = 350 + (phantomFineState.earHeight - 50) * 1.2;


    if (
      phantomState.ears ===
      "Groß"
    ) {

      rx = 36 * (0.84 + phantomFineState.earSize / 420);
      leftX = 142;
      rightX = 458;

    }


    if (
      phantomState.ears ===
      "Abstehend"
    ) {

      leftX = 134;
      rightX = 466;
      rx = 33 * (0.84 + phantomFineState.earSize / 420);

    }


    return `

      <ellipse
        cx="${leftX}"
        cy="${earY}"
        rx="${rx}"
        ry="49"
        fill="${skin}"
        stroke="#815641"
        stroke-width="2.5"
      />

      <ellipse
        cx="${rightX}"
        cy="${earY}"
        rx="${rx}"
        ry="49"
        fill="${skin}"
        stroke="#815641"
        stroke-width="2.5"
      />

    `;

  }


  function hairSVG() {

    const hairColors = {
      Schwarz: "#171719",
      Braun: "#4a2d22",
      Blond: "#b9854e",
      Rot: "#7d3828",
      Grau: "#777477"
    };

    const color =
      hairColors[phantomState.hairColor] ||
      "#171719";


    if (
      phantomState.hair ===
      "Glatze"
    ) {

      return `
        <path
          d="
            M174 285
            Q180 176 300 145
            Q420 176 426 285
          "
          fill="none"
          stroke="${color}"
          stroke-width="3"
          opacity=".22"
        />
      `;

    }


    if (
      phantomState.hair ===
      "Locken"
    ) {

      return `

        <g fill="url(#hairGradient)" stroke="#131315" stroke-width="1.8">
          <path d="M174 286 Q178 166 300 143 Q422 166 426 286 Q388 220 300 220 Q212 220 174 286 Z" />

          <circle
            cx="207"
            cy="230"
            r="30"
          />

          <circle
            cx="246"
            cy="198"
            r="35"
          />

          <circle
            cx="300"
            cy="184"
            r="38"
          />

          <circle
            cx="354"
            cy="198"
            r="35"
          />

          <circle
            cx="393"
            cy="230"
            r="30"
          />

          <circle
            cx="193"
            cy="263"
            r="24"
          />

          <circle
            cx="407"
            cy="263"
            r="24"
          />

          <path d="M204 242 Q222 210 242 224 M258 214 Q278 184 300 216 M320 216 Q342 184 362 214 M376 224 Q396 210 412 242" fill="none" stroke="#0d0f12" stroke-width="1.5" opacity=".55" />
        </g>

      `;

    }


    if (
      phantomState.hair ===
      "Irokese"
    ) {

      return `
        <path
          d="
            M248 282
            L258 165
            Q300 98 342 165
            L352 282
            Z
          "
            fill="url(#hairGradient)"
          stroke="#131315"
            stroke-width="3"
        />
      `;

    }

    if (phantomState.hair === "Lang") {
      return `
        <path d="M174 286 Q178 165 300 143 Q422 165 426 286 Q390 220 300 220 Q210 220 174 286 Z" fill="url(#hairGradient)" stroke="#131315" stroke-width="2.2" />
        <path d="M174 270 Q164 360 190 520 Q208 548 232 520 L246 238 Q212 244 174 270 Z M426 270 Q436 360 410 520 Q392 548 368 520 L354 238 Q388 244 426 270 Z" fill="url(#hairGradient)" stroke="#131315" stroke-width="2.2" />
        <path d="M190 300 Q188 410 210 500 M410 300 Q412 410 390 500" fill="none" stroke="#0d0f12" stroke-width="1.5" opacity=".55" />
      `;
    }

    if (phantomState.hair === "Mittellang") {
      return `
        <path d="M174 286 Q178 165 300 143 Q422 165 426 286 Q390 220 300 220 Q210 220 174 286 Z" fill="url(#hairGradient)" stroke="#131315" stroke-width="2.2" />
        <path d="M174 270 Q170 340 190 444 Q204 464 224 442 L238 238 Q208 244 174 270 Z M426 270 Q430 340 410 444 Q396 464 376 442 L362 238 Q392 244 426 270 Z" fill="url(#hairGradient)" stroke="#131315" stroke-width="2.2" />
      `;
    }

    if (phantomState.hair === "Seitenscheitel") {
      return `
        <path d="M174 286 Q178 165 300 143 Q422 165 426 286 Q374 225 278 224 Q224 225 174 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" />
        <path d="M338 158 Q316 190 302 224" fill="none" stroke="#0f1114" stroke-width="2" />
      `;
    }

    if (phantomState.hair === "Wellig") {
      return `
        <path d="M174 292 Q174 170 300 143 Q426 170 426 292 Q392 232 350 225 Q300 207 250 225 Q208 232 174 292 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" />
        <path d="M208 246 Q225 218 242 246 M258 230 Q275 202 292 230 M308 230 Q325 202 342 230 M358 246 Q375 218 392 246" fill="none" stroke="#0f1114" stroke-width="2" />
      `;
    }

    if (phantomState.hair === "Undercut") {
      return `
        <path d="M190 274 Q205 156 300 143 Q395 156 410 274 Q365 224 300 224 Q235 224 190 274 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" />
        <path d="M196 292 Q214 266 232 248 M404 292 Q386 266 368 248" fill="none" stroke="#55575a" stroke-width="2" opacity=".65" />
      `;
    }

    if (phantomState.hair === "Buzz Cut") {
      return `
        <path d="M180 286 Q188 174 300 146 Q412 174 420 286 Q378 226 300 220 Q222 226 180 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" />
        <path d="M204 238 Q236 190 272 180 M286 174 Q300 166 314 174 M328 180 Q364 190 396 238" fill="none" stroke="#858585" stroke-width="1.5" opacity=".7" />
      `;
    }

    if (phantomState.hair === "Pompadour") {
      return `
        <path d="M174 286 Q178 142 300 116 Q422 142 426 286 Q382 218 300 220 Q218 218 174 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" />
        <path d="M218 178 Q260 132 316 136" fill="none" stroke="#777" stroke-width="2" opacity=".55" />
      `;
    }

    if (phantomState.hair === "Zopf") {
      return `
        <path d="M174 286 Q178 165 300 143 Q422 165 426 286 Q390 220 300 220 Q210 220 174 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" />
        <path d="M412 286 Q455 330 425 380 Q465 425 425 470" fill="none" stroke="${color}" stroke-width="28" opacity=".9" />
        <path d="M412 286 Q455 330 425 380 Q465 425 425 470" fill="none" stroke="#111" stroke-width="2" opacity=".55" />
      `;
    }

    if (phantomState.hair === "Afro") {
      return `<path d="M160 300 Q160 126 300 112 Q440 126 440 300 Q410 244 300 232 Q190 244 160 300 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" /><path d="M190 220 Q220 170 250 210 M270 180 Q300 140 330 180 M350 210 Q380 170 410 220" fill="none" stroke="#111" stroke-width="2" opacity=".55" />`;
    }

    if (phantomState.hair === "Dreadlocks") {
      return `<path d="M174 286 Q178 165 300 143 Q422 165 426 286 Q390 220 300 220 Q210 220 174 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" /><g fill="${color}" stroke="#111" stroke-width="1.5" stroke-linejoin="round"><path d="M190 250 Q180 340 181 420 Q188 452 205 430 L218 242 Q204 244 190 250 Z" /><path d="M224 230 Q218 350 220 456 Q230 490 246 462 L252 230 Q238 228 224 230 Z" /><path d="M348 230 Q352 350 350 462 Q366 490 376 456 L376 230 Q362 228 348 230 Z" /><path d="M382 242 Q394 340 395 430 Q412 452 419 420 Q420 340 410 250 Q396 244 382 242 Z" /></g>`;
    }

    if (phantomState.hair === "Pferdeschwanz") {
      return `<path d="M174 286 Q178 165 300 143 Q422 165 426 286 Q390 220 300 220 Q210 220 174 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" /><path d="M410 230 Q480 260 458 360 Q446 420 405 454" fill="none" stroke="${color}" stroke-width="25" /><path d="M410 230 Q480 260 458 360 Q446 420 405 454" fill="none" stroke="#111" stroke-width="1.5" opacity=".6" />`;
    }

    if (phantomState.hair === "Slick Back") {
      return `<path d="M174 286 Q180 160 300 143 Q420 160 426 286 Q374 214 300 214 Q226 214 174 286 Z" fill="url(#hairGradient)" stroke="#151316" stroke-width="2.5" /><path d="M210 220 Q250 170 300 160 M300 160 Q350 170 390 220" fill="none" stroke="#8a8a8a" stroke-width="1.5" opacity=".6" />`;
    }


    return `
      <path
        d="
          M174 286
          Q177 165 300 143
          Q423 165 426 286
          Q392 215 300 219
          Q208 215 174 286
          Z
        "
        fill="url(#hairGradient)"
        stroke="#151316"
        stroke-width="2.5"
      />
    `;

  }


  function eyesSVG() {

    const eyeShapes = {
      Rund: [31, 16],
      Schmal: [25, 9],
      "Mandelförmig": [31, 11],
      "Tief liegend": [29, 12]
    };
    const [rx, ry] = eyeShapes[phantomState.eyes] || eyeShapes.Rund;
    const eyeScale = 0.82 + phantomFineState.eyeSize / 250;
    const irisColors = {
      Braun: "#583727",
      Grün: "#3c7657",
      Blau: "#3d6f9d",
      Grau: "#68727b"
    };
    const iris = irisColors[phantomState.eyeColor] || irisColors.Braun;
    const eyeOpacity = (0.7 + phantomFineState.eyeContrast / 333).toFixed(3);
    const eyeOffset = (phantomFineState.eyeSpacing - 50) * 0.55;
    const eyeY = 344 + (phantomFineState.eyeHeight - 50) * 0.7;
    const eyeTiltOffset = (phantomFineState.eyeTilt - 50) * 0.28;
    const asymmetry = (phantomFineState.faceSymmetry - 50) * 0.12;
    const browOffset = (phantomFineState.browHeight - 50) * 0.5;
    const leftEye = 246 - eyeOffset;
    const rightEye = 354 + eyeOffset;
    const eyeDetail = phantomState.eyeDetail === "Augenringe"
      ? `<path d="M216 359 Q246 382 276 359 M324 359 Q354 382 384 359" fill="none" stroke="#694943" stroke-width="2.5" opacity=".2" />`
      : phantomState.eyeDetail === "Helle Reflexe"
        ? `<circle cx="${leftEye - 8}" cy="${eyeY - 5}" r="5" fill="#ffffff" opacity=".85" /><circle cx="${rightEye - 8}" cy="${eyeY - 5}" r="5" fill="#ffffff" opacity=".85" />`
        : phantomState.eyeDetail === "Lange Wimpern"
          ? `<path d="M216 335 L207 327 M224 330 L218 319 M376 330 L382 319 M384 335 L393 327" stroke="#2b201e" stroke-width="2.5" stroke-linecap="round" />`
          : "";


    return `

      <ellipse
        cx="${leftEye}"
        cy="${eyeY - eyeTiltOffset}"
        rx="${(rx * eyeScale).toFixed(1)}"
        ry="${(ry * eyeScale).toFixed(1)}"
        fill="url(#eyeWhite)"
        stroke="#664639"
        stroke-width="2"
      />

      <ellipse
        cx="${rightEye}"
        cy="${eyeY + eyeTiltOffset + asymmetry}"
        rx="${(rx * eyeScale).toFixed(1)}"
        ry="${(ry * eyeScale).toFixed(1)}"
        fill="url(#eyeWhite)"
        stroke="#664639"
        stroke-width="2"
      />

      <circle
        cx="${leftEye}"
        cy="${eyeY - eyeTiltOffset}"
        r="9"
        fill="${iris}"
        opacity="${eyeOpacity}"
      />

      <circle
        cx="${rightEye}"
        cy="${eyeY + eyeTiltOffset + asymmetry}"
        r="9"
        fill="${iris}"
        opacity="${eyeOpacity}"
      />

      <circle
        cx="${leftEye + 3}"
        cy="${eyeY + eyeTiltOffset + asymmetry - 3}"
        r="3"
        fill="white"
      />

      <circle
        cx="${rightEye + 3}"
        cy="${eyeY + eyeTiltOffset - 3}"
        r="3"
        fill="white"
      />

      <path d="M${leftEye - 30} ${eyeY - 10 - browOffset} Q${leftEye} ${eyeY - 31 - browOffset} ${leftEye + 30} ${eyeY - 10 - browOffset}" fill="none" stroke="#563e39" stroke-width="2.5" opacity=".72" />
      <path d="M${rightEye - 30} ${eyeY - 10 - browOffset} Q${rightEye} ${eyeY - 31 - browOffset} ${rightEye + 30} ${eyeY - 10 - browOffset}" fill="none" stroke="#563e39" stroke-width="2.5" opacity=".72" />
      <path d="M${leftEye - 30} ${eyeY + 10} Q${leftEye} ${eyeY + 31} ${leftEye + 30} ${eyeY + 10}" fill="none" stroke="#9a7462" stroke-width="1.7" opacity=".55" />
      <path d="M${rightEye - 30} ${eyeY + 10} Q${rightEye} ${eyeY + 31} ${rightEye + 30} ${eyeY + 10}" fill="none" stroke="#9a7462" stroke-width="1.7" opacity=".55" />
      <circle cx="${leftEye}" cy="${eyeY - eyeTiltOffset}" r="4" fill="#111820" />
      <circle cx="${rightEye}" cy="${eyeY + eyeTiltOffset + asymmetry}" r="4" fill="#111820" />
      ${eyeDetail}

    `;

  }


  function skinMarksSVG() {
    if (phantomState.skinMarks === "Sommersprossen") {
      const dots = [[250, 402], [264, 410], [278, 405], [236, 414], [350, 405], [366, 410], [380, 402], [394, 414], [256, 424], [374, 424]];
      return `<g fill="#995e48" opacity=".42">${dots.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2" />`).join("")}</g>`;
    }
    if (phantomState.skinMarks === "Muttermal") {
      return `<circle cx="384" cy="435" r="5" fill="#6e4037" opacity=".7" /><circle cx="386" cy="433" r="1.5" fill="#d2977c" opacity=".55" />`;
    }
    if (phantomState.skinMarks === "Leberflecken") {
      return `<g fill="#805044" opacity=".3"><circle cx="238" cy="390" r="3" /><circle cx="250" cy="398" r="2" /><circle cx="369" cy="390" r="2.5" /><circle cx="382" cy="398" r="3" /></g>`;
    }
    return "";
  }


  function browsSVG() {
    const browOffset = (phantomFineState.browHeight - 50) * 0.5;

    const values = {

      Gerade: [
        "M210 305 L277 305",
        "M323 305 L390 305",
        4
      ],

      Geschwungen: [
        "M210 308 Q244 282 277 305",
        "M323 305 Q356 282 390 308",
        4
      ],
      Dicht: [
        "M210 305 Q244 280 278 306",
        "M322 306 Q356 280 390 305",
        6
      ],
      Dünn: [
        "M210 305 Q244 292 277 305",
        "M323 305 Q356 292 390 305",
        2.5
      ]

    };


    const config =
      values[
        phantomState.brows
      ];


    if (!config) return "";


    return `

      <path
        d="${config[0]}"
        transform="translate(0 ${browOffset})"
        fill="none"
        stroke="#28201f"
        stroke-width="${config[2]}"
        stroke-linecap="round"
      />

      <path
        d="${config[1]}"
        transform="translate(0 ${browOffset})"
        fill="none"
        stroke="#28201f"
        stroke-width="${config[2]}"
        stroke-linecap="round"
      />

    `;

  }


  function noseSVG() {

    const noseDefinition = 1 + phantomFineState.noseDefinition / 100;

    switch (
      phantomState.nose
    ) {

      case "Gebogen":

        return `
          <path
            d="
              M300 352
              Q324 386 316 430
              Q307 450 289 444
            "
            fill="none"
            stroke="#895843"
            stroke-width="${(1.6 * noseDefinition).toFixed(1)}"
            stroke-linecap="round"
          />
        `;


      case "Breit":

        return `
          <path
            d="
              M300 354
              Q279 395 274 430
              Q300 450 326 430
              Q321 395 300 354
            "
            fill="none"
            stroke="#895843"
            stroke-width="${(1.6 * noseDefinition).toFixed(1)}"
          />

          <ellipse
            cx="279"
            cy="432"
            rx="7"
            ry="5"
            fill="#7e503d"
          />

          <ellipse
            cx="321"
            cy="432"
            rx="7"
            ry="5"
            fill="#7e503d"
          />
        `;


      case "Klein":

        return `
          <path
            d="
              M300 376
              L293 424
              Q300 432 308 424
            "
            fill="none"
            stroke="#895843"
            stroke-width="${(1.5 * noseDefinition).toFixed(1)}"
          />
        `;


      default:

        return `
          <path
            d="
              M300 354
              L300 428
            "
            fill="none"
            stroke="#895843"
            stroke-width="${(1.6 * noseDefinition).toFixed(1)}"
            stroke-linecap="round"
          />

          <path
            d="
              M288 432
              Q300 440 312 432
            "
            fill="none"
            stroke="#895843"
            stroke-width="2.5"
          />

          <ellipse cx="289" cy="433" rx="4" ry="2.5" fill="#70463d" opacity=".72" />
          <ellipse cx="311" cy="433" rx="4" ry="2.5" fill="#70463d" opacity=".72" />
        `;

    }

  }


  function mouthSVG() {

    if (phantomState.expression === "Überrascht") {
      return `<ellipse cx="300" cy="493" rx="25" ry="31" fill="#5a2930" stroke="#3f2025" stroke-width="2.2" />`;
    }

    if (phantomState.expression === "Freundlich") {
      return `<path d="M253 487 Q300 530 347 487 Q326 520 300 522 Q274 520 253 487 Z" fill="#813e43" stroke="#55282e" stroke-width="2.2" /><path d="M267 495 Q300 508 333 495" fill="none" stroke="#f3ded6" stroke-width="2.5" />`;
    }

    switch (
      phantomState.mouth
    ) {

      case "Lächeln":

        return `
          <path
            d="
              M252 486
              Q300 526 348 486
            "
            fill="none"
            stroke="#682f33"
            stroke-width="2.8"
            stroke-linecap="round"
          />

          <path
            d="
              M266 494
              Q300 507 334 494
            "
            fill="none"
            stroke="#f7ddd8"
            stroke-width="2.5"
          />
        `;


      case "Bart":

        return `
          <path
            d="
              M255 485
              Q277 472 300 484
              Q323 472 345 485
              Q326 506 300 496
              Q274 506 255 485
              Z
            "
            fill="#2e2624"
          />
        `;


      case "Voll":

        return `
          <path
            d="
              M252 483
              Q300 462 348 483
              Q300 522 252 483
              Z
            "
            fill="#8d4146"
            stroke="#5a292c"
            stroke-width="2.5"
          />
        `;

      case "Offen":
        return `
          <path d="M259 484 Q300 465 341 484 Q330 530 300 532 Q270 530 259 484 Z" fill="#632f36" stroke="#54252d" stroke-width="2.2" />
          <path d="M273 488 Q300 480 327 488" fill="none" stroke="#f2d8cf" stroke-width="2.5" />
        `;


      default:

        return `
          <path
            d="
              M260 489
              Q300 496 340 489
            "
            fill="none"
            stroke="#682f33"
            stroke-width="2.8"
            stroke-linecap="round"
          />
        `;

    }

  }


  function beardSVG() {

    const beardOpacity = (0.35 + phantomFineState.beardDensity / 150).toFixed(2);

    switch (
      phantomState.beard
    ) {

      case "Dreitagebart":

        return `
          <path
            d="
              M220 456
              Q300 540 380 456
              Q360 525 300 548
              Q240 525 220 456
              Z
            "
            fill="#332a28"
            opacity="${beardOpacity}"
          />
        `;


      case "Vollbart":

        return `
          <path
            d="
              M215 435
              Q300 552 385 435
              L370 522
              Q300 588 230 522
              Z
            "
            fill="#2a2423"
            opacity="${beardOpacity}"
          />
        `;


      case "Schnurrbart":

        return `
          <path
            d="
              M258 466
              Q281 451 300 468
              Q319 451 342 466
              Q326 490 300 482
              Q274 490 258 466
              Z
            "
            fill="#2a2322"
          />
        `;


      case "Kinnbart":

        return `
          <path d="M270 492 Q300 505 330 492 L322 548 Q300 566 278 548 Z" fill="#2a2322" opacity="${beardOpacity}" />
        `;


      case "Ziegenbart":

        return `
          <path d="M264 466 Q281 451 300 468 Q319 451 336 466 Q326 488 300 482 Q274 488 264 466 Z" fill="#2a2322" opacity="${beardOpacity}" />
          <path d="M280 500 Q300 510 320 500 L316 550 Q300 566 284 550 Z" fill="#2a2322" opacity="${beardOpacity}" />
        `;


      case "Stoppelbart":

        return `
          <path d="M224 454 Q300 535 376 454 Q358 526 300 548 Q242 526 224 454 Z" fill="#332a28" opacity="${Math.min(0.5, Number(beardOpacity) * 0.45).toFixed(2)}" />
        `;

      case "Backenbart":
        return `
          <path d="M220 430 Q242 472 264 486 L254 526 Q226 500 214 452 Z M380 430 Q358 472 336 486 L346 526 Q374 500 386 452 Z" fill="#2a2322" opacity="${beardOpacity}" />
        `;

      case "Ankerbart":
        return `
          <path d="M258 466 Q281 451 300 468 Q319 451 342 466 Q326 490 300 482 Q274 490 258 466 Z" fill="#2a2322" opacity="${beardOpacity}" />
          <path d="M278 500 Q300 510 322 500 L316 554 Q300 568 284 554 Z" fill="#2a2322" opacity="${beardOpacity}" />
        `;

      case "Vollbart kurz":
        return `
          <path d="M222 438 Q300 536 378 438 L362 516 Q300 554 238 516 Z" fill="#2a2423" opacity="${Math.min(0.9, Number(beardOpacity)).toFixed(2)}" />
        `;


      default:
        return "";

    }

  }


  function ageSVG() {

    if (
      phantomState.age ===
      "Jung"
    ) {
      return "";
    }


    if (
      phantomState.age ===
      "Erwachsen"
    ) {

      return `
        <path
          d="M236 416 Q253 406 270 416"
          fill="none"
          stroke="#8c5f4f"
          stroke-width="3"
          opacity=".25"
        />

        <path
          d="M330 416 Q347 406 364 416"
          fill="none"
          stroke="#8c5f4f"
          stroke-width="3"
          opacity=".25"
        />
      `;

    }


    if (
      phantomState.age ===
      "Reif"
    ) {

      return `
        <path
          d="M229 414 Q250 397 271 414"
          fill="none"
          stroke="#805545"
            stroke-width="2.5"
          opacity=".42"
        />

        <path
          d="M329 414 Q350 397 371 414"
          fill="none"
          stroke="#805545"
          stroke-width="4"
          opacity=".42"
        />

        <path
          d="M258 518 Q300 531 342 518"
          fill="none"
          stroke="#805545"
          stroke-width="3"
          opacity=".34"
        />
      `;

    }


    return `
      <path
        d="M225 411 Q249 386 275 411"
        fill="none"
        stroke="#704a3d"
        stroke-width="5"
        opacity=".64"
      />

      <path
        d="M325 411 Q351 386 375 411"
        fill="none"
        stroke="#704a3d"
        stroke-width="5"
        opacity=".64"
      />

      <path
        d="M242 448 L258 426"
        fill="none"
        stroke="#704a3d"
        stroke-width="4"
        opacity=".58"
      />

      <path
        d="M358 448 L342 426"
        fill="none"
        stroke="#704a3d"
        stroke-width="4"
        opacity=".58"
      />

      <path
        d="M260 530 Q300 544 340 530"
        fill="none"
        stroke="#704a3d"
        stroke-width="4"
        opacity=".5"
      />
    `;

  }


  function scarsSVG() {

    switch (
      phantomState.scars
    ) {

      case "Stirn":

        return `
          <path
            d="M332 225 L355 268"
            stroke="#a04e58"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        `;


      case "Wange":

        return `
          <path
            d="M392 392 L370 423"
            stroke="#a04e58"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        `;


      case "Kinn":

        return `
          <path
            d="M298 523 L282 511"
            stroke="#a04e58"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        `;


      default:
        return "";

    }

  }


  function tattooSVG() {

    switch (
      phantomState.tattoos
    ) {

      case "Stern":

        return `
          <path
            d="
              M395 381
              L402 399
              L421 399
              L406 410
              L411 430
              L395 420
              L379 430
              L384 410
              L369 399
              L388 399
              Z
            "
            fill="#30343b"
          />
        `;


      case "Wange":

        return `
          <path
            d="
              M388 390
              Q410 376 422 396
              Q411 418 389 406
              Z
            "
            fill="#333940"
            opacity=".88"
          />
        `;


      case "Hals":

        return `
          <path
            d="
              M278 548
              Q300 533 322 548
              L322 590
              Q300 604 278 590
              Z
            "
            fill="#333940"
            opacity=".9"
          />
        `;

      case "Tribal":
        return `<path d="M384 390 Q420 370 430 402 Q410 420 392 438 L378 420 Z" fill="none" stroke="#30343b" stroke-width="5" opacity=".85" />`;

      case "Schriftzug":
        return `<text x="300" y="579" text-anchor="middle" fill="#30343b" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2" opacity=".85">SPUR</text>`;

      case "Kleines Symbol":
        return `<circle cx="398" cy="438" r="12" fill="none" stroke="#30343b" stroke-width="3" /><path d="M398 428 V448 M388 438 H408" stroke="#30343b" stroke-width="2" />`;

      case "Nackentattoo":
        return `<path d="M270 548 Q300 530 330 548 L320 592 Q300 606 280 592 Z" fill="none" stroke="#30343b" stroke-width="3" opacity=".9" />`;


      default:
        return "";

    }

  }


  function accessoriesSVG() {

    switch (
      phantomState.accessories
    ) {

      case "Mütze":

        return `
          <path
            d="
              M170 245
              Q188 125 300 107
              Q412 125 430 245
              Z
            "
            fill="#232a31"
            stroke="#111418"
            stroke-width="2.5"
          />

          <path
            d="
              M155 240
              Q300 210 445 240
            "
            fill="none"
            stroke="#111418"
            stroke-width="4"
            stroke-linecap="round"
          />
        `;


      case "Ohrring":

        return `
          <circle
            cx="451"
            cy="389"
            r="10"
            fill="none"
            stroke="#d5b76b"
            stroke-width="2.5"
          />
        `;


      case "Sonnenbrille":

        return `
          <g
            fill="#171d23"
            stroke="#0d1014"
            stroke-width="2.5"
          >

            <rect
              x="197"
              y="320"
              width="94"
              height="54"
              rx="18"
            />

            <rect
              x="309"
              y="320"
              width="94"
              height="54"
              rx="18"
            />

            <path
              d="M291 332 Q300 324 309 332"
              fill="none"
            />

            <path
              d="M195 334 L168 325"
              fill="none"
            />

            <path
              d="M405 334 L432 325"
              fill="none"
            />

          </g>
        `;

      case "Brille rund":
        return `<g fill="none" stroke="#25282b" stroke-width="3"><circle cx="246" cy="344" r="38" /><circle cx="354" cy="344" r="38" /><path d="M284 340 Q300 330 316 340 M208 340 L174 330 M392 340 L426 330" /></g>`;

      case "Brille eckig":
        return `<g fill="none" stroke="#25282b" stroke-width="3"><rect x="202" y="312" width="88" height="58" rx="18" /><rect x="310" y="312" width="88" height="58" rx="18" /><path d="M290 330 Q300 324 310 330 M202 330 Q184 326 170 322 M398 330 Q416 326 430 322" /></g>`;

      case "Brille randlos":
        return `<g fill="none" stroke="#8b9297" stroke-width="1.5"><ellipse cx="246" cy="344" rx="39" ry="28" /><ellipse cx="354" cy="344" rx="39" ry="28" /><path d="M285 340 Q300 333 315 340 M207 340 L176 329 M393 340 L424 329" /></g>`;

      case "Sonnenbrille Aviator":
        return `<g fill="#454d55" fill-opacity=".82" stroke="#15181b" stroke-width="2.5"><path d="M201 322 Q246 308 291 325 L282 365 Q246 382 211 360 Z" /><path d="M309 325 Q354 308 399 322 L389 360 Q354 382 318 365 Z" /><path d="M291 331 Q300 324 309 331 M201 326 L170 318 M399 326 L430 318" /></g>`;

      case "Sonnenbrille rechteckig":
        return `<g fill="#20262b" fill-opacity=".88" stroke="#0d1014" stroke-width="2.5"><rect x="198" y="318" width="94" height="50" rx="14" /><rect x="308" y="318" width="94" height="50" rx="14" /><path d="M292 331 Q300 326 308 331 M198 332 Q182 328 168 324 M402 332 Q418 328 432 324" /></g>`;


      default:
        return "";

    }

  }


  function createPhantomSVG() {

    const skin =
      getSkinColor();


    const name =
      phantomName?.value.trim() ||
      "Unbekannte Person";
    const caseNumber = phantomCaseNumber?.value.trim() || "Nicht vergeben";
    const createdDate = phantomDate?.value
      ? new Date(`${phantomDate.value}T12:00:00`).toLocaleDateString("de-DE")
      : new Date().toLocaleDateString("de-DE");
    const textureStrength = (0.008 + (phantomFineState.skinDetail + phantomFineState.skinTexture + phantomFineState.featureSoftness) / 1800).toFixed(3);
    const backgroundColors = {
      Neutral: "#e3e3df",
      Blau: "#d8e2e8",
      Grau: "#d2d2d0"
    };
    const backgroundColor = backgroundColors[phantomState.backgroundTone] || backgroundColors.Neutral;
    const hairColor = {
      Schwarz: "#171719",
      Braun: "#4a2d22",
      Blond: "#b9854e",
      Rot: "#7d3828",
      Grau: "#777477"
    }[phantomState.hairColor] || "#171719";
    const renderFilter = phantomState.renderMode === "Schwarzweiß"
      ? "grayscale(1)"
      : phantomState.renderMode === "Kontrast"
        ? "contrast(1.12) saturate(1.08)"
        : "none";
    const cheekOpacity = (phantomFineState.cheekbones / 700).toFixed(3);
    const cheekScale = (0.84 + phantomFineState.cheekFullness / 300).toFixed(3);
    const chinScale = (0.94 + phantomFineState.chinLength / 625).toFixed(3);
    const noseScale = (0.82 + phantomFineState.noseWidth / 300 + phantomFineState.nostrilWidth / 900).toFixed(3);
    const noseLengthScale = (0.9 + phantomFineState.noseLength / 500).toFixed(3);
    const hairScale = (0.92 + phantomFineState.hairVolume / 625).toFixed(3);
    const lightOpacity = (0.18 + phantomFineState.faceLight / 280).toFixed(3);
    const neckScale = (0.88 + phantomFineState.neckWidth / 300).toFixed(3);
    const gridLines = phantomFineState.phantomGrid
      ? `<path d="M100 92 V640 M200 92 V640 M300 92 V640 M400 92 V640 M500 92 V640 M18 200 H582 M18 300 H582 M18 400 H582 M18 500 H582 M18 600 H582" stroke="#7d858b" stroke-width=".7" opacity=".22" />`
      : "";
    const jawScale = (0.92 + phantomFineState.jawWidth / 625).toFixed(3);
    const foreheadOffset = ((phantomFineState.foreheadHeight - 50) * 0.45).toFixed(1);
    const mouthScale = (0.84 + phantomFineState.mouthWidth / 300 + phantomFineState.lipFullness / 750).toFixed(3);


    return `

        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 800"
        role="img"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="filter:${renderFilter}"
      >

        <defs>

          <linearGradient id="skinGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fff4e8" stop-opacity=".2" />
            <stop offset="48%" stop-color="${skin}" stop-opacity="1" />
            <stop offset="100%" stop-color="#9b6857" stop-opacity=".18" />
          </linearGradient>

          <linearGradient id="eyeWhite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#d9d5d1" />
          </linearGradient>

          <filter id="skinTexture" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="9" result="grain" />
            <feColorMatrix in="grain" type="saturate" values="0" result="monoGrain" />
            <feComponentTransfer in="monoGrain" result="softGrain">
              <feFuncA type="table" tableValues="0 ${textureStrength}" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="softGrain" mode="soft-light" />
          </filter>

          <radialGradient id="faceLight" cx="42%" cy="28%" r="75%">
            <stop offset="0%" stop-color="#fff8ee" stop-opacity=".38" />
            <stop offset="58%" stop-color="#fff8ee" stop-opacity="0" />
            <stop offset="100%" stop-color="#50352f" stop-opacity=".25" />
          </radialGradient>

          <linearGradient id="hairGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity=".14" />
            <stop offset="22%" stop-color="${hairColor}" />
            <stop offset="100%" stop-color="#08090b" stop-opacity=".88" />
          </linearGradient>

          <linearGradient id="lipGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c77a73" />
            <stop offset="100%" stop-color="#71383b" />
          </linearGradient>

          <pattern id="paperGrain" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="2" r=".55" fill="#6f7379" opacity=".12" />
            <circle cx="5" cy="6" r=".45" fill="#6f7379" opacity=".1" />
          </pattern>


          <clipPath id="faceClip">
            <g transform="translate(${(300 - 300 * Number(jawScale)).toFixed(1)} ${((1 - Number(chinScale)) * 300).toFixed(1)}) scale(${jawScale} ${chinScale})">
              ${faceShape()}
            </g>
          </clipPath>

        </defs>


        <rect width="600" height="800" fill="#f7f7f6" />
        <rect x="28" y="104" width="544" height="590" fill="${backgroundColor}" stroke="#a9abad" stroke-width="1" />
        <path d="M48 130 H552 M48 674 H552" stroke="#b5b7b8" stroke-width="1" stroke-dasharray="2 7" />
        ${gridLines}


        <text
          x="300"
          y="42"
          text-anchor="middle"
          fill="#31343a"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="22"
          font-weight="700"
        >
          ${escapeHTML(name)}
        </text>

        <path d="M42 78 H558" stroke="#28343b" stroke-width="2" />
        <text x="48" y="91" fill="#4f5b61" font-family="Arial, sans-serif" font-size="8" font-weight="700" letter-spacing="1">POLIZEILICHE ERMITTLUNGSUNTERLAGE · PERSONENBESCHREIBUNG</text>
        <text x="552" y="91" text-anchor="end" fill="#4f5b61" font-family="Arial, sans-serif" font-size="8">AKTENZEICHEN: ${escapeHTML(caseNumber)} · DATUM: ${createdDate}</text>


        <text
          x="300"
          y="65"
          text-anchor="middle"
          fill="#737780"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="10"
          letter-spacing="2"
        >
          SCHILISCHOTEN PHANTOMBILD
        </text>


        <!-- SCHULTERN UND KRAGEN -->

        <path d="M82 800 Q112 670 238 638 L362 638 Q488 670 518 800 Z" fill="#202735" />
        <path d="M212 644 Q300 704 388 644 L362 800 L238 800 Z" fill="#303949" />


        <!-- HALS -->

        <path
          d="
            M238 510
            L238 670
            Q300 710 362 670
            L362 510
            Z
          "
          fill="url(#skinGradient)"
          stroke="#875b48"
          stroke-width="2.5"
          filter="url(#skinTexture)"
          transform="translate(${(300 - 300 * Number(neckScale)).toFixed(1)} 0) scale(${neckScale} 1)"
        />


        <!-- OHREN -->

        <g>
          ${earsSVG(skin)}
        </g>


        <!-- GESICHT -->

        <g
          fill="url(#skinGradient)"
          stroke="#875b48"
          stroke-width="2.5"
          filter="url(#skinTexture)"
        >

          <g transform="translate(${(300 - 300 * Number(jawScale)).toFixed(1)} ${((1 - Number(chinScale)) * 300).toFixed(1)}) scale(${jawScale} ${chinScale})">
            ${faceShape()}
          </g>

        </g>

        <g clip-path="url(#faceClip)" pointer-events="none">
          <rect x="150" y="170" width="300" height="410" fill="url(#faceLight)" opacity="${lightOpacity}" />
          <ellipse cx="222" cy="412" rx="${(52 * Number(cheekScale)).toFixed(1)}" ry="76" fill="#8d5549" opacity="${cheekOpacity}" />
          <ellipse cx="378" cy="412" rx="${(52 * Number(cheekScale)).toFixed(1)}" ry="76" fill="#8d5549" opacity="${cheekOpacity}" />
          <ellipse cx="245" cy="367" rx="31" ry="12" fill="#5f3935" opacity=".08" />
          <ellipse cx="355" cy="367" rx="31" ry="12" fill="#5f3935" opacity=".08" />
          <path d="M300 350 Q286 398 291 438 Q300 450 309 438 Q314 398 300 350" fill="#70463d" opacity=".08" />
          <path d="M274 472 Q300 463 326 472" fill="none" stroke="#fff3e7" stroke-width="3" opacity=".16" />
        </g>

        ${skinMarksSVG()}


        <!-- DETAILS -->

        ${browsSVG()}
        ${eyesSVG()}
        <g transform="translate(${(300 - 300 * Number(noseScale)).toFixed(1)} ${((1 - Number(noseLengthScale)) * 350).toFixed(1)}) scale(${noseScale} ${noseLengthScale})">
          ${noseSVG()}
        </g>
        <g transform="translate(${(300 - 300 * Number(mouthScale)).toFixed(1)} 0) scale(${mouthScale} 1)">
          ${mouthSVG()}
        </g>
        ${ageSVG()}
        ${beardSVG()}
        ${scarsSVG()}
        ${tattooSVG()}

        <!-- HAARE -->

        <g transform="translate(0 ${foreheadOffset})">
          <g transform="translate(${(300 - 300 * Number(hairScale)).toFixed(1)} 0) scale(${hairScale} 1)">
            ${hairSVG()}
          </g>
        </g>

        <!-- ACCESSOIRE -->

        ${accessoriesSVG()}


        <!-- INFO -->

        <rect
          x="42"
          y="720"
          width="516"
          height="43"
          rx="12"
          fill="#f6f7f8"
          stroke="#c8ccd1"
        />


        <text
          x="300"
          y="748"
          text-anchor="middle"
          fill="#555a63"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="11"
        >
          ${escapeHTML(phantomState.face)}
          ·
          ${escapeHTML(phantomState.hair)}
          ·
          ${escapeHTML(phantomState.eyes)}
          ·
          ${escapeHTML(phantomState.age)}
        </text>

      </svg>

    `;

  }


  function updatePhantomInfo() {

    const title =
      document.getElementById(
        "phantomPreviewTitle"
      );

    const status =
      document.getElementById(
        "phantomFeatureStatus"
      );


    if (title) {

      title.textContent =
        phantomName?.value.trim() ||
        "Unbekannte Person";

    }


    if (status) {

      status.textContent =
        `${Object.keys(phantomOptions).length} / ${Object.keys(phantomOptions).length} Merkmale aktiv`;

    }


    const infoFace =
      document.getElementById(
        "infoFace"
      );

    const infoHair =
      document.getElementById(
        "infoHair"
      );

    const infoEyes =
      document.getElementById(
        "infoEyes"
      );

    const infoAge =
      document.getElementById(
        "infoAge"
      );


    if (infoFace) {
      infoFace.textContent =
        phantomState.face;
    }

    if (infoHair) {
      infoHair.textContent =
        phantomState.hair;
    }

    if (infoEyes) {
      infoEyes.textContent =
        phantomState.eyes;
    }

    if (infoAge) {
      infoAge.textContent =
        phantomState.age;
    }

  }


  function renderPhantom() {

    if (!phantomCanvas) return;

    phantomCanvas.innerHTML =
      createPhantomSVG();

    updatePhantomInfo();

  }


  // ========================================
  // PHANTOM-BUTTONS
  // ========================================

  if (phantomControls) {

    Object.entries(
      phantomOptions
    ).forEach(
      ([feature, options]) => {

        const group =
          phantomControls.querySelector(
            `[data-feature-group="${feature}"]`
          );


        const container =
          group?.querySelector(
            ".feature-options"
          );


        if (!container) return;


        if (container.children.length) {
          return;
        }


        options.forEach(
          (value, index) => {

            const button =
              document.createElement(
                "button"
              );


            button.type =
              "button";

            button.className =
              "feature-option";

            button.textContent =
              value;


            button.classList.toggle(
              "selected",
              index === 0
            );


            button.setAttribute(
              "aria-pressed",
              String(index === 0)
            );


            button.addEventListener(
              "click",
              () => {

                phantomState[feature] =
                  value;


                container
                  .querySelectorAll(
                    ".feature-option"
                  )
                  .forEach(
                    item => {

                      const selected =
                        item === button;


                      item.classList.toggle(
                        "selected",
                        selected
                      );


                      item.setAttribute(
                        "aria-pressed",
                        String(selected)
                      );

                    }
                  );


                renderPhantom();

              }
            );


            container.appendChild(
              button
            );

          }
        );

      }
    );

  }


  phantomName?.addEventListener(
    "input",
    renderPhantom
  );

  phantomCaseNumber?.addEventListener("input", renderPhantom);
  phantomDate?.addEventListener("input", renderPhantom);


  ["eyeSpacing", "eyeHeight", "noseDefinition", "skinDetail", "eyeSize", "cheekbones", "beardDensity", "faceSymmetry", "jawWidth", "foreheadHeight", "mouthWidth", "earHeight", "eyeTilt", "noseWidth", "lipFullness", "cheekFullness", "chinLength", "skinTexture", "browHeight", "noseLength", "nostrilWidth", "earSize", "hairVolume", "faceLight", "eyeContrast", "featureSoftness", "neckWidth"].forEach(
    id => {
      const input = document.getElementById(id);
      const output = document.getElementById(`${id}Value`);
      input?.addEventListener("input", () => {
        phantomFineState[id] = Number(input.value);
        if (output) output.textContent = input.value;
        renderPhantom();
      });
    }
  );

  document.getElementById("phantomGrid")?.addEventListener("change", event => {
    phantomFineState.phantomGrid = event.target.checked;
    renderPhantom();
  });

  const phantomPresets = {
    neutral: { face: "Oval", hair: "Kurz", beard: "Keine", age: "Erwachsen", expression: "Neutral", skin: "Mittel", eyeSpacing: 50, eyeSize: 50, faceSymmetry: 50, skinTexture: 24 },
    markant: { face: "Kantig", hair: "Seitenscheitel", beard: "Dreitagebart", age: "Erwachsen", expression: "Ernst", skin: "Mittel", jawWidth: 62, cheekbones: 70, browHeight: 44, hairVolume: 62 },
    reif: { face: "Länglich", hair: "Kurz", beard: "Vollbart kurz", age: "Reif", expression: "Ernst", skin: "Hell", eyeSize: 45, faceSymmetry: 47, skinTexture: 58, featureSoftness: 38 }
  };

  document.querySelectorAll(".phantom-preset").forEach(button => {
    button.addEventListener("click", () => {
      const preset = phantomPresets[button.dataset.preset];
      if (!preset) return;
      Object.entries(preset).forEach(([key, value]) => {
        if (Object.prototype.hasOwnProperty.call(phantomOptions, key)) {
          phantomState[key] = value;
          phantomControls?.querySelectorAll(`[data-feature-group="${key}"] .feature-option`).forEach(option => {
            const selected = option.textContent === value;
            option.classList.toggle("selected", selected);
            option.setAttribute("aria-pressed", String(selected));
          });
          return;
        }
        if (!Object.prototype.hasOwnProperty.call(phantomFineState, key)) return;
        phantomFineState[key] = value;
        const input = document.getElementById(key);
        const output = document.getElementById(`${key}Value`);
        if (input) input.value = String(value);
        if (output) output.textContent = String(value);
      });
      renderPhantom();
    });
  });


  document
    .getElementById("randomPhantomButton")
    ?.addEventListener(
      "click",
      () => {
        Object.entries(phantomOptions).forEach(
          ([feature, options]) => {
            const randomIndex = Math.floor(Math.random() * options.length);
            phantomState[feature] = options[randomIndex];

            phantomControls
              ?.querySelectorAll(`[data-feature-group="${feature}"] .feature-option`)
              .forEach((button, index) => {
                const selected = index === randomIndex;
                button.classList.toggle("selected", selected);
                button.setAttribute("aria-pressed", String(selected));
              });
          }
        );


        ["eyeSpacing", "eyeHeight", "noseDefinition", "skinDetail", "eyeSize", "cheekbones", "beardDensity", "faceSymmetry", "jawWidth", "foreheadHeight", "mouthWidth", "earHeight", "eyeTilt", "noseWidth", "lipFullness", "cheekFullness", "chinLength", "skinTexture", "browHeight", "noseLength", "nostrilWidth", "earSize", "hairVolume", "faceLight", "eyeContrast", "featureSoftness", "neckWidth"].forEach(id => {
          const input = document.getElementById(id);
          const output = document.getElementById(`${id}Value`);
          if (!input) return;
          const value = Math.floor(Number(input.min) + Math.random() * (Number(input.max) - Number(input.min) + 1));
          input.value = String(value);
          phantomFineState[id] = value;
          if (output) output.textContent = String(value);
        });
        renderPhantom();
      }
    );


  document
    .getElementById("savePhantomProfileButton")
    ?.addEventListener(
      "click",
      () => {
        localStorage.setItem(
          "schilischoten_phantom_profile",
          JSON.stringify({
            name: phantomName?.value || "",
            caseNumber: phantomCaseNumber?.value || "",
            date: phantomDate?.value || "",
            features: phantomState,
            fine: phantomFineState
          })
        );
      }
    );


  document
    .getElementById("loadPhantomProfileButton")
    ?.addEventListener(
      "click",
      () => {
        try {
          const saved = JSON.parse(
            localStorage.getItem("schilischoten_phantom_profile") || "null"
          );
          if (!saved) return;

          Object.entries(phantomOptions).forEach(([feature, options]) => {
            if (!options.includes(saved.features?.[feature])) return;
            phantomState[feature] = saved.features[feature];
            phantomControls
              ?.querySelectorAll(`[data-feature-group="${feature}"] .feature-option`)
              .forEach(button => {
                const selected = button.textContent === phantomState[feature];
                button.classList.toggle("selected", selected);
                button.setAttribute("aria-pressed", String(selected));
              });
          });

          Object.keys(phantomFineState).forEach(id => {
            if (id === "phantomGrid") {
              phantomFineState[id] = saved.fine?.[id] === true;
              const grid = document.getElementById(id);
              if (grid) grid.checked = phantomFineState[id];
              return;
            }
            const savedValue = Number(saved.fine?.[id]);
            if (!Number.isFinite(savedValue)) return;
            const input = document.getElementById(id);
            const output = document.getElementById(`${id}Value`);
            const min = input ? Number(input.min) : savedValue;
            const max = input ? Number(input.max) : savedValue;
            const value = Math.min(max, Math.max(min, savedValue));
            phantomFineState[id] = value;
            if (input) input.value = String(value);
            if (output) output.textContent = String(value);
          });

          if (phantomName && typeof saved.name === "string") {
            phantomName.value = saved.name;
          }
          if (phantomCaseNumber && typeof saved.caseNumber === "string") {
            phantomCaseNumber.value = saved.caseNumber;
          }
          if (phantomDate && typeof saved.date === "string") {
            phantomDate.value = saved.date;
          }
          renderPhantom();
        } catch {
          return;
        }
      }
    );


  // ========================================
  // RESET PHANTOM
  // ========================================

  document
    .getElementById(
      "resetPhantomButton"
    )
    ?.addEventListener(
      "click",
      () => {

        Object.entries(
          phantomOptions
        ).forEach(
          ([feature, options]) => {

            phantomState[feature] =
              options[0];


            const group =
              phantomControls?.querySelector(
                `[data-feature-group="${feature}"]`
              );


            group
              ?.querySelectorAll(
                ".feature-option"
              )
              .forEach(
                (button, index) => {

                  button.classList.toggle(
                    "selected",
                    index === 0
                  );


                  button.setAttribute(
                    "aria-pressed",
                    String(index === 0)
                  );

                }
              );

          }
        );


        if (phantomName) {
          phantomName.value = "";
        }
        if (phantomCaseNumber) {
          phantomCaseNumber.value = "";
        }
        if (phantomDate) {
          phantomDate.value = "";
        }

        const defaultFineValues = {
          eyeSpacing: 50,
          eyeHeight: 50,
          noseDefinition: 50,
          skinDetail: 24,
          eyeSize: 50,
          cheekbones: 35,
          beardDensity: 80,
          faceSymmetry: 50,
          jawWidth: 50,
          foreheadHeight: 50,
          mouthWidth: 50,
          earHeight: 50,
          eyeTilt: 50,
          noseWidth: 50,
          lipFullness: 50,
          cheekFullness: 50,
          chinLength: 50,
          skinTexture: 24,
          browHeight: 50,
          noseLength: 50,
          nostrilWidth: 50,
          earSize: 50,
          hairVolume: 50,
          faceLight: 50,
          eyeContrast: 50,
          featureSoftness: 24,
          neckWidth: 50
        };
        Object.entries(defaultFineValues).forEach(([id, value]) => {
          phantomFineState[id] = value;
          const input = document.getElementById(id);
          const output = document.getElementById(`${id}Value`);
          if (input) input.value = String(value);
          if (output) output.textContent = String(value);
        });
        phantomFineState.phantomGrid = false;
        const phantomGrid = document.getElementById("phantomGrid");
        if (phantomGrid) phantomGrid.checked = false;


        renderPhantom();

      }
    );


  // ========================================
  // PHANTOM SPEICHERN
  // ========================================

  document
    .getElementById(
      "downloadPhantomButton"
    )
    ?.addEventListener(
      "click",
      () => {

        const svg =
          createPhantomSVG();


        const blob =
          new Blob(
            [svg],
            {
              type:
                "image/svg+xml;charset=utf-8"
            }
          );


        const url =
          URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );


        const name =
          (
            phantomName?.value.trim() ||
            "phantombild"
          )
            .replace(
              /[^a-z0-9äöüß_-]+/gi,
              "-"
            )
            .toLowerCase();


        link.href = url;

        link.download =
          `${name}.svg`;


        document.body.appendChild(
          link
        );

        link.click();

        link.remove();


        setTimeout(
          () => {
            URL.revokeObjectURL(url);
          },
          1000
        );

      }
    );


  document
    .getElementById("downloadPhantomPngButton")
    ?.addEventListener(
      "click",
      () => {
        const svgBlob = new Blob([createPhantomSVG()], { type: "image/svg+xml;charset=utf-8" });
        const imageUrl = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1200;
          canvas.height = 1520;
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

          const link = document.createElement("a");
          const fileName = (phantomName?.value.trim() || "phantombild")
            .replace(/[^a-z0-9äöüß_-]+/gi, "-")
            .toLowerCase();
          link.download = `${fileName}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();

          URL.revokeObjectURL(imageUrl);
        };

        image.src = imageUrl;
      }
    );


  document
    .getElementById("printPhantomButton")
    ?.addEventListener(
      "click",
      () => {
        const printWindow = window.open("", "_blank", "width=760,height=980");
        if (!printWindow) return;
        printWindow.document.write(`<!doctype html><html><head><title>Phantombild</title><style>body{margin:0;background:#fff;text-align:center}svg{width:min(100%,760px);height:auto}</style></head><body>${createPhantomSVG()}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    );


  // ========================================
  // BILDVERGLEICH
  // ========================================

  const fileA = document.getElementById("compareFileA");
  const fileB = document.getElementById("compareFileB");
  const previewA = document.getElementById("previewA");
  const previewB = document.getElementById("previewB");
  let selectedFileA = null;
  let selectedFileB = null;

  function showImagePreview(file, container) {
    if (!file || !container || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    container.innerHTML = `<img src="${url}" alt="Bildvorschau"><span>${escapeHTML(file.name)}</span>`;
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
      image.src = URL.createObjectURL(file);
    });
  }

  async function compareImages(imageFileA, imageFileB) {
    const [imageA, imageB] = await Promise.all([loadImage(imageFileA), loadImage(imageFileB)]);
    const size = 256;
    const tolerance = 8;
    const canvasA = document.createElement("canvas");
    const canvasB = document.createElement("canvas");
    canvasA.width = size;
    canvasA.height = size;
    canvasB.width = size;
    canvasB.height = size;
    const contextA = canvasA.getContext("2d", {willReadFrequently: true});
    const contextB = canvasB.getContext("2d", {willReadFrequently: true});
    contextA.drawImage(imageA, 0, 0, size, size);
    contextB.drawImage(imageB, 0, 0, size, size);
    const pixelsA = contextA.getImageData(0, 0, size, size).data;
    const pixelsB = contextB.getImageData(0, 0, size, size).data;
    let matchingPixels = 0;
    for (let index = 0; index < pixelsA.length; index += 4) {
      const samePixel =
        Math.abs(pixelsA[index] - pixelsB[index]) <= tolerance &&
        Math.abs(pixelsA[index + 1] - pixelsB[index + 1]) <= tolerance &&
        Math.abs(pixelsA[index + 2] - pixelsB[index + 2]) <= tolerance &&
        Math.abs(pixelsA[index + 3] - pixelsB[index + 3]) <= tolerance;

      if (samePixel) matchingPixels += 1;
    }
    const totalPixels = size * size;
    return {matchingPixels, totalPixels, percentage: (matchingPixels / totalPixels) * 100};
  }

  document.getElementById("uploadButtonA")?.addEventListener("click", () => fileA?.click());
  document.getElementById("uploadButtonB")?.addEventListener("click", () => fileB?.click());
  fileA?.addEventListener("change", event => {
    selectedFileA = event.target.files[0] || null;
    showImagePreview(selectedFileA, previewA);
  });
  fileB?.addEventListener("change", event => {
    selectedFileB = event.target.files[0] || null;
    showImagePreview(selectedFileB, previewB);
  });
  document.getElementById("startCompareButton")?.addEventListener("click", async () => {
    const resultBox = document.getElementById("compareResult");
    const title = document.getElementById("comparisonTitle");
    const percent = document.getElementById("comparisonPercent");
    const matchingPixels = document.getElementById("comparisonMatchingPixels");
    const description = document.getElementById("comparisonDescription");
    resultBox?.classList.remove("hidden");
    if (!selectedFileA || !selectedFileB) {
      title.textContent = "Bilder fehlen";
      percent.textContent = "-";
      matchingPixels.textContent = "";
      description.textContent = "Bitte zuerst Bild A und Bild B auswählen.";
      return;
    }
    try {
      const result = await compareImages(selectedFileA, selectedFileB);
      title.textContent = result.percentage >= 90 ? "Sehr ähnliche Bilder" : "Unterschiede erkannt";
      percent.textContent = `${result.percentage.toFixed(2)}%`;
      matchingPixels.textContent = `${result.matchingPixels.toLocaleString("de-DE")} von ${result.totalPixels.toLocaleString("de-DE")} Pixeln gleich`;
      description.textContent = "Quote aus der Anzahl gleicher Pixel bei einheitlicher Vergleichsgröße.";
    } catch {
      title.textContent = "Analyse fehlgeschlagen";
      percent.textContent = "-";
      matchingPixels.textContent = "";
      description.textContent = "Mindestens eines der Bilder konnte nicht gelesen werden.";
    }
  });


  // ========================================
  // CHAT
  // ========================================

  let activeAccount = "Leon";


  const chatInput =
    document.getElementById(
      "chatInput"
    );


  const chatMessages =
    document.getElementById(
      "chatMessages"
    );


  function renderChat() {

    if (!chatMessages) return;


    if (!messages.length) {

      chatMessages.innerHTML =
        `<div class="empty-state">
          Noch keine Nachrichten.
        </div>`;

      return;

    }


    chatMessages.innerHTML =
      messages
        .map(message => `

          <div class="chat-message">

            <strong>
              ${escapeHTML(
                message.sender ||
                "Unbekannt"
              )}
            </strong>

            <span>
              ${escapeHTML(
                message.text ||
                ""
              )}
            </span>

            ${message.image ? `
              <img class="chat-message-image" src="${escapeHTML(message.image)}" alt="Geteiltes Bild">
            ` : ""}

            <small>
              ${escapeHTML(
                message.time ||
                ""
              )}
            </small>

          </div>

        `)
        .join("");

  }


  function sendChatMessage() {

    if (!chatInput) return;


    const text =
      chatInput.value.trim();


    if (!text && !selectedChatImage) return;


    // Keine erfundenen Antworten!
    messages.push({

      id:
        Date.now(),

      sender:
        activeAccount,

      text,

      image:
        selectedChatImage,

      time:
        new Date().toLocaleTimeString(
          "de-DE",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )

    });


    saveData();

    renderChat();

    chatInput.value = "";

    selectedChatImage = null;
    if (chatImage) chatImage.value = "";
    chatImagePreview?.classList.add("hidden");
    if (chatImagePreview) chatImagePreview.innerHTML = "";

  }

  const chatImage = document.getElementById("chatImage");
  const chatImagePreview = document.getElementById("chatImagePreview");
  let selectedChatImage = null;

  document.getElementById("attachChatImage")?.addEventListener("click", () => chatImage?.click());
  chatImage?.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Das Bild darf höchstens 4 MB groß sein.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      selectedChatImage = reader.result;
      if (chatImagePreview) {
        chatImagePreview.innerHTML = `<img src="${escapeHTML(selectedChatImage)}" alt="Bildvorschau"><button type="button" id="removeChatImage">Bild entfernen</button>`;
        chatImagePreview.classList.remove("hidden");
        document.getElementById("removeChatImage")?.addEventListener("click", () => {
          selectedChatImage = null;
          chatImage.value = "";
          chatImagePreview.classList.add("hidden");
          chatImagePreview.innerHTML = "";
        });
      }
    };
    reader.readAsDataURL(file);
  });


  document
    .getElementById(
      "sendMessage"
    )
    ?.addEventListener(
      "click",
      sendChatMessage
    );


  chatInput?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        sendChatMessage();

      }

    }
  );


  // ========================================
  // ECHTE AGENTEN
  // ========================================

  const team = [

    {
      name: "Leon",
      role: "Chef-Ermittler"
    },

    {
      name: "Leo",
      role: "Agent"
    },

    {
      name: "Leonie",
      role: "Agent"
    },

    {
      name: "Melina",
      role: "Agent"
    },

    {
      name: "Nils",
      role: "Agent"
    }

  ];


  const accountToggle =
    document.getElementById(
      "accountToggle"
    );


  const accountMenu =
    document.getElementById(
      "accountMenu"
    );


  function updateAccountUI() {

    const account =
      team.find(
        item =>
          item.name ===
          activeAccount
      ) ||
      team[0];


    const fields = {

      accountToggleName:
        account.name,

      accountToggleRole:
        account.role,

      profileName:
        `Agent ${account.name}`,

      profileRole:
        account.role,

      profileAvatar:
        account.name.charAt(0),

      accountToggleAvatar:
        account.name.charAt(0)

    };


    Object.entries(fields)
      .forEach(
        ([id, value]) => {

          const element =
            document.getElementById(
              id
            );


          if (element) {
            element.textContent =
              value;
          }

        }
      );


    document
      .querySelectorAll(
        ".account-option"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.account ===
            account.name
          );

        }
      );

  }


  accountToggle?.addEventListener(
    "click",
    () => {

      accountMenu?.classList.toggle(
        "hidden"
      );

    }
  );


  document
    .querySelectorAll(
      ".account-option"
    )
    .forEach(
      option => {

        option.addEventListener(
          "click",
          () => {

            activeAccount =
              option.dataset.account ||
              "Leon";


            updateAccountUI();

            accountMenu?.classList.add(
              "hidden"
            );

            renderChat();

          }
        );

      }
    );


  // ========================================
  // SUCHE
  // ========================================

  const globalSearch =
    document.getElementById(
      "globalSearch"
    );


  const searchResults =
    document.getElementById(
      "searchResults"
    );


  const searchablePages = [

    ["Dashboard", "dashboard"],
    ["Fälle", "cases"],
    ["Vergleichen", "compare"],
    ["Phantombild", "phantom"],
    ["Beweise", "evidence"],
    ["Verdächtige", "suspects"],
    ["Agenten-Chat", "chat"],
    ["Team", "team"],
    ["Statistiken", "stats"],
    ["Einstellungen", "settings"],
    ["Lokaler Recherche-Browser", "research"]

  ];

  const localCrimeTerms = [
    "einbruch", "einbrüche", "diebstahl", "raub", "überfall", "wohnungseinbruch",
    "fahrzeugaufbruch", "sachbeschädigung", "betrug", "brand", "polizei", "fahndung"
  ];

  function openLocalWebSearch(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    const webQuery = `Rems-Murr-Kreis ${cleanQuery} Polizei`; 
    const url = `https://www.google.com/search?q=${encodeURIComponent(webQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const researchSources = [
    { type: "police", icon: "🛡️", title: "Polizeipräsidium Aalen", text: "Aktuelle Pressemitteilungen und Fahndungen für den Raum Rems-Murr.", url: "https://ppaalen.polizei-bw.de/" },
    { type: "police", icon: "🚔", title: "Polizei Baden-Württemberg", text: "Offizielle Informationen, Sicherheitshinweise und regionale Meldungen.", url: "https://www.polizei-bw.de/" },
    { type: "news", icon: "📰", title: "Lokale Nachrichten suchen", text: "Regionale Berichte passend zu deinem Suchbegriff im Rems-Murr-Kreis.", url: "https://www.google.com/search?tbm=nws&q=Rems-Murr-Kreis+Polizei" },
    { type: "alerts", icon: "⚠️", title: "Fahndung und Warnungen", text: "Offizielle Fahndungs- und Warnmeldungen der Region recherchieren.", url: "https://www.polizei-bw.de/fahndung/" }
  ];
  let researchHistory = JSON.parse(localStorage.getItem("schilischoten_research_history") || "[]");
  let researchPosition = researchHistory.length - 1;

  function renderResearchHistory() {
    const list = document.getElementById("researchHistoryList");
    if (!list) return;
    list.innerHTML = researchHistory.length
      ? researchHistory.slice().reverse().map(item => `<button type="button" data-research-history="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join("")
      : `<span class="research-empty">Noch keine Suchen</span>`;
  }

  function renderResearch(query = "", filter = "all") {
    const address = document.getElementById("researchAddress");
    const status = document.getElementById("researchStatus");
    const grid = document.getElementById("researchResultsGrid");
    if (!status || !grid) return;
    const cleanQuery = query.trim();
    if (address) address.value = cleanQuery;
    const sources = researchSources.filter(source => filter === "all" || source.type === filter);
    status.textContent = cleanQuery ? `${sources.length} Recherchequellen für „${cleanQuery}“ · Rems-Murr-Kreis` : "Bereit für eine lokale Recherche.";
    grid.innerHTML = cleanQuery
      ? sources.map(source => `<article class="research-card"><div class="research-card-icon">${source.icon}</div><div><span>${source.type === "police" ? "OFFIZIELL" : source.type === "alerts" ? "FAHNDUNG" : "REGIONAL"}</span><h3>${source.title}</h3><p>${source.text}</p><button type="button" class="research-open" data-research-url="${source.url}" data-research-query="${escapeHTML(cleanQuery)}">Im Browser öffnen ↗</button></div></article>`).join("")
      : `<div class="research-empty-state"><strong>Lokale Recherche starten</strong><p>Suche zum Beispiel nach „Einbruch“, „Diebstahl“ oder einem Ort im Rems-Murr-Kreis.</p></div>`;
    renderResearchHistory();
  }

  function runResearch(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    researchHistory = [cleanQuery, ...researchHistory.filter(item => item.toLowerCase() !== cleanQuery.toLowerCase())].slice(0, 8);
    researchPosition = researchHistory.length - 1;
    localStorage.setItem("schilischoten_research_history", JSON.stringify(researchHistory));
    showPage("research");
    renderResearch(cleanQuery);
  }

  document.getElementById("researchSearchButton")?.addEventListener("click", () => runResearch(document.getElementById("researchAddress")?.value || ""));
  document.getElementById("researchAddress")?.addEventListener("keydown", event => {
    if (event.key === "Enter") runResearch(event.target.value);
  });
  document.querySelectorAll(".research-filter").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".research-filter").forEach(item => item.classList.toggle("active", item === button));
    renderResearch(document.getElementById("researchAddress")?.value || "", button.dataset.researchFilter);
  }));
  document.getElementById("researchResultsGrid")?.addEventListener("click", event => {
    const openButton = event.target.closest("[data-research-url]");
    if (openButton) window.open(openButton.dataset.researchUrl, "_blank", "noopener,noreferrer");
  });
  document.getElementById("researchHistoryList")?.addEventListener("click", event => {
    const historyButton = event.target.closest("[data-research-history]");
    if (historyButton) runResearch(historyButton.dataset.researchHistory || "");
  });
  document.getElementById("researchBackButton")?.addEventListener("click", () => {
    if (researchPosition > 0) { researchPosition -= 1; renderResearch(researchHistory[researchPosition]); }
  });
  document.getElementById("researchForwardButton")?.addEventListener("click", () => {
    if (researchPosition < researchHistory.length - 1) { researchPosition += 1; renderResearch(researchHistory[researchPosition]); }
  });


  globalSearch?.addEventListener(
    "input",
    () => {

      if (!searchResults) return;


      const query =
        globalSearch.value
          .trim()
          .toLowerCase();


      if (!query) {

        searchResults.classList.add(
          "hidden"
        );

        searchResults.innerHTML =
          "";

        return;

      }


      const matches =
        searchablePages.filter(
          item =>
            item[0]
              .toLowerCase()
              .includes(query)
        );

      const searchableRecords = [
        ...cases.map(item => ({ label: item.name || "Unbenannter Fall", page: "cases", icon: "📁" })),
        ...evidence.map(item => ({ label: item.name || "Beweis", page: "evidence", icon: "🔎" })),
        ...suspects.map(item => ({ label: item.name || item.person || "Verdächtige Person", page: "suspects", icon: "👤" }))
      ].filter(item => item.label.toLowerCase().includes(query)).slice(0, 6);

      const crimeSearch = localCrimeTerms.some(term => query.includes(term));
      const webSearchAction = `
        <button type="button" class="web-search-result" data-open-research="${escapeHTML(globalSearch.value.trim())}">
          🧭 In der App recherchieren
          <small>Mini-Browser für den Rems-Murr-Kreis öffnen</small>
        </button>
        <button type="button" class="web-search-result" data-web-search="${escapeHTML(globalSearch.value.trim())}">
          🌐 Websuche: „${escapeHTML(globalSearch.value.trim())}“ im Rems-Murr-Kreis
          <small>Polizeimeldungen und lokale Nachrichten in neuem Tab öffnen</small>
        </button>`;


      searchResults.innerHTML =
        matches.length || searchableRecords.length || crimeSearch

          ? matches
              .map(
                item => `

                  <button
                    type="button"
                    data-search-page="${item[1]}"
                  >
                    🔎
                    ${escapeHTML(item[0])}
                  </button>

                `
              )
                .join("") + searchableRecords.map(item => `
                  <button type="button" data-search-page="${item.page}">
                    ${item.icon} ${escapeHTML(item.label)}
                    <small class="search-record-label">Gespeicherter Eintrag</small>
                  </button>
                `).join("") + webSearchAction

          : `
              <div
                style="
                  padding:12px;
                  color:#8e9aaa;
                "
              >
                Keine Ergebnisse gefunden.
              </div>
            ` + webSearchAction;


      searchResults.classList.remove(
        "hidden"
      );

    }
  );


  searchResults?.addEventListener(
    "click",
    event => {

      const webButton = event.target.closest("[data-web-search]");
      if (webButton) {
        openLocalWebSearch(webButton.dataset.webSearch || "");
        return;
      }

      const researchButton = event.target.closest("[data-open-research]");
      if (researchButton) {
        runResearch(researchButton.dataset.openResearch || "");
        searchResults.classList.add("hidden");
        return;
      }

      const button =
        event.target.closest(
          "[data-search-page]"
        );


      if (!button) return;


      showPage(
        button.dataset.searchPage
      );


      searchResults.classList.add(
        "hidden"
      );


      if (globalSearch) {
        globalSearch.value = "";
      }

    }
  );

  globalSearch?.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      globalSearch.value = "";
      searchResults?.classList.add("hidden");
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    runResearch(globalSearch.value);
    searchResults?.classList.add("hidden");
  });


  // ========================================
  // BENACHRICHTIGUNGEN
  // ========================================

  document
    .getElementById(
      "notificationButton"
    )
    ?.addEventListener(
      "click",
      () => {
        const existing = document.getElementById("notificationToast");
        existing?.remove();
        const toast = document.createElement("div");
        toast.id = "notificationToast";
        toast.className = "notification-toast";
        toast.innerHTML = `<strong>Benachrichtigungen</strong><span>${messages.length ? `${messages.length} gespeicherte Nachricht(en).` : "Keine neuen Meldungen."}</span>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("visible"));
        window.setTimeout(() => {
          toast.classList.remove("visible");
          window.setTimeout(() => toast.remove(), 220);
        }, 3200);

      }
    );


  // ========================================
  // EINSTELLUNGEN
  // ========================================

  function applySettings() {
    const getSetting = key => document.querySelector(`[data-setting="${key}"]`);
    const valueOf = key => {
      const control = getSetting(key);
      return control?.type === "checkbox" ? control.checked : control?.value;
    };

    document.body.classList.toggle("light-mode", valueOf("darkMode") === false);
    document.body.classList.toggle("compact-mode", valueOf("compactMode") === true);
    document.body.classList.toggle("high-contrast", valueOf("highContrast") === true);
    document.body.classList.toggle("reduced-motion", valueOf("motion") === false);
    document.body.dataset.accent = valueOf("accentColor") || "chili";
    document.body.dataset.density = valueOf("uiDensity") || "comfortable";
  }

  document.getElementById("clearAppDataButton")?.addEventListener("click", () => {
    if (!window.confirm("Alle lokalen App-Daten wirklich löschen?")) return;
    [
      STORAGE.cases,
      STORAGE.evidence,
      STORAGE.suspects,
      STORAGE.messages,
      "schilischoten_phantom_profile"
    ].forEach(key => localStorage.removeItem(key));
    Object.keys(localStorage)
      .filter(key => key.startsWith("setting_"))
      .forEach(key => localStorage.removeItem(key));
    window.location.reload();
  });

  document.getElementById("tinyResetButton")?.addEventListener("click", () => {
    if (!window.confirm("Alle gespeicherten Daten wirklich löschen?")) return;
    localStorage.clear();
    window.location.reload();
  });

  document
    .querySelectorAll(
      "[data-setting]"
    )
    .forEach(
      setting => {

        const key =
          setting.dataset.setting;


        const saved =
          localStorage.getItem(
            `setting_${key}`
          );


        const isCheckbox = setting.type === "checkbox";
        if (saved !== null) {
          if (isCheckbox) {
            setting.checked = saved === "true";
          } else {
            setting.value = saved;
          }
        }

        applySettings();


        setting.addEventListener(
          "change",
          () => {

            localStorage.setItem(`setting_${key}`, String(isCheckbox ? setting.checked : setting.value));
            applySettings();

          }
        );

      }
    );


  // ========================================
  // RENDER
  // ========================================

  function renderTeam() {

    const grid =
      document.getElementById(
        "teamGrid"
      );


    if (!grid) return;


    grid.innerHTML =
      team
        .map(
          person => `

            <div class="person-card">

              <div class="avatar big">
                ${escapeHTML(
                  person.name.charAt(0)
                )}
              </div>

              <h3>
                ${escapeHTML(
                  person.name
                )}
              </h3>

              <p>
                ${escapeHTML(
                  person.role
                )}
              </p>

            </div>

          `
        )
        .join("");

  }


  function renderEvidence() {

    const grid =
      document.getElementById(
        "evidenceGrid"
      );


    if (!grid) return;


    if (!evidence.length) {

      grid.innerHTML =
        `<div class="empty-state">
          Noch keine Beweise gespeichert.
        </div>`;

      return;

    }


    grid.innerHTML =
      evidence
        .map(
          item => `

            <div class="evidence-card">

              <h3>
                ${escapeHTML(
                  item.name ||
                  "Beweis"
                )}
              </h3>

              <p>
                ${escapeHTML(
                  item.description ||
                  "Keine Beschreibung"
                )}
              </p>

            </div>

          `
        )
        .join("");

  }


  function renderSuspects() {

    const grid =
      document.getElementById(
        "suspectGrid"
      );


    if (!grid) return;


    if (!suspects.length) {

      grid.innerHTML =
        `<div class="empty-state">
          Noch keine Verdächtigen erfasst.
        </div>`;

      return;

    }


    grid.innerHTML =
      suspects
        .map(
          item => `

            <div class="person-card">

              <div class="avatar big">
                ${escapeHTML(
                  (
                    item.name ||
                    "?"
                  ).charAt(0)
                )}
              </div>

              <h3>
                ${escapeHTML(
                  item.name ||
                  "Unbekannt"
                )}
              </h3>

              <p>
                ${escapeHTML(
                  item.description ||
                  "Keine Beschreibung"
                )}
              </p>

            </div>

          `
        )
        .join("");

  }


  function renderStats() {

    const solved =
      cases.filter(
        item =>
          item.status ===
          "done"
      ).length;


    const elements = {

      statsTotalCases:
        cases.length,

      statsSolvedCases:
        solved,

      statsEvidenceCount:
        evidence.length,

      statsMessageCount:
        messages.length

    };


    Object.entries(
      elements
    ).forEach(
      ([id, value]) => {

        const element =
          document.getElementById(
            id
          );


        if (element) {
          element.textContent =
            String(value);
        }

      }
    );


    const rate =
      cases.length
        ? Math.round(
            (
              solved /
              cases.length
            ) * 100
          )
        : 0;


    const success =
      document.getElementById(
        "statsSuccessRate"
      );


    if (success) {
      success.textContent =
        `${rate}%`;
    }

    const statusCounts = {
      open: cases.filter(item => item.status === "open").length,
      progress: cases.filter(item => item.status === "progress").length,
      done: solved
    };
    const total = cases.length || 1;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const countElement = document.getElementById(`stats${status === "open" ? "Open" : status === "progress" ? "Progress" : "Done"}Cases`);
      const bar = document.getElementById(`stats${status === "open" ? "Open" : status === "progress" ? "Progress" : "Done"}Bar`);
      if (countElement) countElement.textContent = String(count);
      if (bar) bar.style.width = `${Math.round((count / total) * 100)}%`;
    });

    const activity = {
      statsActivityEvidence: evidence.length,
      statsActivitySuspects: suspects.length
    };
    Object.entries(activity).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    });

  }


  function renderAll() {

    renderDashboard();

    renderCases();

    renderEvidence();

    renderSuspects();

    renderTeam();

    renderChat();

    renderStats();

    updateAccountUI();

    renderPhantom();

  }


  // ========================================
  // START
  // ========================================

  renderAll();

  showPage(
    "dashboard"
  );


  console.log(
    "🌶️ fixed.js wurde erfolgreich geladen."
  );

})