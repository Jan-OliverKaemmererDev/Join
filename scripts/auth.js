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

function initAuth() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GUEST_ACCOUNT)) {
    localStorage.setItem(STORAGE_KEYS.GUEST_ACCOUNT, "true");
    console.log("Guest account initialized");
  }
}

function getUsers() {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersJson ? JSON.parse(usersJson) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function emailExists(users, email) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function signUpUser(name, email, password) {
  try {
    const users = getUsers();
    if (emailExists(users, email)) {
      return createErrorResult("duplicate-email", "Diese E-Mail-Adresse ist bereits registriert");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResult("invalid-email", "Ungültige E-Mail-Adresse");
    }
    if (password.length < 6) {
      return createErrorResult("weak-password", "Das Passwort ist zu schwach (mindestens 6 Zeichen)");
    }
    const newUser = createNewUser(name, email, password);
    users.push(newUser);
    saveUsers(users);
    console.log("User registered successfully:", email);
    return { success: true, message: "Registrierung erfolgreich" };
  } catch (error) {
    console.error("Signup error:", error);
    return createErrorResult("unknown", "Ein Fehler ist aufgetreten: " + error.message);
  }
}

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

function createErrorResult(error, message) {
  return { success: false, error: error, message: message };
}

function findUserByEmail(users, email) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email.toLowerCase()) {
      return users[i];
    }
  }
  return null;
}

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
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
    console.log("User logged in:", email);
    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Login error:", error);
    return createErrorResult("unknown", "Ein Fehler ist aufgetreten: " + error.message);
  }
}

function createSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isGuest: false,
  };
}

function guestLoginUser() {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
    console.log("Guest logged in");
    return { success: true, user: GUEST_USER };
  } catch (error) {
    console.error("Guest login error:", error);
    return createErrorResult("unknown", "Ein Fehler ist aufgetreten: " + error.message);
  }
}

function getCurrentUser() {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  console.log("User logged out");
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

initAuth();
