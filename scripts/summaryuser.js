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
}

function updateUserName(user) {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
}

function updateUserInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitials(user.name);
    initialsElement.textContent = initials;
  }
}

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

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good evening,";
  if (hour < 12) {
    greeting = "Good morning,";
  } else if (hour < 18) {
    greeting = "Good afternoon,";
  }
  const greetingElement = document.getElementById("greeting-text");
  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

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

function getUserTasks(userId) {
  const tasksKey = "join_tasks_" + userId;
  const tasksJson = localStorage.getItem(tasksKey);
  if (tasksJson) {
    return JSON.parse(tasksJson);
  }
  return [];
}

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

function countUrgentTasks(task, metrics) {
  if (task.priority === "urgent") {
    metrics.urgent++;
  }
}

function trackNearestDeadline(task, nearestDeadline) {
  if (task.dueDate) {
    const taskDate = new Date(task.dueDate);
    if (!nearestDeadline || taskDate < new Date(nearestDeadline)) {
      nearestDeadline = task.dueDate;
    }
  }
  return nearestDeadline;
}

function formatDeadline(deadline) {
  const date = new Date(deadline);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function logoutFromSummary() {
  logoutUser();
  window.location.href = "index.html";
}
