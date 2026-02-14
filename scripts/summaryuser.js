/**
 * Initialisiert die Summary-Seite für angemeldete Benutzer
 */
function initSummaryUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
  updateUserName(currentUser);
  updateUserInitials(currentUser);
  updateGreeting();
  updateTaskMetrics(currentUser);
  checkMobileGreeting();
}

/**
 * Aktualisiert den Benutzernamen auf der Seite
 * @param {Object} user - Das Benutzer-Objekt
 */
function updateUserName(user) {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
}

/**
 * Aktualisiert die Benutzer-Initialen im Header
 * @param {Object} user - Das Benutzer-Objekt
 */
function updateUserInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitials(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Generiert Initialen aus einem Namen
 * @param {string} name - Der vollständige Name
 * @returns {string} Die generierten Initialen
 */
function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

/**
 * Aktualisiert die Begrüßungsnachricht basierend auf der Tageszeit
 */
function updateGreeting() {
  const hour = new Date().getHours();
  const currentUser = getCurrentUser();
  const isGuest = currentUser && currentUser.id === "guest";

  let greeting = "Good evening";
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  greeting += isGuest ? "!" : ",";

  const greetingElement = document.getElementById("greeting-text");
  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

/**
 * Aktualisiert die Task-Metriken auf der Summary-Seite
 * @param {Object} user - Das Benutzer-Objekt
 */
function updateTaskMetrics(user) {
  const userTasks = getUserTasks(user.id);
  const metrics = calculateTaskMetrics(userTasks);
  document.getElementById("count-todo").textContent = metrics.todo;
  document.getElementById("count-done").textContent = metrics.done;
  document.getElementById("count-urgent").textContent = metrics.urgent;
  document.getElementById("count-board").textContent = metrics.board;
  document.getElementById("count-progress").textContent = metrics.progress;
  document.getElementById("count-awaiting").textContent = metrics.awaiting;
  const deadlineElement = document.getElementById("next-deadline");
  if (metrics.nextDeadline) {
    deadlineElement.textContent = metrics.nextDeadline;
  } else {
    deadlineElement.textContent = "No upcoming deadline";
  }
}

/**
 * Ruft die Tasks eines Benutzers ab
 * @param {string} userId - Die ID des Benutzers
 * @returns {Array} Array mit den Tasks des Benutzers
 */
function getUserTasks(userId) {
  const tasksKey = "join_tasks_" + userId;
  const tasksJson = localStorage.getItem(tasksKey);
  if (tasksJson) {
    return JSON.parse(tasksJson);
  }
  return [];
}

/**
 * Berechnet die Task-Metriken aus einem Task-Array
 * @param {Array} tasks - Array mit Tasks
 * @returns {Object} Objekt mit berechneten Metriken
 */
function calculateTaskMetrics(tasks) {
  const metrics = {
    todo: 0,
    done: 0,
    urgent: 0,
    board: 0,
    progress: 0,
    awaiting: 0,
    nextDeadline: null,
  };
  if (!tasks || tasks.length === 0) {
    return metrics;
  }
  let nearestDeadline = null;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    processTaskStatus(task, metrics);
    countUrgentTasks(task, metrics);
    trackNearestDeadline(task, nearestDeadline);
  }
  metrics.board = tasks.length;
  if (nearestDeadline) {
    metrics.nextDeadline = formatDeadline(nearestDeadline);
  }
  return metrics;
}

/**
 * Verarbeitet den Status eines Tasks und aktualisiert die Metriken
 * @param {Object} task - Das Task-Objekt
 * @param {Object} metrics - Das Metriken-Objekt
 */
function processTaskStatus(task, metrics) {
  switch (task.status) {
    case "todo":
      metrics.todo++;
      break;
    case "done":
      metrics.done++;
      break;
    case "inprogress":
      metrics.progress++;
      break;
    case "awaitfeedback":
      metrics.awaiting++;
      break;
  }
}

/**
 * Zählt dringende Tasks in den Metriken
 * @param {Object} task - Das Task-Objekt
 * @param {Object} metrics - Das Metriken-Objekt
 */
function countUrgentTasks(task, metrics) {
  if (task.priority === "urgent") {
    metrics.urgent++;
  }
}

/**
 * Verfolgt die nächste Deadline
 * @param {Object} task - Das Task-Objekt
 * @param {string|null} nearestDeadline - Die aktuell nächste Deadline
 * @returns {string|null} Die aktualisierte nächste Deadline
 */
function trackNearestDeadline(task, nearestDeadline) {
  if (task.dueDate) {
    const taskDate = new Date(task.dueDate);
    if (!nearestDeadline || taskDate < new Date(nearestDeadline)) {
      nearestDeadline = task.dueDate;
    }
  }
  return nearestDeadline;
}

/**
 * Formatiert eine Deadline für die Anzeige
 * @param {string} deadline - Die Deadline als String
 * @returns {string} Die formatierte Deadline
 */
function formatDeadline(deadline) {
  const date = new Date(deadline);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Meldet den Benutzer ab und leitet zur Login-Seite
 */
function logoutFromSummary() {
  logoutUser();
  window.location.href = "index.html";
}
/**
 * Initialisiert die Summary-Seite (Legacy-Support)
 */
function initSummary() {
  updateGreeting();
  renderTaskMetrics();
}

/**
 * Rendert die Task-Metriken auf der Seite (Fallback oder Gast-View)
 */
function renderTaskMetrics() {
  const elements = {
    "count-todo": "1",
    "count-done": "1",
    "count-urgent": "1",
    "count-board": "5",
    "count-progress": "2",
    "count-awaiting": "2",
    "next-deadline": "October 16, 2022",
  };

  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = value;
    }
  }
}

/**
 * Überprüft, ob die mobile Begrüßungs-Animation angezeigt werden soll
 */
function checkMobileGreeting() {
  const showGreeting = sessionStorage.getItem("showJoinGreeting");
  const isMobile = window.innerWidth <= 780;

  if (showGreeting !== "true") {
    return;
  }

  // Consume the login greeting flag on first page load after login.
  // This prevents showing the welcome overlay again on reload.
  sessionStorage.removeItem("showJoinGreeting");

  if (isMobile) {
    const greetingContainer = document.querySelector(".greeting-container");
    if (greetingContainer) {
      greetingContainer.classList.add("mobile-greeting-overlay");

      setTimeout(() => {
        greetingContainer.classList.add("fade-out");
        setTimeout(() => {
          greetingContainer.classList.remove("mobile-greeting-overlay");
          greetingContainer.classList.remove("fade-out");
        }, 600);
      }, 2000);
    }
  }
}
