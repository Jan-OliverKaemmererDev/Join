/**
 * Initialisiert die Login-Seite
 */
function initLogin() {
  // Login-Seite Initialisierung
}

/**
 * Behandelt Login-Prozess mit Local Storage
 */
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Login mit Local Storage
  const result = loginUser(email, password);

  if (result.success) {
    console.log("Login erfolgreich:", result.user.name);
    window.location.href = "summaryuser.html";
  } else {
    // Fehlermeldung anzeigen
    showLoginError(result.message);
  }
}

/**
 * Loggt den Benutzer als Gast ein
 */
function guestLogin() {
  const result = guestLoginUser();

  if (result.success) {
    console.log("Gast-Login erfolgreich");
    window.location.href = "summaryguest.html";
  } else {
    showLoginError(result.message);
  }
}

/**
 * Zeigt eine Fehlermeldung beim Login an
 * @param {string} message - Die Fehlermeldung
 */
function showLoginError(message) {
  // Erstelle Fehlermeldung, falls noch nicht vorhanden
  let errorMsg = document.getElementById("login-error");
  if (!errorMsg) {
    errorMsg = document.createElement("div");
    errorMsg.id = "login-error";
    errorMsg.className = "error-message";
    errorMsg.style.color = "red";
    errorMsg.style.marginTop = "10px";
    errorMsg.style.textAlign = "center";

    const form = document.querySelector("form");
    form.appendChild(errorMsg);
  }

  errorMsg.textContent = message;
  errorMsg.style.display = "block";

  // Fehlermeldung nach 5 Sekunden ausblenden
  setTimeout(() => {
    errorMsg.style.display = "none";
  }, 5000);
}

/**
 * Schaltet die Sichtbarkeit des Passworts um und wechselt das Icon
 * @param {string} inputId - Die ID des Input-Feldes (password oder confirm-password)
 * @param {HTMLElement} iconElement - Das geklickte Icon-Element
 */
function togglePasswordVisibility(inputId, iconElement) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    iconElement.src = "./assets/login-screen/visibility.svg";
  } else {
    input.type = "password";
    iconElement.src = "./assets/login-screen/visibility_off.svg";
  }
}

/**
 * Initialisiert die Summary-Seite für eingeloggte Benutzer
 */
function initSummary() {
  initSideMenu("summary");

  // Benutzerdaten aus Local Storage laden
  const currentUser = getCurrentUser();

  if (currentUser) {
    displayUserInitials(currentUser.name);
  } else {
    // Falls kein Benutzer eingeloggt ist, zurück zum Login
    window.location.href = "index.html";
  }
}

/**
 * Initialisiert die Summary-Seite für Gäste
 */
function initSummaryGuest() {
  initSideMenu("summary");
  displayGuestInitials();
}
