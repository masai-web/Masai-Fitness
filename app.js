import { fetchExercises, saveActivity, fetchHistory } from './api.js';

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
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
          x: {
            display: true,
            title: { display: true, text: 'Date' },
          },
        },
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

// Sync data between json-server and localStorage
async function syncData() {
  try {
    const serverData = await fetchHistory();
    localStorage.setItem('stepTrackState', JSON.stringify(serverData));
    state.history = serverData;
  } catch (error) {
    console.warn('Using offline data from localStorage:', error);
    const localData = localStorage.getItem('stepTrackState');
    if (localData) {
      state.history = JSON.parse(localData);
    }
  }
}

// Save activity to json-server and localStorage
async function saveActivityToBothStorage(activity) {
  const localData = JSON.parse(localStorage.getItem('stepTrackState')) || [];
  localData.push(activity);
  localStorage.setItem('stepTrackState', JSON.stringify(localData));
  try {
    await saveActivity(activity);
  } catch (error) {
    console.error('Failed to save activity to API. Saved locally instead:', error);
  }
}

// Update UI elements
function updateUI() {
  stepCountEl.textContent = state.steps;
  calorieCountEl.textContent = state.calories;

  // Ensure progressPercentage is a valid number
  let progressPercentage = (state.dailyGoal > 0)
    ? Math.min(Math.round((state.steps / state.dailyGoal) * 100), 100)
    : 0;

  if (!isFinite(progressPercentage)) {
    progressPercentage = 0; // Fallback for invalid calculations
  }

  goalProgressEl.value = progressPercentage; // Assign only valid values
  goalPercentageEl.textContent = `${progressPercentage}%`;

  updateChart();
}

// Update Chart.js chart with activity history data
function updateChart() {
  if (stepsChart) {
    const last7 = state.history.slice(-7);
    stepsChart.data.labels = last7.map(item => item.date || 'Unknown');
    stepsChart.data.datasets[0].data = last7.map(item => item.steps || 0);
    stepsChart.update();
  }
}

// Reset steps and log activity
async function resetSteps() {
  const today = new Date().toLocaleDateString();
  const newActivity = { date: today, steps: state.steps, calories: state.calories };

  await saveActivityToBothStorage(newActivity);

  state.steps = 0;
  state.calories = 0;
  saveState();
  updateUI();
}

// Display the current date
function displayCurrentDate() {
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Event Listeners
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

stepInputEl.addEventListener('input', (e) => {
  const value = parseInt(e.target.value, 10);
  if (!isNaN(value) && value >= 0) {
    state.steps = value;
    updateUI();
  } else {
    console.error('Invalid step input:', e.target.value);
    stepCountEl.textContent = '0'; // Fallback to default value
  }
});

addStepsBtn.addEventListener('click', () => {
  const addedSteps = Math.floor(Math.random() * 1501) + 500;
  if (!isNaN(addedSteps) && addedSteps > 0) {
    state.steps += addedSteps;
    state.calories += Math.round(addedSteps * 0.04);
    saveState();
    updateUI();
  }
});

resetStepsBtn.addEventListener('click', resetSteps);

setGoalBtn.addEventListener('click', () => {
  const goal = parseInt(goalInput.value, 10);
  if (!isNaN(goal) && goal > 0) {
    state.dailyGoal = goal;
    saveState();
    updateUI();
    goalInput.value = ''; // Clear input field
  } else {
    alert('Please enter a valid daily goal.');
  }
});

calculateExerciseBtn.addEventListener('click', async () => {
  const exerciseName = exerciseInput.value.trim().toLowerCase();
  const duration = parseInt(durationInput.value, 10);
  if (!exerciseName || isNaN(duration) || duration <= 0) {
    alert('Please enter valid exercise details.');
    return;
  }
  const exercises = await fetchExercises();
  const match = exercises.find(e => e.name.toLowerCase() === exerciseName);
  if (match) {
    const caloriesBurned = (match.calories / match.duration) * duration;
    displayExerciseResults(match, duration, caloriesBurned);
    state.calories += Math.round(caloriesBurned);
    saveState();
    updateUI();
  } else {
    alert('Exercise not found in the database.');
  }
});

// Display exercise calculation results
function displayExerciseResults(exercise, duration, caloriesBurned) {
  exerciseResultsEl.innerHTML = `
    <h3>Exercise: ${exercise.name}</h3>
    <p>Duration: ${duration} minutes</p>
    <p>Estimated Calories Burned: ${caloriesBurned.toFixed(1)}</p>
    <p>(Based on ${exercise.calories} calories per ${exercise.duration} minutes)</p>
  `;
  state.calories += Math.round(caloriesBurned);
  saveState();
  updateUI();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  await syncData();
  loadState();
  updateUI();
  displayCurrentDate();
  initializeChart();
});