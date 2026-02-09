/**
 * utils.js
 * Shared utility functions used across multiple pages
 */

/**
 * Gets initials from a full name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
function getInitialsFromName(name) {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    // Single name: take first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple names: take first letter of first and last name
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

/**
 * Updates user initials in the header
 * @param {Object} user - Current user object
 */
function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement && user) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Displays user initials in the header
 * @param {string} name - User's full name
 */
function displayUserInitials(name) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement && name) {
    const initials = getInitialsFromName(name);
    initialsElement.textContent = initials;
  }
}

/**
 * Displays guest initials in the header
 */
function displayGuestInitials() {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    initialsElement.textContent = "G";
  }
}

/**
 * Initializes the side menu (placeholder for future functionality)
 * @param {string} page - Current page name
 */
function initSideMenu(page) {
  // This function can be used for highlighting active menu items
  // Currently, active state is handled via classes in HTML
  console.log("Side menu initialized for page:", page);
}
