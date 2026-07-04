export const wordCategories: Record<string, string[]> = {
  animales: ['perro', 'gato', 'elefante', 'jirafa', 'mariposa', 'tortuga', 'delfin', 'aguila', 'camaleon', 'escorpion'],
  comidas: ['paella', 'tortilla', 'gazpacho', 'empanada', 'churros', 'arepa', 'ceviche', 'tamal', 'mole', 'picante'],
  paises: ['españa', 'mexico', 'argentina', 'colombia', 'peru', 'chile', 'brasil', 'portugal', 'francia', 'japon'],
  ciudades: ['madrid', 'barcelona', 'buenos', 'lima', 'santiago', 'bogota', 'quito', 'lisboa', 'roma', 'tokio'],
  naturaleza: ['montaña', 'oceano', 'bosque', 'desierto', 'volcan', 'cascada', 'selva', 'glaciar', 'sabana', 'laguna'],
};

export function getRandomWord(category: string): string {
  const words = wordCategories[category];
  if (!words) throw new Error(`Unknown category: ${category}`);
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomCategory(): string {
  const keys = Object.keys(wordCategories);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getCategoryHint(category: string): string {
  const hints: Record<string, string> = {
    animales: '🦁',
    comidas: '🍽️',
    paises: '🌍',
    ciudades: '🏙️',
    naturaleza: '🌿',
  };
  return hints[category] || '❓';
}
