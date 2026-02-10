function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");
  dropdown.classList.toggle("active");
}

function handleClickOutside(event) {
  const dropdown = document.getElementById("user-dropdown");
  const userInitials = document.getElementById("user-initials");
  if (dropdown && dropdown.classList.contains("active") &&
      !userInitials.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.remove("active");
  }
}

function handleLogout() {
  logoutUser();
  window.location.href = "index.html";
}

function setupClickOutsideListener() {
  document.addEventListener("click", handleClickOutside);
}

document.addEventListener("DOMContentLoaded", setupClickOutsideListener);
