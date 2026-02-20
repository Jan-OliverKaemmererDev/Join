let selectedPriority = "medium";
let subtasks = [];
let allContacts = [];
let selectedContacts = [];

/**
 * Initialisiert die Add-Task-Seite
 */
async function initAddTask() {
  await waitForFirebase();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  updateHeaderInitials(currentUser);
  setMinimumDate();
  await loadContacts();
  validateForm();
}

/**
 * Setzt das Mindestdatum für das Due-Date-Feld auf heute
 */
function setMinimumDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("due-date").setAttribute("min", today);
}

/**
 * Aktualisiert die Benutzer-Initialen im Header
 * @param {Object} user - Das Benutzer-Objekt
 */
function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Generiert Initialen aus einem Namen
 * @param {string} name - Der vollständige Name
 * @returns {string} Die generierten Initialen
 */
function getInitialsFromName(name) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Wählt eine Priorität aus und aktualisiert die UI
 * @param {string} priority - Die ausgewählte Priorität
 */
function selectPriority(priority) {
  const buttons = document.querySelectorAll(".priority-btn");
  removeActiveFromAll(buttons);
  addActiveToSelected(priority);
}

/**
 * Entfernt die active-Klasse von allen Buttons
 * @param {NodeList} buttons - Die Liste der Priority-Buttons
 */
function removeActiveFromAll(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
}

/**
 * Fügt die active-Klasse zum ausgewählten Priority-Button hinzu
 * @param {string} priority - Die ausgewählte Priorität
 */
function addActiveToSelected(priority) {
  const selectedBtn = document.querySelector(
    '[data-priority="' + priority + '"]',
  );
  if (selectedBtn) {
    selectedBtn.classList.add("active");
    selectedPriority = priority;
  }
}

/**
 * Fügt einen neuen Subtask hinzu
 */
function addSubtask() {
  const input = document.getElementById("subtask-input");
  const subtaskText = input.value.trim();
  if (subtaskText === "") {
    hideSubtaskIcons();
    return;
  }
  const subtask = createSubtask(subtaskText);
  subtasks.push(subtask);
  input.value = "";
  renderSubtasks();
  hideSubtaskIcons();
}

/**
 * Zeigt die Subtask-Icons (Clear & Save) an
 */
function showSubtaskIcons() {
  const activeIcons = document.getElementById("subtask-icons-active");
  if (activeIcons) activeIcons.classList.remove("d-none");
}

/**
 * Blendet die Subtask-Icons (Clear & Save) aus
 */
function hideSubtaskIcons() {
  const activeIcons = document.getElementById("subtask-icons-active");
  if (activeIcons) activeIcons.classList.add("d-none");
}

/**
 * Leert das Subtask-Eingabefeld und blendet die Icons aus
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtask-input");
  if (input) input.value = "";
  hideSubtaskIcons();
}

// Globaler Klick-Handler zum Zurücksetzen des Subtask-Inputs bei Klick außerhalb
document.addEventListener("click", function (event) {
  const wrapper = document.getElementById("subtask-wrapper");
  const input = document.getElementById("subtask-input");
  if (wrapper && input && !wrapper.contains(event.target)) {
    if (input.value.trim() === "") {
      hideSubtaskIcons();
    }
  }
});

/**
 * Verhindert das Absenden des Formulars bei Enter im Subtask-Feld
 * @param {KeyboardEvent} event - Das Tastatur-Event
 */
function handleSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask();
  }
}

/**
 * Erstellt ein Subtask-Objekt
 * @param {string} text - Der Subtask-Text
 * @returns {Object} Das Subtask-Objekt
 */
function createSubtask(text) {
  return {
    id: Date.now(),
    text: text,
    completed: false,
  };
}

/**
 * Rendert die Liste der Subtasks
 */
function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  if (!list) return;
  list.innerHTML = "";
  for (let i = 0; i < subtasks.length; i++) {
    const li = document.createElement("li");
    li.innerHTML = getSubtaskItemTemplate(subtasks[i]);
    list.appendChild(li);
  }
}

