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

const initContacts = () => {
  initSideMenu("contacts");
  renderContactList();
  checkUser();
};

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

const findContactById = (id) => contacts.find((c) => c.id === id) || null;

function showContactDetails(id) {
  const contact = findContactById(id);
  if (!contact) return;
  document.getElementById("contact-details-content").innerHTML =
    getContactDetailsTemplate(contact);
  document.querySelectorAll(".contact-item").forEach((item) => {
    item.classList.toggle(
      "active",
      parseInt(item.getAttribute("data-id")) === id,
    );
  });
  if (window.innerWidth <= 780) {
    document
      .querySelector(".contact-details-container")
      .classList.add("show-mobile");
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

function createContact(e) {
  e.preventDefault();
  const name = document.getElementById("new-contact-name").value;
  const newContact = {
    id: Date.now(),
    name,
    email: document.getElementById("new-contact-email").value,
    phone: document.getElementById("new-contact-phone").value,
    color: ["#AB47BC", "#FF9800", "#5C6BC0", "#26A69A"][
      Math.floor(Math.random() * 4)
    ],
    initials: getInitials(name),
  };
  contacts.push(newContact);
  renderContactList();
  closeAddContactDialog();
  showSuccessAlert();
}

function saveContact(e, id) {
  e.preventDefault();
  const c = findContactById(id);
  if (!c) return;
  c.name = document.getElementById("edit-contact-name").value;
  c.email = document.getElementById("edit-contact-email").value;
  c.phone = document.getElementById("edit-contact-phone").value;
  c.initials = getInitials(c.name);
  renderContactList();
  document.getElementById("contact-details-content").innerHTML =
    getContactDetailsTemplate(c);
  closeAddContactDialog();
}

function deleteContact(id) {
  contacts = contacts.filter((c) => c.id !== id);
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
