/**
 * Wartet darauf, dass Firebase initialisiert ist
 * @returns {Promise} Wird aufgelöst, wenn Firebase bereit ist
 */
function waitForFirebase() {
  return new Promise(function (resolve) {
    if (window.firebaseReady) {
      resolve();
      return;
    }
    window.addEventListener("firebaseReady", function () {
      resolve();
    });
  });
}

/**
 * Registriert einen neuen Benutzer über Firebase Authentication
 * @param {string} name - Der Name des Benutzers
 * @param {string} email - Die E-Mail-Adresse
 * @param {string} password - Das Passwort
 * @returns {Object} Ergebnis-Objekt mit success und message
 */
async function signUpUser(name, email, password) {
  try {
    const userCredential = await window.fbCreateUser(
      window.firebaseAuth,
      email,
      password,
    );
    const user = userCredential.user;
    await window.fbUpdateProfile(user, { displayName: name });

    const batch = window.fbWriteBatch(window.firebaseDb);
    await Promise.all([
      saveUserProfile(user.uid, name, email, batch),
      initDefaultContacts(user.uid, batch),
      initDefaultTasks(user.uid, batch),
    ]);
    await batch.commit();

    console.log("User registered successfully:", email);
    return { success: true, message: "Registrierung erfolgreich" };
  } catch (error) {
    console.error("Signup error:", error);
    return handleFirebaseError(error);
  }
}

/**
 * Speichert das Benutzerprofil in Firestore
 * @param {string} uid - Die Firebase User-ID
 * @param {string} name - Der Name des Benutzers
 * @param {string} email - Die E-Mail-Adresse
 */
async function saveUserProfile(uid, name, email, batch) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const data = {
    name: name,
    email: email,
    isGuest: false,
    createdAt: new Date().toISOString(),
  };
  if (batch) {
    batch.set(userRef, data);
  } else {
    await window.fbSetDoc(userRef, data);
  }
}

/**
 * Schreibt die Standard-Kontakte für einen neuen Benutzer in Firestore
 * @param {string} uid - Die Firebase User-ID
 */
async function initDefaultContacts(uid, batch) {
  for (let i = 0; i < DEFAULT_CONTACTS.length; i++) {
    const contact = DEFAULT_CONTACTS[i];
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      uid,
      "contacts",
      String(contact.id),
    );
    if (batch) {
      batch.set(contactRef, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        color: contact.color,
        initials: contact.initials,
      });
    } else {
      await window.fbSetDoc(contactRef, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        color: contact.color,
        initials: contact.initials,
      });
    }
  }
}

/**
 * Schreibt die Standard-Tasks für einen neuen Benutzer (oder Gast) in Firestore
 * @param {string} uid - Die Firebase User-ID
 */
async function initDefaultTasks(uid, batch) {
  for (let i = 0; i < DEFAULT_TASKS.length; i++) {
    const task = DEFAULT_TASKS[i];
    const taskRef = window.fbDoc(
      window.firebaseDb,
      "users",
      uid,
      "tasks",
      String(task.id),
    );
    if (batch) {
      batch.set(taskRef, task);
    } else {
      await window.fbSetDoc(taskRef, task);
    }
  }
}

/**
 * Meldet einen Benutzer über Firebase Authentication an
 * @param {string} email - Die E-Mail-Adresse
 * @param {string} password - Das Passwort
 * @returns {Object} Ergebnis-Objekt mit success und user
 */
async function loginUser(email, password) {
  try {
    const userCredential = await window.fbSignIn(
      window.firebaseAuth,
      email,
      password,
    );
    const user = userCredential.user;
    const profile = await loadUserProfile(user.uid);
    const userName =
      profile.name !== "User" ? profile.name : user.displayName || profile.name;
    const userEmail = profile.email || user.email;
    if (profile.name === "User" || !profile.email) {
      const batch = window.fbWriteBatch(window.firebaseDb);
      await Promise.all([
        saveUserProfile(user.uid, userName, userEmail, batch),
        initDefaultContacts(user.uid, batch),
        initDefaultTasks(user.uid, batch),
      ]);
      await batch.commit();
    }
    const sessionUser = {
      id: user.uid,
      name: userName,
      email: userEmail,
      isGuest: false,
    };
    sessionStorage.setItem("join_current_user", JSON.stringify(sessionUser));
    sessionStorage.setItem("showJoinGreeting", "true");
    console.log("User logged in:", email);
    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Login error:", error);
    return handleFirebaseError(error);
  }
}

