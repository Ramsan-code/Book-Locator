import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("book-locator-favorites") || "[]");
    setFavorites(storedFavorites);
  }, []);

  const isFavorite = (bookId: string) => {
    return favorites.includes(bookId);
  };

  const toggleFavorite = (bookId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newFavorites = [...favorites];
    const index = newFavorites.indexOf(bookId);

    if (index === -1) {
      newFavorites.push(bookId);
      toast.success("Added to favorites");
    } else {
      newFavorites.splice(index, 1);
      toast.success("Removed from favorites");
    }

    localStorage.setItem("book-locator-favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  return { favorites, isFavorite, toggleFavorite };
}
