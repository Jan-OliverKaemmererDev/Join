let tasks = [];
let currentDraggedTaskId = null;

function initBoard() {
  loadTasks();
  renderTasks();
  checkUser();
  setupTaskAddedListener();
}

function setupTaskAddedListener() {
  window.addEventListener("taskAdded", function() {
    closeAddTaskOverlay();
    loadTasks();
    renderTasks();
  });
}

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

function clearAllColumns() {
  document.getElementById("todo-list").innerHTML = "";
  document.getElementById("inprogress-list").innerHTML = "";
  document.getElementById("awaitfeedback-list").innerHTML = "";
  document.getElementById("done-list").innerHTML = "";
}

function renderTasks() {
  clearAllColumns();
  let counts = { todo: 0, inprogress: 0, awaitfeedback: 0, done: 0 };
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    renderTaskCard(task, counts);
  }
  renderAllEmptyStates(counts);
}

function renderTaskCard(task, counts) {
  const cardHtml = generateTaskCardHtml(task);
  const listId = task.status + "-list";
  const listElement = document.getElementById(listId);
  if (listElement) {
    listElement.innerHTML += cardHtml;
    counts[task.status]++;
  }
}

function renderAllEmptyStates(counts) {
  renderEmptyState("todo", counts.todo, "No tasks To do");
  renderEmptyState("inprogress", counts.inprogress, "No tasks In progress");
  renderEmptyState("awaitfeedback", counts.awaitfeedback, "No tasks Await feedback");
  renderEmptyState("done", counts.done, "No tasks Done");
}

function renderEmptyState(status, count, message) {
  const list = document.getElementById(status + "-list");
  if (count === 0 && list) {
    list.innerHTML = getNoTasksTemplate(message);
  }
}

function generateTaskCardHtml(task) {
  const categoryClass = getCategoryClass(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const progressHtml = generateProgressHtml(task);
  const priorityIcon = getPriorityIcon(task.priority);
  const assigneesHtml = generateAssigneesHtml(task);
  return getTaskCardTemplate(task, categoryClass, categoryLabel, progressHtml, assigneesHtml, priorityIcon);
}

function getCategoryClass(category) {
  return category === "user-story" ? "category-user-story" : "category-technical";
}

function getCategoryLabel(category) {
  return category === "user-story" ? "User Story" : "Technical Task";
}

function generateProgressHtml(task) {
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = countCompletedSubtasks(task.subtasks);
    const total = task.subtasks.length;
    return getProgressBarTemplate(completed, total);
  }
  return "";
}

function countCompletedSubtasks(subtasks) {
  let count = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].completed) {
      count++;
    }
  }
  return count;
}

function generateAssigneesHtml(task) {
  if (task.assignedTo) {
    const initials = getInitialsFromName(task.assignedTo || "U");
    return getAssigneeBadgeTemplate(initials);
  }
  return "";
}

function getPriorityIcon(priority) {
  if (priority === "urgent") {
    return getUrgentPriorityIcon();
  } else if (priority === "medium") {
    return getMediumPriorityIcon();
  } else {
    return getLowPriorityIcon();
  }
}

function startDragging(id) {
  currentDraggedTaskId = id;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function highlight(id) {
  document.getElementById(id).classList.add("drag-over");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-over");
}

function findTaskById(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      return i;
    }
  }
  return -1;
}

function moveTo(status) {
  const taskIndex = findTaskById(currentDraggedTaskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    saveTasks();
    renderTasks();
  }
  currentDraggedTaskId = null;
}

function drop(ev, status) {
  ev.preventDefault();
  removeHighlight(status + "-list");
  moveTo(status);
}

function saveTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const tasksKey = "join_tasks_" + currentUser.id;
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
}

function openAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.add("active");
}

function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("active");
}

function findTask(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      return tasks[i];
    }
  }
  return null;
}

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

function buildSubtasksHtml(task) {
  let subtasksHtml = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    const st = task.subtasks[i];
    subtasksHtml += getSubtaskItemDetailTemplate(task.id, i, st);
  }
  return subtasksHtml;
}

function closeTaskDetails() {
  document.getElementById("task-details-overlay").classList.remove("active");
}

function toggleSubtask(taskId, subtaskIndex) {
  const task = findTask(taskId);
  if (task) {
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(taskId) {
  tasks = filterOutTask(taskId);
  saveTasks();
  renderTasks();
  closeTaskDetails();
}

function filterOutTask(taskId) {
  const filtered = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== taskId) {
      filtered.push(tasks[i]);
    }
  }
  return filtered;
}

function searchTasks() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const cards = document.querySelectorAll(".task-card");
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    filterCard(card, query);
  }
}

function filterCard(card, query) {
  const title = card.querySelector(".task-title").innerText.toLowerCase();
  const desc = card.querySelector(".task-description").innerText.toLowerCase();
  if (title.includes(query) || desc.includes(query)) {
    card.style.display = "flex";
  } else {
    card.style.display = "none";
  }
}
