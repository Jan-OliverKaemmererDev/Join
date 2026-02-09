/**
 * auth.js
 * Local Storage-based Authentication System
 *
 * This module provides authentication functionality using browser Local Storage.
 * Note: This is suitable for testing/development only, not for production use.
 */

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
 * Initialize authentication system
 * Creates default guest account if not exists
 */
function initAuth() {
  // Initialize users array if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }

  // Create guest account marker (guest login doesn't require stored account)
  if (!localStorage.getItem(STORAGE_KEYS.GUEST_ACCOUNT)) {
    localStorage.setItem(STORAGE_KEYS.GUEST_ACCOUNT, "true");
    console.log("Guest account initialized");
  }
}

/**
 * Get all registered users from Local Storage
 * @returns {Array} Array of user objects
 */
function getUsers() {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * Save users array to Local Storage
 * @param {Array} users - Array of user objects
 */
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Register a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} Result object with success status and message
 */
function signUpUser(name, email, password) {
  try {
    const users = getUsers();

    // Check if email already exists
    if (
      users.some((user) => user.email.toLowerCase() === email.toLowerCase())
    ) {
      return {
        success: false,
        error: "duplicate-email",
        message: "Diese E-Mail-Adresse ist bereits registriert",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "invalid-email",
        message: "Ungültige E-Mail-Adresse",
      };
    }

    // Validate password length
    if (password.length < 6) {
      return {
        success: false,
        error: "weak-password",
        message: "Das Passwort ist zu schwach (mindestens 6 Zeichen)",
      };
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(), // Simple ID generation
      name: name,
      email: email,
      password: password, // Note: In production, this should be hashed!
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    // Add user and save
    users.push(newUser);
    saveUsers(users);

    console.log("User registered successfully:", email);

    return {
      success: true,
      message: "Registrierung erfolgreich",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "unknown",
      message: "Ein Fehler ist aufgetreten: " + error.message,
    };
  }
}

/**
 * Authenticate user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} Result object with success status and user data
 */
function loginUser(email, password) {
  try {
    const users = getUsers();

    // Find user by email
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      return {
        success: false,
        error: "user-not-found",
        message: "Benutzer nicht gefunden",
      };
    }

    // Check password
    if (user.password !== password) {
      return {
        success: false,
        error: "wrong-password",
        message: "Falsches Passwort",
      };
    }

    // Create session
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isGuest: false,
    };

    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(sessionUser),
    );
    console.log("User logged in:", email);

    return {
      success: true,
      user: sessionUser,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "unknown",
      message: "Ein Fehler ist aufgetreten: " + error.message,
    };
  }
}

/**
 * Log in as guest (no credentials required)
 * @returns {Object} Result object with success status and guest user data
 */
function guestLoginUser() {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
    console.log("Guest logged in");

    return {
      success: true,
      user: GUEST_USER,
    };
  } catch (error) {
    console.error("Guest login error:", error);
    return {
      success: false,
      error: "unknown",
      message: "Ein Fehler ist aufgetreten: " + error.message,
    };
  }
}

/**
 * Get currently logged in user
 * @returns {Object|null} Current user object or null if not logged in
 */
function getCurrentUser() {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Log out current user
 */
function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  console.log("User logged out");
}

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user is logged in
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Initialize auth system when script loads
initAuth();
