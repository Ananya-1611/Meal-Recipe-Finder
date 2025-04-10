// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import RecipeCard from './components/RecipeCard';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  // Function to search for recipes
  const searchRecipes = async (query) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Using the MealDB API
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await response.json();
      
      if (data.meals) {
        setRecipes(data.meals);
      } else {
        setRecipes([]);
        setError("No recipes found. Try a different search term.");
      }
    } catch (err) {
      setError("Failed to fetch recipes. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle voice command
  const handleVoiceCommand = (command) => {
    if (command.includes("search for") || command.includes("find") || command.includes("look for")) {
      const query = command.replace(/search for|find|look for/i, "").trim();
      searchRecipes(query);
    } else if (command.includes("read recipe") && selectedRecipe) {
      startVoiceReading();
    } else if (command.includes("stop reading")) {
      stopVoiceReading();
    }
  };

  const selectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    if (voiceMode) {
      const speech = new SpeechSynthesisUtterance(`Recipe found: ${recipe.strMeal}. Would you like me to read the instructions?`);
      window.speechSynthesis.speak(speech);
    }
  };

  const startVoiceReading = () => {
    if (!selectedRecipe) return;
    
    setVoiceMode(true);
    
    // Introduction
    let speech = new SpeechSynthesisUtterance(`Now reading recipe for ${selectedRecipe.strMeal}`);
    window.speechSynthesis.speak(speech);
    
    // Ingredients
    speech = new SpeechSynthesisUtterance("You will need the following ingredients:");
    window.speechSynthesis.speak(speech);
    
    // Get ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = selectedRecipe[`strIngredient${i}`];
      const measure = selectedRecipe[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
    
    speech = new SpeechSynthesisUtterance(ingredients.join(", "));
    window.speechSynthesis.speak(speech);
    
    // Instructions
    speech = new SpeechSynthesisUtterance("Here are the cooking instructions:");
    window.speechSynthesis.speak(speech);
    
    // Split instructions into sentences for better pacing
    const instructions = selectedRecipe.strInstructions.split(/\.\s+/);
    instructions.forEach(instruction => {
      if (instruction.trim() !== "") {
        speech = new SpeechSynthesisUtterance(instruction + ".");
        window.speechSynthesis.speak(speech);
      }
    });
    
    speech = new SpeechSynthesisUtterance("That's all for this recipe. Enjoy your cooking!");
    window.speechSynthesis.speak(speech);
  };

  const stopVoiceReading = () => {
    window.speechSynthesis.cancel();
    setVoiceMode(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meal Recipe Finder</h1>
        <h2>Your Voice-Enabled Cooking Assistant</h2>
      </header>
      
      <div className="main-content">
        <div className="search-section">
          <SearchBar onSearch={searchRecipes} />
          <VoiceAssistant 
            isListening={isListening} 
            setIsListening={setIsListening}
            onCommand={handleVoiceCommand}
          />
        </div>
        
        {loading && <div className="loading">Searching for recipes...</div>}
        {error && <div className="error">{error}</div>}
        
        {!selectedRecipe ? (
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <div key={recipe.idMeal} onClick={() => selectRecipe(recipe)}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : (
          <div className="recipe-detail">
            <button className="back-button" onClick={() => setSelectedRecipe(null)}>
              Back to Results
            </button>
            <h2>{selectedRecipe.strMeal}</h2>
            <div className="recipe-header">
              <img src={selectedRecipe.strMealThumb} alt={selectedRecipe.strMeal} />
              <div className="recipe-info">
                <p><strong>Category:</strong> {selectedRecipe.strCategory}</p>
                <p><strong>Origin:</strong> {selectedRecipe.strArea}</p>
                {selectedRecipe.strTags && (
                  <p><strong>Tags:</strong> {selectedRecipe.strTags.split(',').join(', ')}</p>
                )}
                <div className="voice-controls">
                  <button onClick={startVoiceReading}>
                    Read Recipe Aloud
                  </button>
                  <button onClick={stopVoiceReading}>
                    Stop Reading
                  </button>
                </div>
              </div>
            </div>
            
            <div className="ingredients">
              <h3>Ingredients</h3>
              <ul>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(i => {
                  const ingredient = selectedRecipe[`strIngredient${i}`];
                  const measure = selectedRecipe[`strMeasure${i}`];
                  
                  if (ingredient && ingredient.trim() !== "") {
                    return (
                      <li key={i}>
                        {measure} {ingredient}
                      </li>
                    );
                  }
                  return null;
                }).filter(Boolean)}
              </ul>
            </div>
            
            <div className="instructions">
              <h3>Instructions</h3>
              {selectedRecipe.strInstructions.split(/\n+/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {selectedRecipe.strYoutube && (
              <div className="video">
                <h3>Video Tutorial</h3>
                <a href={selectedRecipe.strYoutube} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;