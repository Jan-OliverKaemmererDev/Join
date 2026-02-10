function initLegalNotice() {
  const urlParams = new URLSearchParams(window.location.search);
  const isPublic = urlParams.get("public") === "true";
  const currentUser = getCurrentUser();

  if (isPublic || !currentUser) {
    const sidebar = document.querySelector(".sidebar");
    const headerIcons = document.getElementById("header-icons");

    sidebar.innerHTML = `
      <img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" />
      <div class="nav-links">
        <a href="index.html">
          <img src="./assets/privacy-policy-page/back-to-login.svg" alt="Log In" class="back-arrow-icon">
          Log In
        </a>
      </div>
      <div class="legal-links"></div>
    `;

    if (headerIcons) headerIcons.style.display = "none";
  } else {
    if (currentUser.isGuest) {
      displayGuestInitials();
    } else {
      displayUserInitials(currentUser.name);
    }
  }
}
