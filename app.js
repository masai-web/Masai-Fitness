import { getExercises, getHistory, saveActivity } from './api.js';

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
const currentDateEl = document.getElementById('current-date');
const stepInput = document.getElementById('step-input');

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

document.getElementById('exercise-input').addEventListener('mouseover', async () => {
    const exercises = await getExercises();
    alert(`Try these: ${exercises.map(e => e.name).join(', ')}`);
});

stepInput.addEventListener('input', (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
        stepCountEl.textContent = value;
    }
});

let state = { steps: 0, calories: 0, dailyGoal: 10000, history: [] };

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
    setupEventListeners();
    displayCurrentDate();
});

async function calculateExerciseCalories() {
    const exercise = exerciseInput.value.trim();
    const duration = parseInt(durationInput.value);
    if (!exercise || !duration) {
        alert('Please enter both an exercise and duration');
        return;
    }

    const exercises = await getExercises();
    const match = exercises.find(e => e.name.toLowerCase() === exercise.toLowerCase());
    if (match) {
        const caloriesBurned = (match.calories / match.duration) * duration;
        displayExerciseResults(match, duration, caloriesBurned);
    } else {
        alert('Exercise not found in database');
    }
}

async function resetSteps() {
    await saveActivity({ date: new Date().toLocaleDateString(), steps: state.steps, calories: state.calories });
    state.steps = 0;
    state.calories = 0;
    saveState();
    updateUI();
}

function displayCurrentDate() {
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}