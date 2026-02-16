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
