function RecipeList({ recipes, onRecipeClick }) {
  return (
    <div className="recipe-list">
      {recipes.map((recipe) => (
        <div 
          key={recipe.idMeal} 
          className="recipe-card"
          onClick={() => onRecipeClick(recipe.idMeal)}
        >
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />
          <h3>{recipe.strMeal}</h3>
          {recipe.strCategory && <p className="category">{recipe.strCategory}</p>}
          {recipe.strArea && <p className="area">{recipe.strArea}</p>}
        </div>
      ))}
    </div>
  );
}

export default RecipeList;