let contacts = [
  {
    id: 1,
    name: "Anja Schulz",
    email: "schulz@hotmail.com",
    phone: "+49 1111 11 111 1",
    color: "#AB47BC",
    initials: "AS",
  },
  {
    id: 2,
    name: "Anton Mayer",
    email: "antonm@gmail.com",
    phone: "+49 1111 11 111 1",
    color: "#FF9800",
    initials: "AM",
  },
  {
    id: 3,
    name: "Benedikt Ziegler",
    email: "benedikt@gmail.com",
    phone: "+49 1111 11 111 1",
    color: "#5C6BC0",
    initials: "BZ",
  },
  {
    id: 4,
    name: "David Eisenberg",
    email: "davidberg@gmail.com",
    phone: "+49 1111 11 111 1",
    color: "#F06292",
    initials: "DE",
  },
  {
    id: 5,
    name: "Eva Fischer",
    email: "eva@gmail.com",
    phone: "+49 1111 11 111 1",
    color: "#FFCA28",
    initials: "EF",
  },
  {
    id: 6,
    name: "Emmanuel Mauer",
    email: "emmanuelma@gmail.com",
    phone: "+49 1111 11 111 1",
    color: "#26A69A",
    initials: "EM",
  },
  {
    id: 7,
    name: "Marcel Bauer",
    email: "bauer@gmail.com",
    phone: "+49 1111 11 111 1",
    color: "#6A1B9A",
    initials: "MB",
  },
];

/**
 * Initialisiert die Contacts-Seite
 */
function initContacts() {
  initSideMenu("contacts");
  renderContactList();
  checkUser();
}

/**
 * Sortiert die Kontakte alphabetisch nach Namen
 */
function sortContacts() {
  contacts.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

/**
 * Rendert die komplette Kontaktliste
 */
function renderContactList() {
  const listContainer = document.getElementById("contacts-list");
  listContainer.innerHTML = "";
  sortContacts();
  let currentLetter = "";
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    currentLetter = renderContactGroup(contact, currentLetter, listContainer);
  }
}

/**
 * Rendert einen Kontakt in seiner alphabetischen Gruppe
 * @param {Object} contact - Das Kontakt-Objekt
 * @param {string} currentLetter - Der aktuelle Gruppenbuchstabe
 * @param {HTMLElement} listContainer - Der Listen-Container
 * @returns {string} Der aktualisierte Gruppenbuchstabe
 */
function renderContactGroup(contact, currentLetter, listContainer) {
  const firstLetter = contact.name.charAt(0).toUpperCase();
  if (firstLetter !== currentLetter) {
    currentLetter = firstLetter;
    listContainer.innerHTML += getContactGroupLetterTemplate(currentLetter);
    listContainer.innerHTML += getSeparatorLineTemplate();
  }
  listContainer.innerHTML += getContactItemTemplate(contact);
  return currentLetter;
}

/**
 * Findet einen Kontakt anhand der ID
 * @param {number} id - Die ID des Kontakts
 * @returns {Object|null} Der gefundene Kontakt oder null
 */
function findContactById(id) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      return contacts[i];
    }
  }
  return null;
}

/**
 * Zeigt die Details eines Kontakts an
 * @param {number} id - Die ID des Kontakts
 */
function showContactDetails(id) {
  const contact = findContactById(id);
  if (!contact) return;

  renderContactDetails(contact);
  highlightSelectedContact(id);

  const detailsView = document.getElementById("contact-details-view");
  detailsView.classList.add("visible");

  // Falls auf Mobile: Liste ausblenden, wenn Details da sind
  if (window.innerWidth <= 1000) {
    document.querySelector(".contacts-list-container").style.display = "none";
  }
}

/**
 * Hebt den ausgewählten Kontakt hervor
 * @param {number} id - Die ID des Kontakts
 */
function highlightSelectedContact(id) {
  const items = document.querySelectorAll(".contact-item");
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("active");
    if (parseInt(items[i].getAttribute("data-id")) === id) {
      items[i].classList.add("active");
    }
  }
}

/**
 * Zeigt die Detailansicht an
 */
function showDetailsView() {
  const detailsView = document.getElementById("contact-details-view");
  detailsView.classList.add("visible");
}

/**
 * Rendert die Kontakt-Details
 * @param {Object} contact - Das Kontakt-Objekt
 */
function renderContactDetails(contact) {
  const content = document.getElementById("contact-details-content");
  content.innerHTML = getContactDetailsTemplate(contact);
}

/**
 * Schließt die Kontakt-Detailansicht
 */
function closeContactDetails() {
  const detailsView = document.getElementById("contact-details-view");
  detailsView.classList.remove("visible");
  removeAllActiveClasses();

  // Falls auf Mobile: Liste wieder einblenden
  if (window.innerWidth <= 1000) {
    document.querySelector(".contacts-list-container").style.display = "block";
  }
}

/**
 * Entfernt die active-Klasse von allen Kontakt-Items
 */
function removeAllActiveClasses() {
  const items = document.querySelectorAll(".contact-item");
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("active");
  }
}

/**
 * Überprüft ob ein Benutzer angemeldet ist
 */
function checkUser() {
  const user = getCurrentUser();
  if (user && document.getElementById("user-initials")) {
    updateUserInitials(user);
  }
}

/**
 * Aktualisiert die Benutzer-Initialen im Header
 * @param {Object} user - Das Benutzer-Objekt
 */
function updateUserInitials(user) {
  const nameParts = user.name.split(" ");
  let initials = "";
  for (let i = 0; i < nameParts.length; i++) {
    initials += nameParts[i][0];
  }
  document.getElementById("user-initials").innerText = initials.toUpperCase();
}

/**
 * Öffnet den Add-Contact-Dialog
 */
function openAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.add("active");
  overlay.innerHTML = getAddContactDialogTemplate();
  activateDialog(overlay);
}

/**
 * Aktiviert den Dialog mit Animation
 * @param {HTMLElement} overlay - Das Overlay-Element
 */
function activateDialog(overlay) {
  setTimeout(function () {
    const dialog = overlay.querySelector(".slide-in-dialog");
    if (dialog) dialog.classList.add("active");
  }, 10);
}

/**
 * Schließt den Add-Contact-Dialog
 */
function closeAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  const dialog = overlay.querySelector(".slide-in-dialog");
  if (dialog) {
    deactivateDialog(dialog, overlay);
  } else {
    closeOverlay(overlay);
  }
}

/**
 * Deaktiviert den Dialog mit Animation
 * @param {HTMLElement} dialog - Das Dialog-Element
 * @param {HTMLElement} overlay - Das Overlay-Element
 */
function deactivateDialog(dialog, overlay) {
  dialog.classList.remove("active");
  setTimeout(function () {
    closeOverlay(overlay);
  }, 400);
}

/**
 * Schließt das Overlay
 * @param {HTMLElement} overlay - Das Overlay-Element
 */
function closeOverlay(overlay) {
  overlay.classList.remove("active");
  overlay.innerHTML = "";
}

/**
 * Erstellt einen neuen Kontakt
 * @param {Event} event - Das Submit-Event
 */
function createContact(event) {
  event.preventDefault();
  const newContact = buildNewContact();
  contacts.push(newContact);
  renderContactList();
  closeAddContactDialog();
  showSuccessAlert();
}

/**
 * Erstellt ein neues Kontakt-Objekt aus den Formulardaten
 * @returns {Object} Das neue Kontakt-Objekt
 */
function buildNewContact() {
  const name = document.getElementById("new-contact-name").value;
  const email = document.getElementById("new-contact-email").value;
  const phone = document.getElementById("new-contact-phone").value;
  return {
    id: Date.now(),
    name: name,
    email: email,
    phone: phone,
    color: getRandomColor(),
    initials: getInitials(name),
  };
}

/**
 * Zeigt eine Erfolgsmeldung an
 */
function showSuccessAlert() {
  const alert = document.createElement("div");
  alert.className = "success-alert";
  alert.innerText = "Contact successfully created";
  document.body.appendChild(alert);
  showAlert(alert);
  hideAlertAfterDelay(alert);
}

/**
 * Zeigt die Alert an
 * @param {HTMLElement} alert - Das Alert-Element
 */
function showAlert(alert) {
  setTimeout(function () {
    alert.classList.add("show");
  }, 100);
}

/**
 * Versteckt die Alert nach einer Verzögerung
 * @param {HTMLElement} alert - Das Alert-Element
 */
function hideAlertAfterDelay(alert) {
  setTimeout(function () {
    alert.classList.remove("show");
    setTimeout(function () {
      alert.remove();
    }, 500);
  }, 2000);
}

/**
 * Öffnet den Edit-Contact-Dialog
 * @param {number} id - Die ID des zu bearbeitenden Kontakts
 */
function openEditContactDialog(id) {
  const contact = findContactById(id);
  if (!contact) return;
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.add("active");
  overlay.innerHTML = getEditContactDialogTemplate(contact);
  activateEditDialog(overlay);
}

/**
 * Aktiviert den Edit-Dialog
 * @param {HTMLElement} overlay - Das Overlay-Element
 */
function activateEditDialog(overlay) {
  const dialog = overlay.querySelector(".slide-in-dialog");
  dialog.classList.remove("active");
  setTimeout(function () {
    if (dialog) dialog.classList.add("active");
  }, 10);
}

/**
 * Speichert die Änderungen an einem Kontakt
 * @param {Event} event - Das Submit-Event
 * @param {number} id - Die ID des Kontakts
 */
function saveContact(event, id) {
  event.preventDefault();
  const contact = findContactById(id);
  if (!contact) return;
  updateContactData(contact);
  renderContactList();
  renderContactDetails(contact);
  closeAddContactDialog();
}

/**
 * Aktualisiert die Kontakt-Daten
 * @param {Object} contact - Das Kontakt-Objekt
 */
function updateContactData(contact) {
  contact.name = document.getElementById("edit-contact-name").value;
  contact.email = document.getElementById("edit-contact-email").value;
  contact.phone = document.getElementById("edit-contact-phone").value;
  contact.initials = getInitials(contact.name);
}

/**
 * Löscht einen Kontakt
 * @param {number} id - Die ID des zu löschenden Kontakts
 */
function deleteContact(id) {
  const index = findContactIndexById(id);
  if (index > -1) {
    contacts.splice(index, 1);
    renderContactList();
    closeContactDetails();
  }
}

/**
 * Findet den Index eines Kontakts anhand der ID
 * @param {number} id - Die ID des Kontakts
 * @returns {number} Der Index des Kontakts oder -1
 */
function findContactIndexById(id) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      return i;
    }
  }
  return -1;
}

/**
 * Gibt eine zufällige Farbe zurück
 * @returns {string} Ein zufälliger Farbcode
 */
function getRandomColor() {
  const colors = [
    "#AB47BC",
    "#FF9800",
    "#5C6BC0",
    "#F06292",
    "#FFCA28",
    "#26A69A",
    "#6A1B9A",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generiert Initialen aus einem Namen
 * @param {string} name - Der vollständige Name
 * @returns {string} Die generierten Initialen
 */
function getInitials(name) {
  const parts = name.split(" ");
  let initials = "";
  for (let i = 0; i < parts.length; i++) {
    initials += parts[i][0];
  }
  return initials.toUpperCase();
}
