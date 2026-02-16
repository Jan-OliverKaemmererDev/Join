let contacts = [];

const initContacts = async () => {
  await waitForFirebase();
  initSideMenu("contacts");
  await loadContactsFromFirestore();
  renderContactList();
  checkUser();
};

/**
 * Lädt Kontakte aus Firestore für den aktuellen Benutzer
 */
async function loadContactsFromFirestore() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const contactsRef = window.fbCollection(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
    );
    const snapshot = await window.fbGetDocs(contactsRef);
    contacts = [];
    snapshot.forEach(function (doc) {
      const data = doc.data();
      data.id = doc.id;
      contacts.push(data);
    });
  } catch (error) {
    console.error("Error loading contacts:", error);
    contacts = [];
  }
}

const sortContacts = () =>
  contacts.sort((a, b) => a.name.localeCompare(b.name));

const getInitials = (n) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

function renderContactList() {
  const list = document.getElementById("contacts-list");
  if (!list) return;
  list.innerHTML = "";
  sortContacts();
  let currentLetter = "";
  contacts.forEach((c) => {
    const first = c.name[0].toUpperCase();
    if (first !== currentLetter) {
      currentLetter = first;
      list.innerHTML +=
        getContactGroupLetterTemplate(currentLetter) +
        getSeparatorLineTemplate();
    }
    list.innerHTML += getContactItemTemplate(c);
  });
}

const findContactById = (id) =>
  contacts.find((c) => String(c.id) === String(id)) || null;

function showContactDetails(id) {
  const contact = findContactById(id);
  if (!contact) return;

  const container = document.getElementById("contact-details-view");
  const content = document.getElementById("contact-details-content");

  // Hier holen wir uns den Header
  const headerStatic = document.querySelector(".details-header-static");

  // Wir nutzen die neue Template-Funktion (aus der vorherigen Antwort)
  // Falls du die Funktion noch nicht hast, nutze deine alte getContactDetailsTemplate(contact)
  // Aber wichtig ist der Unterschied Desktop/Mobile
  if (window.innerWidth > 780) {
    content.innerHTML = getDesktopContactDetailsTemplate(contact);
  } else {
    content.innerHTML = getMobileContactDetailsTemplate(contact);
  }

  // Aktiven Kontakt in der Liste markieren
  document.querySelectorAll(".contact-item").forEach((item) => {
    item.classList.toggle(
      "active",
      item.getAttribute("data-id") === String(id),
    );
  });

  // Desktop & Mobile Sichtbarkeit steuern
  if (window.innerWidth <= 780) {
    document
      .querySelector(".contact-details-container")
      .classList.add("show-mobile");
  } else {
    container.classList.add("visible");

    // --- NEU: Header nach oben schieben ---
    if (headerStatic) {
      headerStatic.classList.add("slide-up");
    }
  }
}

function closeContactDetails() {
  document
    .querySelector(".contact-details-container")
    .classList.remove("show-mobile");
  document
    .querySelectorAll(".contact-item")
    .forEach((i) => i.classList.remove("active"));
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
  document.body.style.overflow = "hidden"; // Verhindert Scrollen im Hintergrund
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
  document.body.style.overflow = "auto"; // Reaktiviert das Scrollen
  setTimeout(() => {
    overlay.innerHTML = "";
  }, 300);
}

async function createContact(e) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const name = document.getElementById("new-contact-name").value;
  const contactId = String(Date.now());
  const newContact = {
    id: contactId,
    name,
    email: document.getElementById("new-contact-email").value,
    phone: document.getElementById("new-contact-phone").value,
    color: ["#AB47BC", "#FF9800", "#5C6BC0", "#26A69A"][
      Math.floor(Math.random() * 4)
    ],
    initials: getInitials(name),
  };
  try {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      contactId,
    );
    await window.fbSetDoc(contactRef, newContact);
  } catch (error) {
    console.error("Error creating contact:", error);
  }
  contacts.push(newContact);
  renderContactList();
  closeAddContactDialog();
  showSuccessAlert();
}

async function saveContact(e, id) {
  e.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const c = findContactById(id);
  if (!c) return;
  c.name = document.getElementById("edit-contact-name").value;
  c.email = document.getElementById("edit-contact-email").value;
  c.phone = document.getElementById("edit-contact-phone").value;
  c.initials = getInitials(c.name);
  try {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      String(id),
    );
    await window.fbSetDoc(contactRef, c);
  } catch (error) {
    console.error("Error saving contact:", error);
  }
  renderContactList();
  document.getElementById("contact-details-content").innerHTML =
    getContactDetailsTemplate(c);
  closeAddContactDialog();
}

async function deleteContact(id) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      String(id),
    );
    await window.fbDeleteDoc(contactRef);
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
  contacts = contacts.filter((c) => String(c.id) !== String(id));
  renderContactList();
  closeContactDetails();
}

function showSuccessAlert() {
  const alert = document.createElement("div");
  alert.className = "success-alert";
  alert.innerText = "Kontakt erfolgreich erstellt!";
  document.body.appendChild(alert);
  setTimeout(() => alert.classList.add("show"), 100);
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 500);
  }, 2000);
}

const toggleContactMenu = (e) => {
  e.stopPropagation();
  document.getElementById("contact-menu-box").classList.toggle("show");
};

document.addEventListener("click", () => {
  document.getElementById("contact-menu-box")?.classList.remove("show");
});
