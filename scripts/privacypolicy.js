function initPrivacyPolicy() {
  const urlParams = new URLSearchParams(window.location.search);
  const isPublic = urlParams.get("public") === "true";
  const currentUser = getCurrentUser();

  if (isPublic || !currentUser) {
    const sidebar = document.querySelector(".sidebar");
    const headerIcons = document.getElementById("header-icons");

    sidebar.innerHTML = `
      <img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" class="sidebar-logo"/>
      
      <div class="sidebar-content-wrapper">
      
          <div class="nav-links">
            <a href="index.html" class="login-link">
              <img src="./assets/privacy-policy-page/back-to-login.svg" alt="Log In" class="back-arrow-icon">
              <span class="login-text">Log In</span>
            </a>
          </div>
          
          <div class="legal-links">
            <a href="privacypolicy.html" class="${window.location.pathname.includes("privacypolicy") ? "active" : ""}">Privacy Policy</a>
            <a href="legalnotice.html" class="${window.location.pathname.includes("legalnotice") ? "active" : ""}">Legal notice</a>
          </div>
          
      </div>
    `;

    const contentTitle = document.querySelector("h1");
    if (contentTitle) {
      // Prüfen, ob Pfeil schon da ist, um Dopplung zu vermeiden
      if (!contentTitle.querySelector(".mobile-back-arrow")) {
        contentTitle.innerHTML += `
            <a href="index.html" class="mobile-back-arrow">
              <img src="./assets/icons/arrow-left-blue.png" alt="Back">
            </a>
          `;
      }
    }

    if (headerIcons) headerIcons.style.display = "none";
  } else {
    document.body.classList.add("is-logged-in");
    if (currentUser.isGuest) {
      displayGuestInitials();
    } else {
      displayUserInitials(currentUser.name);
    }
  }
}
