/**
 * user-menu.js
 * Handles the user dropdown menu functionality
 */

/**
 * Toggles the user dropdown menu
 */
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");
  dropdown.classList.toggle("active");
}

/**
 * Closes the user menu when clicking outside
 */
function handleClickOutside(event) {
  const dropdown = document.getElementById("user-dropdown");
  const userInitials = document.getElementById("user-initials");

  if (
    dropdown &&
    dropdown.classList.contains("active") &&
    !userInitials.contains(event.target) &&
    !dropdown.contains(event.target)
  ) {
    dropdown.classList.remove("active");
  }
}

/**
 * Handles user logout
 */
function handleLogout() {
  logoutUser();
  window.location.href = "index.html";
}

// Add click outside listener when page loads
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", handleClickOutside);
});
