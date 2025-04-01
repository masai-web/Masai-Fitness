// app.js
import { fetchExercises, saveActivity, fetchHistory } from '/api.js';

const stepCountEl = document.getElementById('step-count');
const calorieCountEl = document.getElementById('calorie-count');
const goalProgressEl = document.getElementById('goal-progress');
const goalPercentageEl = document.getElementById('goal-percentage');
const addStepsBtn = document.getElementById('add-steps');
const resetStepsBtn = document.getElementById('reset-steps');
const goalInput = document.getElementById('goal-input');
const setGoalBtn = document.getElementById('set-goal');
const exerciseInput = document.getElementById('exercise-input');
const durationInput = document.getElementById('duration-input');
const calculateExerciseBtn = document.getElementById('calculate-exercise');
const exerciseResultsEl = document.getElementById('exercise-results');
const currentDateEl = document.getElementById('current-date');
const stepInputEl = document.getElementById('step-input');
const themeToggleBtn = document.getElementById('theme-toggle');
const stepsChartCanvas = document.getElementById('steps-chart');

// Application state
let state = {
  steps: 0,
  calories: 0,
  dailyGoal: 10000,
  history: []
};

let stepsChart;

// Initialize Chart.js chart
function initializeChart() {
  if (typeof Chart !== 'undefined') {
    stepsChart = new Chart(stepsChartCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Daily Steps',
            data: [],
            borderColor: 'blue',
            backgroundColor: 'rgba(0,123,255,0.5)',
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
          x: {
            display: true,
            title: { display: true, text: 'Date' },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('stepTrackState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const stored = localStorage.getItem('stepTrackState');
  if (stored) {
    state = JSON.parse(stored);
  }
}

// Update UI elements
function updateUI() {
  stepCountEl.textContent = state.steps;
  calorieCountEl.textContent = state.calories;
  const progressPercentage = Math.min(Math.round((state.steps / state.dailyGoal) * 100), 100);
  goalProgressEl.value = progressPercentage;
  goalPercentageEl.textContent =` ${progressPercentage}%`;

  updateChart();
}

// Update the Chart.js chart with activity history data
function updateChart() {
  if (stepsChart) {
    // Using the last 7 entries from history
    const last7 = state.history.slice(-7);
    stepsChart.data.labels = last7.map((item) => item.date);
    stepsChart.data.datasets[0].data = last7.map((item) => item.steps);
    stepsChart.update();
  }
}

// Display the current date in the header
function displayCurrentDate() {
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ----------------------
// Event Listeners
// ----------------------

// 1. Toggle Theme
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

// 2. Live Step Input: Update the step counter display as you type
stepInputEl.addEventListener('input', (e) => {
  const value = parseInt(e.target.value);
  if (!isNaN(value)) {
    stepCountEl.textContent = value;
  }
});

// 3. Exercise Input Hover: Show available exercises from API
exerciseInput.addEventListener('mouseover', async () => {
  const exercises = await fetchExercises();
  if (exercises && exercises.length > 0) {
    alert(`Available exercises: ${exercises.map((ex) => ex.name).join(', ')}`);
  }
});

// 4. Add Steps: Simulate adding a random number of steps
addStepsBtn.addEventListener('click', () => {
  const addedSteps = Math.floor(Math.random() * 1501) + 500; // Random between 500 and 2000
  state.steps += addedSteps;
  state.calories += Math.round(addedSteps * 0.04); // Rough calories burned estimate
  saveState();
  updateUI();
});

// 5. Set Daily Goal
setGoalBtn.addEventListener('click', () => {
  const goal = parseInt(goalInput.value);
  if (goal > 0) {
    state.dailyGoal = goal;
    saveState();
    updateUI();
    goalInput.value = '';
  } else {
    alert('Please enter a valid daily goal.');
  }
});

// 6. Calculate Exercise Calories using API data
calculateExerciseBtn.addEventListener('click', async () => {
  const exerciseName = exerciseInput.value.trim().toLowerCase();
  const duration = parseInt(durationInput.value);
  if (!exerciseName || isNaN(duration) || duration <= 0) {
    alert('Please enter valid exercise details.');
    return;
  }
  const exercises = await fetchExercises();
  const match = exercises.find((e) => e.name.toLowerCase() === exerciseName);
  if (match) {
    const caloriesBurned = (match.calories / match.duration) * duration;
    displayExerciseResults(match, duration, caloriesBurned);
  } else {
    alert('Exercise not found in the database.');
  }
});

// 7. Reset Steps: Log today’s activity to the history and reset counters
resetStepsBtn.addEventListener('click', async () => {
  const today = new Date().toLocaleDateString('en-US');
  const newActivity = { date: today, steps: state.steps, calories: state.calories };
  // Save to API
  await saveActivity(newActivity);
  // Also update local state history
  state.history.push(newActivity);
  state.steps = 0;
  state.calories = 0;
  saveState();
  updateUI();
});

// Utility: Display exercise calculation results
function displayExerciseResults(exercise, duration, caloriesBurned) {
  exerciseResultsEl.innerHTML = `
    <h3>Exercise: ${exercise.name}</h3>
    <p>Duration: ${duration} minutes</p>
    <p>Estimated Calories Burned: ${caloriesBurned.toFixed(1)}</p>
    <p>(Based on ${exercise.calories} calories per ${exercise.duration} minutes)</p>
  `;
  // Add the calculated calories to the overall calorie counter
  state.calories += Math.round(caloriesBurned);
  saveState();
  updateUI();
}

// ----------------------
// Initialize the App
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateUI();
  displayCurrentDate();
  initializeChart();
});