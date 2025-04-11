// src/components/CategoryFilter.jsx
function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
    return (
      <div className="category-filter">
        <label>Filter by Category:</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => onSelectCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.idCategory} value={category.strCategory}>
              {category.strCategory}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  export default CategoryFilter;