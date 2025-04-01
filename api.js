// api.js
const API_URL = 'http://localhost:3000';

// Fetch exercises from the local API
export async function fetchExercises() {
  try {
    const response = await fetch(`${API_URL}/exercises`);
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
}

// Save a new activity to the history endpoint
export async function saveActivity(activity) {
  try {
    const response = await fetch(`${API_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error saving activity:', error);
  }
}

// Fetch activity history
export async function fetchHistory() {
  try {
    const response = await fetch(`${API_URL}/history`);
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}