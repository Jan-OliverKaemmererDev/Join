/**
 * Initialisiert die Signup-Seite
 */
function initSignup() {
  checkFormValidity();
}

/**
 * Überprüft die Gültigkeit des Registrierungs-Formulars
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
 * Verarbeitet die Benutzerregistrierung
 * @param {Event} event - Das Submit-Event des Formulars
 */
async function handleRegistration(event) {
  event.preventDefault();
  await waitForFirebase();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-password").value;
  if (pass !== confirm) {
    showPasswordError();
    return;
  }
  const result = await signUpUser(name, email, pass);
  if (result.success) {
    console.log("Benutzer erfolgreich registriert:", email);
    showSuccessMessageAndRedirect();
  } else {
    console.error("Registrierungsfehler:", result.error, result.message);
    handleRegistrationError(result);
  }
}

/**
 * Zeigt eine Passwort-Fehlermeldung an
 */
function showPasswordError() {
  const errorMsg = document.getElementById("error-message");
  const confirmPassInput = document.getElementById("confirm-password");

  if (errorMsg) {
    errorMsg.classList.remove("d-none");
  }
  confirmPassInput.classList.add("input-error");

  const resetError = () => {
    if (errorMsg) errorMsg.classList.add("d-none");
    confirmPassInput.classList.remove("input-error");
    confirmPassInput.removeEventListener("input", resetError);
  };
  confirmPassInput.addEventListener("input", resetError);
}

/**
 * Verarbeitet Registrierungsfehler und zeigt entsprechende Meldungen
 * @param {Object} result - Das Ergebnis-Objekt mit error und message
 */
function handleRegistrationError(result) {
  const errorMsg = document.getElementById("error-message");
  const emailInput = document.getElementById("email");

  if (errorMsg) {
    errorMsg.textContent = result.message;
    errorMsg.classList.remove("d-none");
  }

  if (result.error === "duplicate-email" || result.error === "invalid-email") {
    emailInput.classList.add("input-error");
  }

  const resetError = () => {
    if (errorMsg) errorMsg.classList.add("d-none");
    emailInput.classList.remove("input-error");
    emailInput.removeEventListener("input", resetError);
  };
  emailInput.addEventListener("input", resetError);
}

/**
 * Zeigt eine Erfolgsmeldung an und leitet zur Login-Seite weiter
 */
function showSuccessMessageAndRedirect() {
  const msg = document.getElementById("success-message");
  msg.classList.remove("d-none");
  setTimeout(function () {
    window.location.href = "index.html";
  }, 800);
}
