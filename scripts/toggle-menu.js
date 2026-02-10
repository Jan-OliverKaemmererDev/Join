function getInitialsFromName(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement && user) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

function displayUserInitials(name) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement && name) {
    const initials = getInitialsFromName(name);
    initialsElement.textContent = initials;
  }
}

function displayGuestInitials() {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    initialsElement.textContent = "G";
  }
}

function initSideMenu(page) {
  console.log("Side menu initialized for page:", page);
}
