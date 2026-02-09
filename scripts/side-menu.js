/**
 * side-menu.js
 * Contains functions for sidebar navigation
 */

/**
 * Initialisiert das Seitenmenü und markiert den aktiven Link
 * @param {string} currentPage - Name der aktuellen Seite (z.B. 'summary', 'board')
 */
function initSideMenu(currentPage) {
  const navLinks = document.querySelectorAll(".sidebar .nav-links a");

  navLinks.forEach((link) => {
    link.classList.remove("active");

    // Prüft, ob der Link zur aktuellen Seite gehört
    const href = link.getAttribute("href");
    if (href && href.includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

/**
 * Navigiert zu einer bestimmten Seite
 * @param {string} pageName - Name der Zielseite (z.B. 'summary.html')
 */
function navigateTo(pageName) {
  window.location.href = pageName;
}

/**
 * Zeigt die Benutzerinitialen im Header an
 * @param {string} username - Der Benutzername
 */
function displayUserInitials(username) {
  const initialsElement = document.getElementById("user-initials");
  if (!initialsElement || !username) return;

  // Extrahiere Initialen aus dem Namen (z.B. "Sofia Müller" -> "SM")
  const nameParts = username.trim().split(" ");
  let initials = "";

  if (nameParts.length >= 2) {
    initials = nameParts[0][0] + nameParts[1][0];
  } else if (nameParts.length === 1) {
    initials = nameParts[0][0];
  }

  initialsElement.textContent = initials.toUpperCase();
}

/**
 * Zeigt Gast-Initialen im Header an
 */
function displayGuestInitials() {
  const initialsElement = document.getElementById("user-initials");
  if (!initialsElement) return;

  initialsElement.textContent = "G";
  initialsElement.classList.add("guest-avatar");
}
