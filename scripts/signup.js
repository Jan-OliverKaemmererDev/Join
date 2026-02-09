/**
 * signup.js
 * Contains all functions related to user registration
 */

/**
 * Initialisiert die Registrierungsseite
 */
function initSignup() {
  checkFormValidity();
}

/**
 * Prüft, ob alle Felder ausgefüllt sind und die Privacy Policy akzeptiert wurde
 * Aktiviert/Deaktiviert den Registrierungs-Button
 */
function checkFormValidity() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-password").value;
  const privacy = document.getElementById("privacy-check").checked;
  const btn = document.getElementById("signup-btn");

  btn.disabled = !(name && email && pass && confirm && privacy);
}

/**
 * Hauptfunktion für den Registrierungsprozess mit Local Storage
 * @param {Event} event - Das Form-Submit Event
 */
async function handleRegistration(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-password").value;

  // Passwort-Übereinstimmung prüfen
  if (pass !== confirm) {
    showPasswordError();
    return;
  }

  // Benutzer in Local Storage registrieren
  const result = signUpUser(name, email, pass);

  if (result.success) {
    console.log("Benutzer erfolgreich registriert:", email);
    // Erfolgsmeldung anzeigen und weiterleiten
    showSuccessMessageAndRedirect();
  } else {
    console.error("Registrierungsfehler:", result.error, result.message);
    handleRegistrationError(result);
  }
}

/**
 * Zeigt eine Fehlermeldung bei ungleichen Passworten
 */
function showPasswordError() {
  const errorMsg = document.getElementById("error-message");
  errorMsg.classList.remove("d-none");
}

/**
 * Behandelt Registrierungsfehler und zeigt benutzerfreundliche Meldungen
 * @param {Object} result - Result Objekt von signUpUser()
 */
function handleRegistrationError(result) {
  const errorMsg = document.getElementById("error-message");

  // Fehlermeldungen basierend auf Fehlertyp
  switch (result.error) {
    case "duplicate-email":
      errorMsg.textContent = result.message;
      break;
    case "weak-password":
      errorMsg.textContent = result.message;
      break;
    case "invalid-email":
      errorMsg.textContent = result.message;
      break;
    default:
      errorMsg.textContent = "Fehler bei der Registrierung: " + result.message;
  }

  errorMsg.classList.remove("d-none");
}

/**
 * Zeigt die Erfolgsmeldung und leitet nach 3 Sekunden zur Login-Seite weiter
 */
function showSuccessMessageAndRedirect() {
  const msg = document.getElementById("success-message");
  msg.classList.remove("d-none");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 3000);
}