/**
 * Wechselt ein Subtask in den Bearbeitungsmodus
 * @param {number} id - Die ID des Subtasks
 */
function editSubtask(id) {
  const subtask = subtasks.find((s) => s.id === id);
  if (!subtask) return;
  const container = document.getElementById(`subtask-item-${id}`);
  if (container && container.parentElement) {
    container.parentElement.innerHTML = getSubtaskEditTemplate(subtask);
    const input = document.getElementById(`subtask-input-${id}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Speichert die Bearbeitung eines Subtasks
 * @param {number} id - Die ID des Subtasks
 */
function saveEditSubtask(id) {
  const input = document.getElementById(`subtask-input-${id}`);
  if (!input) return;
  const newText = input.value.trim();
  if (newText === "") {
    removeSubtask(id);
    return;
  }
  const subtask = subtasks.find((s) => s.id === id);
  if (subtask) {
    subtask.text = newText;
    renderSubtasks();
  }
}

/**
 * Verarbeitet Tasteneingaben im Subtask-Edit-Feld
 * @param {number} id - Die ID des Subtasks
 * @param {KeyboardEvent} event - Das Keyboard-Event
 */
function handleSubtaskEditKeydown(id, event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveEditSubtask(id);
  } else if (event.key === "Escape") {
    renderSubtasks();
  }
}

/**
 * Entfernt einen Subtask anhand der ID
 * @param {number} id - Die ID des zu entfernenden Subtasks
 */
function removeSubtask(id) {
  subtasks = subtasks.filter((s) => s.id !== id);
  renderSubtasks();
}

/**
 * Validiert das Formular und aktiviert/deaktiviert den Submit-Button
 */
function validateForm() {
  const title = document.getElementById("title").value.trim();
  const dueDate = document.getElementById("due-date").value;
  const category = document.getElementById("category").value;
  const submitBtn = document.getElementById("create-task-btn");
  if (title && dueDate && category) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

/**
 * Verarbeitet das Hinzufügen eines neuen Tasks
 * @param {Event} event - Das Submit-Event des Formulars
 */
async function handleAddTask(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("Please log in to create tasks");
    return;
  }
  const task = buildTask(currentUser);
  await saveTask(currentUser.id, task);
  showToast("Task added to board");
  dispatchTaskAddedEvent(task);
  clearForm();
  setTimeout(() => {
    window.location.href = "board.html";
  }, 1000);
}

/**
 * Erstellt ein Task-Objekt aus den Formulardaten
 * @param {Object} currentUser - Der aktuell angemeldete Benutzer
 * @returns {Object} Das Task-Objekt
 */
function buildTask(currentUser) {
  return {
    id: Date.now(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("due-date").value,
    priority: selectedPriority,
    assignedTo: selectedContacts.map((c) => c.id),
    category: document.getElementById("category").value,
    subtasks: copySubtasks(),
    status: "todo",
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
  };
}

/**
 * Erstellt eine Kopie des Subtasks-Arrays
 * @returns {Array} Die Kopie des Subtasks-Arrays
 */
function copySubtasks() {
  const copy = [];
  for (let i = 0; i < subtasks.length; i++) {
    copy.push(subtasks[i]);
  }
  return copy;
}

/**
 * Löst ein taskAdded-Event aus
 * @param {Object} task - Das hinzugefügte Task-Objekt
 */
function dispatchTaskAddedEvent(task) {
  window.dispatchEvent(
    new CustomEvent("taskAdded", { detail: { task: task } }),
  );
}

/**
 * Speichert einen Task in Firestore
 * @param {string} userId - Die ID des Benutzers
 * @param {Object} task - Das zu speichernde Task-Objekt
 */
async function saveTask(userId, task) {
  try {
    const taskRef = window.fbDoc(
      window.firebaseDb,
      "users",
      userId,
      "tasks",
      String(task.id),
    );
    await window.fbSetDoc(taskRef, task);
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

/**
 * Setzt das Formular zurück
 */
function clearForm() {
  const form = document.getElementById("add-task-form");
  if (form) form.reset();
  selectPriority("medium");
  subtasks = [];
  selectedContacts = [];
  renderAssignedToOptions();
  renderSelectedInitials();
  renderSubtasks();
  validateForm();
}

/**
 * Zeigt eine Toast-Nachricht an
 * @param {string} message - Die anzuzeigende Nachricht
 */
function showToast(message) {
  let toast = document.getElementById("toast-message");
  if (!toast) {
    toast = createToastElement();
  }
  toast.innerHTML = getToastTemplate(message);
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.classList.remove("d-none");
  hideToastAfterDelay(toast);
}

/**
 * Erstellt ein Toast-Element
 * @returns {HTMLElement} Das erstellte Toast-Element
 */
function createToastElement() {
  const toast = document.createElement("div");
  toast.id = "toast-message";
  toast.className = "toast-message d-none";
  document.body.appendChild(toast);
  return toast;
}

/**
 * Versteckt die Toast-Nachricht nach einer Verzögerung
 * @param {HTMLElement} toast - Das Toast-Element
 */
function hideToastAfterDelay(toast) {
  setTimeout(function () {
    toast.classList.add("d-none");
  }, 3000);
}

/**
 * Lädt Kontakte aus Firestore
 */
async function loadContacts() {
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
    allContacts = [];
    snapshot.forEach((doc) => {
      const contact = doc.data();
      contact.id = doc.id;
      contact.isYou = contact.email === currentUser.email;
      allContacts.push(contact);
    });
    sortContactsByName();
    renderAssignedToOptions();
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/**
 * Sortiert Kontakte alphabetisch
 */
function sortContactsByName() {
  allContacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Rendert die Kontakt-Optionen im Dropdown
 */
function renderAssignedToOptions() {
  const optionsContainer = document.getElementById("assigned-to-options");
  if (!optionsContainer) return;
  optionsContainer.innerHTML = "";
  allContacts.forEach((contact) => {
    const isSelected = selectedContacts.some((c) => c.id === contact.id);
    optionsContainer.innerHTML += getContactOptionTemplate(contact, isSelected);
  });
}

/**
 * Schaltet das Dropdown-Menü um
 */
function toggleAssignedToDropdown() {
  const wrapper = document.getElementById("assigned-to-wrapper");
  const options = document.getElementById("assigned-to-options");
  wrapper.classList.toggle("open");
  options.classList.toggle("d-none");
}

/**
 * Schaltet die Auswahl eines Kontakts um
 * @param {string} contactId - Die ID des Kontakts
 * @param {Event} event - Das Klick-Event
 */
function toggleContactSelection(contactId, event) {
  event.stopPropagation();
  const contact = allContacts.find((c) => c.id === contactId);
  if (!contact) return;

  const index = selectedContacts.findIndex((c) => c.id === contactId);
  if (index > -1) {
    selectedContacts.splice(index, 1);
  } else {
    selectedContacts.push(contact);
  }

  renderAssignedToOptions();
  renderSelectedInitials();
}

/**
 * Rendert die Initialen der ausgewählten Kontakte
 */
function renderSelectedInitials() {
  const container = document.getElementById("selected-contacts-initials");
  if (!container) return;
  container.innerHTML = "";
  selectedContacts.forEach((contact) => {
    container.innerHTML += getSelectedContactInitialsTemplate(contact);
  });
}

// Schließt das Dropdown bei Klick außerhalb
document.addEventListener("click", function (event) {
  const wrapper = document.getElementById("assigned-to-wrapper");
  if (wrapper && !wrapper.contains(event.target)) {
    wrapper.classList.remove("open");
    const options = document.getElementById("assigned-to-options");
    if (options) options.classList.add("d-none");
  }
});
