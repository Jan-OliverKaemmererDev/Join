let tasks = [];
let currentDraggedTaskId = null;
let isDragging = false;
let touchDragElement = null;
let touchDragClone = null;
let touchStartX = 0;
let touchStartY = 0;
let touchDragTaskId = null;

/**
 * Initialisiert das Board und lädt die Tasks
 */
async function initBoard() {
  await waitForFirebase();
  await loadTasks();
  await loadContacts(); // Shared from addtask.js
  renderTasks();
  checkUser();
  setupTaskAddedListener();
  initTouchDragDrop();
}

/**
 * Richtet den Event-Listener für hinzugefügte Tasks ein
 */
function setupTaskAddedListener() {
  window.addEventListener("taskAdded", function () {
    closeAddTaskOverlay();
    loadTasks().then(function () {
      renderTasks();
    });
  });
}

/**
 * Überprüft ob ein Benutzer angemeldet ist
 */
function checkUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  if (document.getElementById("user-initials")) {
    updateHeaderInitials(currentUser);
  }
}

/**
 * Lädt die Tasks des aktuellen Benutzers aus Firestore
 */
async function loadTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const tasksRef = window.fbCollection(
      window.firebaseDb,
      "users",
      currentUser.id,
      "tasks",
    );
    const snapshot = await window.fbGetDocs(tasksRef);
    tasks = [];
    snapshot.forEach(function (doc) {
      tasks.push(doc.data());
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
    tasks = [];
  }
}

/**
 * Leert alle Board-Spalten
 */
function clearAllColumns() {
  document.getElementById("todo-list").innerHTML = "";
  document.getElementById("inprogress-list").innerHTML = "";
  document.getElementById("awaitfeedback-list").innerHTML = "";
  document.getElementById("done-list").innerHTML = "";
}

/**
 * Rendert alle Tasks auf dem Board
 */
function renderTasks() {
  clearAllColumns();
  let counts = { todo: 0, inprogress: 0, awaitfeedback: 0, done: 0 };
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    renderTaskCard(task, counts);
  }
  renderAllEmptyStates(counts);
}

/**
 * Rendert eine einzelne Task-Karte
 * @param {Object} task - Das Task-Objekt
 * @param {Object} counts - Die Zähl-Objekt für Task-Stati
 */
function renderTaskCard(task, counts) {
  const cardHtml = generateTaskCardHtml(task);
  const listId = task.status + "-list";
  const listElement = document.getElementById(listId);
  if (listElement) {
    listElement.innerHTML += cardHtml;
    counts[task.status]++;
  }
}

/**
 * Rendert Empty-States für alle leeren Spalten
 * @param {Object} counts - Die Zähl-Objekt mit Task-Anzahlen pro Status
 */
function renderAllEmptyStates(counts) {
  renderEmptyState("todo", counts.todo, "No tasks To do");
  renderEmptyState("inprogress", counts.inprogress, "No tasks In progress");
  renderEmptyState(
    "awaitfeedback",
    counts.awaitfeedback,
    "No tasks Await feedback",
  );
  renderEmptyState("done", counts.done, "No tasks Done");
}

/**
 * Rendert einen Empty-State für eine Spalte
 * @param {string} status - Der Status der Spalte
 * @param {number} count - Die Anzahl der Tasks in dieser Spalte
 * @param {string} message - Die anzuzeigende Nachricht
 */
function renderEmptyState(status, count, message) {
  const list = document.getElementById(status + "-list");
  if (count === 0 && list) {
    list.innerHTML = getNoTasksTemplate(message);
  }
}

/**
 * Generiert das HTML für eine Task-Karte
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das generierte HTML
 */
function generateTaskCardHtml(task) {
  const categoryClass = getCategoryClass(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const progressHtml = generateProgressHtml(task);
  const priorityIcon = getPriorityIcon(task.priority);
  const assigneesHtml = generateAssigneesHtml(task);
  return getTaskCardTemplate(
    task,
    categoryClass,
    categoryLabel,
    progressHtml,
    assigneesHtml,
    priorityIcon,
  );
}

/**
 * Gibt die CSS-Klasse für eine Kategorie zurück
 * @param {string} category - Die Kategorie
 * @returns {string} Die CSS-Klasse
 */
function getCategoryClass(category) {
  return category === "user-story"
    ? "category-user-story"
    : "category-technical";
}

/**
 * Gibt das Label für eine Kategorie zurück
 * @param {string} category - Die Kategorie
 * @returns {string} Das Kategorie-Label
 */
function getCategoryLabel(category) {
  return category === "user-story" ? "User Story" : "Technical Task";
}

/**
 * Generiert das HTML für den Fortschrittsbalken
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML für den Fortschrittsbalken
 */
function generateProgressHtml(task) {
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = countCompletedSubtasks(task.subtasks);
    const total = task.subtasks.length;
    return getProgressBarTemplate(completed, total);
  }
  return "";
}