/**
 * Lädt das Benutzerprofil aus Firestore
 * @param {string} uid - Die Firebase User-ID
 * @returns {Object} Das Benutzerprofil
 */
async function loadUserProfile(uid) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const docSnap = await window.fbGetDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return { name: "User", email: "" };
}

/**
 * Meldet einen Gast-Benutzer über Firebase Anonymous Auth an
 * @returns {Object} Ergebnis-Objekt mit success und user
 */
async function guestLoginUser() {
  try {
    const userCredential = await window.fbSignInAnon(window.firebaseAuth);
    const user = userCredential.user;
    const guestSession = {
      id: user.uid,
      name: "Gast",
      email: "guest@join.com",
      isGuest: true,
    };
    await ensureGuestProfile(user.uid);
    sessionStorage.setItem("join_current_user", JSON.stringify(guestSession));
    sessionStorage.setItem("showJoinGreeting", "true");
    console.log("Guest logged in with uid:", user.uid);
    return { success: true, user: guestSession };
  } catch (error) {
    console.error("Guest login error:", error);
    return handleFirebaseError(error);
  }
}

/**
 * Stellt sicher, dass ein Gast-Profil in Firestore existiert
 * @param {string} uid - Die Firebase User-ID des Gasts
 */
async function ensureGuestProfile(uid) {
  const userRef = window.fbDoc(window.firebaseDb, "users", uid);
  const docSnap = await window.fbGetDoc(userRef);
  if (!docSnap.exists()) {
    const batch = window.fbWriteBatch(window.firebaseDb);
    batch.set(userRef, {
      name: "Gast",
      email: "guest@join.com",
      isGuest: true,
      createdAt: new Date().toISOString(),
    });
    await Promise.all([
      initDefaultContacts(uid, batch),
      initDefaultTasks(uid, batch),
    ]);
    await batch.commit();
  }
}

/**
 * Ruft den aktuell angemeldeten Benutzer ab
 * @returns {Object|null} Der aktuelle Benutzer oder null
 */
function getCurrentUser() {
  const userJson = sessionStorage.getItem("join_current_user");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Meldet den aktuellen Benutzer ab
 */
async function logoutUser() {
  try {
    await window.fbSignOut(window.firebaseAuth);
  } catch (error) {
    console.error("Logout error:", error);
  }
  sessionStorage.removeItem("join_current_user");
  console.log("User logged out");
}

/**
 * Prüft ob ein Benutzer angemeldet ist
 * @returns {boolean} True wenn ein Benutzer angemeldet ist
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Erstellt ein Fehler-Ergebnis-Objekt aus einem Firebase-Fehler
 * @param {Object} error - Das Firebase Error-Objekt
 * @returns {Object} Das Fehler-Objekt
 */
function handleFirebaseError(error) {
  let message = "Ein Fehler ist aufgetreten";
  let errorCode = error.code || "unknown";
  switch (error.code) {
    case "auth/email-already-in-use":
      message = "Diese E-Mail-Adresse ist bereits registriert";
      errorCode = "duplicate-email";
      break;
    case "auth/invalid-email":
      message = "Ungültige E-Mail-Adresse";
      errorCode = "invalid-email";
      break;
    case "auth/weak-password":
      message = "Das Passwort ist zu schwach (mindestens 6 Zeichen)";
      errorCode = "weak-password";
      break;
    case "auth/user-not-found":
      message = "Benutzer nicht gefunden";
      errorCode = "user-not-found";
      break;
    case "auth/wrong-password":
      message = "Falsches Passwort";
      errorCode = "wrong-password";
      break;
    case "auth/invalid-credential":
      message = "E-Mail oder Passwort ist falsch";
      errorCode = "invalid-credential";
      break;
    default:
      message = "Ein Fehler ist aufgetreten: " + error.message;
  }
  return { success: false, error: errorCode, message: message };
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
