/**
 * Initialisiert die Signup-Seite
 */
function initSignup() {
  checkFormValidity();
}

/**
 * Zeigt oder versteckt einen Hinweis unter einem Input-Feld.
 * @param {string} inputId - ID des Input-Elements
 * @param {string|null} message - Nachricht oder null zum Ausblenden
 */
function setFieldHint(inputId, message) {
  const input = document.getElementById(inputId);
  const hint = document.getElementById("hint-" + inputId);
  if (!input || !hint) return;

  if (message) {
    input.classList.add("input-error");
    hint.textContent = message;
    hint.style.display = "block";
  } else {
    input.classList.remove("input-error");
    hint.textContent = "";
    hint.style.display = "none";
  }
}

/**
 * Liest alle Formularwerte der Registrierungsseite aus
 * @returns {Object} Objekt mit name, email, pass, confirm, privacy
 */
function getSignupFormValues() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    pass: document.getElementById("password").value,
    confirm: document.getElementById("confirm-password").value,
    privacy: document.getElementById("privacy-check").checked,
  };
}

/**
 * Validiert alle Felder des Registrierungsformulars
 * @param {string} name - Der eingegebene Name
 * @param {string} email - Die eingegebene E-Mail
 * @param {string} pass - Das eingegebene Passwort
 * @param {string} confirm - Die Passwortbestätigung
 * @returns {Object} Objekt mit nameValid, emailValid, passValid, confirmComplete
 */
function validateSignupFields(name, email, pass, confirm) {
  const nameLetters = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "");
  return {
    nameValid: nameLetters.length >= 3,
    emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email),
    passValid: pass.length >= 6,
    confirmComplete: confirm.length >= 1 && pass === confirm,
  };
}

/**
 * Zeigt Validierungshinweise für gefüllte Felder an
 * @param {Object} values - Die Formularwerte
 * @param {Object} validity - Die Validierungsergebnisse
 */
function showSignupFieldHints(values, validity) {
  if (values.name.length > 0) {
    setFieldHint(
      "name",
      validity.nameValid ? null : "Der Name muss mindestens 3 Buchstaben enthalten.",
    );
  } else {
    setFieldHint("name", null);
  }

  if (values.email.length > 0) {
    setFieldHint(
      "email",
      validity.emailValid ? null : "Bitte eine gültige E-Mail-Adresse eingeben.",
    );
  } else {
    setFieldHint("email", null);
  }

  if (values.pass.length > 0) {
    setFieldHint(
      "password",
      validity.passValid ? null : "Das Passwort muss mindestens 6 Zeichen lang sein.",
    );
  } else {
    setFieldHint("password", null);
  }

  if (values.confirm.length > 0) {
    setFieldHint(
      "confirm-password",
      values.pass === values.confirm ? null : "Die Passwörter stimmen nicht überein.",
    );
  } else {
    setFieldHint("confirm-password", null);
  }
}

/**
 * Aktiviert oder deaktiviert den Submit-Button
 * @param {boolean} allValid - True wenn alle Felder gültig sind
 */
function updateSignupSubmitButton(allValid) {
  const btn = document.getElementById("signup-btn");
  btn.disabled = !allValid;
  btn.classList.toggle("btn-disabled", !allValid);
}

/**
 * Überprüft die Gültigkeit des Registrierungs-Formulars und zeigt Hinweise nur an, wenn die Felder bereits ausgefüllt wurden
 */
function checkFormValidity() {
  const values = getSignupFormValues();
  const validity = validateSignupFields(
    values.name,
    values.email,
    values.pass,
    values.confirm,
  );
  showSignupFieldHints(values, validity);
  const allValid =
    validity.nameValid &&
    validity.emailValid &&
    validity.passValid &&
    validity.confirmComplete &&
    values.privacy;
  updateSignupSubmitButton(allValid);
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
    errorMsg.classList.remove("v-none");
  }
  confirmPassInput.classList.add("input-error");

  const resetError = () => {
    if (errorMsg) errorMsg.classList.add("v-none");
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
    errorMsg.classList.remove("v-none");
  }

  if (result.error === "duplicate-email" || result.error === "invalid-email") {
    emailInput.classList.add("input-error");
  }

  const resetError = () => {
    if (errorMsg) errorMsg.classList.add("v-none");
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
