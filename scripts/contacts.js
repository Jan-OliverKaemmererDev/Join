let contacts = [];

function initContacts() {
  return (async function () {
    await waitForFirebase();
    initSideMenu("contacts");
    await loadContactsFromFirestore();
    renderContactList();
    checkUser();
  })();
}

function loadContactsFromFirestore() {
  return (async function () {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    await loadContactsFromFirestoreAsync(currentUser);
  })();
}

function populateContactsFromSnapshot(snapshot) {
  contacts = [];
  snapshot.forEach(function (doc) {
    const data = doc.data();
    data.id = doc.id;
    contacts.push(data);
  });
}

function sortContacts() {
  contacts.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

function getInitials(name) {
  const parts = name.split(" ");
  const initials = parts
    .map(function (part) {
      return part[0];
    })
    .join("");
  return initials.toUpperCase();
}

function renderContactList() {
  const list = document.getElementById("contacts-list");
  if (!list) return;
  list.innerHTML = "";
  sortContacts();
  contacts.forEach(function (contact) {
    appendContactItemToList(list, contact);
  });
}

/**
 * Fügt eine Buchstabengruppe zur Liste hinzu, falls der Anfangsbuchstabe neu ist
 * @param {HTMLElement} list - Das Listen-Element
 * @param {Object} contact - Das Kontakt-Objekt
 */
function addLetterGroupIfNeeded(list, contact) {
  const first = contact.name[0].toUpperCase();
  if (first !== getLastRenderedLetter()) {
    updateLastRenderedLetter(first);
    addLetterGroupToList(list, first);
  }
}

function appendContactItemToList(list, contact) {
  addLetterGroupIfNeeded(list, contact);
  list.innerHTML += getContactItemTemplate(contact);
}

let lastRenderedLetter = "";

function getLastRenderedLetter() {
  return lastRenderedLetter;
}

function updateLastRenderedLetter(letter) {
  lastRenderedLetter = letter;
}

function addLetterGroupToList(list, letter) {
  list.innerHTML +=
    getContactGroupLetterTemplate(letter) + getSeparatorLineTemplate();
}

function findContactById(id) {
  const found = contacts.find(function (c) {
    return String(c.id) === String(id);
  });
  return found || null;
}

function showContactDetails(id) {
  const contact = findContactById(id);
  if (!contact) return;
  renderContactDetailsView(contact, id);
  markActiveContact(id);
  applyContactDetailsVisibility(id);
}

function renderContactDetailsView(contact, id) {
  const content = document.getElementById("contact-details-content");
  if (window.innerWidth > 780) {
    content.innerHTML = getDesktopContactDetailsTemplate(contact);
  } else {
    content.innerHTML = getMobileContactDetailsTemplate(contact);
  }
}

function markActiveContact(id) {
  const items = document.querySelectorAll(".contact-item");
  items.forEach(function (item) {
    const isActive = item.getAttribute("data-id") === String(id);
    item.classList.toggle("active", isActive);
  });
}

function applyContactDetailsVisibility(id) {
  if (window.innerWidth <= 780) {
    applyMobileContactDetailsVisibility();
  } else {
    applyDesktopContactDetailsVisibility();
  }
}

function applyMobileContactDetailsVisibility() {
  const container = document.querySelector(".contact-details-container");
  container.classList.add("show-mobile");
}

function applyDesktopContactDetailsVisibility() {
  const container = document.getElementById("contact-details-view");
  container.classList.add("visible");
}

/**
 * Blendet die Kontakt-Detail-Container (Mobile und Desktop) aus
 */
function hideContactDetailsContainers() {
  const containerMobile = document.querySelector(".contact-details-container");
  const containerDesktop = document.getElementById("contact-details-view");
  if (containerMobile) containerMobile.classList.remove("show-mobile");
  if (containerDesktop) containerDesktop.classList.remove("visible");
}

/**
 * Leert den Inhalt der Kontakt-Detailansicht nach der CSS-Transition
 */
function clearContactDetailContent() {
  const content = document.getElementById("contact-details-content");
  if (content) {
    setTimeout(function () {
      content.innerHTML = "";
    }, 200);
  }
}

/**
 * Entfernt die aktive Markierung von allen Kontakt-Listenelementen
 */
function deactivateContactItems() {
  const items = document.querySelectorAll(".contact-item");
  items.forEach(function (item) {
    item.classList.remove("active");
  });
}

/**
 * Schließt die Kontakt-Detailansicht und entfernt alle aktiven Zustände. Leert den Inhalt nach der CSS-Transition.
 */
function closeContactDetails() {
  hideContactDetailsContainers();
  clearContactDetailContent();
  deactivateContactItems();
}

function checkUser() {
  if (typeof getCurrentUser === "function") {
    const user = getCurrentUser();
    if (user && document.getElementById("user-initials")) {
      document.getElementById("user-initials").innerText = getInitials(
        user.name,
      );
    }
  }
}

/**
 * Setzt das HTML des Overlays, aktiviert es und sperrt das Scrollen
 * @param {string} html - Das HTML für den Overlay-Inhalt
 */
function activateContactOverlay(html) {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.innerHTML = html;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function openAddContactDialog() {
  activateContactOverlay(getAddContactDialogTemplate());
  checkContactFormValidity(
    "new-contact-name",
    "new-contact-email",
    "new-contact-phone",
    "add-contact-submit",
  );
}

function openEditContactDialog(id) {
  activateContactOverlay(getEditContactDialogTemplate(findContactById(id)));
  checkContactFormValidity(
    "edit-contact-name",
    "edit-contact-email",
    "edit-contact-phone",
    "edit-contact-submit",
  );
}

function closeAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
  setTimeout(function () {
    overlay.innerHTML = "";
  }, 300);
}

/**
 * Validiert das Name-Feld eines Kontaktformulars
 * @param {string} nameId - Die ID des Name-Eingabefelds
 * @returns {boolean} True wenn das Feld gültig ist
 */
function validateNameField(nameId) {
  const name = document.getElementById(nameId).value.trim();
  const nameLetters = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "");
  if (nameLetters.length < 3) {
    showFieldError(nameId, "Der Name muss mindestens 3 Buchstaben enthalten.");
    return false;
  }
  clearFieldError(nameId);
  return true;
}

