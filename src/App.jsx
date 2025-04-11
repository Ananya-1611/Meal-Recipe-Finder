import { useState, useEffect, useRef } from 'react';
import SearchBar from './components/SearchBar';
import VoiceAssistant from './components/VoiceAssistant';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import CategoryFilter from './components/CategoryFilter';
import RandomMeal from './components/RandomMeal';
import { searchMealsByName, getCategories, getMealsByCategory } from './services/mealService';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    // Load categories on mount
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    loadCategories();
    
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcriptText = event.results[0][0].transcript;
        setTranscript(transcriptText);
        handleVoiceCommand(transcriptText);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);
  
  // Handle voice commands
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Check if it's asking for a recipe
    if (lowerCommand.includes('search for') || lowerCommand.includes('find recipe for') || 
        lowerCommand.includes('how to make') || lowerCommand.includes('recipe for')) {
      let searchTerm = lowerCommand
        .replace('search for', '')
        .replace('find recipe for', '')
        .replace('how to make', '')
        .replace('recipe for', '')
        .trim();
      
      if (searchTerm) {
        searchRecipes(searchTerm);
        speak(`Searching for ${searchTerm} recipes`);
      }
    } 
    // Check if it's asking for a random recipe
    else if (lowerCommand.includes('random recipe') || lowerCommand.includes('surprise me')) {
      handleRandomMeal();
      speak('Here is a random recipe for you.');
    }
    // Check if it's asking for categories
    else if (lowerCommand.includes('show categories') || lowerCommand.includes('list categories')) {
      speak(`Available categories are: ${categories.map(cat => cat.strCategory).join(', ')}`);
    }
    // Check if it's filtering by category
    else if (lowerCommand.includes('show') && lowerCommand.includes('recipes')) {
      const category = lowerCommand.replace('show', '').replace('recipes', '').trim();
      const matchedCategory = categories.find(cat => 
        cat.strCategory.toLowerCase().includes(category)
      );
      
      if (matchedCategory) {
        filterByCategory(matchedCategory.strCategory);
        speak(`Showing ${matchedCategory.strCategory} recipes`);
      }
    }
    // Check if it's asking to read the recipe
    else if (selectedRecipe && (lowerCommand.includes('read recipe') || lowerCommand.includes('read instructions'))) {
      readRecipeInstructions();
    }
    // Check if it's asking for help
    else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      speak('I can help you find recipes. Try saying "search for pasta", "random recipe", "show categories", or "read instructions" when viewing a recipe.');
    }
    // Default response for unrecognized commands
    else {
      speak('Sorry, I didn\'t understand that command. Try saying "help" to learn what I can do.');
    }
  };
  
  // Start listening for voice commands
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };
  
  // Stop listening for voice commands
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  // Speak text using speech synthesis
  const speak = (text) => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    synth.speak(utterance);
  };
  
  // Read recipe instructions aloud
  const readRecipeInstructions = () => {
    if (!selectedRecipe) return;
    
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = selectedRecipe[`strIngredient${i}`];
      const measure = selectedRecipe[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push(`${measure ? measure : ''} ${ingredient}`);
      }
    }
    
    const recipeText = `
      Recipe for ${selectedRecipe.strMeal}.
      Here are the ingredients you'll need: ${ingredients.join(', ')}.
      Now for the instructions: ${selectedRecipe.strInstructions}
    `;
    
    speak(recipeText);
  };

  // Function to search recipes by name
  const searchRecipes = async (query) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    setSelectedRecipe(null);
    setSelectedCategory('');
    
    try {
      const mealsData = await searchMealsByName(query);
      if (mealsData.length > 0) {
        setRecipes(mealsData);
      } else {
        setRecipes([]);
        setError('No recipes found. Try a different search term.');
        speak('No recipes found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(err);
      speak('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to filter recipes by category
  const filterByCategory = async (category) => {
    setLoading(true);
    setError(null);
    setSelectedRecipe(null);
    setSelectedCategory(category);
    
    try {
      const mealsData = await getMealsByCategory(category);
      if (mealsData.length > 0) {
        setRecipes(mealsData);
      } else {
        setRecipes([]);
        setError(`No recipes found in ${category} category.`);
        speak(`No recipes found in ${category} category.`);
      }
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(err);
      speak('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get a random meal
  const handleRandomMeal = async () => {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();
      
      if (data.meals && data.meals.length > 0) {
        setSelectedRecipe(data.meals[0]);
      }
    } catch (err) {
      console.error('Error fetching random meal:', err);
      speak('Error fetching random meal. Please try again.');
    }
  };

  // Handle when a recipe is clicked
  const handleRecipeClick = async (recipeId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
      const data = await response.json();
      
      if (data.meals && data.meals.length > 0) {
        setSelectedRecipe(data.meals[0]);
      } else {
        setError('Recipe details not found.');
        speak('Recipe details not found.');
      }
    } catch (err) {
      setError('Failed to fetch recipe details. Please try again.');
      console.error(err);
      speak('Failed to fetch recipe details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset selected recipe to return to the list view
  const handleBackClick = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Meal Recipe Finder</h1>
        <p>Ask me for any recipe and I'll help you cook!</p>
        <VoiceAssistant 
          isListening={isListening}
          transcript={transcript}
          speaking={speaking}
          startListening={startListening}
          stopListening={stopListening}
        />
      </header>
      
      <main>
        <div className="search-container">
          <SearchBar onSearch={searchRecipes} />
          
          <div className="filters">
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory}
              onSelectCategory={filterByCategory} 
            />
            <RandomMeal onRandomMeal={handleRandomMeal} />
          </div>
        </div>
        
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && !selectedRecipe && recipes.length > 0 && (
          <RecipeList recipes={recipes} onRecipeClick={handleRecipeClick} />
        )}
        
        {!loading && !error && selectedRecipe && (
          <RecipeDetails 
            recipe={selectedRecipe} 
            onBackClick={handleBackClick} 
            onReadRecipe={readRecipeInstructions}
          />
        )}
        
        {!loading && !error && !selectedRecipe && recipes.length === 0 && !error && (
          <div className="empty-state">
            <p>Try saying "Search for pasta" or "Find recipe for chicken"</p>
            <p>Or click the microphone icon and speak your request!</p>
          </div>
        )}
      </main>
      
      <footer>
        <p>Powered by TheMealDB API and Web Speech API</p>
      </footer>
    </div>
  );
}

export default App;