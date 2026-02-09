/**
 * help.js
 */

/**
 * Initializes the help page
 */
function initHelp() {
  // Load current user data
  const currentUser = getCurrentUser();

  if (currentUser) {
    updateHeaderInitials(currentUser);
  } else {
    // If not logged in, we can still show help but maybe hide initials or show guest one
    const initialsElement = document.getElementById("user-initials");
    if (initialsElement) initialsElement.textContent = "G";
  }
}

/**
 * Updates user initials in the header
 * @param {Object} user - Current user object
 */
function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Gets initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitialsFromName(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
