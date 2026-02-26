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

function loadContactsFromFirestoreAsync(currentUser) {
  return (async function () {
    try {
      const contactsRef = getContactsReference(currentUser);
      const snapshot = await window.fbGetDocs(contactsRef);
      populateContactsFromSnapshot(snapshot);
    } catch (error) {
      console.error("Error loading contacts:", error);
      contacts = [];
    }
  })();
}

function getContactsReference(currentUser) {
  return window.fbCollection(
    window.firebaseDb,
    "users",
    currentUser.id,
    "contacts",
  );
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

function appendContactItemToList(list, contact) {
  const first = contact.name[0].toUpperCase();
  const lastLetter = getLastRenderedLetter();
  if (first !== lastLetter) {
    updateLastRenderedLetter(first);
    addLetterGroupToList(list, first);
  }
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

function closeContactDetails() {
  const container = document.querySelector(".contact-details-container");
  container.classList.remove("show-mobile");
  const items = document.querySelectorAll(".contact-item");
  items.forEach(function (item) {
    item.classList.remove("active");
  });
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

function openAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.innerHTML = getAddContactDialogTemplate();
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function openEditContactDialog(id) {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.innerHTML = getEditContactDialogTemplate(findContactById(id));
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAddContactDialog() {
  const overlay = document.getElementById("add-contact-overlay");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
  setTimeout(function () {
    overlay.innerHTML = "";
  }, 300);
}

function createContact(e) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const name = document.getElementById("new-contact-name").value;
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

function saveNewContactToFirestore(currentUser, newContact) {
  return (async function () {
    try {
      await saveContactToFirestoreDb(currentUser, newContact);
      finalizeContactCreation(newContact);
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  })();
}

function saveContactToFirestoreDb(currentUser, newContact) {
  return (async function () {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      newContact.id,
    );
    await window.fbSetDoc(contactRef, newContact);
  })();
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

function persistContactToFirestore(currentUser, contact, id) {
  return (async function () {
    try {
      await updateContactInFirestoreDb(currentUser, contact, id);
      finalizeContactUpdate(contact);
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  })();
}

function updateContactInFirestoreDb(currentUser, contact, id) {
  return (async function () {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      String(id),
    );
    await window.fbSetDoc(contactRef, contact);
  })();
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

function removeContactFromFirestore(currentUser, id) {
  return (async function () {
    try {
      await deleteContactFromFirestoreDb(currentUser, id);
      finalizeContactDeletion(id);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  })();
}

function deleteContactFromFirestoreDb(currentUser, id) {
  return (async function () {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      String(id),
    );
    await window.fbDeleteDoc(contactRef);
  })();
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

function showSuccessAlert() {
  const alert = document.createElement("div");
  alert.className = "success-alert";
  alert.innerText = "Kontakt erfolgreich erstellt!";
  document.body.appendChild(alert);
  showAlertWithDelay(alert);
}

function showAlertWithDelay(alert) {
  setTimeout(function () {
    alert.classList.add("show");
  }, 100);
  setTimeout(function () {
    hideAndRemoveAlert(alert);
  }, 2000);
}

function hideAndRemoveAlert(alert) {
  alert.classList.remove("show");
  setTimeout(function () {
    alert.remove();
  }, 500);
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
