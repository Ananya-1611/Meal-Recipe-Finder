import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for recipes (e.g., 'pasta', 'chicken')"
        aria-label="Search for recipes"
      />
      <button type="submit" aria-label="Search">
        <Search size={20} />
      </button>
    </form>
  );
};

export default SearchBar;