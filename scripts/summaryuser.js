/**
 * Haupt-Initialisierung der Summary-Seite.
 */
function initSummaryUser() {
  // 1. Nutzerdaten abrufen (Versucht den Namen aus dem Speicher zu laden)
  const user = getLoggedInUser();

  // 2. UI-Elemente mit Nutzerdaten und Metriken füllen
  updateUserUI(user);
  renderSummaryMetrics();

  // 3. Mobile Animation steuern
  handleMobileAnimation(user.name);

  // 4. Interaktivität: Karten klickbar machen (Weiterleitung zum Board)
  setupCardNavigation();
}

/**
 * Holt den eingeloggten Nutzer aus dem LocalStorage oder nutzt einen Fallback.
 */
function getLoggedInUser() {
  const userData = localStorage.getItem("currentUser");
  if (userData) {
    return JSON.parse(userData);
  }
  // Fallback für die Entwicklung
  return { name: "Sofia Müller", initials: "SM" };
}

/**
 * Aktualisiert Namen, Begrüßung und Initialen.
 * Das Datum wird hier nicht mehr gesetzt.
 */
function updateUserUI(user) {
  const greeting = getGreetingText();

  // Namen setzen (Desktop & Mobile)
  if (document.getElementById("user-name")) {
    document.getElementById("user-name").innerText = user.name;
  }
  if (document.getElementById("mobile-user-name")) {
    document.getElementById("mobile-user-name").innerText = user.name;
  }

  // Begrüßungstext setzen
  if (document.getElementById("greeting-text")) {
    document.getElementById("greeting-text").innerText = greeting;
  }
  if (document.getElementById("mobile-greeting-text")) {
    document.getElementById("mobile-greeting-text").innerText = greeting;
  }

  // Initialen in den Headern setzen (Desktop & Mobile)
  const initialsElements = [
    document.getElementById("user-initials"),
    document.querySelector(".user-initials-mobile"),
  ];
  initialsElements.forEach((el) => {
    if (el) el.innerText = user.initials;
  });
}

/**
 * Ermittelt die passende Begrüßung basierend auf der Uhrzeit.
 */
function getGreetingText() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

/**
 * Füllt die Metriken (Zahlen) in die Karten.
 * Hier kannst du einen statischen Termin für die Deadline eintragen.
 */
function renderSummaryMetrics() {
  const metrics = {
    todo: 1,
    done: 1,
    urgent: 1,
    board: 5,
    progress: 2,
    awaiting: 2,
    deadline: "October 16, 2022", // Hier kannst du ein festes Datum eintragen
  };

  const metricMapping = {
    "count-todo": metrics.todo,
    "count-done": metrics.done,
    "count-urgent": metrics.urgent,
    "count-board": metrics.board,
    "count-progress": metrics.progress,
    "count-awaiting": metrics.awaiting,
    "next-deadline": metrics.deadline,
  };

  for (const [id, value] of Object.entries(metricMapping)) {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = value;
    }
  }
}

/**
 * Steuert das Ein- und Ausblenden des Mobile-Overlays.
 */
function handleMobileAnimation(userName) {
  const overlay = document.getElementById("mobile-greeting-overlay");
  if (!overlay) return;

  if (window.innerWidth <= 780) {
    const greeting = getGreetingText();
    document.getElementById("mobile-greeting-text").innerText = greeting;
    document.getElementById("mobile-user-name").innerText = userName;

    overlay.classList.remove("d-none");

    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        overlay.classList.add("d-none");
      }, 800);
    }, 1500);
  } else {
    overlay.classList.add("d-none");
  }
}

/**
 * Macht die Karten klickbar für die Navigation zum Board.
 */
function setupCardNavigation() {
  const cards = document.querySelectorAll(".metric-card");
  cards.forEach((card) => {
    card.style.cursor = "pointer";
    card.onclick = () => {
      window.location.href = "board.html";
    };
  });
}

/**
 * Toggelt das User-Menü Dropdown.
 */
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}
