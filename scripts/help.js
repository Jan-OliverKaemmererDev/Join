function initHelp() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateHeaderInitials(currentUser);
  } else {
    const initialsElement = document.getElementById("user-initials");
    if (initialsElement) initialsElement.textContent = "G";
  }
}

function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

function getInitialsFromName(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
