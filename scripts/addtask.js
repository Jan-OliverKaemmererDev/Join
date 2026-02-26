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
  checkForEditMode();
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
 * Prüft, ob die Seite im Bearbeitungsmodus geladen wurde
 */
async function checkForEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editTaskId = urlParams.get("edit");
  if (editTaskId) {
    await loadTaskForEdit(editTaskId);
  }
}

/**
 * Lädt die Daten eines Tasks zur Bearbeitung
 * @param {string} taskId - Die ID des Tasks
 */
async function loadTaskForEdit(taskId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const taskRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "tasks",
      taskId,
    );
    const docSnap = await window.fbGetDoc(taskRef);
    if (docSnap.exists()) {
      const task = docSnap.data();
      fillFormWithTaskData(task);
      setupFormForEdit(taskId);
    }
  } catch (error) {
    console.error("Error loading task for edit:", error);
  }
}

/**
 * Füllt das Formular mit Task-Daten
 * @param {Object} task - Das Task-Objekt
 */
function fillFormWithTaskData(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("due-date").value = task.dueDate;

  // Kategorie setzen
  const categoryInput = document.getElementById("category");
  if (categoryInput) categoryInput.value = task.category;

  const categoryText = document.getElementById("selected-category-text");
  if (categoryText) {
    categoryText.textContent =
      task.category === "user-story" ? "User Story" : "Technical Task";
  }

  // Priorität setzen
  selectPriority(task.priority);

  // Kontakte setzen
  loadAssigneesForEdit(task);

  // Subtasks setzen
  subtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
  renderSubtasks();
  validateForm();
}

/**
 * Konfiguriert das Formular für die Bearbeitung
 * @param {string} taskId - Die ID des Tasks
 */
function setupFormForEdit(taskId) {
  const titleHeader = document.querySelector(".add-task-title");
  if (titleHeader) titleHeader.textContent = "Edit Task";

  const submitBtn = document.getElementById("create-task-btn");
  if (submitBtn) {
    submitBtn.innerHTML =
      'Save Changes <img src="./assets/icons/check-create-icon.svg" alt="Save Changes" />';
  }

  const form = document.getElementById("add-task-form");
  if (form) {
    form.onsubmit = function (event) {
      handleEditTask(event, taskId);
    };
  }

  // Clear-Button ausblenden oder Funktion ändern
  const clearBtn = document.querySelector(".btn-clear");
  if (clearBtn) {
    clearBtn.style.display = "none";
  }
}

/**
 * Verarbeitet die Aktualisierung eines Tasks
 * @param {Event} event - Das Submit-Event
 * @param {string} taskId - Die ID des Tasks
 */
async function handleEditTask(event, taskId) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const task = buildTask(currentUser);
  task.id = Number(taskId); // ID beibehalten

  try {
    const taskRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "tasks",
      String(taskId),
    );

    // Wir laden den alten Task nochmal kurz um den Status zu behalten
    const oldTaskSnap = await window.fbGetDoc(taskRef);
    if (oldTaskSnap.exists()) {
      task.status = oldTaskSnap.data().status;
    }

    await window.fbSetDoc(taskRef, task);
    showToast("Task updated successfully");

    setTimeout(function () {
      window.location.href = "board.html";
    }, 1000);
  } catch (error) {
    console.error("Error updating task:", error);
  }
}
