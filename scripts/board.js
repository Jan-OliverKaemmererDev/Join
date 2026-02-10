let tasks = [];
let currentDraggedTaskId = null;


/**
 * Initialisiert das Board und lädt die Tasks
 */
function initBoard() {
  loadTasks();
  renderTasks();
  checkUser();
  setupTaskAddedListener();
}


/**
 * Richtet den Event-Listener für hinzugefügte Tasks ein
 */
function setupTaskAddedListener() {
  window.addEventListener("taskAdded", function() {
    closeAddTaskOverlay();
    loadTasks();
    renderTasks();
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
 * Lädt die Tasks des aktuellen Benutzers aus dem LocalStorage
 */
function loadTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const tasksKey = "join_tasks_" + currentUser.id;
  const tasksJson = localStorage.getItem(tasksKey);
  if (tasksJson) {
    tasks = JSON.parse(tasksJson);
  } else {
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
  renderEmptyState("awaitfeedback", counts.awaitfeedback, "No tasks Await feedback");
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
  return getTaskCardTemplate(task, categoryClass, categoryLabel, progressHtml, assigneesHtml, priorityIcon);
}


/**
 * Gibt die CSS-Klasse für eine Kategorie zurück
 * @param {string} category - Die Kategorie
 * @returns {string} Die CSS-Klasse
 */
function getCategoryClass(category) {
  return category === "user-story" ? "category-user-story" : "category-technical";
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
  if (task.assignedTo) {
    const initials = getInitialsFromName(task.assignedTo || "U");
    return getAssigneeBadgeTemplate(initials);
  }
  return "";
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
 */
function startDragging(id) {
  currentDraggedTaskId = id;
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
function moveTo(status) {
  const taskIndex = findTaskById(currentDraggedTaskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    saveTasks();
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
  moveTo(status);
}


/**
 * Speichert alle Tasks im LocalStorage
 */
function saveTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const tasksKey = "join_tasks_" + currentUser.id;
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
}


/**
 * Öffnet das Add-Task-Overlay
 */
function openAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.add("active");
}


/**
 * Schließt das Add-Task-Overlay
 */
function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("active");
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
 * Öffnet die Task-Detailansicht
 * @param {number} taskId - Die ID des Tasks
 */
function openTaskDetails(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  const content = document.getElementById("task-details-content");
  const subtasksHtml = buildSubtasksHtml(task);
  const priorityIcon = getPriorityIcon(task.priority);
  const categoryClass = getCategoryClass(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  content.innerHTML = getTaskDetailsTemplate(task, subtasksHtml, priorityIcon, categoryClass, categoryLabel);
  document.getElementById("task-details-overlay").classList.add("active");
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
 * Schließt die Task-Detailansicht
 */
function closeTaskDetails() {
  document.getElementById("task-details-overlay").classList.remove("active");
}


/**
 * Schaltet den Status eines Subtasks um
 * @param {number} taskId - Die ID des Tasks
 * @param {number} subtaskIndex - Der Index des Subtasks
 */
function toggleSubtask(taskId, subtaskIndex) {
  const task = findTask(taskId);
  if (task) {
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    saveTasks();
    renderTasks();
  }
}


/**
 * Löscht einen Task
 * @param {number} taskId - Die ID des zu löschenden Tasks
 */
function deleteTask(taskId) {
  tasks = filterOutTask(taskId);
  saveTasks();
  renderTasks();
  closeTaskDetails();
}


/**
 * Filtert einen Task aus dem Tasks-Array
 * @param {number} taskId - Die ID des zu entfernenden Tasks
 * @returns {Array} Das gefilterte Tasks-Array
 */
function filterOutTask(taskId) {
  const filtered = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== taskId) {
      filtered.push(tasks[i]);
    }
  }
  return filtered;
}


/**
 * Durchsucht Tasks anhand einer Suchanfrage
 */
function searchTasks() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const cards = document.querySelectorAll(".task-card");
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    filterCard(card, query);
  }
}


/**
 * Filtert eine Task-Karte basierend auf der Suchanfrage
 * @param {HTMLElement} card - Das Task-Karten-Element
 * @param {string} query - Die Suchanfrage
 */
function filterCard(card, query) {
  const title = card.querySelector(".task-title").innerText.toLowerCase();
  const desc = card.querySelector(".task-description").innerText.toLowerCase();
  if (title.includes(query) || desc.includes(query)) {
    card.style.display = "flex";
  } else {
    card.style.display = "none";
  }
}
