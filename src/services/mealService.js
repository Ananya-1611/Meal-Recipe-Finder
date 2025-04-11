const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Search for meals by name
export const searchMealsByName = async (query) => {
  const response = await fetch(`${API_BASE_URL}/search.php?s=${query}`);
  const data = await response.json();
  return data.meals || [];
};

// Get meal details by ID
export const getMealById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
  const data = await response.json();
  return data.meals?.[0] || null;
};

// List all meal categories
export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories.php`);
  const data = await response.json();
  return data.categories || [];
};

// Filter meals by category
export const getMealsByCategory = async (category) => {
  const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
  const data = await response.json();
  return data.meals || [];
};

// Get a random meal
export const getRandomMeal = async () => {
  const response = await fetch(`${API_BASE_URL}/random.php`);
  const data = await response.json();
  return data.meals?.[0] || null;
};

// Helper function to extract ingredients from a meal object
export const extractIngredients = (meal) => {
  if (!meal) return [];
  
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure ? measure.trim() : ''
      });
    }
  }
  
  return ingredients;
};