const API_URL = 'http://localhost:3000';

// Fetch exercises
async function getExercises() {
    try {
        const response = await fetch(`${API_URL}/exercises`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching exercises:', error);
    }
}

// Fetch activity history
async function getHistory() {
    try {
        const response = await fetch(`${API_URL}/history`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

// Save new activity to history
async function saveActivity(activity) {
    try {
        await fetch(`${API_URL}/history`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activity)
        });
        console.log('Activity saved:', activity);
    } catch (error) {
        console.error('Error saving activity:', error);
    }
}

export { getExercises, getHistory, saveActivity };