📝 PROJECT OVERVIEW
This Phase 1 Project is a Single Page Application (SPA) built with:  
✅ *HTML5, CSS3, JavaScript 
✅ *External Fitness API* for exercise data  
✅ *Responsive Design*  

LEARNING GOALS 
- Fetch and display data from an external API  
- Implement dynamic DOM manipulation  
- Debug and resolve API integration issues  


 Features
- *Exercise Search* – Fetch and display workouts from an API.  
- *Workout Logging* – Save exercises to a local list.  
- *Progress Tracking* – View workout history.  
- *Responsive UI* – Works on mobile & desktop.  

---

 Installation
1. Clone the repo:
   bash
   git clone https://github.com/masai
   
     

2. Run a live server (e.g., VS Code Live Server or http-server):
   bash
   npm install -g http-server  
   http-server
     

3. Open in browser:
   Visit → http://localhost:3000/exercises


Usage 
1. Search for exercises via the API.  
2. Add exercises to your workout log.  
3. Track progress in the history section.  


## *📡 API Integration*  
API Used: (or your chosen API)  

Example Fetch Request:
javascript
fetch(API_URL, {
  headers: {
    "X-RapidAPI-Key": "API_URL",
  },
})
.then(res => res.json())
.then(data => displayExercises(data));


---

## *🤝 Contributing*  
1. Fork the repository.  
2. Create a feature branch (git checkout -b feature/new-feature).  
3. Commit changes (git commit -m "Add new feature").  
4. Push to branch (git push origin feature/new-feature).  
5. Open a *Pull Request*.  
