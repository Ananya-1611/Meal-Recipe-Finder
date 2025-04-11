function RecipeDetails({ recipe, onBackClick, onReadRecipe }) {
    // Process ingredients from recipe object
    const getIngredients = () => {
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
          ingredients.push({
            name: ingredient,
            measure: measure || ''
          });
        }
      }
      return ingredients;
    };
    
    // Format instructions by splitting into paragraphs
    const formatInstructions = (instructions) => {
      if (!instructions) return [];
      return instructions.split(/\r\n|\n|\r/).filter(step => step.trim() !== '');
    };
    
    const ingredients = getIngredients();
    const instructions = formatInstructions(recipe.strInstructions);
    
    return (
      <div className="recipe-details">
        <div className="recipe-actions">
          <button className="back-button" onClick={onBackClick}>
            ← Back to Results
          </button>
          <button className="read-button" onClick={onReadRecipe} title="Read recipe aloud">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Read Recipe
          </button>
        </div>
        
        <div className="recipe-header">
          <h2>{recipe.strMeal}</h2>
          <div className="recipe-meta">
            {recipe.strCategory && <span className="tag">{recipe.strCategory}</span>}
            {recipe.strArea && <span className="tag">{recipe.strArea}</span>}
            {recipe.strTags && 
              recipe.strTags.split(',').map((tag, index) => (
                <span key={index} className="tag">{tag.trim()}</span>
              ))
            }
          </div>
        </div>
        
        <div className="recipe-content">
          <div className="recipe-image">
            <img src={recipe.strMealThumb} alt={recipe.strMeal} />
            
            {recipe.strYoutube && (
              <a 
                href={recipe.strYoutube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="youtube-link"
              >
                Watch Video Tutorial
              </a>
            )}
          </div>
          
          <div className="recipe-info">
            <div className="ingredients">
              <h3>Ingredients</h3>
              <ul>
                {ingredients.map((item, index) => (
                  <li key={index}>
                    <span className="measure">{item.measure}</span> 
                    <span className="ingredient">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="instructions">
              <h3>Instructions</h3>
              {instructions.length > 0 ? (
                <ol>
                  {instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p>{recipe.strInstructions}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default RecipeDetails;
  
  