/**
 * Zählt die abgeschlossenen Subtasks
 * @param {Array} subtasks - Array mit Subtasks
 * @returns {number} Anzahl der abgeschlossenen Subtasks
 */
function countCompletedSubtasks(subtasks) {
  let count = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].completed) {
      count++;
    }
  }
  return count;
}

/**
 * Generiert das HTML für zugewiesene Benutzer
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML für die Assignees
 */
function generateAssigneesHtml(task) {
  if (!task.assignedTo || !Array.isArray(task.assignedTo)) return "";
  let html = "";
  const displayCount = Math.min(task.assignedTo.length, 3);

  for (let i = 0; i < displayCount; i++) {
    const contactId = task.assignedTo[i];
    const contact = allContacts.find((c) => c.id === contactId);
    if (contact) {
      const initials = getInitialsFromName(contact.name);
      html += getAssigneeBadgeTemplate(initials, contact.color);
    }
  }

  if (task.assignedTo.length > 3) {
    html += getAssigneeBadgeTemplate(
      `+${task.assignedTo.length - 3}`,
      "#2A3647",
    );
  }

  return html;
}

/**
 * Gibt das Icon für eine Priorität zurück
 * @param {string} priority - Die Priorität
 * @returns {string} Das HTML für das Prioritäts-Icon
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") {
    return getUrgentPriorityIcon();
  } else if (priority === "medium") {
    return getMediumPriorityIcon();
  } else {
    return getLowPriorityIcon();
  }
}

/**
 * Startet das Drag-and-Drop für einen Task
 * @param {number} id - Die ID des Tasks
 * @param {Event} ev - Das Drag-Event
 */
function startDragging(id, ev) {
  isDragging = true;
  currentDraggedTaskId = id;
  if (ev && ev.dataTransfer) {
    ev.dataTransfer.setData("text/plain", String(id));
    ev.dataTransfer.effectAllowed = "move";
  }
}

/**
 * Beendet das Drag-and-Drop
 */
function endDragging() {
  setTimeout(function () {
    isDragging = false;
  }, 0);
}

/**
 * Erlaubt das Ablegen eines Tasks
 * @param {Event} ev - Das Drag-Event
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Hebt eine Drop-Zone hervor
 * @param {string} id - Die ID der Drop-Zone
 */
function highlight(id) {
  document.getElementById(id).classList.add("drag-over");
}

/**
 * Entfernt die Hervorhebung einer Drop-Zone
 * @param {string} id - Die ID der Drop-Zone
 */
function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-over");
}

/**
 * Findet den Index eines Tasks anhand der ID
 * @param {number} taskId - Die ID des Tasks
 * @returns {number} Der Index des Tasks oder -1
 */
function findTaskById(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      return i;
    }
  }
  return -1;
}

/**
 * Verschiebt einen Task zu einem neuen Status
 * @param {string} status - Der neue Status
 */
async function moveTo(status) {
  const taskIndex = findTaskById(currentDraggedTaskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    await saveTasks();
    renderTasks();
  }
  currentDraggedTaskId = null;
}

/**
 * Behandelt das Drop-Event für einen Task
 * @param {Event} ev - Das Drop-Event
 * @param {string} status - Der neue Status
 */
function drop(ev, status) {
  ev.preventDefault();
  removeHighlight(status + "-list");
  if (currentDraggedTaskId === null && ev.dataTransfer) {
    const data = ev.dataTransfer.getData("text/plain");
    if (data) {
      currentDraggedTaskId = Number(data);
    }
  }
  moveTo(status);
}

/**
 * Speichert alle Tasks in Firestore
 */
async function saveTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskRef = window.fbDoc(
        window.firebaseDb,
        "users",
        currentUser.id,
        "tasks",
        String(task.id),
      );
      await window.fbSetDoc(taskRef, task);
    }
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

/**
 * Findet einen Task anhand der ID
 * @param {number} taskId - Die ID des Tasks
 * @returns {Object|null} Das Task-Objekt oder null
 */
function findTask(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      return tasks[i];
    }
  }
  return null;
}

/**
 * Generiert das HTML für die Subtasks-Liste
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML für die Subtasks
 */
function buildSubtasksHtml(task) {
  let subtasksHtml = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    const st = task.subtasks[i];
    subtasksHtml += getSubtaskItemDetailTemplate(task.id, i, st);
  }
  return subtasksHtml;
}

/**
 * Liest die Task-ID aus dem data-Attribut einer Karte
 * @param {HTMLElement} card - Das Task-Karten-Element
 * @returns {number|null} Die Task-ID oder null
 */
function getTaskIdFromCard(card) {
  const id = card.getAttribute("data-task-id");
  return id ? Number(id) : null;
}
