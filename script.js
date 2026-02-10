function initLogin() {
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const result = loginUser(email, password);
  if (result.success) {
    console.log("Login erfolgreich:", result.user.name);
    window.location.href = "summaryuser.html";
  } else {
    showLoginError(result.message);
  }
}

function guestLogin() {
  const result = guestLoginUser();
  if (result.success) {
    console.log("Gast-Login erfolgreich");
    window.location.href = "summaryguest.html";
  } else {
    showLoginError(result.message);
  }
}

function showLoginError(message) {
  let errorMsg = document.getElementById("login-error");
  if (!errorMsg) {
    errorMsg = document.createElement("div");
    errorMsg.id = "login-error";
    errorMsg.className = "error-message";
    errorMsg.style.color = "red";
    errorMsg.style.marginTop = "10px";
    errorMsg.style.textAlign = "center";
    const form = document.querySelector("form");
    form.appendChild(errorMsg);
  }
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
  setTimeout(function() {
    errorMsg.style.display = "none";
  }, 5000);
}

function togglePasswordVisibility(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    iconElement.src = "./assets/login-screen/visibility.svg";
  } else {
    input.type = "password";
    iconElement.src = "./assets/login-screen/visibility_off.svg";
  }
}

function initSummary() {
  initSideMenu("summary");
  const currentUser = getCurrentUser();
  if (currentUser) {
    displayUserInitials(currentUser.name);
  } else {
    window.location.href = "index.html";
  }
}

function initSummaryGuest() {
  initSideMenu("summary");
  displayGuestInitials();
}