/**
 * Validiert das E-Mail-Feld eines Kontaktformulars
 * @param {string} emailId - Die ID des E-Mail-Eingabefelds
 * @returns {boolean} True wenn das Feld gültig ist
 */
function validateEmailField(emailId) {
  const email = document.getElementById(emailId).value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    showFieldError(emailId, "Bitte eine gültige E-Mail-Adresse eingeben.");
    return false;
  }
  clearFieldError(emailId);
  return true;
}

/**
 * Validiert das Telefon-Feld eines Kontaktformulars
 * @param {string} phoneId - Die ID des Telefon-Eingabefelds
 * @returns {boolean} True wenn das Feld gültig ist
 */
function validatePhoneField(phoneId) {
  const phone = document.getElementById(phoneId).value.trim();
  if (phone.length < 6) {
    showFieldError(phoneId, "Bitte eine gültige Telefonnummer eingeben (mind. 6 Ziffern).");
    return false;
  }
  clearFieldError(phoneId);
  return true;
}

/**
 * Validiert das Kontaktformular (Name min. 3 Buchstaben, gültiges E-Mail-Format, Telefon min. 6 Ziffern)
 * @param {string} nameId - Die ID des Name-Eingabefelds
 * @param {string} emailId - Die ID des E-Mail-Eingabefelds
 * @param {string} phoneId - Die ID des Telefon-Eingabefelds
 * @returns {boolean} True wenn alle Felder gültig sind
 */
