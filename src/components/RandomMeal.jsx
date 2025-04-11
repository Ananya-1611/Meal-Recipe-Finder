import { useState } from 'react';

function RandomMeal({ onRandomMeal }) {
  const [loading, setLoading] = useState(false);
  
  const handleRandomMeal = async () => {
    setLoading(true);
    await onRandomMeal();
    setLoading(false);
  };
  
  return (
    <button 
      className="random-button" 
      onClick={handleRandomMeal}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Surprise Me!'}
    </button>
  );
}

export default RandomMeal;