/**
 * Schaltet das Benutzer-Dropdown-Menü um
 */
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");

  // Help-Link nur mobile hinzufügen
  if (
    window.innerWidth <= 780 &&
    !document.getElementById("dropdown-help-link")
  ) {
    const helpLink = document.createElement("a");
    helpLink.id = "dropdown-help-link";
    helpLink.href = "help.html";
    helpLink.textContent = "Help";
    helpLink.className = "dropdown-help-mobile";
    dropdown.insertBefore(helpLink, dropdown.firstChild);
  }

  dropdown.classList.toggle("active");
}


/**
 * Schließt das Dropdown-Menü bei Klick außerhalb
 * @param {Event} event - Das Click-Event
 */
function handleClickOutside(event) {
  const dropdown = document.getElementById("user-dropdown");
  const userInitials = document.getElementById("user-initials");
  if (
    dropdown &&
    dropdown.classList.contains("active") &&
    !userInitials.contains(event.target) &&
    !dropdown.contains(event.target)
  ) {
    dropdown.classList.remove("active");
  }
}


/**
 * Meldet den Benutzer ab und leitet zur Login-Seite weiter
 */
async function handleLogout() {
  await waitForFirebase();
  await logoutUser();
  window.location.href = "index.html";
}


/**
 * Richtet den Event-Listener für Klicks außerhalb des Menüs ein
 */
function setupClickOutsideListener() {
  document.addEventListener("click", handleClickOutside);
}

document.addEventListener("DOMContentLoaded", setupClickOutsideListener);