function validateContactForm(nameId, emailId, phoneId) {
  const nameValid = validateNameField(nameId);
  const emailValid = validateEmailField(emailId);
  const phoneValid = validatePhoneField(phoneId);
  return nameValid && emailValid && phoneValid;
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const group = input.closest(".input-group");
  input.classList.add("input-error");
  let errorEl = group.querySelector(".field-error-msg");
  if (!errorEl) {
    errorEl = document.createElement("span");
    errorEl.className = "field-error-msg";
    group.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const group = input.closest(".input-group");
  input.classList.remove("input-error");
  if (group) {
    const errorEl = group.querySelector(".field-error-msg");
    if (errorEl) errorEl.remove();
  }
}

function checkContactFormValidity(nameId, emailId, phoneId, buttonId) {
  const name = document.getElementById(nameId).value.trim();
  const email = document.getElementById(emailId).value.trim();
  const phone = document.getElementById(phoneId).value.trim();
  const btn = document.getElementById(buttonId);

  const nameLetters = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, "");
  const nameValid = nameLetters.length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const phoneValid = phone.length >= 11;

  updateContactFieldFeedback(
    nameId,
    name,
    nameValid,
    "Der Name muss mindestens 3 Buchstaben enthalten.",
  );
  updateContactFieldFeedback(
    emailId,
    email,
    emailValid,
    "Bitte eine gültige E-Mail-Adresse eingeben.",
  );
  updateContactFieldFeedback(
    phoneId,
    phone,
    phoneValid,
    "Bitte eine gültige Telefonnummer eingeben (mind. 11 Ziffern).",
  );

  const allValid = nameValid && emailValid && phoneValid;
  btn.disabled = !allValid;
  btn.classList.toggle("btn-disabled", !allValid);
}

function updateContactFieldFeedback(inputId, value, isValid, errorMessage) {
  if (value.length > 0) {
    if (isValid) {
      clearFieldError(inputId);
    } else {
      showFieldError(inputId, errorMessage);
    }
  } else {
    clearFieldError(inputId);
  }
}

function createContact(e) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  if (
    !validateContactForm(
      "new-contact-name",
      "new-contact-email",
      "new-contact-phone",
    )
  )
    return;
  const name = document.getElementById("new-contact-name").value.trim();
  const newContact = buildNewContactObject(name);
  saveNewContactToFirestore(currentUser, newContact);
}

function buildNewContactObject(name) {
  const colors = ["#AB47BC", "#FF9800", "#5C6BC0", "#26A69A"];
  const randomColor = colors[Math.floor(Math.random() * 4)];
  return {
    id: String(Date.now()),
    name: name,
    email: document.getElementById("new-contact-email").value,
    phone: document.getElementById("new-contact-phone").value,
    color: randomColor,
    initials: getInitials(name),
  };
}

function finalizeContactCreation(newContact) {
  contacts.push(newContact);
  renderContactList();
  closeAddContactDialog();
  showSuccessAlert();
}

function saveContact(e, id) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  if (
    !validateContactForm(
      "edit-contact-name",
      "edit-contact-email",
      "edit-contact-phone",
    )
  )
    return;
  const contact = findContactById(id);
  if (!contact) return;
  updateContactFromForm(contact);
  persistContactToFirestore(currentUser, contact, id);
}

function updateContactFromForm(contact) {
  contact.name = document.getElementById("edit-contact-name").value;
  contact.email = document.getElementById("edit-contact-email").value;
  contact.phone = document.getElementById("edit-contact-phone").value;
  contact.initials = getInitials(contact.name);
}

function finalizeContactUpdate(contact) {
  renderContactList();
  const content = document.getElementById("contact-details-content");
  content.innerHTML = getContactDetailsTemplate(contact);
  closeAddContactDialog();
}

function deleteContact(id) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  removeContactFromFirestore(currentUser, id);
}

function finalizeContactDeletion(id) {
  removeContactFromLocal(id);
  renderContactList();
  closeContactDetails();
}

function removeContactFromLocal(id) {
  contacts = contacts.filter(function (c) {
    return String(c.id) !== String(id);
  });
}

function toggleContactMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById("contact-menu-box");
  menu.classList.toggle("show");
}

document.addEventListener("click", function () {
  const menu = document.getElementById("contact-menu-box");
  if (menu) {
    menu.classList.remove("show");
  }
});
