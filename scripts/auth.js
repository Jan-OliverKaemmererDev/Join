const STORAGE_KEYS = {
  USERS: "join_users",
  CURRENT_USER: "join_current_user",
  GUEST_ACCOUNT: "join_guest_initialized",
};

const GUEST_USER = {
  id: "guest",
  name: "Gast",
  email: "guest@join.com",
  isGuest: true,
};

/**
 * Initialisiert das Authentifizierungssystem
 */
function initAuth() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GUEST_ACCOUNT)) {
    localStorage.setItem(STORAGE_KEYS.GUEST_ACCOUNT, "true");
    console.log("Guest account initialized");
  }
}

/**
 * Ruft alle registrierten Benutzer ab
 * @returns {Array} Array mit allen Benutzern
 */
function getUsers() {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * Speichert Benutzer im LocalStorage
 * @param {Array} users - Array mit Benutzern
 */
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Prüft ob eine E-Mail bereits existiert
 * @param {Array} users - Array mit Benutzern
 * @param {string} email - Die zu prüfende E-Mail-Adresse
 * @returns {boolean} True wenn E-Mail existiert
 */
function emailExists(users, email) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      return true;
    }
  }
  return false;
}

/**
 * Registriert einen neuen Benutzer
 * @param {string} name - Der Name des Benutzers
 * @param {string} email - Die E-Mail-Adresse
 * @param {string} password - Das Passwort
 * @returns {Object} Ergebnis-Objekt mit success und message
 */
function signUpUser(name, email, password) {
  try {
    const users = getUsers();
    if (emailExists(users, email)) {
      return createErrorResult(
        "duplicate-email",
        "Diese E-Mail-Adresse ist bereits registriert",
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResult("invalid-email", "Ungültige E-Mail-Adresse");
    }
    if (password.length < 6) {
      return createErrorResult(
        "weak-password",
        "Das Passwort ist zu schwach (mindestens 6 Zeichen)",
      );
    }
    const newUser = createNewUser(name, email, password);
    users.push(newUser);
    saveUsers(users);
    console.log("User registered successfully:", email);
    return { success: true, message: "Registrierung erfolgreich" };
  } catch (error) {
    console.error("Signup error:", error);
    return createErrorResult(
      "unknown",
      "Ein Fehler ist aufgetreten: " + error.message,
    );
  }
}

/**
 * Erstellt ein neues Benutzer-Objekt
 * @param {string} name - Der Name des Benutzers
 * @param {string} email - Die E-Mail-Adresse
 * @param {string} password - Das Passwort
 * @returns {Object} Das neue Benutzer-Objekt
 */
function createNewUser(name, email, password) {
  return {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: password,
    createdAt: new Date().toISOString(),
    isGuest: false,
  };
}

/**
 * Erstellt ein Fehler-Ergebnis-Objekt
 * @param {string} error - Der Fehlertyp
 * @param {string} message - Die Fehlermeldung
 * @returns {Object} Das Fehler-Objekt
 */
function createErrorResult(error, message) {
  return { success: false, error: error, message: message };
}

/**
 * Sucht einen Benutzer anhand der E-Mail-Adresse
 * @param {Array} users - Array mit Benutzern
 * @param {string} email - Die gesuchte E-Mail-Adresse
 * @returns {Object|null} Der gefundene Benutzer oder null
 */
function findUserByEmail(users, email) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      return users[i];
    }
  }
  return null;
}

/**
 * Meldet einen Benutzer an
 * @param {string} email - Die E-Mail-Adresse
 * @param {string} password - Das Passwort
 * @returns {Object} Ergebnis-Objekt mit success und user
 */
function loginUser(email, password) {
  try {
    const users = getUsers();
    const user = findUserByEmail(users, email);
    if (!user) {
      return createErrorResult("user-not-found", "Benutzer nicht gefunden");
    }
    if (user.password !== password) {
      return createErrorResult("wrong-password", "Falsches Passwort");
    }
    const sessionUser = createSessionUser(user);
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(sessionUser),
    );
    sessionStorage.setItem("showJoinGreeting", "true");
    console.log("User logged in:", email);
    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Login error:", error);
    return createErrorResult(
      "unknown",
      "Ein Fehler ist aufgetreten: " + error.message,
    );
  }
}

/**
 * Erstellt ein Session-User-Objekt ohne sensible Daten
 * @param {Object} user - Das vollständige Benutzer-Objekt
 * @returns {Object} Das Session-User-Objekt
 */
function createSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isGuest: false,
  };
}

/**
 * Meldet einen Gast-Benutzer an
 * @returns {Object} Ergebnis-Objekt mit success und user
 */
function guestLoginUser() {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
    sessionStorage.setItem("showJoinGreeting", "true");
    console.log("Guest logged in");
    return { success: true, user: GUEST_USER };
  } catch (error) {
    console.error("Guest login error:", error);
    return createErrorResult(
      "unknown",
      "Ein Fehler ist aufgetreten: " + error.message,
    );
  }
}

/**
 * Ruft den aktuell angemeldeten Benutzer ab
 * @returns {Object|null} Der aktuelle Benutzer oder null
 */
function getCurrentUser() {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Meldet den aktuellen Benutzer ab
 */
function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  console.log("User logged out");
}

/**
 * Prüft ob ein Benutzer angemeldet ist
 * @returns {boolean} True wenn ein Benutzer angemeldet ist
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

initAuth();
