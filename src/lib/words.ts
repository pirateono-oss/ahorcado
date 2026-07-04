export type Difficulty = 'easy' | 'normal' | 'hard';

export const wordCategories: Record<string, string[]> = {
  animales: ['perro','gato','elefante','jirafa','mariposa','tortuga','delfin','aguila','camaleon','escorpion','cocodrilo','pinguino','rinoceronte','hipopotamo','ornitorrinco'],
  comidas: ['paella','tortilla','gazpacho','empanada','churros','arepa','ceviche','tamal','mole','picante','enchilada','quesadilla','chilaquiles'],
  paises: ['españa','mexico','argentina','colombia','peru','chile','brasil','portugal','francia','japon','venezuela','cuba','ecuador','uruguay'],
  profesiones: ['doctor','abogado','ingeniero','maestro','bombero','pintor','cocinero','cartero','medico','juez','piloto','escritor','musico'],
  naturaleza: ['montaña','oceano','bosque','desierto','volcan','cascada','selva','glaciar','sabana','laguna','tormenta','arrecife','manglar'],
  deportes: ['futbol','tenis','boxeo','ciclismo','natacion','baloncesto','beisbol','rugby','golf','esgrima','surf','esqui'],
};

export const difficultyConfig: Record<Difficulty, { maxWrong: number; label: string }> = {
  easy: { maxWrong: 8, label: 'Fácil' },
  normal: { maxWrong: 6, label: 'Normal' },
  hard: { maxWrong: 4, label: 'Difícil' },
};

export function getRandomWord(category: string, difficulty?: Difficulty): string {
  const words = wordCategories[category];
  if (!words) throw new Error(`Unknown category: ${category}`);

  if (!difficulty || difficulty === 'normal') {
    return words[Math.floor(Math.random() * words.length)];
  }

  // For easy mode, prefer longer words (6+ letters); for hard, prefer shorter (4-5 letters)
  const filtered = difficulty === 'easy'
    ? words.filter(w => w.length >= 6)
    : words.filter(w => w.length <= 5);

  if (filtered.length === 0) {
    // Fallback to all words if filtering leaves nothing
    return words[Math.floor(Math.random() * words.length)];
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
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
    profesiones: '👨‍⚕️',
    naturaleza: '🌿',
    deportes: '⚽',
  };
  return hints[category] || '❓';
}
