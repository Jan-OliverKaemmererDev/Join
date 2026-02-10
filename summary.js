function initSummary() {
    updateGreeting();
    renderTaskMetrics();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Good evening,";
    if (hour < 12) {
        greeting = "Good morning,";
    } else if (hour < 18) {
        greeting = "Good afternoon,";
    }
    document.getElementById('greeting-text').innerText = greeting;
}

function renderTaskMetrics() {
    document.getElementById('count-todo').innerText = "1";
    document.getElementById('count-done').innerText = "1";
    document.getElementById('count-urgent').innerText = "1";
    document.getElementById('count-board').innerText = "5";
    document.getElementById('count-progress').innerText = "2";
    document.getElementById('count-awaiting').innerText = "2";
    document.getElementById('next-deadline').innerText = "October 16, 2022";
}
