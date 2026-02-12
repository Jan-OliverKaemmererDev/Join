function initLegalNotice() {
  const urlParams = new URLSearchParams(window.location.search);
  const isPublic = urlParams.get("public") === "true";
  const currentUser = getCurrentUser();

  if (isPublic || !currentUser || (currentUser && currentUser.isGuest)) {
    const sidebar = document.querySelector(".sidebar");
    const headerIcons = document.getElementById("header-icons");

    sidebar.innerHTML = `
      <img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" />
      <div class="nav-links">
        <a href="index.html" class="guest-nav-link">
          <img src="./assets/icons/login-mobile.png" alt="Log In" class="login-icon">
        </a>
        <span class="empty-space"></span>
        <a href="privacypolicy.html?public=true" class="guest-nav-link guest-text-only">
          <span>Privacy Policy</span>
        </a>
        <a href="legalnotice.html?public=true" class="active guest-nav-link guest-text-only">
          <span>Legal Notice</span>
        </a>
      </div>
      <div class="legal-links"></div>
    `;

    // Sidebar sichtbar machen nach Änderung
    setTimeout(() => {
      sidebar.classList.add("loaded");
    }, 0);

    if (headerIcons) headerIcons.style.display = "none";
  } else {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.add("loaded");

    if (currentUser.isGuest) {
      displayGuestInitials();
    } else {
      displayUserInitials(currentUser.name);
    }
  }

  addBackButtonListener();
}

function addBackButtonListener() {
  const h1Element = document.querySelector(".legal-notice-container h1");
  if (h1Element) {
    h1Element.style.cursor = "pointer";
    h1Element.addEventListener("click", function () {
      window.history.back();
    });
  }
}
