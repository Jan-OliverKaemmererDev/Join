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

function initContacts() {
  initSideMenu("contacts");
  renderContactList();
  checkUser();
}

function sortContacts() {
  contacts.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
}

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

function findContactById(id) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      return contacts[i];
    }
  }
  return null;
}

function showContactDetails(id) {
  const contact = findContactById(id);
  if (!contact) return;
  renderContactDetails(contact);
  highlightSelectedContact(id);
  showDetailsView();
}

function highlightSelectedContact(id) {
  const items = document.querySelectorAll(".contact-item");
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("active");
    if (parseInt(items[i].getAttribute("data-id")) === id) {
      items[i].classList.add("active");
    }
  }
}

function showDetailsView() {
  const detailsView = document.getElementById("contact-details-view");
  detailsView.classList.add("visible");
}

function renderContactDetails(contact) {
  const content = document.getElementById("contact-details-content");
  content.innerHTML = getContactDetailsTemplate(contact);
}

function closeContactDetails() {
  const detailsView = document.getElementById("contact-details-view");
  detailsView.classList.remove("visible");
  removeAllActiveClasses();
}

function removeAllActiveClasses() {
  const items = document.querySelectorAll(".contact-item");
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("active");
  }
}

function checkUser() {
  const user = getCurrentUser();
  if (user && document.getElementById("user-initials")) {
    updateUserInitials(user);
  }
}

function updateUserInitials(user) {
  const nameParts = user.name.split(" ");
  let initials = "";
  for (let i = 0; i < nameParts.length; i++) {
    initials += nameParts[i][0];
  }
  document.getElementById("user-initials").innerText = initials.toUpperCase();
}

function openAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.add("active");
  overlay.innerHTML = getAddContactDialogTemplate();
  activateDialog(overlay);
}

function activateDialog(overlay) {
  setTimeout(function() {
    const dialog = overlay.querySelector(".slide-in-dialog");
    if (dialog) dialog.classList.add("active");
  }, 10);
}

function closeAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  const dialog = overlay.querySelector(".slide-in-dialog");
  if (dialog) {
    deactivateDialog(dialog, overlay);
  } else {
    closeOverlay(overlay);
  }
}

function deactivateDialog(dialog, overlay) {
  dialog.classList.remove("active");
  setTimeout(function() {
    closeOverlay(overlay);
  }, 400);
}

function closeOverlay(overlay) {
  overlay.classList.remove("active");
  overlay.innerHTML = "";
}

function createContact(event) {
  event.preventDefault();
  const newContact = buildNewContact();
  contacts.push(newContact);
  renderContactList();
  closeAddContactDialog();
  showSuccessAlert();
}

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

function showSuccessAlert() {
  const alert = document.createElement("div");
  alert.className = "success-alert";
  alert.innerText = "Contact successfully created";
  document.body.appendChild(alert);
  showAlert(alert);
  hideAlertAfterDelay(alert);
}

function showAlert(alert) {
  setTimeout(function() {
    alert.classList.add("show");
  }, 100);
}

function hideAlertAfterDelay(alert) {
  setTimeout(function() {
    alert.classList.remove("show");
    setTimeout(function() {
      alert.remove();
    }, 500);
  }, 2000);
}

function openEditContactDialog(id) {
  const contact = findContactById(id);
  if (!contact) return;
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.add("active");
  overlay.innerHTML = getEditContactDialogTemplate(contact);
  activateEditDialog(overlay);
}

function activateEditDialog(overlay) {
  const dialog = overlay.querySelector(".slide-in-dialog");
  dialog.classList.remove("active");
  setTimeout(function() {
    if (dialog) dialog.classList.add("active");
  }, 10);
}

function saveContact(event, id) {
  event.preventDefault();
  const contact = findContactById(id);
  if (!contact) return;
  updateContactData(contact);
  renderContactList();
  renderContactDetails(contact);
  closeAddContactDialog();
}

function updateContactData(contact) {
  contact.name = document.getElementById("edit-contact-name").value;
  contact.email = document.getElementById("edit-contact-email").value;
  contact.phone = document.getElementById("edit-contact-phone").value;
  contact.initials = getInitials(contact.name);
}

function deleteContact(id) {
  const index = findContactIndexById(id);
  if (index > -1) {
    contacts.splice(index, 1);
    renderContactList();
    closeContactDetails();
  }
}

function findContactIndexById(id) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === id) {
      return i;
    }
  }
  return -1;
}

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

function getInitials(name) {
  const parts = name.split(" ");
  let initials = "";
  for (let i = 0; i < parts.length; i++) {
    initials += parts[i][0];
  }
  return initials.toUpperCase();
}
