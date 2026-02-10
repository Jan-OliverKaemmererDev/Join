let selectedPriority = "medium";
let subtasks = [];

function initAddTask() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  updateHeaderInitials(currentUser);
  setMinimumDate();
  validateForm();
}

function setMinimumDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("due-date").setAttribute("min", today);
}

function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

function getInitialsFromName(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function selectPriority(priority) {
  const buttons = document.querySelectorAll(".priority-btn");
  removeActiveFromAll(buttons);
  addActiveToSelected(priority);
}

function removeActiveFromAll(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
}

function addActiveToSelected(priority) {
  const selectedBtn = document.querySelector("[data-priority=\"" + priority + "\"]");
  if (selectedBtn) {
    selectedBtn.classList.add("active");
    selectedPriority = priority;
  }
}

function addSubtask() {
  const input = document.getElementById("subtask-input");
  const subtaskText = input.value.trim();
  if (subtaskText === "") {
    return;
  }
  const subtask = createSubtask(subtaskText);
  subtasks.push(subtask);
  input.value = "";
  renderSubtasks();
}

function createSubtask(text) {
  return {
    id: Date.now(),
    text: text,
    completed: false,
  };
}

function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  list.innerHTML = "";
  for (let i = 0; i < subtasks.length; i++) {
    appendSubtaskToList(list, subtasks[i]);
  }
}

function appendSubtaskToList(list, subtask) {
  const li = document.createElement("li");
  li.className = "subtask-item";
  li.innerHTML = getSubtaskItemTemplate(subtask);
  list.appendChild(li);
}

function removeSubtask(id) {
  subtasks = filterSubtasks(id);
  renderSubtasks();
}

function filterSubtasks(id) {
  const filtered = [];
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].id !== id) {
      filtered.push(subtasks[i]);
    }
  }
  return filtered;
}

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

function handleAddTask(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("Please log in to create tasks");
    return;
  }
  const task = buildTask(currentUser);
  saveTask(currentUser.id, task);
  showToast("Task added to board");
  dispatchTaskAddedEvent(task);
  clearForm();
}

function buildTask(currentUser) {
  return {
    id: Date.now(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("due-date").value,
    priority: selectedPriority,
    assignedTo: document.getElementById("assigned-to").value,
    category: document.getElementById("category").value,
    subtasks: copySubtasks(),
    status: "todo",
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
  };
}

function copySubtasks() {
  const copy = [];
  for (let i = 0; i < subtasks.length; i++) {
    copy.push(subtasks[i]);
  }
  return copy;
}

function dispatchTaskAddedEvent(task) {
  window.dispatchEvent(new CustomEvent("taskAdded", { detail: { task: task } }));
}

function saveTask(userId, task) {
  const tasksKey = "join_tasks_" + userId;
  let tasks = loadExistingTasks(tasksKey);
  tasks.push(task);
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  console.log("Task saved:", task);
}

function loadExistingTasks(tasksKey) {
  const tasksJson = localStorage.getItem(tasksKey);
  if (tasksJson) {
    return JSON.parse(tasksJson);
  }
  return [];
}

function clearForm() {
  const form = document.getElementById("add-task-form");
  if (form) form.reset();
  selectPriority("medium");
  subtasks = [];
  renderSubtasks();
  validateForm();
}

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

function createToastElement() {
  const toast = document.createElement("div");
  toast.id = "toast-message";
  toast.className = "toast-message d-none";
  document.body.appendChild(toast);
  return toast;
}

function hideToastAfterDelay(toast) {
  setTimeout(function() {
    toast.classList.add("d-none");
  }, 3000);
}
