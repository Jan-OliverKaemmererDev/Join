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
 * Öffnet das Add-Task-Overlay
 */
function openAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.add("active");
  if (window.innerWidth <= 780) {
    const categoryEl = document.getElementById("category");
    if (categoryEl && !categoryEl.value) {
      categoryEl.value = "technical";
    }
    validateForm();
  }
}

/**
 * Schließt das Add-Task-Overlay
 */
function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("active");
  resetFormToAddMode();
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
  if (isDragging) return;
  const task = findTask(taskId);
  if (!task) return;
  const content = document.getElementById("task-details-content");
  const subtasksHtml = buildSubtasksHtml(task);
  const priorityIcon = getPriorityIcon(task.priority);
  const categoryClass = getCategoryClass(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  content.innerHTML = getTaskDetailsTemplate(
    task,
    subtasksHtml,
    priorityIcon,
    categoryClass,
    categoryLabel,
  );
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
async function toggleSubtask(taskId, subtaskIndex) {
  const task = findTask(taskId);
  if (task) {
    task.subtasks[subtaskIndex].completed =
      !task.subtasks[subtaskIndex].completed;
    await saveTasks();
    renderTasks();
  }
}

/**
 * Löscht einen Task
 * @param {number} taskId - Die ID des zu löschenden Tasks
 */
async function deleteTask(taskId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  try {
    const taskRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "tasks",
      String(taskId),
    );
    await window.fbDeleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
  tasks = filterOutTask(taskId);
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

/**
 * Initialisiert Touch-Drag-and-Drop für mobile Geräte
 */
function initTouchDragDrop() {
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
}

/**
 * Behandelt den Touchstart auf einer Task-Karte
 * @param {TouchEvent} ev - Das Touch-Event
 */
function handleTouchStart(ev) {
  const card = ev.target.closest(".task-card");
  if (!card) return;
  const touch = ev.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchDragTaskId = getTaskIdFromCard(card);
  touchDragElement = card;
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

/**
 * Behandelt die Touchmove-Events während des Drags
 * @param {TouchEvent} ev - Das Touch-Event
 */
function handleTouchMove(ev) {
  if (!touchDragElement) return;
  const touch = ev.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX);
  const deltaY = Math.abs(touch.clientY - touchStartY);
  if (!touchDragClone && (deltaX > 10 || deltaY > 10)) {
    createTouchDragClone(touch);
  }
  if (touchDragClone) {
    ev.preventDefault();
    touchDragClone.style.left =
      touch.clientX - touchDragClone.offsetWidth / 2 + "px";
    touchDragClone.style.top = touch.clientY - 30 + "px";
    highlightColumnUnderTouch(touch.clientX, touch.clientY);
  }
}

/**
 * Erstellt einen visuellen Klon der Karte für den Touch-Drag
 * @param {Touch} touch - Das Touch-Objekt
 */
function createTouchDragClone(touch) {
  touchDragClone = touchDragElement.cloneNode(true);
  touchDragClone.style.position = "fixed";
  touchDragClone.style.zIndex = "10000";
  touchDragClone.style.width = touchDragElement.offsetWidth + "px";
  touchDragClone.style.opacity = "0.8";
  touchDragClone.style.pointerEvents = "none";
  touchDragClone.style.transform = "rotate(3deg)";
  document.body.appendChild(touchDragClone);
  touchDragElement.style.opacity = "0.3";
  isDragging = true;
}

/**
 * Behandelt das Touchend-Event und führt den Drop aus
 * @param {TouchEvent} ev - Das Touch-Event
 */
function handleTouchEnd(ev) {
  if (!touchDragElement) return;
  if (touchDragClone) {
    const touch = ev.changedTouches[0];
    const column = getColumnUnderPoint(touch.clientX, touch.clientY);
    if (column && touchDragTaskId !== null) {
      currentDraggedTaskId = touchDragTaskId;
      const status = getStatusFromColumnId(column.id);
      if (status) {
        moveTo(status);
      }
    }
    touchDragClone.remove();
    touchDragClone = null;
    touchDragElement.style.opacity = "";
    removeAllHighlights();
  }
  touchDragElement = null;
  touchDragTaskId = null;
  setTimeout(function () {
    isDragging = false;
  }, 0);
}

/**
 * Findet die Board-Spalte unter einem bestimmten Punkt
 * @param {number} x - X-Koordinate
 * @param {number} y - Y-Koordinate
 * @returns {HTMLElement|null} Das Spalten-Element oder null
 */
function getColumnUnderPoint(x, y) {
  const columns = document.querySelectorAll(".board-column");
  for (let i = 0; i < columns.length; i++) {
    const rect = columns[i].getBoundingClientRect();
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return columns[i];
    }
  }
  return null;
}

/**
 * Gibt den Status-String für eine Spalten-ID zurück
 * @param {string} columnId - Die HTML-ID der Spalte
 * @returns {string|null} Der Status-String oder null
 */
function getStatusFromColumnId(columnId) {
  if (columnId === "column-todo") return "todo";
  if (columnId === "column-inprogress") return "inprogress";
  if (columnId === "column-awaitfeedback") return "awaitfeedback";
  if (columnId === "column-done") return "done";
  return null;
}

/**
 * Hebt die Spalte unter dem Touch-Punkt hervor
 * @param {number} x - X-Koordinate
 * @param {number} y - Y-Koordinate
 */
function highlightColumnUnderTouch(x, y) {
  removeAllHighlights();
  const column = getColumnUnderPoint(x, y);
  if (column) {
    const list = column.querySelector(".task-list");
    if (list) {
      list.classList.add("drag-over");
    }
  }
}

/**
 * Entfernt alle Drag-Hervorhebungen
 */
function removeAllHighlights() {
  const lists = document.querySelectorAll(".task-list");
  for (let i = 0; i < lists.length; i++) {
    lists[i].classList.remove("drag-over");
  }
}

/**
 * Bearbeitet einen vorhandenen Task
 * @param {number} taskId - Die ID des zu bearbeitenden Tasks
 */
function editTask(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  closeTaskDetails();
  fillFormWithTaskData(task);
  openAddTaskOverlay();
  setupFormForEdit(taskId);
}

/**
 * Füllt das Formular mit den Daten eines Tasks
 * @param {Object} task - Das Task-Objekt
 */
function fillFormWithTaskData(task) {
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("due-date").value = task.dueDate;
  document.getElementById("assigned-to").value = task.assignedTo || "";
  document.getElementById("category").value = task.category;
  selectPriority(task.priority);
  if (task.subtasks && task.subtasks.length > 0) {
    subtasks = JSON.parse(JSON.stringify(task.subtasks));
  } else {
    subtasks = [];
  }
  renderSubtasks();
  validateForm();
}

/**
 * Konfiguriert das Formular für die Bearbeitung
 * @param {number} taskId - Die ID des zu bearbeitenden Tasks
 */
function setupFormForEdit(taskId) {
  const form = document.getElementById("add-task-form");
  const submitBtn = document.getElementById("create-task-btn");
  const title = document.querySelector(".add-task-title");
  title.textContent = "Edit Task";
  submitBtn.textContent = "Save Changes";
  form.onsubmit = function (event) {
    event.preventDefault();
    updateTask(taskId);
  };
}

/**
 * Aktualisiert einen vorhandenen Task
 * @param {number} taskId - Die ID des zu aktualisierenden Tasks
 */
async function updateTask(taskId) {
  const taskIndex = findTaskById(taskId);
  if (taskIndex === -1) return;
  tasks[taskIndex].title = document.getElementById("title").value.trim();
  tasks[taskIndex].description = document
    .getElementById("description")
    .value.trim();
  tasks[taskIndex].dueDate = document.getElementById("due-date").value;
  tasks[taskIndex].priority = selectedPriority;
  tasks[taskIndex].assignedTo = document.getElementById("assigned-to").value;
  tasks[taskIndex].category = document.getElementById("category").value;
  tasks[taskIndex].subtasks = JSON.parse(JSON.stringify(subtasks));
  await saveTasks();
  renderTasks();
  resetFormToAddMode();
  closeAddTaskOverlay();
  showToast("Task updated successfully");
}

/**
 * Setzt das Formular zurück in den Add-Modus
 */
function resetFormToAddMode() {
  const form = document.getElementById("add-task-form");
  const submitBtn = document.getElementById("create-task-btn");
  const title = document.querySelector(".add-task-title");
  title.textContent = "Add Task";
  submitBtn.textContent = "Create Task";
  form.onsubmit = handleAddTask;
  clearForm();
}
