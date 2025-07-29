const dateEl = document.getElementById("date");
const quoteEl = document.getElementById("quote");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const currentDayEl = document.getElementById("currentDay");
const monthYearEl = document.getElementById("monthYear");
const calendarEl = document.getElementById("calendar");

let currentDay = new Date().toISOString().split("T")[0]; // Default to today (YYYY-MM-DD)
let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

function updateDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateEl.textContent = now.toLocaleDateString(undefined, options);
}

function updateQuote() {
  const quotes = [
    "Believe in yourself!",
    "Stay focused and never give up!",
    "Every day is a fresh start!",
    "Success is the sum of small efforts repeated."
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = quote;
}

function renderTasks() {
  taskList.innerHTML = "";
  (tasks[currentDay] || []).forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task;
    li.onclick = () => deleteTask(index);
    taskList.appendChild(li);
  });
}

function addTask() {
  const task = taskInput.value.trim();
  if (!task) return;
  if (!tasks[currentDay]) tasks[currentDay] = [];
  tasks[currentDay].push(task);
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks[currentDay].splice(index, 1);
  saveTasks();
  renderTasks();
}

function switchDay(day) {
  currentDay = day;
  currentDayEl.textContent = formatDateDisplay(day);
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderCalendar() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = now.getDate();

  monthYearEl.textContent = now.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let calendarHTML = '<table><tr>';
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let day of days) {
    calendarHTML += `<th style="color: black;">${day}</th>`;
  }
  calendarHTML += "</tr><tr>";

  for (let i = 0; i < firstDay; i++) {
    calendarHTML += "<td></td>";
  }

  for (let day = 1; day <= daysInMonth; day++) {
    if ((firstDay + day - 1) % 7 === 0 && day !== 1) {
      calendarHTML += "</tr><tr>";
    }

    // ✅ Timezone-safe: set time to noon to prevent date shifting
    const dateObj = new Date(year, month, day, 12); // 👈 fixed here
    const dateKey = dateObj.toISOString().split("T")[0];
    const isToday = dateKey === new Date().toISOString().split("T")[0] ? 'class="today"' : '';

    calendarHTML += `<td ${isToday} onclick="selectDate('${dateKey}')">${day}</td>`;
  }

  calendarHTML += "</tr></table>";
  calendarEl.innerHTML = calendarHTML;
}

function selectDate(dateKey) {
  currentDay = dateKey;
  currentDayEl.textContent = formatDateDisplay(dateKey);
  renderTasks();
}

function formatDateDisplay(dateStr) {
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toDateString(); // e.g., "Mon Jul 28 2025"
}

updateDate();
updateQuote();
renderCalendar();
selectDate(currentDay); // Load today’s tasks

let clockMode = 'digital24';

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  const digitalClock = document.getElementById("clock");
  const analogClock = document.getElementById("analogClock");

  if (clockMode === "digital24") {
    digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    digitalClock.style.display = "block";
    analogClock.style.display = "none";
  } else if (clockMode === "digital12") {
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
    digitalClock.style.display = "block";
    analogClock.style.display = "none";
  } else if (clockMode === "analog") {
    digitalClock.style.display = "none";
    analogClock.style.display = "block";
    drawAnalogClock();
  }
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

function changeClockMode() {
  clockMode = document.getElementById("clockMode").value;
  updateClock();
}

// Call every second
setInterval(updateClock, 1000);
updateClock();

function drawAnalogClock() {
  const canvas = document.getElementById("analogClock");
  const ctx = canvas.getContext("2d");
  const radius = canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(radius, radius);
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
  ctx.translate(-radius, -radius);
}

function drawFace(ctx, radius) {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawNumbers(ctx, radius) {
  ctx.font = radius * 0.15 + "px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let num = 1; num <= 12; num++) {
    const ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius) {
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();

  // hour
  hour = hour % 12;
  hour = (hour * Math.PI / 6) +
         (minute * Math.PI / (6 * 60)) +
         (second * Math.PI / (360 * 60));
  drawHand(ctx, hour, radius * 0.5, radius * 0.07);

  // minute
  minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
  drawHand(ctx, minute, radius * 0.8, radius * 0.07);

  // second
  second = second * Math.PI / 30;
  drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}
