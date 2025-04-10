
const RecipeCard = ({ recipe }) => {
  return (
    <div className="recipe-card">
      <div className="recipe-image">
        <img src={recipe.strMealThumb} alt={recipe.strMeal} />
      </div>
      <div className="recipe-content">
        <h3>{recipe.strMeal}</h3>
        <div className="recipe-meta">
          <span>{recipe.strCategory}</span>
          {recipe.strArea && <span>{recipe.strArea}</span>}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;