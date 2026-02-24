/**
 * Initialisiert die Login-Seite
 */
function initLogin() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("password-toggle");

  passwordInput.addEventListener("input", function () {
    const hasValue = this.value.length > 0;
    // Schloss -> Auge tauschen sobald Text eingegeben wird
    if (hasValue) {
      toggleIcon.src = "./assets/login-screen/visibility_off.svg";
    } else {
      toggleIcon.src = "./assets/login-screen/lock.svg";
      // Passwort wieder verstecken wenn Feld geleert wird
      this.type = "password";
    }
  });
}

/**
 * Verarbeitet den Login-Vorgang
 * @param {Event} event - Das Submit-Event des Login-Formulars
 */
async function handleLogin(event) {
  event.preventDefault();
  await waitForFirebase();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const result = await loginUser(email, password);
  if (result.success) {
    console.log("Login erfolgreich:", result.user.name);
    window.location.href = "summaryuser.html";
  } else {
    showLoginError(result.message);
  }
}

/**
 * Führt einen Gast-Login durch
 */
async function guestLogin() {
  await waitForFirebase();
  const result = await guestLoginUser();
  if (result.success) {
    console.log("Gast-Login erfolgreich");
    window.location.href = "summaryguest.html";
  } else {
    showLoginError(result.message);
  }
}

/**
 * Zeigt eine Login-Fehlermeldung an
 * @param {string} message - Die anzuzeigende Fehlermeldung
 */
function showLoginError(message) {
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
  setTimeout(function () {
    errorMsg.style.display = "none";
  }, 5000);
}

/**
 * Schaltet die Sichtbarkeit des Passworts um
 * @param {string} inputId - Die ID des Passwort-Input-Feldes
 * @param {HTMLElement} iconElement - Das Icon-Element für die Sichtbarkeit
 */
function togglePasswordVisibility(inputId, iconElement) {
  const input = document.getElementById(inputId);
  // Nur reagieren wenn Text vorhanden (sonst ist es das Schloss)
  if (input.value.length === 0) return;

  if (input.type === "password") {
    input.type = "text";
    iconElement.src = "./assets/login-screen/visibility.svg"; // offenes Auge
  } else {
    input.type = "password";
    iconElement.src = "./assets/login-screen/visibility_off.svg"; // geschlossenes Auge
  }
}

/**
 * Initialisiert die Summary-Seite für angemeldete Benutzer
 */
function initSummary() {
  initSideMenu("summary");
  const currentUser = getCurrentUser();
  if (currentUser) {
    displayUserInitials(currentUser.name);
  } else {
    window.location.href = "index.html";
  }
}

/**
 * Initialisiert die Summary-Seite für Gast-Benutzer
 */
async function initSummaryGuest() {
  await waitForFirebase();
  initSideMenu("summary");
  displayGuestInitials();
  updateGreeting();
  await updateTaskMetrics(GUEST_USER);
  checkMobileGreeting();
}
