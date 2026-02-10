function initSideMenu(currentPage) {
  const navLinks = document.querySelectorAll(".sidebar .nav-links a");
  for (let i = 0; i < navLinks.length; i++) {
    processNavLink(navLinks[i], currentPage);
  }
}

function processNavLink(link, currentPage) {
  link.classList.remove("active");
  const href = link.getAttribute("href");
  if (href && href.includes(currentPage)) {
    link.classList.add("active");
  }
}

function navigateTo(pageName) {
  window.location.href = pageName;
}

function displayUserInitials(username) {
  const initialsElement = document.getElementById("user-initials");
  if (!initialsElement || !username) return;
  const nameParts = username.trim().split(" ");
  let initials = "";
  if (nameParts.length >= 2) {
    initials = nameParts[0][0] + nameParts[1][0];
  } else if (nameParts.length === 1) {
    initials = nameParts[0][0];
  }
  initialsElement.textContent = initials.toUpperCase();
}

function displayGuestInitials() {
  const initialsElement = document.getElementById("user-initials");
  if (!initialsElement) return;
  initialsElement.textContent = "G";
  initialsElement.classList.add("guest-avatar");
}
