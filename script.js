document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // GRUNDLAGEN
  // ========================================

  const navButtons = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  let activeAccount = "Leon";

  const team = [
    { name: "Leon", role: "Chef-Ermittler" },
    { name: "Leo", role: "Agent" },
    { name: "Leonie", role: "Agent" },
    { name: "Melina", role: "Agent" },
    { name: "Nils", role: "Agent" }
  ];

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
      "Nur für Mitglieder der Ermittler-Zentrale."
    ],

    team: [
      "Ermittler-Team",
      "Die Agenten der Schilischoten-Zentrale."
    ],

    stats: [
      "Statistiken",
      "Die Leistung der Ermittler-Zentrale."
    ],

    settings: [
      "Einstellungen",
      "Verwalte deine Ermittler-Zentrale."
    ]

  };


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

  function showPage(pageName) {

    pages.forEach(page => {
      page.classList.remove("active");
    });

    navButtons.forEach(button => {
      button.classList.remove("active");
    });

    const page = document.getElementById(pageName);

    const button = document.querySelector(
      `.nav-btn[data-page="${pageName}"]`
    );

    if (page) {
      page.classList.add("active");
    }

    if (button) {
      button.classList.add("active");
    }

    if (pageInfo[pageName]) {

      const title = document.getElementById("pageTitle");
      const subtitle = document.getElementById("pageSubtitle");

      if (title) {
        title.textContent = pageInfo[pageName][0];
      }

      if (subtitle) {
        subtitle.textContent = pageInfo[pageName][1];
      }

    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  navButtons.forEach(button => {

    button.addEventListener("click", () => {

      showPage(button.dataset.page);

    });

  });


  document
    .querySelectorAll("[data-goto]")
    .forEach(button => {

      button.addEventListener("click", () => {

        showPage(button.dataset.goto);

      });

    });


  // ========================================
  // EINFACHE DATENSPEICHERUNG
  // ========================================

  const casesKey = "schilischoten_cases";
  const evidenceKey = "schilischoten_evidence";
  const suspectsKey = "schilischoten_suspects";
  const messagesKey = "schilischoten_messages";

  let cases = JSON.parse(
    localStorage.getItem(casesKey) || "[]"
  );

  let evidence = JSON.parse(
    localStorage.getItem(evidenceKey) || "[]"
  );

  let suspects = JSON.parse(
    localStorage.getItem(suspectsKey) || "[]"
  );

  let messages = JSON.parse(
    localStorage.getItem(messagesKey) || "[]"
  );


  function saveData() {

    localStorage.setItem(
      casesKey,
      JSON.stringify(cases)
    );

    localStorage.setItem(
      evidenceKey,
      JSON.stringify(evidence)
    );

    localStorage.setItem(
      suspectsKey,
      JSON.stringify(suspects)
    );

    localStorage.setItem(
      messagesKey,
      JSON.stringify(messages)
    );

  }


  // ========================================
  // DASHBOARD
  // ========================================

  function renderDashboard() {

    const active =
      cases.filter(
        item =>
          item.status === "open" ||
          item.status === "progress"
      ).length;

    const solved =
      cases.filter(
        item =>
          item.status === "done"
      ).length;

    const activeElement =
      document.getElementById("activeCasesCount");

    const evidenceElement =
      document.getElementById("dashboardEvidenceCount");

    const suspectsElement =
      document.getElementById("dashboardSuspectCount");

    const solvedElement =
      document.getElementById("solvedCasesCount");

    if (activeElement) {
      activeElement.textContent = active;
    }

    if (evidenceElement) {
      evidenceElement.textContent = evidence.length;
    }

    if (suspectsElement) {
      suspectsElement.textContent = suspects.length;
    }

    if (solvedElement) {
      solvedElement.textContent = solved;
    }


    const list =
      document.getElementById("dashboardCasesList");

    if (!list) return;

    if (!cases.length) {

      list.innerHTML = `
        <p class="empty-text">
          Keine aktuellen Fälle vorhanden.
        </p>
      `;

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
                  ${escapeHTML(item.name)}
                </h3>

                <span>
                  ${escapeHTML(item.description || "")}
                </span>
              </div>

              <span class="status ${item.status}">
                ${escapeHTML(item.status)}
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
      document.getElementById("casesList");

    if (!list) return;

    const query =
      (
        document.getElementById("caseSearch")?.value ||
        ""
      )
        .trim()
        .toLowerCase();

    const filter =
      document.getElementById("caseFilter")?.value ||
      "all";

    const filtered =
      cases.filter(item => {

        const matchesText =
          !query ||
          String(item.name)
            .toLowerCase()
            .includes(query) ||
          String(item.description || "")
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          filter === "all" ||
          item.status === filter;

        return matchesText && matchesStatus;

      });


    if (!filtered.length) {

      list.innerHTML = `
        <div class="empty-state">
          Keine Fälle gefunden.
        </div>
      `;

      return;

    }


    list.innerHTML =
      filtered
        .map(item => `

          <article class="case-card">

            <div class="case-meta">

              <div>

                <h3>
                  ${escapeHTML(item.name)}
                </h3>

                <small>
                  Priorität:
                  ${escapeHTML(item.priority)}
                </small>

              </div>

              <span class="status ${item.status}">
                ${escapeHTML(item.status)}
              </span>

            </div>

            <p>
              ${escapeHTML(item.description || "Keine Beschreibung")}
            </p>

          </article>

        `)
        .join("");

  }


  // ========================================
  // FALL MODAL
  // ========================================

  const caseModal =
    document.getElementById("caseModal");

  function openCaseModal() {

    if (caseModal) {
      caseModal.classList.add("show");
    }

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
            .value
            .trim();

        const description =
          document
            .getElementById("caseDescription")
            .value
            .trim();

        const priority =
          document
            .getElementById("casePriority")
            .value;

        const status =
          document
            .getElementById("caseStatus")
            .value;


        if (!name) return;


        cases.unshift({
          id: Date.now(),
          name,
          description,
          priority,
          status
        });


        saveData();

        renderAll();

        caseModal?.classList.remove("show");

        event.target.reset();

      }
    );


  // ========================================
  // MODAL SCHLIESSEN
  // ========================================

  document
    .querySelectorAll("[data-close]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const modal =
          document.getElementById(
            button.dataset.close
          );

        modal?.classList.remove("show");

      });

    });


  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener("click", event => {

        if (event.target === modal) {
          modal.classList.remove("show");
        }

      });

    });


  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      document
        .querySelectorAll(".modal")
        .forEach(modal => {
          modal.classList.remove("show");
        });

    }

  });


  // ========================================
  // PHANTOMBILD
  // ========================================

  const phantomOptions = {

    face: [
      "Oval",
      "Rund",
      "Kantig",
      "Schmal"
    ],

    skin: [
      "Hell",
      "Mittel",
      "Dunkel"
    ],

    hair: [
      "Kurz",
      "Locken",
      "Irokese",
      "Glatze"
    ],

    eyes: [
      "Rund",
      "Schmal",
      "Braun",
      "Brille"
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
      "Voll",
      "Schmal"
    ],

    beard: [
      "Keine",
      "Dreitagebart",
      "Vollbart",
      "Schnurrbart"
    ],

    age: [
      "Jung",
      "Erwachsen",
      "Reif",
      "Älter"
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
      "Hals"
    ],

    accessories: [
      "Keine",
      "Mütze",
      "Ohrring",
      "Sonnenbrille"
    ]

  };


  const phantomState = {};

  Object.entries(phantomOptions)
    .forEach(([feature, options]) => {

      phantomState[feature] =
        options[0];

    });


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


  // ========================================
  // SVG HILFSFUNKTIONEN
  // ========================================

  function getSkinColor() {

    switch (phantomState.skin) {

      case "Hell":
        return "#efc7ab";

      case "Dunkel":
        return "#7e513c";

      case "Mittel":
      default:
        return "#c88d6d";

    }

  }


  function getHairColor() {

    switch (phantomState.hair) {

      case "Locken":
        return "#30211c";

      case "Irokese":
        return "#17181b";

      case "Glatze":
        return "#403833";

      default:
        return "#252325";

    }

  }


  function facePath() {

    switch (phantomState.face) {

      case "Rund":
        return `
          <ellipse
            cx="300"
            cy="355"
            rx="154"
            ry="176"
          />
        `;

      case "Kantig":
        return `
          <path
            d="
              M188 265
              Q200 190 300 180
              Q400 190 412 265
              L400 420
              Q380 525 300 545
              Q220 525 200 420
              Z
            "
          />
        `;

      case "Schmal":
        return `
          <path
            d="
              M220 240
              Q300 175 380 240
              Q405 330 380 455
              Q350 525 300 545
              Q250 525 220 455
              Q195 330 220 240
              Z
            "
          />
        `;

      case "Oval":
      default:
        return `
          <ellipse
            cx="300"
            cy="355"
            rx="137"
            ry="181"
          />
        `;

    }

  }


  function earsSVG(skin) {

    let size = 34;

    let leftX = 165;
    let rightX = 435;

    if (phantomState.ears === "Groß") {
      size = 45;
    }

    if (phantomState.ears === "Abstehend") {
      leftX = 150;
      rightX = 450;
      size = 42;
    }

    return `
      <ellipse
        cx="${leftX}"
        cy="350"
        rx="${size}"
        ry="55"
        fill="${skin}"
        stroke="#8b5d47"
        stroke-width="5"
      />

      <ellipse
        cx="${rightX}"
        cy="350"
        rx="${size}"
        ry="55"
        fill="${skin}"
        stroke="#8b5d47"
        stroke-width="5"
      />
    `;

  }


  function hairSVG() {

    const color = getHairColor();

    switch (phantomState.hair) {

      case "Glatze":

        return `
          <path
            d="
              M175 290
              Q180 170 300 135
              Q420 170 425 290
              Q390 225 300 220
              Q210 225 175 290
              Z
            "
            fill="none"
            stroke="${color}"
            stroke-width="12"
            opacity="0.28"
          />
        `;


      case "Locken":

        return `
          <g fill="${color}" stroke="#181619" stroke-width="2">

            <circle cx="210" cy="225" r="38"/>
            <circle cx="245" cy="195" r="41"/>
            <circle cx="290" cy="184" r="42"/>
            <circle cx="335" cy="190" r="41"/>
            <circle cx="380" cy="225" r="38"/>

            <circle cx="194" cy="260" r="28"/>
            <circle cx="405" cy="260" r="28"/>

          </g>
        `;


      case "Irokese":

        return `
          <path
            d="
              M250 285
              L258 165
              Q300 100 342 165
              L350 285
              Z
            "
            fill="${color}"
            stroke="#181619"
            stroke-width="5"
          />
        `;


      case "Kurz":
      default:

        return `
          <path
            d="
              M174 290
              Q175 165 300 145
              Q425 165 426 290
              Q395 215 300 220
              Q205 215 174 290
              Z
            "
            fill="${color}"
            stroke="#171518"
            stroke-width="6"
          />
        `;

    }

  }


  function eyesSVG() {

    const color =
      phantomState.eyes === "Braun"
        ? "#553c2e"
        : "#212833";

    const rx =
      phantomState.eyes === "Schmal"
        ? 23
        : 31;

    const ry =
      phantomState.eyes === "Schmal"
        ? 10
        : 16;

    return `
      <g>

        <ellipse
          cx="245"
          cy="340"
          rx="${rx}"
          ry="${ry}"
          fill="#f6f7fa"
          stroke="#633f32"
          stroke-width="4"
        />

        <ellipse
          cx="355"
          cy="340"
          rx="${rx}"
          ry="${ry}"
          fill="#f6f7fa"
          stroke="#633f32"
          stroke-width="4"
        />

        <circle
          cx="245"
          cy="340"
          r="9"
          fill="${color}"
        />

        <circle
          cx="355"
          cy="340"
          r="9"
          fill="${color}"
        />

        <circle
          cx="248"
          cy="337"
          r="3"
          fill="white"
        />

        <circle
          cx="358"
          cy="337"
          r="3"
          fill="white"
        />

      </g>
    `;

  }


  function browsSVG() {

    switch (phantomState.brows) {

      case "Geschwungen":

        return `
          <path
            d="M210 304 Q245 280 275 304"
            fill="none"
            stroke="#2a211f"
            stroke-width="9"
            stroke-linecap="round"
          />

          <path
            d="M325 304 Q355 280 390 304"
            fill="none"
            stroke="#2a211f"
            stroke-width="9"
            stroke-linecap="round"
          />
        `;

      case "Dicht":

        return `
          <path
            d="M207 304 Q245 282 278 306"
            fill="none"
            stroke="#171416"
            stroke-width="15"
            stroke-linecap="round"
          />

          <path
            d="M322 306 Q355 282 393 304"
            fill="none"
            stroke="#171416"
            stroke-width="15"
            stroke-linecap="round"
          />
        `;

      case "Dünn":

        return `
          <path
            d="M210 304 Q245 290 276 304"
            fill="none"
            stroke="#302523"
            stroke-width="4"
            stroke-linecap="round"
          />

          <path
            d="M324 304 Q355 290 390 304"
            fill="none"
            stroke="#302523"
            stroke-width="4"
            stroke-linecap="round"
          />
        `;

      case "Gerade":
      default:

        return `
          <path
            d="M210 298 L275 298"
            fill="none"
            stroke="#2a211f"
            stroke-width="8"
            stroke-linecap="round"
          />

          <path
            d="M325 298 L390 298"
            fill="none"
            stroke="#2a211f"
            stroke-width="8"
            stroke-linecap="round"
          />
        `;

    }

  }


  function noseSVG() {

    switch (phantomState.nose) {

      case "Gebogen":

        return `
          <path
            d="M300 350 Q323 382 315 431 Q307 449 288 446"
            fill="none"
            stroke="#8c5a46"
            stroke-width="6"
            stroke-linecap="round"
          />
        `;

      case "Breit":

        return `
          <path
            d="M300 350 Q281 388 274 430 Q300 448 326 430 Q319 388 300 350"
            fill="none"
            stroke="#8c5a46"
            stroke-width="7"
          />

          <ellipse
            cx="278"
            cy="432"
            rx="7"
            ry="5"
            fill="#82523f"
          />

          <ellipse
            cx="322"
            cy="432"
            rx="7"
            ry="5"
            fill="#82523f"
          />
        `;

      case "Klein":

        return `
          <path
            d="M300 372 L293 426 Q300 434 308 426"
            fill="none"
            stroke="#8c5a46"
            stroke-width="5"
          />
        `;

      case "Gerade":
      default:

        return `
          <path
            d="M300 350 L300 429"
            fill="none"
            stroke="#8c5a46"
            stroke-width="6"
            stroke-linecap="round"
          />

          <path
            d="M288 432 Q300 440 312 432"
            fill="none"
            stroke="#8c5a46"
            stroke-width="5"
          />
        `;

    }

  }


  function mouthSVG() {

    switch (phantomState.mouth) {

      case "Lächeln":

        return `
          <path
            d="M250 483 Q300 525 350 483"
            fill="none"
            stroke="#642d2f"
            stroke-width="8"
            stroke-linecap="round"
          />

          <path
            d="M264 492 Q300 506 336 492"
            fill="none"
            stroke="#f4d9d2"
            stroke-width="4"
          />
        `;

      case "Voll":

        return `
          <path
            d="M250 480 Q300 458 350 480 Q300 518 250 480"
            fill="#8f4146"
            stroke="#5b2528"
            stroke-width="4"
          />
        `;

      case "Schmal":

        return `
          <path
            d="M260 488 Q300 480 340 488"
            fill="none"
            stroke="#642d2f"
            stroke-width="6"
            stroke-linecap="round"
          />
        `;

      case "Neutral":
      default:

        return `
          <path
            d="M260 488 Q300 495 340 488"
            fill="none"
            stroke="#642d2f"
            stroke-width="6"
            stroke-linecap="round"
          />
        `;

    }

  }


  function beardSVG() {

    switch (phantomState.beard) {

      case "Dreitagebart":

        return `
          <path
            d="
              M220 455
              Q300 535 380 455
              Q360 525 300 545
              Q240 525 220 455
              Z
            "
            fill="#342a28"
            opacity="0.23"
          />
        `;

      case "Vollbart":

        return `
          <path
            d="
              M215 438
              Q300 550 385 438
              L370 520
              Q300 585 230 520
              Z
            "
            fill="#2a2422"
            opacity="0.9"
          />
        `;

      case "Schnurrbart":

        return `
          <path
            d="
              M258 463
              Q280 450 300 466
              Q320 450 342 463
              Q326 490 300 482
              Q274 490 258 463
              Z
            "
            fill="#2b2523"
          />
        `;

      default:
        return "";

    }

  }


  function ageSVG() {

    if (phantomState.age === "Jung") {
      return "";
    }

    if (phantomState.age === "Erwachsen") {

      return `
        <path
          d="M240 412 Q255 405 270 412"
          fill="none"
          stroke="#9c6a55"
          stroke-width="3"
          opacity="0.25"
        />

        <path
          d="M330 412 Q345 405 360 412"
          fill="none"
          stroke="#9c6a55"
          stroke-width="3"
          opacity="0.25"
        />
      `;

    }


    if (phantomState.age === "Reif") {

      return `
        <path
          d="M230 414 Q248 400 270 414"
          fill="none"
          stroke="#855a49"
          stroke-width="4"
          opacity="0.45"
        />

        <path
          d="M330 414 Q352 400 370 414"
          fill="none"
          stroke="#855a49"
          stroke-width="4"
          opacity="0.45"
        />

        <path
          d="M258 515 Q300 528 342 515"
          fill="none"
          stroke="#855a49"
          stroke-width="3"
          opacity="0.35"
        />
      `;

    }


    return `
      <path
        d="M226 410 Q250 388 275 411"
        fill="none"
        stroke="#755144"
        stroke-width="5"
        opacity="0.65"
      />

      <path
        d="M325 411 Q350 388 374 410"
        fill="none"
        stroke="#755144"
        stroke-width="5"
        opacity="0.65"
      />

      <path
        d="M245 445 Q250 430 258 425"
        fill="none"
        stroke="#755144"
        stroke-width="4"
        opacity="0.6"
      />

      <path
        d="M355 445 Q350 430 342 425"
        fill="none"
        stroke="#755144"
        stroke-width="4"
        opacity="0.6"
      />
    `;

  }


  function scarsSVG() {

    switch (phantomState.scars) {

      case "Stirn":

        return `
          <path
            d="M330 228 L355 270"
            stroke="#984d55"
            stroke-width="6"
            stroke-linecap="round"
          />
        `;

      case "Wange":

        return `
          <path
            d="M395 393 L370 425"
            stroke="#984d55"
            stroke-width="6"
            stroke-linecap="round"
          />
        `;

      case "Kinn":

        return `
          <path
            d="M300 525 L285 515"
            stroke="#984d55"
            stroke-width="6"
            stroke-linecap="round"
          />
        `;

      default:
        return "";

    }

  }


  function tattooSVG() {

    switch (phantomState.tattoos) {

      case "Stern":

        return `
          <path
            d="
              M395 385
              L402 402
              L420 402
              L406 412
              L411 430
              L395 420
              L379 430
              L384 412
              L370 402
              L388 402
              Z
            "
            fill="#30343c"
            opacity="0.9"
          />
        `;

      case "Wange":

        return `
          <path
            d="
              M390 390
              q22 -12 32 8
              q-10 20 -32 8
              Z
            "
            fill="#343941"
            opacity="0.8"
          />
        `;

      case "Hals":

        return `
          <path
            d="
              M278 545
              q22 -16 44 0
              v35
              q-22 13 -44 0
              Z
            "
            fill="#343941"
            opacity="0.9"
          />
        `;

      default:
        return "";

    }

  }


  function accessoriesSVG() {

    switch (phantomState.accessories) {

      case "Mütze":

        return `
          <path
            d="
              M168 250
              Q180 130 300 110
              Q420 130 432 250
              Z
            "
            fill="#20262d"
            stroke="#0f1114"
            stroke-width="7"
          />

          <path
            d="
              M155 242
              Q300 210 445 242
            "
            fill="none"
            stroke="#121519"
            stroke-width="18"
            stroke-linecap="round"
          />
        `;

      case "Ohrring":

        return `
          <circle
            cx="447"
            cy="387"
            r="10"
            fill="none"
            stroke="#d4b25f"
            stroke-width="5"
          />
        `;

      case "Sonnenbrille":

        return `
          <g
            fill="#1b2027"
            stroke="#0d1014"
            stroke-width="7"
            opacity="0.98"
          >

            <rect
              x="198"
              y="316"
              width="92"
              height="52"
              rx="18"
            />

            <rect
              x="310"
              y="316"
              width="92"
              height="52"
              rx="18"
            />

            <path
              d="M290 330 Q300 322 310 330"
              fill="none"
              stroke="#0d1014"
            />

            <path
              d="M195 330 L168 322"
              fill="none"
            />

            <path
              d="M405 330 L432 322"
              fill="none"
            />

          </g>
        `;

      default:
        return "";

    }

  }


  // ========================================
  // KOMPLETTES PHANTOMBILD
  // ========================================

  function createPhantomSVG() {

    const skin = getSkinColor();

    const name =
      phantomName?.value.trim() ||
      "Unbekannte Person";


    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 760"
        role="img"
        aria-label="Phantombild"
      >

        <defs>

          <linearGradient
            id="bg"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="#202a35"
            />

            <stop
              offset="100%"
              stop-color="#10161d"
            />
          </linearGradient>

          <radialGradient
            id="faceLight"
            cx="50%"
            cy="35%"
            r="70%"
          >
            <stop
              offset="0%"
              stop-color="#ffffff"
              stop-opacity="0.16"
            />

            <stop
              offset="100%"
              stop-color="#000000"
              stop-opacity="0"
            />
          </radialGradient>

          <filter
            id="softShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >

            <feDropShadow
              dx="0"
              dy="13"
              stdDeviation="14"
              flood-color="#000"
              flood-opacity="0.35"
            />

          </filter>

        </defs>


        <!-- HINTERGRUND -->

        <rect
          x="0"
          y="0"
          width="600"
          height="760"
          rx="18"
          fill="url(#bg)"
        />


        <!-- TITEL -->

        <text
          x="300"
          y="48"
          text-anchor="middle"
          fill="#f4f7fb"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="22"
          font-weight="700"
        >
          ${escapeHTML(name)}
        </text>

        <text
          x="300"
          y="73"
          text-anchor="middle"
          fill="#8f9aa7"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="11"
          letter-spacing="2"
        >
          SCHILISCHOTEN PHANTOMBILD
        </text>


        <!-- HALS -->

        <path
          d="
            M238 505
            L238 635
            Q300 680 362 635
            L362 505
            Z
          "
          fill="${skin}"
          stroke="#8c5f4b"
          stroke-width="6"
        />


        <!-- OHREN -->

        <g filter="url(#softShadow)">
          ${earsSVG(skin)}
        </g>


        <!-- KOPF -->

        <g
          fill="${skin}"
          stroke="#8c5f4b"
          stroke-width="6"
          filter="url(#softShadow)"
        >
          ${facePath()}
        </g>


        <!-- LICHT AUF GESICHT -->

        <g opacity="0.75">
          ${facePath()}
        </g>

        <defs>
          <clipPath id="faceClip">
            ${facePath()}
          </clipPath>
        </defs>

        <g clip-path="url(#faceClip)">
          <rect
            x="160"
            y="170"
            width="280"
            height="370"
            fill="url(#faceLight)"
          />
        </g>


        <!-- AUGENBRAUEN -->

        ${browsSVG()}


        <!-- AUGEN -->

        ${eyesSVG()}


        <!-- NASE -->

        ${noseSVG()}


        <!-- MUND -->

        ${mouthSVG()}


        <!-- ALTER -->

        ${ageSVG()}


        <!-- BART -->

        ${beardSVG()}


        <!-- NARBEN -->

        ${scarsSVG()}


        <!-- TATTOOS -->

        ${tattooSVG()}


        <!-- HAARE -->

        ${hairSVG()}


        <!-- ACCESSOIRE -->

        ${accessoriesSVG()}


        <!-- SCHATTEN UNTER KINN -->

        <path
          d="M245 550 Q300 578 355 550"
          fill="none"
          stroke="#6d4c40"
          stroke-width="8"
          opacity="0.18"
        />


        <!-- INFOS -->

        <rect
          x="42"
          y="680"
          width="516"
          height="43"
          rx="12"
          fill="#0c1117"
          stroke="#29333f"
        />

        <text
          x="300"
          y="707"
          text-anchor="middle"
          fill="#a3adba"
          font-family="Segoe UI, Arial, sans-serif"
          font-size="12"
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


  // ========================================
  // PHANTOM INFOS
  // ========================================

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
      document.getElementById("infoFace");

    const infoHair =
      document.getElementById("infoHair");

    const infoEyes =
      document.getElementById("infoEyes");

    const infoAge =
      document.getElementById("infoAge");


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


  // ========================================
  // VORSCHAU AKTUALISIEREN
  // ========================================

  function updatePhantomPreview() {

    if (!phantomCanvas) return;

    phantomCanvas.innerHTML =
      createPhantomSVG();

    updatePhantomInfo();

  }


  // ========================================
  // BUTTONS GENERIEREN
  // ========================================

  if (phantomControls) {

    Object.entries(phantomOptions)
      .forEach(([feature, options]) => {

        const group =
          phantomControls.querySelector(
            `[data-feature-group="${feature}"]`
          );

        if (!group) return;

        const container =
          group.querySelector(
            ".feature-options"
          );

        if (!container) return;


        options.forEach((value, index) => {

          const option =
            document.createElement("button");

          option.type = "button";
          option.className = "feature-option";
          option.textContent = value;

          if (index === 0) {
            option.classList.add("selected");
          }

          option.setAttribute(
            "aria-pressed",
            String(index === 0)
          );


          option.addEventListener(
            "click",
            () => {

              phantomState[feature] =
                value;


              container
                .querySelectorAll(
                  ".feature-option"
                )
                .forEach(button => {

                  const selected =
                    button === option;

                  button.classList.toggle(
                    "selected",
                    selected
                  );

                  button.setAttribute(
                    "aria-pressed",
                    String(selected)
                  );

                });


              updatePhantomPreview();

            }
          );


          container.appendChild(option);

        });

      });

  }


  // ========================================
  // NAME
  // ========================================

  phantomName?.addEventListener(
    "input",
    updatePhantomPreview
  );


  // ========================================
  // RESET
  // ========================================

  document
    .getElementById("resetPhantomButton")
    ?.addEventListener(
      "click",
      () => {

        Object.entries(phantomOptions)
          .forEach(([feature, options]) => {

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
              .forEach((button, index) => {

                button.classList.toggle(
                  "selected",
                  index === 0
                );

                button.setAttribute(
                  "aria-pressed",
                  String(index === 0)
                );

              });

          });


        if (phantomName) {
          phantomName.value = "";
        }

        updatePhantomPreview();

      }
    );


  // ========================================
  // PHANTOMBILD SPEICHERN
  // ========================================

  document
    .getElementById("downloadPhantomButton")
    ?.addEventListener(
      "click",
      () => {

        const svg =
          createPhantomSVG();

        const blob =
          new Blob(
            [svg],
            {
              type: "image/svg+xml;charset=utf-8"
            }
          );

        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        const filename =
          (
            phantomName?.value.trim() ||
            "phantombild"
          )
            .replace(/[^a-z0-9äöüß_-]+/gi, "-")
            .toLowerCase();

        link.href = url;
        link.download =
          `${filename}.svg`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

      }
    );


  // ========================================
  // BILDVERGLEICH
  // ========================================

  const fileA =
    document.getElementById("compareFileA");

  const fileB =
    document.getElementById("compareFileB");

  const previewA =
    document.getElementById("previewA");

  const previewB =
    document.getElementById("previewB");

  let selectedFileA = null;
  let selectedFileB = null;


  document
    .getElementById("uploadButtonA")
    ?.addEventListener(
      "click",
      () => fileA?.click()
    );


  document
    .getElementById("uploadButtonB")
    ?.addEventListener(
      "click",
      () => fileB?.click()
    );


  function previewFile(
    file,
    container
  ) {

    if (!file || !container) return;

    if (!file.type.startsWith("image/")) {

      alert("Bitte ein Bild auswählen.");

      return;

    }


    const reader =
      new FileReader();

    reader.onload = event => {

      container.innerHTML = `

        <img
          src="${event.target.result}"
          alt="Bildvorschau"
        >

        <div>
          <strong>
            ${escapeHTML(file.name)}
          </strong>
        </div>

      `;

    };

    reader.readAsDataURL(file);

  }


  fileA?.addEventListener(
    "change",
    () => {

      selectedFileA =
        fileA.files[0] || null;

      previewFile(
        selectedFileA,
        previewA
      );

      const resultName =
        document.getElementById(
          "resultNameA"
        );

      if (resultName && selectedFileA) {
        resultName.textContent =
          selectedFileA.name;
      }

    }
  );


  fileB?.addEventListener(
    "change",
    () => {

      selectedFileB =
        fileB.files[0] || null;

      previewFile(
        selectedFileB,
        previewB
      );

      const resultName =
        document.getElementById(
          "resultNameB"
        );

      if (resultName && selectedFileB) {
        resultName.textContent =
          selectedFileB.name;
      }

    }
  );


  // ========================================
  // PIXELVERGLEICH
  // ========================================

  async function loadImage(file) {

    return new Promise(
      (resolve, reject) => {

        const image =
          new Image();

        const url =
          URL.createObjectURL(file);


        image.onload = () => {

          URL.revokeObjectURL(url);

          resolve(image);

        };


        image.onerror = () => {

          URL.revokeObjectURL(url);

          reject(
            new Error(
              "Bild konnte nicht geladen werden."
            )
          );

        };


        image.src = url;

      }
    );

  }


  async function compareImagesByPixels(
    imageFileA,
    imageFileB
  ) {

    const imageA =
      await loadImage(imageFileA);

    const imageB =
      await loadImage(imageFileB);


    const width = 256;
    const height = 256;

    const canvasA =
      document.createElement("canvas");

    const canvasB =
      document.createElement("canvas");


    canvasA.width = width;
    canvasA.height = height;

    canvasB.width = width;
    canvasB.height = height;


    const ctxA =
      canvasA.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

    const ctxB =
      canvasB.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );


    if (!ctxA || !ctxB) {

      throw new Error(
        "Canvas wird nicht unterstützt."
      );

    }


    function drawContain(
      ctx,
      image
    ) {

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      const scale =
        Math.min(
          width / image.width,
          height / image.height
        );


      const drawWidth =
        image.width * scale;

      const drawHeight =
        image.height * scale;


      const x =
        (width - drawWidth) / 2;

      const y =
        (height - drawHeight) / 2;


      ctx.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

    }


    drawContain(
      ctxA,
      imageA
    );

    drawContain(
      ctxB,
      imageB
    );


    const dataA =
      ctxA
        .getImageData(
          0,
          0,
          width,
          height
        )
        .data;


    const dataB =
      ctxB
        .getImageData(
          0,
          0,
          width,
          height
        )
        .data;


    const totalPixels =
      width * height;

    const tolerance = 20;

    let matchingPixels = 0;

    let totalDifference = 0;


    for (
      let i = 0;
      i < dataA.length;
      i += 4
    ) {

      const rDiff =
        Math.abs(
          dataA[i] -
          dataB[i]
        );

      const gDiff =
        Math.abs(
          dataA[i + 1] -
          dataB[i + 1]
        );

      const bDiff =
        Math.abs(
          dataA[i + 2] -
          dataB[i + 2]
        );


      const pixelDifference =
        (
          rDiff +
          gDiff +
          bDiff
        ) / 3;


      totalDifference +=
        pixelDifference;


      if (
        pixelDifference <=
        tolerance
      ) {

        matchingPixels++;

      }

    }


    const averageDifference =
      totalDifference /
      totalPixels;


    let similarity =
      100 -
      (
        averageDifference /
        255
      ) *
      100;


    similarity =
      Math.max(
        0,
        Math.min(
          100,
          similarity
        )
      );


    similarity =
      Math.round(
        similarity * 100
      ) / 100;


    return {
      similarity,
      matchingPixels,
      differentPixels:
        totalPixels -
        matchingPixels,
      totalPixels,
      averageDifference,
      tolerance
    };

  }


  document
    .getElementById("startCompareButton")
    ?.addEventListener(
      "click",
      async () => {

        if (!selectedFileA || !selectedFileB) {

          alert(
            "Bitte zuerst beide Bilder auswählen."
          );

          return;

        }


        const resultBox =
          document.getElementById(
            "compareResult"
          );

        const title =
          document.getElementById(
            "comparisonTitle"
          );

        const description =
          document.getElementById(
            "comparisonDescription"
          );

        const percent =
          document.getElementById(
            "comparisonPercent"
          );


        resultBox?.classList.remove("hidden");


        if (title) {
          title.textContent =
            "Analyse läuft...";
        }

        if (percent) {
          percent.textContent =
            "...";
        }

        if (description) {
          description.textContent =
            "Die Bilder werden Pixel für Pixel analysiert.";
        }


        await new Promise(
          resolve => setTimeout(resolve, 150)
        );


        try {

          const result =
            await compareImagesByPixels(
              selectedFileA,
              selectedFileB
            );


          if (percent) {
            percent.textContent =
              `${result.similarity.toFixed(2)}%`;
          }


          if (title) {

            if (result.similarity >= 95) {
              title.textContent =
                "Sehr hohe Pixel-Übereinstimmung";
            }
            else if (result.similarity >= 80) {
              title.textContent =
                "Hohe Pixel-Übereinstimmung";
            }
            else if (result.similarity >= 60) {
              title.textContent =
                "Mittlere Pixel-Übereinstimmung";
            }
            else {
              title.textContent =
                "Geringe Pixel-Übereinstimmung";
            }

          }


          if (description) {

            description.textContent =
              `${result.matchingPixels.toLocaleString("de-DE")} von ` +
              `${result.totalPixels.toLocaleString("de-DE")} Pixeln ` +
              `liegen innerhalb der Farbtoleranz. ` +
              `Durchschnittliche Abweichung: ` +
              `${result.averageDifference.toFixed(2)}.`;

          }

        }
        catch (error) {

          console.error(error);

          if (title) {
            title.textContent =
              "Vergleich fehlgeschlagen";
          }

          if (percent) {
            percent.textContent =
              "Fehler";
          }

          if (description) {
            description.textContent =
              "Die Bilder konnten nicht analysiert werden.";
          }

        }

      }
    );


  // ========================================
  // CHAT
  // ========================================

  const chatInput =
    document.getElementById("chatInput");

  const sendMessageButton =
    document.getElementById("sendMessage");

  const chatMessages =
    document.getElementById("chatMessages");


  function sendChatMessage() {

    if (!chatInput || !chatMessages) {
      return;
    }


    const text =
      chatInput.value.trim();

    if (!text) return;


    messages.push({

      id: Date.now(),

      sender: activeAccount,

      text,

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

  }


  function renderChat() {

    if (!chatMessages) return;


    if (!messages.length) {

      chatMessages.innerHTML = `
        <div class="empty-state">
          Noch keine Nachrichten.
        </div>
      `;

      return;

    }


    chatMessages.innerHTML =
      messages
        .map(message => `

          <div class="chat-message">

            <strong>
              ${escapeHTML(message.sender)}
            </strong>

            <span>
              ${escapeHTML(message.text)}
            </span>

            <small>
              ${escapeHTML(message.time)}
            </small>

          </div>

        `)
        .join("");

  }


  sendMessageButton?.addEventListener(
    "click",
    sendChatMessage
  );


  chatInput?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        sendChatMessage();

      }

    }
  );


  // ========================================
  // ACCOUNT
  // ========================================

  const accountToggle =
    document.getElementById(
      "accountToggle"
    );

  const accountMenu =
    document.getElementById(
      "accountMenu"
    );


  accountToggle?.addEventListener(
    "click",
    () => {

      accountMenu?.classList.toggle(
        "hidden"
      );

    }
  );


  document
    .querySelectorAll(".account-option")
    .forEach(option => {

      option.addEventListener(
        "click",
        () => {

          activeAccount =
            option.dataset.account;

          const role =
            option.dataset.role;

          document.getElementById(
            "accountToggleName"
          ).textContent =
            activeAccount;

          document.getElementById(
            "accountToggleRole"
          ).textContent =
            role;

          document.getElementById(
            "profileName"
          ).textContent =
            `Agent ${activeAccount}`;

          document.getElementById(
            "profileRole"
          ).textContent =
            role;

          document.getElementById(
            "profileAvatar"
          ).textContent =
            activeAccount
              .charAt(0)
              .toUpperCase();

          document.getElementById(
            "accountToggleAvatar"
          ).textContent =
            activeAccount
              .charAt(0)
              .toUpperCase();


          document
            .querySelectorAll(".account-option")
            .forEach(item => {

              item.classList.remove(
                "active"
              );

            });


          option.classList.add(
            "active"
          );


          accountMenu?.classList.add(
            "hidden"
          );


          renderChat();

        }

      );

    });


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


  globalSearch?.addEventListener(
    "input",
    () => {

      const query =
        globalSearch.value
          .trim()
          .toLowerCase();


      if (!searchResults) return;


      if (!query) {

        searchResults.classList.add(
          "hidden"
        );

        searchResults.innerHTML =
          "";

        return;

      }


      const availablePages = [

        ["Dashboard", "dashboard"],
        ["Fälle", "cases"],
        ["Vergleichen", "compare"],
        ["Phantombild", "phantom"],
        ["Beweise", "evidence"],
        ["Verdächtige", "suspects"],
        ["Agenten-Chat", "chat"],
        ["Team", "team"],
        ["Statistiken", "stats"],
        ["Einstellungen", "settings"]

      ];


      const matches =
        availablePages.filter(
          item =>
            item[0]
              .toLowerCase()
              .includes(query)
        );


      if (!matches.length) {

        searchResults.innerHTML =
          `<div style="padding:12px;color:#8e9aaa;">
             Keine Ergebnisse gefunden.
           </div>`;

      }
      else {

        searchResults.innerHTML =
          matches
            .map(item => `

              <button
                type="button"
                data-search-page="${item[1]}"
              >
                🔎 ${escapeHTML(item[0])}
              </button>

            `)
            .join("");

      }


      searchResults.classList.remove(
        "hidden"
      );

    }
  );


  searchResults?.addEventListener(
    "click",
    event => {

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


  // ========================================
  // SUCHE FÄLLE
  // ========================================

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
  // BENACHRICHTIGUNGEN
  // ========================================

  document
    .getElementById("notificationButton")
    ?.addEventListener(
      "click",
      () => {

        alert(
          messages.length
            ? `${messages.length} gespeicherte Nachricht(en).`
            : "Keine neuen Meldungen."
        );

      }
    );


  // ========================================
  // EINSTELLUNGEN
  // ========================================

  document
    .querySelectorAll(
      "input[data-setting]"
    )
    .forEach(setting => {

      setting.addEventListener(
        "change",
        () => {

          localStorage.setItem(
            `setting_${setting.dataset.setting}`,
            setting.checked
          );

        }

      );

      const saved =
        localStorage.getItem(
          `setting_${setting.dataset.setting}`
        );

      if (saved !== null) {

        setting.checked =
          saved === "true";

      }

    });


  // ========================================
  // RENDER
  // ========================================

  function renderAll() {

    renderDashboard();

    renderCases();

    renderChat();

  }


  // ========================================
  // START
  // ========================================

  updatePhantomPreview();

  showPage("dashboard");

  renderAll();

  console.log(
    "🌶️ Schilischoten-Agenten gestartet!"
  );

});